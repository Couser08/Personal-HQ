import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from '@tabler/icons-react';
import { EmptyState } from '../../../components/ui/EmptyState';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  revisionCount?: number;
  lastReviewed?: string;
  nextReview?: string;
}

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  currentFlashcardIndex: number;
  setCurrentFlashcardIndex: (val: number | ((prev: number) => number)) => void;
  flashcardFlipped: boolean;
  setFlashcardFlipped: (val: boolean | ((prev: boolean) => boolean)) => void;
  handleRateFlashcard: (rating: 'easy' | 'medium' | 'hard') => void;
  setFlashcardModal: (val: { open: boolean; front: string; back: string }) => void;
}

export function FlashcardStudy({
  flashcards,
  currentFlashcardIndex,
  setCurrentFlashcardIndex,
  flashcardFlipped,
  setFlashcardFlipped,
  handleRateFlashcard,
  setFlashcardModal,
}: FlashcardStudyProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable'))
      ) {
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        setFlashcardFlipped((prev) => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFlashcardFlipped(false);
        setCurrentFlashcardIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFlashcardFlipped(false);
        setCurrentFlashcardIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
      } else if (flashcardFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRateFlashcard('easy');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRateFlashcard('medium');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRateFlashcard('hard');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards, flashcardFlipped, currentFlashcardIndex, handleRateFlashcard, setCurrentFlashcardIndex, setFlashcardFlipped]);

  if (!flashcards?.length) {
    return (
      <EmptyState
        icon={<IconRefresh className="w-8 h-8 text-text-muted" />}
        title="Flashcards vault empty"
        description="Leverage flashcards for active recall and spaced repetition memory enhancement."
        action={
          <button
            onClick={() => setFlashcardModal({ open: true, front: '', back: '' })}
            className="btn btn-primary btn-md"
          >
            Create First Card
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      {/* Progress Indicator */}
      <div className="w-full space-y-1.5 text-left">
        <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary tracking-wide">
          <span>PROGRESS</span>
          <span>
            Card {currentFlashcardIndex + 1} of {flashcards.length}
          </span>
        </div>
        <div className="w-full bg-border-alt h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.round(((currentFlashcardIndex + 1) / flashcards.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full justify-center">
        {/* Card Container (3D Flip Effect - Vertical & Minimal) */}
        <div
          onClick={() => setFlashcardFlipped(!flashcardFlipped)}
          style={{ perspective: 1200 }}
          className="w-[320px] h-[430px] sm:w-[360px] sm:h-[480px] cursor-pointer relative select-none"
        >
          <motion.div
            animate={{ rotateY: flashcardFlipped ? 180 : 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-full h-full relative"
          >
            {/* Front Side */}
            <div
              style={{ backfaceVisibility: 'hidden' }}
              className="absolute inset-0 bg-surface border border-border rounded-[28px] p-8 flex flex-col items-center justify-between text-center shadow-lg overflow-hidden transition-colors"
            >
              <span className="px-3.5 py-1 text-[10px] font-black text-text-secondary bg-surface-alt border border-border/50 rounded-full uppercase tracking-widest">
                Question
              </span>
              <p className="text-2xl font-bold text-text-primary max-w-xs leading-relaxed px-2 my-auto">
                {flashcards[currentFlashcardIndex]?.front}
              </p>
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Tap to flip</span>
            </div>

            {/* Back Side */}
            <div
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              className="absolute inset-0 bg-surface border border-border rounded-[28px] p-8 flex flex-col items-center justify-between text-center shadow-lg overflow-hidden transition-colors"
            >
              <span className="px-3.5 py-1 text-[10px] font-black text-text-secondary bg-surface-alt border border-border/50 rounded-full uppercase tracking-widest">
                Answer
              </span>
              <p className="text-lg font-semibold text-text-primary max-w-xs leading-relaxed px-2 overflow-y-auto max-h-[280px] my-auto scrollbar-thin">
                {flashcards[currentFlashcardIndex]?.back}
              </p>
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Tap to flip back</span>
            </div>
          </motion.div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-6 w-full justify-center mt-2">
          <button
            onClick={() => {
              setFlashcardFlipped(false);
              setCurrentFlashcardIndex((prev) => Math.max(prev - 1, 0));
            }}
            disabled={currentFlashcardIndex === 0}
            className="w-10 h-10 rounded-full border border-border hover:bg-surface-hover flex items-center justify-center text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent"
          >
            <IconChevronLeft className="w-5 h-5" />
          </button>

          {/* Dot Page Pills */}
          <div className="flex gap-1.5 items-center flex-wrap justify-center max-w-[150px]">
            {flashcards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFlashcardFlipped(false);
                  setCurrentFlashcardIndex(idx);
                }}
                className={`transition-all rounded-full h-1.5 cursor-pointer border-none bg-transparent ${
                  idx === currentFlashcardIndex ? 'w-4 bg-primary' : 'w-1.5 bg-border-alt hover:bg-text-secondary'
                }`}
                aria-label={`Go to flashcard ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              setFlashcardFlipped(false);
              setCurrentFlashcardIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
            }}
            disabled={currentFlashcardIndex === flashcards.length - 1}
            className="w-10 h-10 rounded-full border border-border hover:bg-surface-hover flex items-center justify-center text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent"
          >
            <IconChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Rating Actions */}
        {flashcardFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3.5 mt-2 w-full max-w-sm"
          >
            <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted">How well did you recall?</p>
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={() => handleRateFlashcard('easy')}
                className="flex-1 py-3 bg-surface border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10 font-semibold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Easy (4D)
              </button>
              <button
                onClick={() => handleRateFlashcard('medium')}
                className="flex-1 py-3 bg-surface border border-amber-500/30 hover:border-amber-500 hover:bg-amber-50 text-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/10 font-semibold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Medium (2D)
              </button>
              <button
                onClick={() => handleRateFlashcard('hard')}
                className="flex-1 py-3 bg-surface border border-rose-500/30 hover:border-rose-500 hover:bg-rose-55 text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 font-semibold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Hard (1D)
              </button>
            </div>
          </motion.div>
        )}
        {/* Keyboard Shortcuts Hint */}
        <div className="hidden sm:block text-[10px] text-text-muted font-black tracking-widest uppercase mt-4 text-center select-none bg-surface-alt/40 border border-border/40 px-4 py-2 rounded-full">
          Keyboard shortcuts: [Space] Flip • [← / →] Prev/Next • [1 / 2 / 3] Easy/Med/Hard
        </div>
      </div>
    </div>
  );
}
