# APP

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
