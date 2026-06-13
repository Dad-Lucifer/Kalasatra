-- ─── Kalastra Coins: Database Migration ─────────────────────────────────────
-- Run this in Supabase SQL editor (or psql) ONCE.

-- 1. Add kalastra_coins column to users table (default 0)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS kalastra_coins INTEGER NOT NULL DEFAULT 0;

-- 2. Create coin_transactions table for audit trail
CREATE TABLE IF NOT EXISTS coin_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,
  order_id     UUID REFERENCES order_confirmed(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('earned', 'redeemed')),
  coins        INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add coins columns to order_confirmed table
ALTER TABLE order_confirmed
  ADD COLUMN IF NOT EXISTS coins_used      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coins_discount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0;

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_order_id ON coin_transactions(order_id);
