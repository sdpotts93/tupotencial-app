-- =============================================================================
-- event_registrations: let the DB handle user_id via auth.uid()
-- and expose RPC functions so the client never sends user_id
-- =============================================================================

BEGIN;

-- Default user_id to the authenticated user
ALTER TABLE public.event_registrations
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Register for an event (upsert: re-registers if previously cancelled)
CREATE OR REPLACE FUNCTION public.register_for_event(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  INSERT INTO event_registrations (event_id, user_id, status)
  VALUES (p_event_id, auth.uid(), 'registered')
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET status = 'registered';
END;
$$;

-- Unregister from an event
CREATE OR REPLACE FUNCTION public.unregister_from_event(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE event_registrations
  SET status = 'cancelled'
  WHERE event_id = p_event_id
    AND user_id = auth.uid();
END;
$$;

-- Check registration status for the current user
CREATE OR REPLACE FUNCTION public.get_event_registration(p_event_id uuid)
RETURNS TABLE(id uuid, status text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT id, status
  FROM event_registrations
  WHERE event_id = p_event_id
    AND user_id = auth.uid();
$$;

COMMIT;
