/**
 * Tu Potencial — Stripe Webhooks Worker
 * Handles Stripe Checkout + subscription lifecycle events
 *
 * Required secrets (set via `wrangler secret put`):
 *   - STRIPE_SECRET_KEY
 *   - STRIPE_WEBHOOK_SECRET
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * Required vars:
 *   - SUPABASE_URL
 */

import Stripe from 'stripe'

export interface Env {
  SUPABASE_URL: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  SUPABASE_SERVICE_ROLE_KEY: string
}

// ── Supabase REST helper ────────────────────────────────────────────────────

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
    async insert(table: string, body: Record<string, any>) {
      const res = await fetch(`${base}/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      return res.json()
    },
    async update(table: string, query: string, body: Record<string, any>) {
      const res = await fetch(`${base}/${table}?${query}`, {
        method: 'PATCH',
        headers,
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

// ── Worker entry ────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    if (url.pathname === '/create-checkout') {
      return handleCreateCheckout(request, env)
    }

    if (url.pathname === '/webhook') {
      return handleWebhook(request, env)
    }

    return new Response('Not Found', { status: 404 })
  },
}

// ── Checkout session creation ───────────────────────────────────────────────

const CORE_PRICE_ID = 'price_1T9zanA2z8ah71Y7yVvdFlJl'

async function handleCreateCheckout(request: Request, env: Env): Promise<Response> {
  try {
    // 1. Extract user from Supabase JWT
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'No autenticado' }, 401)
    }

    const token = authHeader.slice(7)
    // Verify JWT via Supabase Auth
    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
    })
    if (!userRes.ok) return jsonResponse({ error: 'Token inválido' }, 401)

    const user = (await userRes.json()) as { id: string; email: string }

    // 2. Check if user already has a Stripe customer ID
    const db = supabase(env)
    const subs = await db.select('subscriptions', `user_id=eq.${user.id}&select=stripe_customer_id`)
    let customerId = subs?.[0]?.stripe_customer_id

    // 3. Create Stripe customer if needed
    const stripe = new Stripe(env.STRIPE_SECRET_KEY)

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    // 4. Parse request body for optional return URL
    const body = (await request.json().catch(() => ({}))) as { returnUrl?: string }
    const returnUrl = body.returnUrl || 'https://app.tupotencial.com/cuenta/perfil'

    // 5. Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: CORE_PRICE_ID, quantity: 1 }],
      success_url: `${returnUrl}?checkout=success`,
      cancel_url: `${returnUrl}?checkout=canceled`,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    })

    return jsonResponse({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return jsonResponse({ error: err.message || 'Error creating checkout' }, 500)
  }
}

// ── Webhook handling ────────────────────────────────────────────────────────

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return jsonResponse({ error: 'Missing signature' }, 400)

  // 1. Verify webhook signature
  const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return jsonResponse({ error: 'Invalid signature' }, 400)
  }

  const db = supabase(env)

  // 2. Idempotency check — skip if we already processed this event
  const existing = await db.select('payments', `stripe_event_id=eq.${event.id}&select=id`)
  if (existing?.length > 0) {
    return jsonResponse({ received: true, skipped: 'already processed' })
  }

  // 3. Handle event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, db, stripe, event.id)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, db, event.id)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, db, event.id)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, db, event.id)
        break

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object as Stripe.Invoice, db, event.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err: any) {
    console.error(`Error handling ${event.type}:`, err)
    return jsonResponse({ error: err.message }, 500)
  }

  return jsonResponse({ received: true })
}

// ── Event handlers ──────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  db: ReturnType<typeof supabase>,
  stripe: Stripe,
  eventId: string,
) {
  const userId = session.metadata?.supabase_user_id
  if (!userId) return

  const subscriptionId = session.subscription as string
  if (!subscriptionId) return

  // Fetch full subscription to get period info
  const sub = await stripe.subscriptions.retrieve(subscriptionId)

  // Upsert subscription
  await db.upsert('subscriptions', {
    user_id: userId,
    status: mapStatus(sub.status),
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }, 'user_id')

  // Grant core entitlements
  await db.upsert('user_entitlements', {
    user_id: userId,
    entitlement_key: 'core',
    source: 'subscription',
    source_ref: subscriptionId,
  }, 'user_id,entitlement_key')

  // Log payment
  await db.insert('payments', {
    user_id: userId,
    stripe_event_id: eventId,
    stripe_object_id: session.id,
    type: 'checkout_completed',
    amount: session.amount_total,
    currency: session.currency,
    meta: JSON.stringify({ subscription_id: subscriptionId }),
  })
}

async function handleSubscriptionUpdated(
  sub: Stripe.Subscription,
  db: ReturnType<typeof supabase>,
  eventId: string,
) {
  const userId = sub.metadata?.supabase_user_id
  if (!userId) return

  const status = mapStatus(sub.status)

  await db.update('subscriptions', `user_id=eq.${userId}`, {
    status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Remove entitlement if no longer active
  if (status === 'canceled' || status === 'incomplete') {
    await removeEntitlement(db, userId)
  }

  await db.insert('payments', {
    user_id: userId,
    stripe_event_id: eventId,
    stripe_object_id: sub.id,
    type: 'subscription_updated',
    meta: JSON.stringify({ status: sub.status }),
  })
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription,
  db: ReturnType<typeof supabase>,
  eventId: string,
) {
  const userId = sub.metadata?.supabase_user_id
  if (!userId) return

  await db.update('subscriptions', `user_id=eq.${userId}`, {
    status: 'canceled',
    updated_at: new Date().toISOString(),
  })

  await removeEntitlement(db, userId)

  await db.insert('payments', {
    user_id: userId,
    stripe_event_id: eventId,
    stripe_object_id: sub.id,
    type: 'subscription_updated',
    meta: JSON.stringify({ status: 'canceled' }),
  })
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  db: ReturnType<typeof supabase>,
  eventId: string,
) {
  const userId = invoice.subscription_details?.metadata?.supabase_user_id
  if (!userId) return

  await db.insert('payments', {
    user_id: userId,
    stripe_event_id: eventId,
    stripe_object_id: invoice.id,
    type: 'invoice_paid',
    amount: invoice.amount_paid,
    currency: invoice.currency,
    meta: JSON.stringify({ subscription_id: invoice.subscription }),
  })
}

async function handleInvoiceFailed(
  invoice: Stripe.Invoice,
  db: ReturnType<typeof supabase>,
  eventId: string,
) {
  const userId = invoice.subscription_details?.metadata?.supabase_user_id
  if (!userId) return

  // Mark subscription as past_due
  await db.update('subscriptions', `user_id=eq.${userId}`, {
    status: 'past_due',
    updated_at: new Date().toISOString(),
  })

  await db.insert('payments', {
    user_id: userId,
    stripe_event_id: eventId,
    stripe_object_id: invoice.id,
    type: 'invoice_failed',
    amount: invoice.amount_due,
    currency: invoice.currency,
    meta: JSON.stringify({ subscription_id: invoice.subscription }),
  })
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function removeEntitlement(db: ReturnType<typeof supabase>, userId: string) {
  await db.delete('user_entitlements', `user_id=eq.${userId}&entitlement_key=eq.core&source=eq.subscription`)
}

function mapStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    unpaid: 'past_due',
    paused: 'canceled',
  }
  return map[stripeStatus] ?? 'incomplete'
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
