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
    <div className="bg-surface border border-border rounded-3xl p-5 shadow-sm text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Consistency Grid</span>
          <p className="text-xs text-text-secondary mt-0.5">Green when all habits are complete for the day</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-surface-alt border border-border" />
            <span>None</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Perfect</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-shrink-0">
          {globalHeatmap.map((cell, idx) => (
            <div
              key={idx}
              title={`${cell.dateStr}: ${Math.round(cell.completionRatio * 100)}% complete`}
              className={`w-4 h-4 rounded-md transition-all cursor-default ${
                cell.isCompleted
                  ? 'bg-emerald-500'
                  : cell.completionRatio > 0
                    ? 'bg-emerald-500/30'
                    : cell.isToday
                      ? 'border-2 border-primary bg-transparent'
                      : 'bg-surface-alt'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-6 border-l border-border pl-5">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-text-primary">{perfectDaysCount}</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-0.5">Perfect Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-text-primary">{currentPerfectStreak}d</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-0.5">Current Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
