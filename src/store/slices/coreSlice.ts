import { type StateCreator } from 'zustand';
import { type AppStore, type Theme } from '../types';
import {
  settingsService,
  noteService,
  linkService,
  stockService,
  subjectService,
  interestService,
  mediaService,
  countdownService,
  snippetService,
  budgetCategoryService,
  budgetTransactionService,
  todoProjectService,
  todoTaskService,
  journalService,
  mindmapService,
  standardCalcService,
  habitService,
  sprintService,
  dsaProblemService,
  tilLogService,
  roadmapService,
  resourceService,
  devGoalService,
  journalStickyNoteService
} from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { sanitizeActiveModule, loadStoredSettings } from '../helpers';

export interface CoreSlice {
  activeModule: string;
  setActiveModule: (module: string) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  settings: any; // AppSettings
  updateSettings: (settings: any) => void;

  confirmDialog: any; // ConfirmDialogState
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;

  mediaEntryModal: any; // MediaEntryModalState
  openMediaEntryModal: (tab: 'ANIME' | 'GAME', log?: any) => void;
  closeMediaEntryModal: () => void;

  todoProjectModal: { isOpen: boolean };
  openTodoProjectModal: () => void;
  closeTodoProjectModal: () => void;

  todoTaskModal: any; // TodoTaskModalState
  openTodoTaskModal: (task?: any) => void;
  closeTodoTaskModal: () => void;

  dataLoaded: boolean;
  loadAllData: (userId: string) => Promise<void>;
  clearAllData: () => void;

  drawingElements: readonly any[];
  drawingAppState: any;
  setDrawingData: (elements: readonly any[], appState: any) => void;

  importData: (data: any) => void;
}

export const createCoreSlice: StateCreator<
  AppStore,
  [],
  [],
  CoreSlice
> = (set, get) => ({
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
    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      settingsService.upsert(uid, { theme }).catch((e) => console.error('Failed to sync theme:', e));
    }
  },

  settings: loadStoredSettings(),
  updateSettings: (newSettings) =>
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      localStorage.setItem('settings', JSON.stringify(settings));
      const uid = useAuthStore.getState().user?.id;
      if (uid) {
        settingsService.upsert(uid, {
          countdown_template: settings.countdownTemplate,
          accent_color: settings.accentColor,
          animation_speed: settings.animationSpeed,
          compact_mode: settings.compactMode,
          sound_enabled: settings.soundEnabled,
          initial_bank_balance: settings.initialBankBalance,
          initial_cash_balance: settings.initialCashBalance,
          currency_symbol: settings.currencySymbol || '$',
          media_quote: settings.mediaQuote || '',
          reduce_blur: settings.reduceBlur,
          reduce_animations: settings.reduceAnimations,
        }).catch((e) => console.error('Failed to sync settings:', e));
      }
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
      habitService.fetchAll(userId),
      settingsService.fetch(userId),
      sprintService.fetchAll(userId),
      dsaProblemService.fetchAll(userId),
      tilLogService.fetchAll(userId),
      roadmapService.fetchAll(userId),
      resourceService.fetchAll(userId),
      devGoalService.fetchAll(userId),
      journalStickyNoteService.fetchAll(userId),
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
      'habits',
      'user settings',
      'sprints',
      'dsa problems',
      'til logs',
      'roadmaps',
      'resources',
      'dev goals',
      'journal sticky notes',
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
    const habits = results[15].status === 'fulfilled' ? results[15].value as any[] : [];
    const settingsResult = results[16].status === 'fulfilled' ? results[16].value : null;
    const sprints = results[17].status === 'fulfilled' ? results[17].value as any[] : [];
    const dsaProblems = results[18].status === 'fulfilled' ? results[18].value as any[] : [];
    const tilLogs = results[19].status === 'fulfilled' ? results[19].value as any[] : [];
    const roadmaps = results[20].status === 'fulfilled' ? results[20].value as any[] : [];
    const resources = results[21].status === 'fulfilled' ? results[21].value as any[] : [];
    const devGoals = results[22].status === 'fulfilled' ? results[22].value as any[] : [];
    const journalStickyNotes = results[23].status === 'fulfilled' ? results[23].value as any[] : [];

    if (failedServices.length > 0) {
      console.warn('Supabase sync skipped some modules:', failedServices);
      useToastStore.getState().addToast(
        'Partial Sync',
        `Some modules could not refresh: ${failedServices.join(', ')}`,
        'warning'
      );
    }

    let dbSettings = get().settings;
    let dbTheme = get().theme;

    if (settingsResult) {
      dbTheme = (settingsResult.theme as Theme) || dbTheme;
      dbSettings = {
        countdownTemplate: settingsResult.countdown_template || dbSettings.countdownTemplate,
        accentColor: settingsResult.accent_color || dbSettings.accentColor,
        animationSpeed: settingsResult.animation_speed || dbSettings.animationSpeed,
        compactMode: settingsResult.compact_mode !== undefined ? settingsResult.compact_mode : dbSettings.compactMode,
        soundEnabled: settingsResult.sound_enabled !== undefined ? settingsResult.sound_enabled : dbSettings.soundEnabled,
        initialBankBalance: settingsResult.initial_bank_balance !== undefined ? Number(settingsResult.initial_bank_balance) : dbSettings.initialBankBalance,
        initialCashBalance: settingsResult.initial_cash_balance !== undefined ? Number(settingsResult.initial_cash_balance) : dbSettings.initialCashBalance,
        currencySymbol: settingsResult.currency_symbol || dbSettings.currencySymbol || '$',
        mediaQuote: settingsResult.media_quote || dbSettings.mediaQuote || 'Outdo your yesterday.',
        reduceBlur: settingsResult.reduce_blur !== undefined ? settingsResult.reduce_blur : dbSettings.reduceBlur,
        reduceAnimations: settingsResult.reduce_animations !== undefined ? settingsResult.reduce_animations : dbSettings.reduceAnimations,
      };
      
      localStorage.setItem('theme', dbTheme);
      localStorage.setItem('settings', JSON.stringify(dbSettings));
    } else {
      settingsService.upsert(userId, {
        theme: dbTheme,
        countdown_template: dbSettings.countdownTemplate,
        accent_color: dbSettings.accentColor,
        animation_speed: dbSettings.animationSpeed,
        compact_mode: dbSettings.compactMode,
        sound_enabled: dbSettings.soundEnabled,
        initial_bank_balance: dbSettings.initialBankBalance,
        initial_cash_balance: dbSettings.initialCashBalance,
        currency_symbol: dbSettings.currencySymbol || '$',
        media_quote: dbSettings.mediaQuote || 'Outdo your yesterday.',
        reduce_blur: dbSettings.reduceBlur,
        reduce_animations: dbSettings.reduceAnimations,
      }).catch((e) => console.error('Failed to initialize settings:', e));
    }

    if (results[12].status === 'fulfilled') {
      localStorage.setItem('phq_journals', JSON.stringify(journals));
    }
    if (results[13].status === 'fulfilled') {
      localStorage.setItem('phq_mindmaps', JSON.stringify(mindmaps));
    }
    if (results[15].status === 'fulfilled') {
      localStorage.setItem('phq_habits', JSON.stringify(habits));
    }
    if (results[17].status === 'fulfilled') {
      localStorage.setItem('phq_sprints', JSON.stringify(sprints));
    }
    if (results[18].status === 'fulfilled') {
      localStorage.setItem('phq_dsa_problems', JSON.stringify(dsaProblems));
    }
    if (results[19].status === 'fulfilled') {
      localStorage.setItem('phq_til_logs', JSON.stringify(tilLogs));
    }
    if (results[20].status === 'fulfilled') {
      localStorage.setItem('phq_roadmaps', JSON.stringify(roadmaps));
    }
    if (results[21].status === 'fulfilled') {
      localStorage.setItem('phq_resources', JSON.stringify(resources));
    }
    if (results[22].status === 'fulfilled') {
      localStorage.setItem('phq_dev_goals', JSON.stringify(devGoals));
    }
    if (results[23].status === 'fulfilled') {
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(journalStickyNotes));
    }

    set({
      notes, links, stocks, subjects, interestHistory, mediaLogs, countdowns, snippets,
      budgetCategories, budgetTransactions, todoProjects, todoTasks, journals, mindmaps, standardHistory, habits,
      sprints, dsaProblems, tilLogs, roadmaps, resources, devGoals, journalStickyNotes,
      theme: dbTheme,
      settings: dbSettings,
      dataLoaded: true
    } as any);
  },

  clearAllData: () =>
    set({
      notes: [], links: [], stocks: [], subjects: [],
      interestHistory: [], mediaLogs: [], countdowns: [],
      snippets: [], budgetCategories: [], budgetTransactions: [],
      todoProjects: [], todoTasks: [], journals: [], mindmaps: [], standardHistory: [], habits: [],
      sprints: [], dsaProblems: [], tilLogs: [], roadmaps: [], resources: [], devGoals: [],
      journalStickyNotes: [], activeFocusItem: null,
      dataLoaded: false,
    } as any),

  drawingElements: [],
  drawingAppState: {},
  setDrawingData: (elements, appState) => set({ drawingElements: elements, drawingAppState: appState }),

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
});
