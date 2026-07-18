import { create } from 'zustand';
import { type AppStore } from './types';
import { createCoreSlice } from './slices/coreSlice';
import { createJournalSlice } from './slices/journalSlice';
import { createMindmapSlice } from './slices/mindmapSlice';
import { createStudySlice } from './slices/studySlice';
import { createBudgetSlice } from './slices/budgetSlice';
import { createTodoSlice } from './slices/todoSlice';
import { createHabitSlice } from './slices/habitSlice';
import { createBooksSlice } from './slices/booksSlice';
import { useAuthStore } from './useAuthStore';
import {
  createUtilitySlice,
  globalPomodoroTick,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart,
  syncPomodoroFromStorage
} from './slices/utilitySlice';

export * from './types';

export const useAppStore = create<AppStore>()((...a) => ({
  ...createCoreSlice(...a),
  ...createJournalSlice(...a),
  ...createMindmapSlice(...a),
  ...createStudySlice(...a),
  ...createBudgetSlice(...a),
  ...createTodoSlice(...a),
  ...createHabitSlice(...a),
  ...createUtilitySlice(...a),
  ...createBooksSlice(...a),
}));

if (typeof window !== 'undefined') {
  let lastSyncTime = 0;
  const syncTimer = () => {
    const state = useAppStore.getState();
    if (state.pomodoroTimerState === 'running' && globalPomodoroTick) {
      const elapsedMs = Date.now() - globalPomodoroStartTime;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const secondsLeft = Math.max(0, globalPomodoroSecondsAtStart - elapsedSecs);
      
      if (secondsLeft <= 0) {
        globalPomodoroTick();
      } else {
        useAppStore.setState({ pomodoroSecondsLeft: secondsLeft });
      }
    }
  };

  const syncData = () => {
    const now = Date.now();
    if (now - lastSyncTime < 10000) return; // 10s throttle
    lastSyncTime = now;

    const state = useAppStore.getState();
    const user = useAuthStore.getState().user;
    if (user && state.loadAllData) {
      state.loadAllData(user.id).catch((e) => console.error('Failed to sync on visibility/focus:', e));
    }
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncTimer();
      syncData();
    }
  });
  window.addEventListener('focus', () => {
    syncTimer();
    syncData();
  });

  // Listen for Pomodoro state changes in other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'focusflow_pomodoro_sync_state' && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue);
        syncPomodoroFromStorage(payload, useAppStore.setState, useAppStore.getState);
      } catch (e) {
        console.error('Failed to sync Pomodoro from storage:', e);
      }
    }
  });

  // Automatically persist state changes to localStorage
  useAppStore.subscribe((state) => {
    try {
      localStorage.setItem('phq_todo_projects', JSON.stringify(state.todoProjects));
      localStorage.setItem('phq_todo_tasks', JSON.stringify(state.todoTasks));
      localStorage.setItem('phq_journals', JSON.stringify(state.journals));
      localStorage.setItem('phq_mindmaps', JSON.stringify(state.mindmaps));
      localStorage.setItem('phq_habits', JSON.stringify(state.habits));
      localStorage.setItem('phq_sprints', JSON.stringify(state.sprints));
      localStorage.setItem('phq_dsa_problems', JSON.stringify(state.dsaProblems));
      localStorage.setItem('phq_til_logs', JSON.stringify(state.tilLogs));
      localStorage.setItem('phq_roadmaps', JSON.stringify(state.roadmaps));
      localStorage.setItem('phq_resources', JSON.stringify(state.resources));
      localStorage.setItem('phq_dev_goals', JSON.stringify(state.devGoals));
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(state.journalStickyNotes));
      localStorage.setItem('phq_saved_links', JSON.stringify(state.savedLinks));
      localStorage.setItem('phq_app_tags', JSON.stringify(state.appTags));
      localStorage.setItem('phq_links', JSON.stringify(state.links));
      localStorage.setItem('phq_subjects', JSON.stringify(state.subjects));
      localStorage.setItem('phq_media_logs', JSON.stringify(state.mediaLogs));
      localStorage.setItem('phq_countdowns', JSON.stringify(state.countdowns));
      localStorage.setItem('phq_budget_categories', JSON.stringify(state.budgetCategories));
      localStorage.setItem('phq_budget_transactions', JSON.stringify(state.budgetTransactions));
    } catch (e) {
      console.warn('[Storage Persist] Error persisting to localStorage:', e);
    }
  });
}
