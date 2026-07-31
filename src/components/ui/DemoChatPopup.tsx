/**
 * DemoChatPopup
 * An auto-playing fake conversation that demos Personal HQ features.
 * Matches the UpdatePopup card style (same gradient accent, same surface).
 *
 * Usage: drop <DemoChatPopup /> anywhere in your layout.
 * It shows after a 3 s delay on first visit, auto-plays a script,
 * then hides.  User can dismiss at any time.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconSparkles, IconSend } from '@tabler/icons-react';

// ── Constants ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'phq_demo_chat_seen';
const GRAD = 'linear-gradient(135deg, #f43f5e 0%, #8B5CF6 55%, #3B82F6 100%)';
const GRAD_SHADOW = '0 4px 20px rgba(244,63,94,0.30)';

// ── Script ────────────────────────────────────────────────────────────────────
// Each message has: who sent it, the text, and delay (ms after previous message).
interface ScriptLine {
  role: 'user' | 'ai';
  text: string;
  delay: number;          // ms to wait before this bubble appears
  badge?: string;         // optional pill tag on the AI bubble
}

const SCRIPT: ScriptLine[] = [
  { role: 'user', text: "Hey! What can Personal HQ help me with?", delay: 600 },
  { role: 'ai',   text: "Almost everything in your daily workflow — journaling, tasks, habits, studying, budgeting, and more. All in one place. 🏠", delay: 1000, badge: 'Overview' },
  { role: 'user', text: "How do I quickly add a task without navigating?", delay: 1200 },
  { role: 'ai',   text: "Press ⌘K (or Ctrl+K) to open the command palette, then type \"new\" — you can create a Todo task, Journal entry, Habit log, or save a Link instantly.", delay: 1400, badge: '⌘K Quick-add' },
  { role: 'user', text: "What if I'm offline?", delay: 1300 },
  { role: 'ai',   text: "No problem. Every module loads from local storage first so the app works offline. When you reconnect, hit Force Sync and everything updates from Supabase. 🔌", delay: 1500, badge: 'Offline mode' },
  { role: 'user', text: "This is awesome. Where do I start?", delay: 1100 },
  { role: 'ai',   text: "Open the sidebar → pick a section (✍️ Create & Write is great for beginners) → click any module card. You've got this! 🚀", delay: 1400, badge: 'Get started' },
];

// ── Typing indicator ───────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 block"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

// ── Single bubble ──────────────────────────────────────────────────────────────
function Bubble({ line, visible }: { line: ScriptLine; visible: boolean }) {
  const isUser = line.role === 'user';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          {!isUser && (
            <div
              className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] mb-0.5"
              style={{ background: GRAD }}
            >
              <IconSparkles size={12} className="text-white" />
            </div>
          )}

          <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
            {/* Badge */}
            {line.badge && (
              <span
                className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.18)' }}
              >
                {line.badge}
              </span>
            )}

            {/* Bubble */}
            <div
              className={`px-3 py-2 rounded-2xl text-[12px] font-medium leading-relaxed ${
                isUser
                  ? 'text-white rounded-br-sm'
                  : 'text-zinc-800 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-bl-sm'
              }`}
              style={isUser ? { background: GRAD } : {}}
            >
              {line.text}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function DemoChatPopup() {
  const [visible, setVisible] = useState(false);
  const [shownCount, setShownCount] = useState(0);   // how many lines revealed
  const [isTyping, setIsTyping] = useState(false);   // typing indicator active
  const [isDone, setIsDone] = useState(false);       // script finished
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Show only once per session
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Auto-play script when popup opens
  useEffect(() => {
    if (!visible) return;

    let cursor = 0;
    let elapsed = 0;

    function scheduleNext() {
      if (cursor >= SCRIPT.length) {
        const t = setTimeout(() => setIsDone(true), 1200);
        timerRefs.current.push(t);
        return;
      }

      const line = SCRIPT[cursor];
      elapsed += line.delay;

      // Show typing indicator before AI bubble
      if (line.role === 'ai') {
        const t1 = setTimeout(() => setIsTyping(true), elapsed - 600);
        timerRefs.current.push(t1);
      }

      const t2 = setTimeout(() => {
        setIsTyping(false);
        setShownCount(c => c + 1);
        cursor++;
        scheduleNext();
      }, elapsed);

      timerRefs.current.push(t2);
    }

    scheduleNext();
    return () => timerRefs.current.forEach(clearTimeout);
  }, [visible]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [shownCount, isTyping]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    timerRefs.current.forEach(clearTimeout);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.93 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ willChange: 'transform, opacity' }}
          className="fixed bottom-6 left-6 z-[9998] w-full max-w-[320px] rounded-[22px] overflow-hidden antialiased
            bg-white dark:bg-[#111113]
            border border-zinc-200/80 dark:border-white/[0.07]
            shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.55)]"
        >
          {/* Accent bar */}
          <div className="h-[3px] w-full" style={{ background: GRAD }} />

          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
            <div
              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
              style={{ background: GRAD, boxShadow: GRAD_SHADOW }}
            >
              <IconSparkles size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-black text-zinc-900 dark:text-zinc-50 leading-none">Personal HQ Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-[10px] font-semibold text-zinc-400">
                  {isDone ? 'Demo complete' : 'Live demo'}
                </span>
              </div>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close demo"
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors"
              style={{ background: 'rgba(0,0,0,0.04)' }}
            >
              <IconX size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex flex-col gap-2.5 px-3 py-3 overflow-y-auto"
            style={{ maxHeight: 280, scrollbarWidth: 'none' }}
          >
            {SCRIPT.map((line, i) => (
              <Bubble key={i} line={line} visible={i < shownCount} />
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-end gap-2"
                >
                  <div
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: GRAD }}
                  >
                    <IconSparkles size={12} className="text-white" />
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer CTA */}
          <div className="px-3 pb-3">
            {isDone ? (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={dismiss}
                className="w-full h-9 text-[11.5px] font-bold text-white rounded-xl cursor-pointer transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={{ background: GRAD, boxShadow: GRAD_SHADOW }}
              >
                Start using Personal HQ →
              </motion.button>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <span className="flex-1 text-[11px] text-zinc-400 font-medium italic">Auto-playing demo…</span>
                <IconSend size={13} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
