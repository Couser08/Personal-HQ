import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconLayout,
  IconChecklist,
  IconTarget,
  IconBook2,
  IconPlus,
  IconSparkles,
  IconFileText,
  IconX,
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';

interface MobileBottomNavProps {
  onOpenAi: (actionType?: string) => void;
  onOpenCreateTask?: () => void;
  onOpenCreateVision?: () => void;
  onOpenCreateJournal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAi,
}) => {
  const { activeModule, setActiveModule } = useAppStore(
    useShallow((state) => ({
      activeModule: state.activeModule,
      setActiveModule: state.setActiveModule,
    }))
  );

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const quickActions = [
    {
      id: 'task',
      label: 'New Task',
      desc: 'Add to Daily Planner',
      icon: IconChecklist,
      color: 'from-blue-600 to-indigo-600',
      action: () => {
        setActiveModule('todo');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'vision',
      label: 'New Vision',
      desc: 'Plant goal on rope canvas',
      icon: IconTarget,
      color: 'from-rose-500 to-pink-600',
      action: () => {
        setActiveModule('vision');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'journal',
      label: 'New Log',
      desc: 'Write daily reflection',
      icon: IconBook2,
      color: 'from-emerald-600 to-teal-600',
      action: () => {
        setActiveModule('journal');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'markdown',
      label: 'New Doc',
      desc: 'Markdown document',
      icon: IconFileText,
      color: 'from-amber-500 to-orange-600',
      action: () => {
        setActiveModule('markdown');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'ai',
      label: 'Ask AI Assistant',
      desc: 'Instant answer & breakdown',
      icon: IconSparkles,
      color: 'from-purple-600 to-indigo-600',
      action: () => {
        setIsQuickCreateOpen(false);
        onOpenAi();
      },
    },
  ];

  return (
    <>
      {/* ── Quick Create Radial Hub Backdrop ── */}
      <AnimatePresence>
        {isQuickCreateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQuickCreateOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Quick Create Bottom Sheet ── */}
      <AnimatePresence>
        {isQuickCreateOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] bg-surface border-t border-border shadow-2xl p-6 md:hidden pb-10 flex flex-col gap-4 text-text-primary"
          >
            {/* Handle */}
            <div className="flex justify-center -mt-2">
              <div className="w-12 h-1.5 rounded-full bg-border-hairline" />
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div>
                <h3 className="text-[16px] font-black tracking-tight text-text-primary">
                  Quick Create Hub
                </h3>
                <p className="text-[11px] text-text-secondary font-medium">
                  What would you like to build right now?
                </p>
              </div>
              <button
                onClick={() => setIsQuickCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-alt text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="grid grid-cols-1 gap-2.5">
              {quickActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={act.action}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface-alt hover:bg-surface border border-border/50 text-left transition-all active:scale-98 cursor-pointer group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${act.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13.5px] font-extrabold text-text-primary leading-tight">
                        {act.label}
                      </h4>
                      <p className="text-[11px] text-text-secondary font-medium truncate mt-0.5">
                        {act.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING APPLE-GRADE BOTTOM DOCK ── */}
      <div className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40 md:hidden pointer-events-none">
        <nav className="pointer-events-auto bg-surface/85 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-full px-2 py-1.5 flex items-center justify-between">
          {/* Home */}
          <DockTabButton
            active={activeModule === 'dashboard'}
            onClick={() => setActiveModule('dashboard')}
            icon={IconLayout}
            label="Home"
          />

          {/* Planner */}
          <DockTabButton
            active={activeModule === 'todo'}
            onClick={() => setActiveModule('todo')}
            icon={IconChecklist}
            label="Planner"
          />

          {/* Center Quick Create Floating Action Hub */}
          <div className="relative -my-3 px-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsQuickCreateOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary via-rose-500 to-indigo-600 text-text-on-accent shadow-[0_10px_25px_rgba(0,0,0,0.3)] flex items-center justify-center border-2 border-surface cursor-pointer"
              title="Quick Create"
              aria-label="Quick Create Action"
            >
              <IconPlus size={24} stroke={2.5} />
            </motion.button>
          </div>

          {/* Vision */}
          <DockTabButton
            active={activeModule === 'vision'}
            onClick={() => setActiveModule('vision')}
            icon={IconTarget}
            label="Vision"
          />

          {/* Journal */}
          <DockTabButton
            active={activeModule === 'journal'}
            onClick={() => setActiveModule('journal')}
            icon={IconBook2}
            label="Journal"
          />
        </nav>
      </div>
    </>
  );
};

// ── Dock Button Subcomponent with Animated Pill ──
function DockTabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-text-secondary transition-colors"
    >
      {/* Gliding Active Background Pill */}
      {active && (
        <motion.div
          layoutId="mobileDockActivePill"
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          className="absolute inset-0 bg-primary/10 rounded-full"
        />
      )}

      <div
        className={`relative z-10 p-1 rounded-full transition-transform duration-200 ${
          active ? 'text-primary scale-110' : 'hover:text-text-primary'
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>

      <span
        className={`relative z-10 text-[9.5px] font-extrabold tracking-tight transition-colors ${
          active ? 'text-primary' : 'text-text-tertiary'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
