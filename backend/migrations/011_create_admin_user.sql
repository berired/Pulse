-- IMPORTANT: Before running this SQL, you must:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Create user with:
--    Email: david.admin@admin.com
--    Password: davidadmin28
-- 4. Then replace the UUID below with the actual user ID
-- 5. Then run this SQL in the SQL Editor

-- Replace '73ced916-ede4-447d-baef-8ce35070996d' with the actual UUID from auth.users
UPDATE profiles 
SET role = 'admin'
WHERE id = '73ced916-ede4-447d-baef-8ce35070996d';

-- To verify the admin user was created, run this query:
-- SELECT id, username, role FROM profiles WHERE id = '73ced916-ede4-447d-baef-8ce35070996d';
