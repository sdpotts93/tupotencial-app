# Feature: Backend — Stripe Webhooks

## Goal
Handle Stripe Checkout sessions and subscription lifecycle events via Cloudflare Worker.

## User stories
- As a user, I can complete checkout and have my subscription activated
- As the system, webhook events update subscription/entitlement state
- As the system, payments are logged with idempotency

## Endpoints
- `POST /create-checkout` — Create Stripe Checkout session
- `POST /webhook` — Handle Stripe webhook events

## Data model
- Tables: `subscriptions`, `payments`, `user_entitlements`
- Uses Supabase service role key for writes

## Event handling
- `checkout.session.completed` → create/update subscription + entitlements
- `customer.subscription.updated` → update subscription status
- `customer.subscription.deleted` → cancel subscription
- `invoice.paid` → log payment
- `invoice.payment_failed` → update subscription status to past_due

## Edge cases
- Duplicate webhook events (idempotency via stripe_event_id)
- Checkout session with existing user vs new user
- Subscription status transitions

## Done criteria
- [ ] Worker deploys to Cloudflare
- [ ] Webhook signature verification
- [ ] All event types handled
- [ ] Idempotent payment logging
- [ ] Subscription + entitlement state updates

## Tests
- [ ] Webhook signature validation
- [ ] Each event type handler
- [ ] Idempotency check
