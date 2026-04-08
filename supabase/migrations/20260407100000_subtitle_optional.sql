-- Make subtitle (introducción) optional for video/audio content items.
ALTER TABLE public.content_items
  DROP CONSTRAINT content_items_video_audio_subtitle_required;

-- Make description optional for events.
ALTER TABLE public.events
  ALTER COLUMN description DROP NOT NULL;
