import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconHourglassEmpty } from '@tabler/icons-react';
import { useAppStore, type Countdown, type CountdownTemplate } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const EMOJIS = ['🎯', '📅', '🎓', '💼', '✈️', '🎮', '📝', '🏆', '💰', '🔥', '⏰', '🎉', '📚', '💻', '🏋️', '🎬', '🚀', '❤️', '🌙', '⭐'];
const COLORS = ['rose', 'amber', 'blue', 'green', 'purple'] as const;

const ACCENT: Record<string, { bg: string; text: string; ring: string; border: string; solidBg: string }> = {
  rose:   { bg: 'bg-rose-500/20',   text: 'text-rose-400',   ring: 'ring-rose-500',   border: 'border-rose-500',   solidBg: 'bg-rose-500' },
  amber:  { bg: 'bg-amber-500/20',  text: 'text-amber-400',  ring: 'ring-amber-500',  border: 'border-amber-500',  solidBg: 'bg-amber-500' },
  blue:   { bg: 'bg-blue-500/20',   text: 'text-blue-400',   ring: 'ring-blue-500',   border: 'border-blue-500',   solidBg: 'bg-blue-500' },
  green:  { bg: 'bg-green-500/20',  text: 'text-green-400',  ring: 'ring-green-500',  border: 'border-green-500',  solidBg: 'bg-green-500' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', ring: 'ring-purple-500', border: 'border-purple-500', solidBg: 'bg-purple-500' },
};
const COLOR_HEX: Record<string, string> = {
  rose: '#f43f5e', amber: '#f59e0b', blue: '#3b82f6', green: '#22c55e', purple: '#a855f7',
};

// ──────────────────────────────────────────────
// TIME HELPERS
// ──────────────────────────────────────────────
function getTimeLeft(dateStr: string) {
  const total = Date.parse(dateStr) - Date.now();
  if (total <= 0) return { isPast: true, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    isPast: false,
    total,
    days:    Math.floor(total / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
function pad(n: number) { return n.toString().padStart(2, '0'); }

// ──────────────────────────────────────────────
// SHARED HOOK — live timer
// ──────────────────────────────────────────────
function useCountdown(targetDate: string) {
  const [t, setT] = useState(() => getTimeLeft(targetDate));
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

// ──────────────────────────────────────────────
// FLIP DIGIT
// ──────────────────────────────────────────────
const FlipDigit = ({ value }: { value: string }) => (
  <AnimatePresence mode="popLayout">
    <motion.span
      key={value}
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: -90, opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'inline-block', transformOrigin: 'center' }}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

// ──────────────────────────────────────────────
// SVG PROGRESS RING
// ──────────────────────────────────────────────
const ProgressRing = ({ value, max, color, label, size = 80, thick = 6 }: {
  value: number; max: number; color: string; label: string; size?: number; thick?: number;
}) => {
  const r = (size - thick * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={thick} className="text-border" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={COLOR_HEX[color] ?? '#f43f5e'}
          strokeWidth={thick} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <span className="text-2xl font-bold tabular-nums font-mono" style={{ marginTop: -size * 0.75, zIndex: 1 }}>{pad(value)}</span>
      <span className="text-xs text-text-muted font-medium">{label}</span>
    </div>
  );
};

// ──────────────────────────────────────────────
// PROGRESS CIRCLE (single big ring)
// ──────────────────────────────────────────────
const BigProgressRing = ({ pct, color, children }: { pct: number; color: string; children: React.ReactNode }) => {
  const size = 120, thick = 10, r = (size - thick * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={thick} className="text-border" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={COLOR_HEX[color] ?? '#f43f5e'}
          strokeWidth={thick} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

// ──────────────────────────────────────────────
// TEMPLATE COMPONENTS
// ──────────────────────────────────────────────

// 1. DEFAULT (Horizontal)
const TemplateDefault = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  const a = ACCENT[c.color] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
  return (
    <div className="flex items-center gap-1 mt-4 flex-wrap">
      {units.map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div className={`${a.bg} rounded-lg px-3 py-2 text-3xl font-bold font-mono tabular-nums ${a.text} min-w-[56px] text-center`}>
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
const TemplateMinimal = ({ c: _c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex items-baseline gap-2 sm:gap-3 mt-4 text-text-primary flex-wrap">
      {[{ v: t.days, l: 'd' }, { v: t.hours, l: 'h' }, { v: t.minutes, l: 'm' }, { v: t.seconds, l: 's' }].map(({ v, l }, i) => (
        <div key={l} className="flex items-baseline gap-0.5 shrink-0">
          {i > 0 && <span className="text-text-muted text-2xl mx-1">:</span>}
          <span className="text-4xl font-bold font-mono tabular-nums"><FlipDigit value={pad(v)} /></span>
          <span className="text-sm text-text-muted">{l}</span>
        </div>
      ))}
    </div>
  );
};

// 3. GRADIENT STYLE
const TemplateGradient = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  const hex = COLOR_HEX[c.color] ?? '#f43f5e';
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
  return (
    <div className="flex gap-2 mt-4 flex-wrap">
      {units.map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-2">
          <div
            className="flex flex-col items-center rounded-xl px-3 py-3 min-w-[56px] text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${hex}dd, ${hex}88)`, boxShadow: `0 4px 20px ${hex}55` }}
          >
            <span className="text-3xl font-bold font-mono tabular-nums"><FlipDigit value={pad(v)} /></span>
            <span className="text-xs opacity-90 mt-1">{l}</span>
          </div>
          {i < 3 && <span className="text-2xl font-bold text-text-muted mb-4">:</span>}
        </div>
      ))}
    </div>
  );
};

// 4. ROUNDED CIRCLE
const TemplateCircle = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex gap-3 mt-4 flex-wrap">
      <ProgressRing value={t.days}    max={365} color={c.color} label="Days"    />
      <ProgressRing value={t.hours}   max={24}  color={c.color} label="Hours"   />
      <ProgressRing value={t.minutes} max={60}  color={c.color} label="Minutes" />
      <ProgressRing value={t.seconds} max={60}  color={c.color} label="Seconds" />
    </div>
  );
};

// 5. EVENT COUNTDOWN
const TemplateEvent = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  const a = ACCENT[c.color] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
  return (
    <div className="mt-4 flex flex-col h-full justify-between">
      <div className="flex items-center gap-1 flex-wrap">
        {units.map(({ v, l }, i) => (
          <div key={l} className="flex items-center gap-1">
            <div className="flex flex-col items-center shrink-0">
              <div className={`${a.bg} border ${a.border} rounded-lg px-3 py-2 text-2xl font-bold font-mono tabular-nums ${a.text} min-w-[52px] text-center`}>
                <FlipDigit value={pad(v)} />
              </div>
              <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">{l}</span>
            </div>
            {i < 3 && <span className={`text-xl font-bold ${a.text} mb-4 mx-0.5`}>:</span>}
          </div>
        ))}
      </div>
      <div className={`mt-4 -mx-6 px-6 py-2 ${a.bg} border-t ${a.border} flex items-center gap-2 rounded-b-xl`}>
        <span className="text-lg">🎁</span>
        <span className={`text-xs font-semibold ${a.text}`}>Something amazing is coming!</span>
      </div>
    </div>
  );
};

// 6. SALE COUNTDOWN
const TemplateSale = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  const a = ACCENT[c.color] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
  return (
    <div className="mt-3 flex flex-col h-full justify-between">
      <div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${a.bg} ${a.text} text-xs font-bold mb-3`}>
          🔥 Limited Time Offer
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {units.map(({ v, l }, i) => (
            <div key={l} className="flex items-center gap-1">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-3xl font-bold font-mono tabular-nums text-text-primary"><FlipDigit value={pad(v)} /></span>
                <span className="text-xs text-text-muted">{l}</span>
              </div>
              {i < 3 && <span className="text-2xl font-bold text-text-muted mb-4 mx-1">:</span>}
            </div>
          ))}
        </div>
      </div>
      <button
        className={`mt-4 w-full py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 mt-auto`}
        style={{ background: `linear-gradient(90deg, ${COLOR_HEX[c.color]}cc, ${COLOR_HEX[c.color]}ff)` }}
        onClick={(e) => e.preventDefault()}
      >
        Shop Now
      </button>
    </div>
  );
};

// 7. DARK STYLE (always dark regardless of theme)
const TemplateDark = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  const a = ACCENT[c.color] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
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
const TemplateCompact = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  const a = ACCENT[c.color] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex items-center gap-3 mt-4 flex-wrap">
      <span className={`text-2xl font-bold font-mono tabular-nums ${a.text}`}>
        {pad(t.days)}<span className="text-xs font-normal text-text-muted ml-0.5 mr-1">d</span>
        {pad(t.hours)}<span className="text-xs font-normal text-text-muted ml-0.5 mr-1">h</span>
        {pad(t.minutes)}<span className="text-xs font-normal text-text-muted ml-0.5 mr-1">m</span>
        <FlipDigit value={pad(t.seconds)} /><span className="text-xs font-normal text-text-muted ml-0.5">s</span>
      </span>
    </div>
  );
};

// 9. FLIP STYLE (mechanical clock look)
const TemplateFlip = ({ c: _c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
  return (
    <div className="flex items-end gap-3 mt-4 flex-wrap">
      {units.map(({ v, l }) => {
        const str = pad(v);
        return (
          <div key={l} className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex gap-1">
              {str.split('').map((digit, di) => (
                <div key={di} className="relative w-9 h-12 sm:w-10 sm:h-14 bg-[#1a1a1a] rounded-md overflow-hidden shadow-lg border border-[#333] flex items-center justify-center">
                  {/* top half */}
                  <div className="absolute inset-0 bottom-1/2 bg-[#222] flex items-end justify-center pb-0.5 border-b border-[#111]">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-white leading-none"><FlipDigit value={digit} /></span>
                  </div>
                  {/* bottom half */}
                  <div className="absolute inset-0 top-1/2 bg-[#1a1a1a] flex items-start justify-center pt-0.5">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-white leading-none">{digit}</span>
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
const TemplateProgress = ({ c, t, createdAt }: { c: Countdown; t: ReturnType<typeof getTimeLeft>; createdAt: string }) => {
  const totalDuration = Date.parse(c.targetDate) - Date.parse(createdAt);
  const elapsed = Date.now() - Date.parse(createdAt);
  const pct = Math.max(0, Math.min(1, elapsed / totalDuration));
  const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

  if (t.isPast) return <CompletedBadge />;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
      <BigProgressRing pct={pct} color={c.color}>
        <span className="text-2xl font-bold">{Math.round(pct * 100)}%</span>
        <span className="text-[10px] text-text-muted">Completed</span>
      </BigProgressRing>
      <div className="flex flex-col gap-2 flex-1 w-full">
        <p className="text-sm text-text-secondary text-center sm:text-left">Only <span className="font-bold text-text-primary">{t.days} days</span> left!</p>
        <div className="h-2 rounded-full bg-surface-alt overflow-hidden w-full">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct * 100}%`, background: COLOR_HEX[c.color] }}
          />
        </div>
        <p className="text-xs text-text-muted text-center sm:text-left">{daysElapsed} / {totalDays} days</p>
      </div>
    </div>
  );
};

// 11. VERTICAL STYLE
const TemplateVertical = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  const a = ACCENT[c.color] ?? ACCENT.rose;
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
  return (
    <div className="flex gap-6 mt-4">
      <div className="flex flex-col gap-2">
        {units.map(({ v, l }) => (
          <div key={l} className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${a.text}`}><FlipDigit value={pad(v)} /></span>
            <span className="text-sm text-text-muted w-16">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 12. SPLIT LAYOUT
const TemplateSplit = ({ c, t }: { c: Countdown; t: ReturnType<typeof getTimeLeft> }) => {
  if (t.isPast) return <CompletedBadge />;
  const units = [{ v: t.days, l: 'Days' }, { v: t.hours, l: 'Hours' }, { v: t.minutes, l: 'Minutes' }, { v: t.seconds, l: 'Seconds' }];
  return (
    <div className="flex items-center gap-3 mt-4">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: COLOR_HEX[c.color] }}
      >
        {c.emoji}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1 flex-wrap">
          {units.map(({ v, l }, i) => (
            <div key={l} className="flex items-baseline gap-0.5">
              {i > 0 && <span className="text-text-muted mx-1">:</span>}
              <span className="text-2xl font-bold font-mono tabular-nums text-text-primary"><FlipDigit value={pad(v)} /></span>
              <span className="text-xs text-text-muted">{l.slice(0, 1).toLowerCase()}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-1">{new Date(c.targetDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// Completed badge shared
const CompletedBadge = () => (
  <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-lg">
    <span>🎉</span> Completed!
  </div>
);

// ──────────────────────────────────────────────
// CARD WRAPPER
// ──────────────────────────────────────────────
const DARK_WRAPPER_TEMPLATES = new Set(['dark']);

const CountdownCard = ({ c, template, onDelete }: { c: Countdown; template: CountdownTemplate; onDelete: () => void }) => {
  const t = useCountdown(c.targetDate);
  const isDarkTemplate = DARK_WRAPPER_TEMPLATES.has(template);

  const wrapperClass = isDarkTemplate
    ? 'bg-[#111] border border-[#222] text-white rounded-xl p-6 flex flex-col relative group overflow-hidden'
    : template === 'vertical'
    ? 'bg-surface border border-border rounded-xl p-6 flex flex-col relative group overflow-hidden border-l-4'
    : 'bg-surface border border-border rounded-xl p-6 flex flex-col relative group overflow-hidden';

  const verticalBorderStyle = template === 'vertical' ? { borderLeftColor: COLOR_HEX[c.color] } : {};
  const isPast = t.isPast;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isPast ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`${wrapperClass} ${isPast ? 'grayscale' : ''}`}
      style={verticalBorderStyle}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          {template !== 'split' && template !== 'compact' && (
            <span className="text-2xl mb-2 block">{c.emoji}</span>
          )}
          <h3 className={`text-lg font-semibold ${isDarkTemplate ? 'text-white' : 'text-text-primary'}`}>{c.label}</h3>
          <p className={`text-xs mt-0.5 ${isDarkTemplate ? 'text-[#666]' : 'text-text-muted'}`}>
            {new Date(c.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Template body */}
      {template === 'default'   && <TemplateDefault   c={c} t={t} />}
      {template === 'minimal'   && <TemplateMinimal   c={c} t={t} />}
      {template === 'gradient'  && <TemplateGradient  c={c} t={t} />}
      {template === 'circle'    && <TemplateCircle    c={c} t={t} />}
      {template === 'event'     && <TemplateEvent     c={c} t={t} />}
      {template === 'sale'      && <TemplateSale      c={c} t={t} />}
      {template === 'dark'      && <TemplateDark      c={c} t={t} />}
      {template === 'compact'   && <TemplateCompact   c={c} t={t} />}
      {template === 'flip'      && <TemplateFlip      c={c} t={t} />}
      {template === 'progress'  && <TemplateProgress  c={c} t={t} createdAt={c.createdAt} />}
      {template === 'vertical'  && <TemplateVertical  c={c} t={t} />}
      {template === 'split'     && <TemplateSplit     c={c} t={t} />}
    </motion.div>
  );
};

// ──────────────────────────────────────────────
// MAIN MODULE
// ──────────────────────────────────────────────
export default function CountdownModule() {
  const { countdowns, addCountdown, deleteCountdown, showConfirm, settings } = useAppStore(useShallow(state => ({
    countdowns: state.countdowns,
    addCountdown: state.addCountdown,
    deleteCountdown: state.deleteCountdown,
    showConfirm: state.showConfirm,
    settings: state.settings,
  })));
  const template: CountdownTemplate = settings.countdownTemplate ?? 'default';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [label, setLabel]   = useState('');
  const [date, setDate]     = useState('');
  const [time, setTime]     = useState('00:00');
  const [emoji, setEmoji]   = useState(EMOJIS[0]);
  const [color, setColor]   = useState<typeof COLORS[number]>('rose');

  const handleOpenModal = () => {
    setLabel(''); setDate(''); setTime('00:00');
    setEmoji(EMOJIS[0]); setColor('rose');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!label.trim() || !date) return;
    addCountdown({
      id: crypto.randomUUID(),
      label,
      targetDate: new Date(`${date}T${time}`).toISOString(),
      emoji,
      color,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(false);
  };

  const sorted = useMemo(() => {
    const active = countdowns.filter(c => Date.parse(c.targetDate) > Date.now());
    const done   = countdowns.filter(c => Date.parse(c.targetDate) <= Date.now());
    active.sort((a, b) => Date.parse(a.targetDate) - Date.parse(b.targetDate));
    done.sort((a, b)   => Date.parse(b.targetDate) - Date.parse(a.targetDate));
    return [...active, ...done];
  }, [countdowns]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full gap-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Countdown <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          </h2>
          <p className="text-text-secondary text-sm">Track your upcoming events and deadlines</p>
        </div>
        <button onClick={handleOpenModal}
          className="btn btn-primary btn-md">
          <IconPlus className="w-4 h-4" /> Add Countdown
        </button>
      </div>

      {countdowns.length === 0 ? (
        <EmptyState
          icon={<IconHourglassEmpty className="w-9 h-9 text-text-muted" />}
          title="No countdowns yet"
          description="Create a countdown for exams, trips, launches, or any date you want to keep in view."
          action={
            <button onClick={handleOpenModal} className="btn btn-primary btn-md">
              <IconPlus className="w-4 h-4" /> Create First Countdown
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {sorted.map(c => (
              <CountdownCard
                key={c.id}
                c={c}
                template={template}
                onDelete={() => showConfirm('Delete Countdown', `Delete "${c.label}"?`, () => deleteCountdown(c.id))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Countdown" maxWidthClassName="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Label</label>
            <input type="text" placeholder="e.g. Graduation, Trip to Japan" value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm" />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-text-secondary">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-text-secondary">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <label className="text-sm font-medium text-text-secondary">Pick an Emoji</label>
            <div className="grid grid-cols-10 gap-1.5">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`btn btn-ghost btn-sm btn-square text-xl ${emoji === e ? 'bg-primary/20 scale-110 ring-1 ring-primary' : 'hover:scale-110'}`}
                  type="button">
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">Color Accent</label>
            <div className="flex gap-3">
              {COLORS.map(col => (
                <button key={col} type="button" onClick={() => setColor(col)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === col ? 'border-text-primary scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: COLOR_HEX[col] }} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary btn-md">
              Cancel
            </button>
            <button onClick={handleSave}
              className="btn btn-primary btn-md">
              Save Countdown
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
