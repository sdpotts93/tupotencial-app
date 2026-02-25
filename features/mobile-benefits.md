# Feature: Mobile — Benefits

## Goal
Show exclusive member benefits with click tracking and external link opening.

## User stories
- As a member, I can browse available benefits
- As a member, I can view benefit details and use codes
- As a member, I can open benefit links (tracked)

## Screens (routes)
- `/benefits` — Benefits list
- `/benefits/[id]` — Benefit detail with code + CTA

## Data model
- Tables: `benefits`, `benefit_clicks`

## RLS rules
- benefits: authed read published
- benefit_clicks: authed insert own

## Done criteria
- [ ] Benefits list ordered by position
- [ ] Detail shows code and description
- [ ] CTA opens URL with UTM + logs click

## Tests
- [ ] Click tracking fires
- [ ] UTM template resolution
