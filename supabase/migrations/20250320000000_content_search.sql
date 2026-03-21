-- Full-text search on content_items (title + description)
-- Uses ts_vector with Spanish configuration for proper stemming

-- Add a generated tsvector column for fast full-text search
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

-- GIN index for fast lookups
CREATE INDEX IF NOT EXISTS idx_content_items_fts ON public.content_items USING gin(fts);

-- RPC function: search published content by query string
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
AS $$
  SELECT
    ci.id,
    ci.title,
    ci.type,
    ci.duration_seconds,
    ci.thumbnail_url,
    ci.entitlement_key,
    (SELECT cc.title FROM content_item_categories cic
     JOIN content_categories cc ON cc.id = cic.category_id
     WHERE cic.content_item_id = ci.id
     LIMIT 1) AS category_title,
    ts_rank(ci.fts, websearch_to_tsquery('spanish', search_query)) AS rank
  FROM content_items ci
  WHERE ci.status = 'published'
    AND ci.fts @@ websearch_to_tsquery('spanish', search_query)
  ORDER BY rank DESC
  LIMIT max_results;
$$;
