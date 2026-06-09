-- Coupon Redemptions Schema for Kalasatra
-- Run this in your Supabase SQL Editor AFTER coupons_schema.sql and supabase_schema.sql
-- Enforces: each user can redeem a given coupon code only ONCE.

-- ═══════════════════════════════════════════════════════════════════════════
-- COUPON REDEMPTIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS coupon_redemptions CASCADE;

CREATE TABLE coupon_redemptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id  UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_uid   TEXT NOT NULL,                          -- matches users.uid (Cognito sub)
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ── Core constraint: one redemption per user per coupon ──────────────────
  CONSTRAINT uq_coupon_user UNIQUE (coupon_id, user_uid)
);

-- Indexes for fast duplicate-check lookups
CREATE INDEX idx_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX idx_redemptions_user   ON coupon_redemptions(user_uid);

COMMENT ON TABLE coupon_redemptions IS
  'Tracks which user has redeemed which coupon. UNIQUE (coupon_id, user_uid) prevents double-redemption.';
COMMENT ON COLUMN coupon_redemptions.coupon_id  IS 'FK to coupons.id';
COMMENT ON COLUMN coupon_redemptions.user_uid   IS 'Cognito sub from users.uid';
COMMENT ON COLUMN coupon_redemptions.redeemed_at IS 'Timestamp of redemption';
