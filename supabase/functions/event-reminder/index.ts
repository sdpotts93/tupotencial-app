// Supabase Edge Function: event-reminder
// Sends push notifications to registered users 5 minutes before an event starts.
//
// Invoked by: pg_cron every minute via pg_net.
// Auth: Expects the service role key in the Authorization header (no user auth).
//
// Required env vars (auto-injected by Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   FCM_PROJECT_ID, FCM_SERVICE_ACCOUNT_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

  const encoder = new TextEncoder()
  const signingInput = encoder.encode(`${header}.${payload}`)

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

  const headerB64 = header.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const payloadB64 = payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const jwt = `${headerB64}.${payloadB64}.${sig}`

  const tokenRes = await fetch(serviceAccountKey.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const fcmProjectId = Deno.env.get('FCM_PROJECT_ID')
    const fcmServiceAccountKeyStr = Deno.env.get('FCM_SERVICE_ACCOUNT_KEY')

    // Verify caller is using the service role key
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!fcmProjectId || !fcmServiceAccountKeyStr) {
      return new Response(JSON.stringify({ error: 'FCM not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Find events starting between now and 6 minutes from now (covers the 5-min window
    // with 1-min buffer for cron interval) that have registered users without a reminder.
    const nowISO = new Date().toISOString()
    const sixMinLater = new Date(Date.now() + 6 * 60 * 1000).toISOString()

    const { data: rows, error: queryErr } = await supabase
      .from('event_registrations')
      .select(`
        id,
        user_id,
        events!inner ( id, title, start_at )
      `)
      .eq('status', 'registered')
      .is('reminder_sent_at', null)
      .gte('events.start_at', nowISO)
      .lte('events.start_at', sixMinLater)

    if (queryErr) {
      console.error('Query error:', queryErr)
      return new Response(JSON.stringify({ error: queryErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!rows?.length) {
      return new Response(JSON.stringify({ sent: 0, message: 'No reminders to send' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Collect unique user IDs and build event title lookup
    const userIds = [...new Set(rows.map((r) => r.user_id))]
    const registrationIds = rows.map((r) => r.id)

    // Build a map of user_id → event title for notification body
    const userEventMap = new Map<string, string>()
    for (const row of rows) {
      const event = row.events as unknown as { id: string; title: string; start_at: string }
      userEventMap.set(row.user_id, event.title)
    }

    // Fetch push tokens for these users
    const { data: tokens, error: tokensErr } = await supabase
      .from('push_tokens')
      .select('user_id, token, platform')
      .in('user_id', userIds)

    if (tokensErr || !tokens?.length) {
      // Mark reminders as sent even if no tokens, to avoid retrying
      await supabase
        .from('event_registrations')
        .update({ reminder_sent_at: nowISO })
        .in('id', registrationIds)

      return new Response(
        JSON.stringify({ sent: 0, message: tokensErr?.message ?? 'No push tokens' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Get FCM access token
    const fcmServiceAccountKey = JSON.parse(fcmServiceAccountKeyStr)
    const accessToken = await getFcmAccessToken(fcmServiceAccountKey)
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`

    let sent = 0
    let failed = 0

    const sendPromises = tokens.map(async ({ user_id, token: deviceToken, platform }) => {
      const eventTitle = userEventMap.get(user_id) ?? 'Tu evento'

      const message: Record<string, unknown> = {
        token: deviceToken,
        notification: {
          title: '¡Tu evento empieza pronto!',
          body: `${eventTitle} comienza en 5 minutos.`,
        },
        data: { type: 'event_reminder' },
      }

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

        if (res.status === 404 || res.status === 400) {
          await supabase.from('push_tokens').delete().eq('token', deviceToken)
        }
      }
    })

    await Promise.all(sendPromises)

    // Mark reminders as sent
    await supabase
      .from('event_registrations')
      .update({ reminder_sent_at: nowISO })
      .in('id', registrationIds)

    return new Response(JSON.stringify({ sent, failed, total: tokens.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('event-reminder error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
