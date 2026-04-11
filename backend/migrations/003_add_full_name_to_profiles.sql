-- Migration: Add full_name field to profiles table
-- Run this migration in Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Optional: Add an index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
