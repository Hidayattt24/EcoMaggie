-- ===========================================
-- ECO-MAGGIE PRODUCT ENHANCEMENTS
-- ===========================================
-- Migration: 004_product_enhancements.sql
-- Purpose: Add missing columns for Farmer Product Management
-- Run this AFTER 003_insert_farmer_account.sql
-- ===========================================


-- ===========================================
-- STEP 1: CREATE PRODUCT STATUS ENUM
-- ===========================================
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('active', 'inactive', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ===========================================
-- STEP 2: ADD MISSING COLUMNS TO PRODUCTS TABLE
-- ===========================================

-- Add discount_percent column (0-100)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'discount_percent'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN discount_percent DECIMAL(5, 2) DEFAULT 0 
        CONSTRAINT check_discount_range CHECK (discount_percent >= 0 AND discount_percent <= 100);
        
        COMMENT ON COLUMN public.products.discount_percent IS 'Discount percentage (0-100). Final price = price * (1 - discount_percent/100)';
    END IF;
END $$;


-- Add low_stock_threshold column
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'low_stock_threshold'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN low_stock_threshold INT DEFAULT 10;
        
        COMMENT ON COLUMN public.products.low_stock_threshold IS 'Minimum stock level before triggering low stock warning';
    END IF;
END $$;


-- Add status column (active, inactive, draft)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN status product_status DEFAULT 'active';
        
        COMMENT ON COLUMN public.products.status IS 'Product visibility status: active, inactive, or draft';
    END IF;
END $$;


-- Add views_count column for analytics
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'views_count'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN views_count INT DEFAULT 0;
        
        COMMENT ON COLUMN public.products.views_count IS 'Total product page views';
    END IF;
END $$;


-- ===========================================
-- STEP 3: CREATE INDEXES FOR NEW COLUMNS
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_discount ON public.products(discount_percent) WHERE discount_percent > 0;
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON public.products(stock, low_stock_threshold);


-- ===========================================
-- STEP 4: CREATE PRODUCT ANALYTICS VIEW
-- ===========================================
-- This view aggregates product performance data for the Bento Grid dashboard

DROP VIEW IF EXISTS public.farmer_product_analytics;
CREATE VIEW public.farmer_product_analytics AS
SELECT 
    p.id AS product_id,
    p.farmer_id,
    p.name AS product_name,
    p.slug,
    p.price,
    p.discount_percent,
    -- Final price calculation
    ROUND(p.price * (1 - COALESCE(p.discount_percent, 0) / 100), 2) AS final_price,
    p.stock,
    p.low_stock_threshold,
    p.status,
    p.images,
    p.views_count,
    p.total_sold,
    p.created_at,
    p.updated_at,
    -- Stock status
    CASE 
        WHEN p.stock <= 0 THEN 'out_of_stock'
        WHEN p.stock <= p.low_stock_threshold THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status,
    -- Review metrics
    COALESCE(review_stats.avg_rating, 0) AS avg_rating,
    COALESCE(review_stats.total_reviews, 0) AS total_reviews,
    -- Wishlist count
    COALESCE(wishlist_stats.wishlist_count, 0) AS wishlist_count,
    -- Revenue calculation
    COALESCE(p.total_sold * ROUND(p.price * (1 - COALESCE(p.discount_percent, 0) / 100), 2), 0) AS total_revenue
FROM public.products p
-- Join with aggregated review stats
LEFT JOIN (
    SELECT 
        product_id,
        ROUND(AVG(rating)::NUMERIC, 2) AS avg_rating,
        COUNT(*) AS total_reviews
    FROM public.reviews
    GROUP BY product_id
) review_stats ON p.id = review_stats.product_id
-- Join with aggregated wishlist count
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) AS wishlist_count
    FROM public.wishlists
    GROUP BY product_id
) wishlist_stats ON p.id = wishlist_stats.product_id;


-- ===========================================
-- STEP 5: CREATE FARMER DASHBOARD SUMMARY VIEW
-- ===========================================
-- Aggregated stats per farmer for dashboard Bento Grid

DROP VIEW IF EXISTS public.farmer_dashboard_stats;
CREATE VIEW public.farmer_dashboard_stats AS
SELECT 
    f.id AS farmer_id,
    f.user_id,
    f.farm_name,
    -- Product counts
    COUNT(p.id) AS total_products,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) AS active_products,
    COUNT(CASE WHEN p.status = 'inactive' THEN 1 END) AS inactive_products,
    COUNT(CASE WHEN p.status = 'draft' THEN 1 END) AS draft_products,
    -- Stock alerts
    COUNT(CASE WHEN p.stock <= p.low_stock_threshold AND p.stock > 0 THEN 1 END) AS low_stock_count,
    COUNT(CASE WHEN p.stock <= 0 THEN 1 END) AS out_of_stock_count,
    -- Sales metrics
    COALESCE(SUM(p.total_sold), 0) AS total_sales,
    COALESCE(SUM(p.views_count), 0) AS total_views,
    -- Revenue
    COALESCE(
        SUM(p.total_sold * ROUND(p.price * (1 - COALESCE(p.discount_percent, 0) / 100), 2)), 
        0
    ) AS total_revenue,
    -- Average metrics
    COALESCE(ROUND(AVG(review_stats.avg_rating)::NUMERIC, 2), 0) AS avg_rating,
    COALESCE(SUM(review_stats.total_reviews), 0) AS total_reviews,
    COALESCE(SUM(wishlist_stats.wishlist_count), 0) AS total_wishlists
FROM public.farmers f
LEFT JOIN public.products p ON f.id = p.farmer_id
LEFT JOIN (
    SELECT 
        product_id,
        ROUND(AVG(rating)::NUMERIC, 2) AS avg_rating,
        COUNT(*) AS total_reviews
    FROM public.reviews
    GROUP BY product_id
) review_stats ON p.id = review_stats.product_id
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) AS wishlist_count
    FROM public.wishlists
    GROUP BY product_id
) wishlist_stats ON p.id = wishlist_stats.product_id
GROUP BY f.id, f.user_id, f.farm_name;


-- ===========================================
-- STEP 6: UPDATE RLS POLICIES FOR VIEWS
-- ===========================================
-- Note: Views inherit RLS from underlying tables
-- Additional function for getting farmer products safely

CREATE OR REPLACE FUNCTION public.get_my_products()
RETURNS SETOF public.farmer_product_analytics
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT fpa.*
    FROM public.farmer_product_analytics fpa
    INNER JOIN public.farmers f ON fpa.farmer_id = f.id
    WHERE f.user_id = auth.uid();
$$;


CREATE OR REPLACE FUNCTION public.get_my_dashboard_stats()
RETURNS public.farmer_dashboard_stats
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT fds.*
    FROM public.farmer_dashboard_stats fds
    INNER JOIN public.farmers f ON fds.farmer_id = f.id
    WHERE f.user_id = auth.uid()
    LIMIT 1;
$$;


-- ===========================================
-- STEP 7: CREATE SLUG GENERATION FUNCTION
-- ===========================================
-- Auto-generate SEO-friendly slug from product name

CREATE OR REPLACE FUNCTION public.generate_product_slug(product_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INT := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(trim(product_name));
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check for duplicates and append counter if needed
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;


-- ===========================================
-- STEP 8: SOFT DELETE SUPPORT (Optional)
-- ===========================================
-- Add deleted_at column for soft delete functionality

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        
        COMMENT ON COLUMN public.products.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted';
    END IF;
END $$;

-- Index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON public.products(deleted_at) WHERE deleted_at IS NULL;

-- Update RLS to exclude soft-deleted products from public view
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);


-- ===========================================
-- DONE! Product enhancements ready.
-- Run: psql -h <host> -d postgres -f 004_product_enhancements.sql
-- Or paste in Supabase SQL Editor
-- ===========================================
