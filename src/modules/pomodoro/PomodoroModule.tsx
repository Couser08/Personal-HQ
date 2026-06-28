import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlayerPlay, IconPlayerPause, IconPlayerStop,
  IconRefresh, IconFlame, IconClock, IconTarget
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';

// ─── Config ──────────────────────────────────────────────────────────────────
const SESSIONS = [
  { id: 'focus',        label: 'Focus',        minutes: 25, color: '#f43f5e', hex2: 'rgba(244,63,94,0.15)' },
  { id: 'short-break',  label: 'Short Break',  minutes: 5,  color: '#22c55e', hex2: 'rgba(34,197,94,0.15)'  },
  { id: 'long-break',   label: 'Long Break',   minutes: 15, color: '#3b82f6', hex2: 'rgba(59,130,246,0.15)' },
] as const;
type SessionId = typeof SESSIONS[number]['id'];
type TimerState = 'idle' | 'running' | 'paused';
const PRESETS = [5, 10, 20, 25, 45, 60];

// ─── SVG Ring sizes ───────────────────────────────────────────────────────────
const SZ = 220, TK = 12, R = (SZ - TK * 2) / 2, CIRC = 2 * Math.PI * R;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

export default function PomodoroModule() {
  const { pomodoroStats, recordPomodoroSession } = useAppStore();
  const addToast = useToastStore(s => s.addToast);

  const [sessionId, setSessionId] = useState<SessionId>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSecs, setTotalSecs] = useState(25 * 60);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const session = SESSIONS.find(s => s.id === sessionId)!;
  const progress = totalSecs > 0 ? 1 - secondsLeft / totalSecs : 0;
  const strokeOffset = CIRC * (1 - progress);
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${pad(mins)}:${pad(secs)}`;

  // ─── Set timer from session / preset ─────────────────────────────────────
  const applyTimer = useCallback((minutes: number, sid: SessionId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSessionId(sid);
    setTotalSecs(minutes * 60);
    setSecondsLeft(minutes * 60);
    setTimerState('idle');
  }, []);

  // ─── Controls ────────────────────────────────────────────────────────────
  const start   = () => setTimerState('running');
  const pause   = () => setTimerState('paused');
  const resume  = () => setTimerState('running');
  const stop    = () => { if (intervalRef.current) clearInterval(intervalRef.current); setSecondsLeft(totalSecs); setTimerState('idle'); };
  const reset   = () => applyTimer(totalSecs / 60, sessionId);

  const togglePlayPause = () => {
    if (timerState === 'idle') start();
    else if (timerState === 'running') pause();
    else resume();
  };

  // ─── Tick ────────────────────────────────────────────────────────────────
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
  }, [timerState, sessionId]); // eslint-disable-line

  // ─── Page title ──────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = timerState === 'running'
      ? `${display} · ${session.label} — Personal HQ`
      : 'Personal HQ';
    return () => { document.title = 'Personal HQ'; };
  }, [display, timerState, session.label]);

  const isRunning = timerState === 'running';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex flex-col gap-8 max-w-4xl"
    >
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Pomodoro Timer <span className="w-2 h-2 rounded-full bg-primary inline-block" aria-hidden="true" />
        </h1>
        <p className="text-text-secondary text-sm mt-1">Deep work, one session at a time</p>
      </div>

      {/* ── Session type selector ── */}
      <div className="flex gap-2 p-1 bg-surface-alt rounded-xl w-fit border border-border" role="tablist">
        {SESSIONS.map(s => (
          <button
            key={s.id}
            role="tab"
            aria-selected={sessionId === s.id}
            onClick={() => applyTimer(s.minutes, s.id)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={sessionId === s.id
              ? { background: s.color, color: '#fff', boxShadow: `0 2px 12px ${s.color}66` }
              : { background: 'transparent', color: 'var(--text-secondary)' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Main card — Apple Watch–inspired split ── */}
      <div className="rounded-3xl overflow-hidden border border-border flex flex-col sm:flex-row"
        style={{ background: '#0e0e0e', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

        {/* Left: info + controls */}
        <div className="flex-1 flex flex-col justify-between px-8 py-8 gap-6">
          {/* Session label + status pill */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium tracking-widest uppercase" style={{ color: session.color }}>
              {session.label}
            </span>
            <AnimatePresence mode="wait">
              {timerState !== 'idle' && (
                <motion.span
                  key={timerState}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: timerState === 'running' ? `${session.color}22` : 'rgba(255,255,255,0.06)', color: timerState === 'running' ? session.color : '#888' }}
                >
                  {timerState === 'running' ? (
                    <><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: session.color }} />Running</>
                  ) : (
                    <><span className="w-1.5 h-1.5 rounded-full bg-[#888]" />Paused</>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Big clock */}
          <div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={display}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                className="font-mono text-[80px] sm:text-[88px] font-bold text-white leading-none tracking-tighter tabular-nums"
                aria-live="polite"
                aria-label={`${mins} minutes and ${secs} seconds remaining`}
              >
                {display}
              </motion.div>
            </AnimatePresence>
            <p className="text-[#555] text-sm mt-2 font-medium">
              {sessionId === 'focus' ? `Session ${streak + 1}` : 'Take a break ☕'}
            </p>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-xs text-[#444] mb-2 uppercase tracking-wider font-medium">Quick Set</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(m => (
                <button
                  key={m}
                  onClick={() => applyTimer(m, sessionId)}
                  aria-label={`Set ${m} minutes`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={totalSecs === m * 60 && timerState === 'idle'
                    ? { background: session.color, color: '#fff', boxShadow: `0 2px 8px ${session.color}66` }
                    : { background: 'rgba(255,255,255,0.06)', color: '#888' }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Control buttons row */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              aria-label={isRunning ? 'Pause' : timerState === 'paused' ? 'Resume' : 'Start'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: session.color, boxShadow: `0 4px 20px ${session.color}55` }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={timerState}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  {isRunning
                    ? <><IconPlayerPause className="w-4 h-4" /> Pause</>
                    : timerState === 'paused'
                    ? <><IconPlayerPlay  className="w-4 h-4" /> Resume</>
                    : <><IconPlayerPlay  className="w-4 h-4" /> Start</>
                  }
                </motion.span>
              </AnimatePresence>
            </button>

            {timerState !== 'idle' && (
              <button
                onClick={stop}
                aria-label="Stop timer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#888] hover:text-white hover:bg-white/10 transition-all"
              >
                <IconPlayerStop className="w-4 h-4" /> Stop
              </button>
            )}

            <button
              onClick={reset}
              aria-label="Reset timer"
              className="p-2.5 rounded-xl text-[#555] hover:text-white hover:bg-white/10 transition-all"
              title="Reset"
            >
              <IconRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: animated SVG ring */}
        <div
          className="flex items-center justify-center p-8 sm:p-10 shrink-0"
          style={{ background: session.hex2 }}
        >
          <div className="relative flex items-center justify-center" style={{ width: SZ, height: SZ }}>
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-2xl transition-all duration-700"
              style={{ background: session.color }}
            />

            {/* SVG ring */}
            <svg
              width={SZ}
              height={SZ}
              style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
              aria-hidden="true"
            >
              {/* Track */}
              <circle cx={SZ/2} cy={SZ/2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={TK} />
              {/* Progress */}
              <circle
                cx={SZ/2} cy={SZ/2} r={R}
                fill="none"
                stroke={session.color}
                strokeWidth={TK}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease' }}
              />
            </svg>

            {/* Centre play/pause button */}
            <button
              onClick={togglePlayPause}
              aria-label={isRunning ? 'Pause' : 'Play'}
              className="relative z-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                width: 80, height: 80,
                background: `radial-gradient(circle at 40% 40%, ${session.color}55, ${session.color}22)`,
                border: `1.5px solid ${session.color}66`,
                boxShadow: isRunning ? `0 0 40px ${session.color}55` : 'none',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={timerState}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 380 }}
                >
                  {isRunning
                    ? <IconPlayerPause className="w-8 h-8 text-white" />
                    : <IconPlayerPlay  className="w-8 h-8 text-white" />
                  }
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Percentage label inside ring */}
            <div
              className="absolute bottom-6 text-xs font-bold tabular-nums px-2 py-1 rounded-full border"
              style={{ color: session.color, borderColor: `${session.color}55`, background: 'rgba(0,0,0,0.32)' }}
            >
              {Math.round(progress * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
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
            desc: 'All time',
            color: session.color,
          },
          {
            icon: <IconTarget className="w-5 h-5" />,
            label: 'Minutes Focused',
            value: `${pomodoroStats.totalMinutes}m`,
            desc: 'All time',
            color: '#22c55e',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${stat.color}18`, color: stat.color }}
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

      {/* ── Tips ── */}
      <div className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4">
        <span className="text-xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">Pomodoro Technique</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            Work deeply for 25 minutes, then take a 5-minute break. After every 4 focus sessions, reward yourself with a 15-minute long break. The app auto-advances sessions for you.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
