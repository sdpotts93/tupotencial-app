-- Allow community_segment to be null during onboarding (set later in segment selection step)
ALTER TABLE public.profiles ALTER COLUMN community_segment DROP NOT NULL;
