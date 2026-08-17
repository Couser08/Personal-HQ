import React, { useState } from 'react';
import {
  IconHeart,
  IconHeartFilled,
  IconX,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconPlus,
  IconSun,
  IconMoon,
  IconGridDots,
  IconSparkles,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionBoard } from '../../../store/types';

interface VisionInsightsPanelProps {
  board: VisionBoard;
  isOpen: boolean;
  onClose: () => void;
  onOpenGoalsModal?: () => void;
}

interface AffirmationItem {
  id: string;
  quote: string;
  author: string;
  category: 'Mindset' | 'Confidence' | 'Peace' | 'Growth' | 'Focus';
}

const AFFIRMATION_PRESETS: AffirmationItem[] = [
  { id: 'aff-1', quote: 'I am becoming everything I choose to be.', author: 'Self', category: 'Mindset' },
  { id: 'aff-2', quote: 'Discipline today, unconditional freedom tomorrow.', author: 'Stoic Wisdom', category: 'Focus' },
  { id: 'aff-3', quote: 'I create space for clarity, intention, and boundless growth.', author: 'Mindful Vision', category: 'Peace' },
  { id: 'aff-4', quote: 'Every deliberate action is a vote for the person I am becoming.', author: 'James Clear', category: 'Growth' },
  { id: 'aff-5', quote: 'I possess the focus, resilience, and vision to architect my life.', author: 'Daily Power', category: 'Confidence' },
  { id: 'aff-6', quote: 'Simplicity is the ultimate expression of mastery.', author: 'Leonardo da Vinci', category: 'Focus' },
  { id: 'aff-7', quote: 'Calm mind, tectonic focus, unstoppable momentum.', author: 'Self', category: 'Mindset' },
];

import { useToastStore } from '../../../store/useToastStore';

export const VisionInsightsPanel: React.FC<VisionInsightsPanelProps> = ({
  board: _board,
  isOpen,
  onClose,
}) => {
  const {
    theme,
    setTheme,
    canvasTheme,
    setCanvasTheme,
    addVisionNode,
  } = useAppStore();

  const addToast = useToastStore((s) => s.addToast);

  const [activeAffirmationIndex, setActiveAffirmationIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({ 'aff-1': true });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom affirmation creation
  const [customQuote, setCustomQuote] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customAffirmations, setCustomAffirmations] = useState<AffirmationItem[]>([]);

  const allAffirmations = [...AFFIRMATION_PRESETS, ...customAffirmations];

  const filteredAffirmations = allAffirmations.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const activeAffirmation = filteredAffirmations[activeAffirmationIndex] || filteredAffirmations[0] || allAffirmations[0];

  const handleShuffle = () => {
    const nextIdx = (activeAffirmationIndex + 1) % filteredAffirmations.length;
    setActiveAffirmationIndex(nextIdx);
  };

  const toggleHeart = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('Copied', 'Affirmation copied to clipboard.', 'success');
  };

  const handleAddAffirmationToCanvas = async (item: AffirmationItem) => {
    await addVisionNode({
      type: 'quote',
      title: 'Affirmation',
      content: item.quote,
      quoteAuthor: item.author,
      accentColor: '#f472b6',
      cornerRadius: 24,
      hasShadow: true,
      position: { x: 340, y: 240 },
    });
    addToast('Plant Complete', 'Affirmation card added to active canvas.', 'success');
  };

  const handleCreateCustomAffirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuote.trim()) return;

    const newItem: AffirmationItem = {
      id: crypto.randomUUID(),
      quote: customQuote.trim(),
      author: customAuthor.trim() || 'Self',
      category: 'Mindset',
    };

    setCustomAffirmations([newItem, ...customAffirmations]);
    setCustomQuote('');
    setCustomAuthor('');
    setIsCreatingCustom(false);
    setActiveAffirmationIndex(0);
    addToast('Created', 'New affirmation added to your library.', 'success');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs xl:hidden"
          aria-hidden="true"
        />
      )}

      {/* Right Sidebar Container */}
      <aside
        className={`fixed xl:static top-0 bottom-0 right-0 z-50 xl:z-20 w-[310px] sm:w-[340px] bg-surface/95 xl:bg-surface/60 backdrop-blur-xl border-l border-border flex flex-col justify-between p-4 sm:p-5 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto custom-scrollbar shadow-2xl xl:shadow-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-full xl:w-0 xl:p-0 xl:border-l-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <IconSparkles size={17} />
              </div>
              <div>
                <span className="text-[13px] font-black uppercase tracking-wider text-text-primary block leading-tight">
                  Affirmations
                </span>
                <span className="text-[10.5px] font-medium text-text-tertiary">
                  Daily Mindset &amp; Focus
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-surface-alt hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center xl:hidden cursor-pointer"
              aria-label="Close panel"
            >
              <IconX size={18} />
            </button>
          </div>

          {/* ── HERO ACTIVE AFFIRMATION CARD ── */}
          {activeAffirmation && (
            <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-rose-200/50 via-purple-200/40 to-blue-200/50 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-border/80 shadow-sm flex flex-col justify-between min-h-[220px]">
              {/* Card Header Actions */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-surface/80 text-text-primary border border-border/60">
                  {activeAffirmation.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="w-8 h-8 rounded-full bg-surface/80 hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center transition-transform hover:rotate-180 cursor-pointer shadow-xs"
                    title="Next Affirmation"
                  >
                    <IconRefresh size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleHeart(activeAffirmation.id)}
                    className="w-8 h-8 rounded-full bg-surface/80 hover:bg-surface text-text-secondary flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                    title="Favorite"
                  >
                    {likedMap[activeAffirmation.id] ? (
                      <IconHeartFilled size={16} className="text-rose-500" />
                    ) : (
                      <IconHeart size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Quote Typography */}
              <div className="my-auto py-2">
                <span className="text-3xl font-serif text-primary leading-none block mb-1">
                  &ldquo;
                </span>
                <p className="text-[14.5px] sm:text-[15.5px] font-bold text-text-primary leading-relaxed">
                  {activeAffirmation.quote}
                </p>
                <span className="text-[11.5px] font-semibold text-text-tertiary block mt-2 italic">
                  — {activeAffirmation.author}
                </span>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
                <button
                  type="button"
                  onClick={() => handleCopy(activeAffirmation.quote, activeAffirmation.id)}
                  className="flex items-center gap-1 text-[11.5px] font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {copiedId === activeAffirmation.id ? (
                    <>
                      <IconCheck size={14} className="text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <IconCopy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleAddAffirmationToCanvas(activeAffirmation)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface/90 hover:bg-surface text-text-primary text-[11.5px] font-bold border border-border shadow-xs cursor-pointer transition-all hover:scale-105"
                >
                  <IconPlus size={13} />
                  <span>Pin to Board</span>
                </button>
              </div>
            </div>
          )}

          {/* ── CATEGORY FILTER CHIPS ── */}
          <div>
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Library
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingCustom((p) => !p)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={13} />
                <span>Custom</span>
              </button>
            </div>

            {/* Custom Affirmation Form */}
            {isCreatingCustom && (
              <form onSubmit={handleCreateCustomAffirmation} className="p-3.5 mb-3 rounded-2xl bg-surface-alt border border-border space-y-2.5 animate-in fade-in duration-200">
                <input
                  type="text"
                  required
                  value={customQuote}
                  onChange={(e) => setCustomQuote(e.target.value)}
                  placeholder="Write your positive affirmation..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-[12.5px] text-text-primary focus:outline-none focus:border-primary"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    placeholder="Author (e.g. Self)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-surface border border-border text-[11.5px] text-text-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-text-primary text-text-on-accent text-[11.5px] font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 mb-3">
              {(['All', 'Mindset', 'Confidence', 'Peace', 'Growth', 'Focus'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveAffirmationIndex(0);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-text-primary text-text-on-accent shadow-xs'
                      : 'bg-surface-alt hover:bg-surface text-text-secondary border border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Affirmations */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {filteredAffirmations.map((item, idx) => {
                const isActive = activeAffirmation.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveAffirmationIndex(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-surface border-primary/40 shadow-xs ring-1 ring-primary/20'
                        : 'bg-surface-alt/50 hover:bg-surface-alt border-border/70 text-text-secondary'
                    }`}
                  >
                    <p className="text-[12.5px] font-bold text-text-primary line-clamp-2 leading-snug">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10.5px] text-text-tertiary">
                      <span>— {item.author}</span>
                      <span className="font-semibold">{item.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── BOTTOM THEME & GRID SWITCHER ── */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-surface text-amber-500 shadow-xs'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              title="Light Theme"
            >
              <IconSun size={17} />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-surface text-blue-400 shadow-xs'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              title="Dark Theme"
            >
              <IconMoon size={17} />
            </button>
          </div>

          {/* Quick Grid Toggle */}
          <button
            type="button"
            onClick={() => {
              const next =
                canvasTheme === 'dots' ? 'grid' : canvasTheme === 'grid' ? 'blank' : 'dots';
              setCanvasTheme(next);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-surface-alt hover:bg-surface border border-border text-[11.5px] font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer min-h-[40px]"
            title={`Canvas Grid: ${canvasTheme}`}
          >
            <IconGridDots size={16} />
            <span className="capitalize">{canvasTheme}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
