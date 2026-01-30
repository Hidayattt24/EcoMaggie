-- ===========================================
-- INSERT ADMIN FARMER ACCOUNT
-- ===========================================
-- Email: ecomaggie@gmail.com
-- Password: ecomaggie123
-- Role: FARMER (Admin)
-- ===========================================

-- CATATAN PENTING:
-- Ada 2 cara untuk menjalankan ini:
-- 1. RECOMMENDED: Buat user dulu di Dashboard, lalu jalankan STEP 1-3
-- 2. FULL AUTO: Jalankan semua step termasuk STEP 0 (create auth user)

-- ===========================================
-- STEP 0 (OPTIONAL): CREATE AUTH USER
-- ===========================================
-- Jalankan ini HANYA jika belum buat user di Dashboard
-- Jika sudah buat via Dashboard, skip ke STEP 1

-- CATATAN: Lebih baik buat user via Dashboard untuk menghindari error
-- Cara buat via Dashboard ada di bagian bawah file ini


-- ===========================================
-- STEP 1: UPDATE AUTH USER METADATA
-- ===========================================
-- Jalankan ini jika user sudah dibuat di Dashboard
-- Update metadata untuk user yang sudah ada

UPDATE auth.users
SET
    raw_user_meta_data = jsonb_build_object(
        'name', 'Ecomaggie Admin',
        'namaLengkap', 'Ecomaggie Admin',
        'phone', '081234567890',
        'role', 'FARMER',
        'jenisPengguna', 'petani',
        'namaUsaha', 'Ecomaggie Farm',
        'provinsi', 'Jawa Timur',
        'kabupatenKota', 'Surabaya',
        'kodePos', '60111',
        'alamatLengkap', 'Jl. Ecomaggie No. 1, Surabaya'
    ),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'ecomaggie@gmail.com';


-- ===========================================
-- STEP 2: INSERT/UPDATE PUBLIC.USERS
-- ===========================================
-- Insert data profil user ke tabel public.users

INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    role,
    province,
    city,
    postal_code,
    full_address,
    business_name,
    user_type,
    email_verified,
    created_at,
    updated_at
)
SELECT
    au.id,
    'ecomaggie@gmail.com',
    'Ecomaggie Admin',
    '081234567890',
    'FARMER'::user_role,
    'Jawa Timur',
    'Surabaya',
    '60111',
    'Jl. Ecomaggie No. 1, Surabaya',
    'Ecomaggie Farm',
    'petani',
    NOW(),
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'ecomaggie@gmail.com'
ON CONFLICT (id)
DO UPDATE SET
    name = 'Ecomaggie Admin',
    phone = '081234567890',
    role = 'FARMER'::user_role,
    province = 'Jawa Timur',
    city = 'Surabaya',
    postal_code = '60111',
    full_address = 'Jl. Ecomaggie No. 1, Surabaya',
    business_name = 'Ecomaggie Farm',
    user_type = 'petani',
    email_verified = NOW(),
    updated_at = NOW();


-- ===========================================
-- STEP 3: INSERT FARMER RECORD (WAJIB!)
-- ===========================================
-- User dengan role FARMER HARUS punya record di tabel farmers
-- Ini sangat penting untuk product management!

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
    COALESCE(u.business_name, 'Ecomaggie Farm'),
    'Farm resmi Ecomaggie - Admin sistem untuk pengelolaan produk maggot BSF berkualitas tinggi',
    'Surabaya, Jawa Timur',
    5.0, -- Rating maksimal untuk admin
    true, -- Langsung verified
    NOW(),
    NOW()
FROM public.users u
WHERE u.email = 'ecomaggie@gmail.com'
  AND u.role = 'FARMER'
  AND NOT EXISTS (
      SELECT 1 FROM public.farmers f WHERE f.user_id = u.id
  );


-- ===========================================
-- VERIFICATION - CEK HASIL
-- ===========================================
-- Jalankan query ini untuk memastikan semua data benar

SELECT
    '=== AUTH USER DATA ===' as section,
    au.id as user_id,
    au.email,
    au.email_confirmed_at,
    au.raw_user_meta_data->>'role' as auth_role,
    au.raw_user_meta_data->>'name' as auth_name,
    au.created_at
FROM auth.users au
WHERE au.email = 'ecomaggie@gmail.com'

UNION ALL

SELECT
    '=== PUBLIC USER DATA ===' as section,
    u.id::text,
    u.email,
    u.email_verified,
    u.role::text as public_role,
    u.name,
    u.created_at
FROM public.users u
WHERE u.email = 'ecomaggie@gmail.com'

UNION ALL

SELECT
    '=== FARMER DATA ===' as section,
    f.id::text as farmer_id,
    f.farm_name,
    f.is_verified::text,
    f.rating::text,
    u.email,
    f.created_at
FROM public.farmers f
JOIN public.users u ON f.user_id = u.id
WHERE u.email = 'ecomaggie@gmail.com';


-- ===========================================
-- CATATAN CARA PAKAI
-- ===========================================
/*
CARA 1 (RECOMMENDED) - Buat User di Dashboard dulu:
1. Buka Supabase Dashboard → Authentication → Users
2. Klik "Add user" → Manual
3. Isi:
   - Email: ecomaggie@gmail.com
   - Password: ecomaggie123
   - Auto Confirm User: YES (centang)
4. Klik "Create user"
5. Jalankan STEP 1, 2, dan 3 dari SQL ini
6. Jalankan query VERIFICATION untuk cek
7. Login dengan email dan password tersebut

CARA 2 (FULL AUTO) - Langsung via SQL:
1. Jalankan SEMUA STEP (0, 1, 2, 3) sekaligus
2. Jalankan query VERIFICATION untuk cek
3. Login dengan email dan password tersebut

TROUBLESHOOTING:
- Jika login gagal, reset password di Dashboard:
  Authentication → Users → Pilih user → Reset Password

- Pastikan hasil VERIFICATION menunjukkan:
  ✓ auth_role: FARMER
  ✓ public_role: FARMER
  ✓ email_confirmed_at: ada valuenya (not null)
  ✓ farmer_id: ada valuenya (not null)
  ✓ is_verified: true

SECURITY:
- Ganti password setelah first login
- Jangan share credentials ke publik
- Gunakan untuk keperluan admin/testing saja

AKSES SETELAH LOGIN:
- Role FARMER akan otomatis redirect ke /farmer/dashboard
- Bisa create products, manage supplies, dll
- Verified farmer = bisa langsung jualan
*/
