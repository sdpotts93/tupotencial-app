-- Add run tracking for repeatable programs
ALTER TABLE public.program_checkins ADD COLUMN run int NOT NULL DEFAULT 1;

-- Unique index: one checkin per day per run per user
CREATE UNIQUE INDEX idx_program_checkins_unique_day
  ON public.program_checkins (program_id, user_id, day_index, run);

-- Track current run on enrollment
ALTER TABLE public.program_enrollments ADD COLUMN run int NOT NULL DEFAULT 1;

-- Allow users to update their own checkins (needed for upsert)
DROP POLICY IF EXISTS "program_checkins_update_own" ON public.program_checkins;
CREATE POLICY "program_checkins_update_own" ON public.program_checkins
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
