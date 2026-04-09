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
  entitlement_id?: string | null
  entitlement_ids?: string[] | null
  expiration_at_ms?: number | null
  period_type?: string | null
  environment?: string | null
  product_id?: string | null
  presented_offering_id?: string | null
  store?: string | null
  subscriber_attributes?: Record<string, { value?: string | null; updated_at_ms?: number | null } | undefined> | null
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
      return parseJsonResponse(res, `select ${table}`) as Promise<any[]>
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
      return parseJsonResponse(res, `upsert ${table}`)
    },
    async delete(table: string, query: string) {
      const res = await fetch(`${base}/${table}?${query}`, {
        method: 'DELETE',
        headers,
      })
      await parseJsonResponse(res, `delete ${table}`)
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
    console.error('[RevenueCat webhook] Unauthorized request')
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const payload = await request.json().catch(() => null) as RevenueCatWebhookPayload | null
  const event = payload?.event
  if (!event?.id || !event.type) {
    console.error('[RevenueCat webhook] Invalid payload')
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

  const userId = await resolveUserId(event, db)
  if (!userId) {
    console.warn('[RevenueCat webhook] Could not resolve Supabase user', {
      eventId: event.id,
      appUserId: event.app_user_id ?? null,
      originalAppUserId: event.original_app_user_id ?? null,
      aliases: event.aliases ?? [],
      email: getSubscriberEmail(event),
    })
    return jsonResponse({ received: true, skipped: 'no_supabase_user_id' })
  }

  const access = computeAccess(event)
  const entitlementIds = Array.isArray(event.entitlement_ids)
    ? Array.from(new Set(event.entitlement_ids.filter((value): value is string => !!value)))
    : []
  const activeAddonEntitlementIds = entitlementIds.filter(id => id !== CORE_ENTITLEMENT_ID)

  if (shouldSyncCoreSubscription(event, entitlementIds)) {
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
  }

  await syncAddonEntitlements(
    db,
    userId,
    activeAddonEntitlementIds,
    access.areAddonEntitlementsActive,
  )

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

async function resolveUserId(event: RevenueCatWebhookEvent, db: ReturnType<typeof supabase>): Promise<string | null> {
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

  const email = getSubscriberEmail(event)
  if (email) {
    const profiles = await db.select(
      'profiles',
      `email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    )
    const profileId = profiles?.[0]?.id
    if (typeof profileId === 'string' && UUID_RE.test(profileId)) {
      console.warn('[RevenueCat webhook] Resolved user via email fallback', { email, profileId })
      return profileId
    }
  }

  return null
}

function getSubscriberEmail(event: RevenueCatWebhookEvent): string | null {
  const email = event.subscriber_attributes?.$email?.value?.trim().toLowerCase()
  return email || null
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

  const areAddonEntitlementsActive = isEventAccessActive(event.type ?? null, isExpired)
  const isActive = hasCore && areAddonEntitlementsActive
  const status = isActive
    ? event.period_type === 'TRIAL'
      ? 'trialing'
      : 'active'
    : 'canceled'

  return {
    isActive,
    areAddonEntitlementsActive,
    status,
    currentPeriodEnd: expirationAt,
  }
}

function isEventAccessActive(type: string | null, isExpired: boolean) {
  if (isExpired) return false

  switch (type) {
    case 'EXPIRATION':
    case 'REFUND':
      return false
    default:
      return true
  }
}

function shouldSyncCoreSubscription(event: RevenueCatWebhookEvent, entitlementIds: string[]) {
  if (!eventTargetsCoreSubscription(event, entitlementIds)) return false

  if (Array.isArray(event.entitlement_ids)) return true

  switch (event.type) {
    case 'EXPIRATION':
    case 'REFUND':
      return true
    default:
      return false
  }
}

function eventTargetsCoreSubscription(event: RevenueCatWebhookEvent, entitlementIds: string[]) {
  if (entitlementIds.includes(CORE_ENTITLEMENT_ID)) return true

  const candidates = [
    event.entitlement_id,
    event.product_id,
    event.presented_offering_id,
  ]

  return candidates.some(value => value?.toLowerCase().includes(CORE_ENTITLEMENT_ID))
}

async function syncAddonEntitlements(
  db: ReturnType<typeof supabase>,
  userId: string,
  entitlementIds: string[],
  areEntitlementsActive: boolean,
) {
  const knownAddonEntitlements = await db.select(
    'addon_entitlements',
    'select=addon_id,entitlement_key',
  ) as Array<{ addon_id: string; entitlement_key: string }>

  if (!knownAddonEntitlements.length) return

  const addonEntitlementKeys = new Set(knownAddonEntitlements.map(row => row.entitlement_key))
  const relevantEntitlementIds = Array.from(new Set(entitlementIds.filter(id => addonEntitlementKeys.has(id))))

  // RevenueCat webhook events are incremental, not guaranteed full snapshots.
  // Only mutate addon access when the event explicitly references addon keys.
  if (!relevantEntitlementIds.length) return

  const addons = await db.select(
    'addons',
    'select=id,price,grants_core_months',
  ) as Array<{ id: string; price: number | null; grants_core_months: number | null }>
  const addonMetaById = new Map(addons.map(addon => [addon.id, {
    price: addon.price ?? 0,
    grantsCoreMonths: addon.grants_core_months ?? 0,
  }]))

  const existingCoreGrants = await db.select(
    'subscription_access_grants',
    `user_id=eq.${userId}&source=eq.addon&select=source_ref,starts_at,ends_at`,
  ) as Array<{ source_ref: string; starts_at: string; ends_at: string }>
  const addonCoreGrantsByAddonId = new Map(
    existingCoreGrants.map(grant => [grant.source_ref, grant]),
  )

  const activeSubscriptions = await db.select(
    'subscriptions',
    `user_id=eq.${userId}&status=in.(active,trialing)&select=current_period_end&order=current_period_end.desc&limit=1`,
  ) as Array<{ current_period_end: string | null }>

  let latestCoreAccessEnd = getLatestCoreAccessEnd(
    activeSubscriptions[0]?.current_period_end ?? null,
    existingCoreGrants.map(grant => grant.ends_at),
  )

  const addonEntitlementsByKey = new Map<string, string[]>()
  for (const row of knownAddonEntitlements) {
    const rows = addonEntitlementsByKey.get(row.entitlement_key) ?? []
    rows.push(row.addon_id)
    addonEntitlementsByKey.set(row.entitlement_key, rows)
  }

  const addonIdsToActivate = new Set<string>()
  for (const entitlementId of relevantEntitlementIds) {
    for (const addonId of addonEntitlementsByKey.get(entitlementId) ?? []) {
      addonIdsToActivate.add(addonId)
    }
  }

  const relevantEntitlementIdSet = new Set(relevantEntitlementIds)
  const processedPurchaseAddonIds = new Set<string>()
  const processedGrantAddonIds = new Set<string>()
  for (const row of knownAddonEntitlements) {
    if (!relevantEntitlementIdSet.has(row.entitlement_key)) continue

    const shouldBeActive = areEntitlementsActive && addonIdsToActivate.has(row.addon_id)
    const addonMeta = addonMetaById.get(row.addon_id)

    if (shouldBeActive) {
      await db.upsert('user_entitlements', {
        user_id: userId,
        entitlement_key: row.entitlement_key,
        source: 'addon',
        source_ref: row.addon_id,
      }, 'user_id,entitlement_key')

      if (!processedPurchaseAddonIds.has(row.addon_id)) {
        await db.upsert('addon_purchases', {
          user_id: userId,
          addon_id: row.addon_id,
          stripe_session_id: null,
          amount: addonMeta?.price ?? 0,
        }, 'user_id,addon_id')
        processedPurchaseAddonIds.add(row.addon_id)
      }

      if ((addonMeta?.grantsCoreMonths ?? 0) > 0 && !processedGrantAddonIds.has(row.addon_id)) {
        const existingGrant = addonCoreGrantsByAddonId.get(row.addon_id)
        const startsAt = maxIsoTimestamp(
          new Date().toISOString(),
          latestCoreAccessEnd,
          existingGrant?.ends_at ?? null,
        )
        const endsAt = addMonthsIso(startsAt, addonMeta!.grantsCoreMonths)

        await db.upsert('subscription_access_grants', {
          user_id: userId,
          source: 'addon',
          source_ref: row.addon_id,
          starts_at: startsAt,
          ends_at: endsAt,
        }, 'user_id,source,source_ref')

        addonCoreGrantsByAddonId.set(row.addon_id, {
          source_ref: row.addon_id,
          starts_at: startsAt,
          ends_at: endsAt,
        })
        latestCoreAccessEnd = maxIsoTimestamp(latestCoreAccessEnd, endsAt)
        processedGrantAddonIds.add(row.addon_id)
      }

      continue
    }

    await db.delete(
      'user_entitlements',
      `user_id=eq.${userId}&entitlement_key=eq.${encodeURIComponent(row.entitlement_key)}&source=eq.addon`,
    )

    await db.delete(
      'subscription_access_grants',
      `user_id=eq.${userId}&source=eq.addon&source_ref=eq.${encodeURIComponent(row.addon_id)}`,
    )
  }
}

function addMonthsIso(startsAt: string, months: number) {
  const value = new Date(startsAt)
  value.setUTCMonth(value.getUTCMonth() + months)
  return value.toISOString()
}

function getLatestCoreAccessEnd(subscriptionEnd: string | null, grantEndsAt: string[]) {
  return grantEndsAt.reduce<string | null>(
    (latest, candidate) => maxIsoTimestamp(latest, candidate),
    subscriptionEnd,
  )
}

function maxIsoTimestamp(...values: Array<string | null | undefined>) {
  let latest: string | null = null

  for (const value of values) {
    if (!value) continue
    if (!latest || new Date(value).getTime() > new Date(latest).getTime()) {
      latest = value
    }
  }

  return latest ?? new Date().toISOString()
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

async function parseJsonResponse(res: Response, context: string) {
  const text = await res.text()
  const payload = text ? safeJsonParse(text) : null

  if (!res.ok) {
    console.error(`[RevenueCat webhook] Supabase ${context} failed`, {
      status: res.status,
      payload,
      text,
    })
    throw new Error(`Supabase ${context} failed with status ${res.status}`)
  }

  return payload
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
