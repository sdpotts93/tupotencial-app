-- Simplify addons: one-time Stripe purchases with cover image, price, plan gating.
-- Adds addon_purchases table to track user→addon purchases.

-- ── New columns on addons ──────────────────────────────────────────────────
ALTER TABLE public.addons ADD COLUMN cover_url text;
ALTER TABLE public.addons ADD COLUMN price int NOT NULL DEFAULT 0; -- cents MXN
ALTER TABLE public.addons ADD COLUMN plan text NOT NULL DEFAULT 'todos'
  CHECK (plan IN ('todos', 'core'));
ALTER TABLE public.addons ADD COLUMN grants_core_months int; -- null = no grant

-- Allow addons to be created before a Stripe price exists
ALTER TABLE public.addons ALTER COLUMN stripe_price_id DROP NOT NULL;

-- ── addon_purchases ────────────────────────────────────────────────────────
CREATE TABLE public.addon_purchases (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id          uuid NOT NULL REFERENCES public.addons(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text,
  amount            int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_addon_purchases_user_addon
  ON public.addon_purchases (user_id, addon_id);

CREATE INDEX idx_addon_purchases_addon
  ON public.addon_purchases (addon_id);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.addon_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addon_purchases_select" ON public.addon_purchases
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "addon_purchases_insert_admin" ON public.addon_purchases
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "addon_purchases_delete_admin" ON public.addon_purchases
  FOR DELETE USING (public.is_admin());
