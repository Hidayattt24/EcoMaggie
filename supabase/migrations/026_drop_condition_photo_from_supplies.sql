-- Drop condition_photo_url column from supplies table
-- This column was used to store photos of waste condition during pickup
-- The feature is being removed as requested

ALTER TABLE supplies
DROP COLUMN IF EXISTS condition_photo_url;
