import type { Countdown } from '../../../../store/types';
import {
  ACCENT,
  COLOR_HEX,
  getTimeLeft,
  pad,
} from '../../utils/countdownHelpers';
import {
  FlipDigit,
  BigProgressRing,
  CompletedBadge,
} from './SharedTemplateComponents';

// 7. DARK STYLE
export const TemplateDark = ({
  c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  const a = ACCENT[c.color || 'rose'] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hours' },
    { v: t.minutes, l: 'Minutes' },
    { v: t.seconds, l: 'Seconds' },
  ];
  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      {units.map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-2">
          <div className="flex flex-col items-center shrink-0">
            <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-3xl font-bold font-mono tabular-nums text-white min-w-[56px] text-center">
              <FlipDigit value={pad(v)} />
            </div>
            <span className="text-xs text-[#666] mt-1">{l}</span>
          </div>
          {i < 3 && <span className={`text-2xl font-bold ${a.text} mb-4 mx-0.5`}>:</span>}
        </div>
      ))}
    </div>
  );
};

// 8. COMPACT CARD
export const TemplateCompact = ({
  c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  const a = ACCENT[c.color || 'rose'] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex items-center gap-3 mt-4 flex-wrap">
      <span className={`text-2xl font-bold font-mono tabular-nums ${a.text}`}>
        {pad(t.days)}
        <span className="text-xs font-normal text-text-muted ml-0.5 mr-1">d</span>
        {pad(t.hours)}
        <span className="text-xs font-normal text-text-muted ml-0.5 mr-1">h</span>
        {pad(t.minutes)}
        <span className="text-xs font-normal text-text-muted ml-0.5 mr-1">m</span>
        <FlipDigit value={pad(t.seconds)} />
        <span className="text-xs font-normal text-text-muted ml-0.5">s</span>
      </span>
    </div>
  );
};

// 9. FLIP STYLE
export const TemplateFlip = ({
  c: _c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  if (t.isPast) return <CompletedBadge />;
  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hours' },
    { v: t.minutes, l: 'Minutes' },
    { v: t.seconds, l: 'Seconds' },
  ];
  return (
    <div className="flex items-end gap-3 mt-4 flex-wrap">
      {units.map(({ v, l }) => {
        const str = pad(v);
        return (
          <div key={l} className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex gap-1">
              {str.split('').map((digit, di) => (
                <div
                  key={di}
                  className="relative w-9 h-12 sm:w-10 sm:h-14 bg-[#1a1a1a] rounded-md overflow-hidden shadow-lg border border-[#333] flex items-center justify-center"
                >
                  <div className="absolute inset-0 bottom-1/2 bg-[#222] flex items-end justify-center pb-0.5 border-b border-[#111]">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-white leading-none">
                      <FlipDigit value={digit} />
                    </span>
                  </div>
                  <div className="absolute inset-0 top-1/2 bg-[#1a1a1a] flex items-start justify-center pt-0.5">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-white leading-none">
                      {digit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-text-muted">{l}</span>
          </div>
        );
      })}
    </div>
  );
};

// 10. PROGRESS CIRCLE
export const TemplateProgress = ({
  c,
  t,
  createdAt,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
  createdAt: string;
}) => {
  const totalDuration = Date.parse(c.targetDate) - Date.parse(createdAt);
  const elapsed = Date.now() - Date.parse(createdAt);
  const pct = Math.max(0, Math.min(1, elapsed / totalDuration));
  const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
      <BigProgressRing pct={pct} color={c.color || 'rose'}>
        <span className="text-2xl font-bold">{Math.round(pct * 100)}%</span>
        <span className="text-[10px] text-text-muted">Completed</span>
      </BigProgressRing>
      <div className="flex flex-col gap-2 flex-1 w-full">
        <p className="text-sm text-text-secondary text-center sm:text-left">
          Only <span className="font-bold text-text-primary">{t.days} days</span> left!
        </p>
        <div className="h-2 rounded-full bg-surface-alt overflow-hidden w-full">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct * 100}%`, background: COLOR_HEX[c.color || 'rose'] }}
          />
        </div>
        <p className="text-xs text-text-muted text-center sm:text-left">
          {daysElapsed} / {totalDays} days
        </p>
      </div>
    </div>
  );
};

// 11. VERTICAL STYLE
export const TemplateVertical = ({
  c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  const a = ACCENT[c.color || 'rose'] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hours' },
    { v: t.minutes, l: 'Minutes' },
    { v: t.seconds, l: 'Seconds' },
  ];
  return (
    <div className="flex gap-6 mt-4">
      <div className="flex flex-col gap-2">
        {units.map(({ v, l }) => (
          <div key={l} className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${a.text}`}>
              <FlipDigit value={pad(v)} />
            </span>
            <span className="text-sm text-text-muted w-16">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 12. SPLIT LAYOUT
export const TemplateSplit = ({
  c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  if (t.isPast) return <CompletedBadge />;
  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hours' },
    { v: t.minutes, l: 'Minutes' },
    { v: t.seconds, l: 'Seconds' },
  ];
  return (
    <div className="flex items-center gap-3 mt-4">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: COLOR_HEX[c.color || 'rose'] }}
      >
        {c.emoji}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1 flex-wrap">
          {units.map(({ v, l }, i) => (
            <div key={l} className="flex items-baseline gap-0.5">
              {i > 0 && <span className="text-text-muted mx-1">:</span>}
              <span className="text-2xl font-bold font-mono tabular-nums text-text-primary">
                <FlipDigit value={pad(v)} />
              </span>
              <span className="text-xs text-text-muted">{l.slice(0, 1).toLowerCase()}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-1">{new Date(c.targetDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
};
