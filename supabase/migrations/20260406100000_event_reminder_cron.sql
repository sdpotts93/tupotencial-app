-- =============================================================================
-- pg_cron job: call event-reminder edge function every minute
-- =============================================================================
-- Requires pg_cron and pg_net extensions (enabled by default on Supabase Pro+).
-- The job calls the event-reminder edge function using the service role key.
-- =============================================================================

BEGIN;

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule: every minute, invoke the event-reminder edge function
SELECT cron.schedule(
  'event-reminder-5min',
  '* * * * *',
  $$
  SELECT net.http_post(
    url    := current_setting('app.settings.supabase_url') || '/functions/v1/event-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body   := '{}'::jsonb
  );
  $$
);

COMMIT;
