-- Allow users to update their own program enrollments (needed for "restart program")
DROP POLICY IF EXISTS "program_enrollments_update_own" ON public.program_enrollments;
CREATE POLICY "program_enrollments_update_own" ON public.program_enrollments
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
