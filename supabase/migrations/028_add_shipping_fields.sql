-- Migration: Add Shipping Fields for Biteship Integration
-- Description: Adds shipping method fields to orders and area_id to addresses for Biteship API integration

-- Add area_id to addresses table for Biteship Maps API
ALTER TABLE addresses
ADD COLUMN IF NOT EXISTS area_id TEXT;

COMMENT ON COLUMN addresses.area_id IS 'Biteship area ID from Maps API for accurate shipping calculation';

-- Add shipping information fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_method TEXT,
ADD COLUMN IF NOT EXISTS courier_code TEXT,
ADD COLUMN IF NOT EXISTS courier_service TEXT,
ADD COLUMN IF NOT EXISTS courier_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
ADD COLUMN IF NOT EXISTS waybill_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN orders.shipping_method IS 'Shipping method type: pickup, delivery, or courier';
COMMENT ON COLUMN orders.courier_code IS 'Courier code from Biteship (e.g., jne, sicepat, jnt)';
COMMENT ON COLUMN orders.courier_service IS 'Courier service type (e.g., reg, yes, oke)';
COMMENT ON COLUMN orders.courier_name IS 'Display name of courier and service';
COMMENT ON COLUMN orders.estimated_delivery IS 'Estimated delivery time (e.g., "2-3 hari")';
COMMENT ON COLUMN orders.waybill_number IS 'Tracking number / resi from courier';

-- Create index for efficient courier lookups
CREATE INDEX IF NOT EXISTS idx_orders_courier_code ON orders(courier_code);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON orders(shipping_method);
CREATE INDEX IF NOT EXISTS idx_orders_waybill_number ON orders(waybill_number);
