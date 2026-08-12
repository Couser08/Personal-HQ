
import { type TodoTask } from '../../../../store/types';
import { IconDotsVertical, IconSun, IconTarget, IconBook, IconCoffee, IconBriefcase, IconUsers, IconBrain, IconUser, IconChecklist } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface PlannerTimelineProps {
  tasks: TodoTask[];
  onEditTask: (task: TodoTask) => void;
  onToggleComplete: (id: string) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string; icon: any }> = {
  'Routine':  { bg: 'bg-emerald-500/10',  text: 'text-emerald-600',  dot: 'bg-emerald-500',  icon: IconSun },
  'Focus':    { bg: 'bg-violet-500/10',   text: 'text-violet-600',   dot: 'bg-violet-500',   icon: IconTarget },
  'Learning': { bg: 'bg-orange-500/10',   text: 'text-orange-600',   dot: 'bg-orange-500',   icon: IconBook },
  'Break':    { bg: 'bg-blue-500/10',     text: 'text-blue-600',     dot: 'bg-blue-500',     icon: IconCoffee },
  'Work':     { bg: 'bg-indigo-500/10',   text: 'text-indigo-600',   dot: 'bg-indigo-500',   icon: IconBriefcase },
  'Meeting':  { bg: 'bg-rose-500/10',     text: 'text-rose-600',     dot: 'bg-rose-500',     icon: IconUsers },
  'Review':   { bg: 'bg-teal-500/10',     text: 'text-teal-600',     dot: 'bg-teal-500',     icon: IconBrain },
  'Personal': { bg: 'bg-cyan-500/10',     text: 'text-cyan-600',     dot: 'bg-cyan-500',     icon: IconUser },
};

const DEFAULT_STYLE = { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500', icon: IconChecklist };

export function PlannerTimeline({ tasks, onEditTask, onToggleComplete }: PlannerTimelineProps) {
  
  // Sort tasks by start time (assuming HH:MM AM/PM format)
  const parseTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const isPM = match[3].toUpperCase() === 'PM';
    if (h === 12 && !isPM) h = 0;
    if (h < 12 && isPM) h += 12;
    return h * 60 + m;
  };

  const sortedTasks = [...tasks].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

  return (
    <div className="flex flex-col relative pb-10">
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <IconChecklist size={48} stroke={1} className="mb-4 opacity-50" />
          <p>No plans scheduled for this day.</p>
        </div>
      ) : (
        <div className="relative pl-[80px]">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[92px] top-6 bottom-0 w-px bg-border/60" />

          {sortedTasks.map((task, index) => {
            const style = task.category && CATEGORY_STYLES[task.category] ? CATEGORY_STYLES[task.category] : DEFAULT_STYLE;
            const Icon = style.icon;

            return (
              <motion.div 
                key={task.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-center mb-4 group"
              >
                {/* Time Label on left */}
                <div className="absolute left-[-80px] w-16 text-right">
                  <span className="text-[12px] font-semibold text-text-secondary">{task.startTime || '--:--'}</span>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-[9.5px] z-10 flex items-center justify-center w-[6px] h-[6px] bg-bg-primary">
                  <div className={`w-[6px] h-[6px] rounded-full ${style.dot} ring-4 ring-bg-primary`} />
                </div>

                {/* Task Card */}
                <div 
                  className={`ml-8 w-full transition-colors rounded-2xl p-3 flex items-center justify-between shadow-subtle cursor-pointer border border-solid ${
                    task.featured 
                      ? 'border-amber-400 dark:border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 hover:bg-amber-500/10' 
                      : 'bg-surface border-border/40 hover:border-border/80'
                  }`} 
                  onClick={() => onToggleComplete(task.id)}
                >
                  
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${task.featured ? 'bg-amber-500/10 text-amber-550' : `${style.bg} ${style.text}`} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                      <Icon size={20} stroke={1.5} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-[14px] font-extrabold truncate ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          {task.title}
                        </h3>
                        {task.featured && (
                          <span className="px-1.5 py-0.5 rounded-lg bg-amber-550 text-white text-[8px] font-black tracking-wider uppercase flex items-center shrink-0 shadow-sm">
                            👑 Focus
                          </span>
                        )}
                      </div>
                      <p className="text-[12.5px] text-text-muted truncate mt-0.5">
                        {task.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  {/* Right side info */}
                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    {/* Category Pill */}
                    {task.category && (
                      <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${style.bg} ${style.text}`}>
                        {task.category}
                      </div>
                    )}
                    
                    {/* Time Range */}
                    <div className="text-[12px] font-semibold text-text-secondary w-28 text-right hidden sm:block">
                      {task.startTime} - {task.endTime}
                    </div>

                    {/* Options Button */}
                    <button 
                      className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
                      onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                    >
                      <IconDotsVertical size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
