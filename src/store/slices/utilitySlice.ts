import { type StateCreator } from 'zustand';
import {
  type AppStore,
  type Note,
  type Link,
  type SavedLink,
  type AppTag,
  type StockEntry,
  type InterestRecord,
  type StandardCalculation,
  type MediaLog,
  type Countdown,
  type CodeSnippet,
  type PomodoroStats
} from '../types';
import {
  noteService,
  linkService,
  linkSaverService,
  tagService,
  stockService,
  interestService,
  standardCalcService,
  mediaService,
  countdownService,
  snippetService
} from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import {
  notifyPomodoroCompletion,
  requestPomodoroNotificationPermission,
  showPomodoroDesktopNotification,
  type PomodoroCompletionNotification
} from '../../utils/pomodoroNotifications';

export interface UtilitySlice {
  notes: Note[];
  addNote: (note: Note, userId?: string) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>, silent?: boolean) => Promise<void>;
  updateNoteLocally: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => Promise<void>;

  links: Link[];
  addLink: (link: Link, userId?: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;

  savedLinks: SavedLink[];
  addSavedLink: (link: SavedLink) => Promise<void>;
  deleteSavedLink: (id: string) => Promise<void>;

  appTags: AppTag[];
  addAppTag: (tag: AppTag) => Promise<void>;
  updateAppTag: (id: string, updates: Partial<Omit<AppTag, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAppTag: (id: string) => Promise<void>;

  stocks: StockEntry[];
  addStock: (entry: StockEntry, userId?: string) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;

  interestHistory: InterestRecord[];
  addInterestRecord: (record: InterestRecord, userId?: string) => Promise<void>;
  deleteInterestRecord: (id: string) => Promise<void>;

  standardHistory: StandardCalculation[];
  addStandardRecord: (record: StandardCalculation) => Promise<void>;
  clearStandardHistory: () => Promise<void>;

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
  skipGlobalPomodoro: () => void;
}

export let globalPomodoroInterval: any = null;
export let globalPomodoroWorker: Worker | null = null;
export let globalPomodoroStartTime: number = 0;
export let globalPomodoroSecondsAtStart: number = 0;
export let globalPomodoroTick: (() => void) | null = null;

const startTimer = (tickFn: () => void) => {
  try {
    if (!globalPomodoroWorker) {
      const workerCode = `
        let intervalId = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      globalPomodoroWorker = new Worker(URL.createObjectURL(blob));
    }
    globalPomodoroWorker.onmessage = () => {
      tickFn();
    };
    globalPomodoroWorker.postMessage('start');
  } catch (e) {
    console.warn('Web Worker not supported or failed to load, falling back to setInterval', e);
    if (globalPomodoroInterval) clearInterval(globalPomodoroInterval);
    globalPomodoroInterval = setInterval(tickFn, 1000);
  }
};

const stopTimer = () => {
  if (globalPomodoroWorker) {
    globalPomodoroWorker.postMessage('stop');
  }
  if (globalPomodoroInterval) {
    clearInterval(globalPomodoroInterval);
    globalPomodoroInterval = null;
  }
};

const syncPomodoroStateToLocalStorage = (state: any) => {
  if (typeof window === 'undefined') return;
  const payload = {
    pomodoroSecondsLeft: state.pomodoroSecondsLeft,
    pomodoroTotalSeconds: state.pomodoroTotalSeconds,
    pomodoroTimerState: state.pomodoroTimerState,
    pomodoroSessionId: state.pomodoroSessionId,
    pomodoroStreak: state.pomodoroStreak,
    pomodoroAssociatedTaskId: state.pomodoroAssociatedTaskId,
    globalPomodoroStartTime,
    globalPomodoroSecondsAtStart,
    timestamp: Date.now()
  };
  localStorage.setItem('focusflow_pomodoro_sync_state', JSON.stringify(payload));
};

export const syncPomodoroFromStorage = (payload: any, set: any, get: any) => {
  if (typeof window === 'undefined') return;

  globalPomodoroStartTime = payload.globalPomodoroStartTime;
  globalPomodoroSecondsAtStart = payload.globalPomodoroSecondsAtStart;

  set({
    pomodoroSecondsLeft: payload.pomodoroSecondsLeft,
    pomodoroTotalSeconds: payload.pomodoroTotalSeconds,
    pomodoroTimerState: payload.pomodoroTimerState,
    pomodoroSessionId: payload.pomodoroSessionId,
    pomodoroStreak: payload.pomodoroStreak,
    pomodoroAssociatedTaskId: payload.pomodoroAssociatedTaskId,
  });

  if (payload.pomodoroTimerState === 'running') {
    stopTimer();

    const tick = () => {
      const { 
        pomodoroSessionId, 
        pomodoroStreak, 
        pomodoroAssociatedTaskId, 
        todoTasks, 
        updateTodoTask, 
        recordPomodoroSession, 
        pomodoroTotalSeconds 
      } = get();

      const elapsedMs = Date.now() - globalPomodoroStartTime;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const secondsLeft = Math.max(0, globalPomodoroSecondsAtStart - elapsedSecs);

      if (secondsLeft <= 0) {
        stopTimer();
        globalPomodoroTick = null;
        set({ pomodoroTimerState: 'idle', pomodoroSecondsLeft: 0 });

        const addToast = useToastStore.getState().addToast;
        let completionNotification: PomodoroCompletionNotification;

        if (pomodoroSessionId === 'focus') {
          const nextStreak = pomodoroStreak + 1;
          set({ pomodoroStreak: nextStreak });
          recordPomodoroSession(Math.round(pomodoroTotalSeconds / 60));

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { detail: { type: 'pomodoro' } }));
          }

          if (pomodoroAssociatedTaskId) {
            if (pomodoroAssociatedTaskId.startsWith('habit-')) {
              const habitId = pomodoroAssociatedTaskId.replace('habit-', '');
              const matchedHabit = (get().habits as any[]).find((h: any) => h.id === habitId);
              if (matchedHabit) {
                const todayStr = new Date().toISOString().split('T')[0];
                get().toggleHabitCompletion(habitId, todayStr);
                addToast('🔥 Habit Completed', `Completed Pomodoro session for "${matchedHabit.name}"`, 'success');
              }
            } else {
              const matchedTask = (todoTasks as any[]).find((t: any) => t.id === pomodoroAssociatedTaskId);
              if (matchedTask) {
                updateTodoTask(pomodoroAssociatedTaskId, {
                  pomodoroCount: (matchedTask.pomodoroCount || 0) + 1
                });
                addToast('🍅 Session Logged', `Logged focus session to "${matchedTask.title}"`, 'success');
              }
            }
          } else {
            addToast('🎉 Focus Complete!', 'Great work! Time for a break.', 'success');
          }

          completionNotification = {
            id: crypto.randomUUID(),
            sessionId: pomodoroSessionId,
            title: 'Focus Complete',
            subtitle: 'Great work. Break starts now.',
            icon: 'confetti',
            variant: 'success',
            timestamp: Date.now(),
          };

          const nextSid = nextStreak % 4 === 0 ? 'long-break' : 'short-break';
          const breakMins = nextSid === 'short-break' ? 5 : 15;
          set({ 
            pomodoroSessionId: nextSid, 
            pomodoroSecondsLeft: breakMins * 60,
            pomodoroTotalSeconds: breakMins * 60
          });
        } else {
          addToast('⏰ Break Over!', 'Ready to focus again? 🚀', 'info');

          completionNotification = {
            id: crypto.randomUUID(),
            sessionId: pomodoroSessionId,
            title: 'Break Complete',
            subtitle: 'Ready to focus again?',
            icon: 'award',
            variant: 'achievement',
            timestamp: Date.now(),
          };

          set({ 
            pomodoroSessionId: 'focus', 
            pomodoroSecondsLeft: 25 * 60,
            pomodoroTotalSeconds: 25 * 60
          });
        }

        notifyPomodoroCompletion(completionNotification);
        showPomodoroDesktopNotification(completionNotification);

        // Sync completed/next state
        const nextState = get();
        const nextPayload = {
          pomodoroSecondsLeft: nextState.pomodoroSecondsLeft,
          pomodoroTotalSeconds: nextState.pomodoroTotalSeconds,
          pomodoroTimerState: nextState.pomodoroTimerState,
          pomodoroSessionId: nextState.pomodoroSessionId,
          pomodoroStreak: nextState.pomodoroStreak,
          pomodoroAssociatedTaskId: nextState.pomodoroAssociatedTaskId,
          globalPomodoroStartTime: 0,
          globalPomodoroSecondsAtStart: nextState.pomodoroSecondsLeft,
          timestamp: Date.now()
        };
        localStorage.setItem('focusflow_pomodoro_sync_state', JSON.stringify(nextPayload));
      } else {
        set({ pomodoroSecondsLeft: secondsLeft });
      }
    };

    globalPomodoroTick = tick;
    startTimer(tick);
  } else {
    stopTimer();
    globalPomodoroTick = null;
  }
};

export const createUtilitySlice: StateCreator<
  AppStore,
  [],
  [],
  UtilitySlice
> = (set, get) => {
  // Load initial values from localStorage
  let initialSecondsLeft = 25 * 60;
  let initialTotalSeconds = 25 * 60;
  let initialTimerState: 'idle' | 'running' | 'paused' = 'idle';
  let initialSessionId: 'focus' | 'short-break' | 'long-break' = 'focus';
  let initialStreak = 0;
  let initialAssociatedTaskId: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('focusflow_pomodoro_sync_state');
      if (raw) {
        const payload = JSON.parse(raw);
        initialSecondsLeft = payload.pomodoroSecondsLeft;
        initialTotalSeconds = payload.pomodoroTotalSeconds;
        initialTimerState = payload.pomodoroTimerState;
        initialSessionId = payload.pomodoroSessionId;
        initialStreak = payload.pomodoroStreak;
        initialAssociatedTaskId = payload.pomodoroAssociatedTaskId;
        
        if (initialTimerState === 'running') {
          globalPomodoroStartTime = payload.globalPomodoroStartTime;
          globalPomodoroSecondsAtStart = payload.globalPomodoroSecondsAtStart;
          const elapsed = Math.floor((Date.now() - globalPomodoroStartTime) / 1000);
          initialSecondsLeft = Math.max(0, globalPomodoroSecondsAtStart - elapsed);
        }
      }
    } catch (e) {
      console.error('Failed to restore initial pomodoro state:', e);
    }
  }

  // Restore ticking on start if running
  if (typeof window !== 'undefined' && initialTimerState === 'running' && initialSecondsLeft > 0) {
    setTimeout(() => {
      const raw = localStorage.getItem('focusflow_pomodoro_sync_state');
      if (raw) {
        try {
          const payload = JSON.parse(raw);
          syncPomodoroFromStorage(payload, set, get);
        } catch {}
      }
    }, 150);
  }

  return {
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
  updateNote: async (id, data, silent = false) => {
    const previous = get().notes;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
    try {
      await noteService.update(id, data);
      if (!silent) {
        useToastStore.getState().addToast('Success', 'Note updated', 'success');
      }
    } catch (error) {
      set({ notes: previous });
      if (!silent) {
        useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update note'), 'error');
      }
      throw error;
    }
  },
  updateNoteLocally: (id: string, data: Partial<Note>) => {
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
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

  links: (() => {
    try {
      const stored = localStorage.getItem('phq_links');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
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

  savedLinks: (() => {
    try {
      const stored = localStorage.getItem('phq_saved_links');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  addSavedLink: async (link: SavedLink) => {
    if (shouldThrottle('addSavedLink')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().savedLinks;
    set((state) => ({ savedLinks: [link, ...state.savedLinks] }));
    try {
      await linkSaverService.create(uid, link);
      useToastStore.getState().addToast('Success', 'Link saved to database', 'success');
    } catch (error) {
      set({ savedLinks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save link'), 'error');
      throw error;
    }
  },
  deleteSavedLink: async (id: string) => {
    const previous = get().savedLinks;
    set((state) => ({ savedLinks: state.savedLinks.filter((l) => l.id !== id) }));
    try {
      await linkSaverService.delete(id);
      useToastStore.getState().addToast('Success', 'Link deleted from database', 'success');
    } catch (error) {
      set({ savedLinks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete link'), 'error');
      throw error;
    }
  },

  appTags: (() => {
    try {
      const stored = localStorage.getItem('phq_app_tags');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  addAppTag: async (tag: AppTag) => {
    if (shouldThrottle('addAppTag')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().appTags;
    set((state) => ({ appTags: [...state.appTags, tag] }));
    try {
      await tagService.create(uid, tag);
      useToastStore.getState().addToast('Success', 'Tag created in database', 'success');
    } catch (error) {
      set({ appTags: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create tag'), 'error');
      throw error;
    }
  },
  updateAppTag: async (id: string, updates: Partial<Omit<AppTag, 'id' | 'createdAt'>>) => {
    const previous = get().appTags;
    set((state) => ({
      appTags: state.appTags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    try {
      await tagService.update(id, updates);
      useToastStore.getState().addToast('Success', 'Tag updated', 'success');
    } catch (error) {
      set({ appTags: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update tag'), 'error');
      throw error;
    }
  },
  deleteAppTag: async (id: string) => {
    const previous = get().appTags;
    set((state) => ({ appTags: state.appTags.filter((t) => t.id !== id) }));
    try {
      await tagService.delete(id);
      useToastStore.getState().addToast('Success', 'Tag deleted', 'success');
    } catch (error) {
      set({ appTags: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete tag'), 'error');
      throw error;
    }
  },

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

  interestHistory: [],
  addInterestRecord: async (record) => {
    if (shouldThrottle('addInterest')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().interestHistory;
    set((state) => ({ interestHistory: [record, ...state.interestHistory] }));
    try {
      await interestService.create(uid, record);
      useToastStore.getState().addToast('Success', 'Record saved', 'success');
    } catch (error) {
      set({ interestHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save record'), 'error');
      throw error;
    }
  },
  deleteInterestRecord: async (id) => {
    const previous = get().interestHistory;
    set((state) => ({
      interestHistory: state.interestHistory.filter((r) => r.id !== id),
    }));
    try {
      await interestService.delete(id);
      useToastStore.getState().addToast('Success', 'Record deleted', 'success');
    } catch (error) {
      set({ interestHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete record'), 'error');
      throw error;
    }
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

  mediaLogs: (() => {
    try {
      const stored = localStorage.getItem('phq_media_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
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

  countdowns: (() => {
    try {
      const stored = localStorage.getItem('phq_countdowns');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
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
  pomodoroSecondsLeft: initialSecondsLeft,
  pomodoroTotalSeconds: initialTotalSeconds,
  pomodoroTimerState: initialTimerState,
  pomodoroSessionId: initialSessionId,
  pomodoroStreak: initialStreak,
  pomodoroAssociatedTaskId: initialAssociatedTaskId,
  pomodoroPipWindow: null,
  pomodoroPipEnabled: false,

  setPomodoroSecondsLeft: (secs) => {
    set({ pomodoroSecondsLeft: secs });
    syncPomodoroStateToLocalStorage(get());
  },
  setPomodoroTotalSeconds: (secs) => {
    set({ pomodoroTotalSeconds: secs });
    syncPomodoroStateToLocalStorage(get());
  },
  setPomodoroTimerState: (state) => {
    set({ pomodoroTimerState: state });
    syncPomodoroStateToLocalStorage(get());
  },
  setPomodoroSessionId: (id) => {
    set({ pomodoroSessionId: id });
    syncPomodoroStateToLocalStorage(get());
  },
  setPomodoroStreak: (streak) => {
    set({ pomodoroStreak: streak });
    syncPomodoroStateToLocalStorage(get());
  },
  setPomodoroAssociatedTaskId: (id) => {
    set({ pomodoroAssociatedTaskId: id });
    syncPomodoroStateToLocalStorage(get());
  },
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
    stopTimer();
    set({ pomodoroTimerState: 'running' });

    void requestPomodoroNotificationPermission();

    globalPomodoroStartTime = Date.now();
    globalPomodoroSecondsAtStart = get().pomodoroSecondsLeft;

    const tick = () => {
      const { 
        pomodoroSessionId, 
        pomodoroStreak, 
        pomodoroAssociatedTaskId, 
        todoTasks, 
        updateTodoTask, 
        recordPomodoroSession, 
        pomodoroTotalSeconds 
      } = get();

      const elapsedMs = Date.now() - globalPomodoroStartTime;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const secondsLeft = Math.max(0, globalPomodoroSecondsAtStart - elapsedSecs);

      if (secondsLeft <= 0) {
        stopTimer();
        globalPomodoroTick = null;
        set({ pomodoroTimerState: 'idle', pomodoroSecondsLeft: 0 });

        const addToast = useToastStore.getState().addToast;
        let completionNotification: PomodoroCompletionNotification;

        if (pomodoroSessionId === 'focus') {
          const nextStreak = pomodoroStreak + 1;
          set({ pomodoroStreak: nextStreak });
          recordPomodoroSession(Math.round(pomodoroTotalSeconds / 60));

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { detail: { type: 'pomodoro' } }));
          }

          if (pomodoroAssociatedTaskId) {
            if (pomodoroAssociatedTaskId.startsWith('habit-')) {
              const habitId = pomodoroAssociatedTaskId.replace('habit-', '');
              const matchedHabit = get().habits.find(h => h.id === habitId);
              if (matchedHabit) {
                const todayStr = new Date().toISOString().split('T')[0];
                get().toggleHabitCompletion(habitId, todayStr);
                addToast('🔥 Habit Completed', `Completed Pomodoro session for "${matchedHabit.name}"`, 'success');
              }
            } else {
              const matchedTask = todoTasks.find(t => t.id === pomodoroAssociatedTaskId);
              if (matchedTask) {
                updateTodoTask(pomodoroAssociatedTaskId, {
                  pomodoroCount: (matchedTask.pomodoroCount || 0) + 1
                });
                addToast('🍅 Session Logged', `Logged focus session to "${matchedTask.title}"`, 'success');
              }
            }
          } else {
            addToast('🎉 Focus Complete!', 'Great work! Time for a break.', 'success');
          }

          completionNotification = {
            id: crypto.randomUUID(),
            sessionId: pomodoroSessionId,
            title: 'Focus Complete',
            subtitle: 'Great work. Break starts now.',
            icon: 'confetti',
            variant: 'success',
            timestamp: Date.now(),
          };

          const nextSid = nextStreak % 4 === 0 ? 'long-break' : 'short-break';
          const breakMins = nextSid === 'short-break' ? 5 : 15;
          set({ 
            pomodoroSessionId: nextSid, 
            pomodoroSecondsLeft: breakMins * 60,
            pomodoroTotalSeconds: breakMins * 60
          });
        } else {
          addToast('⏰ Break Over!', 'Ready to focus again? 🚀', 'info');

          completionNotification = {
            id: crypto.randomUUID(),
            sessionId: pomodoroSessionId,
            title: 'Break Complete',
            subtitle: 'Ready to focus again?',
            icon: 'award',
            variant: 'achievement',
            timestamp: Date.now(),
          };

          set({ 
            pomodoroSessionId: 'focus', 
            pomodoroSecondsLeft: 25 * 60,
            pomodoroTotalSeconds: 25 * 60
          });
        }

        notifyPomodoroCompletion(completionNotification);
        showPomodoroDesktopNotification(completionNotification);
      } else {
        set({ pomodoroSecondsLeft: secondsLeft });
      }
    };

    globalPomodoroTick = tick;
    startTimer(tick);
    syncPomodoroStateToLocalStorage(get());
  },

  pauseGlobalPomodoro: () => {
    stopTimer();
    globalPomodoroTick = null;
    set({ pomodoroTimerState: 'paused' });
    syncPomodoroStateToLocalStorage(get());
  },

  resumeGlobalPomodoro: () => {
    get().startGlobalPomodoro();
  },

  stopGlobalPomodoro: () => {
    stopTimer();
    globalPomodoroTick = null;
    const { pomodoroTotalSeconds, pomodoroPipWindow } = get();
    set({ 
      pomodoroTimerState: 'idle', 
      pomodoroSecondsLeft: pomodoroTotalSeconds 
    });
    if (pomodoroPipWindow) {
      pomodoroPipWindow.close();
      set({ pomodoroPipWindow: null });
    }
    syncPomodoroStateToLocalStorage(get());
  },

  skipGlobalPomodoro: () => {
    stopTimer();
    globalPomodoroTick = null;
    
    const { 
      pomodoroSessionId, 
      pomodoroSecondsLeft, 
      pomodoroTotalSeconds, 
      pomodoroStreak, 
      pomodoroAssociatedTaskId, 
      todoTasks, 
      updateTodoTask, 
      recordPomodoroSession, 
      pomodoroPipWindow 
    } = get();

    const addToast = useToastStore.getState().addToast;
    let completionNotification: PomodoroCompletionNotification;

    if (pomodoroSessionId === 'focus') {
      // Condition: if < 2 minutes (120 seconds) remains in a focus session, it counts as completed
      if (pomodoroSecondsLeft < 120) {
        const nextStreak = pomodoroStreak + 1;
        set({ pomodoroStreak: nextStreak });
        recordPomodoroSession(Math.round(pomodoroTotalSeconds / 60));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { detail: { type: 'pomodoro' } }));
        }

        if (pomodoroAssociatedTaskId) {
          if (pomodoroAssociatedTaskId.startsWith('habit-')) {
            const habitId = pomodoroAssociatedTaskId.replace('habit-', '');
            const matchedHabit = get().habits.find(h => h.id === habitId);
            if (matchedHabit) {
              const todayStr = new Date().toISOString().split('T')[0];
              get().toggleHabitCompletion(habitId, todayStr);
              addToast('🔥 Habit Completed', `Completed Pomodoro session for "${matchedHabit.name}"`, 'success');
            }
          } else {
            const matchedTask = todoTasks.find(t => t.id === pomodoroAssociatedTaskId);
            if (matchedTask) {
              updateTodoTask(pomodoroAssociatedTaskId, {
                pomodoroCount: (matchedTask.pomodoroCount || 0) + 1
              });
              addToast('🍅 Session Logged (Skipped < 2m left)', `Logged focus session to "${matchedTask.title}"`, 'success');
            }
          }
        } else {
          addToast('🎉 Focus Complete! (Skipped < 2m left)', 'Great work! Time for a break.', 'success');
        }

        completionNotification = {
          id: crypto.randomUUID(),
          sessionId: pomodoroSessionId,
          title: 'Focus Complete',
          subtitle: 'Great work. Break starts now.',
          icon: 'confetti',
          variant: 'success',
          timestamp: Date.now(),
        };

        const nextSid = nextStreak % 4 === 0 ? 'long-break' : 'short-break';
        const breakMins = nextSid === 'short-break' ? 5 : 15;
        set({ 
          pomodoroTimerState: 'idle',
          pomodoroSessionId: nextSid, 
          pomodoroSecondsLeft: breakMins * 60,
          pomodoroTotalSeconds: breakMins * 60
        });

        notifyPomodoroCompletion(completionNotification);
        showPomodoroDesktopNotification(completionNotification);
      } else {
        // Skipped with >= 2m left: do not count in stats, just skip to break
        addToast('Focus Skipped', 'Skipped focus session.', 'info');
        const nextStreak = pomodoroStreak; // stays same
        const nextSid = (nextStreak + 1) % 4 === 0 ? 'long-break' : 'short-break';
        const breakMins = nextSid === 'short-break' ? 5 : 15;
        set({
          pomodoroTimerState: 'idle',
          pomodoroSessionId: nextSid,
          pomodoroSecondsLeft: breakMins * 60,
          pomodoroTotalSeconds: breakMins * 60
        });
      }
    } else {
      // Skipping short-break or long-break: skip directly back to focus (25m)
      addToast('⏰ Break Over!', 'Ready to focus again? 🚀', 'info');

      completionNotification = {
        id: crypto.randomUUID(),
        sessionId: pomodoroSessionId,
        title: 'Break Complete',
        subtitle: 'Ready to focus again?',
        icon: 'award',
        variant: 'achievement',
        timestamp: Date.now(),
      };

      set({ 
        pomodoroTimerState: 'idle',
        pomodoroSessionId: 'focus', 
        pomodoroSecondsLeft: 25 * 60,
        pomodoroTotalSeconds: 25 * 60
      });

      notifyPomodoroCompletion(completionNotification);
      showPomodoroDesktopNotification(completionNotification);
    }

    if (pomodoroPipWindow) {
      pomodoroPipWindow.close();
      set({ pomodoroPipWindow: null });
    }
    syncPomodoroStateToLocalStorage(get());
  },
};
};

