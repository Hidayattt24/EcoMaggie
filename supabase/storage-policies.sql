-- ==========================================
-- STORAGE POLICIES FOR 'profiles' BUCKET
-- ==========================================

-- Drop existing policies if any (optional, for fresh start)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow authenticated users to INSERT (upload) to profiles bucket
CREATE POLICY "Authenticated users can upload to profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

-- Allow public to SELECT (view) from profiles bucket
CREATE POLICY "Public can view profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Allow authenticated users to UPDATE in profiles bucket
CREATE POLICY "Authenticated users can update profiles"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles')
WITH CHECK (bucket_id = 'profiles');

-- Allow authenticated users to DELETE from profiles bucket
CREATE POLICY "Authenticated users can delete profiles"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');
