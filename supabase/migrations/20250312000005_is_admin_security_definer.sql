-- Fix infinite recursion: is_admin() queries admin_users which has RLS
-- that calls is_admin(). SECURITY DEFINER bypasses RLS for this function.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = (select auth.uid())
  );
$$;
