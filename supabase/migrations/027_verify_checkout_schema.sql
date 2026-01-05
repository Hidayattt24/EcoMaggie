-- ===========================================
-- VERIFY CHECKOUT SCHEMA
-- ===========================================
-- Migration: 027_verify_checkout_schema.sql
-- Purpose: Verify all required columns exist for checkout functionality
-- Run this in Supabase SQL Editor to verify schema
-- ===========================================

-- ===========================================
-- 1. VERIFY ADDRESSES TABLE
-- ===========================================
-- Check if all required columns exist in addresses table
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'addresses'
ORDER BY ordinal_position;

-- Expected columns:
-- ✓ id (uuid)
-- ✓ user_id (uuid)
-- ✓ label (varchar) - Label alamat (Rumah, Kantor, dll)
-- ✓ recipient (varchar) - Nama penerima
-- ✓ phone (varchar) - Nomor telepon
-- ✓ street (text) - Alamat lengkap
-- ✓ city (varchar) - Kota/Kabupaten
-- ✓ province (varchar) - Provinsi
-- ✓ district (varchar) - Kecamatan (added in migration 014)
-- ✓ village (varchar) - Kelurahan/Desa (added in migration 014)
-- ✓ postal_code (varchar) - Kode pos
-- ✓ is_default (boolean) - Alamat utama
-- ✓ latitude (decimal)
-- ✓ longitude (decimal)
-- ✓ created_at (timestamp)
-- ✓ updated_at (timestamp)

-- ===========================================
-- 2. VERIFY PRODUCTS TABLE
-- ===========================================
-- Check if all required columns exist in products table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name IN ('id', 'name', 'slug', 'price', 'discount_percent', 'stock', 'unit', 'images', 'is_active')
ORDER BY ordinal_position;

-- Expected columns for checkout:
-- ✓ id (uuid)
-- ✓ name (varchar) - Nama produk
-- ✓ slug (varchar) - URL slug
-- ✓ price (decimal) - Harga asli
-- ✓ discount_percent (integer) - Persentase diskon
-- ✓ stock (integer) - Stok tersedia
-- ✓ unit (varchar) - Satuan (kg, pcs, dll)
-- ✓ images (text[]) - Array gambar produk
-- ✓ is_active (boolean) - Status aktif

-- ===========================================
-- 3. VERIFY CART TABLES
-- ===========================================
-- Check carts table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'carts'
ORDER BY ordinal_position;

-- Check cart_items table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cart_items'
ORDER BY ordinal_position;

-- Expected columns:
-- carts:
-- ✓ id (uuid)
-- ✓ user_id (uuid)
-- ✓ created_at (timestamp)
-- ✓ updated_at (timestamp)

-- cart_items:
-- ✓ id (uuid)
-- ✓ cart_id (uuid)
-- ✓ product_id (uuid)
-- ✓ quantity (integer)
-- ✓ created_at (timestamp)
-- ✓ updated_at (timestamp)

-- ===========================================
-- 4. VERIFY ORDERS TABLE (for future use)
-- ===========================================
-- Check if orders table has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
ORDER BY ordinal_position;

-- Expected columns:
-- ✓ id (uuid)
-- ✓ order_number (varchar) - Nomor order unik
-- ✓ user_id (uuid)
-- ✓ address_id (uuid) - Reference ke addresses
-- ✓ status (order_status enum)
-- ✓ subtotal (decimal)
-- ✓ shipping_cost (decimal)
-- ✓ total (decimal)
-- ✓ notes (text)
-- ✓ payment_method (varchar)
-- ✓ paid_at (timestamp)
-- ✓ shipped_at (timestamp)
-- ✓ delivered_at (timestamp)
-- ✓ created_at (timestamp)
-- ✓ updated_at (timestamp)

-- ===========================================
-- 5. VERIFY RLS POLICIES
-- ===========================================
-- Check if RLS is enabled and policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('addresses', 'carts', 'cart_items', 'products', 'orders')
ORDER BY tablename, policyname;

-- ===========================================
-- 6. TEST QUERIES
-- ===========================================
-- Test if we can query addresses with all fields
-- (This will return empty if no data, but should not error)
SELECT 
    id,
    label,
    recipient,
    phone,
    street,
    city,
    province,
    district,
    village,
    postal_code,
    is_default
FROM public.addresses
LIMIT 1;

-- Test if we can query products with discount
SELECT 
    id,
    name,
    price,
    discount_percent,
    stock,
    unit,
    images,
    is_active
FROM public.products
WHERE is_active = true
LIMIT 1;

-- Test if we can query cart with items
SELECT 
    c.id as cart_id,
    c.user_id,
    ci.id as item_id,
    ci.product_id,
    ci.quantity,
    p.name as product_name,
    p.price,
    p.discount_percent
FROM public.carts c
LEFT JOIN public.cart_items ci ON c.id = ci.cart_id
LEFT JOIN public.products p ON ci.product_id = p.id
LIMIT 5;

-- ===========================================
-- SUMMARY
-- ===========================================
-- All required columns for checkout functionality should exist:
-- 
-- ✅ addresses table: Complete with district & village
-- ✅ products table: Complete with all pricing fields
-- ✅ carts & cart_items: Complete for shopping cart
-- ✅ orders table: Ready for order creation
-- 
-- If any queries above return errors, check:
-- 1. Run migration 001_initial_schema.sql
-- 2. Run migration 014_add_district_village_to_addresses.sql
-- 3. Ensure RLS policies are properly configured
-- ===========================================
