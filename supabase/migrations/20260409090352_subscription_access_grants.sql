BEGIN;

CREATE TABLE public.subscription_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('addon', 'admin')),
  source_ref text NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, source, source_ref),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_subscription_access_grants_user_ends_at
  ON public.subscription_access_grants (user_id, ends_at);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.subscription_access_grants
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.subscription_access_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription_access_grants_select_own" ON public.subscription_access_grants;
CREATE POLICY "subscription_access_grants_select_own" ON public.subscription_access_grants
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "subscription_access_grants_select_admin" ON public.subscription_access_grants;
CREATE POLICY "subscription_access_grants_select_admin" ON public.subscription_access_grants
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

INSERT INTO public.user_entitlements (user_id, entitlement_key, source, source_ref)
SELECT
  ap.user_id,
  ae.entitlement_key,
  'addon',
  ae.addon_id::text
FROM public.addon_purchases ap
JOIN public.addon_entitlements ae
  ON ae.addon_id = ap.addon_id
LEFT JOIN public.user_entitlements ue
  ON ue.user_id = ap.user_id
 AND ue.entitlement_key = ae.entitlement_key
WHERE ue.id IS NULL;

INSERT INTO public.subscription_access_grants (user_id, source, source_ref, starts_at, ends_at)
SELECT
  ap.user_id,
  'addon',
  ap.addon_id::text,
  ap.created_at,
  ap.created_at + make_interval(months => a.grants_core_months)
FROM public.addon_purchases ap
JOIN public.addons a
  ON a.id = ap.addon_id
WHERE a.grants_core_months IS NOT NULL
  AND a.grants_core_months > 0
ON CONFLICT (user_id, source, source_ref) DO NOTHING;

CREATE OR REPLACE FUNCTION public.user_is_subscriber()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = (select auth.uid())
      AND status IN ('active', 'trialing')
  )
  OR EXISTS(
    SELECT 1
    FROM public.subscription_access_grants
    WHERE user_id = (select auth.uid())
      AND ends_at > now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_is_subscriber() TO authenticated;

COMMIT;
