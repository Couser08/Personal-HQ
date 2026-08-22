import React from 'react';
import type { TodoTask, Habit, Countdown } from '../../../../store/types';

interface WeekGridTabProps {
  weekDays: { date: Date; dateStr: string; dayName: string; dayNum: number }[];
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  getCellEvents: (dateStr: string) => {
    tasks: TodoTask[];
    countdowns: Countdown[];
    habits: Habit[];
  };
}

export const WeekGridTab: React.FC<WeekGridTabProps> = ({
  weekDays,
  selectedDate,
  setSelectedDate,
  getCellEvents,
}) => {
  return (
    <div className="flex-grow grid grid-cols-7 min-h-[550px] bg-white dark:bg-surface/20">
      {weekDays.map((wd, i) => {
        const isSelected = wd.date.toDateString() === selectedDate.toDateString();
        const isToday = wd.date.toDateString() === new Date().toDateString();
        const cellEvents = getCellEvents(wd.dateStr);

        return (
          <div
            key={i}
            onClick={() => setSelectedDate(wd.date)}
            className={`border-r border-slate-100 dark:border-border/50 p-3 flex flex-col gap-2 min-w-0 text-left cursor-pointer last:border-r-0 hover:bg-slate-50/50 dark:hover:bg-surface-hover/20 ${
              isSelected
                ? 'bg-indigo-50/10 dark:bg-indigo-950/5 border-2 border-indigo-600 -m-px z-10 rounded-xl'
                : ''
            }`}
          >
            <div className="flex flex-col items-center pb-2 border-b border-slate-100 dark:border-border/40 mb-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase text-text-muted">{wd.dayName}</span>
              <span
                className={`text-base font-black w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                  isToday
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : isSelected
                    ? 'text-indigo-600 font-bold'
                    : 'text-text-primary'
                }`}
              >
                {wd.dayNum}
              </span>
            </div>

            <div className="flex-grow overflow-y-auto flex flex-col gap-1.5 custom-scrollbar max-h-[460px] pr-0.5">
              {cellEvents.countdowns.map((c) => (
                <div
                  key={c.id}
                  className="p-2 rounded-xl border border-solid border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-[10px] font-black flex items-center gap-1"
                >
                  <span>{c.emoji}</span>
                  <span className="truncate">{c.label}</span>
                </div>
              ))}

              {cellEvents.habits.map((h) => (
                <div
                  key={h.id}
                  className="p-2 rounded-xl border border-solid border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
                  <span className="truncate">{h.name}</span>
                </div>
              ))}

              {cellEvents.tasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-2 rounded-xl border border-solid text-[10px] font-black flex flex-col gap-0.5 select-none ${
                    t.completed
                      ? 'bg-slate-100 dark:bg-surface-alt border-slate-200 dark:border-border text-text-muted line-through'
                      : t.featured
                      ? 'bg-amber-500/10 border-amber-400 text-amber-700 dark:text-amber-400'
                      : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400'
                  }`}
                >
                  <span className="truncate">{t.title}</span>
                  {t.startTime && <span className="text-[8.5px] opacity-75">{t.startTime}</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
