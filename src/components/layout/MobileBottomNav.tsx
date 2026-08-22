import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconLayout,
  IconChecklist,
  IconFlame,
  IconMenu2,
  IconPlus,
  IconSparkles,
  IconFileText,
  IconX,
  IconBook2,
  IconTarget,
  IconBulb,
  IconClockPlay,
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';

interface MobileBottomNavProps {
  onOpenAi: (actionType?: string) => void;
  onOpenDrawer?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAi,
  onOpenDrawer,
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
      id: 'habits',
      label: 'New Habit',
      desc: 'Track daily streak',
      icon: IconFlame,
      color: 'from-orange-500 to-amber-600',
      action: () => {
        setActiveModule('habits');
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
      id: 'til',
      label: 'Today I Learned',
      desc: 'Log quick snippet or tip',
      icon: IconBulb,
      color: 'from-rose-500 to-pink-600',
      action: () => {
        setActiveModule('til');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'pomodoro',
      label: 'Focus Session',
      desc: 'Start 25m Pomodoro clock',
      icon: IconClockPlay,
      color: 'from-red-500 to-rose-600',
      action: () => {
        setActiveModule('pomodoro');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'vision',
      label: 'New Vision Goal',
      desc: 'Plant ambition on canvas',
      icon: IconTarget,
      color: 'from-violet-600 to-purple-600',
      action: () => {
        setActiveModule('vision');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'markdown',
      label: 'New Document',
      desc: 'Markdown creator note',
      icon: IconFileText,
      color: 'from-sky-500 to-blue-600',
      action: () => {
        setActiveModule('markdown');
        setIsQuickCreateOpen(false);
      },
    },
    {
      id: 'ai',
      label: 'Ask AI Assistant',
      desc: 'Instant answer & plan breakdown',
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
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] bg-surface border-t border-border shadow-2xl p-5 md:hidden pb-8 flex flex-col gap-3.5 text-text-primary max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            {/* Handle */}
            <div className="flex justify-center -mt-1">
              <div className="w-12 h-1.5 rounded-full bg-border-alt" />
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

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={act.action}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-surface-alt hover:bg-surface-hover border border-border/50 text-left transition-all active:scale-95 cursor-pointer group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${act.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="w-full min-w-0">
                      <h4 className="text-[12.5px] font-bold text-text-primary leading-tight truncate">
                        {act.label}
                      </h4>
                      <p className="text-[10px] text-text-secondary font-medium truncate mt-0.5">
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
        <nav className="pointer-events-auto bg-surface/90 backdrop-blur-2xl border border-border/60 shadow-[var(--shadow-float)] rounded-full px-2 py-1.5 flex items-center justify-between">
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
              className="w-12 h-12 rounded-full bg-primary text-text-on-accent shadow-[var(--shadow-float)] flex items-center justify-center border-2 border-surface cursor-pointer"
              title="Quick Create"
              aria-label="Quick Create Action"
            >
              <IconPlus size={24} stroke={2.5} />
            </motion.button>
          </div>

          {/* Habits */}
          <DockTabButton
            active={activeModule === 'habits'}
            onClick={() => setActiveModule('habits')}
            icon={IconFlame}
            label="Habits"
          />

          {/* More / All Modules Drawer */}
          <DockTabButton
            active={false}
            onClick={() => onOpenDrawer && onOpenDrawer()}
            icon={IconMenu2}
            label="More"
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
        className={`relative z-10 text-[9.5px] font-semibold tracking-tight transition-colors ${
          active ? 'text-primary' : 'text-text-tertiary'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
