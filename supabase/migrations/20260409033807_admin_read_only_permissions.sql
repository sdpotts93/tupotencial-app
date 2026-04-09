BEGIN;

-- ---------------------------------------------------------------------------
-- Admin access helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'editor', 'read_only')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_subscriber_user_ids()
RETURNS SETOF uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_admin_access() THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT user_id
    FROM public.subscriptions
    WHERE status = 'active';
END;
$$;

-- ---------------------------------------------------------------------------
-- Read policies: allow all admin roles to inspect backoffice data
-- ---------------------------------------------------------------------------
ALTER POLICY "profiles_select_own" ON public.profiles
  USING (
    id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "admin_users_select_admin" ON public.admin_users
  USING (public.has_admin_access());

ALTER POLICY "content_categories_select_active" ON public.content_categories
  USING (
    status = 'active'
    OR public.has_admin_access()
  );

ALTER POLICY "content_items_select_published" ON public.content_items
  USING (
    status = 'published'
    OR public.has_admin_access()
  );

ALTER POLICY "content_item_categories_select" ON public.content_item_categories
  USING (
    EXISTS (
      SELECT 1
      FROM public.content_items ci
      WHERE ci.id = content_item_id
    )
    OR public.has_admin_access()
  );

ALTER POLICY "forms_select_active" ON public.forms
  USING (
    status = 'active'
    OR public.has_admin_access()
  );

ALTER POLICY "programs_select_published" ON public.programs
  USING (
    status = 'published'
    OR public.has_admin_access()
  );

ALTER POLICY "program_days_select" ON public.program_days
  USING (
    EXISTS (
      SELECT 1
      FROM public.programs p
      WHERE p.id = program_id
    )
    OR public.has_admin_access()
  );

ALTER POLICY "program_day_items_select" ON public.program_day_items
  USING (
    EXISTS (
      SELECT 1
      FROM public.program_days pd
      WHERE pd.id = program_day_id
    )
    OR public.has_admin_access()
  );

ALTER POLICY "program_enrollments_select" ON public.program_enrollments
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "program_checkins_select" ON public.program_checkins
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "daily_plans_select_published" ON public.daily_plans
  USING (
    status = 'published'
    OR public.has_admin_access()
  );

ALTER POLICY "daily_checkins_select_own" ON public.daily_checkins
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "user_streaks_select_own" ON public.user_streaks
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "posts_select_published" ON public.posts
  USING (
    status = 'published'
    OR public.has_admin_access()
  );

ALTER POLICY "post_comments_select" ON public.post_comments
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
    )
    OR public.has_admin_access()
  );

ALTER POLICY "post_reactions_select" ON public.post_reactions
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
    )
    OR public.has_admin_access()
  );

ALTER POLICY "events_select_published" ON public.events
  USING (
    status = 'published'
    OR public.has_admin_access()
  );

ALTER POLICY "event_registrations_select" ON public.event_registrations
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "benefits_select_published" ON public.benefits
  USING (
    status = 'active'
    OR public.has_admin_access()
  );

ALTER POLICY "benefit_clicks_select_admin" ON public.benefit_clicks
  USING (public.has_admin_access());

ALTER POLICY "addons_select_active" ON public.addons
  USING (
    status = 'active'
    OR public.has_admin_access()
  );

ALTER POLICY "addon_entitlements_select" ON public.addon_entitlements
  USING (
    EXISTS (
      SELECT 1
      FROM public.addons a
      WHERE a.id = addon_id
    )
    OR public.has_admin_access()
  );

ALTER POLICY "addon_purchases_select" ON public.addon_purchases
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "user_entitlements_select_own" ON public.user_entitlements
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "subscriptions_select" ON public.subscriptions
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "payments_select_admin" ON public.payments
  USING (public.has_admin_access());

ALTER POLICY "ai_sessions_select_own" ON public.ai_sessions
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "ai_messages_select_own" ON public.ai_messages
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "ai_global_usage_select_admin" ON public.ai_global_usage
  USING (public.has_admin_access());

ALTER POLICY "form_submissions_select" ON public.form_submissions
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "push_tokens_select_own" ON public.push_tokens
  USING (
    user_id = (select auth.uid())
    OR public.has_admin_access()
  );

ALTER POLICY "content_item_objectives_select" ON public.content_item_objectives
  USING (
    EXISTS (
      SELECT 1
      FROM public.content_items ci
      WHERE ci.id = content_item_id
    )
    OR public.has_admin_access()
  );

ALTER POLICY "revenuecat_webhook_events_select_admin" ON public.revenuecat_webhook_events
  USING (public.has_admin_access());

COMMIT;
