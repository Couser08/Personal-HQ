import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconTarget, IconCheck, IconX, IconPlayerPlay
} from '@tabler/icons-react';


export function TaskFocusIsland() {
  const { 
    activeFocusItem, 
    setActiveFocusItem,
    updateTodoTask,
    toggleHabitCompletion,
    startGlobalPomodoro,
    theme
  } = useAppStore(useShallow(state => ({
    activeFocusItem: state.activeFocusItem,
    setActiveFocusItem: state.setActiveFocusItem,
    updateTodoTask: state.updateTodoTask,
    toggleHabitCompletion: state.toggleHabitCompletion,
    startGlobalPomodoro: state.startGlobalPomodoro,
    theme: state.theme,
  })));

  const [isExpanded, setIsExpanded] = useState(false);
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!activeFocusItem) return null;

  const handleComplete = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Trigger global wavy completion effect
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { 
        detail: { type: activeFocusItem.type === 'todo' ? 'todo' : 'habits' } 
      }));
    }

    if (activeFocusItem.type === 'todo') {
      await updateTodoTask(activeFocusItem.id, { completed: true });
    } else {
      await toggleHabitCompletion(activeFocusItem.id, todayStr);
    }

    // Dismiss focus item
    setActiveFocusItem(null);
    setIsExpanded(false);
  };

  const handleStartTimer = () => {
    startGlobalPomodoro();
    setIsExpanded(false);
  };

  return (
    <div className="fixed top-6 right-6 z-[9998] pointer-events-auto select-none antialiased">
      <motion.div
        layout
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 22, 
          mass: 0.8
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-between border cursor-pointer overflow-hidden origin-top-right transition-colors duration-350 ${
          isDark 
            ? 'bg-[#0f0f12] text-zinc-100 border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
            : 'bg-white text-zinc-900 border-zinc-200/90'
        }`}
        style={{
          height: isExpanded ? '110px' : '40px',
          width: isExpanded ? '340px' : '200px',
          borderRadius: isExpanded ? '24px' : '20px',
          padding: isExpanded ? '16px 20px' : '0 14px',
        }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            /* Expanded Controls View */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between w-full h-full text-left"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start min-w-0 gap-2">
                <div className="min-w-0">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none ${
                    activeFocusItem.type === 'todo'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    Active {activeFocusItem.type === 'todo' ? 'Task' : 'Habit'}
                  </span>
                  <h4 className="text-xs font-black truncate mt-1.5 max-w-[200px]" title={activeFocusItem.title}>
                    {activeFocusItem.title}
                  </h4>
                </div>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className={`p-1 rounded-full border transition-colors cursor-pointer hover:bg-neutral-550/10 ${
                    isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'
                  }`}
                >
                  <IconX className="w-3 h-3" />
                </button>
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleComplete}
                  className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  <IconCheck className="w-3.5 h-3.5" /> Done
                </button>

                <button
                  onClick={handleStartTimer}
                  className={`py-1.5 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95 border ${
                    isDark 
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                  }`}
                  title="Focus Pomodoro"
                >
                  <IconPlayerPlay className="w-3 h-3 text-amber-500" /> Focus
                </button>

                <button
                  onClick={() => {
                    setActiveFocusItem(null);
                    setIsExpanded(false);
                  }}
                  className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer active:scale-95 border ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800'
                  }`}
                  title="Clear Active Item"
                >
                  Stop
                </button>
              </div>
            </motion.div>
          ) : (
            /* Compact Mode View */
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full h-full gap-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${
                    activeFocusItem.type === 'todo' ? 'bg-blue-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    activeFocusItem.type === 'todo' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                </span>
                <IconTarget className={`w-4 h-4 shrink-0 ${
                  activeFocusItem.type === 'todo' ? 'text-blue-500' : 'text-emerald-500'
                }`} />
                <span className="text-[10px] font-extrabold truncate max-w-[110px]">
                  {activeFocusItem.title}
                </span>
              </div>
              
              <div className={`p-1 rounded-md border shrink-0 text-[8px] font-black ${
                isDark ? 'bg-zinc-900 border-zinc-800/80 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
              }`}>
                {activeFocusItem.type === 'todo' ? 'TASK' : 'HABIT'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
