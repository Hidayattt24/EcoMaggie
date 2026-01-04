-- ===========================================
-- ENSURE SUPPLY MEDIA BUCKET EXISTS
-- ===========================================
-- This migration ensures the supply-media bucket exists
-- Run this if you get "Bucket not found" error
-- ===========================================

-- Create bucket if not exists
DO $$
BEGIN
    -- Check if bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'supply-media'
    ) THEN
        -- Create bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'supply-media',
            'supply-media',
            true,
            5242880, -- 5MB limit
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']
        );
        
        RAISE NOTICE 'Bucket supply-media created successfully';
    ELSE
        RAISE NOTICE 'Bucket supply-media already exists';
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload supply media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view supply media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own supply media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own supply media" ON storage.objects;

-- Policy: Users can upload their own files
CREATE POLICY "Users can upload supply media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'supply-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view supply media (public bucket)
CREATE POLICY "Anyone can view supply media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'supply-media');

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own supply media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'supply-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own supply media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'supply-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ===========================================
-- VERIFICATION
-- ===========================================

-- Check bucket
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'supply-media';

-- Check policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%supply media%';

