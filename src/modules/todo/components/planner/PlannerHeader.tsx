
import { IconCalendarEvent, IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { Button } from '../../../../components/ui/Button';
import { motion } from 'framer-motion';

interface PlannerHeaderProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  onOpenAddPlan: () => void;
}

export function PlannerHeader({ selectedDate, setSelectedDate, onOpenAddPlan }: PlannerHeaderProps) {
  const handlePrevDay = () => {
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex items-center justify-between w-full mb-6">
      {/* Title block */}
      <div className="flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 shadow-subtle">
          <IconCalendarEvent size={26} stroke={1.5} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight">Daily Planner</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Plan your day. Stay focused. Get things done.</p>
        </div>
      </div>

      {/* Date navigation and actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-surface border border-border/50 rounded-xl p-1 shadow-subtle">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevDay}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <IconChevronLeft size={18} stroke={2.5} />
          </motion.button>
          <button 
            onClick={handleToday}
            className="px-4 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Today
          </button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleNextDay}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <IconChevronRight size={18} stroke={2.5} />
          </motion.button>
        </div>

        <Button variant="primary" onClick={onOpenAddPlan} className="flex items-center gap-1.5 font-semibold text-[13px] px-3 py-1.5 h-[42px] rounded-xl">
          <IconPlus size={16} stroke={2.5} />
          Add Plan
        </Button>
      </div>
    </div>
  );
}
