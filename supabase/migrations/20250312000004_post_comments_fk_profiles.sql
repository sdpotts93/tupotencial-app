-- Add FK from post_comments.user_id to profiles so PostgREST can resolve
-- the embedded query `profiles:user_id(...)`.
ALTER TABLE public.post_comments
  ADD CONSTRAINT post_comments_user_profile_fk
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
