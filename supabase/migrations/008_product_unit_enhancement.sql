-- ===========================================
-- ECO-MAGGIE PRODUCT UNIT ENHANCEMENT
-- ===========================================
-- Migration: 008_product_unit_enhancement.sql
-- Purpose: Enhance unit column with constraint and index
-- Run this AFTER 007_remove_views_count.sql
-- ===========================================


-- ===========================================
-- STEP 1: CREATE UNIT ENUM TYPE (OPTIONAL - More Strict)
-- ===========================================
-- Option A: Use ENUM for strict validation
-- Uncomment if you want strict validation

-- DO $$ BEGIN
--     CREATE TYPE product_unit AS ENUM ('kg', 'gram', 'liter', 'box', 'pcs');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;


-- ===========================================
-- STEP 2: ENSURE UNIT COLUMN EXISTS WITH PROPER TYPE
-- ===========================================
-- The column already exists, but let's ensure it has proper settings

-- Check and update existing unit values if needed
UPDATE public.products 
SET unit = 'kg' 
WHERE unit IS NULL OR unit = '';

-- Ensure NOT NULL constraint
DO $$ BEGIN
    ALTER TABLE public.products 
    ALTER COLUMN unit SET NOT NULL;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Set default value
DO $$ BEGIN
    ALTER TABLE public.products 
    ALTER COLUMN unit SET DEFAULT 'kg';
EXCEPTION
    WHEN others THEN null;
END $$;


-- ===========================================
-- STEP 3: ADD CHECK CONSTRAINT FOR VALID UNITS
-- ===========================================
-- This ensures only valid unit values are stored

DO $$ BEGIN
    -- Drop existing constraint if exists (to recreate)
    ALTER TABLE public.products 
    DROP CONSTRAINT IF EXISTS check_valid_unit;
    
    -- Add constraint for valid units
    ALTER TABLE public.products 
    ADD CONSTRAINT check_valid_unit 
    CHECK (unit IN ('kg', 'gram', 'liter', 'box', 'pcs'));
    
    RAISE NOTICE 'Unit constraint added successfully';
EXCEPTION
    WHEN others THEN 
        RAISE NOTICE 'Could not add unit constraint: %', SQLERRM;
END $$;


-- ===========================================
-- STEP 4: CREATE INDEX FOR UNIT COLUMN
-- ===========================================
-- For faster filtering by unit

CREATE INDEX IF NOT EXISTS idx_products_unit ON public.products(unit);


-- ===========================================
-- STEP 5: ADD COMMENT FOR DOCUMENTATION
-- ===========================================
COMMENT ON COLUMN public.products.unit IS 'Product measurement unit: kg (kilogram), gram, liter, box, pcs (pieces)';


-- ===========================================
-- STEP 6: CREATE HELPER VIEW FOR UNIT DISPLAY
-- ===========================================
-- This view can be used for reporting and analytics

DROP VIEW IF EXISTS public.product_unit_summary;

CREATE OR REPLACE VIEW public.product_unit_summary AS
SELECT 
    unit,
    COUNT(*) as product_count,
    CASE unit
        WHEN 'kg' THEN 'Kilogram (kg)'
        WHEN 'gram' THEN 'Gram (g)'
        WHEN 'liter' THEN 'Liter (L)'
        WHEN 'box' THEN 'Box'
        WHEN 'pcs' THEN 'Pieces (pcs)'
        ELSE unit
    END as unit_label,
    CASE unit
        WHEN 'kg' THEN 'Untuk produk berat besar'
        WHEN 'gram' THEN 'Untuk produk berat kecil'
        WHEN 'liter' THEN 'Untuk produk cair'
        WHEN 'box' THEN 'Untuk produk kemasan'
        WHEN 'pcs' THEN 'Untuk produk satuan'
        ELSE 'Lainnya'
    END as unit_description,
    SUM(stock) as total_stock
FROM public.products
WHERE status = 'active'
GROUP BY unit
ORDER BY product_count DESC;


-- ===========================================
-- VERIFICATION QUERY (Run to check)
-- ===========================================
-- SELECT 
--     column_name, 
--     data_type, 
--     column_default, 
--     is_nullable
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'products' 
-- AND column_name = 'unit';

-- SELECT * FROM public.product_unit_summary;


-- ===========================================
-- DONE! 
-- ===========================================
-- The unit column is now:
-- 1. NOT NULL with default 'kg'
-- 2. Constrained to valid values: kg, gram, liter, box, pcs
-- 3. Indexed for fast filtering
-- 4. Has a helper view for analytics
-- ===========================================
