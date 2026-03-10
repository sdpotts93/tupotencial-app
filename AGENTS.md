# AGENTS.md — Tu Potencial (Monorepo) — Nuxt 4 + Capacitor + Supabase

Source of truth for MVP scope: `docs/proposal/tu-potencial.pdf`. 

This document is written for coding agents. It defines:
- Ways of working (workflow)
- Monorepo architecture (Nuxt 4 customer app (web + mobile) + Nuxt 4 admin + worker + Supabase)
- Supabase migration + RLS best practices (mandatory)
- Full DB schema (tables + columns + relationships)
- UI system (tokens + global CSS variables + fonts)
- Reusable component strategy
- Screen map (customer web/mobile + admin) and what each screen contains
- Feature checklist and feature-spec folder conventions

---

## 0.0 Early development mode (mandatory)

At project start, prioritize route-first testing and mock integrations:
- All defined routes must be directly accessible (deep-linkable) for QA and development without requiring completion of previous screens/flows.
- Start with mock data for all major screens/features, but shape the mocks to simulate Supabase usage (table-like records, async loading states, and error states).
- Keep data-access interfaces compatible with Supabase (same payload/field expectations) so replacing mocks with real Supabase queries is a low-risk swap.
- During this phase, avoid hard-blocking unfinished routes behind incomplete auth/billing logic; use explicit development guards/flags where needed.

---

## 0) Project stack (fixed)

- Monorepo: **npm workspaces**
- Customer app (web + iOS/Android): **Nuxt 4** + **Capacitor** (single codebase)
- Admin web: **Nuxt 4**
- Backend/Auth/DB/Storage: **Supabase** (Postgres + Auth + RLS + Storage)
- Payments: **Stripe** (Checkout + webhooks) — web-only for subscriptions/add-ons (no native in-app payments)
- Video/Lives: **Vimeo** embeds
- Notifications: push + in-app
- Analytics: Firebase Analytics + App Store Connect + Google Play Console
- Webhooks/API: Cloudflare Worker (recommended) or Nuxt server routes (allowed)
- Language/locale: Spanish (Mexico) (`es-MX`)

---

## 0.1 Payments & app store constraints (mandatory)

Target market/storefront:
- Mexico (MX) for iOS App Store + Google Play.

Product decision (MVP):
- Subscriptions (Core) and digital add-ons are purchased on the customer **web** via Stripe Checkout (NOT inside the native iOS/Android app).

Native app constraints (MX storefront):
- Treat the native apps as **consumption-only** for paid access: allow sign-in and content access for existing subscribers, but do not include purchase flows for digital goods/services.
- Do **not** embed Stripe Checkout inside an in-app WebView/browser (e.g., `WKWebView`, `SFSafariViewController`) within the native app.
- Do **not** link out from the native app to `/pricing`/checkout in Mexico for digital purchases (Android: MX is not in Google Play’s official alternative billing country lists; iOS: do not assume any external purchase link entitlement for MX).
- Do **not** use a “sign up” link as a workaround that funnels the user into payment as the next step (any in-app flow that directs to an external purchase mechanism is treated as a prohibited purchase CTA in MX).
- Communication rule (native):
  - It is OK to explain that the app is for existing members and that new users must register/subscribe on the web, but do not present this as a clickable link/button/CTA. Prefer plain helper text + support contact (email) over “Go to website” actions.

If we later expand outside MX:
- External purchase links must be explicitly approved per storefront and documented in a feature spec.
- If allowed, any link to the web must open the device’s **default browser** (not an in-app web view) and comply with the platform’s rules for that storefront.
  - iOS (Reader apps): Apple’s External Link Account entitlement flow opens in the default browser and the link must not deep-link to specific product pages.
  - Android (Google Play): alternative billing is only available via official programs in eligible countries and may require external transaction reporting.

Engineering rule:
- Any “Subscribe/Buy” CTA inside the **native** app is **blocked** for MX storefront unless the project explicitly switches to store billing (StoreKit / Google Play Billing) or qualifies for a supported entitlement/program.

References:
- Apple Reader Apps / External Link Account entitlement: https://developer.apple.com/support/reader-apps/
- Apple App Store Review Guidelines (see 3.1.1, 3.1.1(a), 3.1.3(a)): https://developer.apple.com/app-store/review/guidelines/
- Google Play Help: alternative billing availability (country list): https://support.google.com/googleplay/answer/11174377
- Google Play Console Help: user choice billing (eligible regions): https://support.google.com/googleplay/android-developer/answer/13821247
- Understanding Google Play’s Payments policy: https://support.google.com/googleplay/android-developer/answer/10281818
- Android Developers: Alternative billing APIs (if eligible): https://developer.android.com/google/play/billing/alternative
- Google Play Billing external payment links (in-app integration): https://developer.android.com/google/play/billing/externalpaymentlinks/integration
- Google Play external transaction reporting (backend): https://developer.android.com/google/play/billing/outside-gpb-backend

---

## 0.2 Language & localization (mandatory)

- Primary UI language: Spanish (Mexico) for customer web + iOS/Android + admin.
- All user-facing copy must be written in Spanish; internal code identifiers remain in English.
- Use `es-MX` formatting for dates/numbers/currency on the web app where applicable.

---

## 0.3 Screen orientation (mandatory)

- The app must be **locked to portrait** on all screens **except** media playback routes (e.g. `/content/[id]/play`).
- Media playback routes should allow **both portrait and landscape** so users can rotate for fullscreen video.
- Implementation plan:
  1. **Phase 1 (now — web only):** Use a CSS overlay ("please rotate your device") on landscape for non-media routes as a universal fallback. On media routes, hide the overlay and let the user rotate freely.
  2. **Phase 2 (Capacitor):** When Capacitor is added, use `@capacitor/screen-orientation` plugin to natively lock portrait on app launch and unlock on media routes. Remove the CSS overlay fallback once native orientation control is in place.

## 1) Monorepo layout (canonical)

Note (repo evolution):
- Today this repository may still be a single-app Nuxt project at the repo root.
- It is OK to **reorder/restructure/move files and folders** to reach the canonical monorepo layout (e.g., split into `apps/mobile` and `apps/admin`) as the project evolves.
- When restructuring, update all path references/imports/docs accordingly and keep changes cohesive (prefer one focused “move to monorepo layout” task over scattered moves).

├─ apps/
│ ├─ mobile/ # Nuxt 4 customer app packaged with Capacitor (also deployed to web for signup + billing)
│ └─ admin/ # Nuxt 4 web admin
├─ packages/
│ └─ shared/ # shared types/schemas/utils/constants
├─ supabase/
│ ├─ migrations/ # schema + RLS changes ONLY via migrations
│ └─ functions/ # optional
├─ workers/
│ └─ stripe-webhooks/ # checkout session + webhook verification
 ├─ docs/
 │ ├─ proposal/tu-potencial.pdf
 │ ├─ visual/ # reference images: docs/visual/{screen}.{ext} (or docs/visual/{screen}-{number}.{ext} for flows)
 │ └─ summary.md
└─ features/ # feature specs: features/{platform}-{feature}.md


---

## 2) Workflow (mandatory)

1) **Intake** → 2) **Decompose** → 3) **Implement** → 4) **Review** → 5) **Test** → 6) **Deploy** → 7) **Log to docs/summary.md**

Rules:
- Ship **vertical slices** (UI + DB + RLS + analytics where relevant).
- Every task MUST define:
  - Done criteria
  - Tests
  - Data impact (tables/columns/RLS)
  - UI impact (routes/components)

---

## 3) Task template (mandatory)

Each task card must include:
- Title
- Context
- Done
- Data impact (tables/columns/indexes/RLS)
- UI impact (routes/components)
- Tests
- Owner

---

## 4) Branching & commits (mandatory)

- Branch per feature: `feat/<slug>`
- Commits: `feat|fix|chore(scope): message`
- PR must link task list and feature spec(s)

---

## 5) Summary logging protocol

On task completion, append one line to `docs/summary.md`:
`YYYY-MM-DD HH:mm America/Mexico_City — <short task description>`

---

# DATABASE UPDATE (Supabase) — Mandatory Policy

## Database source of truth
Supabase (remote) is the working source of truth. However:
- Agents must **ONLY create migration files** under `supabase/migrations/`.
- Agents must **NOT** apply schema changes manually in the Supabase dashboard.
- Agents must **NOT** run commands that mutate remote state unless explicitly instructed for a release.

## Mandatory migration creation workflow
For every DB change:
1) Create migration file:
   - `npx supabase migration new <name>`
2) Write SQL only inside that file in `supabase/migrations/`.
3) Never hand-create migration filenames.

## DB lint guardrails (security + performance)

### Functions and triggers
- Always set explicit search path:
  - `SET search_path = public`
- Always set execution mode intentionally:
  - `SECURITY INVOKER` (default) or `SECURITY DEFINER`
- Prefer schema-qualified references: `public.<object>`

### RLS policies
- Avoid repeated evaluation of auth helpers:
  - use `(select auth.uid())`, `(select auth.jwt())`, etc.
- Avoid overlapping permissive policies:
  - prefer one policy per action (`SELECT/INSERT/UPDATE/DELETE`)
- Keep policy changes atomic in migrations:
  - `BEGIN; DROP POLICY IF EXISTS ...; CREATE POLICY ...; COMMIT;`

### Validation before closing DB work
- Run:
  - `npx supabase db lint --linked --schema public --level warning`
- If warnings remain, document:
  - warning name, affected object, whether in-scope, follow-up plan in feature spec + `docs/summary.md`

---

## 6) Tables (complete MVP schema)

### Conventions
- All tables: `id uuid primary key default gen_random_uuid()`
- Timestamps: `created_at timestamptz not null default now()`, `updated_at timestamptz` via trigger
- Soft-delete where useful: `status` fields preferred over hard delete
- Segment gating uses:
  - `community_segment text null` with allowed values: `gabriel|carlotta|conjunta` (note: `conjunta` = combined)
  - `null = visible to all segments`

### 6.1 Auth / Profiles / Roles
#### `profiles`
- `id uuid pk references auth.users(id) on delete cascade`
- `display_name text`
- `avatar_url text`
- `community_segment text not null` (`gabriel|carlotta|conjunta`) (note: `conjunta` = combined)
- `created_at timestamptz default now()`

#### `admin_users`
- `id uuid pk` (own id)
- `user_id uuid unique not null references auth.users(id) on delete cascade`
- `role text not null` (`admin|editor|read_only`)
- `created_at timestamptz default now()`

RLS: profiles self-access; admin_users readable only to admins.

---

### 6.2 Content library (on-demand)
#### `content_categories`
- `id uuid pk`
- `title text not null`
- `slug text unique not null`
- `description text`
- `status text not null default 'active'` (`active|hidden`)
- `position int not null default 0`

#### `content_items`
- `id uuid pk`
- `type text not null` (`video|text|link|audio`)
- `title text not null`
- `subtitle text`
- `description text`
- `body text` (for text content)
- `media_url text` (video/audio)
- `external_url text` (link)
- `thumbnail_url text`
- `duration_seconds int`
- `status text not null default 'draft'` (`draft|scheduled|published|archived`)
- `published_at timestamptz`
- `available_from timestamptz`
- `available_to timestamptz`
- `community_segment text null`
- `created_by uuid null references auth.users(id)`
- `updated_by uuid null references auth.users(id)`
- `created_at timestamptz default now()`

#### `content_item_categories` (m2m + ordering)
- `id uuid pk`
- `content_item_id uuid not null references content_items(id) on delete cascade`
- `category_id uuid not null references content_categories(id) on delete cascade`
- `position int not null default 0`
- unique (`content_item_id`, `category_id`)

---

### 6.3 Programs / Challenges / Bootcamps
#### `programs`
- `id uuid pk`
- `type text not null` (`program|reto|bootcamp`) (note: `reto` = challenge)
- `title text not null`
- `description text`
- `status text not null default 'draft'` (`draft|published|archived`)
- `community_segment text null`
- `is_active bool not null default true` (for simple cohort toggles)
- `start_date date null`
- `end_date date null`
- `created_by uuid null`
- `created_at timestamptz default now()`

#### `program_days`
- `id uuid pk`
- `program_id uuid not null references programs(id) on delete cascade`
- `day_index int not null` (1..N)
- `title text`
- `description text`
- unique (`program_id`, `day_index`)

#### `program_day_items`
- `id uuid pk`
- `program_day_id uuid not null references program_days(id) on delete cascade`
- `content_item_id uuid not null references content_items(id)`
- `position int not null default 0`

#### `program_enrollments`
- `id uuid pk`
- `program_id uuid not null references programs(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `status text not null default 'active'` (`active|completed|cancelled`)
- `enrolled_at timestamptz default now()`
- unique (`program_id`, `user_id`)

#### `program_checkins`
- `id uuid pk`
- `program_id uuid not null references programs(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `day_index int not null`
- `payload jsonb not null default '{}'::jsonb`
- `created_at timestamptz default now()`

Indexes: `(program_id,user_id)`, `(user_id,created_at)`.

---

### 6.4 “Today” (daily experience)
#### `daily_plans`
- `id uuid pk`
- `date date not null`
- `community_segment text null`
- `title text`
- `message text`
- `primary_action_type text not null` (`content|program_day|custom|ai_prompt`)
- `primary_action_ref uuid null` (e.g., content_items.id or program_days.id)
- `primary_action_payload jsonb not null default '{}'::jsonb` (custom action config)
- `status text not null default 'scheduled'` (`scheduled|published|archived`)
- `created_by uuid null`
- unique (`date`, `community_segment`)

#### `daily_checkins`
- `id uuid pk`
- `date date not null`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `payload jsonb not null default '{}'::jsonb`
- `created_at timestamptz default now()`
- unique (`date`, `user_id`)

Optional streak materialization (MVP can compute on the fly):
#### `user_streaks` (optional)
- `user_id uuid pk references auth.users(id) on delete cascade`
- `current_streak int not null default 0`
- `best_streak int not null default 0`
- `last_checkin_date date null`
- `updated_at timestamptz default now()`

---

### 6.5 Community (feed/comments/reactions)
#### `posts`
- `id uuid pk`
- `author_user_id uuid null references auth.users(id)` (null for official)
- `is_official bool not null default false`
- `community_segment text null`
- `title text`
- `body text not null`
- `media_url text`
- `status text not null default 'published'` (`draft|published|hidden`)
- `created_at timestamptz default now()`

#### `post_comments`
- `id uuid pk`
- `post_id uuid not null references posts(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `body text not null`
- `status text not null default 'published'` (`published|hidden`)
- `created_at timestamptz default now()`

#### `post_reactions`
- `id uuid pk`
- `post_id uuid not null references posts(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `reaction text not null` (`like|fire|clap|heart` etc.)
- `created_at timestamptz default now()`
- unique (`post_id`, `user_id`, `reaction`)

---

### 6.6 Events / Lives (Vimeo + gating)
#### `events`
- `id uuid pk`
- `title text not null`
- `description text`
- `start_at timestamptz not null`
- `end_at timestamptz null`
- `community_segment text null`
- `requires_subscription bool not null default true`
- `vimeo_url text null`
- `vimeo_id text null`
- `status text not null default 'draft'` (`draft|published|hidden`)
- `created_at timestamptz default now()`

---

### 6.7 Benefits (external links + tracking)
#### `benefits`
- `id uuid pk`
- `title text not null`
- `description text`
- `url text not null`
- `utm_template text null`
- `code text null`
- `status text not null default 'published'` (`draft|published|hidden`)
- `position int not null default 0`
- `created_at timestamptz default now()`

#### `benefit_clicks`
- `id uuid pk`
- `benefit_id uuid not null references benefits(id) on delete cascade`
- `user_id uuid null references auth.users(id) on delete set null`
- `meta jsonb not null default '{}'::jsonb` (utm resolved, platform, etc.)
- `created_at timestamptz default now()`

---

### 6.8 Add-ons / VIP (entitlements)
#### `addons`
- `id uuid pk`
- `title text not null`
- `description text`
- `stripe_price_id text not null`
- `status text not null default 'active'` (`active|inactive`)
- `created_at timestamptz default now()`

#### `addon_entitlements`
- `id uuid pk`
- `addon_id uuid not null references addons(id) on delete cascade`
- `entitlement_key text not null` (e.g., `vip`, `bonus_module_1`)
- unique (`addon_id`, `entitlement_key`)

#### `user_entitlements`
- `id uuid pk`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `entitlement_key text not null`
- `source text not null` (`subscription|addon|admin`)
- `source_ref text null` (stripe ids, admin note)
- `created_at timestamptz default now()`
- unique (`user_id`, `entitlement_key`)

---

### 6.9 Subscriptions / Payments (Stripe)
#### `subscriptions`
- `id uuid pk`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `status text not null` (`active|trialing|past_due|canceled|incomplete`)
- `stripe_customer_id text`
- `stripe_subscription_id text`
- `current_period_end timestamptz null`
- `updated_at timestamptz default now()`
- unique (`user_id`)

#### `payments`
- `id uuid pk`
- `user_id uuid null references auth.users(id) on delete set null`
- `stripe_event_id text unique not null`
- `stripe_object_id text null`
- `type text not null` (`checkout_completed|invoice_paid|invoice_failed|subscription_updated|addon_purchase`)
- `amount int null`
- `currency text null`
- `meta jsonb not null default '{}'::jsonb`
- `created_at timestamptz default now()`

---

### 6.10 AI Coach (approved feature)
#### `ai_sessions`
- `id uuid pk`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `tone text not null` (`carlotta|gabriel`)
- `status text not null default 'active'` (`active|closed`)
- `created_at timestamptz default now()`

#### `ai_messages`
- `id uuid pk`
- `session_id uuid not null references ai_sessions(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `role text not null` (`user|assistant|system`)
- `content text not null`
- `tokens_in int null`
- `tokens_out int null`
- `safety_category text null` (if flagged)
- `created_at timestamptz default now()`

#### `ai_quotas`
- `user_id uuid pk references auth.users(id) on delete cascade`
- `day date not null`
- `messages_used int not null default 0`
- `tokens_used int not null default 0`
- unique (`user_id`, `day`)

Optional global cap:
#### `ai_global_usage` (optional)
- `month text pk` (YYYY-MM)
- `tokens_used int not null default 0`
- `updated_at timestamptz default now()`

---

## 7) RLS policy model (high-level)

- Public (anon key): read only *published* content allowed for user segment (free tier only).
- Authenticated users:
  - Can read own profile; update own profile.
  - Can insert/check own checkins, enrollments, messages, reactions, comments.
  - Can read segmented feed/content permitted by their profile segment (free vs Core gating per 8.0 catalog).
  - Community features are subscriber-only by default (Core membership).
- Admin users (admin_users):
  - CRUD on operational tables (content/programs/daily_plans/events/benefits/addons)
  - Read users/subscription status

Implementation note:
- Prefer server-side endpoints (worker or Nuxt server) for privileged admin writes and Stripe webhook updates using service role key.

---

## 8) UI system (tokens + global variables)

### 8.0 Product definition + design principles (mandatory)

What it is:
- A daily guidance system
- A habits and awareness platform
- A recurring subscription product

What it is not:
- A workout app
- A standalone meditation app
- A social network
- A marketplace

The product’s focus is not the content itself, but how it helps the user act differently every day.

Product design principles (must guide technical + UX decisions):
1) Radical simplicity (the user should never wonder what to do)
2) Clear daily action (every session leads to a concrete action)
3) Constant guidance (the platform “speaks” to the user)
4) Mobile-first (primary usage happens on mobile)

Product catalog (summary to guide UX + gating):
- Level 1 — Free (“Explore & connect”): daily channel (Today + notifications), 7–15–30 day guides/challenges, limited library, basic AI Coach.
- Level 2 — Core / Premium (“Transform & grow”): recurring subscription (reference: $399 MXN/month, annual discounted) with full access to routines/meditations, community and weekly lives, guided programs (30 days), intermediate AI Coach, soft gamification (streaks/achievements).
- Level 3 — Add-ons / Experiences (“Live the experience”): upsells (1:1/group mentorship, bootcamps, retreats, collaborations, B2B, physical products). In MVP: model primarily as `addons` + `user_entitlements` (digital) and/or one-off payments recorded in `payments` (experiences).

### 8.1 Visual references
- Place reference images in `docs/visual/`
- Naming (single): `docs/visual/{screen}.{extension}` (e.g., `docs/visual/mobile-hoy.png`)
- Naming (flow/multiple images): `docs/visual/{screen}-{number}.{extension}` (e.g., `docs/visual/mobile-auth-login-01.png`, `docs/visual/mobile-auth-login-02.png`)
- Naming (inspiration, optional):
  - Prefix with `inspiration-` and use `-n{number}` to differentiate multiple inspiration images for the same screen/step.
  - Example (login step 1, inspiration #1): `docs/visual/inspiration-login-1-n1.png`
  - Example (login step 1, inspiration #2): `docs/visual/inspiration-login-1-n2.png`
- Inspiration folders (optional):
  - You may group broader product inspiration under subfolders like `docs/visual/adidas/` (e.g., general web-app inspiration screenshots).
  - These are **style references only**: always adapt layouts to Tu Potencial UX needs and **apply our branding** (tokens, colors, typography, spacing, radii) rather than copying the source app/site.
- Coverage note:
  - Not every screen will have a reference image under `docs/visual/` (some screens will be built from the written spec only).
  - If a screen name is prefixed with “Inspiration: …”, treat the reference as **style inspiration only** (respect global tokens/styles) and do not assume it matches the exact UX or requirements.
  - A screen can have multiple inspiration references; use the `-n{number}` suffix to keep them distinct.
  - If a screen has no inspiration/direct references, base the UI on the **already-built screens that do have references** (reuse their patterns, spacing, typography, and components) to keep the product visually consistent.
  - Some inspiration screenshots may include a “Curated by Mobbin” footer/watermark—this is not part of the product design and must be ignored.
  - Some “screens” in references are actually **slideovers/bottom sheets/drawers** (e.g., login as a slideover from the bottom) rather than full-page screens. Implement them using the appropriate modal/drawer pattern while keeping routes/navigation consistent with the spec (route-based modals are allowed).

### 8.2 CSS variables (required)
Define in `apps/mobile/assets/css/tokens.css` and reused in admin (shared import).
Use CSS variables for: colors, typography sizes, spacing, radii, shadows, z-index, component padding.

Global style rule (mandatory):
- **Respect the shared visual system across apps.** Mobile and Admin must feel like the same product.
- `apps/mobile/assets/css/tokens.css` is the source of truth for tokens; Admin should import/reuse the same tokens (no divergent palettes/typography scales).
- No hardcoded colors/sizes in components/screens—consume CSS variables and shared UI primitives.
- “Inspiration” references must be adapted to the token system (do not copy arbitrary spacing/typography/colors from references).
- CSS naming: use **BEM** for class names (e.g., `.block`, `.block__element`, `.block--modifier`) to keep styles predictable and consistent.

**Base palette (as provided):**
- `#282828` → primary (dark)
- `#28374A` → primary (navy)
- `#E8E6E2` → primary (light)
- `#384637` → secondary (green)
- `#A7A68E` → secondary (sand)

Create semantic tokens (example naming):
- `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`
- `--color-primary`, `--color-primary-contrast`
- `--color-accent`, `--color-accent-contrast`
- `--color-border`, `--color-danger`, `--color-success`

Typography tokens (fonts as provided):
- Eyebrow: **NEUE DIN XXWIDE** (`--font-eyebrow`)
- Title: **IVYPRESTO HEADLINE** (`--font-title`)
- Text: **FOUNDERS GROTESK** (`--font-body`)

Font files (local):
- In this repo, fonts live under `public/fonts/`.
- In the monorepo layout, each Nuxt app has its own `public/` folder; store self-hosted fonts under `<app>/public/fonts/` (e.g., `apps/mobile/public/fonts/`, `apps/admin/public/fonts/`).
- Reference them locally via `@font-face` (URLs like `/fonts/<file>.woff2`) and bind the family names to the CSS variables above.
- If adopting Nuxt Fonts (`@nuxt/fonts` / `nuxt/fonts`), you may need to rename/move the font files to match the module’s conventions and configure fonts in each app’s `nuxt.config.ts`.

Logos (local):
- Store logo assets under:
  - `public/logo-icon/` → icon only
  - `public/logo-word/` → wordmark (complete logo)
  - `public/logo-with-tagline/` → complete logo with tagline
- Each logo filename must indicate the color variant (e.g., `-dark`, `-light`, `-navy`, `-sand`, `-green`, or `-mono-black`/`-mono-white`) so it’s obvious which background it’s intended for.

Also define:
- `--text-xs ... --text-2xl`
- `--title-sm ... --title-3xl`
- `--eyebrow-sm ... --eyebrow-lg`
- Button tokens: `--btn-px`, `--btn-py`, `--btn-radius`, `--btn-bg`, `--btn-fg`, `--btn-border`
- Spacing scale: `--space-1 ... --space-12`
- Section spacing: `--section-py`, `--section-gap`
- Card spacing: `--card-p`, `--card-gap`
- Radii: `--radius-sm/md/lg/xl`
- Shadows: `--shadow-1/2/3`

### 8.3 Reusable Vue components (required)
Create shared UI primitives in `packages/shared/ui/` (or `apps/*/components/ui/` with mirrored API):
- `UiButton`, `UiIconButton`
- `UiCard`
- `UiInput`, `UiTextarea`, `UiSelect`
- `UiTabs`
- `UiTag/Chip`
- `UiModal/Drawer`
- `UiToast` (or use Nuxt UI toaster but wrap in helper)
- `UiSkeleton`
- `UiEmptyState`
- `UiList`, `UiListItem`
- `UiTopNav`, `UiBottomNav` (mobile)
- `UiDataTable` (admin)

All components must consume CSS variables (no hardcoded colors/sizes).

### 8.4 Motion (route transitions + micro-animations) — required
- Smooth transitions between route changes (screen changes) on web + native.
- Implement Nuxt page transitions globally and keep them subtle, fast, and consistent.
- Respect accessibility: if `prefers-reduced-motion: reduce`, disable/flatten animations.
- Prefer opacity/transform animations (avoid layout thrash); target 60fps on mid devices.

---

## 9) Screen map (with routes) + Navigation

### 9.1 Mobile navigation (required)

#### Bottom tabs (routes)
1) **Hoy** (Today) — `/hoy`
2) **Biblioteca** (Library) — `/library`
3) **Retos** (Challenges) — `/retos`
4) **Comunidad** (Community) — `/community`
5) **Más** (More) — `/more`

#### “Más” (More) menu (routes)
- Events / Lives — `/events`
- Benefits — `/benefits`
- Add-ons / VIP — `/addons`
- AI Coach — `/ai`
- Profile — `/profile`
- Settings — `/settings`
- Log out — action only (no route)

---

### 9.2 Mobile screens (routes + behavior)

#### Auth
1) Login — `/auth/login`
- Email/password login
- Native builds (MX): login-only screen (no “register/subscribe” buttons or links). Include short helper text in Spanish explaining that account creation/membership activation happens on the web, plus support contact.
- Web: show link to `/auth/register` and CTA to `/pricing` (start Core subscription).
- Remember me:
  - Default: checked.
  - If unchecked: do not persist the Supabase session across app restarts/browser relaunch (session-only storage).
- Biometric sign-in (native only):
  - Support Face ID / Touch ID (iOS) and biometrics (Android) as a convenience sign-in after the user has successfully logged in once with email/password.
  - Store the Supabase `refresh_token` in secure storage (Keychain/Keystore) only when the user explicitly enables biometric sign-in.
  - Next launch: if biometry is available and a refresh token is present, show “Iniciar sesión con Face ID/biometría” button; on success, refresh the session and continue.
  - On logout: clear the stored refresh token from secure storage.
  - iOS requirement: add `NSFaceIDUsageDescription` to the native `Info.plist`.
- On success: go to `/onboarding/segment` if segment missing, else `/hoy`

2) Register (web-only) — `/auth/register`
- Email/password register (free account)
- On success: `/auth/profile-setup` (then on web, route to `/pricing` to start Core subscription)

3) Profile Setup — `/auth/profile-setup`
- Set `display_name` + optional avatar
- Continue to `/onboarding/segment`

#### Onboarding
4) Segment Selection — `/onboarding/segment`
- Choose `gabriel|carlotta|conjunta` (note: `conjunta` = combined) → save to `profiles.community_segment`
- Continue to `/hoy`

#### Today
5) Today Dashboard — `/hoy`
- Load today’s `daily_plan` (segment-specific fallback to global)
- Show message + primary action card + check-in CTA + progress snippet
- Badges: include the badge experience as a **section inside Hoy/Home** (earned today / latest badge preview + share action). Badges do **not** have their own routes in MVP.
- Empty state if no plan configured

6) Today Check-in — `/hoy/checkin`
- Render check-in form from `daily_plan.primary_action_payload`
- Submit to `daily_checkins`
- Success → back to `/hoy` and immediately surface the badge preview (inline or as a bottom-sheet modal)

7) Progress — `/hoy/progress`
- Show streak + totals + active program summaries

#### Library
8) Library Home — `/library`
- Categories (ordered) + featured items (optional)
- Free tier shows a limited library; Core unlocks full library (see 8.0)
- Search CTA → `/library/search`

9) Library Search — `/library/search`
- Search across published `content_items` permitted by segment

10) Category Listing — `/library/c/[slug]`
- Items in category (ordered) + filters (optional)

11) Content Detail — `/content/[id]`
- Show detail + CTA to open player/reader
- Gating UI (subscription/entitlement) if required

12) Player / Reader — `/content/[id]/play`
- Video/audio/text rendering
- Track analytics events

#### Programs / Challenges / Bootcamps
13) Programs Home — `/retos`
- Tabs: Programs | Challenges | Bootcamps
- Each item shows progress + CTA
- Free tier includes intro guides/challenges (7–15–30); Core includes guided 30-day programs (see 8.0)

14) Program Detail — `/retos/[id]`
- Overview + day list
- CTA: enroll/continue
- If inactive/unavailable: show “not available” state

15) Day View — `/retos/[id]/day/[dayIndex]`
- Show ordered content for the day
- CTA to check-in → `/retos/[id]/day/[dayIndex]/checkin`

16) Program Check-in — `/retos/[id]/day/[dayIndex]/checkin`
- Submit `program_checkins` payload
- Success → back to day view or program detail

#### Community
17) Community Feed — `/community`
- Segmented feed + global posts
- Core subscriber feature; show a locked state for non-subscribers (native: no subscribe/buy CTA or external link; web can CTA to `/pricing`)
- Reactions + open post detail

18) Post Detail — `/community/post/[id]`
- Post content + comments
- Add comment (MVP)

19) Create Post (optional) — `/community/new`
- Create user post (text + optional media)

#### Events / Lives
20) Events List — `/events`
- Upcoming + past
- Gated states for non-subscribers

21) Event Detail — `/events/[id]`
- Details + schedule + CTA to watch/join
- If locked: show subscriber-locked state (no native in-app purchase CTA)

22) Event Player — `/events/[id]/watch`
- Vimeo embed view
- Track play event

#### Benefits
23) Benefits List — `/benefits`
- Ordered list of benefits

24) Benefit Detail — `/benefits/[id]`
- Show description + CTA “Open”
- On CTA: log click + open URL w/ UTM template + code

#### Add-ons / VIP
25) Add-ons List — `/addons`
- Show add-ons catalog

26) Add-on Detail — `/addons/[id]`
- Web: CTA purchase → starts Stripe Checkout (worker)
- Native: no purchase CTA (show entitlement status; upgrades happen outside the native app; see 0.1)

27) Checkout Return Handler (web-only) — `/billing/return`
- Success/failure UI
- Refresh subscription/entitlements then redirect:
  - success → `/profile` or `/addons`
  - failure → `/addons/[id]`

28) Unlocked Section(s) — `/vip` (or `/addons/unlocked`)
- Content/features gated by `user_entitlements`

#### Badge (“Show you trained”)
- Badge preview + share live inside `/hoy` as a section (no dedicated routes).
- Share uses the native share sheet (Capacitor) when available.

#### AI Coach (approved)
31) AI Home — `/ai`
- Purpose: choose your coach tone and continue where you left off.
- Show:
  - Short intro copy in Spanish explaining what the coach does (daily guidance + reflection) and what it is not (not medical/therapy).
  - Tone selector: `carlotta` | `gabriel` (matches `ai_sessions.tone`).
  - “Continuar” (opens the most recent `ai_sessions` with `status = active`) and “Nueva conversación” (creates a new session).
  - If daily limit is reached (see `ai_quotas`), show an inline “Límite alcanzado” state and disable starting a new chat until the next day (America/Mexico_City).
- CTA: `/ai/chat/[sessionId]`

32) AI Chat — `/ai/chat/[sessionId]`
- Layout:
  - Top bar: back, tone label, optional “Cerrar” (sets session `status = closed`), and info/help.
  - Message list: bubbles for `user` vs `assistant`, timestamps (es-MX), and subtle loading skeleton while generating.
  - Composer: multiline input, send button, and optional quick prompts (“¿Qué hago hoy?”, “Ayúdame a reflexionar”, “Plan de 5 minutos”).
- Behavior:
  - Load the session and the latest N messages from `ai_messages` (paginate/virtualize for long sessions).
  - On send:
    1) Check quota for today (`ai_quotas`): block if limit reached.
    2) Insert the user message into `ai_messages`.
    3) Call a server-side endpoint to generate the assistant reply (never call the model directly from the client).
    4) Insert assistant reply into `ai_messages` with `tokens_in/tokens_out` when available.
  - While generating: disable send, keep input text, and show a “Escribiendo…” indicator.
  - Retry: if the server call fails, keep the user message and show a “Reintentar” action that re-calls generation for the last user message.
- Limits (MVP):
  - Enforce a per-user per-day cap via `ai_quotas` (messages and/or tokens) using the Mexico City day boundary.
  - Limit reached UI (Spanish):
    - Explain the limit clearly and show the reset time (next day).
    - Offer non-purchase alternatives in native builds (support contact), and web can optionally link to plan info only if compliant with storefront policy.
- Safety (MVP):
  - Always show a small disclaimer (“No es consejo médico/terapéutico.”).
  - If the user expresses self-harm/crisis intent, respond with a safe de-escalation message and local emergency resources (Mexico) and encourage contacting a professional; do not continue normal coaching.
  - Store any safety tagging in `ai_messages.safety_category` when applicable.
- Analytics (recommended):
  - Track: `ai_session_started`, `ai_message_sent`, `ai_message_failed`, `ai_limit_reached`, `ai_session_closed`.

#### Profile / Settings
33) Profile — `/profile`
- Edit name/avatar/segment
- Show subscription status + entitlements

34) Settings — `/settings`
- Notifications toggles/permissions deep link
- Logout action

---

### 9.3 Customer web platform (required)

The customer app must be deployable to the web (public) in addition to the native builds, because payments happen on web.
- The public web must be served outside the `/admin` routes (e.g., at the root domain); `/admin` stays admin-only.

Web onboarding (after payment) — required:
- Goal: after a successful Stripe Checkout, guide the user to (1) confirm email if needed, (2) complete onboarding, and (3) start using the mobile app (consumption-only).
- Expected emails:
  - Stripe receipt email (payment confirmation).
  - Supabase auth email(s) if email confirmation/password reset is enabled in the project.
- Recommended web flow (MVP):
  1) Create account (web): `/auth/register` → (optional) “Revisa tu correo” screen if confirmation is required → `/auth/profile-setup` → `/onboarding/segment`.
  2) Subscribe (web): `/pricing` → Stripe Checkout (attach `user_id` in metadata) → redirect back to `/billing/return`.
  3) Post-checkout guide (web): `/billing/return` shows “Procesando tu membresía…” and polls/refreshes `subscriptions` + `user_entitlements` until active (or times out with support instructions).
  4) Next steps screen (web-only): after success, send to a short onboarding screen that explains how to use the app:
     - Download iOS/Android app (App Store / Google Play links + optional QR codes).
     - “Inicia sesión con el mismo correo que usaste para pagar.”
     - Explain the MX rule clearly: purchases happen on the web; the native app is for members to sign in and consume content (no purchase buttons/links inside the app).
     - Show the first recommended in-app action: “Abre ‘Hoy’ y completa tu check-in”.
  5) If the user has the app already: a “Continuar en la web” button routes to `/hoy` (or the web equivalent dashboard).

Web-only behaviors (Stripe):
- `/pricing` starts Core subscription signup via Stripe Checkout
- `/addons` + `/addons/[id]` include add-on purchase CTAs on web
- `/billing/return` handles Stripe success/cancel then refreshes `subscriptions`/`user_entitlements`

---

### 9.4 Admin navigation (required)

#### Sidebar items (routes)
- Dashboard — `/admin`
- Content — `/admin/content`
- Categories — `/admin/categories`
- Programs/Challenges/Bootcamps — `/admin/programs`
- Today (Scheduler) — `/admin/hoy`
- Community — `/admin/community`
- Events/Lives — `/admin/events`
- Benefits — `/admin/benefits`
- Add-ons/VIP — `/admin/addons`
- Users — `/admin/users`
- Roles (admins) — `/admin/roles`
- Settings (optional) — `/admin/settings`

---

### 9.5 Admin screens (routes + behavior)

1) Admin Login — `/admin/login`
- Email/password login
- Verify `admin_users` membership + role

2) Dashboard — `/admin`
- KPIs + quick actions
- Links to create: Today plan, Content, Event

3) Content List — `/admin/content`
- Filters: status/type/segment/category
- Actions: create, edit, duplicate, archive, publish/schedule/unpublish

4) Content Editor — `/admin/content/new`
- Create draft + save

5) Content Editor — `/admin/content/[id]`
- Edit fields by type
- Segment gating + schedule + status
- Preview + save

6) Categories Manager — `/admin/categories`
- CRUD + ordering + hide/show
- Reorder items within category

7) Programs List — `/admin/programs`
- Filters: type/status/segment
- Actions: create, edit, duplicate, publish/unpublish, activate/deactivate

8) Program Editor — `/admin/programs/new`
- Create draft

9) Program Editor — `/admin/programs/[id]`
- Edit overview, day list, attach content to days, ordering, duplicate

10) Today Scheduler — `/admin/hoy`
- Calendar/list by date
- Create/edit daily plan per date + segment/global

11) Today Plan Editor — `/admin/hoy/[date]`
- Edit message + primary action + check-in form payload
- Publish/schedule

12) Community — `/admin/community`
- Official posts list + create
- Hide/unhide posts/comments

13) Community Editor — `/admin/community/new`
- Create official post

14) Community Editor — `/admin/community/[id]`
- Edit/hide/publish

15) Events List — `/admin/events`
- CRUD + filters (status/segment)

16) Event Editor — `/admin/events/new`
- Create draft

17) Event Editor — `/admin/events/[id]`
- Edit schedule + Vimeo ref + gating + segment + status

18) Benefits List — `/admin/benefits`
- CRUD + ordering

19) Benefit Editor — `/admin/benefits/new`
- Create draft

20) Benefit Editor — `/admin/benefits/[id]`
- Edit url + UTM template + code + status + order

21) Add-ons List — `/admin/addons`
- CRUD add-ons + entitlement mapping

22) Add-on Editor — `/admin/addons/new`
- Create add-on

23) Add-on Editor — `/admin/addons/[id]`
- Edit stripe_price_id, status, entitlement_key mapping

24) Users List — `/admin/users`
- List users + segment + created date + subscription status

25) User Detail — `/admin/users/[id]`
- Subscription + entitlements + last check-in + basic activity

26) Roles — `/admin/roles`
- Manage `admin_users` entries
- Assign roles: admin/editor/read_only

27) Settings (optional) — `/admin/settings`
- Global config (support contact, AI limits, app copy snippets)

## 9.6 Route protection rules (required)

### Definitions
- **Public**: accessible without auth
- **Authed**: requires a valid Supabase session
- **Onboarded**: requires auth + `profiles.community_segment` set
- **Subscriber**: requires Onboarded + active subscription
- **Entitled(<key>)**: requires Onboarded + `user_entitlements` contains `<key>`
- **Admin**: requires auth + membership in `admin_users` with role `admin|editor|read_only`

---

## Customer app route protection (web + native)

### Public routes
- `/auth/login`
- `/auth/register` (web-only; block on native builds)
- `/pricing` (web-only; block on native builds)

### Authed routes (must be logged in)
- `/auth/profile-setup` (required after register if profile incomplete)
- `/billing/return` (web-only Stripe return handler)

### Onboarded routes (must be logged in + segment selected)
Core app area:
- `/hoy`
- `/hoy/checkin`
- `/hoy/progress`
- `/library`
- `/library/search`
- `/library/c/[slug]`
- `/content/[id]`
- `/content/[id]/play`
- `/retos`
- `/retos/[id]`
- `/retos/[id]/day/[dayIndex]`
- `/retos/[id]/day/[dayIndex]/checkin`
- `/benefits`
- `/benefits/[id]`
- `/addons`
- `/addons/[id]`
- `/ai`
- `/ai/chat/[sessionId]`
- `/profile`
- `/settings`
- `/events`
- `/events/[id]`

### Onboarding routes (special handling)
- `/onboarding/segment`
  - Requires auth
  - If segment already set → redirect to `/hoy`
  - If not set → allow

### Subscriber-only routes
- `/community`
- `/community/post/[id]`
- `/events/[id]/watch`
  - Require `subscriptions.status = active|trialing`
  - If not subscriber → redirect to `/events/[id]` (locked state)

### Entitlement-only routes (examples)
Choose a canonical route for VIP gated content:
- `/vip`
  - Require `Entitled(vip)` (or another agreed entitlement_key)

If you gate any specific section:
- `/addons/unlocked/<key>` (optional)
  - Require `Entitled(<key>)`

### Optional: Community posting
If user-generated posting is included:
- `/community/new`
  - Subscriber
Otherwise do not create this route.

---

## Admin route protection

### Public admin routes
- `/admin/login`

### Admin-only routes (all require Admin)
- `/admin`
- `/admin/content`
- `/admin/content/new`
- `/admin/content/[id]`
- `/admin/categories`
- `/admin/programs`
- `/admin/programs/new`
- `/admin/programs/[id]`
- `/admin/hoy`
- `/admin/hoy/[date]`
- `/admin/community`
- `/admin/community/new`
- `/admin/community/[id]`
- `/admin/events`
- `/admin/events/new`
- `/admin/events/[id]`
- `/admin/benefits`
- `/admin/benefits/new`
- `/admin/benefits/[id]`
- `/admin/addons`
- `/admin/addons/new`
- `/admin/addons/[id]`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/roles`
- `/admin/settings` (optional)

### Admin role capabilities (authorization)
Even within Admin routes, enforce capabilities by role:
- `read_only`: can view lists and details; cannot create/edit/publish/delete
- `editor`: can create/edit content/programs/hoy/events/benefits/addons; cannot manage roles
- `admin`: full access including roles and all settings

Implement as:
- route-level guard: require admin membership
- action-level guard: check role before writes (server-side preferred)

---

## Redirect rules (required)
Customer (web + mobile):
- If unauthenticated and route requires auth → redirect to `/auth/login`
- If authenticated but not onboarded and route requires onboarding → redirect to `/onboarding/segment`
- If onboarded but not subscriber for subscriber-only route → redirect to locked detail page (never a blank screen)

Admin:
- If unauthenticated → `/admin/login`
- If authenticated but not in `admin_users` → block (403 screen) and sign out option

---

## 10) Feature checklist (track completion)

### Mobile (MVP)
- [ ] Auth: register/login/profile (Core subscription purchase on web)
- [ ] Segment selection (Gabriel/Carlotta/Combined (`conjunta`))
- [ ] Today: daily plan + check-in + progress
- [ ] Library: categories + content detail + playback/reader
- [ ] Programs/Challenges/Bootcamps: list/detail/day/check-in/progress
- [ ] Community: feed + comments + reactions (segmented)
- [ ] Events/Lives: list/detail/embed + subscriber gating
- [ ] Benefits: list + click tracking
- [ ] Add-ons/VIP: list/detail (purchase on web) + unlock gating
- [ ] Badge: generate + share/download
- [ ] Notifications: push + in-app (basic)
- [ ] Analytics: Firebase events
- [ ] AI Coach: chat + tone variants + limits + redirect

### Customer web (MVP)
- [ ] Pricing + signup/subscribe (Stripe Checkout)
- [ ] Add-ons purchase + entitlement refresh (`/billing/return`)
- [ ] Account/billing management (subscription status + entitlements)

### Admin (MVP)
- [ ] Admin auth + role guards
- [ ] Content CRUD + categories + ordering + scheduling/unpublish
- [ ] Programs CRUD + days + attach content + duplicate + activate/deactivate
- [ ] Today scheduler + daily plan editor
- [ ] Community: official posts + light hide/unhide
- [ ] Events/Lives: CRUD + gating + segment
- [ ] Benefits: CRUD + ordering + tracking fields
- [ ] Add-ons: CRUD + entitlement mapping
- [ ] Users: list + subscription status + entitlements view
- [ ] Analytics read guidance (links/documentation for Firebase/Stores)

### Backend/Infra
- [ ] Supabase migrations + RLS baseline
- [ ] Stripe worker: create checkout + webhook verify + idempotency
- [ ] Vimeo embed support
- [ ] Release checklist (TestFlight + Play testing + store submission)
- [ ] docs/summary.md logging

---

## 11) Feature specs folder (required)

For each major feature, create:
- `features/{platform}-{featureName}.md`

Examples:
- `features/mobile-hoy.md`
- `features/admin-content.md`
- `features/backend-stripe-webhooks.md`
- `features/mobile-ai-coach.md`

Each feature spec must include:
- Goal
- User stories
- Screens (route list)
- Data model (tables touched)
- RLS rules
- Analytics events
- Edge cases
- Done criteria
- Tests

---

## 12) AI Coach (approved feature) — enforcement requirements

Must implement:
- Two tones: `carlotta`, `gabriel`
- Per-user daily limits (messages/tokens)
- Optional global monthly cap
- “Out of scope” refusal categories (health/medical, self-harm/emergency, legal/financial disputes, refunds/chargebacks)
- Redirect protocol to human support
- Logging of usage + safety category flags
- Caching allowed for FAQ-style prompts (optional)

---

## 13) Deployment notes (MVP expectation)

- Customer web deployed (public signup + billing)
- Admin deployed (e.g., Cloudflare Pages)
- Worker deployed (Cloudflare Workers)
- Mobile published to App Store + Google Play (not just internal builds)
- Ensure client owns accounts and has at least 2 admin users provisioned

---

## 14) Future enhancements (post-MVP)

### Direct Instagram Stories sharing
The ShareBadge currently uses the Web Share API (`navigator.share`) which opens the OS share sheet — the user picks Instagram from there. For a **direct-to-Instagram-Stories** flow, Instagram provides a URL scheme (`instagram-stories://share`) that accepts a background image via the pasteboard (iOS) or Intent (Android). This requires a native bridge (Capacitor plugin), not just the browser. Implement when the app ships with Capacitor.

### Auto-convert Vimeo Live recordings to content items
When a Vimeo Live event ends, Vimeo automatically saves the recording. Currently the admin must manually create a `content_items` entry from it. Automate this with a **Vimeo webhook**:
1. Register a Vimeo webhook (`video.transcoding.complete` or `live_event.ended`) pointing to a Supabase Edge Function (e.g. `POST /functions/v1/vimeo-webhook`).
2. The Edge Function receives the payload, matches `vimeo_live_event_id` to an `events` row, and auto-creates a `content_items` record (title, description, entitlement_key copied from the event; `media_url` = Vimeo recording URL).
3. Set `events.recording_content_item_id` to the new content item's ID.
4. Remove the manual "Convertir en contenido" button from `/admin/eventos/[id]` once this is live.
Requires: Vimeo Premium API access + webhook secret stored in Supabase secrets.
