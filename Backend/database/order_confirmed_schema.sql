-- ═══════════════════════════════════════════════════════════════════════════
-- ORDER_CONFIRMED TABLE
-- Run this in your Supabase SQL Editor
-- Stores every confirmed order immediately after Razorpay payment verification
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS order_confirmed CASCADE;

CREATE TABLE order_confirmed (
  -- ─── Identity ──────────────────────────────────────────────────────────────
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ─── Payment ───────────────────────────────────────────────────────────────
  razorpay_payment_id TEXT        NOT NULL,                   -- pay_XXXXX from Razorpay
  razorpay_order_id   TEXT        NOT NULL,                   -- order_XXXXX from Razorpay
  razorpay_signature  TEXT        NOT NULL,                   -- verified HMAC signature
  payment_mode        TEXT        NOT NULL DEFAULT 'online',  -- 'online' | 'cod'
  payment_amount      DECIMAL(10,2) NOT NULL,                 -- amount in INR (not paise)
  payment_status      TEXT        NOT NULL DEFAULT 'paid',    -- 'paid' | 'failed' | 'pending'
  payment_time        TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- exact UTC timestamp of payment

  -- ─── User ──────────────────────────────────────────────────────────────────
  user_id             TEXT        NOT NULL,                   -- Cognito sub / user UID
  user_name           TEXT        NOT NULL,
  user_email          TEXT        NOT NULL,
  user_phone          TEXT,

  -- ─── Delivery Address ──────────────────────────────────────────────────────
  shipping_full_name  TEXT        NOT NULL,
  address_line1       TEXT        NOT NULL,
  address_line2       TEXT,
  city                TEXT        NOT NULL,
  state               TEXT        NOT NULL,
  pincode             TEXT        NOT NULL,
  country             TEXT        NOT NULL DEFAULT 'India',

  -- ─── Products (JSONB array) ─────────────────────────────────────────────────
  -- Each element: { product_id, product_name, slug, price, quantity, size, color, image }
  items               JSONB       NOT NULL DEFAULT '[]'::JSONB,

  -- ─── Delivery Status ───────────────────────────────────────────────────────
  delivery_status     TEXT        NOT NULL DEFAULT 'order_confirmed'
                        CHECK (delivery_status IN ('order_confirmed','out_for_delivery','delivered')),

  -- ─── Timestamps ────────────────────────────────────────────────────────────
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ─── Constraints ───────────────────────────────────────────────────────────
  CONSTRAINT positive_amount CHECK (payment_amount >= 0),
  CONSTRAINT valid_delivery_status CHECK (
    delivery_status IN ('order_confirmed','out_for_delivery','delivered')
  )
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_oc_user_id          ON order_confirmed(user_id);
CREATE INDEX idx_oc_payment_id       ON order_confirmed(razorpay_payment_id);
CREATE INDEX idx_oc_order_id         ON order_confirmed(razorpay_order_id);
CREATE INDEX idx_oc_delivery_status  ON order_confirmed(delivery_status);
CREATE INDEX idx_oc_created_at       ON order_confirmed(created_at DESC);
CREATE INDEX idx_oc_pincode          ON order_confirmed(pincode);

-- ─── Auto-update timestamp trigger ───────────────────────────────────────────
-- Requires update_updated_at_column() function (already exists from products_schema.sql)
DROP TRIGGER IF EXISTS update_order_confirmed_updated_at ON order_confirmed;
CREATE TRIGGER update_order_confirmed_updated_at
  BEFORE UPDATE ON order_confirmed
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE order_confirmed ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders only
DROP POLICY IF EXISTS "Users can read own orders" ON order_confirmed;
CREATE POLICY "Users can read own orders"
  ON order_confirmed FOR SELECT
  USING (user_id = auth.jwt()->>'sub');

-- Service role (backend) has full access
DROP POLICY IF EXISTS "Service role full access to orders" ON order_confirmed;
CREATE POLICY "Service role full access to orders"
  ON order_confirmed FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ─── Comments ─────────────────────────────────────────────────────────────────
COMMENT ON TABLE  order_confirmed IS 'Every order confirmed after successful Razorpay payment verification';
COMMENT ON COLUMN order_confirmed.razorpay_payment_id IS 'pay_XXXXX — Razorpay payment ID returned in handler response';
COMMENT ON COLUMN order_confirmed.razorpay_order_id   IS 'order_XXXXX — Razorpay order ID created on backend';
COMMENT ON COLUMN order_confirmed.items               IS 'JSONB array: [{product_id, product_name, slug, price, quantity, size, color, image}]';
COMMENT ON COLUMN order_confirmed.payment_amount      IS 'Final INR amount (not paise)';
COMMENT ON COLUMN order_confirmed.delivery_status     IS 'Admin-controlled: order_confirmed → out_for_delivery → delivered';
