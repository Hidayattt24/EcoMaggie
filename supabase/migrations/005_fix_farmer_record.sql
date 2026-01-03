-- ===========================================
-- FIX: INSERT MISSING FARMER RECORD
-- ===========================================
-- Jalankan ini di Supabase SQL Editor
-- Masalah: User sudah login tapi tidak bisa tambah produk
-- Penyebab: Record di tabel 'farmers' tidak ada
-- ===========================================

-- STEP 1: Cek apakah farmer record sudah ada
SELECT 
    'User Info' as info,
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    u.business_name
FROM public.users u
WHERE u.role = 'FARMER';

SELECT 
    'Farmer Info' as info,
    f.id as farmer_id,
    f.user_id,
    f.farm_name,
    f.is_verified
FROM public.farmers f;


-- STEP 2: Insert farmer record untuk semua user dengan role FARMER yang belum punya record
INSERT INTO public.farmers (
    user_id,
    farm_name,
    description,
    location,
    rating,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    u.id,
    COALESCE(u.business_name, u.name || ' Farm', 'Eco Farm'),
    'Farm produsen produk organik berkualitas tinggi',
    'Indonesia',
    0,
    true,
    NOW(),
    NOW()
FROM public.users u
WHERE u.role = 'FARMER'
  AND NOT EXISTS (
      SELECT 1 FROM public.farmers f WHERE f.user_id = u.id
  );


-- STEP 3: Verify - Pastikan farmer record sudah ada
SELECT 
    'RESULT' as status,
    f.id as farmer_id,
    f.user_id,
    f.farm_name,
    f.is_verified,
    u.email,
    u.name,
    u.role
FROM public.farmers f
JOIN public.users u ON f.user_id = u.id
WHERE u.role = 'FARMER';


-- ===========================================
-- Setelah menjalankan query ini:
-- 1. Refresh halaman aplikasi
-- 2. Coba tambah produk lagi
-- ===========================================
