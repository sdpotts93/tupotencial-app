# Feature: Mobile Auth

## Goal
Allow users to sign in, register, set up their profile, and choose their community segment.

## User stories
- As a user, I can log in with email/password
- As a new user (web), I can register a free account
- As a new user, I can set my display name and optional avatar
- As a new user, I can choose my community segment (Gabriel/Carlotta/Conjunta)
- As a returning user, I can enable "remember me" for persistent sessions
- As a native user, I see helper text about web-only registration (MX storefront)

## Screens (routes)
- `/auth/login`
- `/auth/register` (web-only)
- `/auth/profile-setup`
- `/onboarding/segment`

## Data model
- Tables: `profiles`, `auth.users` (Supabase Auth)
- Fields: display_name, avatar_url, community_segment

## RLS rules
- profiles: self-access (SELECT/UPDATE own row)

## Analytics events
- `auth_login_success`, `auth_login_failure`
- `auth_register_success`
- `onboarding_segment_selected`

## Edge cases
- User already has segment → redirect from /onboarding/segment to /hoy
- Login with incorrect credentials → show error
- Native builds → no register/subscribe buttons

## Done criteria
- [ ] Login works with email/password
- [ ] Register creates free account (web)
- [ ] Profile setup saves display_name
- [ ] Segment selection saves to profiles.community_segment
- [ ] Remember me toggle affects session persistence
- [ ] Native builds hide register/subscribe CTAs

## Tests
- [ ] Login form validation
- [ ] Register form validation (min 8 chars, password match)
- [ ] Redirect logic (no segment → onboarding, has segment → /hoy)
- [ ] Native vs web behavior toggle
