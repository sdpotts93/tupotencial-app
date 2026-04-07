#!/bin/bash
# Upload default assets to local Supabase Storage after db reset/seed
# Usage: ./supabase/seed-storage.sh

SUPABASE_URL="http://127.0.0.1:54321"
SERVICE_KEY=$(npx supabase status --output json 2>/dev/null | grep '"SERVICE_ROLE_KEY"' | cut -d'"' -f4)

if [ -z "$SERVICE_KEY" ]; then
  echo "Could not get SERVICE_ROLE_KEY. Is supabase running?"
  exit 1
fi

CONTENT_COVER_URL="${SUPABASE_URL}/storage/v1/object/public/content-covers/defaults/default-cover.jpg"
ADDON_COVER_URL="${SUPABASE_URL}/storage/v1/object/public/addon-covers/defaults/default-cover.jpg"
EVENT_COVER_URL="${SUPABASE_URL}/storage/v1/object/public/event-covers/defaults/default-cover.jpg"
PROGRAM_COVER_URL="${SUPABASE_URL}/storage/v1/object/public/program-covers/defaults/default-cover.jpg"
CARLOTTA_AVATAR_URL="${SUPABASE_URL}/storage/v1/object/public/character-avatars/carlotta/avatar.png"
GABRIEL_AVATAR_URL="${SUPABASE_URL}/storage/v1/object/public/character-avatars/gabriel/avatar.png"
HOY_FEATURED_URL="${SUPABASE_URL}/storage/v1/object/public/content-covers/hoy/featured-default.jpg"

echo "Uploading default covers..."

curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/content-covers/defaults/default-cover.jpg" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: image/jpeg" \
  --data-binary @apps/mobile/public/images/lib-2.jpg

curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/addon-covers/defaults/default-cover.jpg" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: image/jpeg" \
  --data-binary @apps/mobile/public/images/lib-8.jpg

curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/event-covers/defaults/default-cover.jpg" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: image/jpeg" \
  --data-binary @apps/mobile/public/images/lib-2.jpg

curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/program-covers/defaults/default-cover.jpg" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: image/jpeg" \
  --data-binary @apps/mobile/public/images/lib-2.jpg

echo "Uploading hoy featured image..."

curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/content-covers/hoy/featured-default.jpg" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: image/jpeg" \
  --data-binary @apps/mobile/public/images/rojo-carlotta.jpg

echo "Uploading character avatars..."

curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/character-avatars/carlotta/avatar.png" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: image/png" \
  --data-binary @apps/mobile/public/images/carlotta.png

curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/character-avatars/gabriel/avatar.png" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: image/png" \
  --data-binary @apps/mobile/public/images/gabriel.png

echo ""
echo "Setting cover URLs on seed data..."

# Content items
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/content_items?thumbnail_url=is.null" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"thumbnail_url\": \"${CONTENT_COVER_URL}\"}"

# Addons
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/addons?cover_url=is.null" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"cover_url\": \"${ADDON_COVER_URL}\"}"

# Events
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/events?cover_url=is.null" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"cover_url\": \"${EVENT_COVER_URL}\"}"

# Programs
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/programs?cover_url=is.null" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"cover_url\": \"${PROGRAM_COVER_URL}\"}"

# Hoy featured image (merge featured_img_url into existing hoy_defaults JSON)
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/app_settings?key=eq.hoy_defaults" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"value\": {\"phrase_text\": \"Cada día es una nueva oportunidad para cuidar de ti.\", \"phrase_author\": \"gabriel\", \"action_type\": \"talk_to_ai\", \"content_id\": \"\", \"form_id\": \"\", \"badge_title\": \"Día completado\", \"badge_subtitle\": \"Sigue así, vas genial\", \"featured_img_url\": \"${HOY_FEATURED_URL}\"}}"

# Character avatars
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/app_settings?key=eq.character_avatars" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"value\": {\"carlotta_avatar_url\": \"${CARLOTTA_AVATAR_URL}\", \"gabriel_avatar_url\": \"${GABRIEL_AVATAR_URL}\"}}"

echo ""
echo "Done."
echo "  Content:   ${CONTENT_COVER_URL}"
echo "  Addons:    ${ADDON_COVER_URL}"
echo "  Events:    ${EVENT_COVER_URL}"
echo "  Programs:  ${PROGRAM_COVER_URL}"
echo "  Hoy feat:  ${HOY_FEATURED_URL}"
echo "  Carlotta:  ${CARLOTTA_AVATAR_URL}"
echo "  Gabriel:   ${GABRIEL_AVATAR_URL}"
