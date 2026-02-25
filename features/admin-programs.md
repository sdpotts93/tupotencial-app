# Feature: Admin — Programs Management

## Goal
CRUD for programs, challenges, and bootcamps with day management.

## User stories
- As an admin, I can list programs with type/status filters
- As an admin, I can create/edit programs
- As an admin, I can manage days within a program
- As an admin, I can attach content items to program days

## Screens (routes)
- `/admin/programs` — Programs list
- `/admin/programs/new` — Create program
- `/admin/programs/[id]` — Edit program with day management

## Data model
- Tables: `programs`, `program_days`, `program_day_items`

## Done criteria
- [ ] Programs list with filters
- [ ] Create/edit program form
- [ ] Day management (add/edit/reorder)
- [ ] Attach content to days

## Tests
- [ ] CRUD operations
- [ ] Day ordering
- [ ] Content attachment
