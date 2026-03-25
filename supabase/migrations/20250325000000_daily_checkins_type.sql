-- =============================================================================
-- Fix daily_checkins: add explicit `type` column so multiple checkin types
-- (mood checkin + acción) can coexist per user per day.
--
-- Previously: UNIQUE (date, user_id) — only 1 row per day per user
-- Now:        UNIQUE (date, user_id, type) — 1 row per type per day per user
-- =============================================================================

BEGIN;

-- 1. Add the type column with a default for existing rows
ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'checkin'
  CHECK (type IN ('checkin', 'accion'));

-- 2. Backfill existing rows: set type from payload if present
UPDATE public.daily_checkins
  SET type = 'accion'
  WHERE (payload->>'type') = 'accion';

-- 3. Drop the old unique constraint
ALTER TABLE public.daily_checkins
  DROP CONSTRAINT IF EXISTS daily_checkins_date_user_id_key;

-- 4. Add the new unique constraint including type
ALTER TABLE public.daily_checkins
  ADD CONSTRAINT daily_checkins_date_user_type_key UNIQUE (date, user_id, type);

-- 5. Update the index for streak computation to include type
DROP INDEX IF EXISTS idx_daily_checkins_user_date;
CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins (user_id, date, type);

COMMIT;
