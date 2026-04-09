BEGIN;

ALTER TABLE public.addons
  ADD COLUMN revenuecat_offering_id text,
  ADD COLUMN revenuecat_package_id text;

COMMIT;
