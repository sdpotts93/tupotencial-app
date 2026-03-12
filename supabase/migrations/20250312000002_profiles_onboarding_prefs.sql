-- Store onboarding preferences for AI context
ALTER TABLE public.profiles ADD COLUMN onboarding_motivation text[];
ALTER TABLE public.profiles ADD COLUMN onboarding_focus text[];
ALTER TABLE public.profiles ADD COLUMN onboarding_time text;
