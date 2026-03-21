# Flow Review — 2026-03-20

Full Playwright-based review of all pages in Admin (localhost:3001) and Mobile (localhost:3000).

---

## ADMIN APP (localhost:3001)

### /iniciar-sesion — Login
- **Status**: OK
- Loads correctly, shows test credentials
- Login with `mariana.lopez@example.com / admin123` works
- Hydration mismatch warnings (cosmetic, all admin pages)

### /admin — Dashboard (Inicio)
- **Status**: OK
- Stats: 6 usuarios, 3 suscriptores, 0 check-ins hoy, 4 programas activos
- Quick actions: all 6 links present and correct
- Activity table: 10 recent actions displayed correctly

### /admin/hoy — Planificación diaria
- **Status**: OK
- Weekly calendar view with days 16-22 marzo
- Viernes 20 shows "1 elementos"
- Default values: frase, acción del día, badge all configurable
- Contenido reciente section with auto/manual mode
- "Explora otras secciones" manager with 3 sections (Coach IA, Eventos, VIP)

### /admin/contenido — Biblioteca
- **Status**: OK
- 10 content items displayed
- Filters: estado, tipo, plan, categoría all functional
- Table columns: título, tipo, plan, complemento, estado, publicación
- Edit/Delete actions per row

### /admin/programas — Programas
- **Status**: OK
- 5 programs displayed (1 borrador, 4 publicados)
- Filters: tipo, estado, plan
- Edit/Duplicate/Delete actions per row

### /admin/comunidad — Comunidad
- **Status**: OK
- 7 posts displayed
- Tabs: Todos, Gabriel, Carlotta
- Search functional
- Edit/Delete actions per row
- Note: "Likes" and "Comentarios" columns show empty (no counts displayed)

### /admin/categorias — Categorías
- **Status**: OK
- 6 categories displayed (all active)
- Content counts shown per category
- Edit/Delete actions per row

### /admin/formularios — Formularios
- **Status**: OK (minor issue)
- 2 forms displayed
- **Issue**: "Campos" column shows text "campos" instead of actual field count

### /admin/eventos — Eventos
- **Status**: OK
- Tabs: Próximos (0 events), Pasados (7 events), Borradores
- Past events show correct data with registrant counts

### /admin/beneficios — Beneficios
- **Status**: OK
- 6 benefits (5 active, 1 inactive)
- Edit/Delete actions per row

### /admin/complementos — VIP
- **Status**: FIXED (was 500 error)
- **Bug found**: `_ctx.purchaseCount is not a function` — template called undefined function
- **Fix applied**: Changed `purchaseCount(row.id)` to `row.purchases` in template
- After fix: 5 add-ons displayed correctly with purchase counts

### /admin/usuarios — Usuarios
- **Status**: OK (data concern)
- Page loads but shows "Sin resultados"
- Dashboard reports 6 total users — possible RLS or query filter mismatch

### /admin/roles — Roles
- **Status**: OK (data concern)
- 3 roles displayed (Administrador, Editor, Solo lectura)
- All show "0 miembros"
- Admins table shows "Sin resultados"

---

## MOBILE APP (localhost:3000)

### /cuenta/hoy — Inicio (Hoy)
- **Status**: OK
- Greeting: "Buenas tardes"
- Streak badge showing, check-in progress (0/2)
- Check-in and Action del día buttons functional
- Frase del día: "Testing" by Carlotta
- Contenido Reciente: 3 items from biblioteca
- Explora otras secciones: Coach IA (destacada), Eventos, VIP

### /cuenta/hoy/checkin — Check-in
- **Status**: OK
- 5 mood options (Increíble, Bien, Regular, Bajo, Difícil)
- Optional reflection text field
- Submit button disabled until mood selected

### /cuenta/hoy/progreso — Mi Progreso
- **Status**: OK
- Streak: 3 días (best: 12)
- Stats: 3 check-ins, 2 programas activos, 2 contenidos vistos
- Active programs: "Reto 7 días de gratitud" (Día 3/7), "Programa 30 días: Despertar consciente" (Día 2/5)

### /cuenta/biblioteca — Biblioteca
- **Status**: OK
- Tabs: Categorías, Programas, Objetivos
- Destacado section with featured content
- Categories: Rutinas de mañana, Meditaciones, Mindfulness, Crecimiento personal, Respiración
- Eventos Grabados: 5 past events with recordings
- Note: VIP content gate modal appears for restricted content

### /cuenta/contenido/[id] — Content Detail
- **Status**: OK
- Tested with "Rutina energizante de 5 minutos"
- Shows type (VIDEO), title, description, duration, play button

### /cuenta/retos — Programas
- **Status**: EMPTY LIST (possible SSR issue)
- Page loads without errors
- Tabs show (Todos, Programas, Retos, Bootcamps)
- No program cards rendered despite 5 programs existing in admin
- VIP modal overlay present
- Progreso page shows 2 active programs, so data exists

### /cuenta/comunidad — Comunidad
- **Status**: OK
- 6 published posts displayed with likes and comments
- Segment filter (Todos, Gabriel, Carlotta)
- Sidebar with shortcuts and recent posts
- Comments visible, interaction buttons functional

### /cuenta/comunidad/publicacion/[id] — Post Detail
- **Status**: OK
- Fetches real post data from database
- Shows author, content, reactions, comments
- Comment input with submit button

### /cuenta/eventos — Eventos
- **Status**: OK
- 0 upcoming events (correct — all past)
- 6 past events with "GRABACIÓN" label and dates
- Matches admin data

### /cuenta/eventos/[id] — Event Detail
- **Status**: BUG — HARDCODED DATA
- **All events show same static content**: "Live: Meditación grupal" / "JUEVES 28 FEB · 19:00 CDMX"
- Does NOT fetch event data from database
- File: `apps/mobile/app/pages/cuenta/eventos/[id]/index.vue` lines 51-59

### /cuenta/complementos — VIP
- **Status**: EMPTY LIST (possible SSR issue)
- Page loads without errors, header and intro text shown
- No add-on cards rendered despite 4 active add-ons in admin
- Same pattern as /cuenta/retos — likely SSR user timing issue

### /cuenta/complementos/[id] — Addon Detail
- **Not tested directly** — list is empty so can't navigate to detail

### /cuenta/beneficios — Beneficios
- **Status**: OK
- 5 active benefits displayed (correctly excludes 1 inactive)
- Shows title, description, link arrow

### /cuenta/beneficios/[id] — Benefit Detail
- **Status**: BUG — HARDCODED DATA
- **All benefits show same static content**: "Descuento en retiros" / code "TPRETIRO15"
- Does NOT fetch benefit data from database
- File: `apps/mobile/app/pages/cuenta/beneficios/[id].vue` lines 47-56

### /cuenta/ia — Coach IA
- **Status**: OK
- Tone selector: Carlotta / Gabriel
- "Nueva conversación" button
- Description and disclaimer text

### /cuenta/mas — Perfil (Account Menu)
- **Status**: OK (minor issue)
- Subscription: "Gratis"
- Links: VIP, Beneficios, Coach IA, Progreso, Perfil, Configuración, Cerrar sesión
- **Issue**: User name heading is empty (user hasn't set display_name)

### /cuenta/perfil — Mi Perfil
- **Status**: OK
- Photo upload, name field (empty), community selector (Gabriel/Carlotta/Combinada)
- Membership: "Gratis" with upgrade prompt
- Hydration mismatch warnings

### /cuenta/ajustes — Configuración
- **Status**: OK
- Notifications, Terms, Privacy, Support (soporte@tupotencial.app)
- Version: Tu Potencial v1.0.0 (MVP)

---

## SUMMARY

### Critical Bugs Fixed
1. **`/admin/complementos` 500 error** — `purchaseCount` function not defined. Fixed by using `row.purchases`.

### Bugs Found (Need Fix)
2. **Event detail page hardcoded** — `/cuenta/eventos/[id]` shows static data instead of fetching from DB
3. **Benefit detail page hardcoded** — `/cuenta/beneficios/[id]` shows static data instead of fetching from DB

### Data/Display Issues
4. **Mobile `/cuenta/retos`** — Empty program list on SSR (programs exist in DB)
5. **Mobile `/cuenta/complementos`** — Empty add-on list on SSR (addons exist in DB)
6. **Admin `/admin/usuarios`** — Shows "Sin resultados" despite 6 users
7. **Admin `/admin/formularios`** — "Campos" column shows "campos" text instead of field count
8. **Admin `/admin/comunidad`** — Likes/Comments columns appear empty
9. **Mobile profile** — User name empty on mas/perfil pages

### Cosmetic (Low Priority)
10. Hydration mismatch warnings on all admin pages and some mobile pages (SSR attribute mismatches)
11. `<Suspense> is experimental` info message on all pages
