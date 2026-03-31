-- Add entitlement_key and plan to get_hoy_page content results
-- so the frontend can show lock UI on gated content.

CREATE OR REPLACE FUNCTION public.get_hoy_page(p_date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER
AS $$
DECLARE
  v_settings      jsonb := '{}'::jsonb;
  v_plan          jsonb := 'null'::jsonb;
  v_content       jsonb := '[]'::jsonb;
  v_action_ref    jsonb := 'null'::jsonb;
  v_recent_config jsonb;
  v_mode          text;
  v_selected_ids  jsonb;
  v_action_type   text;
  v_payload       jsonb;
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

  -- 2b. Resolve the action reference (content item or form) from the daily plan
  IF v_plan IS NOT NULL AND v_plan != 'null'::jsonb THEN
    v_action_type := v_plan ->> 'primary_action_type';
    v_payload     := v_plan -> 'primary_action_payload';

    IF v_action_type = 'content' AND v_payload ->> 'content_id' IS NOT NULL THEN
      SELECT to_jsonb(ci)
        INTO v_action_ref
        FROM (
          SELECT ci.id, ci.type, ci.title, ci.thumbnail_url, ci.duration_seconds
            FROM public.content_items ci
           WHERE ci.id = (v_payload ->> 'content_id')::uuid
        ) ci;
    ELSIF v_action_type = 'form' AND v_payload ->> 'form_id' IS NOT NULL THEN
      SELECT to_jsonb(f)
        INTO v_action_ref
        FROM (
          SELECT f.id, f.title, f.description, f.fields
            FROM public.forms f
           WHERE f.id = (v_payload ->> 'form_id')::uuid
             AND f.status = 'active'
        ) f;
    END IF;
  END IF;

  -- 3. Resolve content items based on recent-content mode
  v_recent_config := v_settings -> 'hoy_recent_content';
  v_mode          := COALESCE(v_recent_config ->> 'mode', 'automatic');
  v_selected_ids  := v_recent_config -> 'selected_ids';

  IF v_mode = 'manual' AND v_selected_ids IS NOT NULL AND jsonb_array_length(v_selected_ids) > 0 THEN
    SELECT COALESCE(jsonb_agg(to_jsonb(ci)), '[]'::jsonb)
      INTO v_content
      FROM (
        SELECT ci.id, ci.type, ci.title, ci.thumbnail_url, ci.duration_seconds,
               ci.entitlement_key, ci.plan
          FROM public.content_items ci
         WHERE ci.status = 'published'
           AND ci.id IN (SELECT (jsonb_array_elements_text(v_selected_ids))::uuid)
      ) ci;
  ELSE
    SELECT COALESCE(jsonb_agg(to_jsonb(ci)), '[]'::jsonb)
      INTO v_content
      FROM (
        SELECT ci.id, ci.type, ci.title, ci.thumbnail_url, ci.duration_seconds,
               ci.entitlement_key, ci.plan
          FROM public.content_items ci
         WHERE ci.status = 'published'
         ORDER BY ci.published_at DESC
         LIMIT 5
      ) ci;
  END IF;

  RETURN jsonb_build_object(
    'settings', COALESCE(v_settings, '{}'::jsonb),
    'daily_plan', v_plan,
    'action_ref', v_action_ref,
    'content', v_content
  );
END;
$$;
