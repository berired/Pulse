-- Migration: Fix Profile RLS Policies and Add Auto-Create Trigger
-- Run this migration in Supabase SQL Editor to fix signup issues

-- ============= ENABLE RLS =============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============= DROP EXISTING POLICIES =============
-- These will drop if they exist, no error if they don't
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- ============= CREATE NEW POLICIES =============

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to view all profiles (needed for messaging, search, etc)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============= CREATE AUTO-PROFILE TRIGGER =============
-- This trigger automatically creates a profile when a user signs up
-- It uses the auth user's email as a fallback username if none provided

-- Create or replace the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    nursing_year,
    institution
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'nursing_year')::integer, 1),
    COALESCE(new.raw_user_meta_data->>'institution', 'Your Institution')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    nursing_year = COALESCE(EXCLUDED.nursing_year, profiles.nursing_year),
    institution = COALESCE(EXCLUDED.institution, profiles.institution);
  
  RETURN new;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test: Verify RLS is enabled
-- SELECT tablename, quotes FROM pg_tables WHERE tablename = 'profiles';

-- Test: Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
