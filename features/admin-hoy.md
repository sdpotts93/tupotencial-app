# Feature: Admin — Today Scheduler

## Goal
Manage daily plans by date and segment.

## User stories
- As an admin, I can view and manage daily plans by date
- As an admin, I can create/edit a daily plan (message + action + check-in form)

## Screens (routes)
- `/admin/hoy` — Calendar/list view by date
- `/admin/hoy/[date]` — Daily plan editor

## Data model
- Tables: `daily_plans`

## Done criteria
- [ ] Calendar/list navigation by date
- [ ] Create/edit daily plan per date + segment
- [ ] Status transitions (scheduled → published)

## Tests
- [ ] Date navigation
- [ ] Plan creation per segment
