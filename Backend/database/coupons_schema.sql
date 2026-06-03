-- Coupon Management Schema for Kalasatra
-- Run this in your Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════════════════
-- COUPONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS coupons CASCADE;

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,

  CONSTRAINT positive_coins CHECK (coins >= 0),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Index for faster lookups
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_coupons_dates ON coupons(start_date, end_date);

COMMENT ON TABLE coupons IS 'Coupon codes for Kalasatra coins';
COMMENT ON COLUMN coupons.code IS 'Unique coupon code entered by users';
COMMENT ON COLUMN coupons.coins IS 'Number of Kalasatra coins awarded by this coupon';
COMMENT ON COLUMN coupons.start_date IS 'When the coupon becomes valid';
COMMENT ON COLUMN coupons.end_date IS 'When the coupon expires';
COMMENT ON COLUMN coupons.is_active IS 'Whether the coupon is currently active';
