import { useState, useEffect, useRef } from 'react';
import { 
  IconFlame, IconAward, IconPlayerPlay, IconPlayerPause, IconCheck, IconTrash, IconSettings 
} from '@tabler/icons-react';
import { type Habit } from '../../../store/types';
import { Card } from '../../../components/ui/Card';
import { getWeekGrid } from '../utils';
import { useAppStore } from '../../../store/useAppStore';

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

export function HabitCard({
  habit,
  todayStr,
  handleOpenAddModal,
  showConfirm,
  deleteHabit,
}: {
  habit: Habit;
  todayStr: string;
  activeFocusItem?: any;
  setActiveFocusItem?: (val: any) => void;
  handleOpenAddModal: (habit: Habit) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  deleteHabit: (id: string) => Promise<void>;
}) {
  const weekGrid = getWeekGrid(habit, todayStr);
  const isCompletedToday = (habit.completedDates || []).includes(todayStr);

  // Local chronometer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimerRunning(!timerRunning);
  };

  const handleFinishTimerSession = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimerRunning(false);
    playCheckSound();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }

    setTimerSeconds(0);

    const store = (window as any).useAppStore || null;
    if (store) {
      const state = store.getState();
      if (state && state.toggleHabitCompletion) {
        await state.toggleHabitCompletion(habit.id, todayStr);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Card padding="lg" className="flex flex-col gap-5 text-left font-sans select-none">
      {/* Top row: Habit Info & Action Buttons */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => {
              playCheckSound();
              const store = (window as any).useAppStore || null;
              if (store) store.getState().toggleHabitCompletion(habit.id, todayStr);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border-none shrink-0 ${
              isCompletedToday
                ? 'bg-[#22C55E] text-white shadow-sm'
                : 'bg-surface-alt text-text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            {isCompletedToday ? <IconCheck size={18} stroke={2.5} /> : <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />}
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-[16px] font-semibold truncate ${isCompletedToday ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                {habit.name}
              </h3>
              {habit.habitType && habit.habitType !== 'generic' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-alt text-text-secondary uppercase tracking-wider">
                  {habit.habitType}
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-[13px] text-text-secondary truncate mt-0.5">{habit.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleOpenAddModal(habit)}
            className="p-2 rounded-[10px] text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer border-none bg-transparent"
            title="Edit habit"
          >
            <IconSettings size={16} />
          </button>
          <button
            onClick={() => showConfirm('Delete Habit', `Are you sure you want to delete "${habit.name}"?`, () => deleteHabit(habit.id))}
            className="p-2 rounded-[10px] text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
            title="Delete habit"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      {/* Weekly Journey Row */}
      <div className="flex items-center justify-between gap-4 bg-surface-alt p-4 rounded-[var(--radius-row)]">
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Weekly Rhythm</span>
          <div className="flex items-center gap-2 mt-1">
            {weekGrid.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-text-secondary font-medium">{day.dayLabel.slice(0, 2)}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                  day.isCompleted
                    ? 'bg-[#22C55E] text-white'
                    : day.isToday
                      ? 'border-2 border-[#FF7A45] text-[#FF7A45] bg-transparent'
                      : 'bg-surface text-text-secondary'
                }`}>
                  {day.isCompleted ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Streak counts */}
        <div className="flex gap-4 border-l border-border-hairline pl-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[#FF7A45]">
              <IconFlame size={16} />
              <span className="text-[15px] font-semibold font-mono leading-none">{habit.streak || 0}d</span>
            </div>
            <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-text-secondary">
              <IconAward size={16} />
              <span className="text-[15px] font-semibold font-mono leading-none">{habit.bestStreak || 0}d</span>
            </div>
            <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Best</span>
          </div>
        </div>
      </div>

      {/* Focus Stopwatch/Chronometer (if habit type is non-generic) */}
      {!isCompletedToday && habit.habitType && habit.habitType !== 'generic' && (
        <div className="flex items-center justify-between p-3.5 bg-surface-alt rounded-[var(--radius-row)] text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Active Session</span>
            <span className={`text-[15px] font-semibold font-mono mt-0.5 ${timerRunning ? 'text-[#22C55E]' : 'text-text-primary'}`}>
              {formatTime(timerSeconds)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTimer}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 border-none ${
                timerRunning
                  ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                  : 'bg-text-primary text-background hover:opacity-90'
              }`}
            >
              {timerRunning ? (
                <>
                  <IconPlayerPause size={13} /> Pause
                </>
              ) : (
                <>
                  <IconPlayerPlay size={13} /> Start Session
                </>
              )}
            </button>
            {timerSeconds > 0 && (
              <button
                onClick={handleFinishTimerSession}
                className="px-3.5 py-1.5 bg-[#22C55E] hover:bg-emerald-600 text-white rounded-full text-[12px] font-semibold flex items-center gap-1 border-none cursor-pointer"
              >
                <IconCheck size={13} /> Log Complete
              </button>
            )}
          </div>
        </div>
      )}

      {/* 30 Days Consistency Heatmap */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Last 30 Days</span>
        <div className="flex flex-wrap gap-1.5 items-center select-none">
          {Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toISOString().split('T')[0];
            const isCompleted = (habit.completedDates || []).includes(dateStr);
            const isCurrentToday = dateStr === todayStr;

            return (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-full transition-colors ${
                  isCompleted 
                    ? 'bg-[#22C55E]' 
                    : isCurrentToday
                      ? 'border-2 border-[#FF7A45] bg-transparent'
                      : 'bg-surface-alt'
                }`}
                title={`${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}: ${isCompleted ? 'Completed' : 'Missed'}`}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
