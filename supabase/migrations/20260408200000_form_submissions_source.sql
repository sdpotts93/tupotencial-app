-- =============================================================================
-- Add source tracking to form_submissions so admins can see where
-- each submission came from (daily action vs program day).
-- Also add FK to profiles so PostgREST can join user info directly.
-- =============================================================================

BEGIN;

-- Source type: 'daily_action' or 'program'
ALTER TABLE public.form_submissions
  ADD COLUMN source text,
  ADD COLUMN program_id uuid REFERENCES public.programs(id);

-- Index for filtering by source and by program
CREATE INDEX idx_form_submissions_source ON public.form_submissions (source);
CREATE INDEX idx_form_submissions_program ON public.form_submissions (program_id)
  WHERE program_id IS NOT NULL;

-- Add direct FK to profiles so PostgREST can join user info in one query
ALTER TABLE public.form_submissions
  ADD CONSTRAINT form_submissions_profile_fk
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.program_checkins
  ADD CONSTRAINT program_checkins_profile_fk
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.daily_checkins
  ADD CONSTRAINT daily_checkins_profile_fk
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

COMMIT;
