import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconSearch, IconLayout, IconChecklist, IconBook, IconWallet, 
  IconCode, IconClockPlay, IconSitemap, IconSettings, IconSun, 
  IconMoon, IconEye, IconTerminal, IconCornerDownLeft,
  IconPencil, IconLink, IconFlame, IconNotebook, IconBook2
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
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle command palette shortcut panel [cite: 6]
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
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // ── Quick-Add ─────────────────────────────────────────────────────────
    { id: 'new-journal', label: 'New Journal Entry', category: 'Quick-Add', icon: IconBook2, action: () => {
        setActiveModule('journal');
        setTimeout(() => window.dispatchEvent(new CustomEvent('phq-new-journal-entry')), 200);
        triggerDynamicIsland('New Entry', 'Journal opened', 'success', 'confetti');
      }
    },
    { id: 'new-todo', label: 'New To-Do Task', category: 'Quick-Add', icon: IconChecklist, action: () => {
        setActiveModule('todo');
        setTimeout(() => window.dispatchEvent(new CustomEvent('phq-new-todo-task')), 200);
        triggerDynamicIsland('New Task', 'Todo opened', 'success', 'confetti');
      }
    },
    { id: 'new-notebook', label: 'New Book / Notebook', category: 'Quick-Add', icon: IconNotebook, action: () => {
        setActiveModule('books');
        setTimeout(() => window.dispatchEvent(new CustomEvent('phq-new-book')), 200);
        triggerDynamicIsland('New Book', 'Library opened', 'success', 'confetti');
      }
    },
    { id: 'new-habit', label: 'Log a Habit', category: 'Quick-Add', icon: IconFlame, action: () => {
        setActiveModule('habits');
        triggerDynamicIsland('Habits', 'Track your streak', 'success', 'award');
      }
    },
    { id: 'new-link', label: 'Save a Link', category: 'Quick-Add', icon: IconLink, action: () => {
        setActiveModule('linksaver');
        triggerDynamicIsland('Link Saver', 'Save a link', 'success', 'confetti');
      }
    },
    { id: 'new-note', label: 'New Drawing / Sketch', category: 'Quick-Add', icon: IconPencil, action: () => {
        setActiveModule('drawing');
        triggerDynamicIsland('Drawing', 'Canvas ready', 'success', 'confetti');
      }
    },
    // ── Navigation ────────────────────────────────────────────────────────
    { id: 'dashboard', label: 'Go to Home', category: 'Navigation', icon: IconLayout, action: () => setActiveModule('dashboard') },
    { id: 'projects', label: 'Go to Projects', category: 'Navigation', icon: IconTerminal, action: () => setActiveModule('projects') },
    { id: 'todo', label: 'Go to To-Do List', category: 'Navigation', icon: IconChecklist, action: () => setActiveModule('todo') },
    { id: 'study', label: 'Go to Study Tracker', category: 'Navigation', icon: IconBook, action: () => setActiveModule('study') },
    { id: 'budget', label: 'Go to Expense & Income', category: 'Navigation', icon: IconWallet, action: () => setActiveModule('budget') },
    { id: 'snippets', label: 'Go to Snippets Vault', category: 'Navigation', icon: IconCode, action: () => setActiveModule('snippets') },
    { id: 'pomodoro', label: 'Go to Pomodoro', category: 'Navigation', icon: IconClockPlay, action: () => setActiveModule('pomodoro') },
    { id: 'mindmap', label: 'Go to Mindmap Canvas', category: 'Navigation', icon: IconSitemap, action: () => setActiveModule('mindmap') },
    { id: 'settings', label: 'Go to Settings', category: 'Navigation', icon: IconSettings, action: () => setActiveModule('settings') },
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

  useEffect(() => {
    if (!isOpen) return;

    const handleArrows = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          filteredItems[activeIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleArrows);
    return () => window.removeEventListener('keydown', handleArrows);
  }, [isOpen, filteredItems, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  return (
    // CRITICAL: AnimatePresence wrapper moves to top layer to correctly orchestrate the exit phase
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className=" w-full fixed inset-0 z-[9999] flex items-start justify-center pt-28 px-4 select-none">
          {/* Backdrop Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-zinc-950/20 dark:bg-black/50 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Spotlight Layout Box */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: -12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            // Fixed exit params: Removed structural layout collapse vulnerabilities
            exit={{ scale: 0.97, opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="relative bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800/60 w-full max-w-xl rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden z-10 backdrop-blur-xl flex flex-col"
          >
            {/* Header Search Matrix */}
            <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 gap-3">
              <IconSearch className="w-[18px] h-[18px] text-zinc-400 dark:text-zinc-500 shrink-0" style={{ strokeWidth: 2.3 }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search features, navigation links, or preferences..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-[13.5px] font-medium focus:outline-none focus:ring-0 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 p-0"
              />
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 rounded-md border border-zinc-200/40 dark:border-zinc-700/40">ESC</kbd>
              </div>
            </div>

            {/* Core Command Streams */}
            <div className="max-h-[330px] overflow-y-auto p-2 flex flex-col gap-0.5 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-[13px] text-zinc-400 dark:text-zinc-500 font-medium">
                  No commands matching your search queries.
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer group relative ${
                        isSelected 
                          ? 'bg-zinc-100 dark:bg-zinc-800/80 shadow-sm' 
                          : 'bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
                    }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 z-10">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                          isSelected 
                            ? 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100' 
                            : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200/40 dark:border-zinc-800/40 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                        }`}>
                          <Icon className="w-[15px] h-[15px]" style={{ strokeWidth: 2 }} />
                        </div>
                        <span className={`text-[12.5px] font-semibold transition-colors truncate ${
                          isSelected ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center z-10">
                        {isSelected ? (
                          <motion.span 
                            layoutId="command-return-hint"
                            className="text-zinc-400 dark:text-zinc-500 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-700/40 shadow-2xs"
                          >
                            <IconCornerDownLeft className="w-2.5 h-2.5" />
                          </motion.span>
                        ) : (
                          <span className="text-[9.5px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Shortcut Info */}
            <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 flex justify-between items-center text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">
              <div className="flex items-center gap-1">
                <span>Navigate with</span>
                <kbd className="px-1 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">↑↓</kbd>
                <span>and select via</span>
                <kbd className="px-1 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">Enter</kbd>
              </div>
              <span>Esc to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}