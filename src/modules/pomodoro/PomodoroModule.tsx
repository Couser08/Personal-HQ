import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlayerPlay, IconPlayerPause, IconEdit, IconCheck,
  IconFlame, IconClock, IconTarget
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { ProgressRing } from '../../components/ui/ProgressRing';

// SESSIONS Config
const SESSIONS = [
  { id: 'focus',        label: 'Focus Session',        minutes: 25, color: '#f43f5e', hex2: 'rgba(244,63,94,0.06)' },
  { id: 'short-break',  label: 'Short Break',          minutes: 5,  color: '#22c55e', hex2: 'rgba(34,197,94,0.06)'  },
  { id: 'long-break',   label: 'Long Break',           minutes: 15, color: '#3b82f6', hex2: 'rgba(59,130,246,0.06)' },
] as const;

type SessionId = typeof SESSIONS[number]['id'];
type TimerState = 'idle' | 'running' | 'paused';
const PRESETS = [5, 10, 20, 25, 45, 60];

const pad = (n: number) => String(n).padStart(2, '0');

export default function PomodoroModule() {
  const { pomodoroStats, recordPomodoroSession } = useAppStore(useShallow(state => ({
    pomodoroStats: state.pomodoroStats,
    recordPomodoroSession: state.recordPomodoroSession
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
  
  // Daily Goal States
  const [dailyGoal, setDailyGoal] = useState(4);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(4);
  const todaySessions = streak % dailyGoal; // Mock logic, ideally store in store with date check

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
  };

  const togglePlayPause = () => {
    if (timerState === 'idle') start();
    else if (timerState === 'running') pause();
    else resume();
  };

  // Timer Tick
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
              addToast('🎉 Focus Complete!', 'Great work! Time for a break.', 'success');
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
  }, [timerState, sessionId, streak, session.minutes, recordPomodoroSession, addToast, applyTimer]);

  // Page title
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Pomodoro Timer <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" aria-hidden="true" />
          </h1>
          <p className="text-text-secondary text-sm mt-1">Deep work, one session at a time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={togglePlayPause} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm">
            {isRunning ? <IconPlayerPause className="w-4 h-4" /> : <IconPlayerPlay className="w-4 h-4" />}
            {isRunning ? 'Pause Focus' : 'Start Focus'}
          </button>
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
            
            <div className="mt-8 flex items-center gap-3 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {sessionId === 'focus' ? `Focus Session ${streak + 1}` : 'Break Time'}
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={stop}
              disabled={timerState === 'idle'}
              className="px-6 py-3 rounded-2xl border border-border bg-surface-alt hover:bg-surface-hover hover:border-text-primary/20 text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 w-max"
            >
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Stop Focus
            </button>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-64 bg-border/60" />

        {/* Right pane: Ticked Dial Timer & Play/Pause */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full md:pr-10">
          <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
            {/* The SVG Ring */}
            <ProgressRing progress={progress} size={280} strokeWidth={8} color={session.color} style={ringStyle} />
            
            {/* Play Button inside Ring */}
            <button
              onClick={togglePlayPause}
              aria-label={isRunning ? 'Pause' : 'Play'}
              className="absolute w-24 h-24 rounded-full bg-surface border-4 border-rose-500/10 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 hover:border-rose-500/20"
            >
              {isRunning ? (
                <IconPlayerPause className="w-10 h-10 text-rose-500" />
              ) : (
                <IconPlayerPlay className="w-10 h-10 text-rose-500 translate-x-0.5" />
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
            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (todaySessions / dailyGoal) * 100)}%` }} />
          </div>
          <p className="text-xs text-text-secondary mt-4">Keep going! You've got this.</p>
        </div>

        {/* Customization Quick Settings */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary mb-4">Timer Appearance</h3>
          
          <div className="mb-4">
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
              <button onClick={() => setRingStyle('glowing')} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${ringStyle === 'glowing' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border bg-surface-alt text-text-secondary'}`}>Glow</button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
