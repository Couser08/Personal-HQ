import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlayerPlay, IconPlayerPause, IconEdit, IconCheck,
  IconFlame, IconClock, IconTarget, IconSparkles
} from '@tabler/icons-react';
import { useAppStore, type Habit } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { ProgressRing } from '../../components/ui/ProgressRing';

const SESSIONS = [
  { id: 'focus',        label: 'Focus Session',        minutes: 25, color: '#f43f5e', hex2: 'rgba(244,63,94,0.06)' },
  { id: 'short-break',  label: 'Short Break',          minutes: 5,  color: '#22c55e', hex2: 'rgba(34,197,94,0.06)'  },
  { id: 'long-break',   label: 'Long Break',           minutes: 15, color: '#3b82f6', hex2: 'rgba(59,130,246,0.06)' },
] as const;

type SessionId = typeof SESSIONS[number]['id'];
const PRESETS = [5, 10, 20, 25, 45, 60];

const pad = (n: number) => String(n).padStart(2, '0');

// Page-scoped Theme overrides
const themeStyles = {
  default: '',
  'tokyo-sakura': `
    .pomodoro-wrapper {
      position: relative;
      background: radial-gradient(circle at top right, #ffd6e0 0%, #fff0f3 100%) !important;
      --bg-surface: rgba(255, 255, 255, 0.45) !important;
      --bg-surface-alt: rgba(255, 255, 255, 0.65) !important;
      --border-border: rgba(249, 203, 211, 0.7) !important;
      --text-primary: #471018 !important;
      --text-secondary: #7a3541 !important;
      --text-muted: #af6b77 !important;
      --color-primary: #ff5e7e !important;
      border-radius: 32px !important;
      padding: 28px !important;
      box-shadow: 0 20px 40px rgba(255, 94, 126, 0.04), inset 0 0 80px rgba(255, 255, 255, 0.6) !important;
      border: 1px solid rgba(249, 203, 211, 0.5) !important;
      backdrop-filter: blur(12px) !important;
      overflow: hidden;
    }
    .dark .pomodoro-wrapper {
      background: radial-gradient(circle at top right, #2b1419 0%, #1a0b0e 100%) !important;
      --bg-surface: rgba(26, 14, 17, 0.55) !important;
      --bg-surface-alt: rgba(38, 20, 24, 0.55) !important;
      --border-border: rgba(82, 38, 46, 0.55) !important;
      --text-primary: #ffdce1 !important;
      --text-secondary: #d69ca6 !important;
      --text-muted: #9c626d !important;
      --color-primary: #ff5e7e !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), inset 0 0 80px rgba(255, 94, 126, 0.01) !important;
      border: 1px solid rgba(82, 38, 46, 0.35) !important;
    }
    /* Force background, border, text color on internal cards */
    .pomodoro-wrapper .bg-surface {
      background-color: var(--bg-surface) !important;
      border-color: var(--border-border) !important;
      box-shadow: 0 4px 12px rgba(255, 94, 126, 0.02) !important;
    }
    .pomodoro-wrapper .bg-surface-alt {
      background-color: var(--bg-surface-alt) !important;
      border-color: var(--border-border) !important;
    }
    .pomodoro-wrapper select {
      background-color: var(--bg-surface-alt) !important;
      border-color: var(--border-border) !important;
      color: var(--text-primary) !important;
    }
    .pomodoro-wrapper .border,
    .pomodoro-wrapper .border-border,
    .pomodoro-wrapper .border-t,
    .pomodoro-wrapper .divide-y > * {
      border-color: var(--border-border) !important;
    }
    .pomodoro-wrapper .text-text-primary {
      color: var(--text-primary) !important;
    }
    .pomodoro-wrapper .text-text-secondary {
      color: var(--text-secondary) !important;
    }
    .pomodoro-wrapper .text-text-muted {
      color: var(--text-muted) !important;
    }
    /* Sakura petals styling */
    @keyframes fall {
      0% {
        transform: translateY(-20px) rotate(0deg) translateX(0);
        opacity: 0;
      }
      10% { opacity: 0.7; }
      90% { opacity: 0.7; }
      100% {
        transform: translateY(600px) rotate(360deg) translateX(80px);
        opacity: 0;
      }
    }
    .sakura-petal {
      position: absolute;
      background: linear-gradient(135deg, #ffc0cb 0%, #ffb7c5 100%);
      border-radius: 150% 0 150% 150%;
      pointer-events: none;
      transform-origin: left top;
      box-shadow: 0 1px 3px rgba(255, 94, 126, 0.1);
      z-index: 0;
    }
    .sakura-petal-1 { left: 8%; width: 11px; height: 7px; animation: fall 7s linear infinite; animation-delay: 0s; }
    .sakura-petal-2 { left: 24%; width: 14px; height: 9px; animation: fall 9s linear infinite; animation-delay: 1.5s; }
    .sakura-petal-3 { left: 38%; width: 9px; height: 6px; animation: fall 6s linear infinite; animation-delay: 3s; }
    .sakura-petal-4 { left: 52%; width: 15px; height: 10px; animation: fall 11s linear infinite; animation-delay: 0.8s; }
    .sakura-petal-5 { left: 66%; width: 12px; height: 8px; animation: fall 8s linear infinite; animation-delay: 4.2s; }
    .sakura-petal-6 { left: 80%; width: 13px; height: 8px; animation: fall 10s linear infinite; animation-delay: 2.1s; }
    .sakura-petal-7 { left: 16%; width: 10px; height: 7px; animation: fall 10s linear infinite; animation-delay: 5s; }
    .sakura-petal-8 { left: 32%; width: 12px; height: 8px; animation: fall 7.5s linear infinite; animation-delay: 1.1s; }
    .sakura-petal-9 { left: 58%; width: 14px; height: 9px; animation: fall 9.2s linear infinite; animation-delay: 6s; }
    .sakura-petal-10 { left: 74%; width: 9px; height: 6px; animation: fall 12s linear infinite; animation-delay: 0.4s; }
    .sakura-petal-11 { left: 88%; width: 11px; height: 7px; animation: fall 8.2s linear infinite; animation-delay: 3.5s; }
    .sakura-petal-12 { left: 45%; width: 13px; height: 9px; animation: fall 8.8s linear infinite; animation-delay: 2.5s; }
  `,
  'dark-academia': `
    .pomodoro-wrapper {
      position: relative;
      background: #fdfbf7 url('https://www.transparenttextures.com/patterns/cream-paper.png') !important;
      --bg-surface: #ffffff !important;
      --bg-surface-alt: #f5f5f7 !important;
      --border-border: #e4e4e7 !important;
      --text-primary: #18181b !important;
      --text-secondary: #52525b !important;
      --text-muted: #a1a1aa !important;
      --color-primary: #1d4ed8 !important;
      border-radius: 24px !important;
      padding: 28px !important;
      border: 1px solid #e4e4e7 !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04) !important;
      overflow: hidden;
    }
    .dark .pomodoro-wrapper {
      background: #18181b url('https://www.transparenttextures.com/patterns/black-paper.png') !important;
      --bg-surface: #27272a !important;
      --bg-surface-alt: #1f1f22 !important;
      --border-border: #3f3f46 !important;
      --text-primary: #f4f4f5 !important;
      --text-secondary: #a1a1aa !important;
      --text-muted: #71717a !important;
      --color-primary: #3b82f6 !important;
      border: 1px solid #3f3f46 !important;
      box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.4), 0 15px 30px rgba(0, 0, 0, 0.3) !important;
    }
    /* Font override for all children for Academia vibe */
    .pomodoro-wrapper, 
    .pomodoro-wrapper select, 
    .pomodoro-wrapper button, 
    .pomodoro-wrapper span, 
    .pomodoro-wrapper p, 
    .pomodoro-wrapper h1, 
    .pomodoro-wrapper h2, 
    .pomodoro-wrapper h3, 
    .pomodoro-wrapper h4,
    .pomodoro-wrapper select option {
      font-family: Georgia, 'Times New Roman', Cambria, serif !important;
    }
    /* Force background, border, text color on internal cards */
    .pomodoro-wrapper .bg-surface {
      background-color: var(--bg-surface) !important;
      border-color: var(--border-border) !important;
      box-shadow: none !important;
    }
    .pomodoro-wrapper .bg-surface-alt {
      background-color: var(--bg-surface-alt) !important;
      border-color: var(--border-border) !important;
    }
    .pomodoro-wrapper select {
      background-color: var(--bg-surface-alt) !important;
      border-color: var(--border-border) !important;
      color: var(--text-primary) !important;
    }
    .pomodoro-wrapper .border,
    .pomodoro-wrapper .border-border,
    .pomodoro-wrapper .border-t,
    .pomodoro-wrapper .divide-y > * {
      border-color: var(--border-border) !important;
    }
    .pomodoro-wrapper .text-text-primary {
      color: var(--text-primary) !important;
    }
    .pomodoro-wrapper .text-text-secondary {
      color: var(--text-secondary) !important;
    }
    .pomodoro-wrapper .text-text-muted {
      color: var(--text-muted) !important;
    }
    /* Candlelight flicker effect */
    @keyframes flicker {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 0.28; }
      25% { opacity: 0.2; }
      75% { opacity: 0.24; }
    }
    @keyframes float-up {
      0% {
        transform: translateY(600px) translateX(0) scale(0.6);
        opacity: 0;
      }
      20% { opacity: 0.35; }
      80% { opacity: 0.35; }
      100% {
        transform: translateY(-40px) translateX(30px) scale(1.1);
        opacity: 0;
      }
    }
    .candle-flicker-overlay {
      background: radial-gradient(circle at 50% 50%, rgba(253, 186, 116, 0.09) 0%, transparent 65%);
      animation: flicker 5s infinite alternate ease-in-out;
      pointer-events: none;
      z-index: 0;
    }
    .academia-dust {
      position: absolute;
      background: rgba(212, 163, 115, 0.25);
      border-radius: 50%;
      pointer-events: none;
      filter: blur(0.5px);
      z-index: 0;
    }
    .academia-dust-1 { left: 10%; width: 4px; height: 4px; animation: float-up 10s linear infinite; animation-delay: 0s; }
    .academia-dust-2 { left: 26%; width: 3px; height: 3px; animation: float-up 12s linear infinite; animation-delay: 2.2s; }
    .academia-dust-3 { left: 42%; width: 5px; height: 5px; animation: float-up 9s linear infinite; animation-delay: 4.5s; }
    .academia-dust-4 { left: 58%; width: 3px; height: 3px; animation: float-up 14s linear infinite; animation-delay: 1.2s; }
    .academia-dust-5 { left: 74%; width: 4px; height: 4px; animation: float-up 11s linear infinite; animation-delay: 5.5s; }
    .academia-dust-6 { left: 88%; width: 3px; height: 3px; animation: float-up 13s linear infinite; animation-delay: 3.1s; }
    .academia-dust-7 { left: 18%; width: 4px; height: 4px; animation: float-up 11s linear infinite; animation-delay: 6.5s; }
    .academia-dust-8 { left: 34%; width: 5px; height: 5px; animation: float-up 8.5s linear infinite; animation-delay: 1.8s; }
    .academia-dust-9 { left: 50%; width: 3px; height: 3px; animation: float-up 12.5s linear infinite; animation-delay: 7s; }
    .academia-dust-10 { left: 66%; width: 4px; height: 4px; animation: float-up 10.5s linear infinite; animation-delay: 0.5s; }
    .academia-dust-11 { left: 82%; width: 5px; height: 5px; animation: float-up 13.5s linear infinite; animation-delay: 3.8s; }
    .academia-dust-12 { left: 94%; width: 3px; height: 3px; animation: float-up 9.5s linear infinite; animation-delay: 2.8s; }
  `
};

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
    habits
  } = useAppStore(useShallow(state => ({
    pomodoroStats: state.pomodoroStats,
    todoTasks: state.todoTasks,
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
    habits: state.habits
  })));

  const addToast = useToastStore(s => s.addToast);

  // Cosmetic Customization States
  const [fontStyle, setFontStyle] = useState<'font-mono' | 'font-sans' | 'font-serif'>('font-mono');
  const [ringStyle, setRingStyle] = useState<'solid' | 'dashed' | 'glowing' | 'dotted' | 'double'>('dashed');
  const [pomodoroTheme, setPomodoroTheme] = useState<'default' | 'tokyo-sakura' | 'dark-academia'>(() => {
    return (localStorage.getItem('pomodoro_theme') as any) || 'default';
  });

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
  const todaySessions = pomodoroStreak % dailyGoal;

  const [ringSize, setRingSize] = useState(280);
  useEffect(() => {
    const handleResize = () => {
      setRingSize(window.innerWidth < 640 ? 220 : 280);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const session = SESSIONS.find(s => s.id === pomodoroSessionId)!;
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

  const handleThemeChange = (t: 'default' | 'tokyo-sakura' | 'dark-academia') => {
    setPomodoroTheme(t);
    localStorage.setItem('pomodoro_theme', t);
  };

  const handleAssociatedTaskChange = (id: string | null) => {
    setPomodoroAssociatedTaskId(id);
    if (id) {
      localStorage.setItem('pomodoro_associated_task_id', id);
      // Auto-apply custom timer settings if configured
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="pomodoro-wrapper relative flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10"
    >
      <style>{themeStyles[pomodoroTheme]}</style>

      {/* Immersive Theme Background Overlays */}
      {pomodoroTheme === 'tokyo-sakura' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-4xl z-0">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`sakura-petal sakura-petal-${i + 1}`} />
          ))}
        </div>
      )}
      {pomodoroTheme === 'dark-academia' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[16px] z-0">
          <div className="candle-flicker-overlay absolute inset-0" />
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`academia-dust academia-dust-${i + 1}`} />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Pomodoro Timer <span className="w-2 h-2 rounded-full bg-primary inline-block" style={{ backgroundColor: 'var(--color-primary)' }} />
          </h1>
          <p className="text-text-secondary text-sm mt-1">Deep work, one session at a time.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlayPause} 
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isRunning ? <IconPlayerPause className="w-4 h-4" /> : <IconPlayerPlay className="w-4 h-4" />}
            {isRunning ? 'Pause Focus' : 'Start Focus'}
          </button>
        </div>
      </div>

      {/* Task Association Selector */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-500" style={{ background: 'rgba(var(--color-primary), 0.1)', color: 'var(--color-primary)' }}>
            <IconTarget className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-primary">Focusing On</h3>
            <p className="text-[10px] text-text-muted">Associate a To-Do task with your session</p>
          </div>
        </div>
        
        <div>
          <select
            value={pomodoroAssociatedTaskId || ''}
            onChange={e => handleAssociatedTaskChange(e.target.value || null)}
            className="bg-surface-alt border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer min-w-55"
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
      </div>

      {/* Custom Task Session setup */}
      {associatedTask && (
        <div className="bg-surface-alt/40 backdrop-blur-md border border-border/60 rounded-3xl p-5 -mt-3 shadow-sm flex flex-col gap-4 text-left transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary animate-pulse"
                style={{ backgroundColor: 'rgba(var(--color-primary), 0.1)', color: 'var(--color-primary)' }}
              >
                <IconSparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Custom Session Target</h4>
                <p className="text-[10px] text-text-muted mt-0.5">Set specific time and session goals for this task</p>
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
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {customSessions[associatedTask.id] && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Focus Minutes</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={customSessions[associatedTask.id].minutes}
                    onChange={(e) => {
                      const mins = Math.max(1, parseInt(e.target.value) || 25);
                      const updated = { ...customSessions, [associatedTask.id]: { ...customSessions[associatedTask.id], minutes: mins } };
                      setCustomSessions(updated);
                      localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                      applyTimer(mins, 'focus');
                    }}
                    className="w-full bg-surface border border-border/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <span className="absolute right-3 text-[10px] text-text-muted font-bold pointer-events-none">min</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Session Target</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={customSessions[associatedTask.id].total}
                    onChange={(e) => {
                      const total = Math.max(1, parseInt(e.target.value) || 4);
                      const updated = { ...customSessions, [associatedTask.id]: { ...customSessions[associatedTask.id], total } };
                      setCustomSessions(updated);
                      localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                    }}
                    className="w-full bg-surface border border-border/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <span className="absolute right-3 text-[10px] text-text-muted font-bold pointer-events-none">qty</span>
                </div>
              </div>
            </div>
          )}

          {customSessions[associatedTask.id] && (
            <div className="text-[11px] text-text-secondary flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-xs text-text-primary">Sessions Progress</span>
                <span className="text-primary font-mono" style={{ color: 'var(--color-primary)' }}>
                  {associatedTask.pomodoroCount || 0} / {customSessions[associatedTask.id].total} completed
                </span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden p-[1px] border border-border/40">
                <div 
                  className="h-full rounded-full transition-all duration-500 relative" 
                  style={{ 
                    width: `${Math.min(100, ((associatedTask.pomodoroCount || 0) / customSessions[associatedTask.id].total) * 100)}%`,
                    backgroundColor: 'var(--color-primary)' 
                  }} 
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/30 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Selectors */}
      <div className="flex flex-wrap gap-2 pt-2 items-center">
        {PRESETS.map(m => {
          const isActive = pomodoroTotalSeconds === m * 60 && pomodoroTimerState === 'idle';
          return (
            <button
              key={m}
              onClick={() => applyTimer(m, pomodoroSessionId)}
              aria-label={`Set ${m} minutes`}
              className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all ${
                isActive
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm'
                  : 'border-transparent bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary'
              }`}
              style={isActive ? { backgroundColor: 'rgba(244,63,94,0.1)', color: 'var(--color-primary)' } : {}}
            >
              {m} mins
            </button>
          );
        })}
        <button
          onClick={handleCustomPreset}
          className="px-6 py-2 rounded-xl text-xs font-bold border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-all flex items-center gap-2"
        >
          Custom <IconEdit className="w-3 h-3" />
        </button>
      </div>

      {/* Main Card Layout */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 relative overflow-hidden shadow-sm">
        
        {/* Left pane: digital clock */}
        <div className="flex-1 flex flex-col justify-center h-full gap-8 text-center md:text-left w-full md:pl-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary block mb-4">
              {pomodoroSessionId === 'focus' ? 'FOCUS TIME' : 'BREAK TIME'}
            </span>
            <div className={`text-6xl sm:text-7xl md:text-[7.5rem] leading-none font-bold tracking-tighter text-text-primary select-none ${fontStyle}`}>
              {display}
            </div>
            
            <div className="mt-8 flex flex-col gap-2 items-center md:items-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20" style={{ backgroundColor: 'rgba(244,63,94,0.1)', color: 'var(--color-primary)', borderColor: 'rgba(244,63,94,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }} />
                {pomodoroSessionId === 'focus' ? `Focus Session ${pomodoroStreak + 1}` : 'Break Time'}
              </span>
              {associatedTask && (
                <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  🎯 Working on: <span className="font-bold text-text-primary">{associatedTask.title}</span>
                </span>
              )}
              {associatedHabit && (
                <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  🔥 Working on Habit: <span className="font-bold text-text-primary">{associatedHabit.name}</span>
                </span>
              )}
            </div>
          </div>
 
          <div>
            <button
              onClick={stopGlobalPomodoro}
              disabled={pomodoroTimerState === 'idle'}
              className="px-6 py-3 rounded-2xl border border-border bg-surface-alt hover:bg-surface-hover hover:border-text-primary/20 text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 w-max cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-primary)' }} /> Stop Focus
            </button>
          </div>
        </div>
 
        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-64 bg-border/60" />
 
        {/* Right pane: Ticked Dial Timer & Play/Pause */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full md:pr-10">
          <div className="relative flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
            {/* The SVG Ring */}
            <ProgressRing progress={progress} size={ringSize} strokeWidth={8} color={pomodoroTheme !== 'default' ? 'var(--color-primary)' : session.color} style={ringStyle} />
            
            {/* Play Button inside Ring */}
            <button
              onClick={togglePlayPause}
              aria-label={isRunning ? 'Pause' : 'Play'}
              className="absolute w-24 h-24 rounded-full bg-surface border-4 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 cursor-pointer"
              style={{ borderColor: 'rgba(244,63,94,0.1)' }}
            >
              {isRunning ? (
                <IconPlayerPause className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
              ) : (
                <IconPlayerPlay className="w-10 h-10 translate-x-0.5" style={{ color: 'var(--color-primary)' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-start gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-orange-500/10 text-orange-500">
            <IconFlame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-text-primary flex items-baseline gap-2">
              {pomodoroStreak} <span className="text-xl">🍅</span>
            </p>
            <p className="text-xs text-text-secondary mt-1">{pomodoroStreak > 0 ? 'Keep building momentum!' : 'Start a session to build momentum'}</p>
          </div>
        </div>
        
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-start gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
            <IconClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-text-primary">{pomodoroStats.totalSessions}</p>
            <p className="text-xs text-text-secondary mt-1">All time focus sessions</p>
          </div>
        </div>
        
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-start gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-green-500/10 text-green-500">
            <IconTarget className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Minutes Focused</p>
            <p className="text-3xl font-bold text-text-primary">{pomodoroStats.totalMinutes}m</p>
            <p className="text-xs text-text-secondary mt-1">All time study time</p>
          </div>
        </div>
      </div>

      {/* Daily Progress & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Today's Progress</h3>
              <p className="text-xs text-text-muted mt-1">{Math.floor((todaySessions / dailyGoal) * 100)}% Complete</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Daily Goal</span>
              {isEditingGoal ? (
                <div className="flex items-center gap-2">
                  <input type="number" min={1} value={tempGoal} onChange={e => setTempGoal(Number(e.target.value))} className="w-16 bg-surface-alt border border-border rounded px-2 py-1 text-sm outline-none text-text-primary" />
                  <button onClick={saveGoal} className="text-primary hover:text-primary-hover cursor-pointer"><IconCheck className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-text-primary">{todaySessions} / {dailyGoal} sessions</span>
                  <button onClick={() => { setTempGoal(dailyGoal); setIsEditingGoal(true); }} className="px-3 py-1 rounded-lg border border-border text-xs font-bold flex items-center gap-1.5 hover:bg-surface-hover text-text-secondary cursor-pointer"><IconEdit className="w-3 h-3" /> Edit Goal</button>
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (todaySessions / dailyGoal) * 100)}%`, backgroundColor: 'var(--color-primary)' }} />
          </div>
          <p className="text-xs text-text-secondary mt-4">Keep going! You've got this.</p>
        </div>

        {/* Customization Settings */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="text-sm font-bold text-text-primary">Timer Settings</h3>
          
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Aesthetic Theme (This Page Only)</span>
            <div className="flex gap-2">
              <button onClick={() => handleThemeChange('default')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${pomodoroTheme === 'default' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Default</button>
              <button onClick={() => handleThemeChange('tokyo-sakura')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${pomodoroTheme === 'tokyo-sakura' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Sakura</button>
              <button onClick={() => handleThemeChange('dark-academia')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${pomodoroTheme === 'dark-academia' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Academia</button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Font Style</span>
            <div className="flex gap-2">
              <button onClick={() => setFontStyle('font-mono')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${fontStyle === 'font-mono' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Mono</button>
              <button onClick={() => setFontStyle('font-sans')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${fontStyle === 'font-sans' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Sans</button>
              <button onClick={() => setFontStyle('font-serif')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${fontStyle === 'font-serif' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Serif</button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Ring Style</span>
            <div className="flex gap-2">
              <button onClick={() => setRingStyle('solid')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${ringStyle === 'solid' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Solid</button>
              <button onClick={() => setRingStyle('dashed')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${ringStyle === 'dashed' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Dashed</button>
              <button onClick={() => setRingStyle('dotted')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${ringStyle === 'dotted' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Dotted</button>
              <button onClick={() => setRingStyle('double')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${ringStyle === 'double' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Double</button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-alt px-3 py-2 text-[11px] text-text-secondary">
            Dashboard dynamic island now handles the compact timer overlay while Pomodoro stays in-page.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
