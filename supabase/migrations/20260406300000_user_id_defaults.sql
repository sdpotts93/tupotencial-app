-- =============================================================================
-- Add DEFAULT auth.uid() to all user-facing tables so the client never needs
-- to send user_id on inserts/upserts — the DB fills it from the JWT.
-- =============================================================================

BEGIN;

ALTER TABLE public.daily_checkins       ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.program_enrollments  ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.program_checkins     ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.user_streaks         ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.post_reactions       ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.post_comments        ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.form_submissions     ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.push_tokens          ALTER COLUMN user_id SET DEFAULT auth.uid();

COMMIT;
