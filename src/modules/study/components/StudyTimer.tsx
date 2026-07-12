interface StudyTimerProps {
  timerRunning: boolean;
  setTimerRunning: (val: boolean) => void;
  timerDuration: number;
  timerSecondsLeft: number;
  setTimerSecondsLeft: (val: number | ((prev: number) => number)) => void;
  timerPreset: number;
  startTimer: (mins: number) => void;
}

export function StudyTimer({
  timerRunning,
  setTimerRunning,
  timerDuration,
  timerSecondsLeft,
  setTimerSecondsLeft,
  timerPreset,
  startTimer,
}: StudyTimerProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 text-center space-y-6">
      <div>
        <h3 className="font-bold text-base text-text-primary">Focus Session</h3>
        <p className="text-xs text-text-secondary mt-1">Clock study time directly into analytics</p>
      </div>

      {/* Visual SVG Timer Dial */}
      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="72" cy="72" r="64" stroke="var(--border-border-alt)" strokeWidth="8" fill="transparent" />
          <circle
            cx="72"
            cy="72"
            r="64"
            stroke="#f43f5e"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={402}
            strokeDashoffset={402 - 402 * (timerSecondsLeft / (timerDuration || 1))}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-text-primary">
            {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex justify-center gap-2">
        {[5, 10, 20, 25].map((m) => (
          <button
            key={m}
            onClick={() => startTimer(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
              timerPreset === m
                ? 'bg-primary text-white border-primary'
                : 'border-border bg-surface hover:bg-surface-hover text-text-secondary'
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {timerRunning ? (
          <button
            onClick={() => setTimerRunning(false)}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors border-none cursor-pointer"
          >
            Pause Focus
          </button>
        ) : (
          <button
            onClick={() => setTimerRunning(true)}
            className="flex-1 py-2.5 bg-primary hover:bg-primary-muted text-white font-bold text-xs rounded-xl transition-colors border-none cursor-pointer"
          >
            Start Focus
          </button>
        )}
        <button
          onClick={() => {
            setTimerRunning(false);
            setTimerSecondsLeft(timerDuration);
          }}
          className="px-4 py-2.5 border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors bg-transparent cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
