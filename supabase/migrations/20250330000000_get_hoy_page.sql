-- RPC: get_hoy_page
-- Returns all non-user-specific data needed for the mobile Hoy screen in one call:
--   - app_settings (hoy_defaults, hoy_recent_content, hoy_explore_sections)
--   - today's published daily plan
--   - resolved content items (respects manual/automatic mode from settings)
--
-- Requires authenticated user (same as app_settings SELECT policy).

CREATE OR REPLACE FUNCTION public.get_hoy_page(p_date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER
AS $$
DECLARE
  v_settings      jsonb := '{}'::jsonb;
  v_plan          jsonb := 'null'::jsonb;
  v_content       jsonb := '[]'::jsonb;
  v_recent_config jsonb;
  v_mode          text;
  v_selected_ids  jsonb;
BEGIN
  -- 1. Collect app_settings into a keyed object
  SELECT jsonb_object_agg(key, value)
    INTO v_settings
    FROM public.app_settings
   WHERE key IN ('hoy_defaults', 'hoy_recent_content', 'hoy_explore_sections');

  -- 2. Today's published daily plan (latest if multiple)
  SELECT to_jsonb(dp.*)
    INTO v_plan
    FROM public.daily_plans dp
   WHERE dp.date = p_date
     AND dp.status = 'published'
   ORDER BY dp.created_at DESC
   LIMIT 1;

  -- 3. Resolve content items based on recent-content mode
  v_recent_config := v_settings -> 'hoy_recent_content';
  v_mode          := COALESCE(v_recent_config ->> 'mode', 'automatic');
  v_selected_ids  := v_recent_config -> 'selected_ids';

  IF v_mode = 'manual' AND v_selected_ids IS NOT NULL AND jsonb_array_length(v_selected_ids) > 0 THEN
    SELECT COALESCE(jsonb_agg(to_jsonb(ci)), '[]'::jsonb)
      INTO v_content
      FROM (
        SELECT ci.id, ci.type, ci.title, ci.thumbnail_url, ci.duration_seconds
          FROM public.content_items ci
         WHERE ci.status = 'published'
           AND ci.id IN (SELECT (jsonb_array_elements_text(v_selected_ids))::uuid)
      ) ci;
  ELSE
    SELECT COALESCE(jsonb_agg(to_jsonb(ci)), '[]'::jsonb)
      INTO v_content
      FROM (
        SELECT ci.id, ci.type, ci.title, ci.thumbnail_url, ci.duration_seconds
          FROM public.content_items ci
         WHERE ci.status = 'published'
         ORDER BY ci.published_at DESC
         LIMIT 3
      ) ci;
  END IF;

  RETURN jsonb_build_object(
    'settings', COALESCE(v_settings, '{}'::jsonb),
    'daily_plan', v_plan,
    'content', v_content
  );
END;
$$;

-- Grant execute to authenticated users (RLS on underlying tables still applies via SECURITY INVOKER)
GRANT EXECUTE ON FUNCTION public.get_hoy_page(date) TO authenticated;
