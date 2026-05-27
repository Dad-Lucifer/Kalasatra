"use strict";

const { createClient } = require("@supabase/supabase-js");

// Validate required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error("Error: Missing SUPABASE_URL environment variable");
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("Error: Missing SUPABASE_SERVICE_KEY environment variable");
}

// Initialize Supabase client with service role key (for admin operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = { supabase };
