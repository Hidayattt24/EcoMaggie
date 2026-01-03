-- ===========================================
-- INSERT FARMER ADMIN ACCOUNT
-- ===========================================
-- Akun farmer khusus untuk admin sistem
-- Email: egomaggie@gmail.com
-- Password: egomaggie123
-- Role: FARMER (Admin)
-- ===========================================

-- STEP 1: Update metadata di auth.users untuk farmer yang sudah dibuat
-- Jalankan ini di Supabase SQL Editor

UPDATE auth.users
SET 
    raw_user_meta_data = jsonb_build_object(
        'name', 'Egomaggie',
        'namaLengkap', 'Egomaggie',
        'phone', '0895341980391',
        'role', 'FARMER',
        'jenisPengguna', 'petani',
        'namaUsaha', 'Egomaggie Farm'
    ),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'egomaggie@gmail.com';

-- STEP 2: Update atau Insert ke public.users
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
    'egomaggie@gmail.com',
    'Egomaggie',
    '0895341980391',
    'FARMER'::user_role,
    '',
    '',
    '',
    '',
    'Egomaggie Farm',
    'petani',
    NOW(),
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'egomaggie@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET
    name = 'Egomaggie',
    phone = '0895341980391',
    role = 'FARMER'::user_role,
    business_name = 'Egomaggie Farm',
    user_type = 'petani',
    email_verified = NOW(),
    updated_at = NOW();


-- ===========================================
-- VERIFICATION - Cek apakah sudah benar
-- ===========================================
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.raw_user_meta_data->>'role' as auth_role,
    au.raw_user_meta_data->>'name' as auth_name,
    u.name as public_name,
    u.role as public_role,
    u.email_verified
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'egomaggie@gmail.com';


-- ===========================================
-- STEP 3: INSERT FARMER RECORD (PENTING!)
-- ===========================================
-- User dengan role FARMER harus punya record di tabel farmers
-- Ini dibutuhkan untuk product management

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
    COALESCE(u.business_name, 'Egomaggie Farm'),
    'Farm resmi Egomaggie - Produsen maggot BSF berkualitas tinggi',
    'Indonesia',
    0,
    true,
    NOW(),
    NOW()
FROM public.users u
WHERE u.email = 'egomaggie@gmail.com'
  AND u.role = 'FARMER'
  AND NOT EXISTS (
      SELECT 1 FROM public.farmers f WHERE f.user_id = u.id
  );

-- Verify farmer record
SELECT 
    f.id as farmer_id,
    f.user_id,
    f.farm_name,
    f.is_verified,
    u.email,
    u.name
FROM public.farmers f
JOIN public.users u ON f.user_id = u.id
WHERE u.email = 'egomaggie@gmail.com';


-- ===========================================
-- CATATAN PENTING
-- ===========================================
/*
SETELAH MENJALANKAN QUERY DI ATAS:

1. Logout dari aplikasi jika sedang login
2. Login kembali dengan:
   Email: egomaggie@gmail.com
   Password: (password yang Anda set di Dashboard)
   
3. Seharusnya otomatis redirect ke /farmer/dashboard

TROUBLESHOOTING:
- Jika masih invalid credentials, reset password di Dashboard:
  Dashboard → Authentication → Users → Pilih user → Reset Password
  
- Pastikan hasil VERIFICATION query menunjukkan:
  * auth_role: FARMER
  * public_role: FARMER
  * email_confirmed_at: ada valuenya (not null)

SECURITY:
- Ganti password setelah first login
- Jangan share credentials
*/
