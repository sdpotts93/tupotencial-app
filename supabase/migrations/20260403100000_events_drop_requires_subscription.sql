-- Drop legacy requires_subscription column from events.
-- Gating is now fully handled by `plan` ('free' | 'core') and `entitlement_key`.

-- 1. Remove the column
ALTER TABLE public.events DROP COLUMN IF EXISTS requires_subscription;

-- 2. Recreate get_secure_event without requires_subscription references
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

  RETURN json_build_object(
    'id',                   v_row.id,
    'title',                v_row.title,
    'description',          v_row.description,
    'start_at',             v_row.start_at,
    'end_at',               v_row.end_at,
    'community_segment',    v_row.community_segment,
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
