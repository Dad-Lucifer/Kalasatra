-- Wishlist Schema for Kalasatra
-- Run this in your Supabase SQL Editor

DROP TABLE IF EXISTS wishlist CASCADE;

CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT,
  product_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_uid, product_id)
);

CREATE INDEX idx_wishlist_user_uid ON wishlist(user_uid);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own wishlist" ON wishlist;
CREATE POLICY "Users can manage their own wishlist"
  ON wishlist FOR ALL
  USING (user_uid = auth.jwt()->>'sub')
  WITH CHECK (user_uid = auth.jwt()->>'sub');

DROP POLICY IF EXISTS "Service role full access to wishlist" ON wishlist;
CREATE POLICY "Service role full access to wishlist"
  ON wishlist FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE wishlist IS 'User wishlist items';
COMMENT ON COLUMN wishlist.user_uid IS 'Cognito user sub from users table';
COMMENT ON COLUMN wishlist.user_name IS 'User display name for quick reference';
COMMENT ON COLUMN wishlist.product_id IS 'Product ID or slug reference';
