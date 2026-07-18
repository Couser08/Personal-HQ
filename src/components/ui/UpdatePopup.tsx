import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

// ── Version ───────────────────────────────────────────────────────────────────
const APP_VERSION = '3.0.0';
const APP_CODENAME = 'Library';
const STORAGE_KEY = 'phq_last_seen_version';

// ── Chapter / Tab data ────────────────────────────────────────────────────────
type ChapterId = 'headline' | 'features' | 'improvements';

interface PageItem {
  emoji: string;
  title: string;
  why: string;
  how: string;
}

const CHAPTERS: { id: ChapterId; label: string; icon: string }[] = [
  { id: 'headline', label: 'New Chapter',   icon: '📖' },
  { id: 'features', label: 'New Features',  icon: '✨' },
  { id: 'improvements', label: 'Refinements', icon: '🔧' },
];

const CHAPTER_CONTENT: Record<ChapterId, { headline: string; color: string; pages: PageItem[] }> = {
  headline: {
    headline: 'The biggest feature Personal HQ has ever shipped.',
    color: '#8B5CF6',
    pages: [
      {
        emoji: '📚',
        title: 'Books & Notebooks',
        why: 'You needed one place to read, annotate, and think — without switching apps.',
        how: 'Create a personal notebook with custom covers, write pages in a rich editor, add sticky notes & highlights, bookmark pages, and track reading progress — all in a full-screen Library Dashboard.',
      },
      {
        emoji: '🎨',
        title: 'Preset Book Covers',
        why: 'A beautiful cover makes you want to open the book.',
        how: 'Pick from a curated set of gradient and illustrated preset covers when creating a notebook, or upload your own. Covers render in a 3D spine-on-shelf style inside the Library.',
      },
      {
        emoji: '📄',
        title: 'PDF Export',
        why: 'Your notes should leave the app with you.',
        how: 'Export any notebook as a polished PDF via the Download PDF modal — includes your cover, page content, sticky notes, and table of topics in one document.',
      },
      {
        emoji: '🗂️',
        title: 'Library Dashboard',
        why: 'A bird\'s-eye view of everything you\'re reading and writing.',
        how: 'See all notebooks on a shelf, filter by category or reading list, sort by progress or date, and jump directly into any book. Your personal reading stats live here too.',
      },
    ],
  },
  features: {
    headline: 'New capabilities shipped alongside the Books module.',
    color: '#059669',
    pages: [
      {
        emoji: '🌊',
        title: 'Dashboard Stagger Animations',
        why: 'The dashboard felt static — it should feel alive when you open it.',
        how: 'Every dashboard card now enters with a spring-based stagger animation using framer-motion containerVariants + itemVariants. Cards cascade in naturally at 50ms intervals.',
      },
      {
        emoji: '🎨',
        title: 'Global CSS Design System',
        why: 'Inconsistent spacing and colours were making the app feel rough around the edges.',
        how: '191 lines of new CSS tokens added to index.css — unified spacing scale, shadow layers, surface tints, and typography variables used across every module.',
      },
      {
        emoji: '⚡',
        title: 'Markdown Preview Rewrite',
        why: 'The old preview was slow to render and lost scroll position on edits.',
        how: 'MarkdownPreview completely rewritten with memoisation and virtual scroll anchoring. Live preview now updates in <16ms and preserves scroll position between keystrokes.',
      },
      {
        emoji: '🗺️',
        title: 'Decision Diagram Improvements',
        why: 'The condition/decision module needed better visual feedback.',
        how: 'DecisionDiagram component updated with cleaner node layout, improved edge routing, and better interaction states for the ConditionModule.',
      },
    ],
  },
  improvements: {
    headline: 'Quality and stability improvements throughout the app.',
    color: '#D97706',
    pages: [
      {
        emoji: '🔒',
        title: 'Modal Focus Management Hardened',
        why: 'Keyboard users reported focus escaping modals in edge cases.',
        how: 'Modal.tsx updated with stricter focusable element detection and better cleanup on unmount — covers all dynamic content changes inside open modals.',
      },
      {
        emoji: '🏷️',
        title: 'Sidebar Navigation Polish',
        why: 'Adding a new Books nav item needed sidebar restructuring.',
        how: 'Sidebar.tsx updated with Books entry, reordered nav groups, and accessibility improvements (aria-current on active item).',
      },
      {
        emoji: '🗃️',
        title: 'Supabase Books Schema',
        why: 'Books needed persistent cloud storage across devices.',
        how: 'New migration 20260718000000_books_schema.sql — tables for books, pages, highlights, bookmarks, sticky notes, and topics with RLS policies.',
      },
      {
        emoji: '🛠️',
        title: 'ConfirmDialog & Store Cleanup',
        why: 'Minor prop and type inconsistencies were causing runtime warnings.',
        how: 'ConfirmDialog.tsx cleaned up, store types extended with full Book interface (BookTopic, BookStickyNote, BookHighlight), useAppStore wired to booksSlice.',
      },
    ],
  },
};

// ── Mini spine card (bottom-right) ───────────────────────────────────────────
function SpineCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.93 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="pointer-events-auto w-full max-w-[340px] rounded-[22px] overflow-hidden
        bg-gradient-to-br from-amber-50 via-white to-violet-50
        dark:from-stone-900 dark:via-[#141414] dark:to-violet-950/30
        border border-amber-200/60 dark:border-violet-800/40
        shadow-[0_20px_60px_-10px_rgba(139,92,246,0.20),0_0_0_1px_rgba(139,92,246,0.06)]
        antialiased text-left flex flex-col gap-0"
    >
      {/* Top spine stripe */}
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-violet-500 to-purple-600 shrink-0" />

      {/* Ambient orb */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-violet-400/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
        {/* Book stack icon */}
        <div className="w-11 h-11 rounded-[15px] bg-gradient-to-br from-amber-500 to-violet-600
          flex items-center justify-center shrink-0 text-[22px] leading-none
          shadow-[0_4px_14px_rgba(139,92,246,0.30)]">
          📚
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-[14px] text-stone-900 dark:text-stone-50 tracking-tight leading-none">
              v{APP_VERSION} — {APP_CODENAME}
            </h3>
            <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400
              text-[9px] font-black uppercase tracking-widest rounded-md border border-violet-500/15">
              New Chapter
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-1.5 leading-snug">
            Books & Library — your most-requested feature is here.
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-4 right-4 w-7 h-7 rounded-full
            bg-amber-50 dark:bg-stone-800/80
            hover:bg-violet-100 dark:hover:bg-violet-900/30
            flex items-center justify-center
            text-stone-400 hover:text-violet-500
            transition-colors active:scale-90 cursor-pointer border border-stone-200/50 dark:border-stone-700/50"
        >
          <IconX className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-amber-200/40 dark:bg-violet-800/20 mx-4 shrink-0" />

      {/* Stat shelf */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 shrink-0">
        {[
          { v: '4', l: 'Book views' },
          { v: '∞', l: 'Pages' },
          { v: 'PDF', l: 'Export' },
        ].map(s => (
          <div key={s.l} className="bg-white/60 dark:bg-stone-800/50 rounded-xl py-2 px-2 text-center border border-amber-200/30 dark:border-violet-800/30">
            <p className="font-black text-[16px] text-violet-600 dark:text-violet-400 leading-none">{s.v}</p>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 shrink-0">
        <button
          onClick={onDismiss}
          className="flex-1 h-9 text-[11px] font-bold text-stone-600 dark:text-stone-400
            bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700
            rounded-xl transition-all active:scale-[0.97] cursor-pointer"
        >
          Later
        </button>
        <button
          onClick={onExpand}
          className="flex-1 h-9 text-[11px] font-bold text-white
            bg-gradient-to-r from-amber-500 to-violet-600
            hover:from-amber-600 hover:to-violet-700
            rounded-xl transition-all active:scale-[0.97]
            shadow-[0_3px_12px_rgba(139,92,246,0.30)] cursor-pointer"
        >
          Open the Book →
        </button>
      </div>
    </motion.div>
  );
}

// ── Full Library Modal ────────────────────────────────────────────────────────
function LibraryModal({ onClose }: { onClose: () => void }) {
  const [activeChapter, setActiveChapter] = useState<ChapterId>('headline');
  const [page, setPage] = useState(0);

  const chapter = CHAPTER_CONTENT[activeChapter];
  const totalPages = chapter.pages.length;
  const currentPage = chapter.pages[page];

  // Reset page when chapter changes
  const switchChapter = (id: ChapterId) => { setActiveChapter(id); setPage(0); };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[10000]"
      />

      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 22 }}
          transition={{ type: 'spring', damping: 28, stiffness: 330 }}
          className="pointer-events-auto w-full max-w-[500px] max-h-[90vh] flex flex-col
            rounded-[28px] overflow-hidden antialiased text-left
            bg-gradient-to-b from-amber-50 via-white to-violet-50/50
            dark:from-stone-900 dark:via-[#141414] dark:to-violet-950/20
            border border-amber-200/50 dark:border-violet-800/30
            shadow-[0_36px_80px_-16px_rgba(139,92,246,0.35)]"
        >
          {/* Top spine */}
          <div className="h-[4px] w-full bg-gradient-to-r from-amber-400 via-violet-500 to-purple-600 shrink-0" />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">

            {/* ── Header ── */}
            <div className="flex items-start gap-4 px-6 pt-6 pb-4 shrink-0">
              <div className="w-13 h-13 rounded-[18px] text-[28px] leading-none flex items-center justify-center shrink-0
                bg-gradient-to-br from-amber-400/20 to-violet-500/20 border border-amber-200/40 dark:border-violet-700/30"
                style={{ width: 52, height: 52 }}>
                📚
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[19px] font-black text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                    Personal HQ v{APP_VERSION}
                  </h2>
                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400
                    text-[9px] font-black uppercase tracking-widest rounded-lg border border-violet-500/15">
                    {APP_CODENAME}
                  </span>
                </div>
                <p className="text-[12.5px] text-stone-500 dark:text-stone-400 font-medium mt-1 leading-relaxed">
                  {chapter.headline}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 shrink-0 rounded-full
                  bg-stone-100/80 dark:bg-stone-800/80
                  hover:bg-violet-100 dark:hover:bg-violet-900/30
                  flex items-center justify-center
                  text-stone-400 hover:text-violet-500
                  transition-colors active:scale-90 cursor-pointer"
              >
                <IconX size={14} className="stroke-[2.5]" />
              </button>
            </div>

            {/* ── Chapter tabs (book spine style) ── */}
            <div className="flex px-6 gap-1 shrink-0">
              {CHAPTERS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => switchChapter(ch.id)}
                  className={`flex-1 py-2 px-1 text-[10.5px] font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1
                    ${activeChapter === ch.id
                      ? 'bg-gradient-to-br from-amber-500/15 to-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-300/40 dark:border-violet-700/40 shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                    }`}
                >
                  <span>{ch.icon}</span>
                  <span className="hidden sm:inline">{ch.label}</span>
                </button>
              ))}
            </div>

            {/* ── Page card ── */}
            <div className="px-6 pt-4 pb-2 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeChapter}-${page}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl border border-amber-200/40 dark:border-violet-800/30
                    bg-white/70 dark:bg-stone-800/30 p-5 flex flex-col gap-4 min-h-[200px]"
                >
                  {/* Page header */}
                  <div className="flex items-start gap-3">
                    <span className="text-[32px] leading-none shrink-0">{currentPage.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-[15px] text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                        {currentPage.title}
                      </h3>
                      {/* Page number */}
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                        Page {page + 1} of {totalPages}
                      </span>
                    </div>
                  </div>

                  {/* Why introduced */}
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      Why it was introduced
                    </p>
                    <p className="text-[12.5px] text-stone-600 dark:text-stone-300 leading-relaxed font-medium italic border-l-2 border-amber-400/50 pl-3">
                      {currentPage.why}
                    </p>
                  </div>

                  {/* How it works */}
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                      How it works
                    </p>
                    <p className="text-[12.5px] text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                      {currentPage.how}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Page dots ── */}
            <div className="flex items-center justify-center gap-1.5 py-2 shrink-0">
              {chapter.pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`rounded-full transition-all cursor-pointer ${
                    i === page
                      ? 'w-5 h-1.5 bg-violet-500'
                      : 'w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600 hover:bg-violet-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Footer navigation ── */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-amber-200/40 dark:border-violet-800/20 shrink-0">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
              className="w-9 h-9 rounded-xl bg-stone-100/80 dark:bg-stone-800/80
                hover:bg-amber-100 dark:hover:bg-amber-900/30
                disabled:opacity-30 disabled:cursor-not-allowed
                flex items-center justify-center
                text-stone-500 hover:text-amber-600
                transition-all active:scale-95 cursor-pointer"
            >
              <IconChevronLeft size={16} className="stroke-[2.5]" />
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 font-bold text-[12px] text-white
                bg-gradient-to-r from-amber-500 to-violet-600
                hover:from-amber-600 hover:to-violet-700
                rounded-xl transition-all active:scale-[0.97]
                shadow-[0_4px_16px_rgba(139,92,246,0.25)] cursor-pointer text-center"
            >
              Start Reading →
            </button>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              aria-label="Next page"
              className="w-9 h-9 rounded-xl bg-stone-100/80 dark:bg-stone-800/80
                hover:bg-violet-100 dark:hover:bg-violet-900/30
                disabled:opacity-30 disabled:cursor-not-allowed
                flex items-center justify-center
                text-stone-500 hover:text-violet-600
                transition-all active:scale-95 cursor-pointer"
            >
              <IconChevronRight size={16} className="stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
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
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none w-full max-w-[340px] px-4 sm:px-0">
        <AnimatePresence>
          {step === 'mini' && (
            <div className="flex justify-end w-full pointer-events-auto">
              <SpineCard onExpand={() => setStep('full')} onDismiss={dismiss} />
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {step === 'full' && <LibraryModal onClose={dismiss} />}
      </AnimatePresence>
    </>
  );
}