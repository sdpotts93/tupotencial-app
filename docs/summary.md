# Summary Log

Append one line per completed task:

`YYYY-MM-DD HH:mm America/Mexico_City — <short task description>`

---

## Entries
2026-02-23 22:53 America/Mexico_City — Update AGENTS payments policy: web-only Stripe checkout (subscriptions + add-ons) and customer web signup/billing guidance
2026-02-23 22:57 America/Mexico_City — Add product definition + UX principles + required route transitions/animations to AGENTS.md
2026-02-23 23:09 America/Mexico_City — Incorporate product catalog tiering (free/Core/add-ons) into AGENTS.md and update gating/routes (community subscriber-only; add /pricing web-only)
2026-02-23 23:22 America/Mexico_City — Clarify Mexico storefront external payment constraints (no in-app web checkout/links; consumption-only mobile + web Stripe checkout)
2026-02-23 23:28 America/Mexico_City — Translate remaining Spanish text in AGENTS.md to English for consistency
2026-02-23 23:31 America/Mexico_City — Specify Spanish (Mexico) as the primary app language/locale in AGENTS.md
2026-02-24 00:26 America/Mexico_City — AGENTS: specify Remember me default + native biometric (Face ID) sign-in behavior for /auth/login
2026-02-24 00:33 America/Mexico_City — AGENTS: allow multi-image screen flows in docs/visual naming ({screen}-{number}.{ext})
2026-02-24 00:34 America/Mexico_City — AGENTS: update monorepo layout docs/visual comment to include {screen}-{number}.{ext} flows
2026-02-24 00:48 America/Mexico_City — AGENTS: document per-app local fonts under public/fonts and Nuxt Fonts note
2026-02-24 00:49 America/Mexico_City — AGENTS: clarify fonts path for current repo (public/fonts) vs per-app public/fonts in monorepo
2026-02-24 00:49 America/Mexico_City — AGENTS: document logo asset folders under public/ and require color-indicated filenames
2026-02-24 00:50 America/Mexico_City — AGENTS: clarify repo evolution (OK to restructure/reorder into 2-app monorepo)
2026-02-24 01:00 America/Mexico_City — AGENTS: add customer web post-payment onboarding flow (emails, /billing/return, next-steps guidance)
2026-02-24 01:05 America/Mexico_City — AGENTS: expand AI Coach (AI Home + AI Chat) screen details (UI, quotas, safety, analytics)
2026-02-24 01:06 America/Mexico_City — AGENTS: clarify docs/visual coverage and 'Inspiration:' references are style-only
2026-02-24 01:08 America/Mexico_City — AGENTS: add explicit mandatory note to respect shared global style/tokens across apps
2026-02-24 01:16 America/Mexico_City — AGENTS: add inspiration image naming with -n{number} suffix for multiple references
2026-02-24 01:18 America/Mexico_City — AGENTS: if no visual reference, derive UI patterns from referenced screens for consistency
2026-02-24 01:43 America/Mexico_City — AGENTS: note Mobbin footer/watermark in inspiration screenshots is not part of design
2026-02-24 01:55 America/Mexico_City — AGENTS: clarify some referenced 'screens' are bottom-sheet slideovers/modals (route-based modals allowed)
2026-02-24 01:56 America/Mexico_City — AGENTS: clarify badges belong to /hoy (badge preview/share surfaced from Today)
2026-02-24 01:58 America/Mexico_City — AGENTS: require BEM-style CSS class naming
2026-02-24 02:00 America/Mexico_City — AGENTS: make badges a /hoy section (no /badge routes)
2026-02-24 02:07 America/Mexico_City — AGENTS: allow docs/visual subfolders (e.g. adidas) for web inspiration; must adapt to Tu Potencial branding/tokens
2026-02-24 13:28 America/Mexico_City — Align mobile chrome behavior and redesign /settings screen to match visual reference with production-ready structure
2026-02-24 13:34 America/Mexico_City — Refactor /auth/login to hero+slideover flow with logo and move default mobile spacing from layout to page-level
2026-02-24 13:55 America/Mexico_City — Switch mobile/admin to Nuxt Fonts (@nuxt/fonts) with local brand families and remove manual @font-face from shared tokens
2026-02-24 13:59 America/Mexico_City — Update Nuxt Fonts config to local-provider family declarations (global/preload/display/weights/styles) and normalize local font filenames for scanner-based resolution
2026-02-24 14:18 America/Mexico_City — Standardize mobile/admin design system usage: semantic typography weights/sizes, spacing/border tokens, and refactor shared/page styles to remove hardcoded values
2026-02-24 14:20 America/Mexico_City — Replace non-palette mobile background colors (login + shared surfaces/gradients) with palette-only token mixes
2026-02-24 14:22 America/Mexico_City — Standardize button variant/state colors via tokens and make auth slideover Continue CTA high-contrast on light background
2026-02-24 14:24 America/Mexico_City — Enable global mobile review mode (default on) to bypass auth/subscription route guards and allow direct access to all screens
2026-02-24 14:30 America/Mexico_City — Add mobile Supabase data layer scaffold with /api/mobile/data JSON response (mock-first, optional Supabase overlay) and wire screens via useMobileMocks fetch path
2026-02-24 15:00 America/Mexico_City — Full monorepo rebuild: npm workspaces (apps/mobile, apps/admin, packages/shared, supabase, workers)
2026-02-24 15:05 America/Mexico_City — CSS design tokens (tokens.css + fonts.css + global.css + transitions.css) with full palette, typography, spacing
2026-02-24 15:10 America/Mexico_City — 17 reusable UI components (UiButton thru UiDataTable) with BEM naming and CSS variables
2026-02-24 15:15 America/Mexico_City — Shared types (25 DB interfaces), constants (19 enums), utils (formatDate/formatCurrency es-MX)
2026-02-24 15:20 America/Mexico_City — Mock data layer (11 modules, all Spanish, Supabase-shaped, 4 auth states)
2026-02-24 15:25 America/Mexico_City — Supabase init migration (28 tables, 90 RLS policies, 16 indexes, 11 updated_at triggers)
2026-02-24 15:30 America/Mexico_City — Mobile auth screens (login hero+slideover, register, profile-setup, segment selection)
2026-02-24 15:35 America/Mexico_City — Mobile main screens (Hoy+checkin+progress, Library+search+categories, Retos+detail+day+checkin)
2026-02-24 15:40 America/Mexico_City — Mobile remaining screens (Community+comments, Events+watch, Benefits+detail, Addons+detail, AI Coach+chat, Profile, Settings)
2026-02-24 15:45 America/Mexico_City — Web-only screens (pricing, billing/return, VIP) + route protection middleware (global auth guard)
2026-02-24 15:50 America/Mexico_City — Stripe webhooks Cloudflare Worker stub (checkout+webhook endpoints)
2026-02-24 15:55 America/Mexico_City — Admin app (login, dashboard, 25+ CRUD screens with sidebar navigation)
2026-02-24 16:00 America/Mexico_City — Feature spec files created for all MVP features
2026-03-11 20:42 America/Mexico_City — Corrige alias de importación en API de AI del app mobile
2026-03-20 20:00 America/Mexico_City — Add custom useConfirm() composable + UiConfirmModal with bottom-sheet (mobile) / centered (desktop) pattern
2026-03-20 20:30 America/Mexico_City — Add :loading prop to all async action buttons across 14 admin pages (saving/deleting refs + try/finally)
2026-03-20 21:00 America/Mexico_City — Replace all datetime-local inputs with UiDatePicker component (contenido new/edit)
2026-03-20 21:30 America/Mexico_City — Full CRUD E2E test via Playwright: all admin sections + mobile actions passing
2026-03-20 22:00 America/Mexico_City — Fix UTC date bug: toISOString().split('T')[0] → local date for daily plan queries (4 files)
2026-03-20 23:00 America/Mexico_City — Full E2E smoke test: all 15 admin pages + 8 mobile views rendering with 0 errors
2026-03-20 23:30 America/Mexico_City — MVP gap analysis vs AGENTS.md: documented roadmap in PENDING.md (phases 1–5)
2026-03-20 23:45 America/Mexico_City — Fix admin roles empty table: add { server: false } to useAsyncData for admin_users query
2026-03-20 23:50 America/Mexico_City — Build admin user detail page /admin/usuarios/[id] (profile, subscription, entitlements, streaks, check-ins, enrollments, addons, community)
2026-03-20 23:55 America/Mexico_City — Role-based authorization: canEdit/canManageRoles in useAdminAuth, route guards in middleware, UI guards on action buttons
2026-03-21 00:00 America/Mexico_City — Database-level library search: Postgres full-text search (Spanish tsvector + GIN index + search_content RPC + debounced frontend)
2026-03-21 00:10 America/Mexico_City — Wire addon purchase flow: /create-addon-checkout worker endpoint + webhook handler for addon_purchases + entitlements + Comprar button
2026-03-21 00:15 America/Mexico_City — Stripe customer portal: /create-portal-session worker endpoint + "Gestionar suscripción" link on /cuenta/mas
2026-04-08 22:20 America/Mexico_City — Replace Stripe subscription worker with RevenueCat webhook sync, add webhook event migration, and switch web subscription purchase flow to RevenueCat
2026-04-08 18:31 America/Mexico_City — Fix mobile auth/onboarding race after logout, harden Hoy empty-state handling, and guard character avatar fallback
2026-04-08 18:31 America/Mexico_City — Add mobile empty states for biblioteca, retos, comunidad, complementos, and hide empty recorded-events section
2026-04-08 18:31 America/Mexico_City — Update mobile eventos empty states to use shared UiEmptyState styling
2026-04-08 18:31 America/Mexico_City — Update mobile beneficios empty state to use shared UiEmptyState styling
2026-04-08 18:31 America/Mexico_City — Fix RevenueCat web checkout identity handoff, sync profile emails, and add webhook email fallback/error logging
2026-04-08 18:31 America/Mexico_City — Refresh subscription page state on return, add manage-subscription actions, and keep Core plan styling stable when current
2026-04-08 20:14 America/Mexico_City — Fix RevenueCat subscription reads to re-identify the signed-in web user before loading entitlements or opening management
2026-04-08 20:21 America/Mexico_City — Keep subscription page in loading state until the first effective plan resolution completes
2026-04-08 21:34 America/Mexico_City — Exclude admin accounts from /admin/usuarios so admin staff only appears in /admin/roles
2026-04-08 21:44 America/Mexico_City — Implement read-only admin access model across Supabase policies, route guards, and admin list actions
2026-04-08 21:53 America/Mexico_City — Show profile emails in the first column on /admin/usuarios and /admin/roles and match admin search against email
2026-04-08 22:00 America/Mexico_City — Load real auth emails for /admin/roles via a privileged admin endpoint and persist invite emails onto profiles
2026-04-08 22:28 America/Mexico_City — Serialize RevenueCat identity and attribute sync to prevent duplicate onboarding requests
2026-04-08 22:46 America/Mexico_City — Normalize spacing on /admin/usuarios/[id] subscription and entitlements cards and handle missing users without a false load error
2026-04-09 00:18 America/Mexico_City — Migrate web add-ons to RevenueCat offerings, sync add-on entitlements in the webhook, and restore web add-on purchase flows
2026-04-09 01:05 America/Mexico_City — Fix admin program cover uploads so create/edit persist portada images to Supabase Storage and save the public URL
2026-04-09 01:10 America/Mexico_City — Fix admin community post media uploads so create/edit persist selected files to storage and save the public URL
2026-04-09 01:20 America/Mexico_City — Add Cloudflare runtime fallbacks for Vimeo admin imports and clarify missing token error messaging
2026-04-09 01:29 America/Mexico_City — Audit remaining admin file-upload forms and fix benefit, add-on, and event cover uploads in create/edit flows
2026-04-09 01:38 America/Mexico_City — Standardize admin cover-image previews across benefits, programs, add-ons, and events create/edit screens
2026-04-09 02:04 America/Mexico_City — Replace hardcoded admin entitlement dropdowns and labels with live addon entitlement data from Supabase
2026-04-09 02:25 America/Mexico_City — Fix RevenueCat web add-on purchases so successful checkouts no longer show a false "Compra cancelada" toast
