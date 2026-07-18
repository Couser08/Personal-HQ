import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

const CACHE_NAME = 'supabase-api-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const INVALIDATION_DEPENDENCIES: Record<string, string[]> = {
  'todo_projects': ['todo_tasks'],
  'tags': ['notes', 'links', 'journals', 'todo_tasks', 'sprints'],
};

function getTableName(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    const pathParts = url.pathname.split('/');
    const restIndex = pathParts.indexOf('v1');
    if (restIndex !== -1 && pathParts.length > restIndex + 1) {
      return pathParts[restIndex + 1];
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  return null;
}

export async function clearRestCache(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase_cache_timestamps');
    if ('caches' in window) {
      try {
        await caches.delete(CACHE_NAME);
        console.log('[Cache] Supabase REST API cache cleared.');
      } catch (e) {
        console.error('[Cache] Failed to delete cache:', e);
      }
    }
  }
}

async function invalidateCache(tableName: string) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const timestamps = JSON.parse(localStorage.getItem('supabase_cache_timestamps') || '{}');
    let updated = false;

    for (const key of keys) {
      if (getTableName(key.url) === tableName) {
        await cache.delete(key);
        if (timestamps[key.url]) {
          delete timestamps[key.url];
          updated = true;
        }
      }
    }

    if (updated) {
      localStorage.setItem('supabase_cache_timestamps', JSON.stringify(timestamps));
    }
    console.log(`[Cache Invalidation] Cleared cache for table: ${tableName}`);
  } catch (e) {
    console.error('[Cache] Error invalidating cache:', e);
  }
}

export const customFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
  const method = init?.method?.toUpperCase() || 'GET';
  const isRest = url.includes('/rest/v1/');

  if (!isRest || typeof window === 'undefined' || !('caches' in window)) {
    return fetch(input, init);
  }

  const tableName = getTableName(url);

  if (method !== 'GET') {
    if (tableName) {
      const dependencies = INVALIDATION_DEPENDENCIES[tableName] || [];
      const targets = [tableName, ...dependencies];
      for (const target of targets) {
        await invalidateCache(target);
      }
    }
    return fetch(input, init);
  }

  const headers = init?.headers ? new Headers(init.headers) : null;
  const bypassCache = headers?.get('x-bypass-cache') === 'true' || headers?.get('cache-control')?.includes('no-cache');

  // Strip custom cache control headers before sending to network
  let cleanInit = init;
  if (init?.headers) {
    const cleanHeaders = new Headers(init.headers);
    if (cleanHeaders.has('x-bypass-cache')) {
      cleanHeaders.delete('x-bypass-cache');
      cleanInit = { ...init, headers: cleanHeaders };
    }
  }

  try {
    const cache = await caches.open(CACHE_NAME);

    if (!bypassCache) {
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const timestamps = JSON.parse(localStorage.getItem('supabase_cache_timestamps') || '{}');
        const timestamp = timestamps[url];
        if (timestamp && Date.now() - timestamp < CACHE_TTL) {
          console.log(`[Cache Hit] Serving cached GET for table: ${tableName}`);
          return cachedResponse.clone();
        }
      }
    }

    const response = await fetch(input, cleanInit);

    if (response.ok) {
      await cache.put(url, response.clone());
      const timestamps = JSON.parse(localStorage.getItem('supabase_cache_timestamps') || '{}');
      timestamps[url] = Date.now();
      localStorage.setItem('supabase_cache_timestamps', JSON.stringify(timestamps));
      console.log(`[Cache Miss] Cached new GET for table: ${tableName}`);
    }

    return response;
  } catch (e) {
    console.error('[Cache] Error in customFetch, falling back to network:', e);
    return fetch(input, cleanInit);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: customFetch,
  },
});

export type { User, Session } from '@supabase/supabase-js';

