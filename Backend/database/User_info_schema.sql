-- ==============================================================================
-- Schema: User Personal Information
-- Purpose: Stores all user-related personal details including addresses and demographics.
-- ==============================================================================

-- Create an enum for gender (optional but recommended for consistency)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_gender_enum') THEN
        CREATE TYPE user_gender_enum AS ENUM ('Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not To Say');
    END IF;
END $$;

-- Create the main user info table
CREATE TABLE IF NOT EXISTS public.user_info (
    -- Primary Key: typically corresponds to the Auth Provider's User ID (e.g., Supabase Auth UUID or Cognito Sub)
    id UUID PRIMARY KEY, 
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender user_gender_enum,
    profile_picture_url TEXT,
    
    -- Default/Primary Address details (You can later break this out into a separate "user_addresses" table if users need multiple addresses)
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Triggers
-- ==============================================================================

-- Function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_user_info_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the table
DROP TRIGGER IF EXISTS update_user_info_updated_at ON public.user_info;
CREATE TRIGGER update_user_info_updated_at
    BEFORE UPDATE ON public.user_info
    FOR EACH ROW
    EXECUTE FUNCTION update_user_info_updated_at_column();

-- ==============================================================================
-- Row Level Security (RLS)
-- Uncomment these if you are using Supabase Auth and want to restrict access natively at the DB level
-- ==============================================================================

/*
ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view their own info" 
ON public.user_info 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own info" 
ON public.user_info 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own info" 
ON public.user_info 
FOR UPDATE 
USING (auth.uid() = id);
*/
