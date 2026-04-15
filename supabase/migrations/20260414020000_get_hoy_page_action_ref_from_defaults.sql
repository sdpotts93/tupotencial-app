-- get_hoy_page: also resolve action_ref from hoy_defaults (app_settings) when
-- the daily plan doesn't supply the relevant fields. Mirrors the client's
-- per-field merge of daily_plan over hoy_defaults so the mobile app never
-- has to do a second round-trip to hydrate the form/content reference.
--
-- Without this, switching the default action_type in /hoy admin (e.g. from
-- talk_to_ai to formulario) left action_ref null on the next fetch, and the
-- mobile sheet silently fell through to its generic "cumplí" branch while a
-- client-side fallback query was still in flight.

CREATE OR REPLACE FUNCTION public.get_hoy_page(p_date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_settings       jsonb := '{}'::jsonb;
  v_plan           jsonb := 'null'::jsonb;
  v_content        jsonb := '[]'::jsonb;
  v_action_ref     jsonb := 'null'::jsonb;
  v_recent_config  jsonb;
  v_mode           text;
  v_selected_ids   jsonb;
  v_defaults       jsonb;
  v_plan_type      text;
  v_default_type   text;
  v_plan_payload   jsonb;
  v_action_type    text;
  v_content_id     text;
  v_form_id        text;
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

  -- 2b. Resolve the effective action reference by merging the daily plan
  -- over hoy_defaults, matching the mobile client's resolution rules.
  v_defaults     := COALESCE(v_settings -> 'hoy_defaults', '{}'::jsonb);
  v_plan_type    := v_plan ->> 'primary_action_type';
  v_plan_payload := COALESCE(v_plan -> 'primary_action_payload', '{}'::jsonb);

  -- Normalize hoy_defaults.action_type (admin uses Spanish slugs) to the
  -- canonical form that daily_plans and the mobile UI use.
  v_default_type := CASE v_defaults ->> 'action_type'
    WHEN 'formulario'  THEN 'form'
    WHEN 'contenido'   THEN 'content'
    WHEN 'talk_to_ai'  THEN 'ai_prompt'
    ELSE v_defaults ->> 'action_type'
  END;

  v_action_type := COALESCE(NULLIF(v_plan_type, ''), v_default_type);
  v_content_id  := COALESCE(NULLIF(v_plan_payload ->> 'content_id', ''), v_defaults ->> 'content_id');
  v_form_id     := COALESCE(NULLIF(v_plan_payload ->> 'form_id', ''),    v_defaults ->> 'form_id');

  IF v_action_type = 'content' AND v_content_id IS NOT NULL THEN
    SELECT to_jsonb(ci)
      INTO v_action_ref
      FROM (
        SELECT ci.id, ci.type, ci.title, ci.thumbnail_url, ci.duration_seconds
          FROM public.content_items ci
         WHERE ci.id = v_content_id::uuid
      ) ci;
  ELSIF v_action_type = 'form' AND v_form_id IS NOT NULL THEN
    SELECT to_jsonb(f)
      INTO v_action_ref
      FROM (
        SELECT f.id, f.title, f.description, f.fields
          FROM public.forms f
         WHERE f.id = v_form_id::uuid
           AND f.status = 'active'
      ) f;
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
    'settings',   COALESCE(v_settings, '{}'::jsonb),
    'daily_plan', v_plan,
    'action_ref', v_action_ref,
    'content',    v_content
  );
END;
$$;
