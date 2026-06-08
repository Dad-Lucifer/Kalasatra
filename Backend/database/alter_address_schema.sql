-- ==============================================================================
-- Schema: Alter Address (Multiple Addresses per User)
-- Purpose: Stores additional delivery addresses for a user.
--          Each row is linked to a user via their Cognito sub (uid TEXT).
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.alter_address (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Links to the 'users' table via Cognito sub
    uid         TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,

    -- Address fields
    full_name   TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city        TEXT NOT NULL,
    state       TEXT NOT NULL,
    pincode     TEXT NOT NULL,
    country     TEXT NOT NULL DEFAULT 'India',

    -- Timestamps
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_alter_address_uid ON public.alter_address(uid);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_alter_address_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_alter_address_updated_at ON public.alter_address;
CREATE TRIGGER trg_alter_address_updated_at
    BEFORE UPDATE ON public.alter_address
    FOR EACH ROW
    EXECUTE FUNCTION update_alter_address_updated_at();

-- Enable Row Level Security
ALTER TABLE public.alter_address ENABLE ROW LEVEL SECURITY;

-- Service role gets full access (used by backend with SUPABASE_SERVICE_KEY)
DROP POLICY IF EXISTS "Service role full access to alter_address" ON public.alter_address;
CREATE POLICY "Service role full access to alter_address"
    ON public.alter_address
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comments
COMMENT ON TABLE  public.alter_address              IS 'Additional delivery addresses per user, keyed by Cognito sub (uid).';
COMMENT ON COLUMN public.alter_address.uid          IS 'AWS Cognito user sub — foreign key to users.uid';
COMMENT ON COLUMN public.alter_address.full_name    IS 'Recipient name for this address';
COMMENT ON COLUMN public.alter_address.address_line1 IS 'House / building / street';
COMMENT ON COLUMN public.alter_address.address_line2 IS 'Locality / landmark (optional)';
COMMENT ON COLUMN public.alter_address.city         IS 'City';
COMMENT ON COLUMN public.alter_address.state        IS 'State';
COMMENT ON COLUMN public.alter_address.pincode      IS 'Postal / ZIP code';
COMMENT ON COLUMN public.alter_address.country      IS 'Country (default India)';
