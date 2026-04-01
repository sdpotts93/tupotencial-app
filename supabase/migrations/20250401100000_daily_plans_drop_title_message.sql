-- Remove unused title and message columns from daily_plans
ALTER TABLE public.daily_plans DROP COLUMN IF EXISTS title;
ALTER TABLE public.daily_plans DROP COLUMN IF EXISTS message;
