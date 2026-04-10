-- Security hardening: block anon access & column-level security on content_items
--
-- Layer 1: Add (select auth.uid()) IS NOT NULL to all SELECT policies that were
--          missing it. Several were accidentally regressed in the admin_read_only
--          migration (20260409033807) which dropped auth checks while adding
--          has_admin_access() support.
--
-- Layer 2: Revoke table-level SELECT on content_items from anon & authenticated,
--          then grant column-level SELECT on safe columns only. Sensitive columns
--          (vimeo_id, body, media_url, external_url) are only accessible via the
--          SECURITY DEFINER functions: get_secure_content() for users, and the new
--          get_admin_content_item() for admin.

BEGIN;

-- =========================================================================
-- LAYER 1: Auth-gate all public SELECT policies
-- =========================================================================

-- content_items
ALTER POLICY "content_items_select_published" ON public.content_items
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'published'
    )
    OR public.has_admin_access()
  );

-- content_categories
ALTER POLICY "content_categories_select_active" ON public.content_categories
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'active'
    )
    OR public.has_admin_access()
  );

-- content_item_categories (cascades from content_items, but belt-and-suspenders)
ALTER POLICY "content_item_categories_select" ON public.content_item_categories
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.id = content_item_id
          AND ci.status = 'published'
      )
    )
    OR public.has_admin_access()
  );

-- content_item_objectives
ALTER POLICY "content_item_objectives_select" ON public.content_item_objectives
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.id = content_item_id
      )
    )
    OR public.has_admin_access()
  );

-- daily_plans
ALTER POLICY "daily_plans_select_published" ON public.daily_plans
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'published'
    )
    OR public.has_admin_access()
  );

-- posts (REGRESSION FIX: had auth check before admin_read_only removed it)
ALTER POLICY "posts_select_published" ON public.posts
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'published'
    )
    OR public.has_admin_access()
  );

-- post_comments (REGRESSION FIX: lost both auth check AND parent post status filter)
ALTER POLICY "post_comments_select" ON public.post_comments
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.posts po
        WHERE po.id = post_id
          AND po.status = 'published'
      )
    )
    OR public.has_admin_access()
  );

-- post_reactions
ALTER POLICY "post_reactions_select" ON public.post_reactions
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.posts p
        WHERE p.id = post_id
          AND p.status = 'published'
      )
    )
    OR public.has_admin_access()
  );

-- benefits (REGRESSION FIX: had auth check before admin_read_only removed it)
ALTER POLICY "benefits_select_published" ON public.benefits
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'active'
    )
    OR public.has_admin_access()
  );

-- addons
ALTER POLICY "addons_select_active" ON public.addons
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'active'
    )
    OR public.has_admin_access()
  );

-- addon_entitlements
ALTER POLICY "addon_entitlements_select" ON public.addon_entitlements
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.addons a
        WHERE a.id = addon_id
      )
    )
    OR public.has_admin_access()
  );

-- events
ALTER POLICY "events_select_published" ON public.events
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'published'
    )
    OR public.has_admin_access()
  );

-- forms
ALTER POLICY "forms_select_active" ON public.forms
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND status = 'active'
    )
    OR public.has_admin_access()
  );

-- programs
ALTER POLICY "programs_select_published" ON public.programs
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND is_active = true
    )
    OR public.has_admin_access()
  );

-- program_days
ALTER POLICY "program_days_select" ON public.program_days
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.programs p
        WHERE p.id = program_id
      )
    )
    OR public.has_admin_access()
  );

-- program_day_items
ALTER POLICY "program_day_items_select" ON public.program_day_items
  USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.program_days pd
        WHERE pd.id = program_day_id
      )
    )
    OR public.has_admin_access()
  );

-- =========================================================================
-- LAYER 2: Column-level security on content_items
-- =========================================================================
-- Revoke table-level SELECT so column-level grants take effect.
-- Sensitive columns (vimeo_id, body, media_url, external_url) become
-- inaccessible via direct table queries. The existing get_secure_content()
-- SECURITY DEFINER function still returns them when the user has entitlement.

REVOKE SELECT ON public.content_items FROM anon;
REVOKE SELECT ON public.content_items FROM authenticated;

-- Grant SELECT on non-sensitive columns only to authenticated
GRANT SELECT (
  id, type, title, subtitle, description, thumbnail_url,
  duration_seconds, entitlement_key, plan, objective_id,
  status, published_at, available_from, available_to,
  community_segment, created_by, updated_by, created_at, updated_at, fts
) ON public.content_items TO authenticated;

-- No SELECT grant to anon (RLS blocks them anyway, but defense-in-depth)

-- =========================================================================
-- Admin function: full content item access for admin/editor
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_admin_content_item(p_id uuid)
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.has_admin_access() THEN
    RETURN NULL;
  END IF;

  RETURN (
    SELECT row_to_json(ci)
    FROM public.content_items ci
    WHERE ci.id = p_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_content_item(uuid) TO authenticated;

COMMIT;
