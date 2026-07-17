import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, type ToastType } from '../../store/useToastStore';
import { useAppStore } from '../../store/useAppStore';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: <IconCheck className="w-[15px] h-[15px] text-emerald-500 dark:text-emerald-400" />,
        glowColor: 'rgba(16, 185, 129, 0.15)'
      };
    case 'error':
      return {
        icon: <IconX className="w-[15px] h-[15px] text-rose-500 dark:text-rose-400" />,
        glowColor: 'rgba(244, 63, 94, 0.15)'
      };
    case 'warning':
      return {
        icon: <IconAlertTriangle className="w-[15px] h-[15px] text-amber-500 dark:text-amber-400" />,
        glowColor: 'rgba(245, 158, 11, 0.15)'
      };
    case 'info':
    default:
      return {
        icon: <IconInfoCircle className="w-[15px] h-[15px] text-blue-500 dark:text-blue-400" />,
        glowColor: 'rgba(59, 130, 246, 0.15)'
      };
  }
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Island Springs physics for zero-latency snapping
  const islandTransition = {
    type: 'spring' as const,
    stiffness: 450,
    damping: 28,
    mass: 0.6
  };

  // Hamesha latest toast active status frame hold karega
  const activeToast = toasts[toasts.length - 1];
  const config = activeToast ? getToastConfig(activeToast.type) : null;

  return (
    // Fixed container flush to the very top edge of viewport
    <div className="fixed top-0 left-0 right-0 z-[99999] flex justify-center pointer-events-none select-none">
      <AnimatePresence mode="wait">
        {activeToast ? (
          <motion.div
            key={activeToast.id} // Forces clean re-morph on content swaps
            initial={{ opacity: 0, y: -40, scaleX: 0.7 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scaleX: 1,
              boxShadow: isDark
                ? `0 20px 40px -10px ${config?.glowColor}, 0 10px 20px -5px rgba(0,0,0,0.5)`
                : `0 20px 40px -10px ${config?.glowColor}, 0 10px 20px -5px rgba(0,0,0,0.06)`
            }}
            exit={{ opacity: 0, y: -30, scaleX: 0.8, transition: { duration: 0.15 } }}
            transition={islandTransition}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-b-[22px] border-x border-b min-w-[280px] max-w-[400px] transition-colors duration-300 ${
              isDark 
                ? 'bg-[#0c0c0e] text-zinc-100 border-zinc-800/60' 
                : 'bg-white text-zinc-900 border-zinc-200/80 shadow-md'
            }`}
            style={{
              // Subtle top bar intersection blending shadow
              borderTop: 'none',
              willChange: 'transform, opacity'
            }}
          >
            {/* Minimal Icon Core */}
            <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border ${
              isDark ? 'bg-zinc-900 border-zinc-800/70' : 'bg-zinc-50 border-zinc-200'
            }`}>
              {config?.icon}
            </div>

            {/* Tight Inline Content Meta Layout */}
            <div className="flex flex-col flex-1 min-w-0 pr-2">
              <span className={`text-[13px] font-semibold leading-none tracking-[-0.15px] ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                {activeToast.title}
              </span>
              {activeToast.message && (
                <p className={`text-[11.5px] mt-1.5 leading-tight font-normal truncate ${
                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  {activeToast.message}
                </p>
              )}
            </div>

            {/* Smart Edge Cross Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(activeToast.id);
              }}
              className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 border-zinc-800/50' 
                  : 'bg-zinc-100/60 hover:bg-zinc-250 text-zinc-400 hover:text-zinc-700 border-zinc-200/50'
              }`}
            >
              <IconX className="w-2.5 h-2.5" />
            </button>
          </motion.div>
        ) : (
          /* Idle State Tiny Invisible Sensor Anchor */
          <motion.div 
            key="idle-notch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-28 h-0 bg-black rounded-b-[12px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};