-- ===========================================
-- REMOVE MEDIA CONSTRAINT TEMPORARILY
-- ===========================================
-- Remove constraint untuk development
-- Nanti akan ditambahkan kembali setelah implement storage upload
-- ===========================================

-- Drop the constraint
ALTER TABLE public.user_supplies
DROP CONSTRAINT IF EXISTS check_media_required;

-- Make photo_url and video_url nullable (already nullable, just confirming)
ALTER TABLE public.user_supplies
ALTER COLUMN photo_url DROP NOT NULL;

ALTER TABLE public.user_supplies
ALTER COLUMN video_url DROP NOT NULL;

-- Add comment
COMMENT ON TABLE public.user_supplies IS 'User supplies table - media constraint removed for development';

-- Verification
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.user_supplies'::regclass
AND conname = 'check_media_required';

-- Should return empty (constraint removed)

-- ===========================================
-- DONE!
-- ===========================================
/*
SUMMARY:
✅ Removed check_media_required constraint
✅ Photo and video are now optional (for development)

NOTE: 
- Nanti setelah implement Supabase Storage upload, 
  constraint bisa ditambahkan kembali
- Untuk production, pastikan minimal ada photo atau video
*/
