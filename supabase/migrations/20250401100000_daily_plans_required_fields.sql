-- Make daily_plans text columns NOT NULL with sensible defaults.

ALTER TABLE public.daily_plans
  ALTER COLUMN title SET DEFAULT '',
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN message SET DEFAULT '',
  ALTER COLUMN message SET NOT NULL,
  ALTER COLUMN badge_share_text SET DEFAULT '',
  ALTER COLUMN badge_share_text SET NOT NULL;
