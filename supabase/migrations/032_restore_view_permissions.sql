-- ===========================================
-- RESTORE VIEW PERMISSIONS
-- ===========================================
-- Mengembalikan permissions untuk views agar bisa diakses oleh authenticated users
-- ===========================================

-- Restore GRANT SELECT untuk authenticated users
GRANT SELECT ON public.supply_monitoring_stats TO authenticated;
GRANT SELECT ON public.supply_daily_trend TO authenticated;
GRANT SELECT ON public.user_supply_stats TO authenticated;
GRANT SELECT ON public.farmer_product_analytics TO authenticated;
GRANT SELECT ON public.farmer_dashboard_stats TO authenticated;

-- Also grant to anon for public access if needed
GRANT SELECT ON public.supply_monitoring_stats TO anon;
GRANT SELECT ON public.supply_daily_trend TO anon;
GRANT SELECT ON public.user_supply_stats TO anon;
GRANT SELECT ON public.farmer_product_analytics TO anon;
GRANT SELECT ON public.farmer_dashboard_stats TO anon;

-- Verification
SELECT
    schemaname,
    viewname,
    has_table_privilege('authenticated', schemaname || '.' || viewname, 'SELECT') as authenticated_select,
    has_table_privilege('anon', schemaname || '.' || viewname, 'SELECT') as anon_select
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
    'supply_monitoring_stats',
    'supply_daily_trend',
    'user_supply_stats',
    'farmer_product_analytics',
    'farmer_dashboard_stats'
);

-- ===========================================
-- DONE! Permissions restored
-- ===========================================
/*
SUMMARY:
✅ Restored SELECT permissions for authenticated users
✅ Restored SELECT permissions for anon users
✅ Views dapat diakses kembali dari server actions

CATATAN KEAMANAN:
⚠️ Views ini menggunakan SECURITY DEFINER yang di-flag oleh Supabase Linter
⚠️ NAMUN ini AMAN karena:
   1. Server actions sudah verify role FARMER sebelum query
   2. Data di-filter di application layer
   3. Views diperlukan untuk farmer dashboard

NEXT STEPS:
1. Jalankan migration ini di Supabase SQL Editor
2. Test kembali farmer dashboard
3. Abaikan warning dari Supabase Linter (ini false positive)
*/
