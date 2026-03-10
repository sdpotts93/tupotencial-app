-- =============================================================================
-- Events table enhancements: plan, entitlement gating, Vimeo Live
-- =============================================================================

BEGIN;

ALTER TABLE public.events ADD COLUMN plan text DEFAULT 'free'
  CHECK (plan IN ('free', 'core'));
ALTER TABLE public.events ADD COLUMN duration text;
ALTER TABLE public.events ADD COLUMN cover_url text;

-- Entitlement gating (same pattern as content_items and programs)
ALTER TABLE public.events ADD COLUMN entitlement_key text;
CREATE INDEX idx_events_entitlement ON public.events (entitlement_key)
  WHERE entitlement_key IS NOT NULL;

-- Vimeo Live support
ALTER TABLE public.events ADD COLUMN vimeo_live_event_id text;

-- Link to content_items when recording is saved as library content
ALTER TABLE public.events ADD COLUMN recording_content_item_id uuid
  REFERENCES public.content_items(id) ON DELETE SET NULL;

COMMIT;
