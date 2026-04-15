-- =============================================================================
-- supabase/seed-prod.sql
-- Production seed: app defaults, one admin user, and sample content
-- NOTE: Cannot insert auth.users on hosted Supabase — use seed-prod.sh instead
--       or create the admin user via Dashboard/Auth API first.
-- =============================================================================

-- ── Usage with psql ──────────────────────────────────────────────────────────
-- 1. Create admin user steven@kigo.studio (password: potencial777) via Dashboard
-- 2. Replace ADMIN_USER_ID below with the generated UUID
-- 3. Replace STORAGE_BASE with your project's storage URL, e.g.:
--    https://geeasiskunssknfwqoko.supabase.co/storage/v1/object/public
-- 4. Upload images with seed-prod.sh or manually
-- 5. Run: psql "$DATABASE_URL" -f supabase/seed-prod.sql

-- Set these before running:
-- \set admin_user_id '''<UUID from auth>'''
-- \set storage_base '''https://YOUR_PROJECT.supabase.co/storage/v1/object/public'''

-- ── 1. Profile & Admin role ─────────────────────────────────────────────────
-- (Uncomment and set admin_user_id if running via psql)
-- INSERT INTO profiles (id, display_name)
-- VALUES (:admin_user_id, 'Steven')
-- ON CONFLICT (id) DO NOTHING;
--
-- INSERT INTO admin_users (user_id, role)
-- VALUES (:admin_user_id, 'admin')
-- ON CONFLICT (user_id) DO NOTHING;

-- ── 2. Content objectives ───────────────────────────────────────────────────
INSERT INTO content_objectives (id, title, slug, position, is_active)
VALUES ('e67daea3-67cf-4a66-bd1b-4e812f817d02', 'Reducir estrés', 'reducir-estres', 1, true)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Content categories ───────────────────────────────────────────────────
INSERT INTO content_categories (id, title, slug, description, icon_url, is_active, status, sort_order)
VALUES
('98f09c22-cf94-4f15-8587-cb5eead43afc', 'Meditaciones', 'meditaciones', null, null, true, 'active', 1),
('98f09c22-cf94-4f15-8587-cb5eead43afd', 'Eventos Grabados', 'eventos-grabados', 'Grabaciones de eventos y lives pasados.', null, true, 'active', 2)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Content items ────────────────────────────────────────────────────────
INSERT INTO content_items (
  id, type, title, subtitle, description, body,
  media_url, external_url, thumbnail_url,
  duration_seconds, entitlement_key, plan, objective_id,
  status, published_at, available_from, available_to,
  community_segment, vimeo_id
) VALUES (
  'f7951a78-e942-4f89-badf-237f86944707',
  'video',
  'Meditación guiada con Carlotta',
  'Sesión de meditación guiada por Carlotta.',
  'Sesión grabada de la meditación semanal guiada por Carlotta. Un espacio para pausar, respirar y reconectarte con tu centro.',
  null,
  null, null, null, -- thumbnail_url set by shell script
  3600, null, 'free', 'e67daea3-67cf-4a66-bd1b-4e812f817d02',
  'published', '2026-04-09 08:17:59.377+00', null, null,
  null, '1178967928'
) ON CONFLICT (id) DO NOTHING;

-- ── 5. Content item → category ──────────────────────────────────────────────
INSERT INTO content_item_categories (id, content_item_id, category_id, position)
VALUES ('0ab4ae09-72e5-4412-b8f0-29a3d6dd5d9e', 'f7951a78-e942-4f89-badf-237f86944707', '98f09c22-cf94-4f15-8587-cb5eead43afc', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO content_item_categories (id, content_item_id, category_id, position)
VALUES ('0ab4ae09-72e5-4412-b8f0-29a3d6dd5d9f', 'f7951a78-e942-4f89-badf-237f86944707', '98f09c22-cf94-4f15-8587-cb5eead43afd', 0)
ON CONFLICT (id) DO NOTHING;

-- ── 6. Content item → objective ─────────────────────────────────────────────
INSERT INTO content_item_objectives (id, content_item_id, objective_id, position)
VALUES ('48551fa2-5685-4269-9617-24c46e844067', 'f7951a78-e942-4f89-badf-237f86944707', 'e67daea3-67cf-4a66-bd1b-4e812f817d02', 0)
ON CONFLICT (id) DO NOTHING;

-- ── 7. Forms ────────────────────────────────────────────────────────────────
INSERT INTO forms (id, title, description, fields, status)
VALUES (
  '5ecd0d32-eb65-4542-a2d0-91dfd7e556ed',
  'Formulario de inscripción al retiro',
  'Completa este formulario para reservar tu lugar en el retiro de junio 2026',
  '[{"type": "select", "options": ["Ninguna", "Vegetariano", "Vegano", "Otro"], "question": "¿Tienes alguna restricción alimentaria?", "required": true}, {"type": "textarea", "question": "¿Hay algo que debamos saber?", "required": true}]'::jsonb,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- ── 8. Posts ────────────────────────────────────────────────────────────────
INSERT INTO posts (id, author_user_id, is_official, community_segment, title, body, media_url, status)
VALUES (
  '8ffe2da9-fdb0-4c42-8a9d-6fc68bc5b319',
  null,
  true,
  'carlotta',
  'Recordatorio importante',
  'Tu bienestar no es un destino, es una práctica diaria. No importa si hoy no fue perfecto. Lo que importa es que mañana vuelvas a intentarlo. Estamos aquí para acompañarte en cada paso.',
  null, -- media_url set by shell script
  'published'
) ON CONFLICT (id) DO NOTHING;

-- ── 9. App settings ────────────────────────────────────────────────────────
-- Note: character_avatars and hoy_defaults URLs are set by seed-prod.sh after upload
INSERT INTO app_settings (key, value)
VALUES
  ('character_avatars', '{"gabriel_avatar_url": "", "carlotta_avatar_url": ""}'::jsonb),
  ('hoy_defaults', '{"form_id": "", "content_id": "", "action_type": "talk_to_ai", "badge_title": "Día completado", "phrase_text": "Cada día es una nueva oportunidad para cuidar de ti.", "phrase_author": "gabriel", "badge_subtitle": "Sigue así, vas genial", "featured_img_url": ""}'::jsonb),
  ('hoy_explore_sections', '{"sections": [{"id": "ai-coach", "featured": true}, {"id": "eventos", "featured": false}, {"id": "vip", "featured": false}]}'::jsonb),
  ('hoy_recent_content', '{"mode": "automatic", "selected_ids": []}'::jsonb)
ON CONFLICT (key) DO NOTHING;
