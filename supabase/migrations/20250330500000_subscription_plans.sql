-- ---------------------------------------------------------------------------
-- Subscription plans — editable catalog of subscription tiers
-- ---------------------------------------------------------------------------

CREATE TABLE public.subscription_plans (
  id         text PRIMARY KEY,              -- 'free', 'core'
  title      text NOT NULL,
  description text,
  price      int NOT NULL DEFAULT 0,        -- cents MXN
  interval   text NOT NULL DEFAULT 'month'
    CHECK (interval IN ('month', 'year')),
  cover_url  text,
  updated_at timestamptz
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read plans
CREATE POLICY "subscription_plans_select" ON public.subscription_plans
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "subscription_plans_update_admin" ON public.subscription_plans
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- No insert/delete via RLS — plans are seeded
-- Admins can only edit existing rows

-- Seed the two plans
INSERT INTO public.subscription_plans (id, title, description, price, interval) VALUES
  ('free', 'Gratis', 'Reflexiones diarias y contenido básico para comenzar tu camino.', 0, 'month'),
  ('core', 'Core', 'Acceso completo a programas, comunidad y herramientas de cambio.', 39900, 'month');
