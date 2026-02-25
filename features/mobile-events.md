# Feature: Mobile — Events / Lives

## Goal
Show upcoming and past events with Vimeo embed playback and subscriber gating.

## User stories
- As a user, I can browse upcoming and past events
- As a subscriber, I can watch live events or recordings
- As a non-subscriber, I see a locked state

## Screens (routes)
- `/events` — Events list (upcoming + past)
- `/events/[id]` — Event detail
- `/events/[id]/watch` — Vimeo embed player (subscriber-only)

## Data model
- Tables: `events`

## RLS rules
- events: anon read published, admin CRUD

## Analytics events
- `event_viewed`, `event_watch_started`

## Done criteria
- [ ] Events list shows upcoming and past
- [ ] Event detail shows all fields
- [ ] Vimeo embed renders for subscribers
- [ ] Locked state for non-subscribers (no native purchase CTA)

## Tests
- [ ] Upcoming/past sorting
- [ ] Subscriber gating on /watch route
