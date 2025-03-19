import { createClient } from '@supabase/supabase-js';

// These environment variables will be available on both client and server components
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a singleton Supabase client for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 