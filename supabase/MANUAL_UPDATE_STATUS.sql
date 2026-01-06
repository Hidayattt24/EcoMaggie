-- =====================================================
-- MANUAL UPDATE PAYMENT STATUS - COMPREHENSIVE GUIDE
-- =====================================================
-- Gunakan script ini untuk manual update status transaksi
-- jika webhook gagal dan self-healing tidak berfungsi
-- =====================================================

-- =====================================================
-- STEP 1: DIAGNOSA - Cek status transaksi saat ini
-- =====================================================
SELECT 
  t.order_id,
  t.status as transaction_status,
  t.paid_at,
  t.updated_at,
  t.created_at,
  t.total_amount,
  p.payment_status,
  p.midtrans_transaction_id,
  p.payment_type,
  p.snap_token IS NOT NULL as has_snap_token
FROM transactions t
LEFT JOIN payments p ON p.transaction_id = t.id
WHERE t.order_id = 'ECO-20260106-33793';  -- Ganti dengan order_id yang bermasalah

-- =====================================================
-- STEP 2: UPDATE - Jalankan HANYA jika sudah settlement di Midtrans
-- =====================================================
-- PENTING: Pastikan sudah cek di Midtrans Dashboard bahwa status = Settlement

-- 2a. Update transactions table
UPDATE transactions 
SET 
  status = 'paid',
  paid_at = NOW(),
  updated_at = NOW(),
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'manual_update', true,
    'updated_by', 'admin',
    'reason', 'Webhook failed - manual sync from Midtrans Dashboard',
    'midtrans_status', 'settlement',
    'manual_updated_at', NOW()
  )
WHERE order_id = 'ECO-20260106-33793'  -- Ganti dengan order_id yang bermasalah
  AND status = 'pending';

-- 2b. Update payments table
UPDATE payments 
SET 
  payment_status = 'settlement',
  updated_at = NOW(),
  notification_history = COALESCE(notification_history, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'timestamp', NOW(),
      'source', 'manual_update',
      'data', jsonb_build_object(
        'transaction_status', 'settlement',
        'reason', 'Manual sync from Midtrans Dashboard'
      )
    )
  )
WHERE midtrans_order_id = 'ECO-20260106-33793'  -- Ganti dengan order_id yang bermasalah
  AND payment_status = 'pending';

-- =====================================================
-- STEP 3: VERIFIKASI - Pastikan update berhasil
-- =====================================================
SELECT 
  t.order_id,
  t.status as transaction_status,
  t.paid_at,
  t.updated_at,
  p.payment_status,
  p.midtrans_transaction_id,
  p.payment_type,
  t.metadata->>'manual_update' as was_manually_updated
FROM transactions t
LEFT JOIN payments p ON p.transaction_id = t.id
WHERE t.order_id = 'ECO-20260106-33793';  -- Ganti dengan order_id yang bermasalah

-- =====================================================
-- TROUBLESHOOTING QUERIES
-- =====================================================

-- A. Cek semua transaksi pending yang sudah lebih dari 1 jam
SELECT 
  t.order_id,
  t.status,
  t.created_at,
  t.customer_name,
  t.total_amount,
  p.payment_status,
  p.snap_token IS NOT NULL as has_snap_token,
  AGE(NOW(), t.created_at) as age
FROM transactions t
LEFT JOIN payments p ON p.transaction_id = t.id
WHERE t.status = 'pending'
  AND t.created_at < NOW() - INTERVAL '1 hour'
ORDER BY t.created_at DESC;

-- B. Cek notification history untuk debugging
SELECT 
  t.order_id,
  p.payment_status,
  jsonb_pretty(p.notification_history) as notification_history
FROM transactions t
LEFT JOIN payments p ON p.transaction_id = t.id
WHERE t.order_id = 'ECO-20260106-33793';  -- Ganti dengan order_id yang bermasalah

-- C. Cek apakah ada duplikat order_id (seharusnya tidak ada)
SELECT order_id, COUNT(*) as count
FROM transactions
GROUP BY order_id
HAVING COUNT(*) > 1;

-- D. Cek transaksi dengan whitespace di order_id (potential bug)
SELECT order_id, LENGTH(order_id), status
FROM transactions
WHERE order_id LIKE '% %' 
   OR order_id LIKE '%	%'
   OR order_id != TRIM(order_id);

-- E. Cek 10 transaksi terbaru
SELECT 
  t.order_id,
  t.status,
  t.created_at,
  t.paid_at,
  p.payment_status,
  p.payment_type
FROM transactions t
LEFT JOIN payments p ON p.transaction_id = t.id
ORDER BY t.created_at DESC
LIMIT 10;

-- =====================================================
-- BATCH UPDATE - Update semua pending yang sudah settlement
-- =====================================================
-- PERINGATAN: Jalankan dengan hati-hati!
-- Pastikan sudah verifikasi di Midtrans Dashboard

-- Contoh: Update berdasarkan list order_id
-- UPDATE transactions 
-- SET status = 'paid', paid_at = NOW(), updated_at = NOW()
-- WHERE order_id IN ('ECO-20260106-33793', 'ECO-20260106-33794')
--   AND status = 'pending';
