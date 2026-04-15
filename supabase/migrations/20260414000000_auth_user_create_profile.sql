-- =============================================================================
-- Create profile row automatically when a new auth.users row is inserted.
--
-- Previously the mobile client did a `profiles.upsert()` right after
-- `supabase.auth.signUp()`. That approach silently fails when the Supabase
-- project requires email confirmation: signUp returns a user with no session,
-- so the RLS policy `profiles_insert_own` (which requires auth.uid() = id)
-- blocks the insert. The user's auth row exists but no profile is created,
-- and subsequent registration attempts return "user_already_exists".
--
-- This trigger creates the profile row atomically with the user, bypassing
-- RLS via SECURITY DEFINER. The client can now drop its profile upsert and
-- optionally backfill display_name / email casing later.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ON CONFLICT DO NOTHING so re-creating a deleted auth user (or running
  -- this trigger alongside an existing client-side upsert) is safe.
  INSERT INTO public.profiles (id, email, display_name, community_segment)
  VALUES (
    NEW.id,
    LOWER(TRIM(NEW.email)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Idempotent: drop and recreate.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill profiles for any auth.users rows that slipped through without one
-- (e.g. accounts created before this migration where the client-side upsert
-- failed due to RLS / email confirmation).
INSERT INTO public.profiles (id, email, display_name, community_segment)
SELECT
  u.id,
  LOWER(TRIM(u.email)),
  COALESCE(u.raw_user_meta_data ->> 'display_name', ''),
  NULL
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

COMMIT;
