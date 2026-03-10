ALTER TABLE public.content_items ADD COLUMN entitlement_key text;
ALTER TABLE public.programs ADD COLUMN entitlement_key text;

CREATE INDEX idx_content_items_entitlement ON public.content_items (entitlement_key) WHERE entitlement_key IS NOT NULL;
CREATE INDEX idx_programs_entitlement ON public.programs (entitlement_key) WHERE entitlement_key IS NOT NULL;
