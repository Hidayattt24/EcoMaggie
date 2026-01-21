-- ===========================================
-- ADD DELIVERY LOCATION FIELDS TO ORDERS TABLE
-- ===========================================
-- Menambahkan kolom latitude dan longitude untuk delivery location
-- Khusus untuk Eco-Maggie delivery yang membutuhkan koordinat titik antar
-- ===========================================

-- ===========================================
-- STEP 1: ADD LOCATION COLUMNS TO ORDERS
-- ===========================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8);

-- ===========================================
-- STEP 2: ADD COMMENTS TO COLUMNS
-- ===========================================

COMMENT ON COLUMN public.orders.delivery_latitude IS 'Latitude koordinat titik antar untuk Eco-Maggie delivery (-90 to 90)';
COMMENT ON COLUMN public.orders.delivery_longitude IS 'Longitude koordinat titik antar untuk Eco-Maggie delivery (-180 to 180)';

-- ===========================================
-- STEP 3: CREATE INDEX FOR LOCATION QUERIES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_orders_delivery_location
ON public.orders(delivery_latitude, delivery_longitude)
WHERE delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL;

-- ===========================================
-- STEP 4: ADD VALIDATION CONSTRAINTS
-- ===========================================

-- Drop existing constraints if they exist (to make migration idempotent)
DO $$ BEGIN
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS check_delivery_latitude_range;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS check_delivery_longitude_range;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS check_delivery_location_pair;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add constraints
-- Constraint untuk memastikan latitude dalam range yang valid
ALTER TABLE public.orders
ADD CONSTRAINT check_delivery_latitude_range
CHECK (delivery_latitude IS NULL OR (delivery_latitude >= -90 AND delivery_latitude <= 90));

-- Constraint untuk memastikan longitude dalam range yang valid
ALTER TABLE public.orders
ADD CONSTRAINT check_delivery_longitude_range
CHECK (delivery_longitude IS NULL OR (delivery_longitude >= -180 AND delivery_longitude <= 180));

-- Constraint untuk memastikan jika salah satu diisi, keduanya harus diisi
ALTER TABLE public.orders
ADD CONSTRAINT check_delivery_location_pair
CHECK (
    (delivery_latitude IS NULL AND delivery_longitude IS NULL) OR
    (delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL)
);

-- ===========================================
-- STEP 5: VERIFICATION QUERY
-- ===========================================

-- Check if columns were added
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name IN ('delivery_latitude', 'delivery_longitude');

-- Check constraints
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'orders'
AND (constraint_name LIKE '%delivery_location%' OR constraint_name LIKE '%delivery_latitude%' OR constraint_name LIKE '%delivery_longitude%');

-- ===========================================
-- DONE!
-- ===========================================
/*
SUMMARY:
✅ Added delivery_latitude column (DECIMAL(10, 8))
✅ Added delivery_longitude column (DECIMAL(11, 8))
✅ Added validation constraints for valid coordinate ranges
✅ Added constraint to ensure both latitude and longitude are provided together
✅ Created index for location-based queries

USAGE:
- Kolom ini akan digunakan untuk Eco-Maggie delivery method
- Driver akan mendapat koordinat presisi untuk titik antar
- Farmer dapat lihat lokasi di Google Maps

NEXT STEPS:
1. Run this migration in Supabase SQL Editor
2. Update checkout page untuk input koordinat pada Eco-Maggie delivery
3. Update farmer orders detail page untuk tampilkan maps
4. Update order actions untuk include koordinat
*/
