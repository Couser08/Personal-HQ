import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconSearch, IconLayout, IconChecklist, IconBook, IconWallet, 
  IconCode, IconClockPlay, IconSitemap, IconSettings, IconSun, 
  IconMoon, IconEye, IconTerminal 
} from '@tabler/icons-react';
import { triggerDynamicIsland } from './DynamicIsland';

export function CommandPalette() {
  const { setActiveModule, theme, setTheme } = useAppStore(useShallow(state => ({
    setActiveModule: state.setActiveModule,
    theme: state.theme,
    setTheme: state.setTheme,
  })));

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle command palette on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // Modules
    { id: 'dashboard', label: 'Go to Home', category: 'Navigation', icon: IconLayout, action: () => setActiveModule('dashboard') },
    { id: 'projects', label: 'Go to Projects', category: 'Navigation', icon: IconTerminal, action: () => setActiveModule('projects') },
    { id: 'todo', label: 'Go to To-Do List', category: 'Navigation', icon: IconChecklist, action: () => setActiveModule('todo') },
    { id: 'study', label: 'Go to Study Tracker', category: 'Navigation', icon: IconBook, action: () => setActiveModule('study') },
    { id: 'budget', label: 'Go to Expense & Income', category: 'Navigation', icon: IconWallet, action: () => setActiveModule('budget') },
    { id: 'snippets', label: 'Go to Snippets Vault', category: 'Navigation', icon: IconCode, action: () => setActiveModule('snippets') },
    { id: 'pomodoro', label: 'Go to Pomodoro', category: 'Navigation', icon: IconClockPlay, action: () => setActiveModule('pomodoro') },
    { id: 'mindmap', label: 'Go to Mindmap Canvas', category: 'Navigation', icon: IconSitemap, action: () => setActiveModule('mindmap') },
    { id: 'settings', label: 'Go to Settings', category: 'Navigation', icon: IconSettings, action: () => setActiveModule('settings') },

    // Preferences & Actions
    { id: 'toggle-theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, category: 'Preference', icon: theme === 'dark' ? IconSun : IconMoon, action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        triggerDynamicIsland('Theme Changed', `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`, 'success', 'confetti');
      } 
    },
    { id: 'toggle-focus', label: 'Toggle Focus Mode', category: 'Preference', icon: IconEye, action: () => {
        const active = localStorage.getItem('phq_focus_mode') === 'true';
        localStorage.setItem('phq_focus_mode', active ? 'false' : 'true');
        window.dispatchEvent(new Event('phq-focus-mode-change'));
        triggerDynamicIsland(active ? 'Focus Mode Off' : 'Focus Mode On', active ? 'Sidebar visible' : 'Distractions dimmed', 'success', 'award');
      }
    },
  ];

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-24 px-4 select-none">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -20 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
          className="relative bg-surface border border-border/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Search Input Area */}
          <div className="flex items-center px-4 border-b border-border/40">
            <IconSearch className="w-4 h-4 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border-none py-3.5 pl-3 pr-2 text-xs font-semibold focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted"
            />
            <kbd className="px-1.5 py-0.5 bg-surface-alt rounded text-[9px] font-mono font-bold text-text-muted border border-border/20 shrink-0">ESC</kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-0.5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted font-medium">No results found.</div>
            ) : (
              filteredItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-alt text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-surface-alt border border-border/40 flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-text-primary truncate">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-text-muted tracking-wider group-hover:text-text-secondary transition-colors shrink-0">
                      {item.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="px-4 py-2 border-t border-border/30 bg-surface-alt/40 flex justify-between items-center text-[8px] font-black text-text-muted uppercase tracking-wider shrink-0">
            <span>Use Cmd+K or Ctrl+K to toggle anywhere</span>
            <span>press Esc to cancel</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
