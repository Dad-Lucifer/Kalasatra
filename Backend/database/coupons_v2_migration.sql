-- ═══════════════════════════════════════════════════════════════════════════
-- COUPON MANAGEMENT SYSTEM — V2 MIGRATION
-- Run this in Supabase SQL Editor.
-- This is NON-DESTRUCTIVE: existing coupons and redemptions are preserved.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Extend the coupons table ────────────────────────────────────────────

-- Make coins nullable so discount coupons don't need a coins value
ALTER TABLE coupons ALTER COLUMN coins DROP NOT NULL;
ALTER TABLE coupons ALTER COLUMN coins SET DEFAULT 0;

-- Coupon type: 'coins' or 'discount'
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'coins'
  CHECK (type IN ('coins', 'discount'));

-- Human-friendly name and description
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;

-- Discount-specific fields (null for coins coupons)
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS discount_type TEXT
  CHECK (discount_type IN ('percentage', 'flat') OR discount_type IS NULL);

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10, 2) DEFAULT 0;

-- Order constraints
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10, 2); -- null = uncapped

-- Usage tracking (global across all users)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER;    -- null = unlimited
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0;

-- ─── 2. Add indexes for new columns ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_coupons_type ON coupons(type);
CREATE INDEX IF NOT EXISTS idx_coupons_usage ON coupons(usage_count, usage_limit);

-- ─── 3. Extend coupon_redemptions & order_confirmed tables ──────────────────
ALTER TABLE coupon_redemptions ADD COLUMN IF NOT EXISTS coupon_type TEXT DEFAULT 'coins';
ALTER TABLE coupon_redemptions ADD COLUMN IF NOT EXISTS discount_applied NUMERIC(10, 2);
ALTER TABLE coupon_redemptions ADD COLUMN IF NOT EXISTS order_id TEXT; -- for discount coupons

ALTER TABLE order_confirmed ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE order_confirmed ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- ─── 4. Atomic usage increment function (prevents race conditions) ───────────
-- This stored procedure atomically checks and increments usage_count.
-- Returns the updated coupon row or raises an exception if the limit is hit.
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS TABLE (
  id UUID,
  usage_count INTEGER,
  usage_limit INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_usage_limit INTEGER;
  v_usage_count INTEGER;
BEGIN
  -- Lock the row for update
  SELECT c.usage_limit, c.usage_count
  INTO v_usage_limit, v_usage_count
  FROM coupons c
  WHERE c.id = p_coupon_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COUPON_NOT_FOUND';
  END IF;

  -- Check global usage limit
  IF v_usage_limit IS NOT NULL AND v_usage_count >= v_usage_limit THEN
    RAISE EXCEPTION 'USAGE_LIMIT_REACHED';
  END IF;

  -- Atomically increment
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at  = NOW()
  WHERE coupons.id = p_coupon_id
  RETURNING coupons.id, coupons.usage_count, coupons.usage_limit
  INTO id, usage_count, usage_limit;

  RETURN NEXT;
END;
$$;

-- ─── 5. Comments ─────────────────────────────────────────────────────────────
COMMENT ON COLUMN coupons.type IS 'coins = credits wallet; discount = applied at checkout';
COMMENT ON COLUMN coupons.discount_type IS 'percentage or flat (only used when type=discount)';
COMMENT ON COLUMN coupons.discount_value IS 'Percentage (0-100) or flat INR amount';
COMMENT ON COLUMN coupons.min_order_amount IS 'Minimum cart value for discount coupon to be valid';
COMMENT ON COLUMN coupons.max_discount_amount IS 'Cap on percentage discount (null = uncapped)';
COMMENT ON COLUMN coupons.usage_limit IS 'Maximum total redemptions across all users (null = unlimited)';
COMMENT ON COLUMN coupons.usage_count IS 'Atomic counter of total redemptions so far';
COMMENT ON COLUMN coupon_redemptions.discount_applied IS 'Actual discount amount applied (for discount coupons)';
COMMENT ON COLUMN coupon_redemptions.order_id IS 'Order ID associated with discount coupon redemption';
