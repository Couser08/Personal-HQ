import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  IconPlayerPlay, IconPlayerPause, IconEdit, IconCheck,
  IconFlame, IconClock, IconTarget, IconDeviceDesktop
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { ProgressRing } from '../../components/ui/ProgressRing';

const SESSIONS = [
  { id: 'focus',        label: 'Focus Session',        minutes: 25, color: '#f43f5e', hex2: 'rgba(244,63,94,0.06)' },
  { id: 'short-break',  label: 'Short Break',          minutes: 5,  color: '#22c55e', hex2: 'rgba(34,197,94,0.06)'  },
  { id: 'long-break',   label: 'Long Break',           minutes: 15, color: '#3b82f6', hex2: 'rgba(59,130,246,0.06)' },
] as const;

type SessionId = typeof SESSIONS[number]['id'];
type TimerState = 'idle' | 'running' | 'paused';
const PRESETS = [5, 10, 20, 25, 45, 60];

const pad = (n: number) => String(n).padStart(2, '0');

// Page-scoped Theme overrides
const themeStyles = {
  default: '',
  'tokyo-sakura': `
    .pomodoro-wrapper {
      --bg-surface: #fff0f3 !important;
      --bg-surface-alt: #ffe3e8 !important;
      --border-border: #f9cbd3 !important;
      --text-primary: #471018 !important;
      --text-secondary: #7a3541 !important;
      --text-muted: #af6b77 !important;
      --color-primary: #ff5e7e !important;
    }
    .dark .pomodoro-wrapper {
      --bg-surface: #1f0f12 !important;
      --bg-surface-alt: #30171c !important;
      --border-border: #4a2128 !important;
      --text-primary: #ffdce1 !important;
      --text-secondary: #d69ca6 !important;
      --text-muted: #9c626d !important;
      --color-primary: #ff5e7e !important;
    }
  `,
  'dark-academia': `
    .pomodoro-wrapper {
      --bg-surface: #f7edd4 !important;
      --bg-surface-alt: #ebdcb6 !important;
      --border-border: #dac594 !important;
      --text-primary: #33261a !important;
      --text-secondary: #6e553f !important;
      --text-muted: #a38972 !important;
      --color-primary: #a0522d !important;
    }
    .dark .pomodoro-wrapper {
      --bg-surface: #1a1310 !important;
      --bg-surface-alt: #261c18 !important;
      --border-border: #3d2c25 !important;
      --text-primary: #ece2d5 !important;
      --text-secondary: #b09984 !important;
      --text-muted: #826e5d !important;
      --color-primary: #b8860b !important;
    }
  `
};

export default function PomodoroModule() {
  const { pomodoroStats, recordPomodoroSession, todoTasks, updateTodoTask } = useAppStore(useShallow(state => ({
    pomodoroStats: state.pomodoroStats,
    recordPomodoroSession: state.recordPomodoroSession,
    todoTasks: state.todoTasks,
    updateTodoTask: state.updateTodoTask
  })));
  const addToast = useToastStore(s => s.addToast);

  const [sessionId, setSessionId] = useState<SessionId>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSecs, setTotalSecs] = useState(25 * 60);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef<any>(null);

  // Customization States
  const [fontStyle, setFontStyle] = useState<'font-mono' | 'font-sans' | 'font-serif'>('font-mono');
  const [ringStyle, setRingStyle] = useState<'solid' | 'dashed' | 'glowing' | 'dotted' | 'double'>('dashed');
  const [pomodoroTheme, setPomodoroTheme] = useState<'default' | 'tokyo-sakura' | 'dark-academia'>(() => {
    return (localStorage.getItem('pomodoro_theme') as any) || 'default';
  });
  
  // Picture-in-Picture states
  const [pipEnabled, setPipEnabled] = useState(() => {
    return localStorage.getItem('pomodoro_pip_enabled') !== 'false';
  });
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // Task Association state
  const [associatedTaskId, setAssociatedTaskId] = useState<string | null>(() => {
    return localStorage.getItem('pomodoro_associated_task_id') || null;
  });

  // Daily Goal States
  const [dailyGoal, setDailyGoal] = useState(4);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(4);
  const todaySessions = streak % dailyGoal;

  const session = SESSIONS.find(s => s.id === sessionId)!;
  const progress = totalSecs > 0 ? 1 - (secondsLeft / totalSecs) : 1;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${pad(mins)}:${pad(secs)}`;

  const applyTimer = useCallback((minutes: number, sid: SessionId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSessionId(sid);
    setTotalSecs(minutes * 60);
    setSecondsLeft(minutes * 60);
    setTimerState('idle');
  }, []);

  const handleThemeChange = (t: 'default' | 'tokyo-sakura' | 'dark-academia') => {
    setPomodoroTheme(t);
    localStorage.setItem('pomodoro_theme', t);
  };

  const handlePipToggle = (val: boolean) => {
    setPipEnabled(val);
    localStorage.setItem('pomodoro_pip_enabled', String(val));
    if (!val && pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  };

  const handleAssociatedTaskChange = (id: string | null) => {
    setAssociatedTaskId(id);
    if (id) {
      localStorage.setItem('pomodoro_associated_task_id', id);
    } else {
      localStorage.removeItem('pomodoro_associated_task_id');
    }
  };

  const handleCustomPreset = () => {
    const minStr = prompt('Enter custom minutes (1-180):');
    if (!minStr) return;
    const min = parseInt(minStr, 10);
    if (!isNaN(min) && min > 0 && min <= 180) {
      applyTimer(min, sessionId);
    } else {
      addToast('Invalid time', 'Please enter a number between 1 and 180.', 'error');
    }
  };

  const start   = () => setTimerState('running');
  const pause   = () => setTimerState('paused');
  const resume  = () => setTimerState('running');
  const stop    = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(totalSecs);
    setTimerState('idle');
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  };

  const togglePlayPause = () => {
    if (timerState === 'idle') start();
    else if (timerState === 'running') pause();
    else resume();
  };

  // Picture-in-Picture setup
  const openPiP = async () => {
    if (!('documentPictureInPicture' in window)) {
      addToast('PiP Unsupported', 'Your browser does not support Document Picture-in-Picture.', 'info');
      return;
    }
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }
    try {
      const pip = await (window as any).documentPictureInPicture.requestWindow({
        width: 300,
        height: 300,
      });

      // Copy stylesheet rules to PiP
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          if (styleSheet.cssRules) {
            const newStyleEl = pip.document.createElement('style');
            const cssTexts = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            newStyleEl.textContent = cssTexts;
            pip.document.head.appendChild(newStyleEl);
          }
        } catch {
          const linkEl = pip.document.createElement('link');
          linkEl.rel = 'stylesheet';
          linkEl.href = styleSheet.href || '';
          pip.document.head.appendChild(linkEl);
        }
      });
      
      // Inject theme configurations
      pip.document.documentElement.className = document.documentElement.className;
      pip.document.body.className = 'bg-background text-text-primary flex flex-col justify-center items-center h-full m-0 overflow-hidden';

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(pip);
    } catch (err) {
      console.warn("PiP Launch Error:", err);
    }
  };

  // Handle PiP automation
  useEffect(() => {
    if (pipEnabled && timerState === 'running' && !pipWindow) {
      openPiP();
    }
    if (timerState === 'idle' && pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [timerState, pipEnabled]);

  // Clean up PiP window when module unmounts
  useEffect(() => {
    return () => {
      if (pipWindow) {
        pipWindow.close();
      }
    };
  }, [pipWindow]);

  // Timer Tick Effect
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setTimerState('idle');
            if (sessionId === 'focus') {
              const next = streak + 1;
              setStreak(next);
              recordPomodoroSession(session.minutes);
              
              // Increment count of associated To-Do task
              if (associatedTaskId) {
                const matchedTask = todoTasks.find(t => t.id === associatedTaskId);
                if (matchedTask) {
                  updateTodoTask(associatedTaskId, {
                    pomodoroCount: (matchedTask.pomodoroCount || 0) + 1
                  });
                  addToast('🍅 Session Logged', `Logged focus session to "${matchedTask.title}"`, 'success');
                }
              } else {
                addToast('🎉 Focus Complete!', 'Great work! Time for a break.', 'success');
              }

              const nextSid: SessionId = next % 4 === 0 ? 'long-break' : 'short-break';
              applyTimer(SESSIONS.find(s => s.id === nextSid)!.minutes, nextSid);
            } else {
              addToast('⏰ Break Over!', 'Ready to focus again? 🚀', 'info');
              applyTimer(SESSIONS.find(s => s.id === 'focus')!.minutes, 'focus');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState, sessionId, streak, session.minutes, recordPomodoroSession, addToast, applyTimer, associatedTaskId, todoTasks, updateTodoTask]);

  // Page title sync
  useEffect(() => {
    document.title = timerState === 'running'
      ? `${display} · ${session.label} — Personal HQ`
      : 'Personal HQ';
    return () => { document.title = 'Personal HQ'; };
  }, [display, timerState, session.label]);

  const isRunning = timerState === 'running';

  const saveGoal = () => {
    setDailyGoal(tempGoal);
    setIsEditingGoal(false);
  };

  const associatedTask = todoTasks.find(t => t.id === associatedTaskId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="pomodoro-wrapper flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10"
    >
      <style>{themeStyles[pomodoroTheme]}</style>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Pomodoro Timer <span className="w-2 h-2 rounded-full bg-primary inline-block" style={{ backgroundColor: 'var(--color-primary)' }} />
          </h1>
          <p className="text-text-secondary text-sm mt-1">Deep work, one session at a time.</p>
        </div>
        <div className="flex items-center gap-2">
          {'documentPictureInPicture' in window && (
            <button 
              onClick={openPiP}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
              title="Toggle PiP overlay window"
            >
              <IconDeviceDesktop className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={togglePlayPause} 
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:opacity-90"
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
            value={associatedTaskId || ''}
            onChange={e => handleAssociatedTaskChange(e.target.value || null)}
            className="bg-surface-alt border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer min-w-[220px]"
          >
            <option value="">No Associated Task</option>
            {todoTasks.filter(t => !t.completed && !t.deleted).map(task => (
              <option key={task.id} value={task.id}>
                {task.title} {task.pomodoroCount ? `(🍅 ${task.pomodoroCount})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="flex flex-wrap gap-2 pt-2 items-center">
        {PRESETS.map(m => {
          const isActive = totalSecs === m * 60 && timerState === 'idle';
          return (
            <button
              key={m}
              onClick={() => applyTimer(m, sessionId)}
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
      <div className="bg-surface border border-border rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-sm">
        
        {/* Left pane: digital clock */}
        <div className="flex-1 flex flex-col justify-center h-full gap-8 text-center md:text-left w-full md:pl-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary block mb-4">
              FOCUS TIME
            </span>
            <div className={`text-7xl md:text-[7.5rem] leading-none font-bold tracking-tighter text-text-primary select-none ${fontStyle}`}>
              {display}
            </div>
            
            <div className="mt-8 flex flex-col gap-2 items-center md:items-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20" style={{ backgroundColor: 'rgba(244,63,94,0.1)', color: 'var(--color-primary)', borderColor: 'rgba(244,63,94,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }} />
                {sessionId === 'focus' ? `Focus Session ${streak + 1}` : 'Break Time'}
              </span>
              {associatedTask && (
                <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  🎯 Working on: <span className="font-bold text-text-primary">{associatedTask.title}</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={stop}
              disabled={timerState === 'idle'}
              className="px-6 py-3 rounded-2xl border border-border bg-surface-alt hover:bg-surface-hover hover:border-text-primary/20 text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 w-max"
            >
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--color-primary)' }} /> Stop Focus
            </button>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-64 bg-border/60" />

        {/* Right pane: Ticked Dial Timer & Play/Pause */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full md:pr-10">
          <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
            {/* The SVG Ring */}
            <ProgressRing progress={progress} size={280} strokeWidth={8} color={pomodoroTheme !== 'default' ? 'var(--color-primary)' : session.color} style={ringStyle} />
            
            {/* Play Button inside Ring */}
            <button
              onClick={togglePlayPause}
              aria-label={isRunning ? 'Pause' : 'Play'}
              className="absolute w-24 h-24 rounded-full bg-surface border-4 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
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
              {streak} <span className="text-xl">🍅</span>
            </p>
            <p className="text-xs text-text-secondary mt-1">{streak > 0 ? 'Keep building momentum!' : 'Start a session to build momentum'}</p>
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
                  <button onClick={saveGoal} className="text-primary hover:text-primary-hover"><IconCheck className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-text-primary">{todaySessions} / {dailyGoal} sessions</span>
                  <button onClick={() => { setTempGoal(dailyGoal); setIsEditingGoal(true); }} className="px-3 py-1 rounded-lg border border-border text-xs font-bold flex items-center gap-1.5 hover:bg-surface-hover text-text-secondary"><IconEdit className="w-3 h-3" /> Edit Goal</button>
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
              <button onClick={() => handleThemeChange('default')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${pomodoroTheme === 'default' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Default</button>
              <button onClick={() => handleThemeChange('tokyo-sakura')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${pomodoroTheme === 'tokyo-sakura' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Sakura</button>
              <button onClick={() => handleThemeChange('dark-academia')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${pomodoroTheme === 'dark-academia' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Academia</button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Font Style</span>
            <div className="flex gap-2">
              <button onClick={() => setFontStyle('font-mono')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${fontStyle === 'font-mono' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Mono</button>
              <button onClick={() => setFontStyle('font-sans')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${fontStyle === 'font-sans' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Sans</button>
              <button onClick={() => setFontStyle('font-serif')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${fontStyle === 'font-serif' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Serif</button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Ring Style</span>
            <div className="flex gap-2">
              <button onClick={() => setRingStyle('solid')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${ringStyle === 'solid' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Solid</button>
              <button onClick={() => setRingStyle('dashed')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${ringStyle === 'dashed' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Dashed</button>
              <button onClick={() => setRingStyle('dotted')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${ringStyle === 'dotted' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Dotted</button>
              <button onClick={() => setRingStyle('double')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${ringStyle === 'double' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Double</button>
            </div>
          </div>

          {'documentPictureInPicture' in window && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <span className="text-xs font-bold text-text-primary block">Picture-in-Picture (PiP)</span>
                <span className="text-[9px] text-text-muted">Always-on-top timer overlay</span>
              </div>
              <button
                onClick={() => handlePipToggle(!pipEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  pipEnabled ? 'bg-rose-500' : 'bg-surface-alt border-border'
                }`}
                style={pipEnabled ? { backgroundColor: 'var(--color-primary)' } : {}}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    pipEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Picture-in-Picture Portal rendering */}
      {pipWindow && createPortal(
        <PipTimerContent 
          display={display}
          sessionLabel={sessionId === 'focus' ? `Focus Session ${streak + 1}` : 'Break Time'}
          isRunning={isRunning}
          togglePlayPause={togglePlayPause}
          stop={stop}
          fontStyle={fontStyle}
          pomodoroTheme={pomodoroTheme}
        />,
        pipWindow.document.body
      )}
    </motion.div>
  );
}

// PiP window custom sub-component
function PipTimerContent({
  display,
  sessionLabel,
  isRunning,
  togglePlayPause,
  stop,
  fontStyle,
  pomodoroTheme
}: {
  display: string;
  sessionLabel: string;
  isRunning: boolean;
  togglePlayPause: () => void;
  stop: () => void;
  fontStyle: string;
  pomodoroTheme: string;
}) {
  return (
    <div className={`pomodoro-wrapper flex flex-col items-center justify-center text-center h-full w-full select-none ${pomodoroTheme} p-4`} style={{ flex: 1 }}>
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary block mb-2 opacity-80">
        {sessionLabel}
      </span>
      <div className={`text-5xl font-black tracking-tighter text-text-primary ${fontStyle} leading-none mb-6`}>
        {display}
      </div>
      <div className="flex gap-2">
        <button
          onClick={togglePlayPause}
          className="px-4 py-2 text-white rounded-full text-[11px] font-bold transition-all shadow-sm active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={stop}
          className="px-4 py-2 bg-surface-alt border border-border text-text-primary rounded-full text-[11px] font-bold transition-all hover:bg-surface-hover active:scale-95"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
