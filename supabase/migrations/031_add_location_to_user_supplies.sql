-- ===========================================
-- ADD LOCATION FIELDS TO USER_SUPPLIES TABLE
-- ===========================================
-- Menambahkan kolom latitude dan longitude untuk pickup location
-- User dapat memilih titik lokasi di map atau menggunakan lokasi saat ini
-- ===========================================

-- ===========================================
-- STEP 1: ADD LOCATION COLUMNS
-- ===========================================

ALTER TABLE public.user_supplies
ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11, 8);

-- ===========================================
-- STEP 2: ADD COMMENT TO COLUMNS
-- ===========================================

COMMENT ON COLUMN public.user_supplies.pickup_latitude IS 'Latitude koordinat lokasi pickup (-90 to 90)';
COMMENT ON COLUMN public.user_supplies.pickup_longitude IS 'Longitude koordinat lokasi pickup (-180 to 180)';

-- ===========================================
-- STEP 3: CREATE INDEX FOR LOCATION QUERIES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_user_supplies_location
ON public.user_supplies(pickup_latitude, pickup_longitude)
WHERE pickup_latitude IS NOT NULL AND pickup_longitude IS NOT NULL;

-- ===========================================
-- STEP 4: ADD VALIDATION CONSTRAINT
-- ===========================================

-- Drop existing constraints if they exist (to make migration idempotent)
DO $$ BEGIN
    ALTER TABLE public.user_supplies DROP CONSTRAINT IF EXISTS check_pickup_latitude_range;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE public.user_supplies DROP CONSTRAINT IF EXISTS check_pickup_longitude_range;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE public.user_supplies DROP CONSTRAINT IF EXISTS check_location_pair;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add constraints
-- Constraint untuk memastikan latitude dalam range yang valid
ALTER TABLE public.user_supplies
ADD CONSTRAINT check_pickup_latitude_range
CHECK (pickup_latitude IS NULL OR (pickup_latitude >= -90 AND pickup_latitude <= 90));

-- Constraint untuk memastikan longitude dalam range yang valid
ALTER TABLE public.user_supplies
ADD CONSTRAINT check_pickup_longitude_range
CHECK (pickup_longitude IS NULL OR (pickup_longitude >= -180 AND pickup_longitude <= 180));

-- Constraint untuk memastikan jika salah satu diisi, keduanya harus diisi
ALTER TABLE public.user_supplies
ADD CONSTRAINT check_location_pair
CHECK (
    (pickup_latitude IS NULL AND pickup_longitude IS NULL) OR
    (pickup_latitude IS NOT NULL AND pickup_longitude IS NOT NULL)
);

-- ===========================================
-- STEP 5: CREATE FUNCTION TO CALCULATE DISTANCE
-- ===========================================
-- Function untuk menghitung jarak antara dua titik koordinat (Haversine formula)
-- Berguna untuk fitur tracking dan monitoring

CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    earth_radius_km CONSTANT DECIMAL := 6371.0;
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Haversine formula
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);

    a := POWER(SIN(dlat / 2), 2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         POWER(SIN(dlon / 2), 2);

    c := 2 * ATAN2(SQRT(a), SQRT(1 - a));

    RETURN earth_radius_km * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===========================================
-- STEP 6: VERIFICATION QUERY
-- ===========================================

-- Check if columns were added
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_supplies'
AND column_name IN ('pickup_latitude', 'pickup_longitude');

-- Check constraints
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'user_supplies'
AND constraint_name LIKE '%location%' OR constraint_name LIKE '%latitude%' OR constraint_name LIKE '%longitude%';

-- ===========================================
-- DONE!
-- ===========================================
/*
SUMMARY:
✅ Added pickup_latitude column (DECIMAL(10, 8))
✅ Added pickup_longitude column (DECIMAL(11, 8))
✅ Added validation constraints for valid coordinate ranges
✅ Added constraint to ensure both latitude and longitude are provided together
✅ Created index for location-based queries
✅ Created distance calculation function (Haversine formula)

USAGE EXAMPLES:

1. Insert supply with location:
   INSERT INTO user_supplies (
       user_id, waste_type, estimated_weight,
       pickup_address, pickup_date, pickup_time_slot,
       pickup_latitude, pickup_longitude
   ) VALUES (
       'user-uuid', 'sisa_makanan', '5',
       'Jl. Sudirman No. 123, Banda Aceh', '2024-01-20', 'pagi',
       5.548290, 95.323753
   );

2. Query supplies near a location (within 5km):
   SELECT *
   FROM user_supplies
   WHERE calculate_distance_km(
       pickup_latitude, pickup_longitude,
       5.548290, 95.323753
   ) <= 5;

3. Update existing supply with location:
   UPDATE user_supplies
   SET pickup_latitude = 5.548290,
       pickup_longitude = 95.323753
   WHERE id = 'supply-uuid';

NEXT STEPS:
1. Run this migration in Supabase SQL Editor
2. Update CreateSupplyData interface in supply.actions.ts to include pickupLatitude and pickupLongitude
3. Create LocationPicker component with Leaflet
4. Update supply/input/page.tsx to include location picker in Step 2
5. Update supply/history/page.tsx to display map for each supply
*/
