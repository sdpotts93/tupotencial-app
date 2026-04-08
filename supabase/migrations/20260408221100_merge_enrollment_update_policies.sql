-- Merge two permissive UPDATE policies on program_enrollments into one.
-- Having multiple permissive policies for the same role+action forces Postgres
-- to evaluate each one on every UPDATE, which is suboptimal.

DROP POLICY IF EXISTS "program_enrollments_update_admin" ON public.program_enrollments;
DROP POLICY IF EXISTS "program_enrollments_update_own"   ON public.program_enrollments;

CREATE POLICY "program_enrollments_update" ON public.program_enrollments
  FOR UPDATE
  USING (
    public.is_admin()
    OR user_id = (select auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = (select auth.uid())
      AND status = 'active'
    )
  );
