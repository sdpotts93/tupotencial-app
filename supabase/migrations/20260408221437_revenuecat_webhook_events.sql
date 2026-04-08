BEGIN;

CREATE TABLE IF NOT EXISTS public.revenuecat_webhook_events (
  id text PRIMARY KEY,
  app_user_id text,
  event_type text NOT NULL,
  environment text,
  store text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revenuecat_webhook_events_app_user_id_idx
  ON public.revenuecat_webhook_events (app_user_id);

ALTER TABLE public.revenuecat_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "revenuecat_webhook_events_select_admin" ON public.revenuecat_webhook_events;
CREATE POLICY "revenuecat_webhook_events_select_admin"
  ON public.revenuecat_webhook_events
  FOR SELECT
  USING (public.is_admin());

COMMIT;
