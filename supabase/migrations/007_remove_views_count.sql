-- ===========================================
-- ECO-MAGGIE: REMOVE VIEWS_COUNT COLUMN
-- ===========================================
-- Migration: 007_remove_views_count.sql
-- Purpose: Remove views_count column as it's not relevant
-- Run this AFTER 006_product_sales_history.sql
-- ===========================================


-- ===========================================
-- STEP 1: DROP DEPENDENT FUNCTIONS FIRST
-- ===========================================
-- Must drop functions that depend on the views/types BEFORE dropping views

DROP FUNCTION IF EXISTS public.get_my_products() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS public.increment_product_views(TEXT) CASCADE;


-- ===========================================
-- STEP 2: DROP DEPENDENT VIEWS
-- ===========================================
-- Drop views that reference views_count column

DROP VIEW IF EXISTS public.farmer_product_analytics CASCADE;
DROP VIEW IF EXISTS public.farmer_dashboard_stats CASCADE;


-- ===========================================
-- STEP 3: DROP INDEX
-- ===========================================

DROP INDEX IF EXISTS idx_products_views_count;


-- ===========================================
-- STEP 4: REMOVE COLUMN FROM PRODUCTS TABLE
-- ===========================================

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'views_count'
    ) THEN
        ALTER TABLE public.products DROP COLUMN views_count;
        RAISE NOTICE 'Column views_count has been removed from products table';
    ELSE
        RAISE NOTICE 'Column views_count does not exist, skipping...';
    END IF;
END $$;


-- ===========================================
-- STEP 5: RECREATE VIEWS WITHOUT views_count
-- ===========================================

-- Recreate farmer_product_analytics view without views_count
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
) wishlist_stats ON p.id = wishlist_stats.product_id;


-- Recreate farmer_dashboard_stats view without views_count
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
-- STEP 5: UPDATE CATEGORY COLUMN TYPE
-- ===========================================
-- Change category from enum to VARCHAR to allow custom categories

DO $$ BEGIN
    -- First check current type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'category'
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Change to VARCHAR to support custom categories
        ALTER TABLE public.products 
        ALTER COLUMN category TYPE VARCHAR(100) USING category::VARCHAR(100);
        
        -- Set default
        ALTER TABLE public.products 
        ALTER COLUMN category SET DEFAULT 'Lainnya';
        
        RAISE NOTICE 'Category column changed from enum to VARCHAR(100)';
    ELSE
        RAISE NOTICE 'Category column is already VARCHAR or other type, skipping...';
    END IF;
END $$;


-- ===========================================
-- DONE! Views count removed, category updated.
-- ===========================================
