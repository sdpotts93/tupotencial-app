-- Add database-level constraints to match admin form required fields.

-- ── Events: description and duration are required ───────────────────────────

ALTER TABLE public.events
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN duration SET NOT NULL;

-- ── Content items: conditional required fields per type ──────────────────────
-- video/audio → subtitle (introducción) and description (texto) required
-- video       → vimeo_id required
-- article     → body required

ALTER TABLE public.content_items
  ADD CONSTRAINT content_items_video_audio_subtitle_required
    CHECK (type NOT IN ('video', 'audio') OR subtitle IS NOT NULL),
  ADD CONSTRAINT content_items_video_audio_description_required
    CHECK (type NOT IN ('video', 'audio') OR description IS NOT NULL),
  ADD CONSTRAINT content_items_video_vimeo_id_required
    CHECK (type != 'video' OR vimeo_id IS NOT NULL),
  ADD CONSTRAINT content_items_article_body_required
    CHECK (type != 'article' OR body IS NOT NULL);
