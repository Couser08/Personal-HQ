import React from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
} from '@tabler/icons-react';

interface CalendarNavBarProps {
  currentMonth: Date;
  activeViewTab: 'month' | 'week' | 'day' | 'agenda';
  setActiveViewTab: (tab: 'month' | 'week' | 'day' | 'agenda') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handlePrev: () => void;
  handleToday: () => void;
  handleNext: () => void;
}

export const CalendarNavBar: React.FC<CalendarNavBarProps> = ({
  currentMonth,
  activeViewTab,
  setActiveViewTab,
  searchQuery,
  setSearchQuery,
  handlePrev,
  handleToday,
  handleNext,
}) => {
  return (
    <div className="p-4.5 border-b border-slate-100 dark:border-border/80 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[19px] font-black text-text-primary tracking-tight flex items-center gap-1.5 cursor-pointer">
          <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <IconChevronDown size={14} className="text-text-muted" />
        </h2>

        <div className="flex items-center bg-slate-50 dark:bg-surface border border-slate-200/60 dark:border-border/50 rounded-xl p-0.5 shadow-sm">
          <button
            onClick={handlePrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white dark:hover:bg-surface-hover cursor-pointer border-none bg-transparent transition-all"
          >
            <IconChevronLeft size={15} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleToday}
            className="px-3.5 text-xs font-bold text-text-secondary hover:text-text-primary cursor-pointer border-none bg-transparent"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white dark:hover:bg-surface-hover cursor-pointer border-none bg-transparent transition-all"
          >
            <IconChevronRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Tab Options */}
      <div className="flex items-center gap-1 bg-slate-50 dark:bg-surface border border-slate-200/50 dark:border-border/50 p-1 rounded-xl shadow-sm">
        {(['month', 'week', 'day', 'agenda'] as const).map((viewTab) => (
          <button
            key={viewTab}
            onClick={() => setActiveViewTab(viewTab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border-none cursor-pointer ${
              activeViewTab === viewTab
                ? 'bg-white dark:bg-surface-alt text-indigo-650 dark:text-indigo-400 shadow-sm font-black'
                : 'bg-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {viewTab}
          </button>
        ))}
      </div>

      {/* Search Events bar */}
      <div className="relative w-full sm:w-60">
        <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-surface border border-slate-200/60 dark:border-border/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>
    </div>
  );
};
