-- ===========================================
-- ADD CONDITION PHOTO TO USER_SUPPLIES
-- ===========================================
-- Add column for farmer/driver to upload photo of waste condition
-- This is taken during pickup to document actual waste condition
-- ===========================================

-- Add condition_photo_url column
ALTER TABLE public.user_supplies 
ADD COLUMN IF NOT EXISTS condition_photo_url TEXT;

-- Add comment
COMMENT ON COLUMN public.user_supplies.condition_photo_url IS 'URL foto kondisi sampah saat pickup (diambil oleh farmer/driver)';

-- ===========================================
-- VERIFICATION
-- ===========================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_supplies'
AND column_name = 'condition_photo_url';

-- Should return the new column
