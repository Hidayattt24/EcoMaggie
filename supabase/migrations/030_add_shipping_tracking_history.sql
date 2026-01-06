-- Migration: Add Shipping Tracking History Table
-- Description: Table untuk menyimpan history tracking pengiriman dari Biteship API
-- Date: 2026-01-06

-- =====================================================
-- TABLE: shipping_tracking_history
-- Deskripsi: Menyimpan history tracking untuk setiap order
-- =====================================================
CREATE TABLE IF NOT EXISTS shipping_tracking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relation to transaction
  transaction_id UUID NOT NULL,

  -- Tracking Information
  waybill_id VARCHAR(100) NOT NULL,
  courier_code VARCHAR(50) NOT NULL,

  -- Status Information
  status VARCHAR(100) NOT NULL,
  note TEXT NOT NULL,
  location TEXT,

  -- Biteship Response
  biteship_response JSONB,

  -- Timestamps
  tracked_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Waktu dari Biteship API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_shipping_tracking_transaction FOREIGN KEY (transaction_id)
    REFERENCES transactions(id) ON DELETE CASCADE
);

-- Indexes untuk performa query
CREATE INDEX idx_shipping_tracking_transaction_id ON shipping_tracking_history(transaction_id);
CREATE INDEX idx_shipping_tracking_waybill_id ON shipping_tracking_history(waybill_id);
CREATE INDEX idx_shipping_tracking_status ON shipping_tracking_history(status);
CREATE INDEX idx_shipping_tracking_tracked_at ON shipping_tracking_history(tracked_at DESC);

-- Comments untuk documentation
COMMENT ON TABLE shipping_tracking_history IS 'History tracking pengiriman dari Biteship API';
COMMENT ON COLUMN shipping_tracking_history.transaction_id IS 'Reference ke table transactions';
COMMENT ON COLUMN shipping_tracking_history.waybill_id IS 'Nomor resi dari courier (JT123456789, JNE123456, etc)';
COMMENT ON COLUMN shipping_tracking_history.courier_code IS 'Kode courier (jne, jnt, sicepat, etc)';
COMMENT ON COLUMN shipping_tracking_history.status IS 'Status pengiriman (allocated, manifested, on_process, delivered, etc)';
COMMENT ON COLUMN shipping_tracking_history.note IS 'Deskripsi status dari Biteship';
COMMENT ON COLUMN shipping_tracking_history.tracked_at IS 'Timestamp dari Biteship API (waktu update status)';
COMMENT ON COLUMN shipping_tracking_history.biteship_response IS 'Full response dari Biteship API untuk debugging';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE shipping_tracking_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tracking history for their own transactions
CREATE POLICY "Users can view own tracking history"
  ON shipping_tracking_history FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );

-- Policy: Farmers can view tracking history for transactions containing their products
CREATE POLICY "Farmers can view tracking for their orders"
  ON shipping_tracking_history FOR SELECT
  USING (
    transaction_id IN (
      SELECT DISTINCT t.id FROM transactions t
      INNER JOIN transaction_items ti ON ti.transaction_id = t.id
      INNER JOIN products p ON ti.product_id = p.id
      INNER JOIN farmers f ON p.farmer_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

-- Policy: Service role can do everything (for API endpoints & cron jobs)
CREATE POLICY "Service role full access to tracking history"
  ON shipping_tracking_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTION: Save Tracking History
-- =====================================================
CREATE OR REPLACE FUNCTION save_tracking_history(
  p_transaction_id UUID,
  p_waybill_id VARCHAR,
  p_courier_code VARCHAR,
  p_tracking_data JSONB
)
RETURNS void AS $$
DECLARE
  history_item JSONB;
BEGIN
  -- Loop through history array from Biteship response
  FOR history_item IN SELECT * FROM jsonb_array_elements(p_tracking_data->'history')
  LOOP
    -- Insert or ignore if already exists (based on transaction_id + tracked_at + status)
    INSERT INTO shipping_tracking_history (
      transaction_id,
      waybill_id,
      courier_code,
      status,
      note,
      location,
      tracked_at,
      biteship_response
    ) VALUES (
      p_transaction_id,
      p_waybill_id,
      p_courier_code,
      history_item->>'status',
      history_item->>'note',
      history_item->>'service_code', -- location bisa dari service_code atau field lain
      (history_item->>'updated_at')::TIMESTAMP WITH TIME ZONE,
      history_item
    )
    ON CONFLICT DO NOTHING; -- Prevent duplicates
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION save_tracking_history IS 'Helper function untuk menyimpan tracking history dari Biteship API response';

-- =====================================================
-- SAMPLE QUERIES (untuk testing)
-- =====================================================
-- 1. Get tracking history for a transaction
-- SELECT
--   sth.*
-- FROM shipping_tracking_history sth
-- WHERE sth.transaction_id = 'TRANSACTION_UUID_HERE'
-- ORDER BY sth.tracked_at DESC;

-- 2. Get latest tracking status for a transaction
-- SELECT
--   sth.*
-- FROM shipping_tracking_history sth
-- WHERE sth.transaction_id = 'TRANSACTION_UUID_HERE'
-- ORDER BY sth.tracked_at DESC
-- LIMIT 1;

-- 3. Get all transactions with delivered status
-- SELECT DISTINCT
--   t.order_id,
--   t.customer_name,
--   t.total_amount,
--   sth.status,
--   sth.tracked_at
-- FROM transactions t
-- INNER JOIN shipping_tracking_history sth ON sth.transaction_id = t.id
-- WHERE sth.status = 'delivered'
-- ORDER BY sth.tracked_at DESC;
