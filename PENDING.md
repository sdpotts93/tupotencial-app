# APP

## MVP Roadmap (ordered)

### Phase 1 — Admin completeness ✅
1. ~~**Fix admin roles bug**~~ — ✅ Added `{ server: false }` to useAsyncData to avoid SSR auth.uid() issue with RLS
2. ~~**Admin user detail page**~~ — ✅ Built `/admin/usuarios/[id]` with profile, subscription, entitlements, streaks, check-ins, enrollments, addon purchases, community activity
3. ~~**Role-based authorization**~~ — ✅ Added `canEdit`/`canManageRoles` to useAdminAuth, route-level guards in middleware, and UI guards on action buttons across all list pages

### Phase 2 — Mobile improvements ✅
4. ~~**Database-level library search**~~ — ✅ Added Postgres full-text search (Spanish tsvector + GIN index + `search_content` RPC) with debounced 300ms queries in biblioteca

### Phase 3 — Payments ✅
5. ~~**Wire addon purchase flow**~~ — ✅ Added `/create-addon-checkout` worker endpoint (mode: payment), webhook handler for addon checkout.session.completed (insert addon_purchases + grant entitlements from addon_entitlements table), wired Comprar button on mobile
6. ~~**Stripe customer portal link**~~ — ✅ Added `/create-portal-session` worker endpoint + "Gestionar suscripción" link on `/cuenta/mas` (visible to Core subscribers)

### Phase 4 — Capacitor + Native ✅
7. ~~**Capacitor integration**~~ — ✅ Config, iOS/Android projects, SPA build pipeline, composable, plugin
8. ~~**Push notifications**~~ — ✅ `push_tokens` table, composable, auto-register plugin, send-push Edge Function (FCM v1)
9. ~~**Firebase Analytics**~~ — ✅ `@capacitor-firebase/analytics`, composable, auto-init plugin with screen tracking
10. ~~**Portrait orientation lock**~~ — ✅ Native lock in `capacitor.client.ts` via `@capacitor/screen-orientation`
11. ~~**Platform guards**~~ — ✅ Purchase CTAs hidden on native (subscription, addon, portal)

### Phase 5 — Release
12. **Release checklist** — See below.

### Post-MVP
- **Biometric sign-in** — Face ID / Touch ID via Capacitor secure storage.
- **Direct Instagram Stories sharing** — Native share via Capacitor pasteboard/intent.
- **Admin settings page** — Global config (support contact, AI limits, app copy snippets).
- **Notification settings page** — `/settings` notification toggles (depends on push notifications).

### Decisions (confirmed 2026-03-20)
- Library search: inline on the same page, no separate `/library/search` route
- Program day check-in: done within the day page, no separate route
- Community post creation: admin-only, no user `/community/new` route
- VIP unlocked section: not needed, entitlement gating on existing pages suffices
- Admin settings page: not necessary for MVP
- Notification settings page: not in MVP, depends on push notifications
- Capacitor, push notifications, Firebase Analytics, orientation lock, release: all MVP

---

## Release Checklist

### Firebase setup (required before first native build)
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Register iOS app (bundle ID: `com.tupotencial.app`) → download `GoogleService-Info.plist` → place in `apps/mobile/ios/App/App/`
- [ ] Register Android app (package: `com.tupotencial.app`) → download `google-services.json` → place in `apps/mobile/android/app/`
- [ ] Enable Cloud Messaging in Firebase Console (for push notifications)
- [ ] Enable Google Analytics in Firebase Console
- [ ] Copy Firebase service account JSON → set as `FCM_SERVICE_ACCOUNT_KEY` secret in Supabase
- [ ] Set `FCM_PROJECT_ID` secret in Supabase

### iOS (TestFlight → App Store)
- [ ] Open Xcode: `npm run cap:ios` (from root)
- [ ] In Xcode → Signing & Capabilities: add Apple Developer team, set bundle ID `com.tupotencial.app`
- [ ] Add "Push Notifications" capability in Signing & Capabilities
- [ ] Add "Background Modes" → check "Remote notifications"
- [ ] Upload APNs key to Firebase Console (Settings → Cloud Messaging → iOS)
- [ ] Add `GoogleService-Info.plist` to Xcode project (drag into App target)
- [ ] Set version + build number in Xcode project settings
- [ ] Build → Archive → Upload to App Store Connect
- [ ] Create app in App Store Connect: name "Tu Potencial", primary language Spanish (Mexico)
- [ ] Submit for TestFlight review
- [ ] Test on physical devices: auth, push notifications, analytics, orientation lock, purchase guards
- [ ] Add App Store metadata: screenshots (6.7" + 5.5"), description, keywords, category (Health & Fitness)
- [ ] Submit for App Store Review
- [ ] App Store compliance: privacy policy URL, IDFA disclosure (Firebase Analytics = yes), MX storefront

### Android (Play Console)
- [ ] Open Android Studio: `npm run cap:android` (from root)
- [ ] Generate signed APK/AAB: create keystore, sign release build
- [ ] Add `google-services.json` to `apps/mobile/android/app/`
- [ ] Set version code + version name in `apps/mobile/android/app/build.gradle`
- [ ] Create app in Google Play Console
- [ ] Upload AAB to internal testing track
- [ ] Test on physical devices: auth, push notifications, analytics, orientation lock, purchase guards
- [ ] Add Play Store listing: title, short/full description, screenshots, category (Health & Fitness)
- [ ] Content rating questionnaire
- [ ] Submit for review

### Supabase production
- [ ] Apply migration `20250320100000_push_tokens.sql` to production
- [ ] Deploy `send-push` Edge Function: `supabase functions deploy send-push`
- [ ] Set secrets: `FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_KEY`

### Post-launch
- [ ] Monitor Firebase Analytics dashboard for crash-free rate
- [ ] Monitor push notification delivery rates in Firebase Console
- [ ] Set up Crashlytics (optional, can add later)

---

## Remaining Issues

### Minor (non-blocking)
- `<Suspense> is an experimental feature` info message on all pages (Vue core, not actionable)
- "Extraneous non-props attributes (style)" warning from Nuxt DevTools overlay (not app code)
- Vue Router warnings on mobile `/cuenta/hoy`: "No match found for location" — triggered by DevTools probes, not user-facing

## E2E Smoke Test Results (2026-03-21)

Full end-to-end Playwright test of every admin and mobile page.

### Admin Pages — All Rendering
| Page | Elements Verified | Status |
|---|---|---|
| `/admin` (Inicio) | 4 stat cards, 6 quick actions, 10 activity rows | ✅ |
| `/admin/hoy` | Weekly planner, defaults config, day edit form | ✅ |
| `/admin/contenido` | 10 items, search, type/status filters, UiDatePicker in edit | ✅ |
| `/admin/contenido/new` | Title, intro, body, file upload, type/category/objective/plan/status/dates | ✅ |
| `/admin/programas` | 5 programs with type/status filters | ✅ |
| `/admin/comunidad` | 7 posts with likes/comments counts | ✅ |
| `/admin/categorias` | 6 categories with drag handles | ✅ |
| `/admin/formularios` | 2 forms, search, status filter | ✅ |
| `/admin/formularios/[id]` | Title, description, 3 fields with types/options, add/remove fields | ✅ |
| `/admin/eventos` | Tabs (Próximos/Pasados/Borradores), search, table | ✅ |
| `/admin/eventos/new` | Title, description, image upload, UiDatePicker, duration, Vimeo ID, plan/complemento/estado | ✅ |
| `/admin/beneficios` | 6 benefits with drag handles, search | ✅ |
| `/admin/complementos` | 5 add-ons, prices ($799–$8,999 MXN), plan/status | ✅ |
| `/admin/usuarios` | 6 users, search, Plan/Estado/Segmento filters | ✅ |
| `/admin/roles` | 3 role cards, admin table, invite modal (email/name/role) | ✅ |

### Mobile Pages — All Rendering (390×844 viewport)
| Page | Elements Verified | Status |
|---|---|---|
| `/cuenta/hoy` | Greeting, streak, check-in card (0/2), action tabs, quote, 3 recent content, explore sections | ✅ |
| Check-in modal | 5 mood buttons, reflection textarea, Completar button | ✅ |
| Action modal | Cumplí/No cumplí buttons, Confirmar button | ✅ |
| `/cuenta/biblioteca` | Featured card, 6 category sections, 5 recorded events, search, tabs (Categorías/Programas/Objetivos) | ✅ |
| Entitlement paywall | "Contenido exclusivo" modal with "Ver complemento" button | ✅ |
| `/cuenta/retos` | 4 programs, tabs (Todos/Programas/Retos/Bootcamps), type badges, entitlement lock | ✅ |
| `/cuenta/comunidad` | 6 posts, segment filters (Todos/Gabriel/Carlotta), like/comment counts | ✅ |
| `/cuenta/mas` (Perfil) | User avatar+name+plan, Suscripción links (VIP/Beneficios), Cuenta links (Coach IA/Progreso/Perfil/Config/Cerrar sesión) | ✅ |

### Loading States — All Verified
All async action buttons now have `:loading` prop bindings (14 files updated in prior session).

### UiDatePicker — All Verified
All date inputs replaced with UiDatePicker component where applicable (contenido new/edit, eventos new/edit).

### Console Status
- 0 errors across all pages
- Only non-actionable warnings: `<Suspense>` experimental, DevTools extraneous attrs, Vue Router DevTools probes

---

## CRUD Test Results (2026-03-20)

All admin sections and mobile actions tested via Playwright. **No blocking issues found.**

### Admin CRUD — All Passing
| Section | Create | Edit | Delete | Notes |
|---|---|---|---|---|
| `/admin/contenido` | ✅ | ✅ | ✅ | |
| `/admin/programas` | ✅ | — | ✅ | Multi-step wizard (Siguiente → Guardar) |
| `/admin/comunidad` | ✅ | — | ✅ | Create via textarea + Publicar |
| `/admin/categorias` | ✅ | ✅ | ✅ | Inline modal (no /new route) |
| `/admin/formularios` | ✅ | ✅ | ✅ | Supports dynamic field builder |
| `/admin/eventos` | ✅ | ✅ | ✅ | Delete from edit page only |
| `/admin/beneficios` | ✅ | ✅ | ✅ | Supports drag-and-drop reorder |
| `/admin/complementos` | ✅ | ✅ | ✅ | Delete from edit page only |
| `/admin/hoy` | ✅ | ✅ | — | Day plans saved via overwrite, no delete |

### Mobile Actions — All Passing
| Action | Status | Notes |
|---|---|---|
| Check-in (mood + reflection) | ✅ | Progress bar updates (0/2 → 1/2) |
| Profile save (name + segment) | ✅ | display_name updates across app |
| Community like | ✅ | Like count increments instantly |
| Community comment | ✅ | Comment appears with author + timestamp |

## Resolved (2026-03-20)
- `/admin/complementos` — 500 error fixed (`purchaseCount` → `row.purchases`)
- `/cuenta/eventos/[id]` — Was showing hardcoded static data, now fetches from DB
- `/cuenta/beneficios/[id]` — Was showing hardcoded static data, now fetches from DB
- `/cuenta/retos` — Programs list empty on SSR; removed `if (!user.value?.id) return []` guard, fetch programs unconditionally
- `/cuenta/complementos` — Add-ons list empty on SSR; same fix, fetch addons unconditionally
- `/admin/usuarios` — "Sin resultados" caused by PostgREST join failure (subscriptions/user_entitlements FK to auth.users, not profiles); split into separate queries joined in JS
- `/admin/formularios` — "Campos" column showed text instead of count; computed `fields_count` from `fields.length`
- `/admin/comunidad` — Likes/Comments empty; added `post_reactions(count)` and `post_comments(count)` to query
- Hydration mismatch warnings — `Math.random()` IDs in UiInput/UiSelect/UiTextarea/UiDatePicker replaced with Vue `useId()` (7 components across admin + mobile)
- Empty display_name on mobile profile — added email prefix fallback when `display_name` is empty
