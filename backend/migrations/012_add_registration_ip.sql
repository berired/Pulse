-- Add registration IP tracking to profiles table for IP ban feature
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_ip INET;

-- Create index for IP lookups
CREATE INDEX IF NOT EXISTS idx_profiles_registration_ip ON profiles(registration_ip);
