-- Remove community_segment filter from content_items, programs, and posts RLS policies.
-- Segment is only informative for now (used by AI personalization), not content access control.
-- The admin UI doesn't expose segment fields on these tables, so the filter was silently
-- hiding content from users based on seed data that couldn't be changed.

-- content_items
DROP POLICY IF EXISTS "content_items_select_published" ON public.content_items;
CREATE POLICY "content_items_select_published" ON public.content_items
  FOR SELECT USING (
    status = 'published'
    OR public.is_admin()
  );

-- programs
DROP POLICY IF EXISTS "programs_select_published" ON public.programs;
CREATE POLICY "programs_select_published" ON public.programs
  FOR SELECT USING (
    is_active = true
    OR public.is_admin()
  );

-- posts
DROP POLICY IF EXISTS "posts_select_published" ON public.posts;
CREATE POLICY "posts_select_published" ON public.posts
  FOR SELECT USING (
    (
      status = 'published'
      AND (select auth.uid()) IS NOT NULL
    )
    OR public.is_admin()
  );
