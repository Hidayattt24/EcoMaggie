-- Migration: Add Biteship Order Integration Fields
-- Description: Add fields to store Biteship order data (tracking_id, waybill_id, status)
-- Date: 2026-01-06
-- FIXED: Changed from orders table to transactions table

-- Add Biteship-specific fields to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS biteship_order_id TEXT,
ADD COLUMN IF NOT EXISTS biteship_tracking_id TEXT,
ADD COLUMN IF NOT EXISTS biteship_waybill_id TEXT,
ADD COLUMN IF NOT EXISTS biteship_status TEXT,
ADD COLUMN IF NOT EXISTS biteship_price DECIMAL(10, 2);

-- Add comments for documentation
COMMENT ON COLUMN transactions.biteship_order_id IS 'Biteship order ID from /v1/orders API response';
COMMENT ON COLUMN transactions.biteship_tracking_id IS 'Biteship tracking ID for order tracking';
COMMENT ON COLUMN transactions.biteship_waybill_id IS 'Courier waybill/resi number from Biteship';
COMMENT ON COLUMN transactions.biteship_status IS 'Order status from Biteship (confirmed, allocated, picking_up, picked, delivered, cancelled)';
COMMENT ON COLUMN transactions.biteship_price IS 'Final shipping price from Biteship (may differ from initial quote)';

-- Create indexes for efficient Biteship order lookups
CREATE INDEX IF NOT EXISTS idx_transactions_biteship_order_id ON transactions(biteship_order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_biteship_tracking_id ON transactions(biteship_tracking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_biteship_waybill_id ON transactions(biteship_waybill_id);
CREATE INDEX IF NOT EXISTS idx_transactions_biteship_status ON transactions(biteship_status);

-- Create trigger to update updated_at on Biteship status changes
CREATE OR REPLACE FUNCTION update_transaction_biteship_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_transaction_biteship_updated_at ON transactions;
CREATE TRIGGER trigger_update_transaction_biteship_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    WHEN (OLD.biteship_status IS DISTINCT FROM NEW.biteship_status)
    EXECUTE FUNCTION update_transaction_biteship_updated_at();
