import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconCalendar, IconCheck, IconWriting 
} from '@tabler/icons-react';
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

// Programmatic chime synthesis for completing all tasks
const playCelebratoryChime = () => {
  try {
    if (useAppStore.getState().settings.soundEnabled === false) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    
    o1.frequency.setValueAtTime(523.25, now); // C5
    o1.frequency.setValueAtTime(659.25, now + 0.08); // E5
    o2.frequency.setValueAtTime(783.99, now + 0.16); // G5
    
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    
    o1.connect(g);
    o2.connect(g);
    g.connect(ctx.destination);
    
    o1.start();
    o2.start(now + 0.08);
    o1.stop(now + 0.6);
    o2.stop(now + 0.6);
  } catch {}
};

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
  const [habitType, setHabitType] = useState<'generic' | 'reading' | 'coding' | 'meditation' | 'workout'>('generic');
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

  // Compute daily greeting
  const greetingText = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const totalCompletions = useMemo(() => {
    return habits.reduce((sum, h) => sum + (h.completedDates || []).length, 0);
  }, [habits]);

  // Progression level formula
  const progression = useMemo(() => {
    const tc = totalCompletions;
    if (tc < 10) return { level: 1, title: 'Rookie', color: 'text-text-secondary bg-surface-alt' };
    if (tc < 30) return { level: 2, title: 'Builder', color: 'text-blue-500 bg-blue-500/10' };
    if (tc < 70) return { level: 3, title: 'Momentum', color: 'text-purple-500 bg-purple-500/10' };
    if (tc < 150) return { level: 4, title: 'Master', color: 'text-amber-500 bg-amber-500/10' };
    return { level: 5, title: 'Discipline Legend', color: 'text-[#22C55E] bg-[#22C55E]/10' };
  }, [totalCompletions]);

  // Today's reflection lookup
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

  const handleToggleHabit = async (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;
    const isCurrentlyCompleted = (target.completedDates || []).includes(todayStr);

    if (!isCurrentlyCompleted) {
      const incompleteDueToday = dueHabits.filter((h) => h.id !== habitId && !(h.completedDates || []).includes(todayStr));
      if (incompleteDueToday.length === 0 && dueHabits.length > 0) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { detail: { type: 'habits' } }));
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

  const dueHabits = useMemo(() => {
    return habits.filter((h) => isHabitDueToday(h, todayDayOfWeek));
  }, [habits, todayDayOfWeek]);

  const completedTodayCount = useMemo(() => {
    return dueHabits.filter((h) => (h.completedDates || []).includes(todayStr)).length;
  }, [dueHabits, todayStr]);

  const completedHabitsList = useMemo(() => {
    return habits.filter((h) => (h.completedDates || []).includes(todayStr));
  }, [habits, todayStr]);

  const streakLeader = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce((prev, current) => ((prev.streak || 0) > (current.streak || 0) ? prev : current), habits[0]);
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
      <Card padding="lg" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <AnimatePresence>
            {((overallProgress === 1 && dueHabits.length > 0) || isReflecting) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
              >
                <Card padding="lg" className="flex flex-col gap-4 text-left">
                  {!todayReflection ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center pb-2 border-b border-border-hairline">
                        <div>
                          <h3 className="text-[16px] font-semibold text-[#22C55E] flex items-center gap-2">
                            Day Complete! 🎉
                          </h3>
                          <p className="text-[12px] text-text-secondary">
                            All targets completed for today. Log your daily reflection.
                          </p>
                        </div>
                        {isReflecting && (
                          <button 
                            onClick={() => setIsReflecting(false)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-alt border-none bg-transparent cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Score slider */}
                        <div className="flex flex-col gap-1.5 bg-surface-alt p-4 rounded-[var(--radius-row)]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                              Daily Score
                            </span>
                            <span className="text-[12px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded-full">
                              {score} / 10
                            </span>
                          </div>
                          <input
                            id="reflection-score"
                            name="reflectionScore"
                            type="range"
                            min={1}
                            max={10}
                            value={score}
                            onChange={(e) => setScore(parseInt(e.target.value))}
                            className="w-full accent-[#22C55E] cursor-pointer"
                          />
                        </div>

                        {/* What went well */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="reflection-went-well" className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                            What went well today?
                          </label>
                          <input
                            id="reflection-went-well"
                            type="text"
                            placeholder="e.g., Finished morning workout, read 15 pages"
                            value={whatWentWell}
                            onChange={(e) => setWhatWentWell(e.target.value)}
                            className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
                          />
                        </div>

                        {/* Blockers */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="reflection-blockers" className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                            Blockers / Challenges
                          </label>
                          <input
                            id="reflection-blockers"
                            type="text"
                            placeholder="e.g., Afternoon fatigue, distraction"
                            value={blockers}
                            onChange={(e) => setBlockers(e.target.value)}
                            className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
                          />
                        </div>

                        {/* Tomorrow plan */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="reflection-tomorrow" className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                            Tomorrow's Focus
                          </label>
                          <input
                            id="reflection-tomorrow"
                            type="text"
                            placeholder="e.g., Start focus session at 9 AM"
                            value={tomorrowPlan}
                            onChange={(e) => setTomorrowPlan(e.target.value)}
                            className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={handleSaveReflection}
                        className="px-6 py-2.5 rounded-full text-[13px] font-semibold bg-text-primary text-background hover:opacity-90 transition-all flex items-center justify-center gap-2 border-none shadow-sm cursor-pointer mt-1"
                      >
                        <IconCheck size={16} /> Save Daily Reflection
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5 text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-border-hairline">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#22C55E]">
                            Daily Reflection
                          </span>
                          <h4 className="text-[15px] font-semibold text-text-primary mt-0.5">
                            Today's Reflection Logged
                          </h4>
                        </div>
                        <span className="text-[12px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full">
                          Score: {todayReflection.score} / 10
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px] font-medium pt-1">
                        <div className="p-3.5 bg-surface-alt rounded-[var(--radius-row)] text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                            What went well
                          </span>
                          <p className="text-text-primary mt-1">{todayReflection.whatWentWell || '—'}</p>
                        </div>
                        <div className="p-3.5 bg-surface-alt rounded-[var(--radius-row)] text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                            Blockers
                          </span>
                          <p className="text-text-primary mt-1">{todayReflection.blockers || 'None'}</p>
                        </div>
                        <div className="p-3.5 bg-surface-alt rounded-[var(--radius-row)] text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                            Tomorrow's plan
                          </span>
                          <p className="text-text-primary mt-1">{todayReflection.tomorrowPlan || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

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
              <Card padding="md" className="flex flex-col gap-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-border-hairline">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    Today's Check-ins
                  </span>
                  {!todayReflection && (
                    <button
                      onClick={() => setIsReflecting(true)}
                      className="text-[11px] font-semibold text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 px-2.5 py-1 rounded-full border-none cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <IconWriting size={12} /> Reflect early
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col gap-2.5 pt-1 max-h-[220px] overflow-y-auto">
                  {completedHabitsList.length === 0 ? (
                    <p className="text-[12px] text-text-secondary text-center py-4">
                      Completed habits will appear here with timestamps.
                    </p>
                  ) : (
                    completedHabitsList.map((h) => {
                      const detail = h.completionDetails?.[todayStr] || { time: 'Logged today' };
                      return (
                        <div key={h.id} className="flex items-center justify-between p-2.5 rounded-[var(--radius-row)] bg-surface-alt text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0">
                              <IconCheck size={12} strokeWidth={2.5} />
                            </div>
                            <span className="text-[13px] font-semibold text-text-primary truncate">{h.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-text-secondary shrink-0">{detail.time}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
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
