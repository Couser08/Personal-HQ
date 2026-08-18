import { Card } from '../../../components/ui/Card';

export function HabitCalendar({
  globalHeatmap,
  perfectDaysCount,
  currentPerfectStreak,
}: {
  globalHeatmap: any[];
  perfectDaysCount: number;
  currentPerfectStreak: number;
}) {
  return (
    <Card padding="lg" className="text-left select-none font-sans flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            Consistency Grid
          </span>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Green indicators mark days with perfect habit completion
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-alt" />
            <span>None</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/30" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <span>Perfect</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="w-full overflow-x-auto custom-scrollbar pb-2 min-w-0">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-max">
            {globalHeatmap.map((cell, idx) => (
              <div
                key={idx}
                title={`${cell.dateStr}: ${Math.round(cell.completionRatio * 100)}% complete`}
                className={`w-4 h-4 rounded-full transition-colors cursor-default ${
                  cell.isCompleted
                    ? 'bg-[#22C55E]'
                    : cell.completionRatio > 0
                      ? 'bg-[#22C55E]/30'
                      : cell.isToday
                        ? 'border-2 border-[#FF7A45] bg-transparent'
                        : 'bg-surface-alt'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-8 border-t lg:border-t-0 lg:border-l border-border-hairline pt-4 lg:pt-0 lg:pl-6 py-2 shrink-0">
          <div className="flex flex-col">
            <span className="text-3xl font-semibold text-text-primary leading-none">{perfectDaysCount}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mt-2">
              Perfect Days
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-semibold text-text-primary leading-none">{currentPerfectStreak}d</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mt-2">
              Current Streak
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
