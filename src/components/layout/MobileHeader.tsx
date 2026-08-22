import React from 'react';
import { motion } from 'framer-motion';
import {
  IconMenu2,
  IconSparkles,
  IconSun,
  IconMoon,
  IconBug,
} from '@tabler/icons-react';
import { AppLogo } from '../ui/AppLogo';
import { useAppStore } from '../../store/useAppStore';
import { useBugReportStore } from '../../store/useBugReportStore';
import { useShallow } from 'zustand/react/shallow';

interface MobileHeaderProps {
  onOpenDrawer: () => void;
  onOpenAi: (actionType?: string) => void;
}

const MODULE_TITLES: Record<string, { label: string; emoji: string }> = {
  dashboard: { label: 'Dashboard', emoji: '🏠' },
  todo: { label: 'Daily Planner', emoji: '📅' },
  journal: { label: 'Journal', emoji: '📖' },
  vision: { label: 'Vision Board', emoji: '🎯' },
  books: { label: 'My Library', emoji: '📚' },
  markdown: { label: 'Markdown', emoji: '✍️' },
  habits: { label: 'Habits', emoji: '🔥' },
  pomodoro: { label: 'Pomodoro', emoji: '⏱️' },
  exam: { label: 'AI Exam Prep', emoji: '🧠' },
  mindmap: { label: 'Mindmap', emoji: '🗺️' },
  drawing: { label: 'Drawing', emoji: '🎨' },
  media: { label: 'Media Log', emoji: '🎮' },
  condition: { label: 'Workstation', emoji: '📊' },
  utilities: { label: 'Utilities', emoji: '🛠️' },
  linksaver: { label: 'Link Vault', emoji: '🔗' },
  snippets: { label: 'Snippets', emoji: '💻' },
  til: { label: 'Today I Learned', emoji: '💡' },
  tags: { label: 'Tags', emoji: '🏷️' },
  settings: { label: 'Settings', emoji: '⚙️' },
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenDrawer,
  onOpenAi,
}) => {
  const { activeModule, theme, setTheme } = useAppStore(
    useShallow((state) => ({
      activeModule: state.activeModule,
      theme: state.theme,
      setTheme: state.setTheme,
    }))
  );

  const currentMod = MODULE_TITLES[activeModule] || {
    label: 'Personal HQ',
    emoji: '✨',
  };

  return (
    <header data-component="MobileHeader" className="sticky top-0 left-0 right-0 z-40 md:hidden w-full shrink-0 bg-surface/90 backdrop-blur-2xl border-b border-border/60 px-3.5 py-2.5 flex items-center justify-between shadow-xs select-none">
      {/* Left: Drawer Trigger + App Logo */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          data-bug-target="mobile-menu-btn"
          onClick={onOpenDrawer}
          className="w-9 h-9 rounded-xl bg-surface-alt hover:bg-surface border border-border/50 flex items-center justify-center text-text-primary active:scale-95 transition-transform cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <IconMenu2 size={19} />
        </button>

        <div className="flex items-center gap-2">
          <AppLogo className="w-7 h-7 rounded-lg shadow-xs" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">{currentMod.emoji}</span>
              <h1 className="font-semibold text-[14px] tracking-tight leading-none text-text-primary">
                {currentMod.label}
              </h1>
            </div>
            <span className="text-[9.5px] font-semibold text-text-tertiary uppercase tracking-[0.04em] mt-0.5">
              Personal HQ
            </span>
          </div>
        </div>
      </div>

      {/* Right: Bug Report + AI Trigger Pill + Theme Switcher */}
      <div className="flex items-center gap-1.5">
        {/* Report Bug button */}
        <button
          type="button"
          onClick={() => useBugReportStore.getState().startInspection()}
          className="w-8 h-8 rounded-xl bg-surface-alt hover:bg-surface border border-border/50 flex items-center justify-center text-text-secondary hover:text-accent-danger transition-colors cursor-pointer active:scale-95"
          title="Report Bug / Inspect Element"
          aria-label="Report Bug"
        >
          <IconBug size={16} />
        </button>

        {/* Glowing Ask AI Pill */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => onOpenAi()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-text-on-accent text-[11.5px] font-semibold shadow-xs active:scale-95 transition-all cursor-pointer border border-border-hairline"
        >
          <IconSparkles size={13} className="animate-pulse" />
          <span>Ask AI</span>
        </motion.button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-xl bg-surface-alt hover:bg-surface border border-border/50 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>
      </div>
    </header>
  );
};
