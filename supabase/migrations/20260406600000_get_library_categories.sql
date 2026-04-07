-- Returns categories with up to N items each using a LATERAL join.
-- Single round-trip, per-category limit, ordered by sort_order / position.

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
  FROM content_categories cc
  CROSS JOIN LATERAL (
    SELECT ci.id, ci.title, ci.type, ci.plan,
           ci.duration_seconds, ci.thumbnail_url, ci.entitlement_key,
           cic.position
    FROM content_item_categories cic
    JOIN content_items ci ON ci.id = cic.content_item_id
    WHERE cic.category_id = cc.id
      AND ci.status = 'published'
    ORDER BY cic.position
    LIMIT items_per_category
  ) li
  WHERE cc.status = 'active'
  ORDER BY cc.sort_order, li.position;
$$;
