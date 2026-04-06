-- =============================================================================
-- Add reminder_sent_at to event_registrations for tracking 5-min reminders
-- =============================================================================

BEGIN;

ALTER TABLE public.event_registrations
  ADD COLUMN reminder_sent_at timestamptz;

-- Index: find registrations needing reminders efficiently
CREATE INDEX idx_event_reg_reminder_pending
  ON public.event_registrations (event_id)
  WHERE status = 'registered' AND reminder_sent_at IS NULL;

COMMIT;
