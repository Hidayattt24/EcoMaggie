-- =====================================================
-- MIDTRANS PAYMENT INTEGRATION - DATABASE SCHEMA
-- =====================================================
-- Dibuat untuk: Ecomaggie Marketplace
-- Payment Gateway: Midtrans Snap API
-- =====================================================

-- =====================================================
-- TABLE: transactions
-- Deskripsi: Menyimpan informasi transaksi utama
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order Information
  order_id VARCHAR(50) UNIQUE NOT NULL, -- Format: ECO-YYYYMMDD-XXXXX
  user_id UUID NOT NULL,

  -- Transaction Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Status values: 'pending', 'processing', 'paid', 'failed', 'cancelled', 'expired'

  -- Amounts (stored in IDR, integer format)
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  service_fee INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,

  -- Shipping Information
  shipping_address_id UUID,
  shipping_method VARCHAR(100),
  shipping_courier VARCHAR(50),
  shipping_service VARCHAR(50),
  shipping_tracking_number VARCHAR(100),
  estimated_delivery VARCHAR(50),

  -- Customer Information (denormalized for history)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE,

  -- Notes & Metadata
  notes TEXT,
  metadata JSONB,

  -- Indexes
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- Indexes untuk performa query
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- =====================================================
-- TABLE: transaction_items
-- Deskripsi: Menyimpan detail produk per transaksi
-- =====================================================
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relation
  transaction_id UUID NOT NULL,
  product_id UUID NOT NULL,

  -- Product Information (denormalized for history)
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  product_sku VARCHAR(100),

  -- Pricing
  unit_price INTEGER NOT NULL, -- Harga per unit saat transaksi
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL, -- unit_price * quantity

  -- Product Details
  unit VARCHAR(20) DEFAULT 'Kg',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT check_quantity_positive CHECK (quantity > 0),
  CONSTRAINT check_unit_price_positive CHECK (unit_price >= 0)
);

-- Indexes
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);

-- =====================================================
-- TABLE: payments
-- Deskripsi: Menyimpan detail pembayaran Midtrans
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relation
  transaction_id UUID NOT NULL UNIQUE,

  -- Midtrans Information
  midtrans_order_id VARCHAR(50) NOT NULL UNIQUE,
  midtrans_transaction_id VARCHAR(200) UNIQUE,
  snap_token TEXT, -- Token dari Midtrans untuk Snap UI

  -- Payment Status
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- Status values: 'pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'failure'

  payment_type VARCHAR(50), -- e.g., 'credit_card', 'bank_transfer', 'gopay', 'qris', etc.
  payment_method VARCHAR(50), -- e.g., 'bca_va', 'permata_va', 'gopay', etc.

  -- Payment Details
  gross_amount INTEGER NOT NULL,
  transaction_time TIMESTAMP WITH TIME ZONE,
  settlement_time TIMESTAMP WITH TIME ZONE,
  expiry_time TIMESTAMP WITH TIME ZONE,

  -- Bank/Payment Provider Details
  va_number VARCHAR(50), -- Virtual Account number
  bank VARCHAR(50), -- Bank name for VA/transfer
  bill_key VARCHAR(50), -- For Mandiri Bill
  biller_code VARCHAR(50), -- For Mandiri Bill

  -- Fraud Detection
  fraud_status VARCHAR(20), -- 'accept', 'deny', 'challenge'

  -- Additional Data from Midtrans
  status_code VARCHAR(10),
  status_message TEXT,

  -- Raw Response Storage (untuk debugging & audit)
  midtrans_response JSONB,
  notification_history JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_payment_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_midtrans_order_id ON payments(midtrans_order_id);
CREATE INDEX idx_payments_midtrans_transaction_id ON payments(midtrans_transaction_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_snap_token ON payments(snap_token);

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Generate Order ID
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_order_id VARCHAR(50);
  counter INTEGER;
BEGIN
  -- Format: ECO-YYYYMMDD-XXXXX
  -- Example: ECO-20260106-00001

  SELECT COUNT(*) + 1 INTO counter
  FROM transactions
  WHERE DATE(created_at) = CURRENT_DATE;

  new_order_id := 'ECO-' ||
                  TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
                  LPAD(counter::TEXT, 5, '0');

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view their own transaction items
CREATE POLICY "Users can view own transaction items"
  ON transaction_items FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can do everything (for API endpoints)
CREATE POLICY "Service role full access to transactions"
  ON transactions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to transaction_items"
  ON transaction_items FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to payments"
  ON payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SAMPLE QUERIES (untuk testing)
-- =====================================================
-- 1. Get transaction with items and payment
-- SELECT
--   t.*,
--   json_agg(ti.*) as items,
--   p.*
-- FROM transactions t
-- LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
-- LEFT JOIN payments p ON p.transaction_id = t.id
-- WHERE t.order_id = 'ECO-20260106-00001'
-- GROUP BY t.id, p.id;

-- 2. Get user transaction history
-- SELECT
--   t.order_id,
--   t.status,
--   t.total_amount,
--   t.created_at,
--   p.payment_status,
--   p.payment_method
-- FROM transactions t
-- LEFT JOIN payments p ON p.transaction_id = t.id
-- WHERE t.user_id = 'USER_UUID_HERE'
-- ORDER BY t.created_at DESC;

-- 3. Get pending payments
-- SELECT
--   t.order_id,
--   t.customer_name,
--   t.total_amount,
--   p.payment_status,
--   p.expiry_time
-- FROM transactions t
-- INNER JOIN payments p ON p.transaction_id = t.id
-- WHERE p.payment_status = 'pending'
-- AND p.expiry_time > NOW();
