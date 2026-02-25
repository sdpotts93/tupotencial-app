# Feature: Mobile — Retos (Programs/Challenges/Bootcamps)

## Goal
Allow users to browse, enroll in, and progress through structured programs.

## User stories
- As a user, I can browse programs by type (program/reto/bootcamp)
- As a user, I can enroll in a program
- As a user, I can view my progress day by day
- As a user, I can complete a program check-in

## Screens (routes)
- `/retos` — Programs home with tabs (All/Programs/Retos/Bootcamps)
- `/retos/[id]` — Program detail with day list + enroll CTA
- `/retos/[id]/day/[dayIndex]` — Day view with content items
- `/retos/[id]/day/[dayIndex]/checkin` — Program check-in form

## Data model
- Tables: `programs`, `program_days`, `program_day_items`, `program_enrollments`, `program_checkins`

## RLS rules
- programs: anon read published
- program_enrollments: user insert/read own
- program_checkins: user insert own

## Analytics events
- `program_viewed`, `program_enrolled`, `program_day_viewed`, `program_checkin_completed`

## Edge cases
- Program inactive/unavailable → "not available" state
- User not enrolled → show enroll CTA
- Free tier includes intro guides; Core includes 30-day programs

## Done criteria
- [ ] Programs list with tab filtering
- [ ] Program detail shows day list with completion status
- [ ] Enrollment flow works
- [ ] Day view shows ordered content
- [ ] Check-in form submits

## Tests
- [ ] Tab filtering by type
- [ ] Enrollment creates record
- [ ] Progress tracking per day
