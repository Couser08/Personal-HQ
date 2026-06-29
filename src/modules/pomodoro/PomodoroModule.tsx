import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlayerPlay, IconPlayerPause,
  IconFlame, IconClock, IconTarget
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';

// SESSIONS Config
const SESSIONS = [
  { id: 'focus',        label: 'Focus',        minutes: 25, color: '#f43f5e', hex2: 'rgba(244,63,94,0.06)' },
  { id: 'short-break',  label: 'Short Break',  minutes: 5,  color: '#22c55e', hex2: 'rgba(34,197,94,0.06)'  },
  { id: 'long-break',   label: 'Long Break',   minutes: 15, color: '#3b82f6', hex2: 'rgba(59,130,246,0.06)' },
] as const;

type SessionId = typeof SESSIONS[number]['id'];
type TimerState = 'idle' | 'running' | 'paused';
const PRESETS = [5, 10, 20, 25, 45, 60];

const pad = (n: number) => String(n).padStart(2, '0');

export default function PomodoroModule() {
  const { pomodoroStats, recordPomodoroSession } = useAppStore();
  const addToast = useToastStore(s => s.addToast);

  const [sessionId, setSessionId] = useState<SessionId>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSecs, setTotalSecs] = useState(25 * 60);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef<any>(null);

  const session = SESSIONS.find(s => s.id === sessionId)!;
  const progress = totalSecs > 0 ? 1 - secondsLeft / totalSecs : 0;
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

  // SVG Ticks Watch Dial
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i * 360) / 60;
      const active = i / 60 < progress;
      ticks.push(
        <line
          key={i}
          x1="50"
          y1="4"
          x2="50"
          y2="10"
          stroke={active ? session.color : 'var(--text-muted)'}
          strokeWidth="1.2"
          strokeLinecap="round"
          transform={`rotate(${angle} 50 50)`}
          style={{ opacity: active ? 1 : 0.2 }}
        />
      );
    }
    return ticks;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex flex-col gap-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Pomodoro Timer <span className="w-2 h-2 rounded-full bg-primary inline-block" aria-hidden="true" />
        </h1>
        <p className="text-text-secondary text-sm">Deep work, one session at a time</p>
      </div>

      {/* Preset Selectors at top of the card (mockup-inspired) */}
      <div className="flex flex-wrap gap-2 pt-2">
        {PRESETS.map(m => (
          <button
            key={m}
            onClick={() => applyTimer(m, sessionId)}
            aria-label={`Set ${m} minutes`}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              totalSecs === m * 60 && timerState === 'idle'
                ? 'bg-text-primary text-background border-text-primary shadow-sm'
                : 'border-border bg-surface hover:bg-surface-hover text-text-secondary'
            }`}
          >
            {m} mins
          </button>
        ))}
      </div>

      {/* Redesigned Card Layout (mockup split panel style) */}
      <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
        {/* Left pane: digital clock */}
        <div className="flex-1 flex flex-col justify-between h-full min-h-[160px] gap-6 text-center md:text-left w-full">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
              Timer
            </span>
            <div className="text-6xl md:text-7xl font-bold tracking-tight text-text-primary font-mono select-none">
              {display}
            </div>
            <p className="text-xs text-text-muted mt-2 font-medium">
              {sessionId === 'focus' ? `Focus Session ${streak + 1}` : 'Take a break ☕'}
            </p>
          </div>

          <div>
            <button
              onClick={stop}
              disabled={timerState === 'idle'}
              className="px-6 py-2.5 rounded-xl border border-border bg-surface-alt hover:bg-surface-hover text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 w-full sm:w-max"
            >
              <span className="w-2 h-2 bg-text-primary rounded-sm" /> Stop Focus
            </button>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-36 bg-border" />

        {/* Right pane: Ticked Dial Timer & Play/Pause */}
        <div className="flex flex-col items-center justify-center shrink-0 relative w-56 h-56">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {renderTicks()}
          </svg>
          <button
            onClick={togglePlayPause}
            aria-label={isRunning ? 'Pause' : 'Play'}
            className="w-20 h-20 rounded-full bg-surface border border-border shadow-high flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
          >
            {isRunning ? (
              <IconPlayerPause className="w-8 h-8 text-text-primary" />
            ) : (
              <IconPlayerPlay className="w-8 h-8 text-text-primary translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Stats and metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <IconFlame  className="w-5 h-5" />,
            label: 'Current Streak',
            value: `${streak} 🍅`,
            desc: streak > 0 ? 'Keep it up!' : 'Start a session',
            color: '#f59e0b',
          },
          {
            icon: <IconClock  className="w-5 h-5" />,
            label: 'Total Sessions',
            value: pomodoroStats.totalSessions,
            desc: 'All time focus sessions',
            color: '#3b82f6',
          },
          {
            icon: <IconTarget className="w-5 h-5" />,
            label: 'Minutes Focused',
            value: `${pomodoroStats.totalMinutes}m`,
            desc: 'All time study time',
            color: '#22c55e',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}10`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
