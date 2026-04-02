-- RPC: count_completed_days
-- Returns the number of distinct days where the user completed both daily retos
-- (has both a 'checkin' and 'accion' entry for the same date).

CREATE OR REPLACE FUNCTION public.count_completed_days()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT coalesce(count(*), 0)::int
  FROM (
    SELECT date
    FROM public.daily_checkins
    WHERE user_id = auth.uid()
    GROUP BY date
    HAVING count(DISTINCT type) = 2
  ) completed;
$$;
