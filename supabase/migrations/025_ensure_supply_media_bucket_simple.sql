-- Create supply-media bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'supply-media',
  'supply-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload supply media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view supply media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own supply media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own supply media" ON storage.objects;

-- Create policies
CREATE POLICY "Users can upload supply media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'supply-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view supply media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'supply-media');

CREATE POLICY "Users can delete own supply media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'supply-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own supply media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'supply-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
