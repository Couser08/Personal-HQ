import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconClockPlay, IconPlayerPause, IconPlayerPlay, 
  IconRefresh, IconConfetti, IconAlertCircle, IconAward 
} from '@tabler/icons-react';

export interface DynamicIslandNotification {
  id: string;
  type: 'achievement' | 'alert' | 'success';
  title: string;
  subtitle?: string;
  icon?: 'award' | 'confetti' | 'alert';
}

export function DynamicIsland() {
  const { 
    pomodoroSecondsLeft, 
    pomodoroTimerState, 
    pomodoroSessionId,
    pauseGlobalPomodoro,
    resumeGlobalPomodoro,
    stopGlobalPomodoro,
    startGlobalPomodoro
  } = useAppStore(useShallow(state => ({
    pomodoroSecondsLeft: state.pomodoroSecondsLeft,
    pomodoroTimerState: state.pomodoroTimerState,
    pomodoroSessionId: state.pomodoroSessionId,
    pauseGlobalPomodoro: state.pauseGlobalPomodoro,
    resumeGlobalPomodoro: state.resumeGlobalPomodoro,
    stopGlobalPomodoro: state.stopGlobalPomodoro,
    startGlobalPomodoro: state.startGlobalPomodoro,
  })));

  const [isExpanded, setIsExpanded] = useState(false);
  const [notification, setNotification] = useState<DynamicIslandNotification | null>(null);

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Watch for custom notifications triggered on localStorage/window events
  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<DynamicIslandNotification>;
      if (customEvent.detail) {
        setNotification(customEvent.detail);
        setIsExpanded(false);
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          setNotification(null);
        }, 4000);
      }
    };
    window.addEventListener('dynamic-island-notify', handleNotification);
    return () => window.removeEventListener('dynamic-island-notify', handleNotification);
  }, []);

  // Determine standard pill layout
  const isTimerRunning = pomodoroTimerState === 'running' || pomodoroTimerState === 'paused';
  const hasActiveState = isTimerRunning || notification;

  if (!hasActiveState) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto select-none antialiased">
      <motion.div
        layout
        // Apple's signature fluid spring physics
        transition={{ 
          type: 'spring', 
          stiffness: 320, 
          damping: 24, 
          mass: 0.8
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (!notification) {
            setIsExpanded(!isExpanded);
          }
        }}
        className="bg-black text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex items-center justify-between border border-neutral-800/40 cursor-pointer overflow-hidden origin-top"
        style={{
          height: isExpanded ? '100px' : '44px',
          width: isExpanded 
            ? '360px' 
            : notification 
              ? '290px' 
              : '165px',
          borderRadius: isExpanded ? '32px' : '22px',
          padding: isExpanded ? '20px 24px' : '0 18px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Notification mode */}
          {notification ? (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(5px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(5px)' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex items-center gap-4 w-full text-left"
            >
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                {notification.icon === 'award' && <IconAward className="w-5 h-5 stroke-[2]" />}
                {notification.icon === 'confetti' && <IconConfetti className="w-5 h-5 stroke-[2]" />}
                {notification.icon === 'alert' && <IconAlertCircle className="w-5 h-5 stroke-[2] text-rose-400" />}
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="text-[13px] font-bold text-neutral-100 tracking-tight truncate leading-snug">
                  {notification.title}
                </p>
                {notification.subtitle && (
                  <p className="text-[11px] text-neutral-400 font-medium truncate mt-0.5 tracking-tight">
                    {notification.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          ) : isExpanded ? (
            /* Expanded Timer Controls */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full h-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col text-left justify-center py-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-widest leading-none">
                  {pomodoroSessionId === 'focus' ? 'Focus Session' : 'Break'}
                </span>
                <span className="text-2xl font-bold text-neutral-50 font-mono tracking-tighter leading-none mt-2">
                  {formatTime(pomodoroSecondsLeft)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                {pomodoroTimerState === 'running' ? (
                  <button
                    onClick={pauseGlobalPomodoro}
                    className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-200 transition-colors cursor-pointer active:scale-90"
                  >
                    <IconPlayerPause className="w-4.5 h-4.5 fill-neutral-200 stroke-[1.5]" />
                  </button>
                ) : (
                  <button
                    onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                    className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-neutral-950 transition-colors cursor-pointer active:scale-90 shadow-md shadow-amber-500/10"
                  >
                    <IconPlayerPlay className="w-4.5 h-4.5 fill-neutral-950 stroke-[1.5]" />
                  </button>
                )}
                
                <button
                  onClick={stopGlobalPomodoro}
                  className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer active:scale-90"
                >
                  <IconRefresh className="w-4.5 h-4.5 stroke-[2]" />
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="h-10 px-4 text-xs font-bold tracking-tight rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer active:scale-90"
                >
                  Collapse
                </button>
              </div>
            </motion.div>
          ) : (
            /* Compact Running Timer */
            <motion.div
              key="compact"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full h-full"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${
                    pomodoroTimerState === 'running' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    pomodoroTimerState === 'running' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </span>
                <IconClockPlay className={`w-4.5 h-4.5 shrink-0 ${
                  pomodoroTimerState === 'running' ? 'text-emerald-500' : 'text-amber-500'
                }`} />
              </div>

              <span className="text-[14px] font-bold text-neutral-100 font-mono leading-none tracking-tight">
                {formatTime(pomodoroSecondsLeft)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export const triggerDynamicIsland = (title: string, subtitle?: string, type: 'achievement' | 'alert' | 'success' = 'success', icon: 'award' | 'confetti' | 'alert' = 'confetti') => {
  const event = new CustomEvent('dynamic-island-notify', {
    detail: {
      id: Math.random().toString(),
      type,
      title,
      subtitle,
      icon
    }
  });
  window.dispatchEvent(event);
};