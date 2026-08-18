import { motion } from 'framer-motion';
import { IconTarget } from '@tabler/icons-react';
import { type Habit } from '../../../store/types';
import { Card } from '../../../components/ui/Card';
import { useAppStore } from '../../../store/useAppStore';

interface HabitChecklistProps {
  dueHabits: Habit[];
  todayStr: string;
  overallProgress: number;
  completedTodayCount: number;
  activeFocusItem: any;
  setActiveFocusItem: (val: any) => void;
  handleToggleHabit: (id: string) => Promise<void>;
}

// Web Audio Tone Synthesis
const playCheckSound = () => {
  try {
    if (useAppStore.getState().settings.soundEnabled === false) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
};

export function HabitChecklist({
  dueHabits,
  todayStr,
  overallProgress,
  completedTodayCount,
  activeFocusItem,
  setActiveFocusItem,
  handleToggleHabit,
}: HabitChecklistProps) {

  const handleCheckboxClick = (id: string) => {
    playCheckSound();
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }

    void handleToggleHabit(id);
  };

  const checkmarkVariants = {
    checked: { pathLength: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' as any } },
    unchecked: { pathLength: 0, opacity: 0 }
  };

  return (
    <Card padding="lg" className="lg:col-span-5 flex flex-col gap-4 text-left select-none font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Due Today
        </span>
        {dueHabits.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all duration-300"
                style={{ width: `${overallProgress * 100}%` }}
              />
            </div>
            <span className="text-[12px] font-semibold text-text-secondary">
              {completedTodayCount}/{dueHabits.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 min-h-[120px]">
        {dueHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <span className="text-2xl">🎉</span>
            <p className="text-[13px] text-text-secondary font-medium">No habits scheduled for today.</p>
          </div>
        ) : (
          dueHabits.map((habit) => {
            const isCompleted = (habit.completedDates || []).includes(todayStr);
            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between gap-3.5 p-3.5 rounded-[var(--radius-row)] text-left transition-colors w-full ${
                  isCompleted
                    ? 'bg-surface-alt/60'
                    : 'bg-surface-alt hover:bg-neutral-200 dark:hover:bg-neutral-800/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-grow text-left">
                  {/* Interactive tactile checkbox */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleCheckboxClick(habit.id)}
                    className="focus:outline-none bg-transparent border-none p-0 cursor-pointer shrink-0"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-[#22C55E] text-white shadow-sm'
                        : 'border-2 border-neutral-300 dark:border-neutral-700 hover:border-[#22C55E]'
                    }`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <motion.path
                          d="M2.5 6.5L4.5 8.5L9.5 3.5"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          variants={checkmarkVariants}
                          initial="unchecked"
                          animate={isCompleted ? "checked" : "unchecked"}
                        />
                      </svg>
                    </div>
                  </motion.button>
                  
                  <div className="min-w-0 flex-1">
                    <p className={`text-[14px] font-semibold truncate transition-colors duration-150 ${
                      isCompleted ? 'line-through text-text-secondary font-normal' : 'text-text-primary'
                    }`}>
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-[12px] text-text-secondary truncate mt-0.5">{habit.description}</p>
                    )}
                  </div>
                </div>
                
                {!isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const isActive = activeFocusItem?.id === habit.id;
                      setActiveFocusItem(isActive ? null : { type: 'habit', id: habit.id, title: habit.name });
                    }}
                    className={`p-2 rounded-[10px] shrink-0 transition-colors cursor-pointer border-none ${
                      activeFocusItem?.id === habit.id
                        ? 'text-primary bg-surface-alt font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt bg-transparent'
                    }`}
                    title={activeFocusItem?.id === habit.id ? "Deactivate focus" : "Focus on this habit"}
                  >
                    <IconTarget size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
