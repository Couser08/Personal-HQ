import { useState, useEffect, useRef } from 'react';
import { 
  IconFlame, IconTarget, IconSettings, IconTrash, IconAward, IconPlayerPlay, IconPlayerPause, IconCheck 
} from '@tabler/icons-react';
import { type Habit } from '../../../store/types';
import { getWeekGrid } from '../utils';

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
  } catch (e) {}
};

export function HabitCard({
  habit,
  todayStr,
  activeFocusItem,
  setActiveFocusItem,
  handleOpenAddModal,
  showConfirm,
  deleteHabit,
}: {
  habit: Habit;
  todayStr: string;
  activeFocusItem: any;
  setActiveFocusItem: (val: any) => void;
  handleOpenAddModal: (habit: Habit) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  deleteHabit: (id: string) => Promise<void>;
}) {
  const weekGrid = getWeekGrid(habit, todayStr);
  const isCompletedToday = habit.completedDates.includes(todayStr);

  // Local stopwatch/chronometer state for active focus session
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
      } catch (err) {}
    }

    const durationMin = Math.max(1, Math.round(timerSeconds / 60));
    setTimerSeconds(0);

    const store = (window as any).useAppStore || null;
    if (store) {
      const state = store.getState();
      if (state && state.toggleHabitCompletion) {
        await state.toggleHabitCompletion(habit.id, todayStr);
        const timeNow = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
        const updatedDetails = {
          ...(habit.completionDetails || {}),
          [todayStr]: {
            time: timeNow,
            value: durationMin,
            unit: 'min'
          }
        };
        await state.updateHabit(habit.id, { completionDetails: updatedDetails });
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Category Icon helper
  const getCategoryEmoji = (type?: string) => {
    switch (type) {
      case 'coding': return '💻';
      case 'reading': return '📖';
      case 'meditation': return '🧘';
      case 'workout': return '🏋️';
      default: return '🎯';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-[30px] p-5 shadow-sm flex flex-col gap-4 group text-left transition-all hover:shadow-md select-none font-sans">
      
      {/* Title & Info Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-grow text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm shrink-0">{getCategoryEmoji(habit.habitType)}</span>
            <h3 className="text-[14.5px] font-black text-text-primary truncate" title={habit.name}>
              {habit.name}
            </h3>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-border text-text-muted uppercase tracking-wider shrink-0">
              {habit.frequencyType === 'daily' ? 'Daily' :
               habit.frequencyType === 'weekly_count' ? `${habit.frequencyCount}×/wk` : 'Custom'}
            </span>
            {habit.targetTime && (
              <span className="text-[9px] font-extrabold text-text-muted px-2 py-0.5 rounded-full bg-surface-alt border border-border shrink-0">
                ⏰ {habit.targetTime}
              </span>
            )}
          </div>
          
          {habit.description && (
            <p className="text-xs text-text-secondary mt-1 leading-normal truncate">{habit.description}</p>
          )}

          {habit.whyText && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic font-semibold mt-2.5 pl-3 border-l-2 border-primary/30 leading-relaxed">
              " {habit.whyText} "
            </p>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          {!isCompletedToday && (
            <button
              onClick={() => {
                const isActive = activeFocusItem?.id === habit.id;
                setActiveFocusItem(isActive ? null : { type: 'habit', id: habit.id, title: habit.name });
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 border-none ${
                activeFocusItem?.id === habit.id
                  ? 'bg-emerald-500/10 text-emerald-650'
                  : 'bg-surface-alt hover:bg-surface-hover text-text-secondary hover:text-emerald-500'
              }`}
              title={activeFocusItem?.id === habit.id ? "Deactivate focus" : "Focus on this habit"}
            >
              <IconTarget size={14} />
            </button>
          )}
          <button
            onClick={() => handleOpenAddModal(habit)}
            className="p-2 rounded-xl bg-surface-alt hover:bg-surface-hover border border-border/60 text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm active:scale-95 border-none"
            title="Edit"
          >
            <IconSettings size={14} />
          </button>
          <button
            onClick={() => showConfirm('Delete Habit', `Delete "${habit.name}"?`, () => deleteHabit(habit.id))}
            className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500/70 hover:text-red-500 transition-all cursor-pointer shadow-sm active:scale-95 border-none"
            title="Delete"
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {/* Week Grid Momentum Metrics */}
      <div className="flex items-center justify-between gap-4 bg-surface-alt/40 rounded-[22px] p-4.5 border border-border/60">
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Weekly Journey</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {weekGrid.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-text-muted font-bold">{day.dayLabel.slice(0, 2)}</span>
                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-extrabold transition-all border ${
                  day.isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                    : day.isToday
                      ? 'border-2 border-emerald-500 bg-transparent text-emerald-500 font-black animate-pulse'
                      : 'bg-surface border-border text-text-muted'
                }`}>
                  {day.isCompleted ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Streak counts */}
        <div className="flex gap-4 border-l border-border pl-4.5">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5 text-orange-500">
              <IconFlame size={16} />
              <span className="text-base font-black font-mono leading-none">{habit.streak}d</span>
            </div>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5 text-text-secondary">
              <IconAward size={16} />
              <span className="text-base font-black font-mono leading-none">{habit.bestStreak}d</span>
            </div>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Best</span>
          </div>
        </div>
      </div>

      {/* Inline Focus Session Chronometer / Stopwatch */}
      {!isCompletedToday && habit.habitType !== 'generic' && (
        <div className="flex items-center justify-between p-3.5 bg-surface-alt/60 rounded-2xl border border-border/60 text-left">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Focus Chronometer</span>
            <span className={`text-base font-black font-mono mt-0.5 ${timerRunning ? 'text-emerald-500' : 'text-text-primary'}`}>
              {formatTime(timerSeconds)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTimer}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 border-none ${
                timerRunning
                  ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
              }`}
            >
              {timerRunning ? (
                <>
                  <IconPlayerPause size={12} /> Pause
                </>
              ) : (
                <>
                  <IconPlayerPlay size={12} /> Start Session
                </>
              )}
            </button>
            {timerSeconds > 0 && (
              <button
                onClick={handleFinishTimerSession}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm border-none cursor-pointer"
              >
                <IconCheck size={12} /> Complete
              </button>
            )}
          </div>
        </div>
      )}

      {/* GitHub-style Contribution Heatmap */}
      <div className="flex flex-col gap-1.5 bg-surface-alt/30 rounded-[22px] p-4.5 border border-border/30">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Last 30 Days Consistency</span>
        <div className="flex flex-wrap gap-1.5 items-center mt-1 select-none">
          {Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toISOString().split('T')[0];
            const isCompleted = habit.completedDates.includes(dateStr);
            const isCurrentToday = dateStr === todayStr;

            return (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 hover:brightness-110 shadow-sm' 
                    : isCurrentToday
                      ? 'border-2 border-emerald-500 bg-transparent animate-pulse'
                      : 'bg-surface-alt border border-border/60 hover:bg-surface-hover'
                }`}
                title={`${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}: ${isCompleted ? 'Completed' : 'Missed'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
