-- =============================================================================
-- Tu Potencial MVP — Initial Schema Migration
-- =============================================================================
-- This migration creates the complete database schema for the Tu Potencial
-- application including tables, indexes, triggers, RLS policies, and helper
-- functions.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
-- gen_random_uuid() is available by default on Supabase (pgcrypto), but ensure
-- the extension is present.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Helper: updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ===========================================================================
--  TABLES
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 6.1 Auth / Profiles / Roles
-- ---------------------------------------------------------------------------

-- profiles -----------------------------------------------------------------
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url  text,
  community_segment text NOT NULL
    CHECK (community_segment IN ('gabriel', 'carlotta', 'conjunta')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz
);

-- admin_users --------------------------------------------------------------
CREATE TABLE public.admin_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('admin', 'editor', 'read_only')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.2 Content library (on-demand)
-- ---------------------------------------------------------------------------

-- content_objectives -------------------------------------------------------
CREATE TABLE public.content_objectives (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title    text NOT NULL,
  slug     text UNIQUE NOT NULL,
  position int NOT NULL DEFAULT 0
);

-- content_categories -------------------------------------------------------
CREATE TABLE public.content_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  icon_url    text,
  is_active   boolean NOT NULL DEFAULT true,
  status      text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden')),
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz
);

-- content_items ------------------------------------------------------------
CREATE TABLE public.content_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text NOT NULL CHECK (type IN ('video', 'audio', 'article', 'link')),
  title             text NOT NULL,
  subtitle          text,
  description       text,
  body              text,
  media_url         text,
  external_url      text,
  thumbnail_url     text,
  duration_seconds  int,
  entitlement_key   text,
  plan              text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'core')),
  objective_id      uuid REFERENCES public.content_objectives(id),
  status            text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at      timestamptz,
  available_from    timestamptz,
  available_to      timestamptz,
  community_segment text
    CHECK (community_segment IS NULL OR community_segment IN ('gabriel', 'carlotta', 'conjunta')),
  created_by        uuid REFERENCES auth.users(id),
  updated_by        uuid REFERENCES auth.users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz
);

-- content_item_categories (m2m + ordering) ---------------------------------
CREATE TABLE public.content_item_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  category_id     uuid NOT NULL REFERENCES public.content_categories(id) ON DELETE CASCADE,
  position        int NOT NULL DEFAULT 0,
  UNIQUE (content_item_id, category_id)
);

-- ---------------------------------------------------------------------------
-- 6.2b Forms
-- ---------------------------------------------------------------------------

-- forms --------------------------------------------------------------------
CREATE TABLE public.forms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  fields      jsonb NOT NULL DEFAULT '[]'::jsonb,
  status      text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- 6.3 Programs / Challenges / Bootcamps
-- ---------------------------------------------------------------------------

-- programs -----------------------------------------------------------------
CREATE TABLE public.programs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text NOT NULL CHECK (type IN ('program', 'reto', 'bootcamp')),
  title             text NOT NULL,
  description       text,
  entitlement_key   text,
  plan              text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'core')),
  cover_url         text,
  status            text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  community_segment text
    CHECK (community_segment IS NULL OR community_segment IN ('gabriel', 'carlotta', 'conjunta')),
  is_active         boolean NOT NULL DEFAULT true,
  start_date        date,
  end_date          date,
  created_by        uuid,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz
);

-- program_days -------------------------------------------------------------
CREATE TABLE public.program_days (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  day_index   int NOT NULL,
  title       text,
  description text,
  UNIQUE (program_id, day_index)
);

-- program_day_items --------------------------------------------------------
CREATE TABLE public.program_day_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_day_id  uuid NOT NULL REFERENCES public.program_days(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES public.content_items(id),
  type            text NOT NULL DEFAULT 'content' CHECK (type IN ('content', 'form', 'ai_prompt')),
  form_id         uuid REFERENCES public.forms(id),
  position        int NOT NULL DEFAULT 0
);

-- program_enrollments ------------------------------------------------------
CREATE TABLE public.program_enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, user_id)
);

-- program_checkins ---------------------------------------------------------
CREATE TABLE public.program_checkins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index   int NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.4 "Today" (daily experience)
-- ---------------------------------------------------------------------------

-- daily_plans --------------------------------------------------------------
CREATE TABLE public.daily_plans (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date                     date NOT NULL,
  community_segment        text
    CHECK (community_segment IS NULL OR community_segment IN ('gabriel', 'carlotta', 'conjunta')),
  title                    text,
  message                  text,
  badge_share_text         text,
  badge_title              text,
  badge_subtitle           text,
  primary_action_type      text NOT NULL
    CHECK (primary_action_type IN ('content', 'program_day', 'custom', 'ai_prompt', 'form')),
  primary_action_ref       uuid,
  primary_action_payload   jsonb NOT NULL DEFAULT '{}'::jsonb,
  status                   text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'published', 'archived')),
  created_by               uuid,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz,
  UNIQUE (date, community_segment)
);

-- daily_checkins -----------------------------------------------------------
CREATE TABLE public.daily_checkins (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date       date NOT NULL,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (date, user_id)
);

-- user_streaks (optional — MVP can compute on the fly) ---------------------
CREATE TABLE public.user_streaks (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak   int NOT NULL DEFAULT 0,
  best_streak      int NOT NULL DEFAULT 0,
  last_checkin_date date,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.5 Community (feed / comments / reactions)
-- ---------------------------------------------------------------------------

-- posts --------------------------------------------------------------------
CREATE TABLE public.posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id  uuid REFERENCES auth.users(id),
  is_official     boolean NOT NULL DEFAULT false,
  community_segment text
    CHECK (community_segment IS NULL OR community_segment IN ('gabriel', 'carlotta', 'conjunta')),
  title           text,
  body            text NOT NULL,
  media_url       text,
  status          text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'hidden')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

-- post_comments ------------------------------------------------------------
CREATE TABLE public.post_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       text NOT NULL,
  status     text NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'hidden')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- post_reactions -----------------------------------------------------------
CREATE TABLE public.post_reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, reaction)
);

-- ---------------------------------------------------------------------------
-- 6.6 Events / Lives (Vimeo + gating)
-- ---------------------------------------------------------------------------

-- events -------------------------------------------------------------------
CREATE TABLE public.events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  description           text,
  start_at              timestamptz NOT NULL,
  end_at                timestamptz,
  community_segment     text
    CHECK (community_segment IS NULL OR community_segment IN ('gabriel', 'carlotta', 'conjunta')),
  requires_subscription boolean NOT NULL DEFAULT true,
  plan                  text DEFAULT 'free' CHECK (plan IN ('free', 'core')),
  duration              text,
  cover_url             text,
  entitlement_key       text,
  vimeo_url             text,
  vimeo_id              text,
  vimeo_live_event_id   text,
  status                text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'hidden', 'cancelled')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);

-- event_registrations ------------------------------------------------------
CREATE TABLE public.event_registrations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status     text NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'cancelled', 'attended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 6.7 Benefits (external links + tracking)
-- ---------------------------------------------------------------------------

-- benefits -----------------------------------------------------------------
CREATE TABLE public.benefits (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  url          text NOT NULL,
  utm_template text,
  code         text,
  cover_url    text,
  plan         text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'core')),
  status       text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  position     int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz
);

-- benefit_clicks -----------------------------------------------------------
CREATE TABLE public.benefit_clicks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_id  uuid NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.8 Add-ons / VIP (entitlements)
-- ---------------------------------------------------------------------------

-- addons -------------------------------------------------------------------
CREATE TABLE public.addons (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  stripe_price_id  text,
  cover_url        text,
  price            int NOT NULL DEFAULT 0,
  plan             text NOT NULL DEFAULT 'todos' CHECK (plan IN ('todos', 'core')),
  grants_core_months int,
  status           text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz
);

-- addon_entitlements -------------------------------------------------------
CREATE TABLE public.addon_entitlements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id        uuid NOT NULL REFERENCES public.addons(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  UNIQUE (addon_id, entitlement_key)
);

-- addon_purchases ----------------------------------------------------------
CREATE TABLE public.addon_purchases (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id          uuid NOT NULL REFERENCES public.addons(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text,
  amount            int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- user_entitlements --------------------------------------------------------
CREATE TABLE public.user_entitlements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  source          text NOT NULL CHECK (source IN ('subscription', 'addon', 'admin')),
  source_ref      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entitlement_key)
);

-- ---------------------------------------------------------------------------
-- 6.9 Subscriptions / Payments (Stripe)
-- ---------------------------------------------------------------------------

-- subscriptions ------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                 text NOT NULL
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- payments -----------------------------------------------------------------
CREATE TABLE public.payments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_event_id  text UNIQUE NOT NULL,
  stripe_object_id text,
  type             text NOT NULL
    CHECK (type IN ('checkout_completed', 'invoice_paid', 'invoice_failed', 'subscription_updated', 'addon_purchase')),
  amount           int,
  currency         text,
  meta             jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.10 AI Coach
-- ---------------------------------------------------------------------------

-- ai_sessions --------------------------------------------------------------
CREATE TABLE public.ai_sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tone       text NOT NULL CHECK (tone IN ('carlotta', 'gabriel')),
  status     text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ai_messages --------------------------------------------------------------
CREATE TABLE public.ai_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         text NOT NULL,
  tokens_in       int,
  tokens_out      int,
  safety_category text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ai_quotas ----------------------------------------------------------------
CREATE TABLE public.ai_quotas (
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day           date NOT NULL,
  messages_used int NOT NULL DEFAULT 0,
  tokens_used   int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- ai_global_usage (optional) -----------------------------------------------
CREATE TABLE public.ai_global_usage (
  month       text PRIMARY KEY, -- YYYY-MM
  tokens_used int NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.11 App Settings
-- ---------------------------------------------------------------------------

-- app_settings -------------------------------------------------------------
CREATE TABLE public.app_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.12 Form Submissions
-- ---------------------------------------------------------------------------

-- form_submissions ---------------------------------------------------------
CREATE TABLE public.form_submissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id    uuid NOT NULL REFERENCES public.forms(id),
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  answers    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===========================================================================
--  INDEXES
-- ===========================================================================

-- program_checkins: fast lookups for a user's check-ins per program
CREATE INDEX idx_program_checkins_program_user
  ON public.program_checkins (program_id, user_id);

CREATE INDEX idx_program_checkins_user_created
  ON public.program_checkins (user_id, created_at);

-- content_items: status + segment for feed queries
CREATE INDEX idx_content_items_status
  ON public.content_items (status);

CREATE INDEX idx_content_items_segment
  ON public.content_items (community_segment)
  WHERE community_segment IS NOT NULL;

CREATE INDEX idx_content_items_entitlement
  ON public.content_items (entitlement_key)
  WHERE entitlement_key IS NOT NULL;

CREATE INDEX idx_content_items_plan
  ON public.content_items (plan);

CREATE INDEX idx_content_items_objective
  ON public.content_items (objective_id)
  WHERE objective_id IS NOT NULL;

CREATE INDEX idx_content_items_type
  ON public.content_items (type);

-- programs: status for listing queries
CREATE INDEX idx_programs_status
  ON public.programs (status);

CREATE INDEX idx_programs_entitlement
  ON public.programs (entitlement_key)
  WHERE entitlement_key IS NOT NULL;

CREATE INDEX idx_programs_plan
  ON public.programs (plan);

CREATE INDEX idx_programs_type
  ON public.programs (type);

-- daily_plans: date + segment for today lookup
CREATE INDEX idx_daily_plans_date_segment
  ON public.daily_plans (date, community_segment);

-- daily_checkins: user + date for streak computation
CREATE INDEX idx_daily_checkins_user_date
  ON public.daily_checkins (user_id, date);

-- posts: status + segment for feed
CREATE INDEX idx_posts_status_segment
  ON public.posts (status, community_segment);

CREATE INDEX idx_posts_author
  ON public.posts (author_user_id);

-- events: status + start_at for upcoming queries
CREATE INDEX idx_events_status_start
  ON public.events (status, start_at);

CREATE INDEX idx_events_entitlement
  ON public.events (entitlement_key)
  WHERE entitlement_key IS NOT NULL;

-- event_registrations
CREATE INDEX idx_event_registrations_event
  ON public.event_registrations (event_id);

CREATE INDEX idx_event_registrations_user
  ON public.event_registrations (user_id);

-- ai_sessions: user lookup
CREATE INDEX idx_ai_sessions_user
  ON public.ai_sessions (user_id);

-- ai_messages: session lookup
CREATE INDEX idx_ai_messages_session
  ON public.ai_messages (session_id, created_at);

-- subscriptions: stripe_customer_id for webhook lookups
CREATE INDEX idx_subscriptions_stripe_customer
  ON public.subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- payments: stripe_object_id for webhook lookups
CREATE INDEX idx_payments_stripe_object
  ON public.payments (stripe_object_id)
  WHERE stripe_object_id IS NOT NULL;

-- benefit_clicks: benefit lookup for analytics
CREATE INDEX idx_benefit_clicks_benefit
  ON public.benefit_clicks (benefit_id);

-- benefits
CREATE INDEX idx_benefits_plan
  ON public.benefits (plan);

-- program_enrollments: user lookup
CREATE INDEX idx_program_enrollments_user
  ON public.program_enrollments (user_id);

-- admin_users: user_id for is_admin() lookups
CREATE INDEX idx_admin_users_user_id
  ON public.admin_users (user_id);

-- forms
CREATE INDEX idx_forms_status
  ON public.forms (status);

-- form_submissions
CREATE INDEX idx_form_submissions_form
  ON public.form_submissions (form_id);

CREATE INDEX idx_form_submissions_user
  ON public.form_submissions (user_id);

-- addon_purchases
CREATE UNIQUE INDEX idx_addon_purchases_user_addon
  ON public.addon_purchases (user_id, addon_id);

CREATE INDEX idx_addon_purchases_addon
  ON public.addon_purchases (addon_id);

-- program_day_items: form lookup
CREATE INDEX idx_program_day_items_form
  ON public.program_day_items (form_id)
  WHERE form_id IS NOT NULL;

-- ===========================================================================
--  TRIGGERS: updated_at
-- ===========================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.content_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.daily_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.addons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ai_global_usage
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Helper: is_admin() — returns true when the current user has a row in
--    admin_users. Used inside RLS policies.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = (select auth.uid())
  );
$$;

-- ===========================================================================
--  ROW LEVEL SECURITY — Enable on ALL tables
-- ===========================================================================

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_objectives   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_day_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_checkins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_clicks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_entitlements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_quotas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_global_usage      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions     ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
--  RLS POLICIES
-- ===========================================================================
-- Convention: DROP POLICY IF EXISTS before CREATE POLICY for idempotency.
-- Use (select auth.uid()) and (select auth.jwt()) to avoid repeated evaluation.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_users_select_admin" ON public.admin_users;
CREATE POLICY "admin_users_select_admin" ON public.admin_users
  FOR SELECT USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- content_objectives
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "content_objectives_select_authed" ON public.content_objectives;
CREATE POLICY "content_objectives_select_authed" ON public.content_objectives
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "content_objectives_insert_admin" ON public.content_objectives;
CREATE POLICY "content_objectives_insert_admin" ON public.content_objectives
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_objectives_update_admin" ON public.content_objectives;
CREATE POLICY "content_objectives_update_admin" ON public.content_objectives
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_objectives_delete_admin" ON public.content_objectives;
CREATE POLICY "content_objectives_delete_admin" ON public.content_objectives
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- content_categories
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "content_categories_select_active" ON public.content_categories;
CREATE POLICY "content_categories_select_active" ON public.content_categories
  FOR SELECT USING (
    status = 'active'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "content_categories_insert_admin" ON public.content_categories;
CREATE POLICY "content_categories_insert_admin" ON public.content_categories
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_categories_update_admin" ON public.content_categories;
CREATE POLICY "content_categories_update_admin" ON public.content_categories
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_categories_delete_admin" ON public.content_categories;
CREATE POLICY "content_categories_delete_admin" ON public.content_categories
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- content_items
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "content_items_select_published" ON public.content_items;
CREATE POLICY "content_items_select_published" ON public.content_items
  FOR SELECT USING (
    (
      status = 'published'
      AND (
        community_segment IS NULL
        OR community_segment = (
          SELECT p.community_segment FROM public.profiles p WHERE p.id = (select auth.uid())
        )
        OR (
          SELECT p.community_segment FROM public.profiles p WHERE p.id = (select auth.uid())
        ) = 'conjunta'
      )
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "content_items_insert_admin" ON public.content_items;
CREATE POLICY "content_items_insert_admin" ON public.content_items
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_items_update_admin" ON public.content_items;
CREATE POLICY "content_items_update_admin" ON public.content_items
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_items_delete_admin" ON public.content_items;
CREATE POLICY "content_items_delete_admin" ON public.content_items
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- content_item_categories — follows content_items access
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "content_item_categories_select" ON public.content_item_categories;
CREATE POLICY "content_item_categories_select" ON public.content_item_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.content_items ci
      WHERE ci.id = content_item_id
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "content_item_categories_insert_admin" ON public.content_item_categories;
CREATE POLICY "content_item_categories_insert_admin" ON public.content_item_categories
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_item_categories_update_admin" ON public.content_item_categories;
CREATE POLICY "content_item_categories_update_admin" ON public.content_item_categories
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "content_item_categories_delete_admin" ON public.content_item_categories;
CREATE POLICY "content_item_categories_delete_admin" ON public.content_item_categories
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- forms
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "forms_select_active" ON public.forms;
CREATE POLICY "forms_select_active" ON public.forms
  FOR SELECT USING (
    (
      status = 'active'
      AND (select auth.uid()) IS NOT NULL
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "forms_insert_admin" ON public.forms;
CREATE POLICY "forms_insert_admin" ON public.forms
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "forms_update_admin" ON public.forms;
CREATE POLICY "forms_update_admin" ON public.forms
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "forms_delete_admin" ON public.forms;
CREATE POLICY "forms_delete_admin" ON public.forms
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- programs
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "programs_select_published" ON public.programs;
CREATE POLICY "programs_select_published" ON public.programs
  FOR SELECT USING (
    (
      status = 'published'
      AND (
        community_segment IS NULL
        OR community_segment = (
          SELECT p.community_segment FROM public.profiles p WHERE p.id = (select auth.uid())
        )
        OR (
          SELECT p.community_segment FROM public.profiles p WHERE p.id = (select auth.uid())
        ) = 'conjunta'
      )
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "programs_insert_admin" ON public.programs;
CREATE POLICY "programs_insert_admin" ON public.programs
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "programs_update_admin" ON public.programs;
CREATE POLICY "programs_update_admin" ON public.programs
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "programs_delete_admin" ON public.programs;
CREATE POLICY "programs_delete_admin" ON public.programs
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- program_days — follows programs access
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "program_days_select" ON public.program_days;
CREATE POLICY "program_days_select" ON public.program_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.programs pr
      WHERE pr.id = program_id
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "program_days_insert_admin" ON public.program_days;
CREATE POLICY "program_days_insert_admin" ON public.program_days
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "program_days_update_admin" ON public.program_days;
CREATE POLICY "program_days_update_admin" ON public.program_days
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "program_days_delete_admin" ON public.program_days;
CREATE POLICY "program_days_delete_admin" ON public.program_days
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- program_day_items — follows programs access
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "program_day_items_select" ON public.program_day_items;
CREATE POLICY "program_day_items_select" ON public.program_day_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.program_days pd
        JOIN public.programs pr ON pr.id = pd.program_id
      WHERE pd.id = program_day_id
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "program_day_items_insert_admin" ON public.program_day_items;
CREATE POLICY "program_day_items_insert_admin" ON public.program_day_items
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "program_day_items_update_admin" ON public.program_day_items;
CREATE POLICY "program_day_items_update_admin" ON public.program_day_items
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "program_day_items_delete_admin" ON public.program_day_items;
CREATE POLICY "program_day_items_delete_admin" ON public.program_day_items
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- program_enrollments
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "program_enrollments_select" ON public.program_enrollments;
CREATE POLICY "program_enrollments_select" ON public.program_enrollments
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "program_enrollments_insert_own" ON public.program_enrollments;
CREATE POLICY "program_enrollments_insert_own" ON public.program_enrollments
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "program_enrollments_update_admin" ON public.program_enrollments;
CREATE POLICY "program_enrollments_update_admin" ON public.program_enrollments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "program_enrollments_delete_admin" ON public.program_enrollments;
CREATE POLICY "program_enrollments_delete_admin" ON public.program_enrollments
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- program_checkins
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "program_checkins_select" ON public.program_checkins;
CREATE POLICY "program_checkins_select" ON public.program_checkins
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "program_checkins_insert_own" ON public.program_checkins;
CREATE POLICY "program_checkins_insert_own" ON public.program_checkins
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

-- ---------------------------------------------------------------------------
-- daily_plans
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "daily_plans_select_published" ON public.daily_plans;
CREATE POLICY "daily_plans_select_published" ON public.daily_plans
  FOR SELECT USING (
    status = 'published'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "daily_plans_insert_admin" ON public.daily_plans;
CREATE POLICY "daily_plans_insert_admin" ON public.daily_plans
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "daily_plans_update_admin" ON public.daily_plans;
CREATE POLICY "daily_plans_update_admin" ON public.daily_plans
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "daily_plans_delete_admin" ON public.daily_plans;
CREATE POLICY "daily_plans_delete_admin" ON public.daily_plans
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- daily_checkins
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "daily_checkins_select_own" ON public.daily_checkins;
CREATE POLICY "daily_checkins_select_own" ON public.daily_checkins
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "daily_checkins_insert_own" ON public.daily_checkins;
CREATE POLICY "daily_checkins_insert_own" ON public.daily_checkins
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

-- ---------------------------------------------------------------------------
-- user_streaks
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_streaks_select_own" ON public.user_streaks;
CREATE POLICY "user_streaks_select_own" ON public.user_streaks
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "user_streaks_upsert_own" ON public.user_streaks;
CREATE POLICY "user_streaks_upsert_own" ON public.user_streaks
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "user_streaks_update_own" ON public.user_streaks;
CREATE POLICY "user_streaks_update_own" ON public.user_streaks
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "posts_select_published" ON public.posts;
CREATE POLICY "posts_select_published" ON public.posts
  FOR SELECT USING (
    (
      status = 'published'
      AND (select auth.uid()) IS NOT NULL
      AND (
        community_segment IS NULL
        OR community_segment = (
          SELECT p.community_segment FROM public.profiles p WHERE p.id = (select auth.uid())
        )
        OR (
          SELECT p.community_segment FROM public.profiles p WHERE p.id = (select auth.uid())
        ) = 'conjunta'
      )
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "posts_insert_admin" ON public.posts;
CREATE POLICY "posts_insert_admin" ON public.posts
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "posts_update_admin" ON public.posts;
CREATE POLICY "posts_update_admin" ON public.posts
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "posts_delete_admin" ON public.posts;
CREATE POLICY "posts_delete_admin" ON public.posts
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- post_comments
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "post_comments_select" ON public.post_comments;
CREATE POLICY "post_comments_select" ON public.post_comments
  FOR SELECT USING (
    (
      (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.posts po WHERE po.id = post_id AND po.status = 'published'
      )
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "post_comments_insert_authed" ON public.post_comments;
CREATE POLICY "post_comments_insert_authed" ON public.post_comments
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "post_comments_update_admin" ON public.post_comments;
CREATE POLICY "post_comments_update_admin" ON public.post_comments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "post_comments_delete_admin" ON public.post_comments;
CREATE POLICY "post_comments_delete_admin" ON public.post_comments
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- post_reactions
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "post_reactions_select" ON public.post_reactions;
CREATE POLICY "post_reactions_select" ON public.post_reactions
  FOR SELECT USING (
    (select auth.uid()) IS NOT NULL
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "post_reactions_insert_authed" ON public.post_reactions;
CREATE POLICY "post_reactions_insert_authed" ON public.post_reactions
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "post_reactions_delete_own" ON public.post_reactions;
CREATE POLICY "post_reactions_delete_own" ON public.post_reactions
  FOR DELETE USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "events_select_published" ON public.events;
CREATE POLICY "events_select_published" ON public.events
  FOR SELECT USING (
    status = 'published'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "events_insert_admin" ON public.events;
CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "events_update_admin" ON public.events;
CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "events_delete_admin" ON public.events;
CREATE POLICY "events_delete_admin" ON public.events
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- event_registrations
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "event_registrations_select" ON public.event_registrations;
CREATE POLICY "event_registrations_select" ON public.event_registrations
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "event_registrations_insert_own" ON public.event_registrations;
CREATE POLICY "event_registrations_insert_own" ON public.event_registrations
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "event_registrations_update_own" ON public.event_registrations;
CREATE POLICY "event_registrations_update_own" ON public.event_registrations
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- benefits
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "benefits_select_published" ON public.benefits;
CREATE POLICY "benefits_select_published" ON public.benefits
  FOR SELECT USING (
    (
      status = 'active'
      AND (select auth.uid()) IS NOT NULL
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "benefits_insert_admin" ON public.benefits;
CREATE POLICY "benefits_insert_admin" ON public.benefits
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "benefits_update_admin" ON public.benefits;
CREATE POLICY "benefits_update_admin" ON public.benefits
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "benefits_delete_admin" ON public.benefits;
CREATE POLICY "benefits_delete_admin" ON public.benefits
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- benefit_clicks
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "benefit_clicks_insert_authed" ON public.benefit_clicks;
CREATE POLICY "benefit_clicks_insert_authed" ON public.benefit_clicks
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "benefit_clicks_select_admin" ON public.benefit_clicks;
CREATE POLICY "benefit_clicks_select_admin" ON public.benefit_clicks
  FOR SELECT USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- addons
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "addons_select_active" ON public.addons;
CREATE POLICY "addons_select_active" ON public.addons
  FOR SELECT USING (
    status = 'active'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "addons_insert_admin" ON public.addons;
CREATE POLICY "addons_insert_admin" ON public.addons
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "addons_update_admin" ON public.addons;
CREATE POLICY "addons_update_admin" ON public.addons
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "addons_delete_admin" ON public.addons;
CREATE POLICY "addons_delete_admin" ON public.addons
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- addon_entitlements — follows addons access
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "addon_entitlements_select" ON public.addon_entitlements;
CREATE POLICY "addon_entitlements_select" ON public.addon_entitlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.addons a WHERE a.id = addon_id
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "addon_entitlements_insert_admin" ON public.addon_entitlements;
CREATE POLICY "addon_entitlements_insert_admin" ON public.addon_entitlements
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "addon_entitlements_update_admin" ON public.addon_entitlements;
CREATE POLICY "addon_entitlements_update_admin" ON public.addon_entitlements
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "addon_entitlements_delete_admin" ON public.addon_entitlements;
CREATE POLICY "addon_entitlements_delete_admin" ON public.addon_entitlements
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- addon_purchases
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "addon_purchases_select" ON public.addon_purchases;
CREATE POLICY "addon_purchases_select" ON public.addon_purchases
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "addon_purchases_insert_admin" ON public.addon_purchases;
CREATE POLICY "addon_purchases_insert_admin" ON public.addon_purchases
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "addon_purchases_delete_admin" ON public.addon_purchases;
CREATE POLICY "addon_purchases_delete_admin" ON public.addon_purchases
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- user_entitlements
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_entitlements_select_own" ON public.user_entitlements;
CREATE POLICY "user_entitlements_select_own" ON public.user_entitlements
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "user_entitlements_insert_admin" ON public.user_entitlements;
CREATE POLICY "user_entitlements_insert_admin" ON public.user_entitlements
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_entitlements_update_admin" ON public.user_entitlements;
CREATE POLICY "user_entitlements_update_admin" ON public.user_entitlements
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_entitlements_delete_admin" ON public.user_entitlements;
CREATE POLICY "user_entitlements_delete_admin" ON public.user_entitlements
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

-- Service role bypasses RLS, so no explicit INSERT/UPDATE policy needed for
-- webhook writes. Admin can read via the SELECT policy above.

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "payments_select_admin" ON public.payments;
CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT USING (public.is_admin());

-- Service role bypasses RLS for INSERT/UPDATE from webhooks.

-- ---------------------------------------------------------------------------
-- ai_sessions
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "ai_sessions_select_own" ON public.ai_sessions;
CREATE POLICY "ai_sessions_select_own" ON public.ai_sessions
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "ai_sessions_insert_own" ON public.ai_sessions;
CREATE POLICY "ai_sessions_insert_own" ON public.ai_sessions
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "ai_sessions_update_own" ON public.ai_sessions;
CREATE POLICY "ai_sessions_update_own" ON public.ai_sessions
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- ai_messages
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "ai_messages_select_own" ON public.ai_messages;
CREATE POLICY "ai_messages_select_own" ON public.ai_messages
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "ai_messages_insert_own" ON public.ai_messages;
CREATE POLICY "ai_messages_insert_own" ON public.ai_messages
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

-- ---------------------------------------------------------------------------
-- ai_quotas
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "ai_quotas_select_own" ON public.ai_quotas;
CREATE POLICY "ai_quotas_select_own" ON public.ai_quotas
  FOR SELECT USING (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "ai_quotas_insert_own" ON public.ai_quotas;
CREATE POLICY "ai_quotas_insert_own" ON public.ai_quotas
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "ai_quotas_update_own" ON public.ai_quotas;
CREATE POLICY "ai_quotas_update_own" ON public.ai_quotas
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- ai_global_usage — admin only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "ai_global_usage_select_admin" ON public.ai_global_usage;
CREATE POLICY "ai_global_usage_select_admin" ON public.ai_global_usage
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "ai_global_usage_insert_admin" ON public.ai_global_usage;
CREATE POLICY "ai_global_usage_insert_admin" ON public.ai_global_usage
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ai_global_usage_update_admin" ON public.ai_global_usage;
CREATE POLICY "ai_global_usage_update_admin" ON public.ai_global_usage
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- app_settings
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "app_settings_select_authed" ON public.app_settings;
CREATE POLICY "app_settings_select_authed" ON public.app_settings
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "app_settings_insert_admin" ON public.app_settings;
CREATE POLICY "app_settings_insert_admin" ON public.app_settings
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "app_settings_update_admin" ON public.app_settings;
CREATE POLICY "app_settings_update_admin" ON public.app_settings
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "app_settings_delete_admin" ON public.app_settings;
CREATE POLICY "app_settings_delete_admin" ON public.app_settings
  FOR DELETE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- form_submissions
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "form_submissions_select" ON public.form_submissions;
CREATE POLICY "form_submissions_select" ON public.form_submissions
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "form_submissions_insert_own" ON public.form_submissions;
CREATE POLICY "form_submissions_insert_own" ON public.form_submissions
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

-- ===========================================================================
--  STORAGE BUCKETS
-- ===========================================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('content-media', 'content-media', false),
  ('program-covers', 'program-covers', true),
  ('event-covers', 'event-covers', true),
  ('addon-covers', 'addon-covers', true),
  ('community-media', 'community-media', false);

-- ---------------------------------------------------------------------------
-- Storage policies: avatars (public)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_authed" ON storage.objects;
CREATE POLICY "avatars_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "avatars_delete_admin" ON storage.objects;
CREATE POLICY "avatars_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Storage policies: program-covers (public)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "program_covers_select_public" ON storage.objects;
CREATE POLICY "program_covers_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'program-covers');

DROP POLICY IF EXISTS "program_covers_insert_authed" ON storage.objects;
CREATE POLICY "program_covers_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'program-covers'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "program_covers_delete_admin" ON storage.objects;
CREATE POLICY "program_covers_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'program-covers'
    AND public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Storage policies: event-covers (public)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "event_covers_select_public" ON storage.objects;
CREATE POLICY "event_covers_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-covers');

DROP POLICY IF EXISTS "event_covers_insert_authed" ON storage.objects;
CREATE POLICY "event_covers_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-covers'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "event_covers_delete_admin" ON storage.objects;
CREATE POLICY "event_covers_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-covers'
    AND public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Storage policies: addon-covers (public)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "addon_covers_select_public" ON storage.objects;
CREATE POLICY "addon_covers_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'addon-covers');

DROP POLICY IF EXISTS "addon_covers_insert_authed" ON storage.objects;
CREATE POLICY "addon_covers_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'addon-covers'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "addon_covers_delete_admin" ON storage.objects;
CREATE POLICY "addon_covers_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'addon-covers'
    AND public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Storage policies: content-media (private)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "content_media_select_authed" ON storage.objects;
CREATE POLICY "content_media_select_authed" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'content-media'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "content_media_insert_authed" ON storage.objects;
CREATE POLICY "content_media_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content-media'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "content_media_delete_admin" ON storage.objects;
CREATE POLICY "content_media_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'content-media'
    AND public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Storage policies: community-media (private)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "community_media_select_authed" ON storage.objects;
CREATE POLICY "community_media_select_authed" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'community-media'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "community_media_insert_authed" ON storage.objects;
CREATE POLICY "community_media_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-media'
    AND (select auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "community_media_delete_admin" ON storage.objects;
CREATE POLICY "community_media_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'community-media'
    AND public.is_admin()
  );

-- ===========================================================================
--  REALTIME
-- ===========================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_plans;

COMMIT;
