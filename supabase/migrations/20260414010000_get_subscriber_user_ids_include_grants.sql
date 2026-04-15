BEGIN;

-- Bring get_subscriber_user_ids() in line with user_is_subscriber():
-- a user counts as a subscriber if they have an active/trialing subscription
-- OR a non-expired subscription_access_grant (e.g. from an add-on purchase).
CREATE OR REPLACE FUNCTION public.get_subscriber_user_ids()
RETURNS SETOF uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_admin_access() THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT user_id
    FROM public.subscriptions
    WHERE status IN ('active', 'trialing')
    UNION
    SELECT user_id
    FROM public.subscription_access_grants
    WHERE ends_at > now();
END;
$$;

COMMIT;
