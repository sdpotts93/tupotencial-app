# Feature: Mobile — Add-ons / VIP

## Goal
Browse and purchase add-on experiences and premium content (web purchase only).

## User stories
- As a user, I can browse the add-ons catalog
- As a web user, I can purchase add-ons via Stripe Checkout
- As a native user, I see entitlement status (no purchase CTA)
- As an entitled user, I can access unlocked content

## Screens (routes)
- `/addons` — Add-ons list
- `/addons/[id]` — Add-on detail (web: purchase CTA; native: status)
- `/billing/return` — Stripe checkout return handler (web-only)
- `/vip` — Entitlement-gated content

## Data model
- Tables: `addons`, `addon_entitlements`, `user_entitlements`

## RLS rules
- addons: anon read active
- user_entitlements: user read own

## Done criteria
- [ ] Addons list shows catalog
- [ ] Web purchase CTA starts Stripe Checkout
- [ ] Native shows entitlement status only
- [ ] Billing return handles success/failure
- [ ] VIP route gated by entitlement

## Tests
- [ ] Platform detection (web vs native)
- [ ] Entitlement check
- [ ] Billing return status flow
