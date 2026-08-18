import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

export async function clearRestCache(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase_cache_timestamps');
    if ('caches' in window) {
      try {
        await caches.delete('supabase-api-cache');
      } catch (e) {
        console.error('[Cache] Failed to delete cache:', e);
      }
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type { User, Session } from '@supabase/supabase-js';


