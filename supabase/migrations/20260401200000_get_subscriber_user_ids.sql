-- RPC: get_subscriber_user_ids
-- Returns all user_ids that have an active subscription.
-- Used by admin usuarios page to filter without hitting row limits.

CREATE OR REPLACE FUNCTION public.get_subscriber_user_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT user_id FROM public.subscriptions WHERE status = 'active';
$$;
