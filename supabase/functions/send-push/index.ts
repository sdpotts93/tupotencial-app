// Supabase Edge Function: send-push
// Sends push notifications via FCM HTTP v1 API.
// FCM handles delivery to both Android (FCM) and iOS (APNs).
//
// Invoked by: admin actions, daily-plan cron, or other server-side triggers.
//
// Expected body:
//   { user_ids: string[], title: string, body: string, data?: Record<string, string> }
// OR for broadcast:
//   { broadcast: true, title: string, body: string, data?: Record<string, string> }
//
// Required env vars (set in Supabase dashboard):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
//   FCM_PROJECT_ID — Firebase project ID
//   FCM_SERVICE_ACCOUNT_KEY — JSON string of Firebase service account key

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushPayload {
  user_ids?: string[]
  broadcast?: boolean
  title: string
  body: string
  data?: Record<string, string>
}

/**
 * Get a short-lived OAuth2 access token for FCM using the service account key.
 */
async function getFcmAccessToken(serviceAccountKey: {
  client_email: string
  private_key: string
  token_uri: string
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      iss: serviceAccountKey.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: serviceAccountKey.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  )

  // Sign the JWT with the private key
  const encoder = new TextEncoder()
  const signingInput = encoder.encode(`${header}.${payload}`)

  // Import the RSA private key
  const pemBody = serviceAccountKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '')
  const keyBuffer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, signingInput)
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  // Also base64url-encode header and payload
  const headerB64 = header.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const payloadB64 = payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const jwt = `${headerB64}.${payloadB64}.${sig}`

  // Exchange JWT for access token
  const tokenRes = await fetch(serviceAccountKey.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify the request is authorized (admin or service role)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const fcmProjectId = Deno.env.get('FCM_PROJECT_ID')
    const fcmServiceAccountKeyStr = Deno.env.get('FCM_SERVICE_ACCOUNT_KEY')

    if (!fcmProjectId || !fcmServiceAccountKeyStr) {
      return new Response(JSON.stringify({ error: 'FCM not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify caller is admin
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey)
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check admin role
    const { data: adminRow } = await supabaseClient
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRow) {
      return new Response(JSON.stringify({ error: 'Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload: PushPayload = await req.json()
    const { title, body: notifBody, data } = payload

    if (!title || !notifBody) {
      return new Response(JSON.stringify({ error: 'title and body required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch target tokens
    let query = supabaseClient.from('push_tokens').select('token, platform')

    if (!payload.broadcast && payload.user_ids?.length) {
      query = query.in('user_id', payload.user_ids)
    }

    const { data: tokens, error: tokensError } = await query

    if (tokensError || !tokens?.length) {
      return new Response(
        JSON.stringify({ sent: 0, error: tokensError?.message ?? 'No tokens found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Get FCM access token
    const fcmServiceAccountKey = JSON.parse(fcmServiceAccountKeyStr)
    const accessToken = await getFcmAccessToken(fcmServiceAccountKey)

    // Send to each device
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`
    let sent = 0
    let failed = 0

    const sendPromises = tokens.map(async ({ token: deviceToken, platform }) => {
      const message: Record<string, unknown> = {
        token: deviceToken,
        notification: { title, body: notifBody },
        data: data ?? {},
      }

      // Platform-specific configuration
      if (platform === 'android') {
        message.android = {
          priority: 'high',
          notification: { channel_id: 'default' },
        }
      } else if (platform === 'ios') {
        message.apns = {
          payload: { aps: { sound: 'default', badge: 1 } },
        }
      }

      const res = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (res.ok) {
        sent++
      } else {
        failed++
        const errBody = await res.text()
        console.error(`FCM send failed for ${platform} token:`, errBody)

        // If token is invalid, clean it up
        if (res.status === 404 || res.status === 400) {
          await supabaseClient.from('push_tokens').delete().eq('token', deviceToken)
        }
      }
    })

    await Promise.all(sendPromises)

    return new Response(JSON.stringify({ sent, failed, total: tokens.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-push error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
