import { type StateCreator } from 'zustand';
import { type AppStore, type Theme, type AppSettings, type TodoTask, type TilLog } from '../types';
import {
  settingsService,
  noteService,
  linkService,
  stockService,
  interestService,
  mediaService,
  countdownService,
  snippetService,
  todoProjectService,
  todoTaskService,
  journalService,
  mindmapService,
  standardCalcService,
  habitService,
  tilLogService,
  journalStickyNoteService,
  tagService,
  visionService,
  visionBoardService,
  projectStructureService,
} from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { sanitizeActiveModule, loadStoredSettings } from '../helpers';
import { clearRestCache } from '../../lib/supabase';
import { queryClient } from '../../lib/queryClient';
import { safeSetItem } from '../../utils/storage';
import { loadInitialBoards } from './visionSeedData';

export interface CoreSlice {
  activeModule: string;
  setActiveModule: (module: string) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;

  mediaEntryModal: {
    isOpen: boolean;
    editingLog: any | null;
    activeTab: 'ANIME' | 'MOVIE' | 'GAME' | 'SERIES';
  };
  openMediaEntryModal: (
    tab: 'ANIME' | 'MOVIE' | 'GAME' | 'SERIES',
    log?: any | null,
  ) => void;
  closeMediaEntryModal: () => void;

  todoProjectModal: {
    isOpen: boolean;
  };
  openTodoProjectModal: () => void;
  closeTodoProjectModal: () => void;

  todoTaskModal: {
    isOpen: boolean;
    task: TodoTask | null;
  };
  openTodoTaskModal: (task?: TodoTask | null) => void;
  closeTodoTaskModal: () => void;

  dataLoaded: boolean;
  isSyncing: boolean;
  loadAllData: (userId: string) => Promise<void>;
  forceSync: (userId: string) => Promise<void>;
  clearAllData: () => void;

  drawingElements: readonly any[];
  drawingAppState: any;
  setDrawingData: (elements: readonly any[], appState: any) => void;

  addTilLog: (log: TilLog) => void;
  deleteTilLog: (id: string) => void;
  importData: (data: any) => void;

  activeFocusItem: { type: 'todo' | 'habit'; id: string; title: string } | null;
  setActiveFocusItem: (
    item: { type: 'todo' | 'habit'; id: string; title: string } | null,
  ) => void;
}

export const createCoreSlice: StateCreator<AppStore, [], [], CoreSlice> = (set, get) => ({
  activeModule: (() => {
    try {
      const stored = localStorage.getItem('phq_active_module');
      return sanitizeActiveModule(stored || 'dashboard');
    } catch {
      return 'dashboard';
    }
  })(),
  setActiveModule: (module) => {
    const validModule = sanitizeActiveModule(module);
    try {
      localStorage.setItem('phq_active_module', validModule);
    } catch {
      // Ignore
    }
    set({ activeModule: validModule });
  },

  theme: (() => {
    try {
      const stored = localStorage.getItem('phq_theme');
      return (stored as Theme) || 'system';
    } catch {
      return 'system';
    }
  })(),
  setTheme: (theme) => {
    try {
      localStorage.setItem('phq_theme', theme);
    } catch {
      // Ignore
    }
    set({ theme });
    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      settingsService.upsert(uid, { theme }).catch((e: any) =>
        console.error('Failed to sync theme to DB:', e),
      );
    }
  },

  settings: loadStoredSettings(),
  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    safeSetItem('phq_settings', JSON.stringify(updated));
    set({ settings: updated });
    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      settingsService.upsert(uid, updated).catch((e: any) =>
        console.error('Failed to sync settings to DB:', e),
      );
    }
  },

  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },
  showConfirm: (title, message, onConfirm) =>
    set({ confirmDialog: { isOpen: true, title, message, onConfirm } }),
  closeConfirm: () =>
    set({
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
      },
    }),

  mediaEntryModal: {
    isOpen: false,
    editingLog: null,
    activeTab: 'ANIME',
  },
  openMediaEntryModal: (tab, log = null) =>
    set({ mediaEntryModal: { isOpen: true, activeTab: tab, editingLog: log } }),
  closeMediaEntryModal: () =>
    set({ mediaEntryModal: { isOpen: false, editingLog: null, activeTab: 'ANIME' } }),

  todoProjectModal: {
    isOpen: false,
  },
  openTodoProjectModal: () => set({ todoProjectModal: { isOpen: true } }),
  closeTodoProjectModal: () => set({ todoProjectModal: { isOpen: false } }),

  todoTaskModal: {
    isOpen: false,
    task: null,
  },
  openTodoTaskModal: (task = null) =>
    set({ todoTaskModal: { isOpen: true, task: task || null } }),
  closeTodoTaskModal: () =>
    set({ todoTaskModal: { isOpen: false, task: null } }),

  dataLoaded: false,
  isSyncing: false,

  loadAllData: async (userId: string) => {
    set({ isSyncing: true });

    try {
      const results = await Promise.allSettled([
        noteService.fetchAll(userId),
        linkService.fetchAll(userId),
        stockService.fetchAll(userId),
        interestService.fetchAll(userId),
        mediaService.fetchAll(userId),
        countdownService.fetchAll(userId),
        snippetService.fetchAll(userId),
        todoProjectService.fetchAll(userId),
        todoTaskService.fetchAll(userId),
        journalService.fetchAll(userId),
        mindmapService.fetchAll(userId),
        standardCalcService.fetchAll(userId),
        habitService.fetchAll(userId),
        settingsService.fetch(userId),
        tilLogService.fetchAll(userId),
        journalStickyNoteService.fetchAll(userId),
        tagService.fetchAll(userId),
        visionService.fetchAll(userId),
        projectStructureService.fetchAll(userId),
        visionBoardService.fetchAll(userId),
      ]);

      const notes = results[0].status === 'fulfilled' ? results[0].value : [];
      const links = results[1].status === 'fulfilled' ? results[1].value : [];
      const stocks = results[2].status === 'fulfilled' ? results[2].value : [];
      const interestHistory =
        results[3].status === 'fulfilled' ? results[3].value : [];
      const mediaLogs =
        results[4].status === 'fulfilled' ? results[4].value : [];
      const countdowns =
        results[5].status === 'fulfilled' ? results[5].value : [];
      const snippets = results[6].status === 'fulfilled' ? results[6].value : [];
      const todoProjects =
        results[7].status === 'fulfilled' ? results[7].value : [];
      const todoTasks =
        results[8].status === 'fulfilled' ? results[8].value : [];
      const journals =
        results[9].status === 'fulfilled' ? (results[9].value as any[]) : [];
      const mindmaps =
        results[10].status === 'fulfilled' ? (results[10].value as any[]) : [];
      const standardHistory =
        results[11].status === 'fulfilled' ? (results[11].value as any[]) : [];
      const habits =
        results[12].status === 'fulfilled' ? (results[12].value as any[]) : [];
      const settingsResult =
        results[13].status === 'fulfilled' ? results[13].value : null;
      const tilLogs =
        results[14].status === 'fulfilled' ? (results[14].value as any[]) : [];
      const journalStickyNotes =
        results[15].status === 'fulfilled' ? (results[15].value as any[]) : [];
      const appTags =
        results[16].status === 'fulfilled' ? (results[16].value as any[]) : [];
      const visions =
        results[17].status === 'fulfilled' ? (results[17].value as any[]) : [];
      const projectStructures =
        results[18].status === 'fulfilled' &&
        (results[18].value as any[]).length > 0
          ? (results[18].value as any[])
          : get().projectStructures;
      const visionBoards =
        results[19].status === 'fulfilled' &&
        Array.isArray(results[19].value) &&
        (results[19].value as any[]).length > 0
          ? (results[19].value as any[])
          : (get() as any).visionBoards && (get() as any).visionBoards.length > 0
          ? (get() as any).visionBoards
          : loadInitialBoards();

      if (visionBoards && visionBoards.length > 0) {
        safeSetItem('phq_vision_boards', JSON.stringify(visionBoards));
      }

      let dbSettings = get().settings;
      let dbTheme = get().theme;
      let dbActiveFocusItem = (get() as any).activeFocusItem;

      if (settingsResult) {
        dbTheme = (settingsResult.theme as Theme) || dbTheme;
        dbSettings = {
          ...dbSettings,
          countdownTemplate:
            settingsResult.countdown_template || dbSettings.countdownTemplate,
          accentColor: settingsResult.accent_color || dbSettings.accentColor,
          animationSpeed:
            settingsResult.animation_speed || dbSettings.animationSpeed,
          compactMode:
            settingsResult.compact_mode !== undefined
              ? settingsResult.compact_mode
              : dbSettings.compactMode,
          soundEnabled:
            settingsResult.sound_enabled !== undefined
              ? settingsResult.sound_enabled
              : dbSettings.soundEnabled,
          initialBankBalance:
            settingsResult.initial_bank_balance !== undefined
              ? settingsResult.initial_bank_balance
              : dbSettings.initialBankBalance,
          initialCashBalance:
            settingsResult.initial_cash_balance !== undefined
              ? settingsResult.initial_cash_balance
              : dbSettings.initialCashBalance,
          currencySymbol:
            settingsResult.currency_symbol || dbSettings.currencySymbol,
          mediaQuote: settingsResult.media_quote || dbSettings.mediaQuote,
          clockStyle: settingsResult.clock_style || dbSettings.clockStyle,
          performanceMode:
            settingsResult.performance_mode || dbSettings.performanceMode,
          reduceBlur:
            settingsResult.reduce_blur !== undefined
              ? settingsResult.reduce_blur
              : dbSettings.reduceBlur,
          reduceAnimations:
            settingsResult.reduce_animations !== undefined
              ? settingsResult.reduce_animations
              : dbSettings.reduceAnimations,
          wavyEffectEnabled:
            settingsResult.wavy_effect_enabled !== undefined
              ? settingsResult.wavy_effect_enabled
              : dbSettings.wavyEffectEnabled,
          geminiApiKey:
            settingsResult.gemini_api_key || dbSettings.geminiApiKey,
          geminiModel:
            settingsResult.gemini_model || dbSettings.geminiModel,
          aiPersona: settingsResult.ai_persona || dbSettings.aiPersona,
        };
        if (settingsResult.active_focus_item) {
          dbActiveFocusItem = settingsResult.active_focus_item;
        }
      }

      set({
        notes,
        links,
        stocks,
        interestHistory,
        mediaLogs,
        countdowns,
        snippets,
        todoProjects,
        todoTasks,
        journals,
        mindmaps,
        standardHistory,
        habits,
        tilLogs,
        journalStickyNotes,
        appTags,
        visions,
        projectStructures,
        visionBoards,
        theme: dbTheme,
        settings: dbSettings,
        activeFocusItem: dbActiveFocusItem,
        dataLoaded: true,
        isSyncing: false,
      } as any);
    } catch (err) {
      console.error('Error loading data:', err);
      set({ isSyncing: false });
    }
  },

  forceSync: async (userId: string) => {
    await clearRestCache();
    await get().loadAllData(userId);
  },

  clearAllData: () => {
    localStorage.removeItem('phq_active_focus_item');
    clearRestCache().catch((e: any) =>
      console.error('[Cache] Failed to clear rest cache:', e),
    );
    queryClient.clear();
    set({
      notes: [],
      links: [],
      stocks: [],
      interestHistory: [],
      mediaLogs: [],
      countdowns: [],
      snippets: [],
      todoProjects: [],
      todoTasks: [],
      journals: [],
      mindmaps: [],
      standardHistory: [],
      habits: [],
      tilLogs: [],
      journalStickyNotes: [],
      appTags: [],
      visions: [],
      projectStructures: [],
      visionBoards: loadInitialBoards(),
      dataLoaded: false,
      isSyncing: false,
    } as any);
  },

  drawingElements: [],
  drawingAppState: {},
  setDrawingData: (elements, appState) =>
    set({ drawingElements: elements, drawingAppState: appState }),

  addTilLog: async (log: TilLog) => {
    const current = (get() as any).tilLogs || [];
    set({ tilLogs: [log, ...current] } as any);
    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      tilLogService.create(uid, log).catch((e: any) =>
        console.error('Failed to create tilLog in db:', e),
      );
    }
  },

  deleteTilLog: async (id: string) => {
    const current = ((get() as any).tilLogs || []).filter(
      (l: TilLog) => l.id !== id,
    );
    set({ tilLogs: current } as any);
    tilLogService.delete(id).catch((e: any) =>
      console.error('Failed to delete tilLog in db:', e),
    );
  },

  importData: (imported: any) => {
    if (!imported) return;
    set({
      ...(imported.notes && { notes: imported.notes }),
      ...(imported.links && { links: imported.links }),
      ...(imported.stocks && { stocks: imported.stocks }),
      ...(imported.interestHistory && { interestHistory: imported.interestHistory }),
      ...(imported.mediaLogs && { mediaLogs: imported.mediaLogs }),
      ...(imported.countdowns && { countdowns: imported.countdowns }),
      ...(imported.snippets && { snippets: imported.snippets }),
      ...(imported.todoProjects && { todoProjects: imported.todoProjects }),
      ...(imported.todoTasks && { todoTasks: imported.todoTasks }),
      ...(imported.journals && { journals: imported.journals }),
      ...(imported.mindmaps && { mindmaps: imported.mindmaps }),
      ...(imported.standardHistory && { standardHistory: imported.standardHistory }),
      ...(imported.habits && { habits: imported.habits }),
      ...(imported.tilLogs && { tilLogs: imported.tilLogs }),
      ...(imported.settings && { settings: imported.settings }),
      ...(imported.theme && { theme: imported.theme }),
    } as any);
  },

  activeFocusItem: null,
  setActiveFocusItem: (item) => {
    if (item) {
      localStorage.setItem('phq_active_focus_item', JSON.stringify(item));
    } else {
      localStorage.removeItem('phq_active_focus_item');
    }
    set({ activeFocusItem: item });
    const uid = useAuthStore.getState().user?.id;
    if (uid) {
      settingsService
        .upsert(uid, { active_focus_item: item })
        .catch((e: any) => console.error('Failed to sync activeFocusItem:', e));
    }
  },
});
