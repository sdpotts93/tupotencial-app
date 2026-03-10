-- Simplify benefits: add cover_url, plan; change status to active/inactive
-- Benefits become plan-gated URL shares (no discount/segment/validity fields)

ALTER TABLE public.benefits ADD COLUMN cover_url text;

ALTER TABLE public.benefits ADD COLUMN plan text NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'core'));

-- Replace status constraint: draft/published/hidden → active/inactive
ALTER TABLE public.benefits DROP CONSTRAINT IF EXISTS benefits_status_check;
ALTER TABLE public.benefits ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE public.benefits ADD CONSTRAINT benefits_status_check
  CHECK (status IN ('active', 'inactive'));

-- Update existing rows
UPDATE public.benefits SET status = 'active' WHERE status IN ('published', 'draft', 'hidden');

CREATE INDEX idx_benefits_plan ON public.benefits (plan);
