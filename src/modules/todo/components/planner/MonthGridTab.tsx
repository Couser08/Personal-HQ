import React from 'react';
import type { TodoTask, Habit, Countdown } from '../../../../store/types';

interface MonthGridTabProps {
  calendarDays: { date: Date; isCurrentMonth: boolean; dateStr: string }[];
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  getCellEvents: (dateStr: string) => {
    tasks: TodoTask[];
    countdowns: Countdown[];
    habits: Habit[];
  };
}

export const MonthGridTab: React.FC<MonthGridTabProps> = ({
  calendarDays,
  selectedDate,
  setSelectedDate,
  getCellEvents,
}) => {
  return (
    <div className="flex-grow grid grid-cols-7 grid-rows-[auto_repeat(6,_1fr)] min-h-[360px] sm:min-h-[550px] bg-white dark:bg-surface/20">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
        <div
          key={i}
          className="border-b border-r border-slate-100 dark:border-border/50 py-3 text-center text-[10px] font-black text-text-muted uppercase tracking-widest bg-slate-50/50 dark:bg-surface-alt/20 last:border-r-0"
        >
          {d}
        </div>
      ))}

      {calendarDays.map((cell, idx) => {
        const isSelected = cell.date.toDateString() === selectedDate.toDateString();
        const isToday = cell.date.toDateString() === new Date().toDateString();
        const cellEvents = getCellEvents(cell.dateStr);

        const totalCount =
          cellEvents.tasks.length + cellEvents.countdowns.length + cellEvents.habits.length;

        return (
          <div
            key={idx}
            onClick={() => setSelectedDate(cell.date)}
            className={`border-b border-r border-slate-100 dark:border-border/50 p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1 text-left relative transition-all min-h-[52px] sm:min-h-[90px] cursor-pointer hover:bg-slate-50/50 dark:hover:bg-surface-hover/20 ${
              isSelected
                ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-2 border-indigo-600 -m-px z-10 rounded-xl shadow-sm'
                : ''
            } ${!cell.isCurrentMonth ? 'opacity-30 bg-slate-50/10 dark:bg-surface-alt/10' : ''} last:border-r-0`}
          >
            <div className="flex justify-between items-center pb-0.5 sm:pb-1">
              {isToday ? <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> : <span />}
              <span
                className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[10.5px] sm:text-[11.5px] font-extrabold ${
                  isSelected
                    ? 'text-indigo-600 font-black'
                    : isToday
                    ? 'text-indigo-600 font-black bg-indigo-50 dark:bg-indigo-950/20'
                    : 'text-text-primary'
                }`}
              >
                {cell.date.getDate()}
              </span>
            </div>

            {/* Mobile Dot Indicators */}
            <div className="flex items-center justify-center gap-1 sm:hidden mt-0.5 flex-wrap">
              {cellEvents.countdowns.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
              {cellEvents.habits.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
              {cellEvents.tasks.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className={`w-1.5 h-1.5 rounded-full ${
                    t.completed ? 'bg-text-muted' : t.featured ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                />
              ))}
            </div>

            {/* Desktop Full Chip Indicators */}
            <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden">
              {cellEvents.countdowns.slice(0, 1).map((c) => (
                <div
                  key={c.id}
                  className="text-[9.5px] font-black px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 flex items-center truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mr-1.5" />
                  {c.label}
                </div>
              ))}

              {cellEvents.habits.slice(0, 1).map((h) => (
                <div
                  key={h.id}
                  className="text-[9.5px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mr-1.5" />
                  {h.name}
                </div>
              ))}

              {cellEvents.tasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  className={`text-[9.5px] font-black px-2 py-0.5 rounded-lg flex items-center truncate ${
                    t.completed
                      ? 'bg-slate-100 dark:bg-surface-alt text-text-muted line-through border border-slate-200 dark:border-border'
                      : t.featured
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-400'
                      : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 ${
                      t.completed ? 'bg-text-muted' : t.featured ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                  />
                  {t.title}
                </div>
              ))}

              {totalCount > 3 && (
                <span className="text-[8px] font-black text-text-muted uppercase tracking-wider pl-1.5 mt-0.5 block">
                  +{totalCount - 3} more items
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
