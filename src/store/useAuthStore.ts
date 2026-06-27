import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    set({ loading: true });
    const { data } = await supabase.auth.getSession();
    set({ user: data.session?.user ?? null, loading: false, initialized: true });

    // Listen for auth state changes (cross-device / tab sync)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false });
      return { error: error.message };
    }
    // Set user immediately from response — don't wait for onAuthStateChange
    set({ user: data.user ?? null, loading: false });
    return { error: null };
  },

  signUp: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({ email, password });
    set({ loading: false });
    if (error) return { error: error.message };
    // If email confirmation is disabled in Supabase, auto-login
    if (data.session) {
      set({ user: data.user ?? null });
    }
    return { error: null };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },

  setUser: (user) => set({ user }),
}));
