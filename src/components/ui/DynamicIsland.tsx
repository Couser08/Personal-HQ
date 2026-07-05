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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto select-none">
      <motion.div
        layout
        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
        onClick={() => {
          if (!notification) {
            setIsExpanded(!isExpanded);
          }
        }}
        className="bg-black text-white rounded-full shadow-2xl flex items-center justify-between border border-white/10 cursor-pointer overflow-hidden"
        style={{
          height: isExpanded ? '84px' : '36px',
          width: isExpanded 
            ? '320px' 
            : notification 
              ? '260px' 
              : '160px',
          padding: isExpanded ? '12px 20px' : '0 14px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Notification mode */}
          {notification ? (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 w-full text-left"
            >
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-rose-400 shrink-0">
                {notification.icon === 'award' && <IconAward className="w-4 h-4" />}
                {notification.icon === 'confetti' && <IconConfetti className="w-4 h-4" />}
                {notification.icon === 'alert' && <IconAlertCircle className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate leading-tight">
                  {notification.title}
                </p>
                {notification.subtitle && (
                  <p className="text-[9px] text-gray-400 truncate mt-0.5">
                    {notification.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          ) : isExpanded ? (
            /* Expanded Timer Controls */
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full h-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">
                  {pomodoroSessionId === 'focus' ? 'Focus Session' : 'Break'}
                </span>
                <span className="text-xl font-black text-white font-mono tracking-tight leading-none mt-1">
                  {formatTime(pomodoroSecondsLeft)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {pomodoroTimerState === 'running' ? (
                  <button
                    onClick={pauseGlobalPomodoro}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <IconPlayerPause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                    className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <IconPlayerPlay className="w-3.5 h-3.5" />
                  </button>
                )}
                
                <button
                  onClick={stopGlobalPomodoro}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors cursor-pointer"
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors cursor-pointer"
                >
                  Collapse
                </button>
              </div>
            </motion.div>
          ) : (
            /* Compact Running Timer */
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    pomodoroTimerState === 'running' ? 'bg-green-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    pomodoroTimerState === 'running' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                </span>
                <IconClockPlay className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              </div>

              <span className="text-[11px] font-black text-white font-mono leading-none tracking-tight">
                {formatTime(pomodoroSecondsLeft)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Global utility helper to trigger Dynamic Island achievements/notifications
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
