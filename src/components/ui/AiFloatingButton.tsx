import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSparkles, IconPlus, IconListCheck, IconTarget,
  IconBulb, IconX, IconChevronUp
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
    <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3 select-none">
      {/* Speed-Dial Quick Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="flex flex-col gap-1.5 p-2 rounded-2xl bg-surface/95 text-text-primary border border-border shadow-2xl backdrop-blur-xl w-60"
          >
            <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">AI Quick Shortcuts</span>
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

      {/* Single Merged Glowing AI Floating Pill Trigger */}
      <div className="relative group">
        {/* Pulsing Outer Glow Aura */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 opacity-65 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />

        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative flex items-center gap-2.5 pl-2 pr-3.5 py-2 rounded-full bg-surface/95 hover:bg-surface-hover border border-white/20 text-text-primary shadow-2xl backdrop-blur-xl transition-all cursor-pointer"
        >
          {/* Avatar Icon Circle */}
          <button
            type="button"
            onClick={() => onClick()}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md">
              <IconSparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" stroke={2} />
              <span
                className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${
                  hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
                title={hasApiKey ? 'Gemini AI Ready' : 'Gemini Key Missing'}
              />
            </div>
            <span className="text-xs font-black tracking-tight text-text-primary">Ask AI</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-alt text-text-muted border border-border">
              ⌘AI
            </kbd>
          </button>

          {/* Quick Menu Toggle Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded-full hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Toggle Quick Actions"
          >
            {isExpanded ? <IconX size={15} /> : <IconChevronUp size={15} />}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
