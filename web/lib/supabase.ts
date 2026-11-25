import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ehe4n-v_qjae7iffclc2mq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ehe4n-V_QJAe7IFfLcZ2mQ_C6JUxnHy';

// Client-side Supabase client for authentication and public key verification
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side elevated client (reads service role secret key exclusively from environment)
export function getAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in environment.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
