-- Create a function to check if an email is available
-- This function checks the auth.users table to see if an email is already registered
CREATE OR REPLACE FUNCTION is_email_available(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  email_exists BOOLEAN;
BEGIN
  -- Check if email exists in auth.users table
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = LOWER(email_to_check)
  ) INTO email_exists;
  
  -- Return true if email is available (doesn't exist), false if taken
  RETURN NOT email_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role (unauthenticated users)
GRANT EXECUTE ON FUNCTION is_email_available(TEXT) TO anon, authenticated;
