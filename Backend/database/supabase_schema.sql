-- Supabase Schema for Kalasatra Authentication System
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT UNIQUE NOT NULL,  -- Cognito sub (TEXT, not UUID)
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'User',
  groups TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_admin_login_at TIMESTAMP WITH TIME ZONE
);

-- Create index on uid for faster lookups
CREATE INDEX idx_users_uid ON users(uid);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on is_admin for admin queries
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access to users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (uid = auth.jwt()->>'sub');

-- Optional: Create policy for users to update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (uid = auth.jwt()->>'sub')
  WITH CHECK (uid = auth.jwt()->>'sub');

-- ─── Additional Profile Columns ────────────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS alternate_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hint_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- Kalasatra Credits for coupon rewards
ALTER TABLE users ADD COLUMN IF NOT EXISTS kalasatra_credits INTEGER DEFAULT 0;

-- ─── Delete Policy (allow users to delete their own account) ──────────────

DROP POLICY IF EXISTS "Users can delete their own data" ON users;
CREATE POLICY "Users can delete their own data"
  ON users
  FOR DELETE
  TO authenticated
  USING (uid = auth.jwt()->>'sub');

-- ─── Comments for documentation ────────────────────────────────────────────

COMMENT ON TABLE users IS 'User profiles for Kalasatra authentication system';
COMMENT ON COLUMN users.uid IS 'AWS Cognito user sub (unique identifier)';
COMMENT ON COLUMN users.email IS 'User email address';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.phone IS 'User phone number in E.164 format';
COMMENT ON COLUMN users.role IS 'User role (User, Admin, Owner, SuperAdmin)';
COMMENT ON COLUMN users.groups IS 'Array of Cognito groups user belongs to';
COMMENT ON COLUMN users.is_verified IS 'Whether email is verified';
COMMENT ON COLUMN users.is_active IS 'Whether account is active';
COMMENT ON COLUMN users.is_admin IS 'Whether user has admin privileges';
COMMENT ON COLUMN users.gender IS 'User gender (Male, Female, Other)';
COMMENT ON COLUMN users.birthday IS 'User date of birth';
COMMENT ON COLUMN users.alternate_phone IS 'Alternate phone number';
COMMENT ON COLUMN users.hint_name IS 'Hint name for alternate contact';
COMMENT ON COLUMN users.address_line1 IS 'Address line 1 (street, building)';
COMMENT ON COLUMN users.address_line2 IS 'Address line 2 (area, landmark)';
COMMENT ON COLUMN users.city IS 'City';
COMMENT ON COLUMN users.state IS 'State';
COMMENT ON COLUMN users.pincode IS 'Postal / ZIP code';
COMMENT ON COLUMN users.country IS 'Country (default India)';
