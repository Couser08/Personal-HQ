import React from 'react';
import { IconCheck, IconWriting } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import type { Habit } from '../../../store/types';

interface TodayCheckinsCardProps {
  completedHabitsList: Habit[];
  todayStr: string;
  todayReflection?: any;
  setIsReflecting: (v: boolean) => void;
}

export const TodayCheckinsCard: React.FC<TodayCheckinsCardProps> = ({
  completedHabitsList,
  todayStr,
  todayReflection,
  setIsReflecting,
}) => {
  return (
    <Card padding="md" className="flex flex-col gap-3 text-left">
      <div className="flex justify-between items-center pb-2 border-b border-border-hairline">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Today's Check-ins
        </span>
        {!todayReflection && (
          <button
            onClick={() => setIsReflecting(true)}
            className="text-[11px] font-semibold text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 px-2.5 py-1 rounded-full border-none cursor-pointer flex items-center gap-1 transition-colors"
          >
            <IconWriting size={12} /> Reflect early
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5 pt-1 max-h-[220px] overflow-y-auto">
        {completedHabitsList.length === 0 ? (
          <p className="text-[12px] text-text-secondary text-center py-4">
            Completed habits will appear here with timestamps.
          </p>
        ) : (
          completedHabitsList.map((h) => {
            const detail = h.completionDetails?.[todayStr] || { time: 'Logged today' };
            return (
              <div
                key={h.id}
                className="flex items-center justify-between p-2.5 rounded-[var(--radius-row)] bg-surface-alt text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0">
                    <IconCheck size={12} strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] font-semibold text-text-primary truncate">
                    {h.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-text-secondary shrink-0">
                  {detail.time}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
