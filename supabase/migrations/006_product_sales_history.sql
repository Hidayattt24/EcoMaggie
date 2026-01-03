-- ===========================================
-- ECO-MAGGIE PRODUCT SALES HISTORY
-- ===========================================
-- Migration: 006_product_sales_history.sql
-- Purpose: Track daily sales data for product analytics
-- Run this AFTER 005_fix_farmer_record.sql
-- ===========================================


-- ===========================================
-- STEP 1: CREATE PRODUCT SALES HISTORY TABLE
-- ===========================================
-- Stores daily aggregated sales data per product

CREATE TABLE IF NOT EXISTS public.product_sales_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per product per day
    UNIQUE(product_id, sale_date)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_sales_history_product_id ON public.product_sales_history(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_sale_date ON public.product_sales_history(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_history_product_date ON public.product_sales_history(product_id, sale_date DESC);

COMMENT ON TABLE public.product_sales_history IS 'Daily aggregated sales data for product analytics and trend charts';
COMMENT ON COLUMN public.product_sales_history.quantity_sold IS 'Total units sold on this date';
COMMENT ON COLUMN public.product_sales_history.revenue IS 'Total revenue generated on this date';
COMMENT ON COLUMN public.product_sales_history.orders_count IS 'Number of orders containing this product on this date';


-- ===========================================
-- STEP 2: CREATE VIEW FOR SALES TREND (7 DAYS)
-- ===========================================

DROP VIEW IF EXISTS public.product_sales_trend_7d;
CREATE VIEW public.product_sales_trend_7d AS
WITH date_series AS (
    -- Generate last 7 days
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
    )::DATE AS sale_date
),
product_dates AS (
    -- Cross join products with date series
    SELECT 
        p.id AS product_id,
        p.farmer_id,
        ds.sale_date
    FROM public.products p
    CROSS JOIN date_series ds
    WHERE p.deleted_at IS NULL
)
SELECT 
    pd.product_id,
    pd.farmer_id,
    pd.sale_date,
    TO_CHAR(pd.sale_date, 'Dy') AS day_name,
    TO_CHAR(pd.sale_date, 'DD Mon') AS date_label,
    COALESCE(psh.quantity_sold, 0) AS quantity_sold,
    COALESCE(psh.revenue, 0) AS revenue,
    COALESCE(psh.orders_count, 0) AS orders_count
FROM product_dates pd
LEFT JOIN public.product_sales_history psh 
    ON pd.product_id = psh.product_id 
    AND pd.sale_date = psh.sale_date
ORDER BY pd.product_id, pd.sale_date;


-- ===========================================
-- STEP 3: CREATE FUNCTION TO GET SALES TREND
-- ===========================================

CREATE OR REPLACE FUNCTION public.get_product_sales_trend(
    p_product_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    sale_date DATE,
    day_name TEXT,
    date_label TEXT,
    quantity_sold INTEGER,
    revenue DECIMAL(12, 2),
    orders_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (p_days - 1) * INTERVAL '1 day',
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE AS dt
    )
    SELECT 
        ds.dt AS sale_date,
        TO_CHAR(ds.dt, 'Dy')::TEXT AS day_name,
        TO_CHAR(ds.dt, 'DD Mon')::TEXT AS date_label,
        COALESCE(psh.quantity_sold, 0)::INTEGER AS quantity_sold,
        COALESCE(psh.revenue, 0)::DECIMAL(12, 2) AS revenue,
        COALESCE(psh.orders_count, 0)::INTEGER AS orders_count
    FROM date_series ds
    LEFT JOIN public.product_sales_history psh 
        ON psh.product_id = p_product_id 
        AND psh.sale_date = ds.dt
    ORDER BY ds.dt;
END;
$$;


-- ===========================================
-- STEP 4: CREATE FUNCTION TO RECORD SALE
-- ===========================================
-- Call this when an order is completed

CREATE OR REPLACE FUNCTION public.record_product_sale(
    p_product_id UUID,
    p_quantity INTEGER,
    p_revenue DECIMAL(12, 2),
    p_sale_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.product_sales_history (
        product_id,
        sale_date,
        quantity_sold,
        revenue,
        orders_count,
        created_at,
        updated_at
    )
    VALUES (
        p_product_id,
        p_sale_date,
        p_quantity,
        p_revenue,
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (product_id, sale_date)
    DO UPDATE SET
        quantity_sold = product_sales_history.quantity_sold + EXCLUDED.quantity_sold,
        revenue = product_sales_history.revenue + EXCLUDED.revenue,
        orders_count = product_sales_history.orders_count + 1,
        updated_at = NOW();
END;
$$;


-- ===========================================
-- STEP 5: CREATE TRIGGER TO AUTO-UPDATE ON ORDER
-- ===========================================
-- Optional: Auto record sales when order_items change

CREATE OR REPLACE FUNCTION public.trigger_record_sale_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product_price DECIMAL(10, 2);
    v_discount DECIMAL(5, 2);
    v_final_price DECIMAL(10, 2);
BEGIN
    -- Only trigger when order status changes to DELIVERED
    IF TG_OP = 'UPDATE' AND NEW.status = 'DELIVERED' AND OLD.status != 'DELIVERED' THEN
        -- Record sales for each order item
        INSERT INTO public.product_sales_history (
            product_id,
            sale_date,
            quantity_sold,
            revenue,
            orders_count
        )
        SELECT 
            oi.product_id,
            CURRENT_DATE,
            oi.quantity,
            oi.quantity * oi.price,
            1
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id
        ON CONFLICT (product_id, sale_date)
        DO UPDATE SET
            quantity_sold = product_sales_history.quantity_sold + EXCLUDED.quantity_sold,
            revenue = product_sales_history.revenue + EXCLUDED.revenue,
            orders_count = product_sales_history.orders_count + 1,
            updated_at = NOW();
            
        -- Also update total_sold on products table
        UPDATE public.products p
        SET total_sold = p.total_sold + oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger (only if orders table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        DROP TRIGGER IF EXISTS trg_record_sale_on_order ON public.orders;
        CREATE TRIGGER trg_record_sale_on_order
            AFTER UPDATE ON public.orders
            FOR EACH ROW
            EXECUTE FUNCTION public.trigger_record_sale_on_order();
    END IF;
END $$;


-- ===========================================
-- STEP 6: RLS POLICIES
-- ===========================================

ALTER TABLE public.product_sales_history ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own product sales
DROP POLICY IF EXISTS "Farmers can view own product sales" ON public.product_sales_history;
CREATE POLICY "Farmers can view own product sales" ON public.product_sales_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.farmers f ON p.farmer_id = f.id
            WHERE p.id = product_sales_history.product_id
            AND f.user_id = auth.uid()
        )
    );

-- System can insert/update sales records
DROP POLICY IF EXISTS "System can manage sales history" ON public.product_sales_history;
CREATE POLICY "System can manage sales history" ON public.product_sales_history
    FOR ALL
    USING (true)
    WITH CHECK (true);


-- ===========================================
-- STEP 7: GRANT PERMISSIONS
-- ===========================================

GRANT SELECT ON public.product_sales_history TO authenticated;
GRANT SELECT ON public.product_sales_trend_7d TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_sales_trend TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_product_sale TO authenticated;


-- ===========================================
-- DONE! Product sales history ready.
-- ===========================================
