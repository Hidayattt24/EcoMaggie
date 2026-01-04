-- ===========================================
-- ECO-MAGGIE ADD KELURAHAN/DESA FIELD
-- ===========================================
-- Migration: 010_add_kelurahan_to_users.sql
-- Purpose: Add kelurahan/desa field to users table for complete address
-- Run this in Supabase SQL Editor
-- ===========================================


-- ===========================================
-- STEP 1: ADD KELURAHAN COLUMN TO USERS TABLE
-- ===========================================
-- This allows users to store village/kelurahan data
-- Can be from dropdown selection OR manual input

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'kelurahan'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN kelurahan VARCHAR(100);
        
        COMMENT ON COLUMN public.users.kelurahan IS 'Village/Kelurahan/Desa name - can be from API or manual input';
        
        RAISE NOTICE 'Column kelurahan added successfully';
    ELSE
        RAISE NOTICE 'Column kelurahan already exists';
    END IF;
END $$;


-- ===========================================
-- STEP 2: ADD KECAMATAN COLUMN (IF NOT EXISTS)
-- ===========================================
-- Ensure kecamatan column exists for complete address hierarchy

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'kecamatan'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN kecamatan VARCHAR(100);
        
        COMMENT ON COLUMN public.users.kecamatan IS 'District/Kecamatan name - can be from API or manual input';
        
        RAISE NOTICE 'Column kecamatan added successfully';
    ELSE
        RAISE NOTICE 'Column kecamatan already exists';
    END IF;
END $$;


-- ===========================================
-- STEP 3: RENAME EXISTING COLUMNS FOR CONSISTENCY
-- ===========================================
-- Ensure column names match the form fields

-- Rename 'province' to 'provinsi' if needed
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'province'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'provinsi'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN province TO provinsi;
        
        RAISE NOTICE 'Column province renamed to provinsi';
    END IF;
END $$;

-- Rename 'city' to 'kabupaten_kota' if needed
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'city'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'kabupaten_kota'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN city TO kabupaten_kota;
        
        RAISE NOTICE 'Column city renamed to kabupaten_kota';
    END IF;
END $$;

-- Rename 'postal_code' to 'kode_pos' if needed
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'postal_code'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'kode_pos'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN postal_code TO kode_pos;
        
        RAISE NOTICE 'Column postal_code renamed to kode_pos';
    END IF;
END $$;

-- Rename 'full_address' to 'alamat_lengkap' if needed
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'full_address'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'alamat_lengkap'
    ) THEN
        ALTER TABLE public.users 
        RENAME COLUMN full_address TO alamat_lengkap;
        
        RAISE NOTICE 'Column full_address renamed to alamat_lengkap';
    END IF;
END $$;


-- ===========================================
-- STEP 4: CREATE INDEXES FOR FASTER QUERIES
-- ===========================================

-- Index for kelurahan searches
CREATE INDEX IF NOT EXISTS idx_users_kelurahan ON public.users(kelurahan);

-- Index for kecamatan searches
CREATE INDEX IF NOT EXISTS idx_users_kecamatan ON public.users(kecamatan);

-- Composite index for complete address queries
CREATE INDEX IF NOT EXISTS idx_users_address_hierarchy 
ON public.users(provinsi, kabupaten_kota, kecamatan, kelurahan);


-- ===========================================
-- STEP 5: UPDATE TRIGGER FUNCTION TO HANDLE NEW FIELDS
-- ===========================================
-- Update the handle_new_user function to include new address fields

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

    -- Insert with all columns including new address fields
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        phone, 
        role,
        provinsi,
        kabupaten_kota,
        kecamatan,
        kelurahan,
        kode_pos,
        alamat_lengkap,
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
-- STEP 6: VERIFICATION QUERY
-- ===========================================
-- Run this to verify the changes

SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('provinsi', 'kabupaten_kota', 'kecamatan', 'kelurahan', 'kode_pos', 'alamat_lengkap')
ORDER BY ordinal_position;


-- ===========================================
-- STEP 7: TEST DATA (OPTIONAL - FOR TESTING)
-- ===========================================
-- Uncomment to test with sample data

/*
-- Test update existing user with new address fields
UPDATE public.users
SET 
    provinsi = 'DKI Jakarta',
    kabupaten_kota = 'Jakarta Selatan',
    kecamatan = 'Kebayoran Baru',
    kelurahan = 'Senayan',
    kode_pos = '12190',
    alamat_lengkap = 'Jl. Asia Afrika No. 8, RT 01/RW 03',
    updated_at = NOW()
WHERE email = 'test@example.com';

-- Verify the update
SELECT 
    email,
    name,
    provinsi,
    kabupaten_kota,
    kecamatan,
    kelurahan,
    kode_pos,
    alamat_lengkap
FROM public.users
WHERE email = 'test@example.com';
*/


-- ===========================================
-- DONE! 
-- ===========================================
-- Summary of changes:
-- 1. ✅ Added 'kelurahan' column to users table
-- 2. ✅ Added 'kecamatan' column to users table (if not exists)
-- 3. ✅ Renamed columns for consistency (province → provinsi, etc)
-- 4. ✅ Created indexes for faster address queries
-- 5. ✅ Updated trigger function to handle new fields
--
-- Now users can:
-- - Select kelurahan from dropdown (from API)
-- - OR manually input kelurahan if not in list
-- - Same for kecamatan field
--
-- Next steps:
-- 1. Test registration with new address fields
-- 2. Verify data is saved correctly
-- 3. Update profile edit form to include these fields
-- ===========================================
