-- =====================================================
-- CLEANUP TESTING DATA SCRIPT
-- =====================================================
-- Script untuk menghapus data testing dari production
-- HATI-HATI: Script ini akan menghapus data permanent!
-- =====================================================

-- =====================================================
-- STEP 1: ANALYZE DATABASE SIZE PER TABLE
-- =====================================================
-- Jalankan query ini dulu untuk melihat ukuran tiap tabel
-- Ini akan membantu memahami tabel mana yang paling besar

SELECT
    schemaname as schema_name,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS data_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS index_size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- STEP 2: CHECK ROW COUNTS BEFORE DELETE
-- =====================================================
-- Melihat jumlah data di setiap tabel sebelum dihapus

SELECT 'payments' as table_name, COUNT(*) as row_count FROM public.payments
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'reviews', COUNT(*) FROM public.reviews
UNION ALL
SELECT 'transaction_items', COUNT(*) FROM public.transaction_items
UNION ALL
SELECT 'transactions', COUNT(*) FROM public.transactions
UNION ALL
SELECT 'user_supplies', COUNT(*) FROM public.user_supplies
UNION ALL
SELECT 'wishlists', COUNT(*) FROM public.wishlists
UNION ALL
SELECT 'users', COUNT(*) FROM public.users
ORDER BY row_count DESC;

-- =====================================================
-- STEP 3: DELETE DATA FROM TABLES
-- =====================================================
-- PERINGATAN: Eksekusi bagian ini akan menghapus data!
-- Pastikan sudah backup jika diperlukan!
-- =====================================================

-- Disable RLS temporarily untuk memastikan penghapusan berhasil
-- (Hanya bisa dilakukan dengan service role / admin)

BEGIN;

-- 1. Delete payments (akan otomatis delete karena CASCADE dari transactions)
DELETE FROM public.payments;

-- 2. Delete transaction_items (akan otomatis delete karena CASCADE dari transactions)
DELETE FROM public.transaction_items;

-- 3. Delete transactions
DELETE FROM public.transactions;

-- 4. Delete reviews
DELETE FROM public.reviews;

-- 5. Delete wishlists
DELETE FROM public.wishlists;

-- 6. Delete user_supplies
DELETE FROM public.user_supplies;

-- 7. Delete products (HATI-HATI: Ini akan affect reviews, cart_items, order_items, transaction_items)
-- Products terhubung dengan banyak tabel, hapus setelah yang lain
DELETE FROM public.products;

-- Optional: Delete cart_items and carts (jika ingin reset keranjang semua user)
-- UNCOMMENT jika ingin menghapus cart juga
-- DELETE FROM public.cart_items;
-- DELETE FROM public.carts;

-- Optional: Delete order related data
-- UNCOMMENT jika ingin menghapus orders juga
-- DELETE FROM public.order_tracking;
-- DELETE FROM public.order_items;
-- DELETE FROM public.orders;

-- Optional: Delete addresses (jika ingin reset alamat)
-- UNCOMMENT jika ingin menghapus addresses juga
-- DELETE FROM public.addresses;

-- Optional: Delete farmers (jika ingin reset data farmer)
-- UNCOMMENT jika ingin menghapus farmers juga
-- DELETE FROM public.farmers;

COMMIT;

-- =====================================================
-- STEP 4: VERIFY DELETION
-- =====================================================
-- Check jumlah row setelah delete

SELECT 'payments' as table_name, COUNT(*) as row_count FROM public.payments
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'reviews', COUNT(*) FROM public.reviews
UNION ALL
SELECT 'transaction_items', COUNT(*) FROM public.transaction_items
UNION ALL
SELECT 'transactions', COUNT(*) FROM public.transactions
UNION ALL
SELECT 'user_supplies', COUNT(*) FROM public.user_supplies
UNION ALL
SELECT 'wishlists', COUNT(*) FROM public.wishlists
UNION ALL
SELECT 'users', COUNT(*) FROM public.users
ORDER BY row_count DESC;

-- =====================================================
-- STEP 5: VACUUM TO RECLAIM SPACE
-- =====================================================
-- PENTING: Setelah delete, jalankan VACUUM untuk reclaim disk space
-- VACUUM FULL akan rebuild table dan reclaim space, tapi butuh exclusive lock

VACUUM FULL public.payments;
VACUUM FULL public.transaction_items;
VACUUM FULL public.transactions;
VACUUM FULL public.reviews;
VACUUM FULL public.wishlists;
VACUUM FULL public.user_supplies;
VACUUM FULL public.products;

-- Jika uncomment delete cart/orders/addresses/farmers di atas, vacuum juga:
-- VACUUM FULL public.cart_items;
-- VACUUM FULL public.carts;
-- VACUUM FULL public.order_tracking;
-- VACUUM FULL public.order_items;
-- VACUUM FULL public.orders;
-- VACUUM FULL public.addresses;
-- VACUUM FULL public.farmers;

-- =====================================================
-- STEP 6: CHECK DATABASE SIZE AFTER CLEANUP
-- =====================================================

SELECT
    schemaname as schema_name,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS data_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- ANALYSIS: WHY DATABASE GREW TO 5GB QUICKLY
-- =====================================================
/*
Kemungkinan penyebab database cepat penuh:

1. MEDIA FILES STORED AS TEXT
   - products.images (TEXT[] - array of image URLs/base64)
   - reviews.images (TEXT[] - array of image URLs/base64)
   - user_supplies.photo_url, video_url
   - Jika menyimpan base64 encoded images, ini sangat boros space!

   SOLUSI:
   - Gunakan Supabase Storage untuk menyimpan file
   - Simpan hanya URL di database (jauh lebih kecil)

2. JSONB FIELDS YANG BESAR
   - payments.midtrans_response (menyimpan full response dari Midtrans)
   - payments.notification_history (array of notifications)
   - transactions.metadata
   - user_supplies.status_history

   SOLUSI:
   - Batasi ukuran JSONB yang disimpan
   - Archive old data ke separate table
   - Compress JSON sebelum simpan

3. BANYAK TESTING DATA
   - Jika testing dengan upload banyak images
   - Jika testing dengan banyak transactions

   SOLUSI:
   - Gunakan environment development yang terpisah
   - Limit jumlah testing data

4. INDEXES YANG BANYAK
   - Setiap index mengambil space tambahan
   - Check dengan query di STEP 1 (index_size column)

5. STORAGE BUCKET FILES
   - Files di Supabase Storage juga dihitung dalam quota
   - Check di Dashboard > Storage > Usage

   SOLUSI:
   - Delete unused files dari storage buckets
   - Implement image compression sebelum upload
   - Set retention policy untuk old files
*/

-- =====================================================
-- RECOMMENDATIONS
-- =====================================================
/*
IMMEDIATE ACTIONS:
1. ✅ Run this cleanup script untuk delete testing data
2. ✅ Run VACUUM FULL untuk reclaim space
3. 🔍 Check Supabase Storage usage di dashboard
4. 🗑️ Delete unused files dari storage buckets

LONG TERM SOLUTIONS:
1. 📦 Always use Supabase Storage untuk files, jangan base64 di database
2. 🔄 Setup separate dev/staging environment untuk testing
3. 📊 Monitor database size regularly
4. 🗜️ Implement image compression (max 500KB per image)
5. 📝 Cleanup old/expired data regularly (cron job)
6. 📈 Consider upgrading plan jika usage legitimate

MONITORING QUERIES:
*/

-- Check storage bucket usage (run in Supabase Dashboard > SQL Editor)
-- Note: This requires service role
SELECT
    bucket_id,
    COUNT(*) as file_count,
    pg_size_pretty(SUM(COALESCE((metadata->>'size')::bigint, 0))) as total_size
FROM storage.objects
GROUP BY bucket_id
ORDER BY SUM(COALESCE((metadata->>'size')::bigint, 0)) DESC;

-- =====================================================
-- DONE!
-- =====================================================
