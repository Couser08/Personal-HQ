import { create } from 'zustand';
import {
  noteService, linkService, stockService, subjectService,
  interestService, mediaService, countdownService, snippetService,
  budgetCategoryService, budgetTransactionService,
  todoProjectService, todoTaskService, journalService, mindmapService, standardCalcService
} from '../lib/db';
import { useAuthStore } from './useAuthStore';
import { useToastStore } from './useToastStore';

const DEFAULT_SETTINGS: AppSettings = {
  countdownTemplate: 'default',
  accentColor: 'rose',
  animationSpeed: 'normal',
  compactMode: false,
  soundEnabled: true,
  initialBankBalance: 0,
  initialCashBalance: 0,
};

const sanitizeActiveModule = (module: string) => {
  if (module === 'stocks' || module === 'notes' || module === 'journal') {
    return 'dashboard';
  }
  if (module === 'links' || module === 'calculator' || module === 'countdown') {
    return 'utilities';
  }
  return module;
};

const loadStoredSettings = (): AppSettings => {
  const fallback = { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem('settings');
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
};

const getStoreErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const throttleMap = new Map<string, number>();
const shouldThrottle = (actionName: string, limit = 600) => {
  const now = Date.now();
  const last = throttleMap.get(actionName) || 0;
  if (now - last < limit) return true;
  throttleMap.set(actionName, now);
  return false;
};

export type Theme = 'light' | 'dark' | 'system';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: 'great' | 'good' | 'meh' | 'bad' | 'terrible';
  tags: string[];
  images: string[];
  pinned: boolean;
  reflection: {
    whatWentWell: string;
    whatCanBeBetter: string;
  };
  focusList: { text: string; checked: boolean }[];
  attachments: { name: string; size: string }[];
  pageStyle: 'default' | 'lines' | 'dotted' | 'grid' | 'cornell';
}

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

export interface TodoProject {
  id: string;
  name: string;
  color: string;
}

export interface TodoTask {
  id: string;
  projectId: string | null;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'none';
  tags: string[];
  dueDate: string | null;
  startTime?: string | null;
  endTime?: string | null;
  pomodoroCount?: number;
  deleted?: boolean;
  createdAt: string;
}

export interface TopicNote {
  id: string;
  title: string;
  content: string;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
}

export interface TopicResource {
  id: string;
  title: string;
  type: 'link' | 'pdf' | 'doc' | 'image' | 'video' | 'youtube';
  url: string;
  fileSize?: string;
  tags?: string[];
  uploadDate: string;
}

export interface TopicQuestion {
  id: string;
  question: string;
  answer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'solved' | 'unsolved';
  repeated?: boolean;
}

export interface TopicFlashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  nextReview?: string;
  revisionCount?: number;
}

export interface TopicTask {
  id: string;
  title: string;
  done: boolean;
}

export interface TopicAnalytics {
  timeSpent?: number;
  studySessions?: number;
}

export interface Topic {
  id: string;
  name: string;
  done: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'low' | 'medium' | 'high';
  timeSpent?: number;
  lastOpened?: string;
  description?: string;
  tags?: string[];
  notes?: TopicNote[];
  snippets?: TopicSnippet[];
  resources?: TopicResource[];
  questions?: TopicQuestion[];
  flashcards?: TopicFlashcard[];
  tasks?: TopicTask[];
  analytics?: TopicAnalytics;
  learningStreak?: number;
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
  season?: number;
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

export interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  color: 'rose' | 'blue' | 'green' | 'amber' | 'purple';
  icon: string;
}

export interface BudgetTransaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  paymentMethod?: 'cash' | 'online';
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

export interface MediaEntryModalState {
  isOpen: boolean;
  editingLog: MediaLog | null;
  activeTab: 'ANIME' | 'GAME';
}

export interface TodoTaskModalState {
  isOpen: boolean;
  task: TodoTask | null;
}

export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'gray';
  isRoot?: boolean;
  parentId?: string;
  side?: 'left' | 'right' | 'bottom';
  collapsed?: boolean;
  icon?: string;
  notes?: string;
  linkUrl?: string;
  imageUrl?: string;
  images?: string[];
  pdfs?: { name: string; base64: string }[];
  links?: string[];
}

export interface MindmapLink {
  source: string;
  target: string;
}

export interface Mindmap {
  id: string;
  title: string;
  nodes: MindmapNode[];
  links: MindmapLink[];
  edgeStyle?: 'solid' | 'dashed' | 'dotted';
  createdAt: string;
  updatedAt?: string;
}

export interface StandardCalculation {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
}

export type CountdownTemplate = 'default' | 'minimal' | 'gradient' | 'circle' | 'event' | 'sale' | 'dark' | 'compact' | 'flip' | 'progress' | 'vertical' | 'split';
export type AccentColor = 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'teal' | 'gray';
export type AnimationSpeed = 'fast' | 'normal' | 'slow';
export interface AppSettings {
  countdownTemplate: CountdownTemplate;
  accentColor: AccentColor;
  animationSpeed: AnimationSpeed;
  compactMode: boolean;
  soundEnabled: boolean;
  initialBankBalance: number;
  initialCashBalance: number;
}

export interface PomodoroStats {
  totalSessions: number;
  totalMinutes: number;
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

  mediaEntryModal: MediaEntryModalState;
  openMediaEntryModal: (tab: 'ANIME' | 'GAME', log?: MediaLog) => void;
  closeMediaEntryModal: () => void;

  todoProjectModal: { isOpen: boolean };
  openTodoProjectModal: () => void;
  closeTodoProjectModal: () => void;

  todoTaskModal: TodoTaskModalState;
  openTodoTaskModal: (task?: TodoTask | null) => void;
  closeTodoTaskModal: () => void;

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
  updateTopic: (subjectId: string, topicId: string, data: Partial<Topic>) => Promise<void>;
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

  pomodoroStats: PomodoroStats;
  recordPomodoroSession: (minutes: number) => void;
  pomodoroSecondsLeft: number;
  pomodoroTotalSeconds: number;
  pomodoroTimerState: 'idle' | 'running' | 'paused';
  pomodoroSessionId: 'focus' | 'short-break' | 'long-break';
  pomodoroStreak: number;
  pomodoroAssociatedTaskId: string | null;
  pomodoroPipWindow: Window | null;
  pomodoroPipEnabled: boolean;
  setPomodoroSecondsLeft: (secs: number) => void;
  setPomodoroTotalSeconds: (secs: number) => void;
  setPomodoroTimerState: (state: 'idle' | 'running' | 'paused') => void;
  setPomodoroSessionId: (id: 'focus' | 'short-break' | 'long-break') => void;
  setPomodoroStreak: (streak: number) => void;
  setPomodoroAssociatedTaskId: (id: string | null) => void;
  setPomodoroPipWindow: (win: Window | null) => void;
  setPomodoroPipEnabled: (enabled: boolean) => void;
  startGlobalPomodoro: () => void;
  pauseGlobalPomodoro: () => void;
  resumeGlobalPomodoro: () => void;
  stopGlobalPomodoro: () => void;

  // Budget Tracker
  budgetCategories: BudgetCategory[];
  budgetTransactions: BudgetTransaction[];
  addBudgetCategory: (category: BudgetCategory) => Promise<void>;
  updateBudgetCategory: (id: string, data: Partial<BudgetCategory>) => Promise<void>;
  deleteBudgetCategory: (id: string) => Promise<void>;
  addBudgetTransaction: (transaction: BudgetTransaction) => Promise<void>;
  deleteBudgetTransaction: (id: string) => Promise<void>;
  updateBudgetTransaction: (id: string, data: Partial<BudgetTransaction>) => Promise<void>;
  
  // To-Do
  todoTasks: TodoTask[];
  todoProjects: TodoProject[];
  addTodoTask: (task: TodoTask) => Promise<void>;
  updateTodoTask: (id: string, data: Partial<TodoTask>) => Promise<void>;
  deleteTodoTask: (id: string) => Promise<void>;
  restoreTodoTask: (id: string) => Promise<void>;
  emptyTodoTrash: () => Promise<void>;
  addTodoProject: (project: TodoProject) => Promise<void>;
  deleteTodoProject: (id: string) => Promise<void>;
  
  // Journal Tracker
  journals: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  
  // Mindmap Creator
  mindmaps: Mindmap[];
  addMindmap: (mindmap: Mindmap) => Promise<void>;
  updateMindmap: (id: string, data: Partial<Mindmap>) => Promise<void>;
  deleteMindmap: (id: string) => Promise<void>;

  // Standard Arithmetic Calculator
  standardHistory: StandardCalculation[];
  addStandardRecord: (record: StandardCalculation) => Promise<void>;
  clearStandardHistory: () => Promise<void>;

  importData: (data: Partial<AppStore>) => void;
}

let globalPomodoroInterval: any = null;

export const useAppStore = create<AppStore>()((set, get) => ({
  activeModule: sanitizeActiveModule(localStorage.getItem('activeModule') || 'dashboard'),
  setActiveModule: (module) => {
    const nextModule = sanitizeActiveModule(module);
    localStorage.setItem('activeModule', nextModule);
    set({ activeModule: nextModule });
  },

  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  settings: loadStoredSettings(),
  journals: (() => {
    try {
      const raw = localStorage.getItem('phq_journals');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),
  mindmaps: (() => {
    try {
      const raw = localStorage.getItem('phq_mindmaps');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),
  updateSettings: (newSettings) =>
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      localStorage.setItem('settings', JSON.stringify(settings));
      return { settings };
    }),

  confirmDialog: { isOpen: false, title: '', message: '', onConfirm: () => {} },
  showConfirm: (title, message, onConfirm) =>
    set({ confirmDialog: { isOpen: true, title, message, onConfirm } }),
  closeConfirm: () =>
    set((state) => ({ confirmDialog: { ...state.confirmDialog, isOpen: false } })),

  mediaEntryModal: { isOpen: false, editingLog: null, activeTab: 'ANIME' },
  openMediaEntryModal: (tab, log) =>
    set({ mediaEntryModal: { isOpen: true, editingLog: log || null, activeTab: tab } }),
  closeMediaEntryModal: () =>
    set((state) => ({ mediaEntryModal: { ...state.mediaEntryModal, isOpen: false } })),

  todoProjectModal: { isOpen: false },
  openTodoProjectModal: () => set({ todoProjectModal: { isOpen: true } }),
  closeTodoProjectModal: () => set({ todoProjectModal: { isOpen: false } }),

  todoTaskModal: { isOpen: false, task: null },
  openTodoTaskModal: (task) => set({ todoTaskModal: { isOpen: true, task: task || null } }),
  closeTodoTaskModal: () => set({ todoTaskModal: { isOpen: false, task: null } }),

  // Helper for toasts
  notifySuccess: (msg: string) => useToastStore.getState().addToast('Success', msg, 'success'),
  notifyError: (msg: string) => useToastStore.getState().addToast('Error', msg, 'error'),

  // ── Supabase Sync ────────────────────────────────────────────────────────────

  dataLoaded: false,

  loadAllData: async (userId: string) => {
    const results = await Promise.allSettled([
      noteService.fetchAll(userId),
      linkService.fetchAll(userId),
      stockService.fetchAll(userId),
      subjectService.fetchAll(userId),
      interestService.fetchAll(userId),
      mediaService.fetchAll(userId),
      countdownService.fetchAll(userId),
      snippetService.fetchAll(userId),
      budgetCategoryService.fetchAll(userId),
      budgetTransactionService.fetchAll(userId),
      todoProjectService.fetchAll(userId),
      todoTaskService.fetchAll(userId),
      journalService.fetchAll(userId),
      mindmapService.fetchAll(userId),
      standardCalcService.fetchAll(userId),
    ]);

    const serviceNames = [
      'notes',
      'links',
      'stocks',
      'study tracker',
      'calculator history',
      'media logs',
      'countdowns',
      'code snippets',
      'budget categories',
      'budget transactions',
      'todo projects',
      'todo tasks',
      'journals',
      'mindmaps',
      'standard calculations history',
    ];

    const failedServices = results
      .map((result, index) => (result.status === 'rejected' ? serviceNames[index] : null))
      .filter((name): name is string => Boolean(name));

    const notes = results[0].status === 'fulfilled' ? results[0].value : [];
    const links = results[1].status === 'fulfilled' ? results[1].value : [];
    const stocks = results[2].status === 'fulfilled' ? results[2].value : [];
    const subjects = results[3].status === 'fulfilled' ? results[3].value : [];
    const interestHistory = results[4].status === 'fulfilled' ? results[4].value : [];
    const mediaLogs = results[5].status === 'fulfilled' ? results[5].value : [];
    const countdowns = results[6].status === 'fulfilled' ? results[6].value : [];
    const snippets = results[7].status === 'fulfilled' ? results[7].value : [];
    const budgetCategories = results[8].status === 'fulfilled' ? results[8].value : [];
    const budgetTransactions = results[9].status === 'fulfilled' ? results[9].value : [];
    const todoProjects = results[10].status === 'fulfilled' ? results[10].value : [];
    const todoTasks = results[11].status === 'fulfilled' ? results[11].value : [];
    const journals = results[12].status === 'fulfilled' ? results[12].value as any[] : [];
    const mindmaps = results[13].status === 'fulfilled' ? results[13].value as any[] : [];
    const standardHistory = results[14].status === 'fulfilled' ? results[14].value as any[] : [];

    if (failedServices.length > 0) {
      console.warn('Supabase sync skipped some modules:', failedServices);
      useToastStore.getState().addToast(
        'Partial Sync',
        `Some modules could not refresh: ${failedServices.join(', ')}`,
        'warning'
      );
    }

    set({
      notes, links, stocks, subjects, interestHistory, mediaLogs, countdowns, snippets,
      budgetCategories, budgetTransactions, todoProjects, todoTasks, journals, mindmaps, standardHistory,
      dataLoaded: true
    });
  },

  clearAllData: () =>
    set({
      notes: [], links: [], stocks: [], subjects: [],
      interestHistory: [], mediaLogs: [], countdowns: [],
      snippets: [], budgetCategories: [], budgetTransactions: [],
      todoProjects: [], todoTasks: [], journals: [], mindmaps: [], standardHistory: [],
      dataLoaded: false,
    }),

  // ── Notes ─────────────────────────────────────────────────────────────────

  notes: [],
  addNote: async (note) => {
    if (shouldThrottle('addNote')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().notes;
    set((state) => ({ notes: [note, ...state.notes] }));
    try {
      await noteService.create(uid, note);
      useToastStore.getState().addToast('Success', 'Note saved', 'success');
    } catch (error) {
      set({ notes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save note'), 'error');
      throw error;
    }
  },
  updateNote: async (id, data) => {
    const previous = get().notes;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
    try {
      await noteService.update(id, data);
      useToastStore.getState().addToast('Success', 'Note updated', 'success');
    } catch (error) {
      set({ notes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update note'), 'error');
      throw error;
    }
  },
  deleteNote: async (id) => {
    const previous = get().notes;
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    try {
      await noteService.delete(id);
      useToastStore.getState().addToast('Success', 'Note deleted', 'success');
    } catch (error) {
      set({ notes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete note'), 'error');
      throw error;
    }
  },

  // ── Links ─────────────────────────────────────────────────────────────────

  links: [],
  addLink: async (link) => {
    if (shouldThrottle('addLink')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().links;
    set((state) => ({ links: [link, ...state.links] }));
    try {
      await linkService.create(uid, link);
      useToastStore.getState().addToast('Success', 'Link saved', 'success');
    } catch (error) {
      set({ links: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save link'), 'error');
      throw error;
    }
  },
  deleteLink: async (id) => {
    const previous = get().links;
    set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
    try {
      await linkService.delete(id);
      useToastStore.getState().addToast('Success', 'Link deleted', 'success');
    } catch (error) {
      set({ links: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete link'), 'error');
      throw error;
    }
  },

  // ── Stocks ────────────────────────────────────────────────────────────────

  stocks: [],
  addStock: async (entry) => {
    if (shouldThrottle('addStock')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().stocks;
    set((state) => ({ stocks: [entry, ...state.stocks] }));
    try {
      await stockService.create(uid, entry);
      useToastStore.getState().addToast('Success', 'Stock entry saved', 'success');
    } catch (error) {
      set({ stocks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save stock entry'), 'error');
      throw error;
    }
  },
  deleteStock: async (id) => {
    const previous = get().stocks;
    set((state) => ({ stocks: state.stocks.filter((s) => s.id !== id) }));
    try {
      await stockService.delete(id);
      useToastStore.getState().addToast('Success', 'Stock entry deleted', 'success');
    } catch (error) {
      set({ stocks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete stock entry'), 'error');
      throw error;
    }
  },

  // ── Subjects ──────────────────────────────────────────────────────────────

  subjects: [],
  addSubject: async (subject) => {
    if (shouldThrottle('addSubject')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().subjects;
    set((state) => ({ subjects: [subject, ...state.subjects] }));
    try {
      await subjectService.create(uid, subject);
      useToastStore.getState().addToast('Success', 'Subject added', 'success');
    } catch (error) {
      set({ subjects: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not add subject'), 'error');
      throw error;
    }
  },
  addTopic: async (subjectId, topic) => {
    if (shouldThrottle(`addTopic-${subjectId}`)) return;
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
  updateTopic: async (subjectId, topicId, data) => {
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              topics: s.topics.map((t) => (t.id === topicId ? { ...t, ...data } : t)),
            }
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
    if (shouldThrottle('addInterest')) return;
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

  standardHistory: [],
  addStandardRecord: async (record) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().standardHistory;
    const next = [record, ...previous].slice(0, 20);
    set({ standardHistory: next });
    try {
      await standardCalcService.create(uid, record);
    } catch (error) {
      set({ standardHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save calculation'), 'error');
      throw error;
    }
  },
  clearStandardHistory: async () => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().standardHistory;
    set({ standardHistory: [] });
    try {
      await standardCalcService.clearAll(uid);
    } catch (error) {
      set({ standardHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not clear history'), 'error');
      throw error;
    }
  },

  // ── Media ─────────────────────────────────────────────────────────────────

  mediaLogs: [],
  addMediaLog: async (log) => {
    if (shouldThrottle('addMediaLog')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().mediaLogs;
    set((state) => ({ mediaLogs: [log, ...state.mediaLogs] }));
    try {
      await mediaService.create(uid, log);
      useToastStore.getState().addToast('Success', 'Media log added', 'success');
    } catch (error) {
      set({ mediaLogs: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save media log'), 'error');
      throw error;
    }
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
    if (shouldThrottle('addCountdown')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().countdowns;
    set((state) => ({ countdowns: [countdown, ...state.countdowns] }));
    try {
      await countdownService.create(uid, countdown);
      useToastStore.getState().addToast('Success', 'Countdown created', 'success');
    } catch (error) {
      set({ countdowns: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create countdown'), 'error');
      throw error;
    }
  },
  deleteCountdown: async (id) => {
    set((state) => ({ countdowns: state.countdowns.filter((c) => c.id !== id) }));
    await countdownService.delete(id);
    useToastStore.getState().addToast('Success', 'Countdown deleted', 'success');
  },

  // ── Snippets ──────────────────────────────────────────────────────────────

  snippets: [],
  addSnippet: async (snippet) => {
    if (shouldThrottle('addSnippet')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().snippets;
    set((state) => ({ snippets: [snippet, ...state.snippets] }));
    try {
      await snippetService.create(uid, snippet);
      useToastStore.getState().addToast('Success', 'Snippet added', 'success');
    } catch (error) {
      set({ snippets: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save snippet'), 'error');
      throw error;
    }
  },
  updateSnippet: async (id, data) => {
    const previous = get().snippets;
    const nextData = { ...data, updatedAt: data.updatedAt ?? new Date().toISOString() };
    set((state) => ({
      snippets: state.snippets.map((s) => (s.id === id ? { ...s, ...nextData } : s)),
    }));
    try {
      await snippetService.update(id, nextData);
      useToastStore.getState().addToast('Success', 'Snippet updated', 'success');
    } catch (error) {
      set({ snippets: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update snippet'), 'error');
      throw error;
    }
  },
  deleteSnippet: async (id) => {
    const previous = get().snippets;
    set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }));
    try {
      await snippetService.delete(id);
      useToastStore.getState().addToast('Success', 'Snippet deleted', 'success');
    } catch (error) {
      set({ snippets: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete snippet'), 'error');
      throw error;
    }
  },

  // ── Pomodoro ──────────────────────────────────────────────────────────────

  pomodoroStats: { totalSessions: 0, totalMinutes: 0 },
  pomodoroSecondsLeft: 25 * 60,
  pomodoroTotalSeconds: 25 * 60,
  pomodoroTimerState: 'idle',
  pomodoroSessionId: 'focus',
  pomodoroStreak: 0,
  pomodoroAssociatedTaskId: null,
  pomodoroPipWindow: null,
  pomodoroPipEnabled: false,

  setPomodoroSecondsLeft: (secs) => set({ pomodoroSecondsLeft: secs }),
  setPomodoroTotalSeconds: (secs) => set({ pomodoroTotalSeconds: secs }),
  setPomodoroTimerState: (state) => set({ pomodoroTimerState: state }),
  setPomodoroSessionId: (id) => set({ pomodoroSessionId: id }),
  setPomodoroStreak: (streak) => set({ pomodoroStreak: streak }),
  setPomodoroAssociatedTaskId: (id) => set({ pomodoroAssociatedTaskId: id }),
  setPomodoroPipWindow: (win) => set({ pomodoroPipWindow: win }),
  setPomodoroPipEnabled: (enabled) => set({ pomodoroPipEnabled: enabled }),

  recordPomodoroSession: (minutes) =>
    set((state) => ({
      pomodoroStats: {
        totalSessions: state.pomodoroStats.totalSessions + 1,
        totalMinutes: state.pomodoroStats.totalMinutes + minutes,
      },
    })),

  startGlobalPomodoro: () => {
    if (globalPomodoroInterval) clearInterval(globalPomodoroInterval);
    set({ pomodoroTimerState: 'running' });

    const tick = () => {
      const { 
        pomodoroSecondsLeft, 
        pomodoroSessionId, 
        pomodoroStreak, 
        pomodoroAssociatedTaskId, 
        todoTasks, 
        updateTodoTask, 
        recordPomodoroSession, 
        pomodoroTotalSeconds 
      } = get();

      if (pomodoroSecondsLeft <= 1) {
        clearInterval(globalPomodoroInterval);
        globalPomodoroInterval = null;
        set({ pomodoroTimerState: 'idle', pomodoroSecondsLeft: 0 });

        const addToast = useToastStore.getState().addToast;

        if (pomodoroSessionId === 'focus') {
          const nextStreak = pomodoroStreak + 1;
          set({ pomodoroStreak: nextStreak });
          recordPomodoroSession(Math.round(pomodoroTotalSeconds / 60));

          if (pomodoroAssociatedTaskId) {
            const matchedTask = todoTasks.find(t => t.id === pomodoroAssociatedTaskId);
            if (matchedTask) {
              updateTodoTask(pomodoroAssociatedTaskId, {
                pomodoroCount: (matchedTask.pomodoroCount || 0) + 1
              });
              addToast('🍅 Session Logged', `Logged focus session to "${matchedTask.title}"`, 'success');
            }
          } else {
            addToast('🎉 Focus Complete!', 'Great work! Time for a break.', 'success');
          }

          const nextSid = nextStreak % 4 === 0 ? 'long-break' : 'short-break';
          const breakMins = nextSid === 'short-break' ? 5 : 15;
          set({ 
            pomodoroSessionId: nextSid, 
            pomodoroSecondsLeft: breakMins * 60,
            pomodoroTotalSeconds: breakMins * 60
          });
        } else {
          addToast('⏰ Break Over!', 'Ready to focus again? 🚀', 'info');
          set({ 
            pomodoroSessionId: 'focus', 
            pomodoroSecondsLeft: 25 * 60,
            pomodoroTotalSeconds: 25 * 60
          });
        }
      } else {
        set({ pomodoroSecondsLeft: pomodoroSecondsLeft - 1 });
      }
    };

    globalPomodoroInterval = setInterval(tick, 1000);
  },

  pauseGlobalPomodoro: () => {
    if (globalPomodoroInterval) {
      clearInterval(globalPomodoroInterval);
      globalPomodoroInterval = null;
    }
    set({ pomodoroTimerState: 'paused' });
  },

  resumeGlobalPomodoro: () => {
    get().startGlobalPomodoro();
  },

  stopGlobalPomodoro: () => {
    if (globalPomodoroInterval) {
      clearInterval(globalPomodoroInterval);
      globalPomodoroInterval = null;
    }
    const { pomodoroTotalSeconds, pomodoroPipWindow } = get();
    set({ 
      pomodoroTimerState: 'idle', 
      pomodoroSecondsLeft: pomodoroTotalSeconds 
    });
    if (pomodoroPipWindow) {
      pomodoroPipWindow.close();
      set({ pomodoroPipWindow: null });
    }
  },

  // Budget Tracker
  budgetCategories: [],
  budgetTransactions: [],
  addBudgetCategory: async (category) => {
    if (shouldThrottle('addBudgetCategory')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().budgetCategories;
    set((state) => ({ budgetCategories: [...state.budgetCategories, category] }));
    try {
      await budgetCategoryService.create(uid, category);
      useToastStore.getState().addToast('Success', 'Budget category added', 'success');
    } catch (error) {
      set({ budgetCategories: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not add budget category'), 'error');
      throw error;
    }
  },
  updateBudgetCategory: async (id, data) => {
    set((state) => ({
      budgetCategories: state.budgetCategories.map(c => c.id === id ? { ...c, ...data } : c),
    }));
    await budgetCategoryService.update(id, data);
    useToastStore.getState().addToast('Success', 'Budget category updated', 'success');
  },
  deleteBudgetCategory: async (id) => {
    const previousCategories = get().budgetCategories;
    const previousTransactions = get().budgetTransactions;
    set((state) => ({
      budgetCategories: state.budgetCategories.filter(c => c.id !== id),
      budgetTransactions: state.budgetTransactions.filter(t => t.categoryId !== id),
    }));
    try {
      await budgetCategoryService.delete(id);
      useToastStore.getState().addToast('Success', 'Budget category deleted', 'success');
    } catch (error) {
      set({ budgetCategories: previousCategories, budgetTransactions: previousTransactions });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete budget category'), 'error');
      throw error;
    }
  },
  addBudgetTransaction: async (transaction) => {
    if (shouldThrottle('addBudgetTransaction')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().budgetTransactions;
    set((state) => ({ budgetTransactions: [transaction, ...state.budgetTransactions] }));
    try {
      await budgetTransactionService.create(uid, transaction);
      useToastStore.getState().addToast('Success', 'Budget transaction added', 'success');
    } catch (error) {
      set({ budgetTransactions: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save transaction'), 'error');
      throw error;
    }
  },
  deleteBudgetTransaction: async (id) => {
    set((state) => ({ budgetTransactions: state.budgetTransactions.filter(t => t.id !== id) }));
    await budgetTransactionService.delete(id);
    useToastStore.getState().addToast('Success', 'Budget transaction deleted', 'success');
  },
  updateBudgetTransaction: async (id, data) => {
    const previous = get().budgetTransactions;
    set((state) => ({
      budgetTransactions: state.budgetTransactions.map(t => t.id === id ? { ...t, ...data } : t)
    }));
    try {
      await budgetTransactionService.update(id, data);
      useToastStore.getState().addToast('Success', 'Transaction updated', 'success');
    } catch (error) {
      set({ budgetTransactions: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update transaction'), 'error');
      throw error;
    }
  },

  // ── To-Do ──────────────────────────────────────────────────────────────────
  todoTasks: [],
  todoProjects: [],
  
  addTodoProject: async (project) => {
    if (shouldThrottle('addTodoProject')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().todoProjects;
    set((state) => ({ todoProjects: [...state.todoProjects, project] }));
    try {
      const savedInDb = await todoProjectService.create(uid, project);
      const location = savedInDb ? 'Database' : 'Local Storage';
      useToastStore.getState().addToast('Success', `Project saved to ${location}`, 'success');
    } catch (error) {
      set({ todoProjects: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create project'), 'error');
      throw error;
    }
  },
  
  deleteTodoProject: async (id) => {
    const previousProjects = get().todoProjects;
    const previousTasks = get().todoTasks;
    set((state) => ({
      todoProjects: state.todoProjects.filter(p => p.id !== id),
      todoTasks: state.todoTasks.filter(t => t.projectId !== id),
    }));
    try {
      await todoProjectService.delete(id);
      useToastStore.getState().addToast('Success', 'Project deleted', 'success');
    } catch (error) {
      set({ todoProjects: previousProjects, todoTasks: previousTasks });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete project'), 'error');
      throw error;
    }
  },
  
  addTodoTask: async (task) => {
    if (shouldThrottle('addTodoTask')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().todoTasks;
    set((state) => ({ todoTasks: [task, ...state.todoTasks] }));
    try {
      const savedInDb = await todoTaskService.create(uid, task);
      const location = savedInDb ? 'Database' : 'Local Storage';
      useToastStore.getState().addToast('Success', `Task saved to ${location}`, 'success');
    } catch (error) {
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create task'), 'error');
      throw error;
    }
  },
  
  updateTodoTask: async (id, data) => {
    set((state) => ({
      todoTasks: state.todoTasks.map(t => t.id === id ? { ...t, ...data } : t),
    }));
    await todoTaskService.update(id, data);
  },
  
  deleteTodoTask: async (id) => {
    const task = get().todoTasks.find(t => t.id === id);
    if (!task) return;

    if (task.deleted) {
      set((state) => ({ todoTasks: state.todoTasks.filter(t => t.id !== id) }));
      await todoTaskService.delete(id);
      useToastStore.getState().addToast('Success', 'Task deleted permanently', 'success');
    } else {
      const previous = get().todoTasks;
      set((state) => ({
        todoTasks: state.todoTasks.map(t => t.id === id ? { ...t, deleted: true } : t)
      }));
      try {
        await todoTaskService.update(id, { deleted: true });
        useToastStore.getState().addToast('Success', 'Task moved to Trash', 'success');
      } catch (error) {
        set({ todoTasks: previous });
        useToastStore.getState().addToast('Sync Failed', 'Could not move task to Trash', 'error');
      }
    }
  },

  restoreTodoTask: async (id) => {
    const previous = get().todoTasks;
    set((state) => ({
      todoTasks: state.todoTasks.map(t => t.id === id ? { ...t, deleted: false } : t)
    }));
    try {
      await todoTaskService.update(id, { deleted: false });
      useToastStore.getState().addToast('Success', 'Task restored', 'success');
    } catch (error) {
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', 'Could not restore task', 'error');
    }
  },

  emptyTodoTrash: async () => {
    const trashTasks = get().todoTasks.filter(t => t.deleted);
    if (trashTasks.length === 0) return;

    const previous = get().todoTasks;
    set((state) => ({ todoTasks: state.todoTasks.filter(t => !t.deleted) }));

    try {
      await Promise.all(trashTasks.map(t => todoTaskService.delete(t.id)));
      useToastStore.getState().addToast('Success', 'Trash emptied', 'success');
    } catch (error) {
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', 'Could not empty Trash', 'error');
    }
  },

  addJournalEntry: async (entry) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().journals;
    const next = [entry, ...previous];
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    try {
      await journalService.create(uid, entry);
      useToastStore.getState().addToast('Success', 'Journal entry saved', 'success');
    } catch (error) {
      localStorage.setItem('phq_journals', JSON.stringify(previous));
      set({ journals: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save journal entry'), 'error');
      throw error;
    }
  },
  updateJournalEntry: async (id, data) => {
    const previous = get().journals;
    const next = previous.map((j) => (j.id === id ? { ...j, ...data } : j));
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    try {
      await journalService.update(id, data);
      useToastStore.getState().addToast('Success', 'Journal entry updated', 'success');
    } catch (error) {
      localStorage.setItem('phq_journals', JSON.stringify(previous));
      set({ journals: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update journal entry'), 'error');
      throw error;
    }
  },
  deleteJournalEntry: async (id) => {
    const previous = get().journals;
    const next = previous.filter((j) => j.id !== id);
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    try {
      await journalService.delete(id);
      useToastStore.getState().addToast('Success', 'Journal entry deleted', 'success');
    } catch (error) {
      localStorage.setItem('phq_journals', JSON.stringify(previous));
      set({ journals: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete journal entry'), 'error');
      throw error;
    }
  },

  addMindmap: async (mindmap) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().mindmaps;
    const next = [mindmap, ...previous];
    localStorage.setItem('phq_mindmaps', JSON.stringify(next));
    set({ mindmaps: next });
    try {
      await mindmapService.create(uid, mindmap);
      useToastStore.getState().addToast('Success', 'Mindmap created', 'success');
    } catch (error) {
      localStorage.setItem('phq_mindmaps', JSON.stringify(previous));
      set({ mindmaps: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save mindmap'), 'error');
      throw error;
    }
  },
  updateMindmap: async (id, data) => {
    const previous = get().mindmaps;
    const next = previous.map((m) => (m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m));
    localStorage.setItem('phq_mindmaps', JSON.stringify(next));
    set({ mindmaps: next });
    try {
      await mindmapService.update(id, data);
    } catch (error) {
      localStorage.setItem('phq_mindmaps', JSON.stringify(previous));
      set({ mindmaps: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save mindmap edits'), 'error');
      throw error;
    }
  },
  deleteMindmap: async (id) => {
    const previous = get().mindmaps;
    const next = previous.filter((m) => m.id !== id);
    localStorage.setItem('phq_mindmaps', JSON.stringify(next));
    set({ mindmaps: next });
    try {
      await mindmapService.delete(id);
      useToastStore.getState().addToast('Success', 'Mindmap deleted', 'success');
    } catch (error) {
      localStorage.setItem('phq_mindmaps', JSON.stringify(previous));
      set({ mindmaps: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete mindmap'), 'error');
      throw error;
    }
  },

  importData: (data) =>
    set((state) => {
      const nextState = { ...state, ...data };
      if (data.settings) {
        localStorage.setItem('settings', JSON.stringify(nextState.settings));
      }
      if (data.journals) {
        localStorage.setItem('phq_journals', JSON.stringify(nextState.journals));
      }
      return nextState;
    }),
}));
