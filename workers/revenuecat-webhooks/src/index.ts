/**
 * Tu Potencial — RevenueCat Webhooks Worker
 * Handles RevenueCat subscription lifecycle events and mirrors access into Supabase.
 *
 * Required secrets (set via `wrangler secret put`):
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - REVENUECAT_WEBHOOK_AUTH
 *
 * Required vars:
 *   - SUPABASE_URL
 */

const CORE_ENTITLEMENT_ID = 'core'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  REVENUECAT_WEBHOOK_AUTH: string
}

interface RevenueCatWebhookEvent {
  id?: string
  type?: string
  app_user_id?: string
  original_app_user_id?: string | null
  aliases?: string[] | null
  entitlement_ids?: string[] | null
  expiration_at_ms?: number | null
  period_type?: string | null
  environment?: string | null
  store?: string | null
  transferred_from?: string[] | null
  transferred_to?: string[] | null
}

interface RevenueCatWebhookPayload {
  api_version?: string
  event?: RevenueCatWebhookEvent
}

function supabase(env: Env) {
  const base = `${env.SUPABASE_URL}/rest/v1`
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }

  return {
    async select(table: string, query: string) {
      const res = await fetch(`${base}/${table}?${query}`, { headers })
      return res.json() as Promise<any[]>
    },
    async upsert(table: string, body: Record<string, any>, onConflict?: string) {
      const prefer = onConflict
        ? 'return=representation,resolution=merge-duplicates'
        : 'return=representation'
      const url = onConflict ? `${base}/${table}?on_conflict=${onConflict}` : `${base}/${table}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...headers, Prefer: prefer },
        body: JSON.stringify(body),
      })
      return res.json()
    },
    async delete(table: string, query: string) {
      await fetch(`${base}/${table}?${query}`, {
        method: 'DELETE',
        headers,
      })
    },
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      })
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse({ ok: true })
    }

    if (request.method === 'POST' && url.pathname === '/webhook') {
      return handleWebhook(request, env)
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders() })
  },
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (request.headers.get('authorization') !== env.REVENUECAT_WEBHOOK_AUTH) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const payload = await request.json().catch(() => null) as RevenueCatWebhookPayload | null
  const event = payload?.event
  if (!event?.id || !event.type) {
    return jsonResponse({ error: 'Invalid payload' }, 400)
  }

  const db = supabase(env)
  const existing = await db.select(
    'revenuecat_webhook_events',
    `id=eq.${encodeURIComponent(event.id)}&select=id`,
  )

  if (existing?.length) {
    return jsonResponse({ received: true, skipped: 'already processed' })
  }

  const userId = resolveUserId(event)
  if (!userId) {
    return jsonResponse({ received: true, skipped: 'no_supabase_user_id' })
  }

  const access = computeAccess(event)

  await db.upsert('subscriptions', {
    user_id: userId,
    status: access.status,
    current_period_end: access.currentPeriodEnd,
    updated_at: new Date().toISOString(),
  }, 'user_id')

  if (access.isActive) {
    await db.upsert('user_entitlements', {
      user_id: userId,
      entitlement_key: CORE_ENTITLEMENT_ID,
      source: 'subscription',
      source_ref: `revenuecat:${event.id}`,
    }, 'user_id,entitlement_key')
  } else {
    await db.delete(
      'user_entitlements',
      `user_id=eq.${userId}&entitlement_key=eq.${CORE_ENTITLEMENT_ID}&source=eq.subscription`,
    )
  }

  await db.upsert('revenuecat_webhook_events', {
    id: event.id,
    app_user_id: event.app_user_id ?? null,
    event_type: event.type,
    environment: event.environment ?? null,
    store: event.store ?? null,
    payload,
  }, 'id')

  return jsonResponse({ received: true })
}

function resolveUserId(event: RevenueCatWebhookEvent): string | null {
  const candidates = [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
    ...(event.transferred_to ?? []),
    ...(event.transferred_from ?? []),
  ]

  for (const candidate of candidates) {
    if (candidate && UUID_RE.test(candidate)) {
      return candidate
    }
  }

  return null
}

function computeAccess(event: RevenueCatWebhookEvent) {
  const entitlementIds = Array.isArray(event.entitlement_ids) ? event.entitlement_ids : []
  const hasCore = entitlementIds.includes(CORE_ENTITLEMENT_ID)
  const expirationAt = typeof event.expiration_at_ms === 'number'
    ? new Date(event.expiration_at_ms).toISOString()
    : null
  const isExpired = typeof event.expiration_at_ms === 'number'
    ? event.expiration_at_ms <= Date.now()
    : false

  const isActive = hasCore && !isExpired
  const status = isActive
    ? event.period_type === 'TRIAL'
      ? 'trialing'
      : 'active'
    : 'canceled'

  return {
    isActive,
    status,
    currentPeriodEnd: expirationAt,
  }
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
