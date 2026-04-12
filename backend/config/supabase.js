import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY in .env - required for backend operations'
  );
}

// Use service role key for backend operations to bypass RLS policies
// The JWT validation in authMiddleware ensures we're still validating the user
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
