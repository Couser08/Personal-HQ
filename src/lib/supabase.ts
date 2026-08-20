import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createMockClient, type MockClient } from './mock/MockClient';
import { isMockEnabled, setMockEnabled, isLocalhost } from './mock/mockConfig';
import { mockStore } from './mock/mockStore';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

let realClient: SupabaseClient | null = null;
function getRealClient(): SupabaseClient {
  if (!realClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Supabase] Missing Supabase environment variables. Real network calls will fail without .env.local.');
    }
    realClient = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-anon-key',
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return realClient;
}

let mockClientInstance: MockClient | null = null;
function getMockClient(): MockClient {
  if (!mockClientInstance) {
    mockClientInstance = createMockClient();
  }
  return mockClientInstance;
}

export function getActiveClient(): SupabaseClient | MockClient {
  if (isMockEnabled()) {
    return getMockClient();
  }
  return getRealClient();
}

/**
 * Universal Supabase Client proxy.
 * Routes seamlessly to MockClient when mock mode is enabled, or real SupabaseClient when disabled.
 */
export const supabase = new Proxy({} as any, {
  get(_target, prop: string | symbol) {
    const client = getActiveClient() as any;
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
}) as SupabaseClient;

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

// ─── Local Dev Diagnostics & Helper Exports ──────────────────────────────────

export { isMockEnabled, setMockEnabled, isLocalhost };

export async function resetMockBackend(): Promise<void> {
  await mockStore.reset();
  await clearRestCache();
}

export function isMockClientActive(): boolean {
  return isMockEnabled();
}

export function getMockStoreStats(): Record<string, number> {
  return mockStore.getStats();
}

export function exportMockDatabaseSnapshot(): string {
  return mockStore.exportSnapshot();
}

export async function importMockDatabaseSnapshot(json: string): Promise<boolean> {
  return mockStore.importSnapshot(json);
}

export type { User, Session } from '@supabase/supabase-js';
