import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconCalendar, IconCheck, IconWriting 
} from '@tabler/icons-react';
import { useAppStore, type Habit, type DailyReflection } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '../../components/ui/EmptyState';
import { HabitStats } from './components/HabitStats';
import { HabitCalendar } from './components/HabitCalendar';
import { HabitChecklist } from './components/HabitChecklist';
import { HabitCard } from './components/HabitCard';
import { HabitModal } from './components/HabitModal';
import { isHabitDueToday } from './utils';

// Programmatic chime synthesis for completing all tasks
const playCelebratoryChime = () => {
  try {
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
  } catch (e) {}
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
      habits: state.habits,
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
    return habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  }, [habits]);

  // Progression level formula
  const progression = useMemo(() => {
    const tc = totalCompletions;
    if (tc < 10) return { level: 1, title: 'Consistency Rookie', color: 'text-text-secondary bg-surface-alt' };
    if (tc < 30) return { level: 2, title: 'Habit Builder', color: 'text-blue-500 bg-blue-500/10' };
    if (tc < 70) return { level: 3, title: 'Momentum Seeker', color: 'text-purple-500 bg-purple-500/10' };
    if (tc < 150) return { level: 4, title: 'Streak Master', color: 'text-amber-500 bg-amber-500/10' };
    return { level: 5, title: 'Discipline Legend', color: 'text-emerald-500 bg-emerald-500/10' };
  }, [totalCompletions]);

  // Today's reflection lookup
  const todayReflection = useMemo(() => {
    return dailyReflections.find((r) => r.date === todayStr);
  }, [dailyReflections, todayStr]);

  const handleOpenAddModal = (habit?: Habit) => {
    if (habit) {
      setSelectedHabitToEdit(habit);
      setHabitName(habit.name);
      setDescription(habit.description);
      setFrequencyType(habit.frequencyType);
      setFrequencyDays(habit.frequencyDays);
      setFrequencyCount(habit.frequencyCount);
      setHabitType(habit.habitType || 'generic');
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
    const isCurrentlyCompleted = target.completedDates.includes(todayStr);

    if (!isCurrentlyCompleted) {
      const incompleteDueToday = dueHabits.filter((h) => h.id !== habitId && !h.completedDates.includes(todayStr));
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
    return dueHabits.filter((h) => h.completedDates.includes(todayStr)).length;
  }, [dueHabits, todayStr]);

  const completedHabitsList = useMemo(() => {
    return habits.filter((h) => h.completedDates.includes(todayStr));
  }, [habits, todayStr]);

  const streakLeader = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce((prev, current) => (prev.streak > current.streak ? prev : current), habits[0]);
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
      className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-24 text-left antialiased select-none font-sans"
    >
      {/* Dynamic Themed Greeting Block */}
      <div className="bg-surface border border-border text-text-primary p-7 rounded-[32px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="z-10 text-left">
          <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-550">Tactile Workspace</span>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            {greetingText}, Rahul
          </h1>
          <p className="text-xs text-text-secondary mt-1.5 max-w-2xl w-full leading-relaxed">
            Check off items below. Haptics and sound clicks will mark completion. Fill reflections when finished.
          </p>
        </div>
        
        {/* Level badge */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          <div className={`px-4 py-2 rounded-2xl flex flex-col items-center ${progression.color} border border-border/80`}>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Progression</span>
            <span className="text-xs font-black mt-0.5">Lv. {progression.level} {progression.title}</span>
          </div>
          <button onClick={() => handleOpenAddModal()} className="btn btn-primary btn-md rounded-2xl flex items-center gap-1.5 border-none h-11 cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all">
            <IconPlus size={16} /> New Habit
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={<IconCalendar className="w-10 h-10 text-text-muted" />}
          title="Create Your First Habit"
          description="Log daily exercises, learning paths, or code journals. Build up a strong streak tracker."
          action={
            <button onClick={() => handleOpenAddModal()} className="btn btn-primary btn-sm flex items-center gap-2 cursor-pointer">
              <IconPlus size={15} /> Add Habit
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          
          {/* Day Complete / Daily Reflection Dashboard Widget */}
          <AnimatePresence>
            {((overallProgress === 1 && dueHabits.length > 0) || isReflecting) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 p-6 rounded-[32px] flex flex-col gap-4 text-left shadow-sm"
              >
                {!todayReflection ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2.5 border-b border-emerald-500/10">
                      <div>
                        <h3 className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                          Day Complete! 🎉
                        </h3>
                        <p className="text-[10.5px] text-text-secondary font-bold">Crushed all of today's targets. Log your daily reflection score below.</p>
                      </div>
                      {isReflecting && (
                        <button 
                          onClick={() => setIsReflecting(false)}
                          className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-text-secondary bg-surface-alt hover:bg-surface-hover border-none cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Score slider */}
                      <div className="flex flex-col gap-1.5 bg-surface-alt/40 p-4.5 rounded-2xl border border-border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9.5px] font-black uppercase text-text-muted">Daily Score</span>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
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
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>

                      {/* What went well */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="reflection-went-well" className="text-[9.5px] font-black uppercase text-text-muted">What went well today?</label>
                        <input
                          id="reflection-went-well"
                          type="text"
                          placeholder="e.g. gym session felt great, did 2 hours coding"
                          value={whatWentWell}
                          onChange={(e) => setWhatWentWell(e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl px-3.5 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-emerald-500 placeholder:text-text-muted"
                        />
                      </div>

                      {/* Blockers */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="reflection-blockers" className="text-[9.5px] font-black uppercase text-text-muted">Blockers / Obstacles</label>
                        <input
                          id="reflection-blockers"
                          type="text"
                          placeholder="e.g. felt slightly tired in afternoon"
                          value={blockers}
                          onChange={(e) => setBlockers(e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl px-3.5 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-emerald-500 placeholder:text-text-muted"
                        />
                      </div>

                      {/* Tomorrow plan */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="reflection-tomorrow" className="text-[9.5px] font-black uppercase text-text-muted">Tomorrow's Focus</label>
                        <input
                          id="reflection-tomorrow"
                          type="text"
                          placeholder="e.g. start reading earlier, finish feature X"
                          value={tomorrowPlan}
                          onChange={(e) => setTomorrowPlan(e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl px-3.5 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-emerald-500 placeholder:text-text-muted"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveReflection}
                      className="btn btn-emerald btn-md w-full rounded-2xl flex items-center justify-center gap-1.5 font-bold h-11 text-white border-none cursor-pointer bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-colors"
                    >
                      <IconCheck size={16} /> Save Daily Reflection
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 text-left">
                    <div className="flex justify-between items-center pb-2.5 border-b border-emerald-500/10">
                      <div>
                        <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Daily Reflection</span>
                        <h4 className="text-sm font-bold text-text-primary mt-0.5">Today's Reflection Saved</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-xl">
                          Score: {todayReflection.score} / 10
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold pt-1">
                      <div className="p-3.5 bg-surface border border-border rounded-2xl text-left">
                        <span className="text-[9px] font-black uppercase text-text-muted">What went well</span>
                        <p className="text-text-primary mt-1 leading-relaxed">{todayReflection.whatWentWell || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 bg-surface border border-border rounded-2xl text-left">
                        <span className="text-[9px] font-black uppercase text-text-muted">Blockers</span>
                        <p className="text-text-primary mt-1 leading-relaxed">{todayReflection.blockers || 'None'}</p>
                      </div>
                      <div className="p-3.5 bg-surface border border-border rounded-2xl text-left">
                        <span className="text-[9px] font-black uppercase text-text-muted">Tomorrow's plan</span>
                        <p className="text-text-primary mt-1 leading-relaxed">{todayReflection.tomorrowPlan || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats & Streak analytics */}
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

          {/* Checklist + Active timelines layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
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

              {/* Timeline daily journey list */}
              <div className="bg-surface border border-border rounded-[32px] p-5 shadow-sm flex flex-col gap-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Today's Journey</span>
                  {!todayReflection && (
                    <button
                      onClick={() => setIsReflecting(true)}
                      className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border-none cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <IconWriting size={11} /> Reflect early
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col gap-3.5 pt-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {completedHabitsList.length === 0 ? (
                    <p className="text-[10.5px] italic text-text-muted text-center py-6">
                      Timestamps will record as check-offs happen.
                    </p>
                  ) : (
                    completedHabitsList.map((h, index) => {
                      const detail = h.completionDetails?.[todayStr] || { time: '12:00 PM' };
                      return (
                        <div key={h.id} className="flex gap-3 relative text-left">
                          {/* Line tracker */}
                          {index < completedHabitsList.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-border" />
                          )}
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <IconCheck size={11} strokeWidth={3.5} />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="text-xs font-bold text-text-primary truncate">{h.name}</span>
                              <span className="text-[10px] font-bold text-text-muted shrink-0 font-mono">{detail.time}</span>
                            </div>
                            {detail.value && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/80 leading-none block mt-0.5">
                                +{detail.value} {detail.unit || 'actions'} logged today
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: List of Habit Cards */}
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
