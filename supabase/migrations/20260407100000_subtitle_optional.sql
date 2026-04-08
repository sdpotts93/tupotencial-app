-- Make subtitle (introducción) optional for video/audio content items.
ALTER TABLE public.content_items
  DROP CONSTRAINT content_items_video_audio_subtitle_required;

-- Make description, duration, and start_at optional for events
-- (Vimeo imports won't have these; hidden from app users until filled in).
ALTER TABLE public.events
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN duration DROP NOT NULL,
  ALTER COLUMN start_at DROP NOT NULL;
