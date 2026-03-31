-- Secure content & event playback access
-- Checks entitlement_key and plan before returning sensitive media URLs

-- ─── Helper: check if current user has a given entitlement ───
CREATE OR REPLACE FUNCTION public.user_has_entitlement(p_key text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = auth.uid()
      AND entitlement_key = p_key
  );
$$;

-- ─── Helper: check if current user has an active subscription ───
CREATE OR REPLACE FUNCTION public.user_is_subscriber()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status IN ('active', 'trialing')
  );
$$;

-- ─── Secure content playback ───
-- Returns content detail; nulls media_url if user lacks access
CREATE OR REPLACE FUNCTION public.get_secure_content(p_content_id uuid)
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_row public.content_items%ROWTYPE;
  v_has_access boolean := true;
BEGIN
  SELECT * INTO v_row
  FROM public.content_items
  WHERE id = p_content_id AND status = 'published';

  IF v_row.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check entitlement gate
  IF v_row.entitlement_key IS NOT NULL THEN
    IF NOT public.user_has_entitlement(v_row.entitlement_key) THEN
      v_has_access := false;
    END IF;
  END IF;

  -- Check plan gate
  IF v_has_access AND v_row.plan = 'core' THEN
    IF NOT public.user_is_subscriber() THEN
      v_has_access := false;
    END IF;
  END IF;

  RETURN json_build_object(
    'id',               v_row.id,
    'title',            v_row.title,
    'subtitle',         v_row.subtitle,
    'type',             v_row.type,
    'description',      v_row.description,
    'body',             CASE WHEN v_has_access THEN v_row.body ELSE NULL END,
    'external_url',     CASE WHEN v_has_access THEN v_row.external_url ELSE NULL END,
    'media_url',        CASE WHEN v_has_access THEN v_row.media_url ELSE NULL END,
    'thumbnail_url',    v_row.thumbnail_url,
    'duration_seconds', v_row.duration_seconds,
    'entitlement_key',  v_row.entitlement_key,
    'plan',             v_row.plan,
    'access_granted',   v_has_access
  );
END;
$$;

-- ─── Secure event access ───
-- Returns event detail; nulls vimeo fields if user lacks access
CREATE OR REPLACE FUNCTION public.get_secure_event(p_event_id uuid)
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_row public.events%ROWTYPE;
  v_has_access boolean := true;
BEGIN
  SELECT * INTO v_row
  FROM public.events
  WHERE id = p_event_id AND status = 'published';

  IF v_row.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check entitlement gate
  IF v_row.entitlement_key IS NOT NULL THEN
    IF NOT public.user_has_entitlement(v_row.entitlement_key) THEN
      v_has_access := false;
    END IF;
  END IF;

  -- Check plan gate (core events require subscription)
  IF v_has_access AND v_row.plan = 'core' THEN
    IF NOT public.user_is_subscriber() THEN
      v_has_access := false;
    END IF;
  END IF;

  -- Check requires_subscription flag
  IF v_has_access AND v_row.requires_subscription THEN
    IF NOT public.user_is_subscriber() THEN
      v_has_access := false;
    END IF;
  END IF;

  RETURN json_build_object(
    'id',                   v_row.id,
    'title',                v_row.title,
    'description',          v_row.description,
    'start_at',             v_row.start_at,
    'end_at',               v_row.end_at,
    'community_segment',    v_row.community_segment,
    'requires_subscription', v_row.requires_subscription,
    'plan',                 v_row.plan,
    'duration',             v_row.duration,
    'cover_url',            v_row.cover_url,
    'entitlement_key',      v_row.entitlement_key,
    'vimeo_url',            CASE WHEN v_has_access THEN v_row.vimeo_url ELSE NULL END,
    'vimeo_id',             CASE WHEN v_has_access THEN v_row.vimeo_id ELSE NULL END,
    'vimeo_live_event_id',  CASE WHEN v_has_access THEN v_row.vimeo_live_event_id ELSE NULL END,
    'status',               v_row.status,
    'access_granted',       v_has_access
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.user_has_entitlement(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_subscriber() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secure_content(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secure_event(uuid) TO authenticated;
