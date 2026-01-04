-- ===========================================
-- ADD MONITORING FIELDS TO USER_SUPPLIES
-- ===========================================
-- Add fields needed for farmer supply monitoring
-- ===========================================

-- Add new columns for monitoring
ALTER TABLE public.user_supplies
ADD COLUMN IF NOT EXISTS estimated_arrival VARCHAR(50), -- ETA for courier (e.g., "08:30", "15 menit lagi")
ADD COLUMN IF NOT EXISTS actual_weight DECIMAL(10, 2), -- Actual weight after pickup (in kg)
ADD COLUMN IF NOT EXISTS waste_condition TEXT, -- Condition of waste when picked up
ADD COLUMN IF NOT EXISTS internal_notes TEXT; -- Internal notes for farmer (not visible to user)

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_supplies_pickup_date ON public.user_supplies(pickup_date);
CREATE INDEX IF NOT EXISTS idx_user_supplies_status_created ON public.user_supplies(status, created_at DESC);

-- ===========================================
-- CREATE VIEW FOR SUPPLY MONITORING STATS
-- ===========================================

CREATE OR REPLACE VIEW public.supply_monitoring_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_supplies,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
    COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled_count,
    COUNT(*) FILTER (WHERE status = 'ON_THE_WAY') as on_the_way_count,
    COUNT(*) FILTER (WHERE status = 'PICKED_UP') as picked_up_count,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
    SUM(
        CASE 
            WHEN estimated_weight = '1' THEN 1
            WHEN estimated_weight = '3' THEN 3
            WHEN estimated_weight = '5' THEN 5
            WHEN estimated_weight = '10' THEN 10
            WHEN estimated_weight = '15' THEN 15
            ELSE 0
        END
    ) as total_estimated_weight_kg,
    SUM(COALESCE(actual_weight, 0)) as total_actual_weight_kg
FROM public.user_supplies
GROUP BY DATE(created_at)
ORDER BY date DESC;

GRANT SELECT ON public.supply_monitoring_stats TO authenticated;

-- ===========================================
-- CREATE VIEW FOR DAILY SUPPLY TREND (Last 30 days)
-- ===========================================

CREATE OR REPLACE VIEW public.supply_daily_trend AS
WITH date_series AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '29 days',
        CURRENT_DATE,
        '1 day'::interval
    )::date AS date
)
SELECT 
    ds.date,
    COALESCE(COUNT(us.id), 0) as supply_count,
    COALESCE(SUM(
        CASE 
            WHEN us.estimated_weight = '1' THEN 1
            WHEN us.estimated_weight = '3' THEN 3
            WHEN us.estimated_weight = '5' THEN 5
            WHEN us.estimated_weight = '10' THEN 10
            WHEN us.estimated_weight = '15' THEN 15
            ELSE 0
        END
    ), 0) as total_weight_kg
FROM date_series ds
LEFT JOIN public.user_supplies us ON DATE(us.created_at) = ds.date
GROUP BY ds.date
ORDER BY ds.date ASC;

GRANT SELECT ON public.supply_daily_trend TO authenticated;

-- ===========================================
-- VERIFICATION
-- ===========================================

-- Check new columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_supplies'
AND column_name IN ('estimated_arrival', 'actual_weight', 'waste_condition', 'internal_notes')
ORDER BY column_name;

-- Check views
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public' 
AND table_name IN ('supply_monitoring_stats', 'supply_daily_trend');

-- ===========================================
-- DONE!
-- ===========================================
/*
SUMMARY:
✅ Added estimated_arrival column for courier ETA
✅ Added actual_weight column for actual weight after pickup
✅ Added waste_condition column for waste condition notes
✅ Added internal_notes column for farmer internal notes
✅ Created supply_monitoring_stats view for statistics
✅ Created supply_daily_trend view for chart data (last 30 days)
✅ Added indexes for better performance

NEXT STEPS:
1. Run this migration in Supabase SQL Editor
2. Update farmer-supply.actions.ts to include new fields
3. Update supply-monitoring pages to use real data
4. Test the monitoring features
*/
