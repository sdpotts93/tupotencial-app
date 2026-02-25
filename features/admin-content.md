# Feature: Admin — Content Management

## Goal
CRUD for content categories and content items with scheduling and segment gating.

## User stories
- As an admin, I can list all content items with filters
- As an admin, I can create/edit/archive content items
- As an admin, I can manage content categories (CRUD + ordering)
- As an admin, I can assign content to categories
- As an admin, I can schedule content publication

## Screens (routes)
- `/admin/content` — Content list with filters (status/type/segment/category)
- `/admin/content/new` — Create content form
- `/admin/content/[id]` — Edit content form
- `/admin/categories` — Categories manager (CRUD + ordering)

## Data model
- Tables: `content_items`, `content_categories`, `content_item_categories`

## RLS rules
- Admin CRUD via service role or admin RLS policies

## Done criteria
- [ ] Content list with filters and search
- [ ] Create/edit form with all fields
- [ ] Status transitions (draft → published → archived)
- [ ] Category management with ordering
- [ ] Segment assignment

## Tests
- [ ] CRUD operations
- [ ] Filter combinations
- [ ] Category ordering persistence
