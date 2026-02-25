# Feature: Mobile — Hoy (Today)

## Goal
Provide users with a daily guidance experience: today's plan, check-in, progress tracking, and badge sharing.

## User stories
- As a user, I see my personalized daily plan based on my segment
- As a user, I can complete a daily check-in (mood + reflection)
- As a user, I see my streak and overall progress
- As a user, I see today's badge and can share it

## Screens (routes)
- `/hoy` — Dashboard with greeting, streak, daily plan card, quick actions, badge section
- `/hoy/checkin` — Check-in form (mood selector + reflection textarea)
- `/hoy/progress` — Streak hero, stats grid, active programs, week calendar

## Data model
- Tables: `daily_plans`, `daily_checkins`, `user_streaks`
- Read: daily_plans (by date + segment), user_streaks
- Write: daily_checkins (insert on check-in)

## RLS rules
- daily_plans: anon read published
- daily_checkins: user insert/read own
- user_streaks: user read own

## Analytics events
- `hoy_viewed`, `checkin_started`, `checkin_completed`, `badge_shared`, `progress_viewed`

## Edge cases
- No daily plan configured → show empty state
- User already checked in today → show badge preview
- Streak computation on the fly vs materialized user_streaks

## Done criteria
- [ ] Daily plan loads by segment (or global fallback)
- [ ] Check-in form submits mood + reflection
- [ ] Success modal shows badge + updated streak
- [ ] Progress page shows streak, stats, active programs, week calendar
- [ ] Badge share uses native share sheet (Capacitor) when available

## Tests
- [ ] Daily plan segment filtering
- [ ] Check-in form requires mood selection
- [ ] Streak increments on check-in
- [ ] Empty state renders correctly
