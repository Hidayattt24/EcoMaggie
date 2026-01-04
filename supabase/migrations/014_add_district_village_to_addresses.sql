-- ===========================================
-- ADD DISTRICT & VILLAGE TO ADDRESSES TABLE
-- ===========================================
-- Migration: 014_add_district_village_to_addresses.sql
-- Purpose: Add district (kecamatan) and village (kelurahan) columns to addresses table
-- Run this in Supabase SQL Editor
-- ===========================================

-- Add district column
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'addresses' 
        AND column_name = 'district'
    ) THEN
        ALTER TABLE public.addresses 
        ADD COLUMN district VARCHAR(100);
        
        COMMENT ON COLUMN public.addresses.district IS 'District/Kecamatan name';
        
        RAISE NOTICE 'Column district added to addresses table';
    ELSE
        RAISE NOTICE 'Column district already exists in addresses table';
    END IF;
END $$;

-- Add village column
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'addresses' 
        AND column_name = 'village'
    ) THEN
        ALTER TABLE public.addresses 
        ADD COLUMN village VARCHAR(100);
        
        COMMENT ON COLUMN public.addresses.village IS 'Village/Kelurahan/Desa name';
        
        RAISE NOTICE 'Column village added to addresses table';
    ELSE
        RAISE NOTICE 'Column village already exists in addresses table';
    END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_addresses_district ON public.addresses(district);
CREATE INDEX IF NOT EXISTS idx_addresses_village ON public.addresses(village);

-- Verification query
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'addresses'
  AND column_name IN ('district', 'village')
ORDER BY ordinal_position;

-- ===========================================
-- DONE!
-- ===========================================
-- Summary:
-- 1. ✅ Added 'district' column to addresses table
-- 2. ✅ Added 'village' column to addresses table
-- 3. ✅ Created indexes for faster queries
--
-- Now addresses can store complete address hierarchy:
-- - province
-- - city
-- - district (kecamatan)
-- - village (kelurahan/desa)
-- - postal_code
-- - street (full address)
-- ===========================================
