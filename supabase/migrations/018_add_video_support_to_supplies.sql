-- ===========================================
-- ADD VIDEO SUPPORT TO USER SUPPLIES
-- ===========================================
-- Migration untuk menambahkan support video upload
-- Run this if you already ran migration 017
-- ===========================================

-- Add video_url column
ALTER TABLE public.user_supplies 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add media_type column
ALTER TABLE public.user_supplies 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'photo';

-- Add video_duration column (in seconds)
ALTER TABLE public.user_supplies 
ADD COLUMN IF NOT EXISTS video_duration INTEGER;

-- Add video_size_mb column
ALTER TABLE public.user_supplies 
ADD COLUMN IF NOT EXISTS video_size_mb DECIMAL(10, 2);

-- Add comments
COMMENT ON COLUMN public.user_supplies.video_url IS 'URL video sampah (optional)';
COMMENT ON COLUMN public.user_supplies.media_type IS 'Type of media: photo, video, or both';
COMMENT ON COLUMN public.user_supplies.video_duration IS 'Video duration in seconds';
COMMENT ON COLUMN public.user_supplies.video_size_mb IS 'Video file size in MB';

-- Add constraint: at least photo_url or video_url must be provided
ALTER TABLE public.user_supplies
ADD CONSTRAINT check_media_required 
CHECK (photo_url IS NOT NULL OR video_url IS NOT NULL);

-- Add constraint: video size max 50MB
ALTER TABLE public.user_supplies
ADD CONSTRAINT check_video_size 
CHECK (video_size_mb IS NULL OR video_size_mb <= 50);

-- Add constraint: video duration max 60 seconds
ALTER TABLE public.user_supplies
ADD CONSTRAINT check_video_duration 
CHECK (video_duration IS NULL OR video_duration <= 60);

-- Verification
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_supplies'
  AND column_name IN ('photo_url', 'video_url', 'media_type', 'video_duration', 'video_size_mb')
ORDER BY ordinal_position;

-- ===========================================
-- DONE!
-- ===========================================
/*
SUMMARY:
✅ Added video_url column for video upload
✅ Added media_type column (photo/video/both)
✅ Added video_duration column (max 60 seconds)
✅ Added video_size_mb column (max 50MB)
✅ Added constraint: at least photo or video required
✅ Added constraint: video max 50MB
✅ Added constraint: video max 60 seconds

LIMITS:
- Video max size: 50MB
- Video max duration: 60 seconds
- At least one media (photo or video) is required
*/
