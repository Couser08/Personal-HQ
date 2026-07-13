import { type StateCreator } from 'zustand';
import { type AppStore, type Habit } from '../types';
import { habitService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';

export interface HabitSlice {
  habits: Habit[];
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (id: string, dateStr: string) => Promise<void>;
}

export const createHabitSlice: StateCreator<
  AppStore,
  [],
  [],
  HabitSlice
> = (set, get) => ({
  habits: (() => {
    try {
      const raw = localStorage.getItem('phq_habits');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addHabit: async (habit) => {
    if (shouldThrottle('addHabit')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().habits;
    const updated = [habit, ...previous];
    set({ habits: updated });
    localStorage.setItem('phq_habits', JSON.stringify(updated));
    try {
      await habitService.create(uid, habit);
      useToastStore.getState().addToast('Success', 'Habit created', 'success');
    } catch (error) {
      set({ habits: previous });
      localStorage.setItem('phq_habits', JSON.stringify(previous));
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save habit'), 'error');
      throw error;
    }
  },
  updateHabit: async (id, data) => {
    const previous = get().habits;
    const updated = previous.map((h) => (h.id === id ? { ...h, ...data } : h));
    set({ habits: updated });
    localStorage.setItem('phq_habits', JSON.stringify(updated));
    try {
      await habitService.update(id, data);
    } catch (error) {
      set({ habits: previous });
      localStorage.setItem('phq_habits', JSON.stringify(previous));
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update habit'), 'error');
      throw error;
    }
  },
  deleteHabit: async (id) => {
    const previous = get().habits;
    const updated = previous.filter((h) => h.id !== id);
    set({ habits: updated });
    localStorage.setItem('phq_habits', JSON.stringify(updated));

    const activeFocusItem = get().activeFocusItem;
    if (activeFocusItem && activeFocusItem.type === 'habit' && activeFocusItem.id === id) {
      get().setActiveFocusItem(null);
    }

    try {
      await habitService.delete(id);
      useToastStore.getState().addToast('Success', 'Habit deleted', 'success');
    } catch (error) {
      set({ habits: previous });
      localStorage.setItem('phq_habits', JSON.stringify(previous));
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete habit'), 'error');
      throw error;
    }
  },
  toggleHabitCompletion: async (id, dateStr) => {
    const previous = get().habits;
    const updated = previous.map((h) => {
      if (h.id !== id) return h;
      const completedDates = h.completedDates.includes(dateStr)
        ? h.completedDates.filter((d) => d !== dateStr)
        : [...h.completedDates, dateStr];
        
      // Helper function to calculate streaks locally
      const getStreakStats = (datesArr: string[]) => {
        if (datesArr.length === 0) return { streak: 0, bestStreak: 0 };
        const sortedDates = Array.from(new Set(datesArr))
          .map(d => new Date(d))
          .sort((a, b) => a.getTime() - b.getTime());
          
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        let lastDate: Date | null = null;
        
        for (let i = 0; i < sortedDates.length; i++) {
          const d = sortedDates[i];
          d.setHours(0, 0, 0, 0);
          if (lastDate === null) {
            tempStreak = 1;
          } else {
            const diffTime = d.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else if (diffDays > 1) {
              if (tempStreak > bestStreak) bestStreak = tempStreak;
              tempStreak = 1;
            }
          }
          lastDate = d;
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        let isActive = false;
        if (lastDate) {
          const lastDateTime = lastDate.getTime();
          if (lastDateTime === today.getTime() || lastDateTime === yesterday.getTime()) {
            isActive = true;
          }
        }
        currentStreak = isActive ? tempStreak : 0;
        return { streak: currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
      };
      
      const { streak, bestStreak } = getStreakStats(completedDates);
      return { ...h, completedDates, streak, bestStreak };
    });
    
    set({ habits: updated });
    localStorage.setItem('phq_habits', JSON.stringify(updated));
    try {
      const target = updated.find((h) => h.id === id);
      if (target) {
        await habitService.update(id, {
          completedDates: target.completedDates,
          streak: target.streak,
          bestStreak: target.bestStreak,
        });
      }
    } catch (error) {
      set({ habits: previous });
      localStorage.setItem('phq_habits', JSON.stringify(previous));
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not toggle habit completion'), 'error');
      throw error;
    }
  },
});
