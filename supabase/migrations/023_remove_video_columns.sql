-- ===========================================
-- REMOVE VIDEO COLUMNS FROM USER_SUPPLIES
-- ===========================================
-- Remove video-related columns since blob URLs don't work properly
-- Keep only photo_url for media uploads
-- ===========================================

-- Drop video-related columns
ALTER TABLE public.user_supplies 
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS media_type,
DROP COLUMN IF EXISTS video_duration,
DROP COLUMN IF EXISTS video_size_mb;

-- Update comment
COMMENT ON COLUMN public.user_supplies.photo_url IS 'URL foto sampah (required)';

-- ===========================================
-- VERIFICATION
-- ===========================================

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_supplies'
AND column_name LIKE '%video%' OR column_name LIKE '%media%';

-- Should return no rows if successful
