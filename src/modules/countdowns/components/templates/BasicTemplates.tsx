import type { Countdown } from '../../../../store/types';
import {
  ACCENT,
  COLOR_HEX,
  getTimeLeft,
  pad,
} from '../../utils/countdownHelpers';
import { FlipDigit, ProgressRing, CompletedBadge } from './SharedTemplateComponents';

// 1. DEFAULT (Horizontal)
export const TemplateDefault = ({
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
    <div className="flex items-center gap-1 mt-4 flex-wrap">
      {units.map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className={`${a.bg} rounded-lg px-3 py-2 text-3xl font-bold font-mono tabular-nums ${a.text} min-w-[56px] text-center`}
            >
              <FlipDigit value={pad(v)} />
            </div>
            <span className="text-xs text-text-muted mt-1">{l}</span>
          </div>
          {i < 3 && <span className={`text-2xl font-bold ${a.text} mb-4 mx-0.5`}>:</span>}
        </div>
      ))}
    </div>
  );
};

// 2. MINIMAL
export const TemplateMinimal = ({
  c: _c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex items-baseline gap-2 sm:gap-3 mt-4 text-text-primary flex-wrap">
      {[
        { v: t.days, l: 'd' },
        { v: t.hours, l: 'h' },
        { v: t.minutes, l: 'm' },
        { v: t.seconds, l: 's' },
      ].map(({ v, l }, i) => (
        <div key={l} className="flex items-baseline gap-0.5 shrink-0">
          {i > 0 && <span className="text-text-muted text-2xl mx-1">:</span>}
          <span className="text-4xl font-bold font-mono tabular-nums">
            <FlipDigit value={pad(v)} />
          </span>
          <span className="text-sm text-text-muted">{l}</span>
        </div>
      ))}
    </div>
  );
};

// 3. GRADIENT STYLE
export const TemplateGradient = ({
  c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  const hex = COLOR_HEX[c.color || 'rose'] ?? '#f43f5e';
  if (t.isPast) return <CompletedBadge />;
  const units = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hours' },
    { v: t.minutes, l: 'Minutes' },
    { v: t.seconds, l: 'Seconds' },
  ];
  return (
    <div className="flex gap-2 mt-4 flex-wrap">
      {units.map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-2">
          <div
            className="flex flex-col items-center rounded-xl px-3 py-3 min-w-[56px] text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${hex}dd, ${hex}88)`,
              boxShadow: `0 4px 20px ${hex}55`,
            }}
          >
            <span className="text-3xl font-bold font-mono tabular-nums">
              <FlipDigit value={pad(v)} />
            </span>
            <span className="text-xs opacity-90 mt-1">{l}</span>
          </div>
          {i < 3 && <span className="text-2xl font-bold text-text-muted mb-4">:</span>}
        </div>
      ))}
    </div>
  );
};

// 4. ROUNDED CIRCLE
export const TemplateCircle = ({
  c,
  t,
}: {
  c: Countdown;
  t: ReturnType<typeof getTimeLeft>;
}) => {
  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex gap-3 mt-4 flex-wrap">
      <ProgressRing value={t.days} max={365} color={c.color || 'rose'} label="Days" />
      <ProgressRing value={t.hours} max={24} color={c.color || 'rose'} label="Hours" />
      <ProgressRing value={t.minutes} max={60} color={c.color || 'rose'} label="Minutes" />
      <ProgressRing value={t.seconds} max={60} color={c.color || 'rose'} label="Seconds" />
    </div>
  );
};

// 5. EVENT COUNTDOWN
export const TemplateEvent = ({
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
    <div className="mt-4 flex flex-col h-full justify-between">
      <div className="flex items-center gap-1 flex-wrap">
        {units.map(({ v, l }, i) => (
          <div key={l} className="flex items-center gap-1">
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`${a.bg} border ${a.border} rounded-lg px-3 py-2 text-2xl font-bold font-mono tabular-nums ${a.text} min-w-[52px] text-center`}
              >
                <FlipDigit value={pad(v)} />
              </div>
              <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
                {l}
              </span>
            </div>
            {i < 3 && <span className={`text-xl font-bold ${a.text} mb-4 mx-0.5`}>:</span>}
          </div>
        ))}
      </div>
      <div
        className={`mt-4 -mx-6 px-6 py-2 ${a.bg} border-t ${a.border} flex items-center gap-2 rounded-b-xl`}
      >
        <span className="text-lg">🎁</span>
        <span className={`text-xs font-semibold ${a.text}`}>Something amazing is coming!</span>
      </div>
    </div>
  );
};

// 6. SALE COUNTDOWN
export const TemplateSale = ({
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
    <div className="mt-3 flex flex-col h-full justify-between">
      <div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${a.bg} ${a.text} text-xs font-bold mb-3`}
        >
          🔥 Limited Time Offer
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {units.map(({ v, l }, i) => (
            <div key={l} className="flex items-center gap-1">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-3xl font-bold font-mono tabular-nums text-text-primary">
                  <FlipDigit value={pad(v)} />
                </span>
                <span className="text-xs text-text-muted">{l}</span>
              </div>
              {i < 3 && <span className="text-2xl font-bold text-text-muted mb-4 mx-1">:</span>}
            </div>
          ))}
        </div>
      </div>
      <button
        className={`mt-4 w-full py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 mt-auto`}
        style={{
          background: `linear-gradient(90deg, ${COLOR_HEX[c.color || 'rose']}cc, ${
            COLOR_HEX[c.color || 'rose']
          }ff)`,
        }}
        onClick={(e) => e.preventDefault()}
      >
        Shop Now
      </button>
    </div>
  );
};
