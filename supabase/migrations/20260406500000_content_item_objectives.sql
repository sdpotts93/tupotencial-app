-- ---------------------------------------------------------------------------
-- content_item_objectives (m2m junction, mirrors content_item_categories)
-- ---------------------------------------------------------------------------

CREATE TABLE public.content_item_objectives (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  objective_id    uuid NOT NULL REFERENCES public.content_objectives(id) ON DELETE CASCADE,
  position        int NOT NULL DEFAULT 0,
  UNIQUE (content_item_id, objective_id)
);

ALTER TABLE public.content_item_objectives ENABLE ROW LEVEL SECURITY;

-- RLS: follows content_items access (same pattern as content_item_categories)
DROP POLICY IF EXISTS "content_item_objectives_select" ON public.content_item_objectives;
CREATE POLICY "content_item_objectives_select" ON public.content_item_objectives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.content_items ci
      WHERE ci.id = content_item_id
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "content_item_objectives_insert_admin" ON public.content_item_objectives;
CREATE POLICY "content_item_objectives_insert_admin" ON public.content_item_objectives
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_item_objectives_update_admin" ON public.content_item_objectives;
CREATE POLICY "content_item_objectives_update_admin" ON public.content_item_objectives
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_item_objectives_delete_admin" ON public.content_item_objectives;
CREATE POLICY "content_item_objectives_delete_admin" ON public.content_item_objectives
  FOR DELETE USING (public.is_admin());

-- Migrate existing objective_id data into junction table
INSERT INTO public.content_item_objectives (content_item_id, objective_id, position)
SELECT id, objective_id, 0
FROM public.content_items
WHERE objective_id IS NOT NULL
ON CONFLICT DO NOTHING;
