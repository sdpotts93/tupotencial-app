# Feature: Mobile — Community

## Goal
Subscriber-only social feed with posts, comments, and reactions.

## User stories
- As a subscriber, I can view the community feed
- As a subscriber, I can react to posts
- As a subscriber, I can comment on posts
- As a non-subscriber, I see a locked state

## Screens (routes)
- `/community` — Feed (segmented + global posts)
- `/community/post/[id]` — Post detail with comments

## Data model
- Tables: `posts`, `post_comments`, `post_reactions`

## RLS rules
- posts: subscribers read published (segment-filtered)
- post_comments: subscribers read/insert
- post_reactions: subscribers read/insert/delete own

## Analytics events
- `community_viewed`, `post_reacted`, `post_commented`

## Edge cases
- Non-subscriber → locked state (no subscribe CTA on native)
- Official posts highlighted

## Done criteria
- [ ] Feed loads segmented + global posts
- [ ] Reaction toggle works
- [ ] Comments load and new comment submits
- [ ] Locked state for non-subscribers

## Tests
- [ ] Segment filtering
- [ ] Reaction toggle (add/remove)
- [ ] Comment creation
