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

echo ""
echo "Done."
echo "  Content:  ${CONTENT_COVER_URL}"
echo "  Addons:   ${ADDON_COVER_URL}"
echo "  Events:   ${EVENT_COVER_URL}"
echo "  Programs: ${PROGRAM_COVER_URL}"
