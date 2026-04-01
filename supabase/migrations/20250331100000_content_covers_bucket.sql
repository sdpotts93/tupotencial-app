-- Public bucket for content cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('content-covers', 'content-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "content_covers_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-covers');

CREATE POLICY "content_covers_insert_authed" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content-covers'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "content_covers_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'content-covers'
    AND auth.role() = 'authenticated'
  );
