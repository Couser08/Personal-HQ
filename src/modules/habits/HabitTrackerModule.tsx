import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  IconPlus, IconTrash, IconFlame, IconCalendar, 
  IconCheck, IconSettings, IconAward
} from '@tabler/icons-react';
import { useAppStore, type Habit } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressRing } from '../../components/ui/ProgressRing';

const DAYS_OF_WEEK = [
  { label: 'S', value: 0, fullName: 'Sunday' },
  { label: 'M', value: 1, fullName: 'Monday' },
  { label: 'T', value: 2, fullName: 'Tuesday' },
  { label: 'W', value: 3, fullName: 'Wednesday' },
  { label: 'T', value: 4, fullName: 'Thursday' },
  { label: 'F', value: 5, fullName: 'Friday' },
  { label: 'S', value: 6, fullName: 'Saturday' }
];

export default function HabitTrackerModule() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabitCompletion, showConfirm } = useAppStore(
    useShallow(state => ({
      habits: state.habits,
      addHabit: state.addHabit,
      updateHabit: state.updateHabit,
      deleteHabit: state.deleteHabit,
      toggleHabitCompletion: state.toggleHabitCompletion,
      showConfirm: state.showConfirm,
    }))
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
      setFrequencyDays(frequencyDays.filter(d => d !== day));
    } else {
      setFrequencyDays([...frequencyDays, day].sort());
    }
  };

  // Verify if a habit is due today
  const isHabitDueToday = (habit: Habit) => {
    if (habit.frequencyType === 'daily') return true;
    if (habit.frequencyType === 'weekly_days') {
      return habit.frequencyDays.includes(todayDayOfWeek);
    }
    if (habit.frequencyType === 'weekly_count') {
      // Check completions this week (Mon-Sun)
      const now = new Date();
      const currentDay = now.getDay();
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + distanceToMon);
      monday.setHours(0, 0, 0, 0);

      const completionsThisWeek = habit.completedDates.filter(dateStr => {
        const d = new Date(dateStr);
        return d >= monday;
      }).length;

      return completionsThisWeek < habit.frequencyCount;
    }
    return true;
  };

  const dueHabits = useMemo(() => {
    return habits.filter(h => isHabitDueToday(h));
  }, [habits, todayDayOfWeek, todayStr]);

  const completedTodayCount = useMemo(() => {
    return dueHabits.filter(h => h.completedDates.includes(todayStr)).length;
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
    const datesGrid: { dateStr: string; isCompleted: boolean; isToday: boolean; dayLabel: string; completionRatio: number }[] = [];
    const now = new Date();
    now.setHours(0,0,0,0);
    const currentDay = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - currentDay - 28);

    for (let i = 0; i < 35; i++) {
      const target = new Date(startDate);
      target.setDate(startDate.getDate() + i);
      const targetStr = target.toISOString().split('T')[0];
      const dayOfWeek = target.getDay();

      const dueOnThisDate = habits.filter(habit => {
        if (habit.frequencyType === 'daily') return true;
        if (habit.frequencyType === 'weekly_days') {
          return habit.frequencyDays.includes(dayOfWeek);
        }
        return true;
      });

      const completedOnThisDate = dueOnThisDate.filter(h => h.completedDates.includes(targetStr));
      const isCompleted = dueOnThisDate.length > 0 && completedOnThisDate.length === dueOnThisDate.length;
      const completionRatio = dueOnThisDate.length > 0 ? completedOnThisDate.length / dueOnThisDate.length : 0;

      datesGrid.push({
        dateStr: targetStr,
        isCompleted,
        isToday: targetStr === todayStr,
        dayLabel: target.toLocaleDateString('en-US', { weekday: 'narrow' }),
        completionRatio
      });
    }
    return datesGrid;
  };

  const getWeekGrid = (habit: Habit) => {
    const dates: { dateStr: string; dayLabel: string; isCompleted: boolean; isToday: boolean }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push({
        dateStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isCompleted: habit.completedDates.includes(dateStr),
        isToday: dateStr === todayStr
      });
    }
    return dates;
  };

  const globalHeatmap = useMemo(() => getGlobalHeatmapGrid(), [habits, todayStr, todayDayOfWeek]);

  const perfectDaysCount = useMemo(() => {
    return globalHeatmap.filter(cell => cell.isCompleted).length;
  }, [globalHeatmap]);

  const currentPerfectStreak = useMemo(() => {
    const pastCells = globalHeatmap.filter(c => c.dateStr <= todayStr);
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
        <button
          onClick={() => handleOpenAddModal()}
          className="btn btn-primary btn-sm flex items-center gap-1.5"
        >
          <IconPlus size={15} /> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={<IconCalendar className="w-10 h-10 text-text-muted" />}
          title="Create Your First Habit"
          description="Log daily exercises, learning paths, or code journals. Build up a strong streak tracker."
          action={
            <button
              onClick={() => handleOpenAddModal()}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <IconPlus size={15} /> Add Habit
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Today's Progress */}
            <div className="bg-surface border border-border rounded-3xl p-5 flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Today's Progress</span>
                <span className="text-3xl font-black text-text-primary tracking-tight leading-none">
                  {Math.round(overallProgress * 100)}%
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  {completedTodayCount} of {dueHabits.length} done
                </span>
              </div>
              <div className="shrink-0">
                <ProgressRing
                  progress={overallProgress}
                  size={70}
                  strokeWidth={7}
                  color="var(--color-primary)"
                  style="glowing"
                />
              </div>
            </div>

            {/* Streak Leader */}
            <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Streak Leader</span>
              <div className="flex items-baseline gap-1.5">
                <IconFlame className="text-orange-500" size={20} />
                <span className="text-3xl font-black text-text-primary tracking-tight leading-none">
                  {streakLeader ? streakLeader.streak : 0}
                </span>
                <span className="text-sm font-bold text-text-secondary">days</span>
              </div>
              <span className="text-xs text-text-secondary truncate">
                {streakLeader ? streakLeader.name : 'No streaks yet'}
              </span>
            </div>

            {/* Total Check-ins */}
            <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">All-Time Check-ins</span>
              <span className="text-3xl font-black text-text-primary tracking-tight leading-none">{totalCompletions}</span>
              <span className="text-xs text-text-secondary">Across {habits.length} habits</span>
            </div>
          </div>

          {/* Consistency Heatmap */}
          <div className="bg-surface border border-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Consistency Grid</span>
                <p className="text-xs text-text-secondary mt-0.5">Green when all habits are complete for the day</p>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-surface-alt border border-border" />
                  <span>None</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" />
                  <span>Partial</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Perfect</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-shrink-0">
                {globalHeatmap.map((cell, idx) => (
                  <div
                    key={idx}
                    title={`${cell.dateStr}: ${Math.round(cell.completionRatio * 100)}% complete`}
                    className={`w-4 h-4 rounded-md transition-all cursor-default ${
                      cell.isCompleted
                        ? 'bg-emerald-500'
                        : cell.completionRatio > 0
                          ? 'bg-emerald-500/30'
                          : cell.isToday
                            ? 'border-2 border-primary bg-transparent'
                            : 'bg-surface-alt'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-6 border-l border-border pl-5">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-text-primary">{perfectDaysCount}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-0.5">Perfect Days</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-text-primary">{currentPerfectStreak}d</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-0.5">Current Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column: Today's checklist + Habit cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* Today's Checklist */}
            <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Due Today</span>
                {dueHabits.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted">{completedTodayCount}/{dueHabits.length}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 min-h-[120px]">
                {dueHabits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <span className="text-2xl">🎉</span>
                    <p className="text-xs text-text-muted font-medium">No habits scheduled for today.</p>
                  </div>
                ) : (
                  dueHabits.map(habit => {
                    const isCompleted = habit.completedDates.includes(todayStr);
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all w-full cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500/8 border border-emerald-500/20'
                            : 'bg-surface-alt/60 border border-border/50 hover:border-border'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-border'
                        }`}>
                          {isCompleted && <IconCheck size={11} strokeWidth={3} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${
                            isCompleted ? 'line-through text-text-muted' : 'text-text-primary'
                          }`}>{habit.name}</p>
                          {habit.description && (
                            <p className="text-[10px] text-text-muted truncate mt-0.5">{habit.description}</p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: All Habit Cards */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {habits.map(habit => {
                const weekGrid = getWeekGrid(habit);
                return (
                  <div
                    key={habit.id}
                    className="bg-surface border border-border rounded-3xl p-4 shadow-sm flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary truncate">{habit.name}</h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-surface-alt border border-border text-text-muted uppercase tracking-tight shrink-0">
                            {habit.frequencyType === 'daily' ? 'Daily' :
                             habit.frequencyType === 'weekly_count' ? `${habit.frequencyCount}×/wk` : 'Custom'}
                          </span>
                        </div>
                        {habit.description && (
                          <p className="text-xs text-text-muted mt-0.5 truncate">{habit.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        <button
                          onClick={() => handleOpenAddModal(habit)}
                          className="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <IconSettings size={13} />
                        </button>
                        <button
                          onClick={() => showConfirm('Delete Habit', `Delete "${habit.name}"?`, () => deleteHabit(habit.id))}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-surface-alt/50 rounded-2xl p-3">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">This Week</span>
                        <div className="flex items-center gap-1.5">
                          {weekGrid.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-0.5">
                              <span className="text-[8px] text-text-muted font-medium">{day.dayLabel.slice(0, 2)}</span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                day.isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : day.isToday
                                    ? 'border-2 border-primary bg-transparent'
                                    : 'bg-surface border border-border text-text-muted'
                              }`}>
                                {day.isCompleted ? '✓' : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4 border-l border-border pl-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-0.5 text-orange-500">
                            <IconFlame size={15} />
                            <span className="text-base font-black font-mono">{habit.streak}d</span>
                          </div>
                          <span className="text-[8px] font-bold text-text-muted uppercase tracking-wide mt-0.5">Streak</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-0.5 text-text-secondary">
                            <IconAward size={15} />
                            <span className="text-base font-black font-mono">{habit.bestStreak}d</span>
                          </div>
                          <span className="text-[8px] font-bold text-text-muted uppercase tracking-wide mt-0.5">Best</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Habit Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedHabitToEdit ? 'Edit Habit' : 'Create Habit'}
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Habit Name</label>
            <input
              type="text"
              required
              placeholder="e.g., LeetCode Daily, Read Books"
              value={habitName}
              onChange={e => setHabitName(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g., 20 mins every morning"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Frequency</label>
            <div className="flex bg-surface-alt p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setFrequencyType('daily')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  frequencyType === 'daily' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={() => setFrequencyType('weekly_days')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  frequencyType === 'weekly_days' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Specific Days
              </button>
              <button
                type="button"
                onClick={() => setFrequencyType('weekly_count')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  frequencyType === 'weekly_count' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Times / Week
              </button>
            </div>
          </div>

          {frequencyType === 'weekly_days' && (
            <div className="flex flex-col gap-2 p-3 bg-surface-alt/50 rounded-2xl border border-border">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Select Days</label>
              <div className="flex justify-between gap-1 mt-1">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = frequencyDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleToggleDay(day.value)}
                      className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'bg-surface border-border text-text-secondary hover:border-primary/40'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {frequencyType === 'weekly_count' && (
            <div className="flex flex-col gap-2 p-3 bg-surface-alt/50 rounded-2xl border border-border">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Target Completions</label>
                <span className="text-xs font-bold text-text-primary">{frequencyCount}× per week</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={frequencyCount}
                onChange={e => setFrequencyCount(parseInt(e.target.value))}
                className="w-full accent-primary mt-2"
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="button" onClick={handleSaveHabit} className="btn btn-primary btn-sm">
              Save Habit
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
