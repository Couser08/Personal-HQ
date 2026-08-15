import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconArrowLeft, IconStar, IconFlame, IconMenu2, IconGridDots } from '@tabler/icons-react';
import { type StudyMaterial } from '../../../store/types';
import { StudyQuestionCard } from './StudyQuestionCard';

interface ReadMaterialProps {
  material: StudyMaterial;
  onBack: () => void;
  onStudyFlashcards: () => void;
}

export function ReadMaterial({ material, onBack, onStudyFlashcards }: ReadMaterialProps) {
  const [qnaFilter, setQnaFilter] = useState('all');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors">
          <IconArrowLeft size={16} /> Back to Library
        </button>
        <button onClick={onStudyFlashcards} className="bg-surface border border-border hover:border-primary text-text-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all hover:text-primary">
          Study Flashcards
        </button>
      </div>

      <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <h2 className="text-3xl font-black text-text-primary mb-2">{material.title}</h2>
        <p className="text-sm text-text-secondary mb-8">Review the extracted units, key concepts, and highly probable exam questions.</p>

        <div className="flex flex-col gap-10">
          {((material.structuredData as any[]) || []).map((unit: any, uIdx: number) => {
            const hasQna = unit.qna && unit.qna.length > 0;
            const highProb = unit.qna?.filter((q: any) => q.probability === 'high') || [];
            const medProb = unit.qna?.filter((q: any) => q.probability === 'medium') || [];
            const lowProb = unit.qna?.filter((q: any) => q.probability === 'low') || [];

            return (
              <div key={unit.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-4 border-b border-border pb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0">
                    {uIdx + 1}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">{unit.title}</h3>
                </div>
                
                {/* Topics / Key Points */}
                <div className="pl-12 flex flex-col gap-4 mb-4">
                  {(unit.topics || []).map((topic: any) => (
                    <div key={topic.id} className="bg-surface-alt/50 rounded-2xl p-4 border border-border/50">
                      <h4 className="font-bold text-text-primary mb-2">{topic.name}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(topic.keyPoints || []).map((kp: string, i: number) => (
                          <li key={i} className="text-sm text-text-secondary">{kp}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {hasQna && (
                  <div className="flex flex-col gap-6 mt-12">
                    {/* Premium Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <IconStar size={24} className="stroke-[1.5]" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-text-primary tracking-tight">Probable Questions</h2>
                          <p className="text-sm text-text-secondary mt-1">High probability questions curated for your exam preparation.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-surface border border-border rounded-xl px-4 py-2 cursor-pointer hover:border-primary/50 transition-colors">
                          <IconFlame size={16} className="text-primary mr-2" />
                          <select 
                            value={qnaFilter}
                            onChange={(e) => setQnaFilter(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-text-primary outline-none cursor-pointer"
                          >
                            <option value="all">All Probabilities</option>
                            <option value="high">High Probability</option>
                            <option value="medium">Medium Probability</option>
                            <option value="low">Low Probability</option>
                          </select>
                        </div>
                        <div className="flex items-center bg-surface border border-border rounded-xl p-1">
                          <button className="p-2 rounded-lg bg-primary/10 text-primary">
                            <IconMenu2 size={18} />
                          </button>
                          <button className="p-2 rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
                            <IconGridDots size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {[
                      { title: 'High Probability', items: highProb, id: 'high' },
                      { title: 'Medium Probability', items: medProb, id: 'medium' },
                      { title: 'Low Probability', items: lowProb, id: 'low' },
                    ].map(group => {
                      if (group.items.length === 0) return null;
                      if (qnaFilter !== 'all' && qnaFilter !== group.id) return null;
                      
                      return (
                        <div key={group.title} className="flex flex-col gap-1">
                          {group.items.map((qna: any, idx: number) => (
                            <StudyQuestionCard key={qna.id} qna={qna} index={idx} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
