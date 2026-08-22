import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IconEdit, IconFlame, IconClock, IconTarget } from '@tabler/icons-react';
import { useAppStore, type Habit } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { StatCard } from '../../components/ui/StatCard';
import { SESSIONS, PRESETS, pad, type SessionId } from './constants';
import { PomodoroTargetCard } from './components/PomodoroTargetCard';
import { PomodoroClockCard } from './components/PomodoroClockCard';
import { PomodoroAnalyticsCards } from './components/PomodoroAnalyticsCards';

export default function PomodoroModule() {
  const {
    pomodoroStats,
    todoTasks,
    pomodoroSecondsLeft,
    pomodoroTotalSeconds,
    pomodoroTimerState,
    pomodoroSessionId,
    pomodoroStreak,
    pomodoroAssociatedTaskId,
    setPomodoroSecondsLeft,
    setPomodoroTotalSeconds,
    setPomodoroSessionId,
    setPomodoroAssociatedTaskId,
    startGlobalPomodoro,
    pauseGlobalPomodoro,
    resumeGlobalPomodoro,
    stopGlobalPomodoro,
    skipGlobalPomodoro,
    habits,
  } = useAppStore(
    useShallow((state) => ({
      pomodoroStats: state.pomodoroStats || { totalSessions: 0, totalMinutes: 0 },
      todoTasks: state.todoTasks || [],
      pomodoroSecondsLeft: state.pomodoroSecondsLeft,
      pomodoroTotalSeconds: state.pomodoroTotalSeconds,
      pomodoroTimerState: state.pomodoroTimerState,
      pomodoroSessionId: state.pomodoroSessionId,
      pomodoroStreak: state.pomodoroStreak,
      pomodoroAssociatedTaskId: state.pomodoroAssociatedTaskId,
      setPomodoroSecondsLeft: state.setPomodoroSecondsLeft,
      setPomodoroTotalSeconds: state.setPomodoroTotalSeconds,
      setPomodoroSessionId: state.setPomodoroSessionId,
      setPomodoroAssociatedTaskId: state.setPomodoroAssociatedTaskId,
      startGlobalPomodoro: state.startGlobalPomodoro,
      pauseGlobalPomodoro: state.pauseGlobalPomodoro,
      resumeGlobalPomodoro: state.resumeGlobalPomodoro,
      stopGlobalPomodoro: state.stopGlobalPomodoro,
      skipGlobalPomodoro: state.skipGlobalPomodoro,
      habits: state.habits || [],
    })),
  );

  const addToast = useToastStore((s) => s.addToast);

  // Cosmetic Customization States
  const [fontStyle, setFontStyle] = useState<'font-mono' | 'font-sans' | 'font-serif'>('font-mono');
  const [ringStyle, setRingStyle] = useState<
    'solid' | 'dashed' | 'glowing' | 'dotted' | 'double'
  >('solid');

  // Custom Task Session configs
  const [customSessions, setCustomSessions] = useState<
    Record<string, { minutes: number; total: number }>
  >(() => {
    try {
      const raw = localStorage.getItem('phq_task_custom_sessions');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Daily Goal States
  const [dailyGoal, setDailyGoal] = useState(4);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(4);
  const todaySessions = (pomodoroStreak || 0) % dailyGoal;

  const weeklyFocusData = useMemo(() => {
    const days = [];
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    const seeds: { [key: number]: number } = {
      0: 30,
      1: 45,
      2: 25,
      3: 50,
      4: 30,
      5: 40,
      6: 15,
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayIndex = d.getDay();
      const isToday = i === 0;

      const minutes = isToday ? todaySessions * 25 : seeds[dayIndex] || 0;

      days.push({
        label: labels[dayIndex],
        minutes,
        isToday,
      });
    }
    return days;
  }, [todaySessions]);

  const [ringSize, setRingSize] = useState(260);
  useEffect(() => {
    const handleResize = () => {
      setRingSize(window.innerWidth < 640 ? 200 : 260);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const session = SESSIONS.find((s) => s.id === pomodoroSessionId) || SESSIONS[0];
  const progress =
    pomodoroTotalSeconds > 0 ? 1 - pomodoroSecondsLeft / pomodoroTotalSeconds : 1;
  const mins = Math.floor(pomodoroSecondsLeft / 60);
  const secs = pomodoroSecondsLeft % 60;
  const display = `${pad(mins)}:${pad(secs)}`;

  const applyTimer = useCallback(
    (minutes: number, sid: SessionId) => {
      stopGlobalPomodoro();
      setPomodoroSessionId(sid);
      setPomodoroTotalSeconds(minutes * 60);
      setPomodoroSecondsLeft(minutes * 60);
    },
    [stopGlobalPomodoro, setPomodoroSessionId, setPomodoroTotalSeconds, setPomodoroSecondsLeft],
  );

  const handleAssociatedTaskChange = (id: string | null) => {
    setPomodoroAssociatedTaskId(id);
    if (id) {
      localStorage.setItem('pomodoro_associated_task_id', id);
      if (customSessions[id]) {
        applyTimer(customSessions[id].minutes, 'focus');
      }
    } else {
      localStorage.removeItem('pomodoro_associated_task_id');
    }
  };

  const handleCustomPreset = () => {
    const minStr = prompt('Enter custom minutes (1-180):');
    if (!minStr) return;
    const min = parseInt(minStr, 10);
    if (!isNaN(min) && min > 0 && min <= 180) {
      applyTimer(min, pomodoroSessionId);
    } else {
      addToast('Invalid time', 'Please enter a number between 1 and 180.', 'error');
    }
  };

  const isRunning = pomodoroTimerState === 'running';

  const togglePlayPause = () => {
    if (pomodoroTimerState === 'idle') startGlobalPomodoro();
    else if (pomodoroTimerState === 'running') pauseGlobalPomodoro();
    else resumeGlobalPomodoro();
  };

  const saveGoal = () => {
    setDailyGoal(tempGoal);
    setIsEditingGoal(false);
  };

  const associatedTask = todoTasks.find((t) => t.id === pomodoroAssociatedTaskId);
  const associatedHabit = pomodoroAssociatedTaskId?.startsWith('habit-')
    ? habits.find((h: Habit) => h.id === pomodoroAssociatedTaskId.replace('habit-', ''))
    : null;

  return (
    <motion.div
      data-component="PomodoroModule"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20 text-left font-sans select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Pomodoro Focus
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Deep, uninterrupted work sessions designed for flow state.
          </p>
        </div>

        {/* Session Type Pill Switcher */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-full shadow-xs max-w-full overflow-x-auto no-scrollbar">
          {SESSIONS.map((s) => {
            const isActive = pomodoroSessionId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => applyTimer(s.minutes, s.id)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11.5px] sm:text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap border-none ${
                  isActive
                    ? 'bg-text-primary text-background shadow-xs'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target selector and custom session parameters */}
      <PomodoroTargetCard
        todoTasks={todoTasks}
        habits={habits}
        pomodoroAssociatedTaskId={pomodoroAssociatedTaskId}
        handleAssociatedTaskChange={handleAssociatedTaskChange}
        associatedTask={associatedTask}
        customSessions={customSessions}
        setCustomSessions={setCustomSessions}
        applyTimer={applyTimer}
      />

      {/* Preset Duration Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1 no-scrollbar max-w-full">
        {PRESETS.map((m) => {
          const isActive = pomodoroTotalSeconds === m * 60 && pomodoroTimerState === 'idle';
          return (
            <button
              key={m}
              onClick={() => applyTimer(m, pomodoroSessionId)}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11.5px] sm:text-[12px] font-semibold transition-all border-none cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-text-primary text-background shadow-xs'
                  : 'bg-surface hover:bg-surface-alt text-text-secondary hover:text-text-primary shadow-xs'
              }`}
            >
              {m}m
            </button>
          );
        })}
        <button
          onClick={handleCustomPreset}
          className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11.5px] sm:text-[12px] font-semibold bg-surface hover:bg-surface-alt text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 border-none shadow-xs cursor-pointer whitespace-nowrap"
        >
          Custom <IconEdit size={13} />
        </button>
      </div>

      {/* Main Clock Card */}
      <PomodoroClockCard
        pomodoroSessionId={pomodoroSessionId}
        display={display}
        fontStyle={fontStyle}
        pomodoroStreak={pomodoroStreak}
        associatedTask={associatedTask}
        associatedHabit={associatedHabit}
        isRunning={isRunning}
        pomodoroTimerState={pomodoroTimerState}
        togglePlayPause={togglePlayPause}
        stopGlobalPomodoro={stopGlobalPomodoro}
        skipGlobalPomodoro={skipGlobalPomodoro}
        ringSize={ringSize}
        progress={progress}
        sessionColor={session.color}
        ringStyle={ringStyle}
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Current Streak"
          value={`${pomodoroStreak} sessions`}
          subtitle={
            pomodoroStreak > 0 ? 'Momentum is strong!' : 'Start a session to build momentum'
          }
          icon={<IconFlame size={20} className="text-[#FF7A45]" />}
          trend={
            pomodoroStreak > 0 ? { value: `${pomodoroStreak} in flow`, isPositive: true } : undefined
          }
        />
        <StatCard
          title="Total Sessions"
          value={String(pomodoroStats.totalSessions || 0)}
          subtitle="All-time completed sessions"
          icon={<IconClock size={20} className="text-text-primary" />}
        />
        <StatCard
          title="Minutes Focused"
          value={`${pomodoroStats.totalMinutes || 0}m`}
          subtitle="Total deep work recorded"
          icon={<IconTarget size={20} className="text-[#22C55E]" />}
        />
      </div>

      {/* Daily Progress, Weekly Focus Trend & Customization */}
      <PomodoroAnalyticsCards
        todaySessions={todaySessions}
        dailyGoal={dailyGoal}
        setDailyGoal={setDailyGoal}
        isEditingGoal={isEditingGoal}
        setIsEditingGoal={setIsEditingGoal}
        tempGoal={tempGoal}
        setTempGoal={setTempGoal}
        saveGoal={saveGoal}
        weeklyFocusData={weeklyFocusData}
        fontStyle={fontStyle}
        setFontStyle={setFontStyle}
        ringStyle={ringStyle}
        setRingStyle={setRingStyle}
      />
    </motion.div>
  );
}
