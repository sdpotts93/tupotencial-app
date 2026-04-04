-- Events must start at least 10 minutes in the future when created.
CREATE OR REPLACE FUNCTION public.check_event_start_at_future()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.start_at <= clock_timestamp() + interval '10 minutes' THEN
    RAISE EXCEPTION 'start_at must be at least 10 minutes in the future'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_events_start_at_future
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.check_event_start_at_future();
