-- Allows unauthenticated users to check whether an email is registered.
-- Returns a simple boolean — no user data is exposed.
create or replace function check_email_exists(p_email text)
returns boolean
language sql
security definer
stable
as $$
  select exists(select 1 from auth.users where email = lower(trim(p_email)));
$$;

-- Allow anonymous (not-yet-logged-in) callers
grant execute on function check_email_exists(text) to anon;
grant execute on function check_email_exists(text) to authenticated;
