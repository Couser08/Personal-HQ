import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconPlus, IconCalendar } from '@tabler/icons-react';
import { useAppStore, type Habit } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '../../components/ui/EmptyState';
import { HabitStats } from './components/HabitStats';
import { HabitCalendar } from './components/HabitCalendar';
import { HabitChecklist } from './components/HabitChecklist';
import { HabitCard } from './components/HabitCard';
import { HabitModal } from './components/HabitModal';
import { isHabitDueToday } from './utils';

export default function HabitTrackerModule() {
  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    showConfirm,
    activeFocusItem,
    setActiveFocusItem,
  } = useAppStore(
    useShallow((state) => ({
      habits: state.habits,
      addHabit: state.addHabit,
      updateHabit: state.updateHabit,
      deleteHabit: state.deleteHabit,
      toggleHabitCompletion: state.toggleHabitCompletion,
      showConfirm: state.showConfirm,
      activeFocusItem: state.activeFocusItem,
      setActiveFocusItem: state.setActiveFocusItem,
    })),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly_days' | 'weekly_count'>('daily');
  const [frequencyDays, setFrequencyDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [frequencyCount, setFrequencyCount] = useState(3);
  const [selectedHabitToEdit, setSelectedHabitToEdit] = useState<Habit | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayDayOfWeek = useMemo(() => new Date().getDay(), []);

  // Helper to open habit creator
  const handleOpenAddModal = (habit?: Habit) => {
    if (habit) {
      setSelectedHabitToEdit(habit);
      setHabitName(habit.name);
      setDescription(habit.description);
      setFrequencyType(habit.frequencyType);
      setFrequencyDays(habit.frequencyDays);
      setFrequencyCount(habit.frequencyCount);
    } else {
      setSelectedHabitToEdit(null);
      setHabitName('');
      setDescription('');
      setFrequencyType('daily');
      setFrequencyDays([1, 2, 3, 4, 5]);
      setFrequencyCount(3);
    }
    setIsModalOpen(true);
  };

  // Save new/edited habit
  const handleSaveHabit = async () => {
    if (!habitName.trim()) return;

    if (selectedHabitToEdit) {
      await updateHabit(selectedHabitToEdit.id, {
        name: habitName.trim(),
        description: description.trim(),
        frequencyType,
        frequencyDays: frequencyType === 'weekly_days' ? frequencyDays : [],
        frequencyCount: frequencyType === 'weekly_count' ? frequencyCount : 0,
      });
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        name: habitName.trim(),
        description: description.trim(),
        frequencyType,
        frequencyDays: frequencyType === 'weekly_days' ? frequencyDays : [],
        frequencyCount: frequencyType === 'weekly_count' ? frequencyCount : 0,
        completedDates: [],
        streak: 0,
        bestStreak: 0,
        createdAt: new Date().toISOString(),
      };
      await addHabit(newHabit);
    }
    setIsModalOpen(false);
  };

  // Toggle day checkbox
  const handleToggleDay = (day: number) => {
    if (frequencyDays.includes(day)) {
      setFrequencyDays(frequencyDays.filter((d) => d !== day));
    } else {
      setFrequencyDays([...frequencyDays, day].sort());
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;
    const isCurrentlyCompleted = target.completedDates.includes(todayStr);

    if (!isCurrentlyCompleted) {
      const incompleteDueToday = dueHabits.filter((h) => h.id !== habitId && !h.completedDates.includes(todayStr));
      if (incompleteDueToday.length === 0 && dueHabits.length > 0) {
        // Trigger premium wavy effect
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { detail: { type: 'habits' } }));
        }
      }
    }

    await toggleHabitCompletion(habitId, todayStr);
  };

  const dueHabits = useMemo(() => {
    return habits.filter((h) => isHabitDueToday(h, todayDayOfWeek));
  }, [habits, todayDayOfWeek]);

  const completedTodayCount = useMemo(() => {
    return dueHabits.filter((h) => h.completedDates.includes(todayStr)).length;
  }, [dueHabits, todayStr]);

  const streakLeader = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce((prev, current) => (prev.streak > current.streak ? prev : current), habits[0]);
  }, [habits]);

  const totalCompletions = useMemo(() => {
    return habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  }, [habits]);

  const overallProgress = useMemo(() => {
    if (dueHabits.length === 0) return 0;
    return completedTodayCount / dueHabits.length;
  }, [completedTodayCount, dueHabits]);

  const getGlobalHeatmapGrid = () => {
    const datesGrid: {
      dateStr: string;
      isCompleted: boolean;
      isToday: boolean;
      dayLabel: string;
      completionRatio: number;
    }[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const currentDay = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - currentDay - 28);

    for (let i = 0; i < 35; i++) {
      const target = new Date(startDate);
      target.setDate(startDate.getDate() + i);
      const targetStr = target.toISOString().split('T')[0];
      const dayOfWeek = target.getDay();

      const dueOnThisDate = habits.filter((habit) => {
        if (habit.frequencyType === 'daily') return true;
        if (habit.frequencyType === 'weekly_days') {
          return habit.frequencyDays.includes(dayOfWeek);
        }
        return true;
      });

      const completedOnThisDate = dueOnThisDate.filter((h) => h.completedDates.includes(targetStr));
      const isCompleted = dueOnThisDate.length > 0 && completedOnThisDate.length === dueOnThisDate.length;
      const completionRatio = dueOnThisDate.length > 0 ? completedOnThisDate.length / dueOnThisDate.length : 0;

      datesGrid.push({
        dateStr: targetStr,
        isCompleted,
        isToday: targetStr === todayStr,
        dayLabel: target.toLocaleDateString('en-US', { weekday: 'narrow' }),
        completionRatio,
      });
    }
    return datesGrid;
  };

  const globalHeatmap = useMemo(() => getGlobalHeatmapGrid(), [habits, todayStr]);

  const perfectDaysCount = useMemo(() => {
    return globalHeatmap.filter((cell) => cell.isCompleted).length;
  }, [globalHeatmap]);

  const currentPerfectStreak = useMemo(() => {
    const pastCells = globalHeatmap.filter((c) => c.dateStr <= todayStr);
    let tempStreak = 0;
    for (let i = pastCells.length - 1; i >= 0; i--) {
      const cell = pastCells[i];
      if (cell.isCompleted) {
        tempStreak++;
      } else {
        if (cell.dateStr === todayStr) {
          continue;
        }
        break;
      }
    }
    return tempStreak;
  }, [globalHeatmap, todayStr]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-24 text-left antialiased"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            Habit Tracker
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          </h1>
          <p className="text-sm text-text-secondary mt-1">Build consistency, visual streaks, and long-term momentum.</p>
        </div>
        <button onClick={() => handleOpenAddModal()} className="btn btn-primary btn-sm flex items-center gap-1.5">
          <IconPlus size={15} /> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={<IconCalendar className="w-10 h-10 text-text-muted" />}
          title="Create Your First Habit"
          description="Log daily exercises, learning paths, or code journals. Build up a strong streak tracker."
          action={
            <button onClick={() => handleOpenAddModal()} className="btn btn-primary btn-sm flex items-center gap-2">
              <IconPlus size={15} /> Add Habit
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Stats Row */}
          <HabitStats
            overallProgress={overallProgress}
            completedTodayCount={completedTodayCount}
            dueHabitsCount={dueHabits.length}
            streakLeader={streakLeader}
            totalCompletions={totalCompletions}
            habitsCount={habits.length}
          />

          {/* Consistency Heatmap */}
          <HabitCalendar
            globalHeatmap={globalHeatmap}
            perfectDaysCount={perfectDaysCount}
            currentPerfectStreak={currentPerfectStreak}
          />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <HabitChecklist
              dueHabits={dueHabits}
              todayStr={todayStr}
              overallProgress={overallProgress}
              completedTodayCount={completedTodayCount}
              activeFocusItem={activeFocusItem}
              setActiveFocusItem={setActiveFocusItem}
              handleToggleHabit={handleToggleHabit}
            />

            <div className="lg:col-span-7 flex flex-col gap-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  todayStr={todayStr}
                  activeFocusItem={activeFocusItem}
                  setActiveFocusItem={setActiveFocusItem}
                  handleOpenAddModal={handleOpenAddModal}
                  showConfirm={showConfirm}
                  deleteHabit={deleteHabit}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedHabitToEdit={selectedHabitToEdit}
        habitName={habitName}
        setHabitName={setHabitName}
        description={description}
        setDescription={setDescription}
        frequencyType={frequencyType}
        setFrequencyType={setFrequencyType}
        frequencyDays={frequencyDays}
        handleToggleDay={handleToggleDay}
        frequencyCount={frequencyCount}
        setFrequencyCount={setFrequencyCount}
        handleSaveHabit={handleSaveHabit}
        deleteHabit={deleteHabit}
        showConfirm={showConfirm}
      />
    </motion.div>
  );
}
