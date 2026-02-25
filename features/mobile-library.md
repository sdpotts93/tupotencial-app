# Feature: Mobile — Library

## Goal
Browse, search, and consume on-demand content (video, audio, text, links) organized by categories.

## User stories
- As a user, I can browse content by category
- As a user, I can search across all published content
- As a user, I can view content details and play/read content
- As a free user, I see limited library; Core unlocks full library

## Screens (routes)
- `/library` — Home with featured + categories (horizontal scroll)
- `/library/search` — Search with suggestions + results
- `/library/c/[slug]` — Category listing (grid)
- `/content/[id]` — Content detail (hero, description, CTA)
- `/content/[id]/play` — Player/reader (video/audio controls or text rendering)

## Data model
- Tables: `content_categories`, `content_items`, `content_item_categories`
- Segment filtering on content_items.community_segment

## RLS rules
- content_categories: anon read active
- content_items: anon read published (segment-filtered)

## Analytics events
- `library_viewed`, `library_search`, `content_viewed`, `content_play_started`, `content_play_completed`

## Edge cases
- Gated content for non-subscribers → show lock icon + upgrade CTA (web) or explanation (native)
- No results in search → empty state
- Content type rendering (video vs audio vs text)

## Done criteria
- [ ] Categories display ordered
- [ ] Horizontal scroll cards per category
- [ ] Search filters published content by title
- [ ] Content detail shows all fields
- [ ] Player renders appropriately per content type
- [ ] Segment filtering applied

## Tests
- [ ] Category ordering
- [ ] Search returns matching items
- [ ] Content detail renders all types
- [ ] Player controls work
