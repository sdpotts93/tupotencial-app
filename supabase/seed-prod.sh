#!/bin/bash
# =============================================================================
# supabase/seed-prod.sh
# Production seed: admin user, default images, app defaults, and sample content
#
# Required env vars:
#   SUPABASE_URL          – e.g. https://geeasiskunssknfwqoko.supabase.co
#   SUPABASE_SERVICE_KEY  – service_role key (NOT anon key)
#
# Usage:
#   export SUPABASE_URL="https://geeasiskunssknfwqoko.supabase.co"
#   export SUPABASE_SERVICE_KEY="eyJ..."
#   ./supabase/seed-prod.sh
# =============================================================================
set -euo pipefail

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
  exit 1
fi

API="${SUPABASE_URL}/rest/v1"
AUTH="${SUPABASE_URL}/auth/v1"
STORAGE="${SUPABASE_URL}/storage/v1/object"
STORAGE_PUBLIC="${SUPABASE_URL}/storage/v1/object/public"

AUTH_HEADERS=(
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}"
  -H "apikey: ${SUPABASE_SERVICE_KEY}"
)
REST_HEADERS=(
  "${AUTH_HEADERS[@]}"
  -H "Content-Type: application/json"
  -H "Prefer: return=representation"
)

IMAGES="apps/mobile/public/images"
LOGO="apps/mobile/public/logo-word/logo-word-black.png"

# ── 1. Create admin user ────────────────────────────────────────────────────
echo "Creating admin user..."
USER_RESPONSE=$(curl -s -X POST "${AUTH}/admin/users" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "steven@kigo.studio",
    "password": "potencial777",
    "email_confirm": true
  }')

ADMIN_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ADMIN_ID" ]; then
  echo "  User may already exist. Trying to fetch..."
  # List users and find by email
  USERS_RESPONSE=$(curl -s -X GET "${AUTH}/admin/users" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}")
  ADMIN_ID=$(echo "$USERS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
users = data.get('users', data) if isinstance(data, dict) else data
for u in users:
    if u.get('email') == 'steven@kigo.studio':
        print(u['id'])
        break
" 2>/dev/null || true)

  if [ -z "$ADMIN_ID" ]; then
    echo "  Error: Could not create or find admin user"
    echo "  Response: $USER_RESPONSE"
    exit 1
  fi
fi
echo "  Admin user ID: ${ADMIN_ID}"

# ── 2. Profile & admin role ─────────────────────────────────────────────────
echo "Setting up profile and admin role..."
curl -s -X POST "${API}/profiles" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d "{\"id\": \"${ADMIN_ID}\", \"display_name\": \"Steven\"}" > /dev/null

curl -s -X POST "${API}/admin_users" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d "{\"user_id\": \"${ADMIN_ID}\", \"role\": \"admin\"}" > /dev/null

echo "  Done"

# ── 3. Upload images to storage ─────────────────────────────────────────────
upload() {
  local bucket_path="$1"
  local local_file="$2"
  local content_type="$3"

  echo "  Uploading ${bucket_path}..."
  # Try POST first, fall back to PUT (upsert) if exists
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "${STORAGE}/${bucket_path}" \
    "${AUTH_HEADERS[@]}" \
    -H "Content-Type: ${content_type}" \
    --data-binary "@${local_file}")

  if [ "$RESPONSE" = "409" ]; then
    curl -s -o /dev/null -X PUT \
      "${STORAGE}/${bucket_path}" \
      "${AUTH_HEADERS[@]}" \
      -H "Content-Type: ${content_type}" \
      --data-binary "@${local_file}"
  fi
}

echo "Uploading images..."
upload "character-avatars/carlotta/avatar.png"   "${IMAGES}/carlotta.png"      "image/png"
upload "character-avatars/gabriel/avatar.png"     "${IMAGES}/gabriel.png"       "image/png"
upload "content-covers/hoy/featured.jpg"         "${IMAGES}/rojo-carlotta.jpg" "image/jpeg"
upload "content-covers/content-seed/cover.jpg"   "${IMAGES}/lib-4.jpg"         "image/jpeg"
upload "content-covers/community/post-seed/logo-word-black.png" "${LOGO}"      "image/png"

CARLOTTA_AVATAR="${STORAGE_PUBLIC}/character-avatars/carlotta/avatar.png"
GABRIEL_AVATAR="${STORAGE_PUBLIC}/character-avatars/gabriel/avatar.png"
HOY_FEATURED="${STORAGE_PUBLIC}/content-covers/hoy/featured.jpg"
CONTENT_THUMBNAIL="${STORAGE_PUBLIC}/content-covers/content-seed/cover.jpg"
POST_MEDIA="${STORAGE_PUBLIC}/content-covers/community/post-seed/logo-word-black.png"

echo "  Done"

# ── 4. Content objectives ───────────────────────────────────────────────────
echo "Inserting content objectives..."
curl -s -X POST "${API}/content_objectives" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d '{
    "id": "e67daea3-67cf-4a66-bd1b-4e812f817d02",
    "title": "Reducir estrés",
    "slug": "reducir-estres",
    "position": 1,
    "is_active": true
  }' > /dev/null

# ── 5. Content categories ───────────────────────────────────────────────────
echo "Inserting content categories..."
curl -s -X POST "${API}/content_categories" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d '{
    "id": "98f09c22-cf94-4f15-8587-cb5eead43afc",
    "title": "Meditaciones",
    "slug": "meditaciones",
    "is_active": true,
    "status": "active",
    "sort_order": 1
  }' > /dev/null

# ── 6. Content items ────────────────────────────────────────────────────────
echo "Inserting content items..."
curl -s -X POST "${API}/content_items" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d "{
    \"id\": \"f7951a78-e942-4f89-badf-237f86944707\",
    \"type\": \"video\",
    \"title\": \"Meditación guiada con Carlotta\",
    \"subtitle\": \"Sesión de meditación guiada por Carlotta.\",
    \"description\": \"Sesión grabada de la meditación semanal guiada por Carlotta. Un espacio para pausar, respirar y reconectarte con tu centro.\",
    \"thumbnail_url\": \"${CONTENT_THUMBNAIL}\",
    \"duration_seconds\": 3600,
    \"entitlement_key\": \"vip\",
    \"plan\": \"free\",
    \"objective_id\": \"e67daea3-67cf-4a66-bd1b-4e812f817d02\",
    \"status\": \"published\",
    \"published_at\": \"2026-04-09T08:17:59.377Z\",
    \"vimeo_id\": \"1178967928\"
  }" > /dev/null

# ── 7. Content item → category ──────────────────────────────────────────────
echo "Inserting content item categories..."
curl -s -X POST "${API}/content_item_categories" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d '{
    "id": "0ab4ae09-72e5-4412-b8f0-29a3d6dd5d9e",
    "content_item_id": "f7951a78-e942-4f89-badf-237f86944707",
    "category_id": "98f09c22-cf94-4f15-8587-cb5eead43afc",
    "position": 0
  }' > /dev/null

# ── 8. Content item → objective ──────────────────────────────────────────────
echo "Inserting content item objectives..."
curl -s -X POST "${API}/content_item_objectives" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d '{
    "id": "48551fa2-5685-4269-9617-24c46e844067",
    "content_item_id": "f7951a78-e942-4f89-badf-237f86944707",
    "objective_id": "e67daea3-67cf-4a66-bd1b-4e812f817d02",
    "position": 0
  }' > /dev/null

# ── 9. Forms ────────────────────────────────────────────────────────────────
echo "Inserting forms..."
curl -s -X POST "${API}/forms" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d '{
    "id": "5ecd0d32-eb65-4542-a2d0-91dfd7e556ed",
    "title": "Formulario de inscripción al retiro",
    "description": "Completa este formulario para reservar tu lugar en el retiro de junio 2026",
    "fields": [{"type": "select", "options": ["Ninguna", "Vegetariano", "Vegano", "Otro"], "question": "¿Tienes alguna restricción alimentaria?", "required": true}, {"type": "textarea", "question": "¿Hay algo que debamos saber?", "required": true}],
    "status": "active"
  }' > /dev/null

# ── 10. Posts ───────────────────────────────────────────────────────────────
echo "Inserting posts..."
curl -s -X POST "${API}/posts" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=ignore-duplicates" \
  -d "{
    \"id\": \"8ffe2da9-fdb0-4c42-8a9d-6fc68bc5b319\",
    \"is_official\": true,
    \"community_segment\": \"carlotta\",
    \"title\": \"Recordatorio importante\",
    \"body\": \"Tu bienestar no es un destino, es una práctica diaria. No importa si hoy no fue perfecto. Lo que importa es que mañana vuelvas a intentarlo. Estamos aquí para acompañarte en cada paso.\",
    \"media_url\": \"${POST_MEDIA}\",
    \"status\": \"published\"
  }" > /dev/null

# ── 11. App settings ────────────────────────────────────────────────────────
echo "Inserting app settings..."

curl -s -X POST "${API}/app_settings" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=merge-duplicates" \
  -d "{
    \"key\": \"character_avatars\",
    \"value\": {\"gabriel_avatar_url\": \"${GABRIEL_AVATAR}\", \"carlotta_avatar_url\": \"${CARLOTTA_AVATAR}\"}
  }" > /dev/null

curl -s -X POST "${API}/app_settings" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=merge-duplicates" \
  -d "{
    \"key\": \"hoy_defaults\",
    \"value\": {\"form_id\": \"\", \"content_id\": \"\", \"action_type\": \"talk_to_ai\", \"badge_title\": \"Día completado\", \"phrase_text\": \"Cada día es una nueva oportunidad para cuidar de ti.\", \"phrase_author\": \"gabriel\", \"badge_subtitle\": \"Sigue así, vas genial\", \"featured_img_url\": \"${HOY_FEATURED}\"}
  }" > /dev/null

curl -s -X POST "${API}/app_settings" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=merge-duplicates" \
  -d '{
    "key": "hoy_explore_sections",
    "value": {"sections": [{"id": "ai-coach", "featured": true}, {"id": "eventos", "featured": false}, {"id": "vip", "featured": false}]}
  }' > /dev/null

curl -s -X POST "${API}/app_settings" \
  "${REST_HEADERS[@]}" \
  -H "Prefer: return=minimal,resolution=merge-duplicates" \
  -d '{
    "key": "hoy_recent_content",
    "value": {"mode": "automatic", "selected_ids": []}
  }' > /dev/null

# ── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "Production seed complete!"
echo "  Admin:     steven@kigo.studio (${ADMIN_ID})"
echo "  Avatars:   ${CARLOTTA_AVATAR}"
echo "             ${GABRIEL_AVATAR}"
echo "  Featured:  ${HOY_FEATURED}"
echo "  Content:   ${CONTENT_THUMBNAIL}"
echo "  Post:      ${POST_MEDIA}"
