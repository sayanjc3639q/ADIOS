import { createClient } from '@supabase/supabase-js';

// Supabase Connection Credentials:
// Supports configured Supabase URL & keys from process.env or fallback configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ehe4n-v_qjae7iffclc2mq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ehe4n-V_QJAe7IFfLcZ2mQ_C6JUxnHy';

// Client-side Supabase client for authentication, public session queries, and realtime sync
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Server-side elevated client (service role secret key) for admin actions (user management, key issuance, order verification)
export function getAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
