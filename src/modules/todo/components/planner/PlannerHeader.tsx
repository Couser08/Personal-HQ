import { useMemo } from 'react';
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react';
import { Button } from '../../../../components/ui/Button';
import { motion } from 'framer-motion';

interface PlannerHeaderProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  onOpenAddPlan: () => void;
}

export function PlannerHeader({
  selectedDate,
  setSelectedDate,
  onOpenAddPlan,
}: PlannerHeaderProps) {
  const currentDate = selectedDate || new Date();

  // Generate a 7-day strip centered around the selected date
  const weekStrip = useMemo(() => {
    const days = [];
    const base = new Date(currentDate);
    // 3 days before to 3 days after
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate.toDateString()]);

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const isSelected = (d: Date) => d.toDateString() === currentDate.toDateString();

  return (
    <div className="flex flex-col gap-4 w-full mb-5">
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title block */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-[50px] sm:h-[50px] rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 shadow-subtle">
            <IconCalendarEvent size={24} stroke={1.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-[22px] font-black text-text-primary tracking-tight leading-none">
              Daily Planner
            </h1>
            <p className="text-[12px] sm:text-[13px] text-text-secondary mt-1 font-medium">
              {currentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Date navigation & Add Plan action */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-surface border border-border/60 rounded-xl p-1 shadow-subtle">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handlePrevDay}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <IconChevronLeft size={16} stroke={2.5} />
            </motion.button>
            <button
              onClick={handleToday}
              className={`px-2.5 sm:px-3 text-[12px] font-extrabold transition-colors cursor-pointer ${
                isToday(currentDate)
                  ? 'text-indigo-600 dark:text-indigo-400 font-black'
                  : 'text-text-primary hover:text-indigo-600'
              }`}
              title={isToday(currentDate) ? 'Today' : 'Click to jump to Today'}
            >
              {isToday(currentDate) ? 'Today' : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleNextDay}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <IconChevronRight size={16} stroke={2.5} />
            </motion.button>
          </div>

          <Button
            variant="primary"
            onClick={onOpenAddPlan}
            className="flex items-center gap-1 font-bold text-[12px] sm:text-[13px] px-3 py-1.5 h-[38px] sm:h-[42px] rounded-xl cursor-pointer"
          >
            <IconPlus size={16} stroke={2.5} />
            <span>Add Plan</span>
          </Button>
        </div>
      </div>

      {/* ── 7-Day Mobile Quick Date Strip Carousel ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-1 select-none">
        {weekStrip.map((d) => {
          const sel = isSelected(d);
          const tod = isToday(d);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = d.getDate();

          return (
            <motion.button
              key={d.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(d)}
              className={`flex-1 min-w-[48px] py-2 px-1.5 rounded-2xl flex flex-col items-center gap-0.5 border transition-all cursor-pointer ${
                sel
                  ? 'bg-primary text-text-on-accent border-primary shadow-md'
                  : tod
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary border-border/50'
              }`}
            >
              <span className="text-[9.5px] font-extrabold uppercase tracking-wider">
                {tod && !sel ? 'Today' : dayName}
              </span>
              <span className="text-[14px] font-black leading-none">{dayNum}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
