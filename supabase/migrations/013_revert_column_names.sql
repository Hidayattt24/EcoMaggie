-- ===========================================
-- REVERT COLUMN NAMES & ADD NEW COLUMNS
-- ===========================================
-- Migration: 013_revert_column_names.sql
-- Purpose: Revert column names back to original (province, city, etc)
--          and add new columns (kecamatan, kelurahan)
-- Run this in Supabase SQL Editor
-- ===========================================


-- ===========================================
-- STEP 1: REVERT COLUMN NAMES BACK TO ORIGINAL
-- ===========================================

-- Revert 'provinsi' back to 'province'
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'provinsi'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN provinsi TO province;
        
        RAISE NOTICE 'Column provinsi renamed back to province';
    END IF;
END $$;

-- Revert 'kabupaten_kota' back to 'city'
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'kabupaten_kota'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN kabupaten_kota TO city;
        
        RAISE NOTICE 'Column kabupaten_kota renamed back to city';
    END IF;
END $$;

-- Revert 'kode_pos' back to 'postal_code'
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'kode_pos'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN kode_pos TO postal_code;
        
        RAISE NOTICE 'Column kode_pos renamed back to postal_code';
    END IF;
END $$;

-- Revert 'alamat_lengkap' back to 'full_address'
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'alamat_lengkap'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN alamat_lengkap TO full_address;
        
        RAISE NOTICE 'Column alamat_lengkap renamed back to full_address';
    END IF;
END $$;


-- ===========================================
-- STEP 2: ENSURE NEW COLUMNS EXIST (district, village)
-- ===========================================

-- Add district column (English name for kecamatan)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'district'
    ) THEN
        -- Check if kecamatan exists, rename it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'kecamatan'
        ) THEN
            ALTER TABLE public.users 
            RENAME COLUMN kecamatan TO district;
            RAISE NOTICE 'Column kecamatan renamed to district';
        ELSE
            ALTER TABLE public.users 
            ADD COLUMN district VARCHAR(100);
            RAISE NOTICE 'Column district added successfully';
        END IF;
        
        COMMENT ON COLUMN public.users.district IS 'District/Kecamatan name - can be from API or manual input';
    ELSE
        RAISE NOTICE 'Column district already exists';
    END IF;
END $$;

-- Add village column (English name for kelurahan)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'village'
    ) THEN
        -- Check if kelurahan exists, rename it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'kelurahan'
        ) THEN
            ALTER TABLE public.users 
            RENAME COLUMN kelurahan TO village;
            RAISE NOTICE 'Column kelurahan renamed to village';
        ELSE
            ALTER TABLE public.users 
            ADD COLUMN village VARCHAR(100);
            RAISE NOTICE 'Column village added successfully';
        END IF;
        
        COMMENT ON COLUMN public.users.village IS 'Village/Kelurahan/Desa name - can be from API or manual input';
    ELSE
        RAISE NOTICE 'Column village already exists';
    END IF;
END $$;


-- ===========================================
-- STEP 3: UPDATE INDEXES
-- ===========================================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_users_provinsi;
DROP INDEX IF EXISTS idx_users_kecamatan;
DROP INDEX IF EXISTS idx_users_kelurahan;
DROP INDEX IF EXISTS idx_users_address_hierarchy;

-- Create indexes with correct column names
CREATE INDEX IF NOT EXISTS idx_users_province ON public.users(province);
CREATE INDEX IF NOT EXISTS idx_users_city ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_users_district ON public.users(district);
CREATE INDEX IF NOT EXISTS idx_users_village ON public.users(village);

-- Composite index for complete address queries
CREATE INDEX IF NOT EXISTS idx_users_full_address 
ON public.users(province, city, district, village);


-- ===========================================
-- STEP 4: UPDATE TRIGGER FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_role user_role := 'USER';
    v_role_text TEXT;
BEGIN
    -- Get role from metadata safely
    v_role_text := NEW.raw_user_meta_data->>'role';
    
    IF v_role_text = 'FARMER' THEN
        v_role := 'FARMER';
    ELSIF v_role_text = 'ADMIN' THEN
        v_role := 'ADMIN';
    ELSE
        v_role := 'USER';
    END IF;

    -- Insert with all columns using ORIGINAL column names
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        phone, 
        role,
        province,
        city,
        district,
        village,
        postal_code,
        full_address,
        business_name,
        user_type,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'namaLengkap', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'phone',
        v_role,
        NEW.raw_user_meta_data->>'provinsi',
        NEW.raw_user_meta_data->>'kabupatenKota',
        NEW.raw_user_meta_data->>'kecamatan',
        NEW.raw_user_meta_data->>'kelurahan',
        NEW.raw_user_meta_data->>'kodePos',
        NEW.raw_user_meta_data->>'alamatLengkap',
        NEW.raw_user_meta_data->>'namaUsaha',
        NEW.raw_user_meta_data->>'jenisPengguna',
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$;


-- ===========================================
-- STEP 5: VERIFICATION QUERY
-- ===========================================

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('province', 'city', 'district', 'village', 'postal_code', 'full_address')
ORDER BY ordinal_position;


-- ===========================================
-- DONE! 
-- ===========================================
-- Summary of changes:
-- 1. ✅ Reverted column names back to original:
--    - provinsi → province
--    - kabupaten_kota → city
--    - kode_pos → postal_code
--    - alamat_lengkap → full_address
-- 2. ✅ Renamed new columns to English:
--    - kecamatan → district
--    - kelurahan → village
-- 3. ✅ Updated indexes
-- 4. ✅ Updated trigger function
--
-- Now the database schema is (ALL IN ENGLISH):
-- - province (original)
-- - city (original)
-- - district (new - English for kecamatan)
-- - village (new - English for kelurahan)
-- - postal_code (original)
-- - full_address (original)
--
-- ⚠️ IMPORTANT: This does NOT affect Regional Indonesia API
-- The API still returns Indonesian field names, we just map them
-- to English column names in our database for consistency.
-- ===========================================
