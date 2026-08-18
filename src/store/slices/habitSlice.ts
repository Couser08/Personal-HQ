import { type StateCreator } from 'zustand';
import { type AppStore, type Habit, type DailyReflection } from '../types';
import { habitService, reflectionService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface HabitSlice {
  habits: Habit[];
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (id: string, dateStr: string) => Promise<void>;

  dailyReflections: DailyReflection[];
  addDailyReflection: (ref: DailyReflection) => Promise<void>;
  updateDailyReflection: (id: string, data: Partial<DailyReflection>) => Promise<void>;
  deleteDailyReflection: (id: string) => Promise<void>;
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

  dailyReflections: (() => {
    try {
      const raw = localStorage.getItem('phq_daily_reflections');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addHabit: async (habit) => {
    if (shouldThrottle('addHabit')) return;
    const previous = get().habits;
    const updated = [habit, ...previous];
    set({ habits: updated });
    localStorage.setItem('phq_habits', JSON.stringify(updated));

    const uid = useAuthStore.getState().user?.id;
    if (!uid) {
      useToastStore.getState().addToast('Success', 'Habit saved locally', 'success');
      return;
    }

    try {
      await habitService.create(uid, habit);
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(uid) });
      useToastStore.getState().addToast('Success', 'Habit created', 'success');
    } catch (error) {
      useToastStore.getState().addToast('Saved Locally', 'Saved locally in workspace', 'info');
    }
  },
  updateHabit: async (id, data) => {
    const previous = get().habits;
    const updated = previous.map((h) => (h.id === id ? { ...h, ...data } : h));
    set({ habits: updated });
    localStorage.setItem('phq_habits', JSON.stringify(updated));
    const uid = useAuthStore.getState().user?.id;
    try {
      await habitService.update(id, data);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(uid) });
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

    const uid = useAuthStore.getState().user?.id;
    try {
      await habitService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(uid) });
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
      
      const isRemoving = h.completedDates.includes(dateStr);
      const completedDates = isRemoving
        ? h.completedDates.filter((d) => d !== dateStr)
        : [...h.completedDates, dateStr];

      // Update completionDetails with timestamps and defaults based on habitType
      const completionDetails = h.completionDetails ? { ...h.completionDetails } : {};
      if (isRemoving) {
        delete completionDetails[dateStr];
      } else {
        const timeNow = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
        let value: number | undefined;
        let unit: string | undefined;

        if (h.habitType === 'reading') {
          value = 10;
          unit = 'pages';
        } else if (h.habitType === 'coding') {
          value = 45;
          unit = 'min';
        } else if (h.habitType === 'meditation') {
          value = 15;
          unit = 'min';
        } else if (h.habitType === 'workout') {
          value = 30;
          unit = 'min';
        }

        completionDetails[dateStr] = {
          time: timeNow,
          value,
          unit
        };
      }
        
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
      return { ...h, completedDates, streak, bestStreak, completionDetails };
    });
    
    set({ habits: updated });
    const uid = useAuthStore.getState().user?.id;
    try {
      const target = updated.find((h) => h.id === id);
      if (target) {
        await habitService.update(id, {
          completedDates: target.completedDates,
          streak: target.streak,
          bestStreak: target.bestStreak,
          completionDetails: target.completionDetails,
        });
        if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(uid) });
      }
    } catch (error) {
      set({ habits: previous });
      localStorage.setItem('phq_habits', JSON.stringify(previous));
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not toggle habit completion'), 'error');
      throw error;
    }
  },

  addDailyReflection: async (ref) => {
    const previous = get().dailyReflections;
    const updated = [ref, ...previous];
    set({ dailyReflections: updated });
    localStorage.setItem('phq_daily_reflections', JSON.stringify(updated));

    const uid = useAuthStore.getState().user?.id;
    if (!uid) {
      useToastStore.getState().addToast('Success', 'Reflection saved locally', 'success');
      return;
    }
    try {
      await reflectionService.create(uid, ref);
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.reflections(uid) });
      useToastStore.getState().addToast('Success', 'Reflection saved', 'success');
    } catch (error) {
      useToastStore.getState().addToast('Saved Locally', 'Saved locally in workspace', 'info');
    }
  },
  updateDailyReflection: async (id, data) => {
    const previous = get().dailyReflections;
    const updated = previous.map((r) => (r.id === id ? { ...r, ...data } : r));
    set({ dailyReflections: updated });
    localStorage.setItem('phq_daily_reflections', JSON.stringify(updated));
    const uid = useAuthStore.getState().user?.id;
    try {
      await reflectionService.update(id, data);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.habits.reflections(uid) });
    } catch (error) {
      set({ dailyReflections: previous });
      localStorage.setItem('phq_daily_reflections', JSON.stringify(previous));
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update reflection'), 'error');
      throw error;
    }
  },
  deleteDailyReflection: async (id) => {
    const previous = get().dailyReflections;
    const updated = previous.filter((r) => r.id !== id);
    set({ dailyReflections: updated });
    localStorage.setItem('phq_daily_reflections', JSON.stringify(updated));
    const uid = useAuthStore.getState().user?.id;
    try {
      await reflectionService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.habits.reflections(uid) });
      useToastStore.getState().addToast('Success', 'Reflection deleted', 'success');
    } catch (error) {
      set({ dailyReflections: previous });
      localStorage.setItem('phq_daily_reflections', JSON.stringify(previous));
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete reflection'), 'error');
      throw error;
    }
  },

});
