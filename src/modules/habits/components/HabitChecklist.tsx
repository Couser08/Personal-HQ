import { motion } from 'framer-motion';
import { IconTarget } from '@tabler/icons-react';
import { type Habit } from '../../../store/types';

interface HabitChecklistProps {
  dueHabits: Habit[];
  todayStr: string;
  overallProgress: number;
  completedTodayCount: number;
  activeFocusItem: any;
  setActiveFocusItem: (val: any) => void;
  handleToggleHabit: (id: string) => Promise<void>;
}

// Programmatic Web Audio Tone Synthesis to avoid loading assets
const playCheckSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // High-pitched click with rapid decay
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.log('Web Audio context blocked or not supported', e);
  }
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
      } catch (e) {}
    }

    void handleToggleHabit(id);
  };

  const checkmarkVariants = {
    checked: { pathLength: 1, opacity: 1, transition: { duration: 0.22, ease: 'easeOut' as any } },
    unchecked: { pathLength: 0, opacity: 0 }
  };

  return (
    <div className="lg:col-span-5 bg-surface border border-border rounded-[32px] p-6 shadow-sm flex flex-col gap-4 text-left select-none font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[9.5px] font-black uppercase tracking-widest text-text-muted">Due Today</span>
        {dueHabits.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1 bg-surface-alt rounded-full overflow-hidden border border-border/80">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-text-muted">{completedTodayCount}/{dueHabits.length}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 min-h-[120px]">
        {dueHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <span className="text-2xl">🎉</span>
            <p className="text-xs text-text-muted font-medium">No habits scheduled for today.</p>
          </div>
        ) : (
          dueHabits.map(habit => {
            const isCompleted = habit.completedDates.includes(todayStr);
            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl text-left transition-all w-full border ${
                  isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/25'
                    : 'bg-surface-alt/40 border-border/50 hover:border-border'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-grow text-left">
                  {/* Interactive tactile checkbox wrapper */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCheckboxClick(habit.id)}
                    className="focus:outline-none bg-transparent border-none p-0 cursor-pointer shrink-0"
                  >
                    <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-550/20'
                        : 'border-border hover:border-emerald-500'
                    }`}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
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
                    <p className={`text-xs font-semibold truncate transition-all duration-200 ${
                      isCompleted ? 'line-through text-text-muted font-medium' : 'text-text-primary'
                    }`}>{habit.name}</p>
                    {habit.description && (
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{habit.description}</p>
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
                    className={`p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer border-none bg-transparent ${
                      activeFocusItem?.id === habit.id
                        ? 'text-emerald-500 bg-emerald-500/10'
                        : 'text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10'
                    }`}
                    title={activeFocusItem?.id === habit.id ? "Deactivate focus" : "Focus on this habit"}
                  >
                    <IconTarget size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
