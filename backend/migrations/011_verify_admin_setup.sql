-- STEP 1: Verify the role column exists on profiles table
-- Run this query to check if the role column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- If the role column doesn't exist, run this to add it:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- STEP 2: Check the current admin user's role
SELECT id, username, role FROM profiles WHERE id = '73ced916-ede4-447d-baef-8ce35070996d';

-- STEP 3: If role is still 'user' or NULL, manually update it to 'admin'
-- UPDATE profiles SET role = 'admin' WHERE id = '73ced916-ede4-447d-baef-8ce35070996d';

-- STEP 4: Verify the update
-- SELECT id, username, role FROM profiles WHERE id = '73ced916-ede4-447d-baef-8ce35070996d';
