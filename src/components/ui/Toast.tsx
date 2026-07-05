import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, type ToastType } from '../../store/useToastStore';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: <IconCheck className="w-[15px] h-[15px] text-emerald-400" />,
        glowColor: 'rgba(16, 185, 129, 0.2)'
      };
    case 'error':
      return {
        icon: <IconX className="w-[15px] h-[15px] text-rose-400" />,
        glowColor: 'rgba(244, 63, 94, 0.2)'
      };
    case 'warning':
      return {
        icon: <IconAlertTriangle className="w-[15px] h-[15px] text-amber-400" />,
        glowColor: 'rgba(245, 158, 11, 0.2)'
      };
    case 'info':
    default:
      return {
        icon: <IconInfoCircle className="w-[15px] h-[15px] text-blue-400" />,
        glowColor: 'rgba(59, 130, 246, 0.2)'
      };
  }
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

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
              boxShadow: `0 20px 40px -10px ${config?.glowColor}, 0 10px 20px -5px rgba(0,0,0,0.7)` 
            }}
            exit={{ opacity: 0, y: -30, scaleX: 0.8, transition: { duration: 0.15 } }}
            transition={islandTransition}
            className="pointer-events-auto flex items-center gap-3 px-5 py-3 bg-[#000000] text-white rounded-b-[22px] border-x border-b border-zinc-800/40 min-w-[280px] max-w-[400px]"
            style={{
              // Subtle top bar intersection blending shadow
              borderTop: 'none'
            }}
          >
            {/* Minimal Icon Core */}
            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800/70">
              {config?.icon}
            </div>

            {/* Tight Inline Content Meta Layout */}
            <div className="flex flex-col flex-1 min-w-0 pr-2">
              <span className="text-[13px] font-semibold text-zinc-100 leading-none tracking-[-0.15px]">
                {activeToast.title}
              </span>
              {activeToast.message && (
                <p className="text-[11.5px] text-zinc-400 mt-1.5 leading-tight font-normal truncate">
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
              className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 border border-zinc-800/50 transition-colors cursor-pointer"
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