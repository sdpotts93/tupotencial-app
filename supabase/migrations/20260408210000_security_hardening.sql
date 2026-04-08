-- =============================================================================
-- Security hardening migration
-- Fixes: is_admin() role check, check_email_exists anon access,
--        get_subscriber_user_ids guard, storage bucket policies,
--        enrollment update restriction, content_item_categories policy
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. is_admin() — check role column, exclude read_only
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'editor')
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. check_email_exists() — revoke anonymous access
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.check_email_exists(text) FROM anon;

-- ---------------------------------------------------------------------------
-- 3. get_subscriber_user_ids() — restrict to admins only
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_subscriber_user_ids()
RETURNS SETOF uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT user_id FROM public.subscriptions WHERE status = 'active';
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Storage buckets — restrict INSERT to admins on admin-only buckets
-- ---------------------------------------------------------------------------

-- program-covers
DROP POLICY IF EXISTS "program_covers_insert_authed" ON storage.objects;
CREATE POLICY "program_covers_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'program-covers'
    AND public.is_admin()
  );

-- event-covers
DROP POLICY IF EXISTS "event_covers_insert_authed" ON storage.objects;
CREATE POLICY "event_covers_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-covers'
    AND public.is_admin()
  );

-- addon-covers
DROP POLICY IF EXISTS "addon_covers_insert_authed" ON storage.objects;
CREATE POLICY "addon_covers_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'addon-covers'
    AND public.is_admin()
  );

-- content-covers
DROP POLICY IF EXISTS "content_covers_insert_authed" ON storage.objects;
CREATE POLICY "content_covers_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content-covers'
    AND public.is_admin()
  );

-- content-media
DROP POLICY IF EXISTS "content_media_insert_authed" ON storage.objects;
CREATE POLICY "content_media_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content-media'
    AND public.is_admin()
  );

-- character-avatars (admin uploads only)
DROP POLICY IF EXISTS "character_avatars_insert_authed" ON storage.objects;
CREATE POLICY "character_avatars_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'character-avatars'
    AND public.is_admin()
  );

-- character-avatars delete (also restrict to admin)
DROP POLICY IF EXISTS "character_avatars_delete_authed" ON storage.objects;
CREATE POLICY "character_avatars_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'character-avatars'
    AND public.is_admin()
  );

-- content-covers delete (also restrict to admin)
DROP POLICY IF EXISTS "content_covers_delete_admin" ON storage.objects;
CREATE POLICY "content_covers_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'content-covers'
    AND public.is_admin()
  );

-- Note: avatars and community-media INSERT stay as authenticated — users upload their own

-- ---------------------------------------------------------------------------
-- 5. program_enrollments — restrict what users can update
--    Replace open UPDATE with a server-side function for completion,
--    and restrict direct UPDATE to only restart fields
-- ---------------------------------------------------------------------------

-- Replace the open policy with one that only allows setting status back to 'active'
-- (restart scenario). Completion must go through the RPC.
DROP POLICY IF EXISTS "program_enrollments_update_own" ON public.program_enrollments;
CREATE POLICY "program_enrollments_update_own" ON public.program_enrollments
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (
    user_id = (select auth.uid())
    AND status = 'active'
  );

-- Server-side function to mark a program as completed (validates all days done)
CREATE OR REPLACE FUNCTION public.complete_program(p_program_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_days int;
  v_completed int;
  v_run int;
BEGIN
  -- Get current run
  SELECT run INTO v_run FROM program_enrollments
    WHERE program_id = p_program_id AND user_id = auth.uid();

  IF v_run IS NULL THEN
    RAISE EXCEPTION 'No enrollment found';
  END IF;

  -- Count total days in program
  SELECT count(*) INTO v_total_days FROM program_days WHERE program_id = p_program_id;

  -- Count completed days for current run
  SELECT count(DISTINCT day_index) INTO v_completed FROM program_checkins
    WHERE program_id = p_program_id AND user_id = auth.uid() AND run = v_run;

  IF v_completed >= v_total_days THEN
    UPDATE program_enrollments SET status = 'completed'
      WHERE program_id = p_program_id AND user_id = auth.uid();
  ELSE
    RAISE EXCEPTION 'Not all days completed (% of %)', v_completed, v_total_days;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. content_item_categories — explicit status filter in subquery
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "content_item_categories_select" ON public.content_item_categories;
CREATE POLICY "content_item_categories_select" ON public.content_item_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.content_items ci
      WHERE ci.id = content_item_id
        AND ci.status = 'published'
    )
    OR public.is_admin()
  );

-- program_days — explicit status filter
DROP POLICY IF EXISTS "program_days_select" ON public.program_days;
CREATE POLICY "program_days_select" ON public.program_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.programs pr
      WHERE pr.id = program_id
        AND pr.status = 'published'
    )
    OR public.is_admin()
  );

-- program_day_items — explicit status filter
DROP POLICY IF EXISTS "program_day_items_select" ON public.program_day_items;
CREATE POLICY "program_day_items_select" ON public.program_day_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.program_days pd
        JOIN public.programs pr ON pr.id = pd.program_id
      WHERE pd.id = program_day_id
        AND pr.status = 'published'
    )
    OR public.is_admin()
  );

COMMIT;
