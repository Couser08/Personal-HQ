import React from 'react';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';

interface PomodoroAnalyticsCardsProps {
  todaySessions: number;
  dailyGoal: number;
  setDailyGoal: (g: number) => void;
  isEditingGoal: boolean;
  setIsEditingGoal: (v: boolean) => void;
  tempGoal: number;
  setTempGoal: (v: number) => void;
  saveGoal: () => void;
  weeklyFocusData: { label: string; minutes: number; isToday: boolean }[];
  fontStyle: string;
  setFontStyle: (v: 'font-mono' | 'font-sans' | 'font-serif') => void;
  ringStyle: string;
  setRingStyle: (v: 'solid' | 'dashed' | 'glowing' | 'dotted' | 'double') => void;
}

export const PomodoroAnalyticsCards: React.FC<PomodoroAnalyticsCardsProps> = ({
  todaySessions,
  dailyGoal,
  isEditingGoal,
  setIsEditingGoal,
  tempGoal,
  setTempGoal,
  saveGoal,
  weeklyFocusData,
  fontStyle,
  setFontStyle,
  ringStyle,
  setRingStyle,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
      {/* Today's Target */}
      <Card padding="md" className="flex flex-col justify-between h-[260px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary">Daily Goal</h3>
              <p className="text-[12px] text-text-secondary mt-0.5">
                {Math.floor((todaySessions / dailyGoal) * 100)}% accomplished
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Target
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-semibold text-text-primary">
                {todaySessions}{' '}
                <span className="text-[13px] text-text-secondary font-normal">
                  / {dailyGoal} sessions
                </span>
              </span>
              <span className="text-[12px] font-semibold text-[#22C55E]">
                {todaySessions >= dailyGoal ? 'Goal Met! 🎉' : 'In progress'}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 bg-[#22C55E]"
                style={{ width: `${Math.min(100, (todaySessions / dailyGoal) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border-hairline pt-3 flex items-center justify-between">
          {isEditingGoal ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-[12px] text-text-secondary">Daily Goal:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={tempGoal}
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  className="w-14 bg-surface-alt rounded-[var(--radius-input)] px-2 py-1 text-[12px] outline-none text-text-primary text-center font-semibold border-none"
                />
                <button
                  onClick={saveGoal}
                  className="w-7 h-7 rounded-full bg-[#22C55E] text-white flex items-center justify-center cursor-pointer border-none"
                >
                  <IconCheck size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-[12px] text-text-secondary">
                Target: {dailyGoal} sessions
              </span>
              <button
                onClick={() => {
                  setTempGoal(dailyGoal);
                  setIsEditingGoal(true);
                }}
                className="px-3 py-1 rounded-full bg-surface-alt text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 border-none cursor-pointer"
              >
                <IconEdit size={12} /> Edit
              </button>
            </>
          )}
        </div>
      </Card>

      {/* Weekly Trend */}
      <Card padding="md" className="flex flex-col justify-between h-[260px]">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">Weekly Trend</h3>
          <p className="text-[12px] text-text-secondary mt-0.5">Focus minutes distribution</p>
        </div>

        <div className="h-32 flex flex-col justify-end select-none">
          <div className="flex items-end justify-between h-24 gap-2">
            {weeklyFocusData.map((day, idx) => {
              const maxMinutes = Math.max(...weeklyFocusData.map((d) => d.minutes), 60);
              const barHeightPct = Math.round((day.minutes / maxMinutes) * 100);
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                >
                  <div
                    className={`w-full rounded-t-lg transition-colors cursor-pointer ${
                      day.isToday
                        ? 'bg-[#FF7A45]'
                        : 'bg-surface-alt hover:bg-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                    style={{ height: `${Math.max(10, barHeightPct)}%` }}
                  />
                  <span className="text-[10px] font-medium text-text-secondary">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Timer Customization */}
      <Card padding="md" className="flex flex-col justify-between h-[260px]">
        <h3 className="text-[14px] font-semibold text-text-primary">Customization</h3>

        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Typography
            </span>
            <div className="flex gap-1.5 bg-surface-alt p-1 rounded-full">
              <button
                onClick={() => setFontStyle('font-mono')}
                className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${
                  fontStyle === 'font-mono'
                    ? 'bg-text-primary text-background font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                Mono
              </button>
              <button
                onClick={() => setFontStyle('font-sans')}
                className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${
                  fontStyle === 'font-sans'
                    ? 'bg-text-primary text-background font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontStyle('font-serif')}
                className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${
                  fontStyle === 'font-serif'
                    ? 'bg-text-primary text-background font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                Serif
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Ring Dial
            </span>
            <div className="flex gap-1.5 bg-surface-alt p-1 rounded-full">
              <button
                onClick={() => setRingStyle('solid')}
                className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${
                  ringStyle === 'solid'
                    ? 'bg-text-primary text-background font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => setRingStyle('dashed')}
                className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${
                  ringStyle === 'dashed'
                    ? 'bg-text-primary text-background font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                Dashed
              </button>
              <button
                onClick={() => setRingStyle('dotted')}
                className={`flex-1 py-1 text-[11px] rounded-full transition-all cursor-pointer border-none ${
                  ringStyle === 'dotted'
                    ? 'bg-text-primary text-background font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                Dotted
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-input)] bg-surface-alt px-3 py-1.5 text-[11px] text-text-secondary">
          Settings auto-persist across sessions.
        </div>
      </Card>
    </div>
  );
};
