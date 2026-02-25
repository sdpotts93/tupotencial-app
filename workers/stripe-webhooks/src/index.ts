/**
 * Tu Potencial — Stripe Webhooks Worker
 * Handles Stripe Checkout + subscription lifecycle events
 *
 * Required secrets:
 *   - STRIPE_SECRET_KEY
 *   - STRIPE_WEBHOOK_SECRET
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * Required vars:
 *   - SUPABASE_URL
 */

export interface Env {
  SUPABASE_URL: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  SUPABASE_SERVICE_ROLE_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const url = new URL(request.url)

    // Checkout session creation endpoint
    if (url.pathname === '/create-checkout') {
      return handleCreateCheckout(request, env)
    }

    // Webhook endpoint
    if (url.pathname === '/webhook') {
      return handleWebhook(request, env)
    }

    return new Response('Not Found', { status: 404 })
  },
}

async function handleCreateCheckout(_request: Request, _env: Env): Promise<Response> {
  // TODO: Implement Stripe Checkout session creation
  // 1. Validate auth (check Supabase JWT)
  // 2. Create Stripe Checkout session with user_id in metadata
  // 3. Return session URL
  return new Response(JSON.stringify({ error: 'Not implemented (MVP stub)' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function handleWebhook(request: Request, _env: Env): Promise<Response> {
  // TODO: Implement Stripe webhook handling
  // 1. Verify webhook signature
  // 2. Handle event types:
  //    - checkout.session.completed → create/update subscription + entitlements
  //    - customer.subscription.updated → update subscription status
  //    - customer.subscription.deleted → cancel subscription
  //    - invoice.paid → log payment
  //    - invoice.payment_failed → update subscription status
  // 3. Idempotency: check stripe_event_id in payments table
  // 4. Use Supabase service role for writes

  const body = await request.text()

  // Stub: acknowledge receipt
  console.log('Webhook received:', body.substring(0, 100))

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
