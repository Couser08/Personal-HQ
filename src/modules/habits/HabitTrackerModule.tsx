import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconPlus, IconCalendar } from '@tabler/icons-react';
import { useAppStore, type Habit, type DailyReflection } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { HabitStats } from './components/HabitStats';
import { HabitCalendar } from './components/HabitCalendar';
import { HabitChecklist } from './components/HabitChecklist';
import { HabitCard } from './components/HabitCard';
import { HabitModal } from './components/HabitModal';
import { isHabitDueToday } from './utils';
import { playCelebratoryChime } from './utils/habitChime';
import { DailyReflectionCard } from './components/DailyReflectionCard';
import { TodayCheckinsCard } from './components/TodayCheckinsCard';

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
    dailyReflections,
    addDailyReflection,
  } = useAppStore(
    useShallow((state) => ({
      habits: state.habits || [],
      addHabit: state.addHabit,
      updateHabit: state.updateHabit,
      deleteHabit: state.deleteHabit,
      toggleHabitCompletion: state.toggleHabitCompletion,
      showConfirm: state.showConfirm,
      activeFocusItem: state.activeFocusItem,
      setActiveFocusItem: state.setActiveFocusItem,
      dailyReflections: state.dailyReflections || [],
      addDailyReflection: state.addDailyReflection,
    })),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly_days' | 'weekly_count'>('daily');
  const [frequencyDays, setFrequencyDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [frequencyCount, setFrequencyCount] = useState(3);
  const [selectedHabitToEdit, setSelectedHabitToEdit] = useState<Habit | null>(null);
  const [habitType, setHabitType] = useState<
    'generic' | 'reading' | 'coding' | 'meditation' | 'workout'
  >('generic');
  const [whyText, setWhyText] = useState('');
  const [targetTime, setTargetTime] = useState('');

  // Reflection form states
  const [isReflecting, setIsReflecting] = useState(false);
  const [score, setScore] = useState(8);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [blockers, setBlockers] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayDayOfWeek = useMemo(() => new Date().getDay(), []);

  const greetingText = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const totalCompletions = useMemo(() => {
    return habits.reduce((sum, h) => sum + (h.completedDates || []).length, 0);
  }, [habits]);

  const progression = useMemo(() => {
    const tc = totalCompletions;
    if (tc < 10) return { level: 1, title: 'Rookie', color: 'text-text-secondary bg-surface-alt' };
    if (tc < 30) return { level: 2, title: 'Builder', color: 'text-blue-500 bg-blue-500/10' };
    if (tc < 70) return { level: 3, title: 'Momentum', color: 'text-purple-500 bg-purple-500/10' };
    if (tc < 150) return { level: 4, title: 'Master', color: 'text-amber-500 bg-amber-500/10' };
    return { level: 5, title: 'Discipline Legend', color: 'text-[#22C55E] bg-[#22C55E]/10' };
  }, [totalCompletions]);

  const todayReflection = useMemo(() => {
    return dailyReflections.find((r) => r.date === todayStr);
  }, [dailyReflections, todayStr]);

  const handleOpenAddModal = (habit?: Habit) => {
    if (habit) {
      setSelectedHabitToEdit(habit);
      setHabitName(habit.name);
      setDescription(habit.description || '');
      setFrequencyType(habit.frequencyType);
      setFrequencyDays(habit.frequencyDays || []);
      setFrequencyCount(habit.frequencyCount || 3);
      setHabitType((habit.habitType as any) || 'generic');
      setWhyText(habit.whyText || '');
      setTargetTime(habit.targetTime || '');
    } else {
      setSelectedHabitToEdit(null);
      setHabitName('');
      setDescription('');
      setFrequencyType('daily');
      setFrequencyDays([1, 2, 3, 4, 5]);
      setFrequencyCount(3);
      setHabitType('generic');
      setWhyText('');
      setTargetTime('');
    }
    setIsModalOpen(true);
  };

  const handleSaveHabit = async () => {
    if (!habitName.trim()) return;

    if (selectedHabitToEdit) {
      await updateHabit(selectedHabitToEdit.id, {
        name: habitName.trim(),
        description: description.trim(),
        frequencyType,
        frequencyDays: frequencyType === 'weekly_days' ? frequencyDays : [],
        frequencyCount: frequencyType === 'weekly_count' ? frequencyCount : 0,
        habitType,
        whyText: whyText.trim(),
        targetTime,
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
        habitType,
        whyText: whyText.trim(),
        targetTime,
      };
      await addHabit(newHabit);
    }
    setIsModalOpen(false);
  };

  const handleToggleDay = (day: number) => {
    if (frequencyDays.includes(day)) {
      setFrequencyDays(frequencyDays.filter((d) => d !== day));
    } else {
      setFrequencyDays([...frequencyDays, day].sort());
    }
  };

  const dueHabits = useMemo(() => {
    return habits.filter((h) => isHabitDueToday(h, todayDayOfWeek));
  }, [habits, todayDayOfWeek]);

  const handleToggleHabit = async (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;
    const isCurrentlyCompleted = (target.completedDates || []).includes(todayStr);

    if (!isCurrentlyCompleted) {
      const incompleteDueToday = dueHabits.filter(
        (h) => h.id !== habitId && !(h.completedDates || []).includes(todayStr),
      );
      if (incompleteDueToday.length === 0 && dueHabits.length > 0) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('trigger-wavy-effect', { detail: { type: 'habits' } }),
          );
        }
        playCelebratoryChime();
      }
    }

    await toggleHabitCompletion(habitId, todayStr);
  };

  const handleSaveReflection = async () => {
    if (!addDailyReflection) return;
    const ref: DailyReflection = {
      id: crypto.randomUUID(),
      date: todayStr,
      score,
      whatWentWell: whatWentWell.trim(),
      blockers: blockers.trim(),
      tomorrowPlan: tomorrowPlan.trim(),
    };
    await addDailyReflection(ref);
    setIsReflecting(false);
  };

  const completedTodayCount = useMemo(() => {
    return dueHabits.filter((h) => (h.completedDates || []).includes(todayStr)).length;
  }, [dueHabits, todayStr]);

  const completedHabitsList = useMemo(() => {
    return habits.filter((h) => (h.completedDates || []).includes(todayStr));
  }, [habits, todayStr]);

  const streakLeader = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce(
      (prev, current) => ((prev.streak || 0) > (current.streak || 0) ? prev : current),
      habits[0],
    );
  }, [habits]);

  const overallProgress = useMemo(() => {
    if (dueHabits.length === 0) return 0;
    return completedTodayCount / dueHabits.length;
  }, [completedTodayCount, dueHabits]);

  const globalHeatmap = useMemo(() => {
    const datesGrid: {
      dateStr: string;
      isCompleted: boolean;
      isToday: boolean;
      dayLabel: string;
      completionRatio: number;
    }[] = [];
    const now = new Date();

    for (let i = 118; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dOfWeek = d.getDay();

      const dueOnDay = habits.filter((h) => isHabitDueToday(h, dOfWeek));
      const doneOnDay = dueOnDay.filter((h) => (h.completedDates || []).includes(dStr));
      const ratio = dueOnDay.length > 0 ? doneOnDay.length / dueOnDay.length : 0;

      datesGrid.push({
        dateStr: dStr,
        isCompleted: ratio === 1 && dueOnDay.length > 0,
        isToday: dStr === todayStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        completionRatio: ratio,
      });
    }
    return datesGrid;
  }, [habits, todayStr]);

  const perfectDaysCount = useMemo(() => {
    return globalHeatmap.filter((c) => c.isCompleted).length;
  }, [globalHeatmap]);

  const currentPerfectStreak = useMemo(() => {
    let tempStreak = 0;
    for (let i = globalHeatmap.length - 1; i >= 0; i--) {
      const cell = globalHeatmap[i];
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
      data-component="HabitsModule"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-24 text-left font-sans select-none"
    >
      {/* Hero Greeting Card */}
      <Card
        padding="lg"
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#22C55E]">
            Daily Focus
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {greetingText}, Rahul
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5 leading-relaxed">
            Cultivate consistency with micro-actions. Track momentum across your daily rituals.
          </p>
        </div>

        {/* Actions & Progression */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold ${progression.color}`}>
            Lv. {progression.level} {progression.title}
          </div>
          <button
            onClick={() => handleOpenAddModal()}
            className="px-5 py-2.5 rounded-full text-[13px] font-semibold bg-text-primary text-background hover:opacity-90 transition-all flex items-center gap-2 border-none shadow-sm cursor-pointer"
          >
            <IconPlus size={16} /> New Habit
          </button>
        </div>
      </Card>

      {habits.length === 0 ? (
        <EmptyState
          icon={<IconCalendar className="w-10 h-10 text-text-secondary" />}
          title="Start Your First Habit"
          description="Track workouts, reading, code practice, or mindfulness to build lasting momentum."
          action={
            <button
              onClick={() => handleOpenAddModal()}
              className="px-5 py-2.5 rounded-full text-[13px] font-semibold bg-text-primary text-background hover:opacity-90 transition-all flex items-center gap-2 border-none shadow-sm cursor-pointer"
            >
              <IconPlus size={15} /> Add Habit
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Day Complete / Daily Reflection Card */}
          <DailyReflectionCard
            isVisible={(overallProgress === 1 && dueHabits.length > 0) || isReflecting}
            isReflecting={isReflecting}
            setIsReflecting={setIsReflecting}
            todayReflection={todayReflection}
            score={score}
            setScore={setScore}
            whatWentWell={whatWentWell}
            setWhatWentWell={setWhatWentWell}
            blockers={blockers}
            setBlockers={setBlockers}
            tomorrowPlan={tomorrowPlan}
            setTomorrowPlan={setTomorrowPlan}
            handleSaveReflection={handleSaveReflection}
          />

          {/* Stats Metrics */}
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

          {/* Checklist + Active Habit Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Checklist & Timeline daily journey */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <HabitChecklist
                dueHabits={dueHabits}
                todayStr={todayStr}
                overallProgress={overallProgress}
                completedTodayCount={completedTodayCount}
                activeFocusItem={activeFocusItem}
                setActiveFocusItem={setActiveFocusItem}
                handleToggleHabit={handleToggleHabit}
              />

              {/* Today's Check-in Log */}
              <TodayCheckinsCard
                completedHabitsList={completedHabitsList}
                todayStr={todayStr}
                todayReflection={todayReflection}
                setIsReflecting={setIsReflecting}
              />
            </div>

            {/* Right Column: List of Habit Cards */}
            <div className="lg:col-span-7 flex flex-col gap-4">
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
        habitType={habitType}
        setHabitType={setHabitType}
        whyText={whyText}
        setWhyText={setWhyText}
        targetTime={targetTime}
        setTargetTime={setTargetTime}
        handleSaveHabit={handleSaveHabit}
        deleteHabit={deleteHabit}
        showConfirm={showConfirm}
      />
    </motion.div>
  );
}
