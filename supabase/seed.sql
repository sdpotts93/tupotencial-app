-- =============================================================================
-- supabase/seed.sql
-- Seed data for local development (runs on `supabase db reset`)
-- Converts all records from packages/shared/mock/*.ts into SQL
-- =============================================================================

-- ── 1. Auth users (local dev only) ───────────────────────────────────────────
-- These inserts work with `supabase db reset` but NOT on hosted Supabase.
-- On hosted environments, use the Auth API or dashboard to create users.

-- All seed users share the password: admin123
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'mariana.lopez@example.com',
    '$2a$10$QSmHMywaHs4u/afgW18.reSnbjELxDFUhW2y3dm8yFq0sM..8coai',
    '2025-11-10T08:02:00.000Z',
    '2025-11-10T08:00:00.000Z',
    '2026-02-20T10:00:00.000Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'diego.ramirez@example.com',
    '$2a$10$QSmHMywaHs4u/afgW18.reSnbjELxDFUhW2y3dm8yFq0sM..8coai',
    '2025-12-01T14:35:00.000Z',
    '2025-12-01T14:30:00.000Z',
    '2026-02-01T14:30:00.000Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'sofia.hernandez@example.com',
    '$2a$10$QSmHMywaHs4u/afgW18.reSnbjELxDFUhW2y3dm8yFq0sM..8coai',
    '2026-01-05T09:20:00.000Z',
    '2026-01-05T09:15:00.000Z',
    '2026-02-05T09:15:00.000Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'carlos.mendoza@example.com',
    '$2a$10$QSmHMywaHs4u/afgW18.reSnbjELxDFUhW2y3dm8yFq0sM..8coai',
    '2026-01-20T11:50:00.000Z',
    '2026-01-20T11:45:00.000Z',
    '2026-02-10T11:45:00.000Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000005',
    'authenticated',
    'authenticated',
    'valentina.torres@example.com',
    '$2a$10$QSmHMywaHs4u/afgW18.reSnbjELxDFUhW2y3dm8yFq0sM..8coai',
    '2026-02-01T07:05:00.000Z',
    '2026-02-01T07:00:00.000Z',
    '2026-02-15T07:00:00.000Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- GoTrue cannot scan NULL into Go strings, so coerce every nullable varchar to ''.
UPDATE auth.users SET
  confirmation_token      = COALESCE(confirmation_token, ''),
  recovery_token          = COALESCE(recovery_token, ''),
  email_change_token_new  = COALESCE(email_change_token_new, ''),
  email_change            = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token      = COALESCE(phone_change_token, ''),
  reauthentication_token  = COALESCE(reauthentication_token, '')
WHERE id IN (
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000005'
);

-- ── 1b. Auth identities (required by GoTrue for email/password login) ────────
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '{"sub":"a0000000-0000-4000-8000-000000000001","email":"mariana.lopez@example.com"}'::jsonb, 'email', '2025-11-10T08:02:00.000Z', '2025-11-10T08:00:00.000Z', '2025-11-10T08:00:00.000Z'),
  ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', '{"sub":"a0000000-0000-4000-8000-000000000002","email":"diego.ramirez@example.com"}'::jsonb, 'email', '2025-12-01T14:35:00.000Z', '2025-12-01T14:30:00.000Z', '2025-12-01T14:30:00.000Z'),
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', '{"sub":"a0000000-0000-4000-8000-000000000003","email":"sofia.hernandez@example.com"}'::jsonb, 'email', '2026-01-05T09:20:00.000Z', '2026-01-05T09:15:00.000Z', '2026-01-05T09:15:00.000Z'),
  ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', '{"sub":"a0000000-0000-4000-8000-000000000004","email":"carlos.mendoza@example.com"}'::jsonb, 'email', '2026-01-20T11:50:00.000Z', '2026-01-20T11:45:00.000Z', '2026-01-20T11:45:00.000Z'),
  ('a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', '{"sub":"a0000000-0000-4000-8000-000000000005","email":"valentina.torres@example.com"}'::jsonb, 'email', '2026-02-01T07:05:00.000Z', '2026-02-01T07:00:00.000Z', '2026-02-01T07:00:00.000Z')
ON CONFLICT DO NOTHING;

-- ── 2. Profiles ──────────────────────────────────────────────────────────────

INSERT INTO public.profiles (id, display_name, avatar_url, community_segment, created_at)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Mariana López',    'https://i.pravatar.cc/150?u=mariana',   'carlotta',  '2025-11-10T08:00:00.000Z'),
  ('a0000000-0000-4000-8000-000000000002', 'Diego Ramírez',    'https://i.pravatar.cc/150?u=diego',     'gabriel',   '2025-12-01T14:30:00.000Z'),
  ('a0000000-0000-4000-8000-000000000003', 'Sofía Hernández',  NULL,                                     'conjunta',  '2026-01-05T09:15:00.000Z'),
  ('a0000000-0000-4000-8000-000000000004', 'Carlos Mendoza',   'https://i.pravatar.cc/150?u=carlos',    'gabriel',   '2026-01-20T11:45:00.000Z'),
  ('a0000000-0000-4000-8000-000000000005', 'Valentina Torres',  'https://i.pravatar.cc/150?u=valentina', 'carlotta',  '2026-02-01T07:00:00.000Z');


-- ── 3. Admin users ───────────────────────────────────────────────────────────

INSERT INTO public.admin_users (id, user_id, role, created_at)
VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'admin',     '2025-11-10T08:05:00.000Z'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'editor',    '2025-12-01T14:35:00.000Z'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'read_only', '2026-01-21T10:00:00.000Z');


-- ── 4. Content objectives ────────────────────────────────────────────────────

INSERT INTO public.content_objectives (id, title, slug, position)
VALUES
  ('c4000000-0000-4000-8000-000000000001', 'Reducir estrés',       'reducir-estres',       0),
  ('c4000000-0000-4000-8000-000000000002', 'Rutina matutina',      'rutina-matutina',      1),
  ('c4000000-0000-4000-8000-000000000003', 'Crecimiento personal', 'crecimiento-personal', 2),
  ('c4000000-0000-4000-8000-000000000004', 'Mindfulness',          'mindfulness',          3),
  ('c4000000-0000-4000-8000-000000000005', 'Liderazgo',            'liderazgo',            4),
  ('c4000000-0000-4000-8000-000000000006', 'Bienestar integral',   'bienestar-integral',   5);


-- ── 5. Content categories ────────────────────────────────────────────────────

INSERT INTO public.content_categories (id, title, slug, description, icon_url, is_active, status, sort_order)
VALUES
  (
    'c1000000-0000-4000-8000-000000000001',
    'Meditaciones',
    'meditaciones',
    'Meditaciones guiadas para encontrar tu centro y cultivar la calma interior.',
    NULL, true, 'active', 0
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'Rutinas de mañana',
    'rutinas-de-manana',
    'Comienza cada día con intención. Rutinas diseñadas para activar cuerpo y mente.',
    NULL, true, 'active', 1
  ),
  (
    'c1000000-0000-4000-8000-000000000003',
    'Mindfulness',
    'mindfulness',
    'Prácticas de atención plena para vivir el presente con mayor consciencia.',
    NULL, true, 'active', 2
  ),
  (
    'c1000000-0000-4000-8000-000000000004',
    'Crecimiento personal',
    'crecimiento-personal',
    'Herramientas y reflexiones para tu desarrollo integral como ser humano.',
    NULL, true, 'active', 3
  ),
  (
    'c1000000-0000-4000-8000-000000000005',
    'Respiración',
    'respiracion',
    'Técnicas de respiración consciente para regular tu energía y emociones.',
    NULL, true, 'active', 4
  ),
  (
    'c1000000-0000-4000-8000-000000000006',
    'Journaling',
    'journaling',
    'Ejercicios de escritura reflexiva para conocerte mejor.',
    NULL, true, 'hidden', 5
  );


-- ── 6. Forms ─────────────────────────────────────────────────────────────────

INSERT INTO public.forms (id, title, description, fields, status)
VALUES
  (
    'fb000000-0000-4000-8000-000000000001',
    'Encuesta de satisfacción',
    'Ayúdanos a mejorar tu experiencia en Tu Potencial',
    '[{"type":"rating","question":"¿Qué tan satisfecho estás con la app?","required":true},{"type":"text","question":"¿Qué podríamos mejorar?","required":false},{"type":"select","question":"¿Qué funcionalidad usas más?","options":["Meditaciones","Programas","Comunidad","Coach IA"],"required":true}]'::jsonb,
    'active'
  ),
  (
    'fb000000-0000-4000-8000-000000000002',
    'Formulario de inscripción al retiro',
    'Completa este formulario para reservar tu lugar en el retiro de marzo 2026',
    '[{"type":"text","question":"Nombre completo","required":true},{"type":"email","question":"Email de contacto","required":true},{"type":"select","question":"¿Tienes alguna restricción alimentaria?","options":["Ninguna","Vegetariano","Vegano","Otro"],"required":true},{"type":"textarea","question":"¿Hay algo que debamos saber?","required":false}]'::jsonb,
    'active'
  );


-- ── 7. Content items ─────────────────────────────────────────────────────────
-- NOTE: mock type 'text' → 'article' (schema CHECK constraint)
-- Items with entitlement_key get plan = 'core'; others get plan = 'free'

INSERT INTO public.content_items (
  id, type, title, subtitle, description, body,
  media_url, external_url, thumbnail_url, duration_seconds,
  entitlement_key, plan, objective_id,
  status, published_at, available_from, available_to,
  community_segment, created_by, updated_by, created_at
)
VALUES
  -- ci-001: Meditación matutina (video, free)
  (
    'c2000000-0000-4000-8000-000000000001',
    'video',
    'Meditación matutina: Gratitud y presencia',
    '10 minutos para empezar tu día con claridad',
    'Una meditación guiada que te ayudará a conectar con la gratitud y establecer una intención positiva para el día.',
    NULL,
    'https://player.vimeo.com/video/000000001',
    NULL,
    'https://picsum.photos/seed/meditation1/640/360',
    600,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000001',
    'published', '2026-01-15T06:00:00.000Z', NULL, NULL,
    NULL,
    'a0000000-0000-4000-8000-000000000001', NULL,
    '2026-01-14T20:00:00.000Z'
  ),
  -- ci-002: Rutina energizante (video, free)
  (
    'c2000000-0000-4000-8000-000000000002',
    'video',
    'Rutina energizante de 5 minutos',
    'Activa tu cuerpo sin salir de casa',
    'Movimientos suaves y conscientes para despertar tu cuerpo y prepararte para un día productivo.',
    NULL,
    'https://player.vimeo.com/video/000000002',
    NULL,
    'https://picsum.photos/seed/routine1/640/360',
    300,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000002',
    'published', '2026-01-20T06:00:00.000Z', NULL, NULL,
    'carlotta',
    'a0000000-0000-4000-8000-000000000001', NULL,
    '2026-01-19T18:00:00.000Z'
  ),
  -- ci-003: Respiración 4-7-8 (video, free)
  (
    'c2000000-0000-4000-8000-000000000003',
    'video',
    'Respiración 4-7-8 para calmar la ansiedad',
    'Técnica guiada paso a paso',
    'Aprende la técnica de respiración 4-7-8 para reducir el estrés y encontrar calma en momentos difíciles.',
    NULL,
    'https://player.vimeo.com/video/000000003',
    NULL,
    'https://picsum.photos/seed/breathing1/640/360',
    480,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000001',
    'published', '2026-02-01T06:00:00.000Z', NULL, NULL,
    'gabriel',
    'a0000000-0000-4000-8000-000000000002', NULL,
    '2026-01-31T22:00:00.000Z'
  ),
  -- ci-004: Meditación nocturna (audio, free)
  (
    'c2000000-0000-4000-8000-000000000004',
    'audio',
    'Meditación nocturna: Soltar el día',
    'Relajación profunda antes de dormir',
    'Deja ir las tensiones del día con esta meditación guiada diseñada para ayudarte a descansar mejor.',
    NULL,
    'https://cdn.example.com/audio/meditacion-nocturna.mp3',
    NULL,
    'https://picsum.photos/seed/night-med/640/360',
    900,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000001',
    'published', '2026-02-05T06:00:00.000Z', NULL, NULL,
    NULL,
    'a0000000-0000-4000-8000-000000000001', NULL,
    '2026-02-04T15:00:00.000Z'
  ),
  -- ci-005: Visualización (audio, core — has entitlement_key 'vip')
  (
    'c2000000-0000-4000-8000-000000000005',
    'audio',
    'Visualización guiada: Tu mejor versión',
    '15 minutos de transformación interna',
    'Cierra los ojos y déjate guiar hacia una imagen vívida de la persona en la que te estás convirtiendo.',
    NULL,
    'https://cdn.example.com/audio/visualizacion-mejor-version.mp3',
    NULL,
    'https://picsum.photos/seed/visualize/640/360',
    900,
    'vip', 'core', 'c4000000-0000-4000-8000-000000000003',
    'published', '2026-02-10T06:00:00.000Z', NULL, NULL,
    'conjunta',
    'a0000000-0000-4000-8000-000000000002', NULL,
    '2026-02-09T20:00:00.000Z'
  ),
  -- ci-006: 5 preguntas journaling (article, free)
  (
    'c2000000-0000-4000-8000-000000000006',
    'article',
    'Las 5 preguntas que transforman tu mañana',
    'Un ejercicio de journaling para empezar con intención',
    'Descubre cómo cinco preguntas simples pueden cambiar la dirección de tu día y de tu vida.',
    $body$# Las 5 preguntas que transforman tu mañana

Cada mañana es una oportunidad de reinicio. Antes de revisar tu teléfono, antes de pensar en la lista de pendientes, regálate cinco minutos con estas preguntas:

## 1. ¿Qué es lo que más agradezco hoy?
Empieza con gratitud. No tiene que ser algo grande: el café caliente, la luz que entra por la ventana, una persona que te importa.

## 2. ¿Cuál es mi intención para hoy?
No un objetivo, no una meta. Una intención: ¿cómo quieres *ser* hoy? Presente, paciente, valiente, amable...

## 3. ¿Qué puedo soltar?
¿Hay algo del día anterior que sigues cargando? Dale permiso de irse.

## 4. ¿Qué acción pequeña me acerca a mi mejor versión?
Solo una. Concreta. Alcanzable hoy.

## 5. ¿Cómo quiero sentirme al final del día?
Visualiza ese momento. Deja que esa imagen guíe tus decisiones.

---

*Escribe tus respuestas en un cuaderno. La magia está en la consistencia.*$body$,
    NULL,
    NULL,
    'https://picsum.photos/seed/journaling1/640/360',
    NULL,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000002',
    'published', '2026-02-12T06:00:00.000Z', NULL, NULL,
    NULL,
    'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002',
    '2026-02-11T16:00:00.000Z'
  ),
  -- ci-007: Espacio sagrado (article, free)
  (
    'c2000000-0000-4000-8000-000000000007',
    'article',
    'Guía rápida: Cómo crear un espacio sagrado en casa',
    'Tu rincón de paz no necesita ser perfecto',
    'Aprende a diseñar un espacio físico que invite a la calma, la reflexión y la práctica diaria.',
    $body$# Cómo crear un espacio sagrado en casa

No necesitas una habitación entera. Un rincón, una esquina, incluso un cojín en el suelo puede ser suficiente.

## Lo esencial
- **Un lugar fijo**: tu cerebro asociará ese espacio con la práctica.
- **Mínimas distracciones**: lejos del televisor y del escritorio de trabajo.
- **Algo que te inspire**: una vela, una planta, una foto, un objeto que tenga significado para ti.

## Opcional pero recomendado
- Un cojín o tapete cómodo.
- Audífonos si hay ruido.
- Un cuaderno y pluma para journaling.

## El ritual de entrada
Cada vez que te sientes en tu espacio, haz tres respiraciones profundas antes de comenzar cualquier práctica. Eso le dice a tu sistema nervioso: *aquí estoy seguro, aquí me cuido*.

---

*Tu espacio no tiene que ser perfecto. Solo tiene que ser tuyo.*$body$,
    NULL,
    NULL,
    'https://picsum.photos/seed/sacred-space/640/360',
    NULL,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000006',
    'published', '2026-02-14T06:00:00.000Z', NULL, NULL,
    'carlotta',
    'a0000000-0000-4000-8000-000000000001', NULL,
    '2026-02-13T12:00:00.000Z'
  ),
  -- ci-008: Masterclass IE (video, draft, core — has entitlement_key 'bootcamp_liderazgo')
  (
    'c2000000-0000-4000-8000-000000000008',
    'video',
    'Masterclass: Inteligencia emocional en la vida diaria',
    'Con Gabriel — Sesión especial',
    'Una clase profunda sobre cómo reconocer, entender y gestionar tus emociones en el día a día.',
    NULL,
    'https://player.vimeo.com/video/000000008',
    NULL,
    'https://picsum.photos/seed/masterclass1/640/360',
    2700,
    'bootcamp_liderazgo', 'core', 'c4000000-0000-4000-8000-000000000005',
    'draft', NULL, NULL, NULL,
    'gabriel',
    'a0000000-0000-4000-8000-000000000002', NULL,
    '2026-02-20T10:00:00.000Z'
  ),
  -- ci-009: Body scan (audio, scheduled, free)
  (
    'c2000000-0000-4000-8000-000000000009',
    'audio',
    'Body scan: Reconecta con tu cuerpo',
    'Escaneo corporal guiado de 20 minutos',
    'Recorre cada parte de tu cuerpo con atención plena. Ideal para liberar tensión acumulada.',
    NULL,
    'https://cdn.example.com/audio/body-scan.mp3',
    NULL,
    'https://picsum.photos/seed/bodyscan/640/360',
    1200,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000004',
    'scheduled', '2026-03-01T06:00:00.000Z', '2026-03-01T06:00:00.000Z', NULL,
    NULL,
    'a0000000-0000-4000-8000-000000000001', NULL,
    '2026-02-22T09:00:00.000Z'
  ),
  -- ci-010: Ciencia hábitos (link, free)
  (
    'c2000000-0000-4000-8000-000000000010',
    'article',
    'La ciencia detrás de los hábitos',
    'Cómo se forman, cómo se rompen y cómo diseñar los tuyos',
    'Un recorrido por la neurociencia de los hábitos y estrategias prácticas para construir rutinas que perduren.',
    $$<h2>¿Por qué es tan difícil cambiar?</h2>
<p>Cada hábito sigue un ciclo de tres pasos que los neurocientíficos llaman el <strong>loop del hábito</strong>: señal, rutina y recompensa. Cuando entiendes este ciclo, dejas de luchar contra ti mismo y empiezas a diseñar a tu favor.</p>

<h3>1. La señal</h3>
<p>Es el disparador que le dice a tu cerebro que entre en modo automático. Puede ser una hora del día, una emoción, una ubicación o incluso una persona. Por ejemplo, si cada mañana al despertar revisas tu teléfono, el simple hecho de abrir los ojos ya es tu señal.</p>

<blockquote>El truco no es eliminar señales, sino asociarlas a rutinas que te acerquen a quien quieres ser.</blockquote>

<h3>2. La rutina</h3>
<p>Es la acción en sí — el comportamiento que quieres instalar o reemplazar. Aquí es donde la mayoría de la gente se enfoca, pero sin entender la señal y la recompensa, la fuerza de voluntad se agota rápidamente.</p>
<p>Las investigaciones del MIT muestran que los ganglios basales — una estructura profunda del cerebro — almacenan las rutinas repetidas para que se ejecuten con mínimo esfuerzo consciente. Esto es una ventaja: significa que una vez que un hábito se consolida, ya no requiere motivación.</p>

<h3>3. La recompensa</h3>
<p>Es lo que le enseña a tu cerebro que vale la pena repetir el ciclo. No tiene que ser grande: puede ser la satisfacción de tachar algo de tu lista, un momento de calma después de meditar o simplemente notar cómo te sientes.</p>

<h2>La regla de los 2 minutos</h2>
<p>James Clear, autor de <em>Atomic Habits</em>, propone una estrategia brillante: reduce cualquier hábito nuevo a una versión de 2 minutos.</p>
<ul>
  <li><strong>Quiero meditar 20 minutos</strong> → Siéntate y cierra los ojos por 2 minutos</li>
  <li><strong>Quiero leer 30 páginas</strong> → Lee una página</li>
  <li><strong>Quiero correr 5 km</strong> → Ponte los tenis y sal a la puerta</li>
</ul>
<p>El objetivo no es hacer poco, es <strong>comenzar</strong>. Una vez que estás en movimiento, la fricción desaparece. Lo que importa es que la identidad de "persona que medita" o "persona que lee" se refuerce cada día, aunque sea con un gesto mínimo.</p>

<h2>Apilamiento de hábitos</h2>
<p>Otra técnica respaldada por la ciencia es vincular un hábito nuevo a uno que ya tienes consolidado:</p>
<ol>
  <li>Después de servirme el café (hábito existente), escribiré 3 cosas por las que estoy agradecido (hábito nuevo).</li>
  <li>Después de lavarme los dientes (hábito existente), haré 2 minutos de respiración consciente (hábito nuevo).</li>
  <li>Después de llegar a casa del trabajo (hábito existente), dejaré el teléfono en otra habitación (hábito nuevo).</li>
</ol>
<p>Al "apilar" hábitos, aprovechas las conexiones neuronales que ya existen en lugar de crear unas desde cero.</p>

<h2>Lo que dice la evidencia</h2>
<p>Un estudio de la University College London encontró que, en promedio, un nuevo hábito tarda <strong>66 días</strong> en automatizarse — no 21, como se creía. Pero la variación es enorme: desde 18 hasta 254 días dependiendo de la persona y la complejidad del hábito.</p>
<p>La buena noticia es que <strong>saltarte un día no arruina el progreso</strong>. Lo que importa es la consistencia general, no la perfección. Los investigadores encontraron que fallar un día no afectó significativamente la formación del hábito a largo plazo.</p>

<h2>Tu siguiente paso</h2>
<p>Elige <strong>un solo hábito</strong> que quieras incorporar esta semana. Identifica tu señal, define la versión de 2 minutos y decide cuál será tu recompensa. Escríbelo y compártelo con la comunidad — el compromiso social es uno de los aceleradores más poderosos que existen.</p>$$,
    NULL,
    NULL,
    'https://picsum.photos/seed/habits-article/640/360',
    NULL,
    NULL, 'free', 'c4000000-0000-4000-8000-000000000003',
    'published', '2026-02-18T06:00:00.000Z', NULL, NULL,
    NULL,
    'a0000000-0000-4000-8000-000000000002', NULL,
    '2026-02-17T14:00:00.000Z'
  );


-- ── 8. Content item categories (junction) ────────────────────────────────────

INSERT INTO public.content_item_categories (id, content_item_id, category_id, position)
VALUES
  -- Meditaciones
  ('c3000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 0),
  ('c3000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 1),
  ('c3000000-0000-4000-8000-000000000003', 'c2000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000001', 2),
  ('c3000000-0000-4000-8000-000000000004', 'c2000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000001', 3),
  -- Rutinas de mañana
  ('c3000000-0000-4000-8000-000000000005', 'c2000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', 0),
  ('c3000000-0000-4000-8000-000000000006', 'c2000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002', 1),
  -- Mindfulness
  ('c3000000-0000-4000-8000-000000000007', 'c2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 0),
  ('c3000000-0000-4000-8000-000000000008', 'c2000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000003', 1),
  ('c3000000-0000-4000-8000-000000000009', 'c2000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000003', 2),
  -- Crecimiento personal
  ('c3000000-0000-4000-8000-000000000010', 'c2000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000004', 0),
  ('c3000000-0000-4000-8000-000000000011', 'c2000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000004', 1),
  ('c3000000-0000-4000-8000-000000000012', 'c2000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000004', 2),
  ('c3000000-0000-4000-8000-000000000013', 'c2000000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000004', 3),
  -- Respiración
  ('c3000000-0000-4000-8000-000000000014', 'c2000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000005', 0);


-- ── 9. Programs ──────────────────────────────────────────────────────────────

INSERT INTO public.programs (
  id, type, title, description, entitlement_key, plan, cover_url,
  status, community_segment, is_active, start_date, end_date,
  created_by, created_at
)
VALUES
  (
    'd0000000-0000-4000-8000-000000000001',
    'reto',
    'Reto 7 días de gratitud',
    'Durante 7 días consecutivos, cultivarás el hábito de la gratitud con ejercicios prácticos que transformarán tu perspectiva y tu energía.',
    NULL, 'free', NULL,
    'published', NULL, true, NULL, NULL,
    'a0000000-0000-4000-8000-000000000001',
    '2026-01-05T10:00:00.000Z'
  ),
  (
    'd0000000-0000-4000-8000-000000000002',
    'program',
    'Programa de 30 días: Despertar consciente',
    'Un viaje de 30 días para construir una rutina matutina poderosa. Cada día incluye meditación, movimiento y reflexión guiada.',
    NULL, 'free', NULL,
    'published', 'carlotta', true, '2026-02-01', '2026-03-02',
    'a0000000-0000-4000-8000-000000000001',
    '2026-01-20T08:00:00.000Z'
  ),
  (
    'd0000000-0000-4000-8000-000000000003',
    'bootcamp',
    'Bootcamp: Liderazgo interior',
    'Un bootcamp intensivo de 14 días para desarrollar tu liderazgo desde adentro. Incluye sesiones en vivo, ejercicios prácticos y comunidad de apoyo.',
    'bootcamp_liderazgo', 'core', NULL,
    'published', 'gabriel', true, '2026-03-01', '2026-03-14',
    'a0000000-0000-4000-8000-000000000002',
    '2026-02-10T14:00:00.000Z'
  ),
  (
    'd0000000-0000-4000-8000-000000000004',
    'reto',
    'Reto 15 días: Desconexión digital',
    'Recupera tu atención y tu tiempo. Durante 15 días te guiaremos para crear una relación más sana con la tecnología.',
    NULL, 'free', NULL,
    'published', 'conjunta', true, NULL, NULL,
    'a0000000-0000-4000-8000-000000000001',
    '2026-02-01T09:00:00.000Z'
  ),
  (
    'd0000000-0000-4000-8000-000000000005',
    'program',
    'Programa de 21 días: Manejo del estrés',
    'Aprende técnicas comprobadas para gestionar el estrés y convertirlo en tu aliado. Meditaciones, respiraciones y micro-hábitos.',
    NULL, 'free', NULL,
    'draft', NULL, false, NULL, NULL,
    'a0000000-0000-4000-8000-000000000002',
    '2026-02-18T11:00:00.000Z'
  );


-- ── 10. Program days ─────────────────────────────────────────────────────────

INSERT INTO public.program_days (id, program_id, day_index, title, description)
VALUES
  -- Reto 7 días de gratitud (prog-001) — 7 days
  ('d1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 1, 'Día 1: Abre los ojos con gratitud',        'Antes de levantarte, piensa en 3 cosas por las que estás agradecido/a.'),
  ('d1000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 2, 'Día 2: Carta de agradecimiento',            'Escribe una breve carta de agradecimiento a alguien importante en tu vida.'),
  ('d1000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 3, 'Día 3: Gratitud por lo difícil',            'Encuentra algo positivo en una situación reciente que te retó.'),
  ('d1000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 4, 'Día 4: Gratitud sensorial',                 'Agradece algo que puedes ver, oír, tocar, oler y saborear.'),
  ('d1000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001', 5, 'Día 5: Gratitud hacia ti',                  'Reconoce tres cualidades tuyas que aprecias. Mereces tu propia gratitud.'),
  ('d1000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000001', 6, 'Día 6: Gratitud en movimiento',             'Durante una caminata de 10 minutos, nombra en silencio cosas que agradeces.'),
  ('d1000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000001', 7, 'Día 7: Ritual de gratitud',                 'Crea tu propio ritual de gratitud que puedas mantener más allá del reto.'),
  -- Despertar consciente (prog-002) — first 5 days
  ('d1000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000002', 1, 'Día 1: Tu primer despertar consciente',     'Hoy estableces la base: respirar, agradecer y moverte con intención.'),
  ('d1000000-0000-4000-8000-000000000009', 'd0000000-0000-4000-8000-000000000002', 2, 'Día 2: Meditación de 5 minutos',            'Introduce una meditación corta a tu mañana. Solo 5 minutos bastan para empezar.'),
  ('d1000000-0000-4000-8000-000000000010', 'd0000000-0000-4000-8000-000000000002', 3, 'Día 3: Journaling matutino',                'Escribe 3 intenciones para el día y 1 cosa que quieres soltar.'),
  ('d1000000-0000-4000-8000-000000000011', 'd0000000-0000-4000-8000-000000000002', 4, 'Día 4: Movimiento consciente',              'Activa tu cuerpo con 5 minutos de estiramientos y respiración.'),
  ('d1000000-0000-4000-8000-000000000012', 'd0000000-0000-4000-8000-000000000002', 5, 'Día 5: Revisión de la semana',              'Reflexiona sobre los primeros días. ¿Qué has notado diferente?'),
  -- Bootcamp: Liderazgo interior (prog-003) — first 3 days
  ('d1000000-0000-4000-8000-000000000013', 'd0000000-0000-4000-8000-000000000003', 1, 'Día 1: ¿Quién eres como líder?',            'Autoevaluación profunda de tu estilo de liderazgo y tus valores.'),
  ('d1000000-0000-4000-8000-000000000014', 'd0000000-0000-4000-8000-000000000003', 2, 'Día 2: Liderazgo desde la vulnerabilidad',  'Aprende por qué los líderes más fuertes son los que se atreven a ser vulnerables.'),
  ('d1000000-0000-4000-8000-000000000015', 'd0000000-0000-4000-8000-000000000003', 3, 'Día 3: Comunicación auténtica',             'Herramientas prácticas para comunicarte con claridad, empatía y poder.');


-- ── 11. Program day items ────────────────────────────────────────────────────

INSERT INTO public.program_day_items (id, program_day_id, content_item_id, type, position)
VALUES
  -- Reto gratitud - Día 1
  ('d2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'content', 0),
  ('d2000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000006', 'content', 1),
  -- Reto gratitud - Día 2
  ('d2000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000006', 'content', 0),
  -- Reto gratitud - Día 6
  ('d2000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000006', 'c2000000-0000-4000-8000-000000000004', 'content', 0),
  -- Despertar consciente - Día 1
  ('d2000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000008', 'c2000000-0000-4000-8000-000000000002', 'content', 0),
  ('d2000000-0000-4000-8000-000000000006', 'd1000000-0000-4000-8000-000000000008', 'c2000000-0000-4000-8000-000000000001', 'content', 1),
  -- Despertar consciente - Día 2
  ('d2000000-0000-4000-8000-000000000007', 'd1000000-0000-4000-8000-000000000009', 'c2000000-0000-4000-8000-000000000001', 'content', 0),
  -- Despertar consciente - Día 3
  ('d2000000-0000-4000-8000-000000000008', 'd1000000-0000-4000-8000-000000000010', 'c2000000-0000-4000-8000-000000000006', 'content', 0),
  -- Despertar consciente - Día 4
  ('d2000000-0000-4000-8000-000000000009', 'd1000000-0000-4000-8000-000000000011', 'c2000000-0000-4000-8000-000000000002', 'content', 0),
  -- Bootcamp - Día 1
  ('d2000000-0000-4000-8000-000000000010', 'd1000000-0000-4000-8000-000000000013', 'c2000000-0000-4000-8000-000000000005', 'content', 0),
  ('d2000000-0000-4000-8000-000000000011', 'd1000000-0000-4000-8000-000000000013', 'c2000000-0000-4000-8000-000000000006', 'content', 1),
  -- Bootcamp - Día 2
  ('d2000000-0000-4000-8000-000000000012', 'd1000000-0000-4000-8000-000000000014', 'c2000000-0000-4000-8000-000000000008', 'content', 0);


-- ── 12. Program enrollments ──────────────────────────────────────────────────

INSERT INTO public.program_enrollments (id, program_id, user_id, status, enrolled_at)
VALUES
  ('d3000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'active',    '2026-02-17T08:00:00.000Z'),
  ('d3000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'active',    '2026-02-01T07:00:00.000Z'),
  ('d3000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'completed', '2026-01-10T09:00:00.000Z'),
  ('d3000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'active',    '2026-02-15T12:00:00.000Z'),
  ('d3000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', 'cancelled', '2026-02-05T10:00:00.000Z');


-- ── 13. Program checkins ─────────────────────────────────────────────────────

INSERT INTO public.program_checkins (id, program_id, user_id, day_index, payload, created_at)
VALUES
  (
    'd4000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    1,
    '{"gratitude_items": ["Mi familia", "Un buen café", "Salud"]}'::jsonb,
    '2026-02-17T08:30:00.000Z'
  ),
  (
    'd4000000-0000-4000-8000-000000000002',
    'd0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    2,
    '{"letter_written": true, "recipient": "Mi mamá"}'::jsonb,
    '2026-02-18T07:45:00.000Z'
  ),
  (
    'd4000000-0000-4000-8000-000000000003',
    'd0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    3,
    '{"challenge": "Discusión en el trabajo", "positive_takeaway": "Aprendí a poner límites"}'::jsonb,
    '2026-02-19T08:10:00.000Z'
  ),
  (
    'd4000000-0000-4000-8000-000000000004',
    'd0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    1,
    '{"completed_meditation": true, "completed_movement": true, "reflection": "Me sentí en paz"}'::jsonb,
    '2026-02-01T07:30:00.000Z'
  ),
  (
    'd4000000-0000-4000-8000-000000000005',
    'd0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    2,
    '{"completed_meditation": true, "duration_minutes": 5}'::jsonb,
    '2026-02-02T07:20:00.000Z'
  );


-- ── 14. Daily plans ──────────────────────────────────────────────────────────
-- primary_action_ref is uuid; for 'custom' type where ref is null we use NULL

INSERT INTO public.daily_plans (
  id, date, community_segment, title, message,
  badge_share_text, badge_title, badge_subtitle,
  primary_action_type, primary_action_ref, primary_action_payload,
  status, created_by
)
VALUES
  -- dp-001: Today global
  (
    'e0000000-0000-4000-8000-000000000001',
    '2026-02-24', NULL,
    'Tu momento de hoy',
    'Buenos días. Hoy te invitamos a pausar, respirar y reconectarte contigo. Completa la meditación matutina y registra tu check-in.',
    'Hoy pause, respire y me reconecte conmigo. #TuPotencial',
    NULL, NULL,
    'content', 'c2000000-0000-4000-8000-000000000001', '{}'::jsonb,
    'published', 'a0000000-0000-4000-8000-000000000001'
  ),
  -- dp-002: Today carlotta
  (
    'e0000000-0000-4000-8000-000000000002',
    '2026-02-24', 'carlotta',
    'Carlotta: Despertar con intención',
    'Hola, comunidad Carlotta. Hoy tu reto es dedicar 5 minutos a la rutina energizante antes de revisar tu teléfono. ¿Te atreves?',
    'Hoy desperte con intencion y energia. #Carlotta #TuPotencial',
    NULL, NULL,
    'content', 'c2000000-0000-4000-8000-000000000002', '{}'::jsonb,
    'published', 'a0000000-0000-4000-8000-000000000001'
  ),
  -- dp-003: Today gabriel
  (
    'e0000000-0000-4000-8000-000000000003',
    '2026-02-24', 'gabriel',
    'Gabriel: Respira y lidera',
    'Comunidad Gabriel, el liderazgo empieza por dentro. Hoy practica la respiración 4-7-8 antes de tu primera junta o actividad importante.',
    'Hoy respire con intencion antes de liderar. #Gabriel #TuPotencial',
    NULL, NULL,
    'content', 'c2000000-0000-4000-8000-000000000003', '{}'::jsonb,
    'published', 'a0000000-0000-4000-8000-000000000002'
  ),
  -- dp-004: Yesterday global
  (
    'e0000000-0000-4000-8000-000000000004',
    '2026-02-23', NULL,
    'Domingo de reflexión',
    'Es domingo. Un buen día para hacer una pausa más larga. Te dejamos un ejercicio de journaling para cerrar la semana con claridad.',
    NULL,
    NULL, NULL,
    'content', 'c2000000-0000-4000-8000-000000000006', '{}'::jsonb,
    'published', 'a0000000-0000-4000-8000-000000000001'
  ),
  -- dp-005: 2 days ago global
  (
    'e0000000-0000-4000-8000-000000000005',
    '2026-02-22', NULL,
    'Sábado de visualización',
    'Cierra los ojos por 15 minutos y visualiza tu mejor versión. ¿Cómo se ve? ¿Qué siente? ¿Qué hace diferente?',
    'Hoy visualice mi mejor version. #TuPotencial',
    NULL, NULL,
    'content', 'c2000000-0000-4000-8000-000000000005', '{}'::jsonb,
    'published', 'a0000000-0000-4000-8000-000000000001'
  ),
  -- dp-006: 3 days ago global (custom action)
  (
    'e0000000-0000-4000-8000-000000000006',
    '2026-02-21', NULL,
    'Viernes: Micro-hábito del día',
    'Hoy tu único reto es: en algún momento del día, detente por 60 segundos y observa tu respiración sin cambiarla. Solo observa.',
    'Hoy observe mi respiracion por 60 segundos. Pequeños momentos, grandes cambios. #TuPotencial',
    NULL, NULL,
    'custom', NULL,
    '{"label": "Observar mi respiración por 60 segundos", "type": "simple_check", "prompt": "¿Completaste tu momento de observación hoy?"}'::jsonb,
    'published', 'a0000000-0000-4000-8000-000000000002'
  ),
  -- dp-007: Scheduled for tomorrow
  (
    'e0000000-0000-4000-8000-000000000007',
    '2026-02-25', NULL,
    'Martes: Nuevo comienzo',
    'Cada día es una nueva oportunidad. Hoy comienza con la meditación nocturna... pero por la mañana. Experimenta cómo se siente soltar antes de empezar.',
    NULL,
    NULL, NULL,
    'content', 'c2000000-0000-4000-8000-000000000004', '{}'::jsonb,
    'scheduled', 'a0000000-0000-4000-8000-000000000001'
  );


-- ── 15. Daily checkins ───────────────────────────────────────────────────────

INSERT INTO public.daily_checkins (id, date, user_id, payload, created_at)
VALUES
  (
    'e1000000-0000-4000-8000-000000000001',
    '2026-02-21',
    'a0000000-0000-4000-8000-000000000001',
    '{"completed": true, "reflection": "Lo hice durante mi descanso del trabajo. Me di cuenta de que estaba conteniendo la respiración."}'::jsonb,
    '2026-02-21T15:30:00.000Z'
  ),
  (
    'e1000000-0000-4000-8000-000000000002',
    '2026-02-22',
    'a0000000-0000-4000-8000-000000000001',
    '{"completed": true, "reflection": "Me vi siendo más paciente con mi familia. Esa es mi mejor versión."}'::jsonb,
    '2026-02-22T08:15:00.000Z'
  ),
  (
    'e1000000-0000-4000-8000-000000000003',
    '2026-02-23',
    'a0000000-0000-4000-8000-000000000001',
    '{"completed": true, "journal_entries": ["Agradezco este tiempo para mí.", "Quiero soltar la necesidad de control.", "Hoy quiero ser más amable conmigo."]}'::jsonb,
    '2026-02-23T09:00:00.000Z'
  ),
  (
    'e1000000-0000-4000-8000-000000000004',
    '2026-02-23',
    'a0000000-0000-4000-8000-000000000002',
    '{"completed": true, "mood": "tranquilo"}'::jsonb,
    '2026-02-23T10:30:00.000Z'
  ),
  (
    'e1000000-0000-4000-8000-000000000005',
    '2026-02-24',
    'a0000000-0000-4000-8000-000000000003',
    '{"completed": true, "reflection": "La meditación me ayudó a centrarme antes del día."}'::jsonb,
    '2026-02-24T07:45:00.000Z'
  );


-- ── 16. User streaks ─────────────────────────────────────────────────────────

INSERT INTO public.user_streaks (user_id, current_streak, best_streak, last_checkin_date, updated_at)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 3, 12, '2026-02-23', '2026-02-23T09:00:00.000Z'),
  ('a0000000-0000-4000-8000-000000000002', 1,  7, '2026-02-23', '2026-02-23T10:30:00.000Z'),
  ('a0000000-0000-4000-8000-000000000003', 5,  5, '2026-02-24', '2026-02-24T07:45:00.000Z'),
  ('a0000000-0000-4000-8000-000000000004', 0,  3, '2026-02-10', '2026-02-10T08:00:00.000Z'),
  ('a0000000-0000-4000-8000-000000000005', 0,  0, NULL,          '2026-02-01T07:00:00.000Z');


-- ── 17. Posts ────────────────────────────────────────────────────────────────

INSERT INTO public.posts (id, author_user_id, is_official, community_segment, title, body, media_url, status, created_at)
VALUES
  (
    'f0000000-0000-4000-8000-000000000001',
    NULL, true, 'gabriel',
    'Bienvenidos a la comunidad Tu Potencial',
    $$Este es un espacio seguro para crecer juntos. Comparte tus experiencias, aprendizajes y reflexiones. Recuerda: todos estamos en un camino de transformación. No hay respuestas correctas ni incorrectas, solo honestidad y apoyo mutuo.

¡Nos da mucho gusto tenerte aquí!$$,
    NULL,
    'published',
    '2026-01-01T12:00:00.000Z'
  ),
  (
    'f0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003', false, 'carlotta',
    NULL,
    'Llevo 5 días seguidos haciendo mi check-in matutino y no puedo creer la diferencia. Me siento más centrada y con más energía para enfrentar el día. ¿A alguien más le ha pasado que al principio cuesta pero luego se vuelve algo que necesitas?',
    NULL,
    'published',
    '2026-02-20T14:30:00.000Z'
  ),
  (
    'f0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000002', false, 'gabriel',
    'Mi experiencia con la respiración 4-7-8',
    $$Acabo de terminar el ejercicio de respiración 4-7-8 y quiero compartir algo: la primera vez que lo intenté me pareció raro, como que no "sentía" nada. Pero hoy, en la tercera vez, algo hizo clic. Sentí cómo mi cuerpo se relajó de verdad por primera vez en semanas. Si estás empezando y no sientes mucho, dale tiempo. Vale la pena.$$,
    NULL,
    'published',
    '2026-02-21T09:15:00.000Z'
  ),
  (
    'f0000000-0000-4000-8000-000000000004',
    NULL, true, 'carlotta',
    'Nuevo reto: 7 días de gratitud',
    $$¡Comunidad Carlotta! Estamos lanzando el Reto de 7 días de gratitud. Cada día recibirás un ejercicio diferente para cultivar el agradecimiento en tu vida. Es gratuito, es corto, y puede cambiar tu perspectiva.

Inscríbete desde la sección de Retos. ¡Empezamos el lunes!$$,
    'https://picsum.photos/seed/gratitude-challenge/800/400',
    'published',
    '2026-02-22T08:00:00.000Z'
  ),
  (
    'f0000000-0000-4000-8000-000000000005',
    'a0000000-0000-4000-8000-000000000005', false, 'carlotta',
    NULL,
    'Hoy creé mi espacio sagrado en casa siguiendo la guía de la biblioteca. Solo un rincón con un cojín, una vela y mi cuaderno. Pero se siente diferente. Es MÍO. Ya quiero hacer mi práctica de mañana ahí.',
    'https://picsum.photos/seed/sacred-space-photo/800/600',
    'published',
    '2026-02-23T16:45:00.000Z'
  ),
  (
    'f0000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000004', false, 'gabriel',
    'Pregunta para la comunidad',
    '¿Alguien más siente que le cuesta mantener la constancia? Empiezo muy motivado pero a la semana ya se me olvidó. ¿Qué trucos les han funcionado para no perder el hábito?',
    NULL,
    'published',
    '2026-02-24T10:00:00.000Z'
  ),
  (
    'f0000000-0000-4000-8000-000000000007',
    'a0000000-0000-4000-8000-000000000001', false, 'carlotta',
    NULL,
    'Hoy descubrí que la meditación nocturna también funciona increíble por la mañana. Soltar antes de empezar el día es una sensación diferente pero muy poderosa. ¿Alguien más ha experimentado con cambiar el horario de las prácticas?',
    NULL,
    'draft',
    '2026-02-24T07:00:00.000Z'
  );


-- ── 18. Post comments ────────────────────────────────────────────────────────

INSERT INTO public.post_comments (id, post_id, user_id, body, status, created_at)
VALUES
  (
    'f1000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    '¡Qué increíble, Sofía! A mí me pasó exactamente lo mismo. Los primeros 3 días fueron difíciles pero ahora es lo primero que hago al despertar. ¡Sigue así!',
    'published',
    '2026-02-20T15:00:00.000Z'
  ),
  (
    'f1000000-0000-4000-8000-000000000002',
    'f0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000005',
    'Yo apenas llevo 2 días pero leer esto me motiva mucho. Gracias por compartir.',
    'published',
    '2026-02-20T16:30:00.000Z'
  ),
  (
    'f1000000-0000-4000-8000-000000000003',
    'f0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000004',
    $$Totalmente de acuerdo. La primera vez pensé "esto no es para mí" pero después de una semana ya no puedo dejar de hacerlo. La clave es la paciencia.$$,
    'published',
    '2026-02-21T10:00:00.000Z'
  ),
  (
    'f1000000-0000-4000-8000-000000000004',
    'f0000000-0000-4000-8000-000000000005',
    'a0000000-0000-4000-8000-000000000001',
    '¡Se ve hermoso! Yo también seguí esa guía y me encanta mi rincón. El truco de las 3 respiraciones antes de empezar es clave.',
    'published',
    '2026-02-23T17:15:00.000Z'
  ),
  (
    'f1000000-0000-4000-8000-000000000005',
    'f0000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000003',
    'A mí lo que me funciona es asociar el hábito con algo que ya hago. Por ejemplo: medito justo después de lavarme los dientes. Así mi cerebro ya lo tiene como parte de la rutina.',
    'published',
    '2026-02-24T10:30:00.000Z'
  ),
  (
    'f1000000-0000-4000-8000-000000000006',
    'f0000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000002',
    'Las rachas ayudan mucho. Cuando ves que llevas 5 días seguidos, no quieres romperla. También el apoyo de esta comunidad hace la diferencia.',
    'published',
    '2026-02-24T11:15:00.000Z'
  ),
  (
    'f1000000-0000-4000-8000-000000000007',
    'f0000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000005',
    '¡Yo pongo alarma y lo hago aunque sea 2 minutos. La clave no es la duración sino la constancia. ¡Ánimo, Carlos!',
    'published',
    '2026-02-24T12:00:00.000Z'
  );


-- ── 19. Post reactions ───────────────────────────────────────────────────────

INSERT INTO public.post_reactions (id, post_id, user_id, reaction, created_at)
VALUES
  -- Post 001 - Welcome
  ('f2000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'heart', '2026-01-01T12:30:00.000Z'),
  ('f2000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'heart', '2026-01-01T13:00:00.000Z'),
  ('f2000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'clap',  '2026-01-05T09:20:00.000Z'),
  ('f2000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'like',  '2026-01-20T12:00:00.000Z'),
  ('f2000000-0000-4000-8000-000000000005', 'f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'heart', '2026-02-01T07:05:00.000Z'),
  -- Post 002 - Sofia's streak
  ('f2000000-0000-4000-8000-000000000006', 'f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'fire',  '2026-02-20T14:45:00.000Z'),
  ('f2000000-0000-4000-8000-000000000007', 'f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'clap',  '2026-02-20T15:30:00.000Z'),
  ('f2000000-0000-4000-8000-000000000008', 'f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005', 'heart', '2026-02-20T16:35:00.000Z'),
  -- Post 003 - Diego's breathing
  ('f2000000-0000-4000-8000-000000000009', 'f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'like',  '2026-02-21T09:30:00.000Z'),
  ('f2000000-0000-4000-8000-000000000010', 'f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'fire',  '2026-02-21T10:05:00.000Z'),
  -- Post 004 - Gratitude challenge
  ('f2000000-0000-4000-8000-000000000011', 'f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', 'fire',  '2026-02-22T08:30:00.000Z'),
  ('f2000000-0000-4000-8000-000000000012', 'f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'clap',  '2026-02-22T09:00:00.000Z'),
  ('f2000000-0000-4000-8000-000000000013', 'f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'heart', '2026-02-22T10:00:00.000Z'),
  -- Post 005 - Sacred space
  ('f2000000-0000-4000-8000-000000000014', 'f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'heart', '2026-02-23T17:00:00.000Z'),
  ('f2000000-0000-4000-8000-000000000015', 'f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', 'fire',  '2026-02-23T18:00:00.000Z'),
  ('f2000000-0000-4000-8000-000000000016', 'f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'like',  '2026-02-23T19:00:00.000Z'),
  -- Post 006 - Carlos's question
  ('f2000000-0000-4000-8000-000000000017', 'f0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'heart', '2026-02-24T10:10:00.000Z'),
  ('f2000000-0000-4000-8000-000000000018', 'f0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'like',  '2026-02-24T10:35:00.000Z');


-- ── 20. Events ───────────────────────────────────────────────────────────────

INSERT INTO public.events (
  id, title, description, start_at, end_at,
  community_segment, requires_subscription, plan,
  duration, cover_url, entitlement_key,
  vimeo_url, vimeo_id, vimeo_live_event_id,
  status, created_at
)
VALUES
  (
    'f3000000-0000-4000-8000-000000000001',
    'Live semanal: Meditación guiada con Carlotta',
    'Únete cada miércoles a una meditación guiada en vivo con Carlotta. Este espacio es para pausar, respirar y reconectarte con tu centro. Abierto a toda la comunidad.',
    '2026-02-25T18:00:00.000Z', '2026-02-25T19:00:00.000Z',
    NULL, true, 'core',
    NULL, NULL, NULL,
    'https://vimeo.com/event/placeholder-001', 'placeholder-001', NULL,
    'published', '2026-02-18T10:00:00.000Z'
  ),
  (
    'f3000000-0000-4000-8000-000000000002',
    'Taller especial: Manejo de estrés en el trabajo',
    'Un taller práctico de 90 minutos donde aprenderás técnicas para gestionar el estrés laboral, establecer límites saludables y mantener tu energía a lo largo del día. Incluye ejercicios de respiración, meditación rápida y herramientas de journaling.',
    '2026-03-01T17:00:00.000Z', '2026-03-01T18:30:00.000Z',
    'gabriel', true, 'core',
    NULL, NULL, NULL,
    'https://vimeo.com/event/placeholder-002', 'placeholder-002', NULL,
    'published', '2026-02-20T09:00:00.000Z'
  ),
  (
    'f3000000-0000-4000-8000-000000000003',
    'Sesión Q&A: Pregúntale a Carlotta y Gabriel',
    'Una sesión abierta de preguntas y respuestas con Carlotta y Gabriel. Trae tus dudas sobre las prácticas, los programas, o cualquier tema de bienestar y crecimiento personal. Espacio íntimo, máximo 50 personas.',
    '2026-03-05T19:00:00.000Z', '2026-03-05T20:00:00.000Z',
    NULL, true, 'core',
    NULL, NULL, NULL,
    'https://vimeo.com/event/placeholder-003', 'placeholder-003', NULL,
    'published', '2026-02-22T14:00:00.000Z'
  ),
  (
    'f3000000-0000-4000-8000-000000000004',
    'Masterclass: Liderazgo consciente (Bootcamp preview)',
    'Una muestra del Bootcamp de Liderazgo Interior. En esta masterclass de 60 minutos, Gabriel comparte los fundamentos del liderazgo consciente y por qué la vulnerabilidad es tu mayor fortaleza como líder.',
    '2026-03-10T18:00:00.000Z', '2026-03-10T19:00:00.000Z',
    'gabriel', false, 'free',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    'draft', '2026-02-24T08:00:00.000Z'
  ),
  (
    'f3000000-0000-4000-8000-000000000005',
    'Live semanal: Meditación guiada con Carlotta',
    'Sesión pasada de la meditación semanal guiada. Disponible para ver en replay.',
    '2026-02-18T18:00:00.000Z', '2026-02-18T19:00:00.000Z',
    NULL, true, 'core',
    NULL, NULL, NULL,
    'https://vimeo.com/event/placeholder-005', 'placeholder-005', NULL,
    'published', '2026-02-11T10:00:00.000Z'
  ),
  (
    'f3000000-0000-4000-8000-000000000006',
    'Círculo de mujeres: Soltar para avanzar',
    'Un espacio seguro y sagrado para la comunidad Carlotta. En este círculo hablamos de lo que necesitamos soltar para seguir creciendo. Replay disponible por tiempo limitado.',
    '2026-02-12T19:00:00.000Z', '2026-02-12T20:30:00.000Z',
    'carlotta', true, 'core',
    NULL, NULL, NULL,
    'https://vimeo.com/event/placeholder-006', 'placeholder-006', NULL,
    'published', '2026-02-05T11:00:00.000Z'
  ),
  (
    'f3000000-0000-4000-8000-000000000007',
    'Taller: Introducción al journaling consciente',
    'Un taller práctico donde aprendiste las bases del journaling como herramienta de autoconocimiento. Incluye plantillas descargables.',
    '2026-02-08T17:00:00.000Z', '2026-02-08T18:30:00.000Z',
    NULL, true, 'core',
    NULL, NULL, NULL,
    'https://vimeo.com/event/placeholder-007', 'placeholder-007', NULL,
    'published', '2026-02-01T09:00:00.000Z'
  );


-- ── 21. Event registrations ──────────────────────────────────────────────────

INSERT INTO public.event_registrations (id, event_id, user_id, status, created_at)
VALUES
  ('fd000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'registered', '2026-02-19T08:00:00.000Z'),
  ('fd000000-0000-4000-8000-000000000002', 'f3000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'registered', '2026-02-21T09:00:00.000Z'),
  ('fd000000-0000-4000-8000-000000000003', 'f3000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'registered', '2026-02-23T10:00:00.000Z'),
  ('fd000000-0000-4000-8000-000000000004', 'f3000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'registered', '2026-02-21T10:00:00.000Z'),
  ('fd000000-0000-4000-8000-000000000005', 'f3000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'registered', '2026-02-23T11:00:00.000Z'),
  ('fd000000-0000-4000-8000-000000000006', 'f3000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'registered', '2026-02-19T12:00:00.000Z'),
  ('fd000000-0000-4000-8000-000000000007', 'f3000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'registered', '2026-02-23T12:00:00.000Z'),
  ('fd000000-0000-4000-8000-000000000008', 'f3000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'registered', '2026-02-20T07:00:00.000Z');


-- ── 22. Benefits ─────────────────────────────────────────────────────────────

INSERT INTO public.benefits (id, title, description, url, utm_template, code, cover_url, plan, status, position, created_at)
VALUES
  (
    'f4000000-0000-4000-8000-000000000001',
    'Descuento en retiros',
    '20% de descuento en todos los retiros presenciales organizados por Tu Potencial. Aplica para retiros en México durante 2026. Presenta tu código al momento de la reservación.',
    'https://tupotencial.app/retiros',
    'utm_source=app&utm_medium=benefits&utm_campaign=retiros_2026',
    'RETIRO20',
    'https://images.tupotencial.app/benefits/retiros.jpg',
    'core', 'active', 0,
    '2026-01-10T10:00:00.000Z'
  ),
  (
    'f4000000-0000-4000-8000-000000000002',
    'Acceso a comunidad VIP',
    'Únete al grupo privado de WhatsApp donde compartimos contenido exclusivo, prácticas extra y la posibilidad de interactuar directamente con Carlotta y Gabriel.',
    'https://chat.whatsapp.com/placeholder-vip-community',
    NULL,
    NULL,
    'https://images.tupotencial.app/benefits/comunidad-vip.jpg',
    'core', 'active', 1,
    '2026-01-10T10:05:00.000Z'
  ),
  (
    'f4000000-0000-4000-8000-000000000003',
    '15% en tienda de bienestar',
    'Descuento exclusivo del 15% en la tienda en línea de nuestro aliado Bienestar MX. Incluye inciensos, cojines de meditación, aceites esenciales y más.',
    'https://bienestar-mx.example.com/tienda',
    'utm_source=tupotencial&utm_medium=partner&utm_campaign=bienestar_mx',
    'TUPOTENCIAL15',
    'https://images.tupotencial.app/benefits/bienestar-mx.jpg',
    'free', 'active', 2,
    '2026-01-15T08:00:00.000Z'
  ),
  (
    'f4000000-0000-4000-8000-000000000004',
    'Clase gratuita de yoga restaurativo',
    'Accede a una clase presencial gratuita de yoga restaurativo en cualquier sucursal de Yoga Flow CDMX. Válido una vez por miembro. Menciona que eres miembro de Tu Potencial.',
    'https://yogaflow.example.com/clase-gratis',
    'utm_source=tupotencial&utm_medium=partner&utm_campaign=yogaflow_free',
    'TPYOGA',
    'https://images.tupotencial.app/benefits/yogaflow.jpg',
    'free', 'active', 3,
    '2026-02-01T09:00:00.000Z'
  ),
  (
    'f4000000-0000-4000-8000-000000000005',
    'Plantillas de journaling descargables',
    'Descarga gratis nuestro kit de 12 plantillas de journaling en PDF. Incluye plantillas para gratitud, reflexión semanal, intenciones y más.',
    'https://tupotencial.app/recursos/plantillas-journaling',
    'utm_source=app&utm_medium=benefits&utm_campaign=journaling_templates',
    NULL,
    'https://images.tupotencial.app/benefits/journaling.jpg',
    'core', 'active', 4,
    '2026-02-10T12:00:00.000Z'
  ),
  (
    'f4000000-0000-4000-8000-000000000006',
    'Descuento en sesiones 1:1 con coach',
    'Próximamente: 30% de descuento en sesiones individuales de coaching con coaches certificados de Tu Potencial.',
    'https://tupotencial.app/coaching',
    NULL,
    NULL,
    NULL,
    'core', 'inactive', 5,
    '2026-02-20T14:00:00.000Z'
  );


-- ── 23. Benefit clicks ───────────────────────────────────────────────────────

INSERT INTO public.benefit_clicks (id, benefit_id, user_id, meta, created_at)
VALUES
  (
    'f5000000-0000-4000-8000-000000000001',
    'f4000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    '{"utm_source": "app", "utm_medium": "benefits", "utm_campaign": "retiros_2026", "platform": "ios"}'::jsonb,
    '2026-02-15T14:00:00.000Z'
  ),
  (
    'f5000000-0000-4000-8000-000000000002',
    'f4000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003',
    '{"platform": "android"}'::jsonb,
    '2026-02-18T09:30:00.000Z'
  ),
  (
    'f5000000-0000-4000-8000-000000000003',
    'f4000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    '{"utm_source": "tupotencial", "utm_medium": "partner", "utm_campaign": "bienestar_mx", "platform": "web"}'::jsonb,
    '2026-02-20T11:00:00.000Z'
  ),
  (
    'f5000000-0000-4000-8000-000000000004',
    'f4000000-0000-4000-8000-000000000005',
    'a0000000-0000-4000-8000-000000000002',
    '{"utm_source": "app", "utm_medium": "benefits", "utm_campaign": "journaling_templates", "platform": "ios"}'::jsonb,
    '2026-02-22T16:00:00.000Z'
  ),
  (
    'f5000000-0000-4000-8000-000000000005',
    'f4000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000005',
    '{"utm_source": "tupotencial", "utm_medium": "partner", "utm_campaign": "yogaflow_free", "platform": "android"}'::jsonb,
    '2026-02-23T08:00:00.000Z'
  );


-- ── 24. Addons ───────────────────────────────────────────────────────────────

INSERT INTO public.addons (id, title, description, cover_url, price, plan, grants_core_months, stripe_price_id, status, created_at)
VALUES
  (
    'f6000000-0000-4000-8000-000000000001',
    'Mentoría grupal mensual',
    'Sesión grupal de mentoría de 90 minutos una vez al mes con Carlotta o Gabriel. Máximo 15 participantes por sesión.',
    '/images/lib-4.jpg',
    149900, 'core', NULL, NULL, 'active',
    '2026-01-01T10:00:00.000Z'
  ),
  (
    'f6000000-0000-4000-8000-000000000002',
    'Módulo VIP: Liderazgo avanzado',
    '12 lecciones exclusivas de liderazgo avanzado + material descargable y ejercicios prácticos.',
    '/images/lib-8.jpg',
    79900, 'core', NULL, NULL, 'active',
    '2026-01-01T10:05:00.000Z'
  ),
  (
    'f6000000-0000-4000-8000-000000000003',
    'Bootcamp: Liderazgo Interior',
    'Acceso completo al bootcamp intensivo de 14 días. Incluye sesiones en vivo, materiales exclusivos y certificado.',
    '/images/lib-6.jpg',
    299900, 'todos', 3, NULL, 'active',
    '2026-02-01T08:00:00.000Z'
  ),
  (
    'f6000000-0000-4000-8000-000000000004',
    'Sesión 1:1 con coach certificado',
    'Una sesión individual de 60 minutos con un coach certificado de Tu Potencial. Personalizada a tus necesidades.',
    '/images/lib-3.jpg',
    249900, 'todos', 1, NULL, 'active',
    '2026-02-10T09:00:00.000Z'
  ),
  (
    'f6000000-0000-4000-8000-000000000005',
    'Retiro presencial: Reconexión (marzo 2026)',
    'Retiro de fin de semana en Valle de Bravo. Incluye hospedaje, alimentación, sesiones de meditación y yoga.',
    '/images/lib-5.jpg',
    899900, 'todos', 3, NULL, 'inactive',
    '2026-02-15T12:00:00.000Z'
  );


-- ── 25. Addon purchases ──────────────────────────────────────────────────────

INSERT INTO public.addon_purchases (id, addon_id, user_id, stripe_session_id, amount, created_at)
VALUES
  ('f7000000-0000-4000-8000-000000000001', 'f6000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', NULL, 79900,  '2026-01-15T10:00:00.000Z'),
  ('f7000000-0000-4000-8000-000000000002', 'f6000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', NULL, 299900, '2026-02-20T11:00:00.000Z'),
  ('f7000000-0000-4000-8000-000000000003', 'f6000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', NULL, 149900, '2026-02-25T14:30:00.000Z');


-- ── 26. User entitlements ────────────────────────────────────────────────────

INSERT INTO public.user_entitlements (id, user_id, entitlement_key, source, source_ref, created_at)
VALUES
  ('fe000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'core',             'subscription', NULL, '2025-11-10T08:00:00.000Z'),
  ('fe000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'vip',              'addon',        NULL, '2026-01-15T10:00:00.000Z'),
  ('fe000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'mentoria_grupal',  'addon',        NULL, '2026-02-25T14:30:00.000Z');


-- ── 27. Subscriptions ────────────────────────────────────────────────────────

INSERT INTO public.subscriptions (id, user_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
VALUES
  ('f8000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'active',   'cus_mock_mariana',   'sub_mock_mariana_001',   '2026-03-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'),
  ('f8000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'active',   'cus_mock_diego',     'sub_mock_diego_001',     '2026-03-01T14:30:00.000Z', '2026-02-01T14:30:00.000Z'),
  ('f8000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'active',   'cus_mock_sofia',     'sub_mock_sofia_001',     '2026-03-05T09:15:00.000Z', '2026-02-05T09:15:00.000Z'),
  ('f8000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'canceled', 'cus_mock_carlos',    'sub_mock_carlos_001',    '2026-02-20T11:45:00.000Z', '2026-02-10T11:45:00.000Z'),
  ('f8000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', 'trialing', 'cus_mock_valentina', 'sub_mock_valentina_001', '2026-03-01T07:00:00.000Z', '2026-02-15T07:00:00.000Z');


-- ── 28. AI sessions ──────────────────────────────────────────────────────────

INSERT INTO public.ai_sessions (id, user_id, tone, status, created_at)
VALUES
  ('f9000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'carlotta', 'active', '2026-02-23T08:00:00.000Z'),
  ('f9000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'gabriel',  'closed', '2026-02-20T14:00:00.000Z'),
  ('f9000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'gabriel',  'active', '2026-02-24T07:30:00.000Z'),
  ('f9000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'carlotta', 'active', '2026-02-22T09:00:00.000Z'),
  ('f9000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', 'carlotta', 'closed', '2026-02-18T16:00:00.000Z');


-- ── 29. AI messages ──────────────────────────────────────────────────────────

INSERT INTO public.ai_messages (id, session_id, user_id, role, content, tokens_in, tokens_out, safety_category, created_at)
VALUES
  -- Session 001 (Mariana, Carlotta tone, active)
  (
    'fa000000-0000-4000-8000-000000000001',
    'f9000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'system',
    'Eres Carlotta, coach de bienestar y crecimiento personal en Tu Potencial. Tu tono es cálido, empático y cercano. Guías con preguntas poderosas y ofreces herramientas prácticas. No das consejo médico ni terapéutico.',
    NULL, NULL, NULL,
    '2026-02-23T08:00:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000002',
    'f9000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'user',
    'Hola Carlotta. Hoy me desperté sin ganas de nada. No sé qué me pasa, simplemente no tengo motivación.',
    42, NULL, NULL,
    '2026-02-23T08:01:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000003',
    'f9000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'assistant',
    $$Hola, Mariana. Gracias por compartir eso conmigo, se necesita valentía para reconocer cómo nos sentimos sin juzgarnos.

Primero quiero que sepas: está bien tener días así. No todos los días tienen que ser productivos ni estar llenos de energía. A veces el cuerpo y la mente piden pausa.

Me gustaría que intentemos algo juntas. ¿Puedes cerrar los ojos un momento y ponerle un color a lo que sientes? No lo pienses demasiado, solo deja que llegue. ¿Qué color es?$$,
    42, 128, NULL,
    '2026-02-23T08:01:30.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000004',
    'f9000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'user',
    'Gris. Como un gris pesado.',
    12, NULL, NULL,
    '2026-02-23T08:03:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000005',
    'f9000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'assistant',
    $$Gris pesado. Gracias por ser honesta con eso.

Ahora imagina que ese gris pesado está sentado a tu lado, como si fuera un compañero. No tienes que empujarlo ni cambiarlo. Solo reconócelo: "Hoy estás aquí conmigo y está bien".

Cuando estés lista, te voy a proponer una sola acción para hoy. No una lista, no un plan enorme. Una sola cosa pequeña que podría agregar un poquito de color a ese gris. ¿Te parece?$$,
    12, 115, NULL,
    '2026-02-23T08:03:30.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000006',
    'f9000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'user',
    '¿Sí, me parece. ¿Qué me recomiendas?',
    14, NULL, NULL,
    '2026-02-23T08:05:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000007',
    'f9000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'assistant',
    $$Tu acción de hoy: sal a caminar 10 minutos. Sin teléfono, sin audífonos, sin destino. Solo tú y tus pasos.

Mientras caminas, nota tres cosas que puedas ver, dos que puedas oír y una que puedas sentir (el viento, el sol, la textura del piso). Eso es todo.

No es para "arreglar" el gris. Es para recordarte que el mundo sigue teniendo texturas, incluso en los días pesados.

¿Podrías intentarlo hoy?$$,
    14, 112, NULL,
    '2026-02-23T08:05:30.000Z'
  ),
  -- Session 002 (Mariana, Gabriel tone, closed)
  (
    'fa000000-0000-4000-8000-000000000008',
    'f9000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'system',
    'Eres Gabriel, coach de liderazgo y desarrollo personal en Tu Potencial. Tu tono es directo, motivador y retador. Empujas con respeto y ayudas a las personas a encontrar claridad y acción. No das consejo médico ni terapéutico.',
    NULL, NULL, NULL,
    '2026-02-20T14:00:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000009',
    'f9000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'user',
    '¿Qué hago hoy?',
    8, NULL, NULL,
    '2026-02-20T14:01:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000010',
    'f9000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'assistant',
    $$Buena pregunta, Mariana. Pero antes de decirte qué hacer, dime: ¿qué es lo que *quieres* lograr hoy? No lo que deberías, no lo que alguien espera de ti. Lo que tú, desde adentro, quieres mover.

Piénsalo 30 segundos antes de responder.$$,
    8, 72, NULL,
    '2026-02-20T14:01:30.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000011',
    'f9000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'user',
    'Quiero sentirme en control de mi día, no que el día me controle a mí.',
    22, NULL, NULL,
    '2026-02-20T14:03:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000012',
    'f9000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'assistant',
    $$Eso es claridad. "No que el día me controle a mí." Guarda esa frase.

Aquí va tu plan de 5 minutos:

1. **Escribe las 3 cosas más importantes** que necesitas hacer hoy. Solo 3.
2. **Pon la más difícil primero.** Es en la mañana cuando tienes más energía y voluntad.
3. **Bloquea 25 minutos** sin distracciones para esa primera tarea. Teléfono en silencio, notificaciones apagadas.

Eso es tomar el control. No es planear todo el día, es decidir qué haces *primero*.

¿Cuáles son tus 3 cosas?$$,
    22, 135, NULL,
    '2026-02-20T14:03:30.000Z'
  ),
  -- Session 003 (Diego, Gabriel tone, active)
  (
    'fa000000-0000-4000-8000-000000000013',
    'f9000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000002',
    'system',
    'Eres Gabriel, coach de liderazgo y desarrollo personal en Tu Potencial. Tu tono es directo, motivador y retador. Empujas con respeto y ayudas a las personas a encontrar claridad y acción. No das consejo médico ni terapéutico.',
    NULL, NULL, NULL,
    '2026-02-24T07:30:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000014',
    'f9000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000002',
    'user',
    'Ayúdame a reflexionar sobre mi semana.',
    12, NULL, NULL,
    '2026-02-24T07:31:00.000Z'
  ),
  (
    'fa000000-0000-4000-8000-000000000015',
    'f9000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000002',
    'assistant',
    $$Vamos, Diego. Reflexionar es un acto de liderazgo contigo mismo.

Responde rápido, sin pensarlo demasiado:

1. ¿Cuál fue tu mayor logro esta semana? (puede ser pequeño)
2. ¿Qué fue lo más difícil?
3. ¿Qué aprendiste de eso difícil?

Sé honesto. No hay respuesta incorrecta, solo la tuya.$$,
    12, 88, NULL,
    '2026-02-24T07:31:30.000Z'
  );


-- ── 30. AI quotas ────────────────────────────────────────────────────────────

INSERT INTO public.ai_quotas (user_id, day, messages_used, tokens_used)
VALUES
  ('a0000000-0000-4000-8000-000000000001', '2026-02-23', 4, 345),
  ('a0000000-0000-4000-8000-000000000001', '2026-02-24', 0, 0),
  ('a0000000-0000-4000-8000-000000000002', '2026-02-24', 1, 100),
  ('a0000000-0000-4000-8000-000000000003', '2026-02-22', 6, 520),
  ('a0000000-0000-4000-8000-000000000005', '2026-02-18', 3, 280);


-- ── 31. Form submissions ─────────────────────────────────────────────────────

INSERT INTO public.form_submissions (id, form_id, user_id, answers, created_at)
VALUES
  (
    'fc000000-0000-4000-8000-000000000001',
    'fb000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    '{"satisfaction": 5, "improvement": "Más contenido de meditación", "most_used": "Meditaciones"}'::jsonb,
    '2026-02-20T10:00:00.000Z'
  ),
  (
    'fc000000-0000-4000-8000-000000000002',
    'fb000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000003',
    '{"satisfaction": 4, "improvement": "", "most_used": "Comunidad"}'::jsonb,
    '2026-02-21T15:00:00.000Z'
  ),
  (
    'fc000000-0000-4000-8000-000000000003',
    'fb000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    '{"nombre": "Mariana López", "email": "mariana.lopez@example.com", "restriccion": "Vegetariano", "notas": "Llego el viernes por la noche"}'::jsonb,
    '2026-02-22T12:00:00.000Z'
  );


-- ── 32b. Bulk seed users (69 more → 74 total, 63 active) ────────────────────
-- Users 6–74 generated via generate_series. IDs: a0000000-0000-4000-8000-0000000000XX
-- Of the 74 total: 63 active subscribers, 5 trialing, 3 canceled, 3 free (no subscription)

DO $$
DECLARE
  i int;
  uid uuid;
  email text;
  fname text;
  segment text;
  created_ts timestamptz;
  pwd text := '$2a$10$QSmHMywaHs4u/afgW18.reSnbjELxDFUhW2y3dm8yFq0sM..8coai'; -- admin123

  -- Mexican first names pool
  first_names text[] := ARRAY[
    'Alejandra','Andrés','Ana','Antonio','Beatriz','Bruno','Camila','Carolina',
    'Daniel','Diana','Eduardo','Elena','Emilio','Fernanda','Francisco','Gabriela',
    'Gustavo','Hugo','Isabel','Javier','Julia','Leonardo','Lucía','Luis',
    'Manuel','María','Martín','Miguel','Natalia','Óscar','Pablo','Patricia',
    'Rafael','Renata','Ricardo','Roberto','Rosa','Santiago','Sara','Sergio',
    'Teresa','Tomás','Valeria','Vanessa','Vicente','Ximena','Yolanda','Adriana',
    'Arturo','Claudia','Cristina','Daniela','Enrique','Esteban','Fabiola','Fernando',
    'Gloria','Héctor','Irma','Jaime','Jorge','Karen','Laura','Leticia',
    'Lorena','Marco','Mauricio','Mónica','Norma','Octavio'
  ];
  -- Mexican last names pool
  last_names text[] := ARRAY[
    'García','Hernández','López','Martínez','González','Rodríguez','Pérez','Sánchez',
    'Ramírez','Cruz','Flores','Gómez','Morales','Reyes','Gutiérrez','Ortiz',
    'Ruiz','Díaz','Torres','Vargas','Castillo','Mendoza','Aguilar','Romero',
    'Álvarez','Chávez','Rivera','Delgado','Vega','Campos','Fuentes','Guerrero',
    'Santos','Ramos','Herrera','Medina','Castro','Jiménez','Navarro','Salazar',
    'Domínguez','Moreno','Cervantes','Cortés','Pacheco','Estrada','Ibarra','Solís',
    'Villarreal','Contreras','Espinoza','Lara','Mejía','Ávila','Orozco','Figueroa',
    'Bautista','Luna','León','Velázquez','Rojas','Miranda','Ríos','Cabrera',
    'Ponce','Acosta','Núñez','Trejo','Padilla','Mora'
  ];
  segments text[] := ARRAY['gabriel','carlotta','conjunta'];
BEGIN
  FOR i IN 6..74 LOOP
    uid := ('a0000000-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid;
    fname := first_names[((i - 6) % array_length(first_names, 1)) + 1];
    email := lower(replace(fname, ' ', '')) || '.' || lower(replace(last_names[((i - 6) % array_length(last_names, 1)) + 1], ' ', '')) || i || '@example.com';
    segment := segments[((i - 1) % 3) + 1];
    created_ts := '2025-10-01'::timestamptz + ((i - 6) * interval '2 days') + (random() * interval '12 hours');

    -- auth.users
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      email, pwd, created_ts + interval '2 minutes', created_ts, created_ts + interval '30 days',
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Coerce NULLs
    UPDATE auth.users SET
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE id = uid;

    -- auth.identities
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      uid, uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', email),
      'email', created_ts + interval '2 minutes', created_ts, created_ts
    ) ON CONFLICT DO NOTHING;

    -- profiles
    INSERT INTO public.profiles (id, display_name, avatar_url, community_segment, created_at)
    VALUES (
      uid,
      fname || ' ' || last_names[((i - 6) % array_length(last_names, 1)) + 1],
      'https://i.pravatar.cc/150?u=user' || i,
      segment,
      created_ts
    ) ON CONFLICT (id) DO NOTHING;

    -- subscriptions: 63 active (users 6-68), 5 trialing (69-73), 3 canceled (74), rest free
    -- Combined with existing 5 users: total active = 3 existing + 63 new = 66...
    -- Actually: existing has 3 active + 1 canceled + 1 trialing = 5
    -- We need total 63 active out of 74. So from new users: 60 active, plus existing 3 = 63 active
    IF i <= 65 THEN
      -- 60 new active subscribers (users 6-65) + 3 existing = 63 active total
      INSERT INTO public.subscriptions (id, user_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
      VALUES (
        gen_random_uuid(), uid, 'active',
        'cus_mock_user' || i, 'sub_mock_user' || i,
        '2026-04-15'::timestamptz + (i * interval '1 day'),
        created_ts + interval '30 days'
      ) ON CONFLICT DO NOTHING;
    ELSIF i <= 68 THEN
      -- 3 trialing
      INSERT INTO public.subscriptions (id, user_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
      VALUES (
        gen_random_uuid(), uid, 'trialing',
        'cus_mock_user' || i, 'sub_mock_user' || i,
        '2026-04-01'::timestamptz + (i * interval '1 day'),
        created_ts + interval '10 days'
      ) ON CONFLICT DO NOTHING;
    ELSIF i <= 71 THEN
      -- 3 canceled
      INSERT INTO public.subscriptions (id, user_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
      VALUES (
        gen_random_uuid(), uid, 'canceled',
        'cus_mock_user' || i, 'sub_mock_user' || i,
        '2026-02-28'::timestamptz,
        created_ts + interval '20 days'
      ) ON CONFLICT DO NOTHING;
    END IF;
    -- Users 72-74: no subscription (free)

    -- user_streaks for active/trialing users
    IF i <= 68 THEN
      INSERT INTO public.user_streaks (user_id, current_streak, best_streak, last_checkin_date, updated_at)
      VALUES (
        uid,
        greatest(0, (random() * 15)::int),
        (random() * 30)::int + 1,
        CASE WHEN random() > 0.3 THEN '2026-03-25'::date - ((random() * 3)::int) ELSE '2026-03-10'::date END,
        now()
      ) ON CONFLICT (user_id) DO NOTHING;
    END IF;

  END LOOP;
END $$;


-- ── 32. App settings ─────────────────────────────────────────────────────────

INSERT INTO public.app_settings (key, value)
VALUES
  (
    'hoy_defaults',
    '{"phrase_text": "Cada día es una nueva oportunidad para cuidar de ti.", "phrase_author": "gabriel", "action_type": "talk_to_ai", "content_id": "", "form_id": "", "badge_title": "Día completado", "badge_subtitle": "Sigue así, vas genial"}'::jsonb
  ),
  (
    'hoy_recent_content',
    '{"mode": "automatic", "selected_ids": []}'::jsonb
  ),
  (
    'hoy_explore_sections',
    '{"sections": [{"id": "ai-coach", "featured": true}, {"id": "eventos", "featured": false}, {"id": "vip", "featured": false}]}'::jsonb
  ),
  (
    'biblioteca_featured',
    '{"content_id": "c2000000-0000-4000-8000-000000000003"}'::jsonb
  );
