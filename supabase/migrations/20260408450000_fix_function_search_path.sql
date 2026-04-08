-- Fix: set immutable search_path on all public functions to prevent
-- search_path injection (Supabase lint: function_search_path_mutable).

-- Functions that already use fully-qualified table names — just ALTER.
ALTER FUNCTION public.get_hoy_page(date)                    SET search_path = '';
ALTER FUNCTION public.user_has_entitlement(text)            SET search_path = '';
ALTER FUNCTION public.user_is_subscriber()                  SET search_path = '';
ALTER FUNCTION public.get_secure_content(uuid)              SET search_path = '';
ALTER FUNCTION public.count_completed_days()                SET search_path = '';
ALTER FUNCTION public.check_email_exists(text)              SET search_path = '';
ALTER FUNCTION public.get_secure_event(uuid)                SET search_path = '';
ALTER FUNCTION public.check_event_start_at_future()         SET search_path = '';

-- get_library_categories: recreate with qualified table names + search_path
CREATE OR REPLACE FUNCTION public.get_library_categories(items_per_category int DEFAULT 10)
RETURNS TABLE (
  category_id   uuid,
  category_title text,
  category_slug  text,
  item_id        uuid,
  item_title     text,
  item_type      text,
  item_plan      text,
  duration_seconds int,
  thumbnail_url  text,
  entitlement_key text,
  item_position  int
)
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT
    cc.id          AS category_id,
    cc.title       AS category_title,
    cc.slug        AS category_slug,
    li.id          AS item_id,
    li.title       AS item_title,
    li.type        AS item_type,
    li.plan        AS item_plan,
    li.duration_seconds,
    li.thumbnail_url,
    li.entitlement_key,
    li.position    AS item_position
  FROM public.content_categories cc
  CROSS JOIN LATERAL (
    SELECT ci.id, ci.title, ci.type, ci.plan,
           ci.duration_seconds, ci.thumbnail_url, ci.entitlement_key,
           cic.position
    FROM public.content_item_categories cic
    JOIN public.content_items ci ON ci.id = cic.content_item_id
    WHERE cic.category_id = cc.id
      AND ci.status = 'published'
    ORDER BY cic.position
    LIMIT items_per_category
  ) li
  WHERE cc.is_active = true
  ORDER BY cc.sort_order, li.position;
$$;

-- search_content: recreate with qualified table names + search_path
CREATE OR REPLACE FUNCTION public.search_content(search_query text, max_results int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  title text,
  type text,
  duration_seconds int,
  thumbnail_url text,
  entitlement_key text,
  category_title text,
  rank real
)
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT
    ci.id,
    ci.title,
    ci.type,
    ci.duration_seconds,
    ci.thumbnail_url,
    ci.entitlement_key,
    (SELECT cc.title FROM public.content_item_categories cic
     JOIN public.content_categories cc ON cc.id = cic.category_id
     WHERE cic.content_item_id = ci.id
     LIMIT 1) AS category_title,
    ts_rank(ci.fts, websearch_to_tsquery('spanish', search_query)) AS rank
  FROM public.content_items ci
  WHERE ci.status = 'published'
    AND ci.fts @@ websearch_to_tsquery('spanish', search_query)
  ORDER BY rank DESC
  LIMIT max_results;
$$;
