// ─── Top-Level Mock Supabase Client ──────────────────────────────────────────

import { MockQueryBuilder } from './MockQueryBuilder';
import { getMockUser, setMockUser, simulateLatency, maybeSimulateError } from './mockConfig';

type AuthListener = (event: string, session: any) => void;

class MockStorageBucket {
  private bucket: string;
  private fileMap: Map<string, string> = new Map();

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  public getPublicUrl(path: string): { data: { publicUrl: string } } {
    if (this.fileMap.has(path)) {
      return { data: { publicUrl: this.fileMap.get(path)! } };
    }
    // Return standard bundled assets if standard avatar paths
    if (path.includes('dashboard_illustration')) {
      return { data: { publicUrl: '/assets/hero.png' } };
    }
    if (path.includes('chibi_mascot')) {
      return { data: { publicUrl: '/anime_chibi_mascot_1783275415079.png' } };
    }
    if (path.includes('anime_review_banner')) {
      return { data: { publicUrl: '/anime_hero_banner_1783275383433.png' } };
    }
    return { data: { publicUrl: `https://mock.storage.local/${this.bucket}/${path}` } };
  }

  public async upload(path: string, file: Blob | File, _options?: any): Promise<{ data: { path: string } | null; error: any }> {
    await simulateLatency();
    const error = maybeSimulateError();
    if (error) return error;

    let url = '';
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      url = URL.createObjectURL(file);
    } else {
      url = `blob:mock/${this.bucket}/${path}`;
    }
    this.fileMap.set(path, url);
    return { data: { path }, error: null };
  }

  public async remove(paths: string[]): Promise<{ data: string[] | null; error: any }> {
    await simulateLatency();
    const error = maybeSimulateError();
    if (error) return error;

    for (const p of paths) {
      this.fileMap.delete(p);
    }
    return { data: paths, error: null };
  }
}

class MockAuthClient {
  private listeners: Set<AuthListener> = new Set();

  private getSessionObject(user: any) {
    if (!user) return null;
    return {
      access_token: 'mock-jwt-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'mock-refresh-token',
      user,
    };
  }

  private buildUser(email: string, metadata: Record<string, any> = {}) {
    const isAdmin = email === 'tungariyarahul08@gmail.com';
    return {
      id: isAdmin ? 'usr_admin_mock_001' : 'usr_test_mock_002',
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {
        display_name: isAdmin ? 'Rahul (Admin)' : 'Dev Tester',
        about_me: 'Software Architect & Lifelong Learner.',
        ...metadata,
      },
    };
  }

  public async getSession(): Promise<{ data: { session: any }; error: null }> {
    await simulateLatency();
    const mockUserMeta = getMockUser();
    const user = this.buildUser(mockUserMeta.email);
    return {
      data: {
        session: this.getSessionObject(user),
      },
      error: null,
    };
  }

  public async getUser(): Promise<{ data: { user: any }; error: null }> {
    const mockUserMeta = getMockUser();
    return {
      data: {
        user: this.buildUser(mockUserMeta.email),
      },
      error: null,
    };
  }

  public onAuthStateChange(callback: AuthListener): { data: { subscription: { unsubscribe: () => void } } } {
    this.listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  }

  public async signInWithPassword({ email }: { email: string; password?: string }): Promise<{ data: { user: any; session: any }; error: any }> {
    await simulateLatency();
    const error = maybeSimulateError();
    if (error) return { data: { user: null, session: null }, error: error.error };

    if (!email || !email.includes('@')) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }

    setMockUser(email);
    const user = this.buildUser(email);
    const session = this.getSessionObject(user);

    // Notify listeners
    this.listeners.forEach((cb) => cb('SIGNED_IN', session));
    return { data: { user, session }, error: null };
  }

  public async signUp({ email, password }: { email: string; password?: string }): Promise<{ data: { user: any; session: any }; error: any }> {
    return this.signInWithPassword({ email, password });
  }

  public async signOut(): Promise<{ error: null }> {
    await simulateLatency();
    this.listeners.forEach((cb) => cb('SIGNED_OUT', null));
    return { error: null };
  }

  public async resetPasswordForEmail(_email: string): Promise<{ data: Record<string, never>; error: null }> {
    await simulateLatency();
    return { data: {}, error: null };
  }

  public async updateUser({ data }: { data?: Record<string, any>; password?: string }): Promise<{ data: { user: any }; error: any }> {
    await simulateLatency();
    const error = maybeSimulateError();
    if (error) return { data: { user: null }, error: error.error };

    const mockUserMeta = getMockUser();
    const user = this.buildUser(mockUserMeta.email, data || {});
    const session = this.getSessionObject(user);
    this.listeners.forEach((cb) => cb('USER_UPDATED', session));
    return { data: { user }, error: null };
  }
}

export class MockClient {
  public auth: MockAuthClient;
  public storage: {
    from: (bucket: string) => MockStorageBucket;
  };
  public functions: {
    invoke: (functionName: string, options?: any) => Promise<{ data: any; error: any }>;
  };
  private storageBuckets: Map<string, MockStorageBucket> = new Map();

  constructor() {
    this.auth = new MockAuthClient();
    this.storage = {
      from: (bucket: string) => {
        if (!this.storageBuckets.has(bucket)) {
          this.storageBuckets.set(bucket, new MockStorageBucket(bucket));
        }
        return this.storageBuckets.get(bucket)!;
      },
    };
    this.functions = {
      invoke: async (functionName: string, options?: any) => {
        try {
          const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
          const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
          if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL');
          
          const res = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
              ...(options?.headers || {})
            },
            body: options?.body ? JSON.stringify(options.body) : undefined
          });
          
          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.error || res.statusText) };
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    };
  }

  public from<T = any>(table: string): MockQueryBuilder<T> {
    return new MockQueryBuilder<T>(table);
  }

  public async rpc(functionName: string, _args: Record<string, any> = {}): Promise<{ data: any; error: any }> {
    await simulateLatency();
    console.info(`[MockClient RPC] Executed mock RPC function: ${functionName}`);
    return { data: [], error: null };
  }
}

export function createMockClient(): MockClient {
  return new MockClient();
}
