-- Public bucket for character avatar images (Carlotta & Gabriel)
INSERT INTO storage.buckets (id, name, public) VALUES ('character-avatars', 'character-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "character_avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'character-avatars');

CREATE POLICY "character_avatars_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'character-avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "character_avatars_delete_authed" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'character-avatars'
    AND auth.role() = 'authenticated'
  );

-- Seed default character_avatars setting
INSERT INTO public.app_settings (key, value)
VALUES (
  'character_avatars',
  '{"carlotta_avatar_url": "", "gabriel_avatar_url": ""}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
