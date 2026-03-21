# APP

## Remaining Issues

### Minor (non-blocking)
- `<Suspense> is an experimental feature` info message on all pages (Vue core, not actionable)
- "Extraneous non-props attributes (style)" warning from Nuxt DevTools overlay (not app code)
- Vue Router warnings on mobile `/cuenta/hoy`: "No match found for location" — triggered by DevTools probes, not user-facing

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
