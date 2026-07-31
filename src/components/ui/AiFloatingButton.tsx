import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSparkles, IconPlus, IconListCheck, IconTarget,
  IconBulb, IconX
} from '@tabler/icons-react';

interface AiFloatingButtonProps {
  onClick: (actionType?: string) => void;
  hasApiKey: boolean;
}

export const AiFloatingButton = ({ onClick, hasApiKey }: AiFloatingButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    { id: 'add_task', label: 'Add a Task', icon: IconPlus, color: 'from-blue-600 to-indigo-600' },
    { id: 'breakdown', label: 'Break Down a Task', icon: IconListCheck, color: 'from-indigo-600 to-purple-600' },
    { id: 'goal', label: 'Make Goal Realistic', icon: IconTarget, color: 'from-emerald-600 to-teal-600' },
    { id: 'suggest', label: 'Suggest Tasks', icon: IconBulb, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
      {/* Expandable Speed-Dial Quick Actions Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="flex flex-col gap-2 p-2 rounded-2xl bg-surface/95 text-text-primary border border-border shadow-2xl backdrop-blur-xl w-56"
          >
            <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Quick AI Actions</span>
              <span className="text-[10px] font-mono text-text-muted">⌘AI</span>
            </div>

            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onClick(act.id);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-alt hover:bg-surface-hover text-left text-xs font-semibold text-text-primary transition-all cursor-pointer group border border-border/50"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${act.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={14} stroke={2} />
                  </div>
                  <span>{act.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Robot Avatar Floating Trigger */}
      <div className="flex items-center gap-2">
        {/* Toggle Speed Dial vs Trigger Assistant */}
        <motion.button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-[0_8px_30px_-4px_rgba(147,51,234,0.5)] transition-all duration-300 cursor-pointer border border-white/20 group"
          aria-label="Toggle AI Quick Menu"
        >
          {/* Pulsing Outer Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-60 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />

          {/* Robot Avatar Icon / Close */}
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-black/20 backdrop-blur-xs">
            {isExpanded ? (
              <IconX className="w-6 h-6 text-white" stroke={2.5} />
            ) : (
              <IconSparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" stroke={2} />
            )}

            {/* Connection Status Dot */}
            <span
              className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-surface ${
                hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
              title={hasApiKey ? 'Gemini AI Ready' : 'Gemini Key Missing'}
            />
          </div>
        </motion.button>

        {/* Primary Launch Assistant Button */}
        {!isExpanded && (
          <motion.button
            type="button"
            onClick={() => onClick()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-alt text-text-primary border border-border shadow-xl backdrop-blur-md transition-all cursor-pointer text-xs font-bold"
          >
            <span>Ask AI</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-alt text-text-muted border border-border">
              ⌘AI
            </kbd>
          </motion.button>
        )}
      </div>
    </div>
  );
};
