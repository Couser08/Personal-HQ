import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconArrowLeft, IconWand, IconLoader2 } from '@tabler/icons-react';
import { type StudyMaterial, type ExamFlashcard } from '../../../store/types';
import { useAppStore } from '../../../store/useAppStore';
import { useToastStore } from '../../../store/useToastStore';
import { generateFlashcardsFromUnit } from '../../../lib/gemini-exam';

interface Props {
  material: StudyMaterial;
  onBack: () => void;
}

export function StudyMaterialFlashcards({ material, onBack }: Props) {
  const { updateStudyMaterial, settings } = useAppStore();
  const addToast = useToastStore(s => s.addToast);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const flashcards = material.flashcards || [];

  const handleGenerate = async () => {
    if (!settings?.geminiApiKey) {
      addToast('Error', 'Gemini API key is required.', 'error');
      return;
    }
    
    setIsGenerating(true);
    try {
      let allCards: ExamFlashcard[] = [];
      // Generate unit by unit to control volume as requested
      for (const unit of material.structuredData) {
        const generated = await generateFlashcardsFromUnit(settings.geminiApiKey, unit);
        const mapped = generated.map((c, i) => ({
          id: `fc_${unit.id}_${Date.now()}_${i}`,
          unitId: unit.id,
          front: c.front,
          back: c.back
        }));
        allCards = [...allCards, ...mapped];
      }
      
      await updateStudyMaterial(material.id, { flashcards: allCards });
      addToast('Success', `Generated ${allCards.length} flashcards!`, 'success');
      setCurrentIdx(0);
      setIsFlipped(false);
    } catch (e: any) {
      addToast('Generation Failed', e.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flashcards.length === 0) return;
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIdx(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIdx(prev => Math.min(prev + 1, flashcards.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards.length]);

  const card = flashcards[currentIdx];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full w-full max-w-3xl mx-auto items-center">
      <div className="w-full flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors">
          <IconArrowLeft size={16} /> Back to Reading
        </button>
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{material.title}</span>
      </div>

      {flashcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 w-full bg-surface/50 border border-dashed border-border rounded-3xl mt-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <IconWand size={32} />
          </div>
          <h3 className="text-2xl font-black text-text-primary mb-2">No Flashcards Yet</h3>
          <p className="text-text-secondary max-w-sm mb-8 text-sm">
            Generate AI flashcards unit-by-unit based on your study material for rapid review.
          </p>
          <button 
            disabled={isGenerating}
            onClick={handleGenerate}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <><IconLoader2 size={20} className="animate-spin" /> Generating...</> : <><IconWand size={20} /> Generate AI Flashcards</>}
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full h-[500px] mt-4 relative">
          
          {/* Progress Strip */}
          <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-2">
            <span className="text-sm font-bold text-text-muted">Card {currentIdx + 1} of {flashcards.length}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Space to flip • Arrows to nav</span>
            </div>
          </div>
          <div className="absolute -top-6 left-0 right-0 h-1.5 bg-surface-alt rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / flashcards.length) * 100}%` }}
            />
          </div>

          <div 
            className="flex-1 w-full relative cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: "1500px" }}
          >
            <motion.div
              className="w-full h-full relative"
              style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* FRONT */}
              <div 
                className="absolute inset-0 bg-surface border border-border shadow-md rounded-3xl p-10 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <span className="absolute top-6 left-6 text-xs font-bold text-primary/50 uppercase tracking-widest">Question</span>
                <h3 className="text-2xl md:text-3xl font-black text-text-primary leading-tight">{card.front}</h3>
              </div>

              {/* BACK */}
              <div 
                className="absolute inset-0 bg-primary text-white shadow-xl shadow-primary/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-y-auto custom-scrollbar"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
              >
                <span className="absolute top-6 left-6 text-xs font-bold text-white/50 uppercase tracking-widest">Answer</span>
                <p className="text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap">{card.back}</p>
              </div>
            </motion.div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-8">
             <button 
                onClick={() => { setIsFlipped(false); setCurrentIdx(p => Math.max(p - 1, 0)); }}
                disabled={currentIdx === 0}
                className="w-14 h-14 bg-surface-alt hover:bg-surface border border-border rounded-full flex items-center justify-center text-text-secondary disabled:opacity-30 transition-colors"
             >
                <IconArrowLeft size={24} />
             </button>
             <button 
                onClick={() => { setIsFlipped(false); setCurrentIdx(p => Math.min(p + 1, flashcards.length - 1)); }}
                disabled={currentIdx === flashcards.length - 1}
                className="w-14 h-14 bg-surface-alt hover:bg-surface border border-border rounded-full flex items-center justify-center text-text-secondary disabled:opacity-30 transition-colors transform rotate-180"
             >
                <IconArrowLeft size={24} />
             </button>
          </div>
          
        </div>
      )}
    </motion.div>
  );
}
