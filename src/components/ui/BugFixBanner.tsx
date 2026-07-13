import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconCheck } from '@tabler/icons-react';

// ── Patch identity — bump this ID whenever you ship a new set of bug fixes ──
const PATCH_ID = 'bugfix-2026-07-13-a';
const STORAGE_KEY = 'phq_seen_bugfix';

// ── Fix items ─────────────────────────────────────────────────────────────────
const FIXES = [
  {
    emoji: '🔄',
    title: 'To-Do Sync Fix',
    desc: 'Cross-device sync now works reliably — tasks update instantly on all your devices.',
  },
  {
    emoji: '⏭️',
    title: 'Skip Task with Ease',
    desc: 'New skip feature lets you breeze past a task without losing your flow.',
  },
  {
    emoji: '📊',
    title: "Pomodoro Layout Fix",
    desc: "Today's Goal and Weekly Focus Trend no longer overflow or collapse on any screen size.",
  },
  {
    emoji: '🔗',
    title: 'Link Saver Performance',
    desc: 'Laggy scrolling eliminated. Link cards also got a visual refresh — cleaner and faster.',
  },
  {
    emoji: '🔔',
    title: 'Pomodoro Finish Notification',
    desc: 'Session-end notification was silent on some devices — now fires every time, guaranteed.',
  },
];

// ── Bug emoji that crawls across the icon area ────────────────────────────────
function CrawlingBug() {
  return (
    <motion.span
      animate={{
        x: [0, 4, -4, 3, -3, 0],
        y: [0, -2, 2, -1, 1, 0],
        rotate: [0, 8, -8, 5, -5, 0],
      }}
      transition={{
        duration: 2.4,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'loop',
      }}
      className="text-[22px] leading-none select-none"
      aria-hidden="true"
    >
      🐛
    </motion.span>
  );
}

// ── Main Banner ───────────────────────────────────────────────────────────────
export function BugFixBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== PATCH_ID) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, PATCH_ID);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none w-full max-w-[360px]">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            /* ── Card shell — explicit flex-col, no grid, matches journal card proportions ── */
            className="pointer-events-auto w-full flex flex-col gap-0 rounded-[22px] overflow-hidden
              bg-white dark:bg-[#141414]
              border border-rose-200/60 dark:border-rose-900/40
              shadow-[0_20px_60px_-10px_rgba(220,38,38,0.20),0_0_0_1px_rgba(220,38,38,0.06)]
              antialiased text-left"
          >
            {/* ── Red accent stripe at top ──────────────────────────────────── */}
            <div className="h-[3px] w-full bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 shrink-0" />

            {/* ── Ambient glow ──────────────────────────────────────────────── */}
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-rose-500/8 blur-2xl pointer-events-none" />

            {/* ── Header row ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0">
              {/* Bug icon pill */}
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-rose-600 to-red-500
                flex items-center justify-center shrink-0
                shadow-[0_4px_14px_rgba(220,38,38,0.30)]">
                <CrawlingBug />
              </div>

              {/* Title block */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-[14px] text-stone-900 dark:text-stone-50 tracking-tight leading-none">
                    Bug Fixes
                  </h3>
                  <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400
                    text-[9px] font-black uppercase tracking-widest rounded-md border border-rose-500/15">
                    {FIXES.length} patches
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-1 leading-snug">
                  Squashed today — your app is smoother now.
                </p>
              </div>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="w-7 h-7 shrink-0 rounded-full
                  bg-stone-100/80 dark:bg-stone-800/80
                  hover:bg-rose-50 dark:hover:bg-rose-900/30
                  flex items-center justify-center
                  text-stone-400 hover:text-rose-500
                  transition-colors active:scale-90 cursor-pointer"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Divider ───────────────────────────────────────────────────── */}
            <div className="h-px bg-rose-100/60 dark:bg-rose-900/20 mx-4 shrink-0" />

            {/* ── Fix list (collapsed: first 2, expanded: all) ──────────────── */}
            <div className="flex flex-col px-4 pt-3 pb-1 gap-2.5 shrink-0">
              <AnimatePresence initial={false}>
                {(expanded ? FIXES : FIXES.slice(0, 2)).map((fix, i) => (
                  <motion.div
                    key={fix.title}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.04 }}
                    className="flex items-start gap-3 overflow-hidden"
                  >
                    {/* Check circle */}
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20
                      flex items-center justify-center shrink-0 mt-0.5">
                      <IconCheck className="w-3 h-3 text-rose-500 stroke-[2.5]" />
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px]">{fix.emoji}</span>
                        <p className="font-bold text-[12px] text-stone-800 dark:text-stone-100 leading-tight truncate">
                          {fix.title}
                        </p>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-snug mt-0.5">
                        {fix.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Footer: expand toggle + dismiss ──────────────────────────── */}
            <div className="flex items-center gap-2 px-4 py-3 shrink-0">
              <button
                onClick={() => setExpanded(p => !p)}
                className="flex-1 h-8 text-[11px] font-bold
                  text-rose-600 dark:text-rose-400
                  bg-rose-50 dark:bg-rose-900/20
                  hover:bg-rose-100 dark:hover:bg-rose-900/30
                  border border-rose-200/50 dark:border-rose-800/40
                  rounded-xl transition-all active:scale-[0.97] cursor-pointer"
              >
                {expanded
                  ? `Show Less ↑`
                  : `+${FIXES.length - 2} more fixes ↓`}
              </button>
              <button
                onClick={dismiss}
                className="flex-1 h-8 text-[11px] font-bold text-white
                  bg-gradient-to-r from-rose-600 to-red-500
                  hover:from-rose-700 hover:to-red-600
                  rounded-xl transition-all active:scale-[0.97]
                  shadow-[0_3px_10px_rgba(220,38,38,0.25)] cursor-pointer"
              >
                Got it ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
