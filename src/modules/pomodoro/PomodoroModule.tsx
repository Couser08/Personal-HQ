import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlayerPlay, IconPlayerPause, IconEdit, IconCheck,
  IconFlame, IconClock, IconTarget, IconSparkles, IconArrowRight
} from '@tabler/icons-react';
import { useAppStore, type Habit } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';

const SESSIONS = [
  { id: 'focus',        label: 'Focus Session',        minutes: 25, color: '#111111' },
  { id: 'short-break',  label: 'Short Break',          minutes: 5,  color: '#22C55E' },
  { id: 'long-break',   label: 'Long Break',           minutes: 15, color: '#3B82F6' },
] as const;

type SessionId = typeof SESSIONS[number]['id'];
const PRESETS = [5, 10, 20, 25, 45, 60];

const pad = (n: number) => String(n).padStart(2, '0');

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
    habits
  } = useAppStore(useShallow(state => ({
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
    habits: state.habits || []
  })));

  const addToast = useToastStore(s => s.addToast);

  // Cosmetic Customization States
  const [fontStyle, setFontStyle] = useState<'font-mono' | 'font-sans' | 'font-serif'>('font-mono');
  const [ringStyle, setRingStyle] = useState<'solid' | 'dashed' | 'glowing' | 'dotted' | 'double'>('solid');

  // Custom Task Session configs
  const [customSessions, setCustomSessions] = useState<Record<string, { minutes: number; total: number }>>(() => {
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
      0: 30, 1: 45, 2: 25, 3: 50, 4: 30, 5: 40, 6: 15,
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayIndex = d.getDay();
      const isToday = i === 0;
      
      const minutes = isToday 
        ? todaySessions * 25
        : (seeds[dayIndex] || 0);

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

  const session = SESSIONS.find(s => s.id === pomodoroSessionId) || SESSIONS[0];
  const progress = pomodoroTotalSeconds > 0 ? 1 - (pomodoroSecondsLeft / pomodoroTotalSeconds) : 1;
  const mins = Math.floor(pomodoroSecondsLeft / 60);
  const secs = pomodoroSecondsLeft % 60;
  const display = `${pad(mins)}:${pad(secs)}`;

  const applyTimer = useCallback((minutes: number, sid: SessionId) => {
    stopGlobalPomodoro();
    setPomodoroSessionId(sid);
    setPomodoroTotalSeconds(minutes * 60);
    setPomodoroSecondsLeft(minutes * 60);
  }, [stopGlobalPomodoro, setPomodoroSessionId, setPomodoroTotalSeconds, setPomodoroSecondsLeft]);

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

  const associatedTask = todoTasks.find(t => t.id === pomodoroAssociatedTaskId);
  const associatedHabit = pomodoroAssociatedTaskId?.startsWith('habit-')
    ? habits.find((h: Habit) => h.id === pomodoroAssociatedTaskId.replace('habit-', ''))
    : null;

  return (
    <motion.div
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
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-full shadow-sm">
          {SESSIONS.map((s) => {
            const isActive = pomodoroSessionId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => applyTimer(s.minutes, s.id)}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer border-none ${
                  isActive
                    ? 'bg-text-primary text-background shadow-sm'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Association Row */}
      <Card padding="md" className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-surface-alt text-text-primary">
            <IconTarget size={18} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-text-primary">Focus Target</h3>
            <p className="text-[11px] text-text-secondary">Attach a todo item or habit to this timer</p>
          </div>
        </div>
        
        <div>
          <select
            value={pomodoroAssociatedTaskId || ''}
            onChange={e => handleAssociatedTaskChange(e.target.value || null)}
            className="bg-surface-alt rounded-[var(--radius-input)] px-4 py-2.5 text-[13px] font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary cursor-pointer min-w-56 border-none"
          >
            <option value="">No Associated Target</option>
            <optgroup label="To-Do Tasks">
              {todoTasks.filter(t => !t.completed && !t.deleted).map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} {task.pomodoroCount ? `(🍅 ${task.pomodoroCount})` : ''}
                </option>
              ))}
            </optgroup>
            <optgroup label="Habits">
              {habits.map((habit: Habit) => (
                <option key={habit.id} value={`habit-${habit.id}`}>
                  {habit.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </Card>

      {/* Custom Task Session setup (if active task) */}
      {associatedTask && (
        <Card padding="md" className="flex flex-col gap-3 -mt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <IconSparkles size={16} className="text-text-primary" />
              <div>
                <h4 className="text-[13px] font-semibold text-text-primary">Custom Target for "{associatedTask.title}"</h4>
                <p className="text-[11px] text-text-secondary">Configure specific duration and quota for this item</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!customSessions[associatedTask.id]}
                onChange={(e) => {
                  if (e.target.checked) {
                    const updated = { ...customSessions, [associatedTask.id]: { minutes: 25, total: 4 } };
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                    applyTimer(25, 'focus');
                  } else {
                    const updated = { ...customSessions };
                    delete updated[associatedTask.id];
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-text-primary"></div>
            </label>
          </div>

          {customSessions[associatedTask.id] && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-hairline">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Minutes</label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customSessions[associatedTask.id].minutes}
                  onChange={(e) => {
                    const m = Math.max(1, parseInt(e.target.value) || 25);
                    const updated = { ...customSessions, [associatedTask.id]: { ...customSessions[associatedTask.id], minutes: m } };
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                    applyTimer(m, 'focus');
                  }}
                  className="bg-surface-alt rounded-[var(--radius-input)] px-3 py-2 text-[13px] font-medium text-text-primary outline-none border-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Target Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={customSessions[associatedTask.id].total}
                  onChange={(e) => {
                    const tot = Math.max(1, parseInt(e.target.value) || 4);
                    const updated = { ...customSessions, [associatedTask.id]: { ...customSessions[associatedTask.id], total: tot } };
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                  }}
                  className="bg-surface-alt rounded-[var(--radius-input)] px-3 py-2 text-[13px] font-medium text-text-primary outline-none border-none"
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Preset Duration Buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        {PRESETS.map(m => {
          const isActive = pomodoroTotalSeconds === m * 60 && pomodoroTimerState === 'idle';
          return (
            <button
              key={m}
              onClick={() => applyTimer(m, pomodoroSessionId)}
              className={`px-5 py-2 rounded-full text-[12px] font-semibold transition-all border-none cursor-pointer ${
                isActive
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-surface hover:bg-surface-alt text-text-secondary hover:text-text-primary shadow-sm'
              }`}
            >
              {m}m
            </button>
          );
        })}
        <button
          onClick={handleCustomPreset}
          className="px-5 py-2 rounded-full text-[12px] font-semibold bg-surface hover:bg-surface-alt text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
        >
          Custom <IconEdit size={13} />
        </button>
      </div>

      {/* Main Clock Card */}
      <Card padding="lg" className="flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 relative overflow-hidden">
        {/* Left pane: digital clock & controls */}
        <div className="flex-1 flex flex-col justify-center gap-6 text-center md:text-left w-full">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block mb-2">
              {pomodoroSessionId === 'focus' ? 'Focus Mode' : 'Break Time'}
            </span>
            
            <div className={`text-6xl sm:text-7xl md:text-[6.5rem] leading-none font-semibold tracking-tight text-text-primary select-none ${fontStyle}`}>
              {display}
            </div>
            
            <div className="mt-6 flex flex-col gap-2 items-center md:items-start">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[12px] font-semibold bg-surface-alt text-text-primary">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                {pomodoroSessionId === 'focus' ? `Session ${pomodoroStreak + 1}` : 'Rest & Recharge'}
              </span>
              {associatedTask && (
                <span className="text-[13px] text-text-secondary">
                  🎯 Target: <span className="font-semibold text-text-primary">{associatedTask.title}</span>
                </span>
              )}
              {associatedHabit && (
                <span className="text-[13px] text-text-secondary">
                  🔥 Habit: <span className="font-semibold text-text-primary">{associatedHabit.name}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <button
              onClick={togglePlayPause}
              className="px-8 py-3 rounded-full text-[14px] font-semibold bg-text-primary text-background hover:opacity-90 transition-all flex items-center gap-2 border-none shadow-sm cursor-pointer"
            >
              {isRunning ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={stopGlobalPomodoro}
              disabled={pomodoroTimerState === 'idle'}
              className="px-5 py-3 rounded-full text-[13px] font-semibold bg-surface-alt hover:bg-neutral-200 dark:hover:bg-neutral-800 text-text-primary transition-all disabled:opacity-40 border-none cursor-pointer"
            >
              Stop
            </button>
            <button
              onClick={skipGlobalPomodoro}
              disabled={pomodoroTimerState === 'idle'}
              className="px-5 py-3 rounded-full text-[13px] font-semibold bg-surface-alt hover:bg-neutral-200 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 border-none cursor-pointer flex items-center gap-1"
            >
              <IconArrowRight size={15} /> Skip
            </button>
          </div>
        </div>

        {/* Vertical Hairline Divider */}
        <div className="hidden md:block w-px h-56 bg-border-hairline" />

        {/* Right pane: Radial Progress Ring */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full">
          <div 
            className="relative flex items-center justify-center" 
            style={{ width: ringSize, height: ringSize }}
          >
            <ProgressRing 
              progress={progress} 
              size={ringSize} 
              strokeWidth={8} 
              color={pomodoroSessionId === 'focus' ? '#111111' : session.color} 
              style={ringStyle} 
            />
            
            {/* Center interactive button */}
            <button
              onClick={togglePlayPause}
              aria-label={isRunning ? 'Pause' : 'Play'}
              className="absolute w-20 h-20 rounded-full bg-surface shadow-float flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-10 cursor-pointer border-none"
            >
              {isRunning ? (
                <IconPlayerPause size={28} className="text-text-primary" />
              ) : (
                <IconPlayerPlay size={28} className="text-text-primary translate-x-0.5" />
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Current Streak"
          value={`${pomodoroStreak} sessions`}
          subtitle={pomodoroStreak > 0 ? 'Momentum is strong!' : 'Start a session to build momentum'}
          icon={<IconFlame size={20} className="text-[#FF7A45]" />}
          trend={pomodoroStreak > 0 ? { value: `${pomodoroStreak} in flow`, isPositive: true } : undefined}
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

      {/* Daily Progress & Weekly Focus Trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Today's Target */}
        <Card padding="md" className="flex flex-col justify-between h-[260px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-text-primary">Daily Goal</h3>
                <p className="text-[12px] text-text-secondary mt-0.5">
                  {Math.floor((todaySessions / dailyGoal) * 100)}% accomplished
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Target</span>
            </div>
            
            <div className="mt-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-semibold text-text-primary">
                  {todaySessions} <span className="text-[13px] text-text-secondary font-normal">/ {dailyGoal} sessions</span>
                </span>
                <span className="text-[12px] font-semibold text-[#22C55E]">
                  {todaySessions >= dailyGoal ? 'Goal Met! 🎉' : 'In progress'}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300 bg-[#22C55E]" 
                  style={{ width: `${Math.min(100, (todaySessions / dailyGoal) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border-hairline pt-3 flex items-center justify-between">
            {isEditingGoal ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-[12px] text-text-secondary">Daily Goal:</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min={1} 
                    value={tempGoal} 
                    onChange={e => setTempGoal(Number(e.target.value))} 
                    className="w-14 bg-surface-alt rounded-[var(--radius-input)] px-2 py-1 text-[12px] outline-none text-text-primary text-center font-semibold border-none" 
                  />
                  <button 
                    onClick={saveGoal} 
                    className="w-7 h-7 rounded-full bg-[#22C55E] text-white flex items-center justify-center cursor-pointer border-none"
                  >
                    <IconCheck size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-[12px] text-text-secondary">Target: {dailyGoal} sessions</span>
                <button 
                  onClick={() => { setTempGoal(dailyGoal); setIsEditingGoal(true); }} 
                  className="px-3 py-1 rounded-full bg-surface-alt text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 border-none cursor-pointer"
                >
                  <IconEdit size={12} /> Edit
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Weekly Trend */}
        <Card padding="md" className="flex flex-col justify-between h-[260px]">
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary">Weekly Trend</h3>
            <p className="text-[12px] text-text-secondary mt-0.5">Focus minutes distribution</p>
          </div>

          <div className="h-32 flex flex-col justify-end select-none">
            <div className="flex items-end justify-between h-24 gap-2">
              {weeklyFocusData.map((day, idx) => {
                const maxMinutes = Math.max(...weeklyFocusData.map(d => d.minutes), 60);
                const barHeightPct = Math.round((day.minutes / maxMinutes) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    <div 
                      className={`w-full rounded-t-lg transition-colors cursor-pointer ${
                        day.isToday 
                          ? 'bg-[#FF7A45]' 
                          : 'bg-surface-alt hover:bg-neutral-300 dark:hover:bg-neutral-700'
                      }`}
                      style={{ height: `${Math.max(10, barHeightPct)}%` }}
                    />
                    <span className="text-[10px] font-medium text-text-secondary">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Timer Customization */}
        <Card padding="md" className="flex flex-col justify-between h-[260px]">
          <h3 className="text-[14px] font-semibold text-text-primary">Customization</h3>
          
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                Typography
              </span>
              <div className="flex gap-1.5 bg-surface-alt p-1 rounded-full">
                <button onClick={() => setFontStyle('font-mono')} className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${fontStyle === 'font-mono' ? 'bg-text-primary text-background font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>Mono</button>
                <button onClick={() => setFontStyle('font-sans')} className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${fontStyle === 'font-sans' ? 'bg-text-primary text-background font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>Sans</button>
                <button onClick={() => setFontStyle('font-serif')} className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${fontStyle === 'font-serif' ? 'bg-text-primary text-background font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>Serif</button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                Ring Dial
              </span>
              <div className="flex gap-1.5 bg-surface-alt p-1 rounded-full">
                <button onClick={() => setRingStyle('solid')} className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${ringStyle === 'solid' ? 'bg-text-primary text-background font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>Solid</button>
                <button onClick={() => setRingStyle('dashed')} className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${ringStyle === 'dashed' ? 'bg-text-primary text-background font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>Dashed</button>
                <button onClick={() => setRingStyle('dotted')} className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${ringStyle === 'dotted' ? 'bg-text-primary text-background font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}>Dotted</button>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-input)] bg-surface-alt px-3 py-1.5 text-[11px] text-text-secondary">
            Settings auto-persist across sessions.
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
