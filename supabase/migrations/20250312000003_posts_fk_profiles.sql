-- Add FK from posts.author_user_id to profiles so PostgREST can resolve
-- the embedded query `profiles:author_user_id(...)`.
ALTER TABLE public.posts
  ADD CONSTRAINT posts_author_profile_fk
  FOREIGN KEY (author_user_id) REFERENCES public.profiles(id);
