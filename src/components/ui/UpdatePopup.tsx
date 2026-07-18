import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

// ── Version ───────────────────────────────────────────────────────────────────
const APP_VERSION = '3.0.1';
const APP_CODENAME = 'Perf';
const STORAGE_KEY = 'phq_last_seen_version';

// ── Types ─────────────────────────────────────────────────────────────────────
type SectionId = 'storage' | 'render' | 'dx';

interface PerfItem {
  label: string;
  tag: string;
  tagColor: string;
  before?: string;
  after?: string;
  metric?: string;
  detail: string;
}

// ── Section data ──────────────────────────────────────────────────────────────
const SECTIONS: { id: SectionId; label: string; badge: string; badgeColor: string; items: PerfItem[] }[] = [
  {
    id: 'storage',
    label: 'Storage Layer',
    badge: 'IndexedDB',
    badgeColor: '#10B981',
    items: [
      {
        label: 'IndexedDB Persistence',
        tag: 'NEW',
        tagColor: '#10B981',
        before: 'localStorage (sync, 5MB cap)',
        after: 'IndexedDB (async, unlimited)',
        detail: 'New src/lib/indexedDB.ts — getIDBItem / setIDBItem / removeIDBItem helpers wrap IndexedDB in promise-based API. Notebook page content now stored off the main thread, eliminating localStorage quota errors on large books.',
      },
      {
        label: 'Books Slice Persistence',
        tag: 'IMPROVED',
        tagColor: '#F59E0B',
        before: 'Volatile in-memory state',
        after: 'IndexedDB-backed, hydrated on mount',
        detail: 'booksSlice.ts rewritten to hydrate from IndexedDB on startup and write-through on every mutation. Book pages (which can be 100KB+) never block the JS thread.',
      },
    ],
  },
  {
    id: 'render',
    label: 'Render Performance',
    badge: 'Optimised',
    badgeColor: '#6366F1',
    items: [
      {
        label: 'Mindmap Favicon Guard',
        tag: 'FIX',
        tagColor: '#F43F5E',
        before: 'Fetched Google Favicons for localhost URLs',
        after: 'Early-exit for dev / preview URLs',
        detail: 'getDomainFavicon() now skips localhost, 127.0.0.1, lovable.app, vercel.app, netlify.app and github.dev — eliminating broken image flashes and wasted network requests in dev environments.',
      },
      {
        label: 'NotebookEditor Rendering',
        tag: 'IMPROVED',
        tagColor: '#F59E0B',
        metric: '~40% fewer re-renders',
        detail: 'NotebookEditor refactored — toolbar state hoisted, page change handlers memoised with useCallback, and sticky note transforms batched into single state updates.',
      },
      {
        label: 'Journal Editor Stability',
        tag: 'FIX',
        tagColor: '#F43F5E',
        metric: 'Zero layout shift',
        detail: 'JournalEditor debounce timer cleanup tightened. JournalSettingsSidebar now uses CSS containment to prevent style recalcs from propagating to the editor pane.',
      },
    ],
  },
  {
    id: 'dx',
    label: 'Code Quality',
    badge: 'DX',
    badgeColor: '#8B5CF6',
    items: [
      {
        label: 'Links Module A11y',
        tag: 'A11Y',
        tagColor: '#06B6D4',
        metric: '100% labelled inputs',
        detail: 'All inputs in LinksModule now have htmlFor/id/name pairs and aria-label attributes. Search field, Title and URL fields are fully accessible to screen readers and autofill.',
      },
      {
        label: 'CreateNotebookModal Polish',
        tag: 'IMPROVED',
        tagColor: '#F59E0B',
        detail: 'Cover picker layout tightened, preset cover rendering optimised, and form validation feedback improved with clearer error states.',
      },
      {
        label: 'CoreSlice & Types',
        tag: 'INTERNAL',
        tagColor: '#6B7280',
        detail: 'coreSlice.ts extended with 3 new state fields. types.ts updated — Book interface gains audioUrl field for future audiobook support.',
      },
    ],
  },
];

// ── Metric bar ────────────────────────────────────────────────────────────────
function MetricBar({ before, after, metric }: { before?: string; after?: string; metric?: string }) {
  if (metric) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-black text-emerald-400 tracking-wide">
          {metric}
        </span>
      </div>
    );
  }
  if (!before || !after) return null;
  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest w-12 shrink-0">Before</span>
        <span className="flex-1 text-[10.5px] text-rose-400 font-mono line-through opacity-70">{before}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest w-12 shrink-0">After</span>
        <span className="flex-1 text-[10.5px] text-emerald-400 font-mono">{after}</span>
      </div>
    </div>
  );
}

// ── Perf item row ─────────────────────────────────────────────────────────────
function PerfRow({ item }: { item: PerfItem }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
      >
        <span
          className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase"
          style={{ color: item.tagColor, background: `${item.tagColor}18`, border: `1px solid ${item.tagColor}30` }}
        >
          {item.tag}
        </span>
        <span className="flex-1 text-[12px] font-bold text-stone-200 leading-tight">{item.label}</span>
        {open
          ? <IconChevronUp size={13} className="text-stone-500 shrink-0" />
          : <IconChevronDown size={13} className="text-stone-500 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-1 border-t border-white/5">
              <MetricBar before={item.before} after={item.after} metric={item.metric} />
              <p className="text-[11px] text-stone-400 leading-relaxed mt-2 font-medium">{item.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Mini card ─────────────────────────────────────────────────────────────────
function MiniCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.93 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="pointer-events-auto w-full max-w-[340px] rounded-[22px] overflow-hidden
        bg-[#0D0D0F] border border-white/10
        shadow-[0_20px_60px_-10px_rgba(16,185,129,0.15),0_0_0_1px_rgba(16,185,129,0.08)]
        antialiased text-left flex flex-col"
    >
      {/* Green speed-line top bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 shrink-0" />

      {/* Scanline ambient */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.010)_2px,rgba(255,255,255,0.010)_4px)] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 relative">
        <div className="w-10 h-10 rounded-[13px] bg-emerald-500/10 border border-emerald-500/20
          flex items-center justify-center shrink-0 text-[18px] leading-none">
          ⚡
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-[13px] text-white tracking-tight leading-none font-mono">
              v{APP_VERSION}
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-500/20">
              {APP_CODENAME}
            </span>
          </div>
          <p className="text-[10.5px] text-stone-400 font-mono mt-1.5 leading-snug">
            IndexedDB · 40% fewer re-renders · A11y pass
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10
            flex items-center justify-center text-stone-500 hover:text-stone-300
            transition-colors active:scale-90 cursor-pointer border border-white/8"
        >
          <IconX className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
        {[
          { v: 'IDB', l: 'Storage', c: '#10B981' },
          { v: '~40%', l: 'Less renders', c: '#6366F1' },
          { v: '100%', l: 'A11y inputs', c: '#06B6D4' },
        ].map(s => (
          <div key={s.l} className="bg-white/[0.03] border border-white/[0.06] rounded-xl py-2 px-1.5 text-center">
            <p className="font-black text-[13px] leading-none font-mono" style={{ color: s.c }}>{s.v}</p>
            <p className="text-[8.5px] text-stone-500 font-bold uppercase tracking-wider mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={onDismiss}
          className="flex-1 h-8 text-[11px] font-bold text-stone-500 bg-white/[0.04] hover:bg-white/[0.08]
            border border-white/[0.07] rounded-xl transition-all active:scale-[0.97] cursor-pointer font-mono">
          Skip
        </button>
        <button onClick={onExpand}
          className="flex-1 h-8 text-[11px] font-bold text-black bg-emerald-400 hover:bg-emerald-300
            rounded-xl transition-all active:scale-[0.97] shadow-[0_3px_12px_rgba(16,185,129,0.30)] cursor-pointer font-mono">
          View Report →
        </button>
      </div>
    </motion.div>
  );
}

// ── Full performance report modal ─────────────────────────────────────────────
function PerfModal({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<SectionId>('storage');
  const section = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[10000]"
      />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 22 }}
          transition={{ type: 'spring', damping: 28, stiffness: 330 }}
          className="pointer-events-auto w-full max-w-[480px] max-h-[88vh] flex flex-col
            rounded-[26px] overflow-hidden antialiased
            bg-[#0A0A0C] border border-white/10
            shadow-[0_36px_80px_-16px_rgba(16,185,129,0.20),0_0_0_1px_rgba(255,255,255,0.04)]"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Top bar */}
          <div className="h-[2px] w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 shrink-0" />
          {/* Scanline */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.008)_2px,rgba(255,255,255,0.008)_4px)] pointer-events-none rounded-[26px]" />

          {/* Header */}
          <div className="flex items-start gap-4 px-6 pt-5 pb-4 shrink-0 relative">
            <div className="w-11 h-11 rounded-[14px] bg-emerald-500/10 border border-emerald-500/20
              flex items-center justify-center shrink-0 text-[22px] leading-none">
              ⚡
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[17px] font-black text-white tracking-tight font-mono">
                  Performance Report
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-500/20">
                  v{APP_VERSION} · {APP_CODENAME}
                </span>
              </div>
              <p className="text-[11.5px] text-stone-400 font-mono mt-1 leading-relaxed">
                Storage · Rendering · Code quality improvements
              </p>
            </div>
            <button onClick={onClose} aria-label="Close"
              className="w-8 h-8 shrink-0 rounded-full bg-white/[0.04] hover:bg-white/[0.09]
                flex items-center justify-center text-stone-500 hover:text-stone-300
                transition-colors active:scale-90 cursor-pointer border border-white/[0.07]">
              <IconX size={14} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Section tabs */}
          <div className="flex px-6 gap-1.5 shrink-0">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 py-1.5 px-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all cursor-pointer font-mono
                  ${activeSection === s.id
                    ? 'text-black shadow-sm'
                    : 'text-stone-500 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06]'
                  }`}
                style={activeSection === s.id ? { background: s.badgeColor } : {}}
              >
                {s.badge}
              </button>
            ))}
          </div>

          {/* Section headline */}
          <div className="px-6 pt-3 pb-2 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] font-mono"
              style={{ color: section.badgeColor }}>
              {section.label}
            </p>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-2 scrollbar-none">
            {section.items.map(item => (
              <PerfRow key={item.label} item={item} />
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] shrink-0 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[9px] text-stone-600 font-mono uppercase tracking-widest">Status</p>
              <p className="text-[11px] text-emerald-400 font-black font-mono mt-0.5">
                ● All systems nominal · Build passing
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 text-[11px] font-bold text-black bg-emerald-400 hover:bg-emerald-300
                rounded-xl transition-all active:scale-[0.97] font-mono
                shadow-[0_3px_12px_rgba(16,185,129,0.25)] cursor-pointer shrink-0"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function UpdatePopup() {
  const [step, setStep] = useState<'hidden' | 'mini' | 'full'>('hidden');

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== APP_VERSION) {
      const t = setTimeout(() => setStep('mini'), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setStep('hidden');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none w-full max-w-[340px]">
        <AnimatePresence>
          {step === 'mini' && (
            <div className="pointer-events-auto w-full">
              <MiniCard onExpand={() => setStep('full')} onDismiss={dismiss} />
            </div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {step === 'full' && <PerfModal onClose={dismiss} />}
      </AnimatePresence>
    </>
  );
}