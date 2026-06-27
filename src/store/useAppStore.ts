import { create } from 'zustand';
import {
  noteService, linkService, stockService, subjectService,
  interestService, mediaService, countdownService, snippetService,
} from '../lib/db';
import { useAuthStore } from './useAuthStore';
import { useToastStore } from './useToastStore';

export type Theme = 'light' | 'dark';
export type CountdownTemplate = 'default' | 'minimal' | 'gradient' | 'circle' | 'event' | 'sale' | 'dark' | 'compact' | 'flip' | 'progress' | 'vertical' | 'split';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  tags: string[];
  savedAt: string;
}

export interface StockEntry {
  id: string;
  ticker: string;
  entryPrice: number;
  quantity: number;
  action: 'BUY' | 'SELL' | 'WATCHLIST';
  notes: string;
  date: string;
}

export interface Topic {
  id: string;
  name: string;
  done: boolean;
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
  semester: string;
}

export interface InterestRecord {
  id: string;
  type: 'SI' | 'CI';
  principal: number;
  rate: number;
  time: number;
  timeUnit: 'years' | 'months';
  interest: number;
  totalAmount: number;
  compoundFrequency?: 'annually' | 'semi-annually' | 'quarterly' | 'monthly';
  label: string;
  calculatedAt: string;
}

export interface MediaLog {
  id: string;
  type: 'ANIME' | 'GAME';
  title: string;
  status: 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'PLANNING' | 'PLAYING' | 'FINISHED' | 'WISHLIST';
  rating: number | null;
  episodes?: number;
  notes: string;
  addedAt: string;
}

export interface Countdown {
  id: string;
  label: string;
  targetDate: string;
  emoji: string;
  color: 'rose' | 'amber' | 'blue' | 'green' | 'purple';
  createdAt: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  tags: string[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export interface AppSettings {
  countdownTemplate: CountdownTemplate;
}

export interface AppStore {
  activeModule: string;
  setActiveModule: (module: string) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  confirmDialog: ConfirmDialogState;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;

  // Supabase sync
  dataLoaded: boolean;
  loadAllData: (userId: string) => Promise<void>;
  clearAllData: () => void;

  notes: Note[];
  addNote: (note: Note, userId?: string) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>, userId?: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  links: Link[];
  addLink: (link: Link, userId?: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;

  stocks: StockEntry[];
  addStock: (entry: StockEntry, userId?: string) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;

  subjects: Subject[];
  addSubject: (subject: Subject, userId?: string) => Promise<void>;
  addTopic: (subjectId: string, topic: Topic, userId?: string) => Promise<void>;
  toggleTopic: (subjectId: string, topicId: string, userId?: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  deleteTopic: (subjectId: string, topicId: string, userId?: string) => Promise<void>;

  interestHistory: InterestRecord[];
  addInterestRecord: (record: InterestRecord, userId?: string) => Promise<void>;
  deleteInterestRecord: (id: string) => Promise<void>;

  mediaLogs: MediaLog[];
  addMediaLog: (log: MediaLog, userId?: string) => Promise<void>;
  updateMediaLog: (id: string, data: Partial<MediaLog>) => Promise<void>;
  deleteMediaLog: (id: string) => Promise<void>;

  countdowns: Countdown[];
  addCountdown: (countdown: Countdown, userId?: string) => Promise<void>;
  deleteCountdown: (id: string) => Promise<void>;

  snippets: CodeSnippet[];
  addSnippet: (snippet: CodeSnippet, userId?: string) => Promise<void>;
  updateSnippet: (id: string, data: Partial<CodeSnippet>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;

  importData: (data: Partial<AppStore>) => void;
}

export const useAppStore = create<AppStore>()((set, get) => ({
  activeModule: localStorage.getItem('activeModule') || 'notes',
  setActiveModule: (module) => {
    localStorage.setItem('activeModule', module);
    set({ activeModule: module });
  },

  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  settings: { countdownTemplate: 'default' },
  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  confirmDialog: { isOpen: false, title: '', message: '', onConfirm: () => {} },
  showConfirm: (title, message, onConfirm) =>
    set({ confirmDialog: { isOpen: true, title, message, onConfirm } }),
  closeConfirm: () =>
    set((state) => ({ confirmDialog: { ...state.confirmDialog, isOpen: false } })),

  // Helper for toasts
  notifySuccess: (msg: string) => useToastStore.getState().addToast('Success', msg, 'success'),
  notifyError: (msg: string) => useToastStore.getState().addToast('Error', msg, 'error'),

  // ── Supabase Sync ────────────────────────────────────────────────────────────

  dataLoaded: false,

  loadAllData: async (userId) => {
    const [notes, links, stocks, subjects, interestHistory, mediaLogs, countdowns, snippets] =
      await Promise.all([
        noteService.fetchAll(userId),
        linkService.fetchAll(userId),
        stockService.fetchAll(userId),
        subjectService.fetchAll(userId),
        interestService.fetchAll(userId),
        mediaService.fetchAll(userId),
        countdownService.fetchAll(userId),
        snippetService.fetchAll(userId),
      ]);
    set({ notes, links, stocks, subjects, interestHistory, mediaLogs, countdowns, snippets, dataLoaded: true });
  },

  clearAllData: () =>
    set({
      notes: [], links: [], stocks: [], subjects: [],
      interestHistory: [], mediaLogs: [], countdowns: [],
      snippets: [], dataLoaded: false,
    }),

  // ── Notes ─────────────────────────────────────────────────────────────────

  notes: [],
  addNote: async (note) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ notes: [note, ...state.notes] }));
    await noteService.create(uid, note);
    useToastStore.getState().addToast('Success', 'Note saved', 'success');
  },
  updateNote: async (id, data) => {
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
    await noteService.update(id, data);
    useToastStore.getState().addToast('Success', 'Note updated', 'success');
  },
  deleteNote: async (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    await noteService.delete(id);
    useToastStore.getState().addToast('Success', 'Note deleted', 'success');
  },

  // ── Links ─────────────────────────────────────────────────────────────────

  links: [],
  addLink: async (link) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ links: [link, ...state.links] }));
    await linkService.create(uid, link);
    useToastStore.getState().addToast('Success', 'Link saved', 'success');
  },
  deleteLink: async (id) => {
    set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
    await linkService.delete(id);
    useToastStore.getState().addToast('Success', 'Link deleted', 'success');
  },

  // ── Stocks ────────────────────────────────────────────────────────────────

  stocks: [],
  addStock: async (entry) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ stocks: [entry, ...state.stocks] }));
    await stockService.create(uid, entry);
    useToastStore.getState().addToast('Success', 'Stock entry saved', 'success');
  },
  deleteStock: async (id) => {
    set((state) => ({ stocks: state.stocks.filter((s) => s.id !== id) }));
    await stockService.delete(id);
    useToastStore.getState().addToast('Success', 'Stock entry deleted', 'success');
  },

  // ── Subjects ──────────────────────────────────────────────────────────────

  subjects: [],
  addSubject: async (subject) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ subjects: [subject, ...state.subjects] }));
    await subjectService.create(uid, subject);
    useToastStore.getState().addToast('Success', 'Subject added', 'success');
  },
  addTopic: async (subjectId, topic) => {
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId ? { ...s, topics: [...s.topics, topic] } : s
      ),
    }));
    const updated = get().subjects.find((s) => s.id === subjectId);
    if (updated) await subjectService.update(subjectId, { topics: updated.topics });
    useToastStore.getState().addToast('Success', 'Topic added', 'success');
  },
  toggleTopic: async (subjectId, topicId) => {
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, topics: s.topics.map((t) => (t.id === topicId ? { ...t, done: !t.done } : t)) }
          : s
      ),
    }));
    const updated = get().subjects.find((s) => s.id === subjectId);
    if (updated) await subjectService.update(subjectId, { topics: updated.topics });
  },
  deleteSubject: async (id) => {
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) }));
    await subjectService.delete(id);
    useToastStore.getState().addToast('Success', 'Subject deleted', 'success');
  },
  deleteTopic: async (subjectId, topicId) => {
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) }
          : s
      ),
    }));
    const updated = get().subjects.find((s) => s.id === subjectId);
    if (updated) await subjectService.update(subjectId, { topics: updated.topics });
    useToastStore.getState().addToast('Success', 'Topic deleted', 'success');
  },

  // ── Interest ──────────────────────────────────────────────────────────────

  interestHistory: [],
  addInterestRecord: async (record) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ interestHistory: [record, ...state.interestHistory] }));
    await interestService.create(uid, record);
    useToastStore.getState().addToast('Success', 'Record saved', 'success');
  },
  deleteInterestRecord: async (id) => {
    set((state) => ({
      interestHistory: state.interestHistory.filter((r) => r.id !== id),
    }));
    await interestService.delete(id);
    useToastStore.getState().addToast('Success', 'Record deleted', 'success');
  },

  // ── Media ─────────────────────────────────────────────────────────────────

  mediaLogs: [],
  addMediaLog: async (log) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ mediaLogs: [log, ...state.mediaLogs] }));
    await mediaService.create(uid, log);
    useToastStore.getState().addToast('Success', 'Media log added', 'success');
  },
  updateMediaLog: async (id, data) => {
    set((state) => ({
      mediaLogs: state.mediaLogs.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
    await mediaService.update(id, data);
    useToastStore.getState().addToast('Success', 'Media log updated', 'success');
  },
  deleteMediaLog: async (id) => {
    set((state) => ({ mediaLogs: state.mediaLogs.filter((m) => m.id !== id) }));
    await mediaService.delete(id);
    useToastStore.getState().addToast('Success', 'Media log deleted', 'success');
  },

  // ── Countdowns ────────────────────────────────────────────────────────────

  countdowns: [],
  addCountdown: async (countdown) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ countdowns: [countdown, ...state.countdowns] }));
    await countdownService.create(uid, countdown);
    useToastStore.getState().addToast('Success', 'Countdown created', 'success');
  },
  deleteCountdown: async (id) => {
    set((state) => ({ countdowns: state.countdowns.filter((c) => c.id !== id) }));
    await countdownService.delete(id);
    useToastStore.getState().addToast('Success', 'Countdown deleted', 'success');
  },

  // ── Snippets ──────────────────────────────────────────────────────────────

  snippets: [],
  addSnippet: async (snippet) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set((state) => ({ snippets: [snippet, ...state.snippets] }));
    await snippetService.create(uid, snippet);
    useToastStore.getState().addToast('Success', 'Snippet added', 'success');
  },
  updateSnippet: async (id, data) => {
    set((state) => ({
      snippets: state.snippets.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
    await snippetService.update(id, data);
    useToastStore.getState().addToast('Success', 'Snippet updated', 'success');
  },
  deleteSnippet: async (id) => {
    set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }));
    await snippetService.delete(id);
    useToastStore.getState().addToast('Success', 'Snippet deleted', 'success');
  },

  importData: (data) => set((state) => ({ ...state, ...data })),
}));
