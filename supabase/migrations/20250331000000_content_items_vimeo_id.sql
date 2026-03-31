-- Add vimeo_id column to content_items (matches events table pattern)
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS vimeo_id text;

-- Update secure content function to return vimeo_id
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
    'vimeo_id',         CASE WHEN v_has_access THEN v_row.vimeo_id ELSE NULL END,
    'thumbnail_url',    v_row.thumbnail_url,
    'duration_seconds', v_row.duration_seconds,
    'entitlement_key',  v_row.entitlement_key,
    'plan',             v_row.plan,
    'access_granted',   v_has_access
  );
END;
$$;
