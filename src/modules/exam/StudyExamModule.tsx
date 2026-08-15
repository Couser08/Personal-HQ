import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { type StudyMaterial, type Exam, type ExamAttempt, type ExamQuestion } from '../../store/types';
import { parseStudyMaterial, generateExamPaper, gradeExamAttempt } from '../../lib/gemini-exam';
import {
  IconBrain, IconPlus, IconFileText, IconCheck,
  IconX, IconArrowLeft, IconTarget, IconStar, IconBook, IconLoader2,
  IconTrophy, IconPlayerPlay, IconInfoCircle
} from '@tabler/icons-react';

import { ReadMaterial } from './components/ReadMaterial';
import { StudyMaterialFlashcards } from './components/StudyMaterialFlashcards';

export default function StudyExamModule() {
  const [view, setView] = useState<'library' | 'ingest' | 'generate' | 'active' | 'report' | 'read' | 'flashcards'>(() => {
    return localStorage.getItem('pendingExamTitle') ? 'ingest' : 'library';
  });
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);

  const { studyMaterials, addStudyMaterial, deleteStudyMaterial, addExam, exams, examAttempts, addExamAttempt, settings } = useAppStore();
  const apiKey = settings?.geminiApiKey;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <AnimatePresence mode="wait">
            {view === 'library' && (
              <MaterialLibrary
                key="library"
                materials={studyMaterials}
                exams={exams}
                attempts={examAttempts}
                onAdd={() => setView('ingest')}
                onRead={(mat: StudyMaterial) => {
                  setSelectedMaterial(mat);
                  setView('read');
                }}
                onFlashcards={(mat: StudyMaterial) => {
                  setSelectedMaterial(mat);
                  setView('flashcards');
                }}
                onSelect={(mat: StudyMaterial) => {
                  setSelectedMaterial(mat);
                  setView('generate');
                }}
                onDelete={deleteStudyMaterial}
              />
            )}
            
            {view === 'read' && selectedMaterial && (
              <ReadMaterial 
                key="read" 
                material={selectedMaterial} 
                onStudyFlashcards={() => setView('flashcards')}
                onBack={() => setView('library')} 
              />
            )}

            {view === 'flashcards' && selectedMaterial && (
              <StudyMaterialFlashcards 
                key="flashcards" 
                material={selectedMaterial} 
                onBack={() => setView('read')} 
              />
            )}
            
            {view === 'ingest' && (
              <IngestMaterial
                key="ingest"
                apiKey={apiKey}
                onBack={() => setView('library')}
                onSuccess={(mat: StudyMaterial) => {
                  addStudyMaterial(mat);
                  setView('library');
                }}
              />
            )}

            {view === 'generate' && selectedMaterial && (
              <ExamGenerator
                key="generate"
                apiKey={apiKey}
                material={selectedMaterial}
                onBack={() => setView('library')}
                onStart={(exam: Exam) => {
                  addExam(exam);
                  setActiveExam(exam);
                  setView('active');
                }}
              />
            )}

            {view === 'active' && activeExam && selectedMaterial && (
              <ActiveExam
                key="active"
                apiKey={apiKey}
                exam={activeExam}
                material={selectedMaterial}
                onBack={() => setView('generate')}
                onComplete={(attempt: ExamAttempt) => {
                  addExamAttempt(attempt);
                  setActiveAttempt(attempt);
                  setView('report');
                }}
              />
            )}

            {view === 'report' && activeAttempt && activeExam && (
              <GradingReport
                key="report"
                attempt={activeAttempt}
                exam={activeExam}
                onDone={() => setView('library')}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

function MaterialLibrary({ materials, exams, onAdd, onRead, onFlashcards, onSelect, onDelete }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary flex items-center gap-3">
            <IconBrain size={32} className="text-primary" />
            AI Exam Prep
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Turn your study notes into challenging exams and get conceptually graded.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
        >
          <IconPlus size={18} /> Ingest Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-surface/50">
            <IconBook className="mx-auto text-text-secondary/50 mb-3" size={40} />
            <h3 className="text-lg font-bold text-text-secondary mb-1">No Study Materials</h3>
            <p className="text-sm text-text-tertiary max-w-sm mx-auto mb-4">
              Upload or paste your notes, textbook chapters, or PDFs to generate exams.
            </p>
            <button onClick={onAdd} className="bg-surface border border-primary/20 text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-colors">
              Add Material
            </button>
          </div>
        ) : (
          materials.map((m: StudyMaterial) => {
            const materialExams = exams.filter((e: Exam) => e.materialId === m.id);
            const hasFlashcards = m.flashcards && m.flashcards.length > 0;
            return (
              <div key={m.id} className="bg-surface rounded-2xl border border-border p-5 hover:border-primary/50 transition-colors shadow-sm flex flex-col">
                <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => onRead(m)}>
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <IconFileText size={22} className="text-primary" />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(m.id); }} className="text-text-tertiary hover:text-red-500 p-1">
                    <IconX size={16} />
                  </button>
                </div>
                <h3 className="font-bold text-text-primary text-lg mb-1 line-clamp-1 cursor-pointer" onClick={() => onRead(m)}>{m.title}</h3>
                <p className="text-xs text-text-secondary mb-4 line-clamp-2 cursor-pointer" onClick={() => onRead(m)}>
                  {((m.structuredData as any[]) || []).length} Units • {((m.structuredData as any[]) || []).reduce((acc: number, u: any) => acc + (u.topics?.length || 0), 0)} Topics
                </p>
                <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                    <span>{materialExams.length} Exams Gen.</span>
                    {hasFlashcards && <span className="text-primary">{m.flashcards?.length} Flashcards</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onRead(m)} className="flex-1 bg-surface-alt hover:bg-surface border border-border rounded-xl py-2 text-xs font-bold transition-colors">Read</button>
                    <button onClick={() => onFlashcards(m)} className="flex-1 bg-surface-alt hover:bg-surface border border-border rounded-xl py-2 text-xs font-bold transition-colors">Cards</button>
                    <button onClick={() => onSelect(m)} className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl py-2 text-xs font-bold transition-colors">Exam</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function IngestMaterial({ apiKey, onBack, onSuccess }: any) {
  const addToast = useToastStore((s) => s.addToast);
  const [title, setTitle] = useState(() => localStorage.getItem('pendingExamTitle') || '');
  const [content, setContent] = useState(() => localStorage.getItem('pendingExamContent') || '');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    return () => {
      localStorage.removeItem('pendingExamTitle');
      localStorage.removeItem('pendingExamContent');
    };
  }, []);

  const handleIngest = async () => {
    if (!title.trim() || !content.trim()) return addToast('Error', 'Title and content required', 'error');
    if (!apiKey) return addToast('Error', 'Gemini API key missing', 'error');

    setIsParsing(true);
    try {
      const structuredData = await parseStudyMaterial(apiKey, content);
      onSuccess({
        id: `mat_${Date.now()}`,
        title,
        rawContent: content,
        structuredData,
        createdAt: new Date().toISOString()
      });
      addToast('Success', 'Material ingested losslessly!', 'success');
    } catch (err: any) {
      addToast('Ingest Failed', err.message, 'error');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 text-sm font-semibold transition-colors">
        <IconArrowLeft size={16} /> Back to Library
      </button>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-1">Ingest Study Material</h2>
        <p className="text-sm text-text-secondary mb-6">Paste your notes. AI will structure it losslessly without hallucinating.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Material Title</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. Systems Analysis Unit 1-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Raw Content (Markdown / Text)</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors h-64 resize-y"
              placeholder="Paste your raw notes here..."
            />
          </div>

          <button
            disabled={isParsing}
            onClick={handleIngest}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isParsing ? <IconLoader2 size={18} className="animate-spin" /> : <IconBrain size={18} />}
            {isParsing ? 'Structuring Losslessly...' : 'Ingest & Structure'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ExamGenerator({ apiKey, material, onBack, onStart }: any) {
  const addToast = useToastStore((s) => s.addToast);
  const [spec, setSpec] = useState('30 marks paper — 5 marks MCQ, 10 marks Unit 1 subjective, 15 marks Unit 2 subjective');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!spec.trim()) return;
    setIsGenerating(true);
    try {
      const examData = await generateExamPaper(apiKey, material.structuredData, spec);
      onStart({
        id: `exam_${Date.now()}`,
        materialId: material.id,
        title: examData.title,
        totalMarks: examData.totalMarks,
        specPrompt: spec,
        questions: examData.questions.map((q: any, i: number) => ({ ...q, id: `q_${Date.now()}_${i}` })),
        createdAt: new Date().toISOString()
      });
      addToast('Exam Ready', 'Strictly generated from source material.', 'success');
    } catch (err: any) {
      addToast('Generation Failed', err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 text-sm font-semibold transition-colors">
        <IconArrowLeft size={16} /> Back
      </button>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-1 line-clamp-1">{material.title}</h2>
        <p className="text-sm text-text-secondary">Provide an exam specification. The AI will strictly follow it and only use facts from this material.</p>
        
        <div className="mt-6">
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Exam Specification (Natural Language)</label>
          <textarea
            value={spec} onChange={(e) => setSpec(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors h-32"
          />
        </div>

        <button
          disabled={isGenerating}
          onClick={handleGenerate}
          className="mt-4 w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isGenerating ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlayerPlay size={18} />}
          {isGenerating ? 'Generating Zero-Hallucination Exam...' : 'Generate Exam Paper'}
        </button>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-500 text-sm">
        <IconInfoCircle size={20} className="shrink-0" />
        <p>The Exam will only contain questions whose answers exist exactly in the source material.</p>
      </div>
    </motion.div>
  );
}

function ActiveExam({ apiKey, exam, onBack, onComplete }: any) {
  const addToast = useToastStore((s) => s.addToast);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGrading, setIsGrading] = useState(false);

  const handleSubmit = async () => {
    setIsGrading(true);
    try {
      const report = await gradeExamAttempt(apiKey, exam.questions, answers);
      onComplete({
        id: `attempt_${Date.now()}`,
        examId: exam.id,
        answers,
        totalScore: report.totalScore,
        feedback: report.feedback,
        weaknessSummary: report.weaknessSummary,
        createdAt: new Date().toISOString()
      });
      addToast('Graded', 'AI has evaluated your concepts.', 'success');
    } catch (err: any) {
      addToast('Grading Failed', err.message, 'error');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-text-primary">{exam.title}</h2>
          <p className="text-sm text-text-secondary mt-1">Total Marks: {exam.totalMarks}</p>
        </div>
        <button onClick={onBack} disabled={isGrading} className="text-text-tertiary hover:text-text-primary p-2">
          <IconX size={24} />
        </button>
      </div>

      <div className="space-y-8 mb-12">
        {exam.questions.map((q: ExamQuestion, index: number) => (
          <div key={q.id} className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="bg-background/50 px-5 py-3 border-b border-border flex justify-between items-center">
              <span className="text-sm font-bold text-text-secondary">Question {index + 1}</span>
              <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-md">[{q.marks || 1} Marks]</span>
            </div>
            <div className="p-5">
              <p className="text-text-primary font-medium mb-4 whitespace-pre-wrap">{q.questionText || q.question || ''}</p>
              
              {(q.type === 'mcq' || q.options) && q.options ? (
                <div className="space-y-2">
                  {q.options.map((opt: string) => (
                    <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${answers[q.id] === opt ? 'border-primary bg-primary/5' : 'border-border hover:border-text-secondary'}`}>
                      <input
                        type="radio" name={q.id} value={opt}
                        checked={answers[q.id] === opt}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-4 h-4 text-primary bg-background border-border focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl p-4 text-sm min-h-[120px] focus:border-primary focus:outline-none resize-y"
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 bg-surface/80 backdrop-blur border border-border p-4 rounded-2xl shadow-xl flex justify-between items-center">
        <div className="text-sm font-bold text-text-secondary">
          {Object.keys(answers).length} / {exam.questions.length} Answered
        </div>
        <button
          disabled={isGrading}
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
        >
          {isGrading ? <IconLoader2 size={18} className="animate-spin" /> : <IconCheck size={18} />}
          {isGrading ? 'AI is Grading...' : 'Submit Paper'}
        </button>
      </div>
    </motion.div>
  );
}

function GradingReport({ attempt, exam, onDone }: any) {
  const percentage = Math.round((attempt.totalScore / exam.totalMarks) * 100);
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-8">
      
      <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 text-center relative overflow-hidden">
        <IconTrophy size={80} className="mx-auto text-primary opacity-20 absolute -right-4 -bottom-4" />
        <h2 className="text-3xl font-black text-text-primary mb-2">Grading Complete</h2>
        <div className="text-6xl font-black text-primary mb-4">{attempt.totalScore} <span className="text-2xl text-text-tertiary">/ {exam.totalMarks}</span></div>
        <div className="inline-flex items-center gap-2 bg-background px-4 py-1.5 rounded-full border border-border text-sm font-bold">
          <IconStar size={16} className="text-yellow-500" /> {percentage}% Conceptual Match
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-2">
          <IconTarget size={20} /> Weakness & Improvement
        </h3>
        <p className="text-sm text-text-primary leading-relaxed">{attempt.weaknessSummary}</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-text-primary border-b border-border pb-2">Detailed Feedback</h3>
        {attempt.feedback.map((fb: any, idx: number) => {
          const q = exam.questions.find((x: any) => x.id === fb.questionId);
          if (!q) return null;
          
          return (
            <div key={fb.questionId} className={`rounded-2xl border p-5 ${fb.isCorrect ? 'bg-green-500/5 border-green-500/20' : fb.marksGiven > 0 ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-bold text-text-secondary">Q{idx + 1}. {q.type === 'mcq' ? 'MCQ' : 'Subjective'}</span>
                <span className={`text-sm font-black px-2 py-1 rounded ${fb.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-surface border border-border'}`}>
                  {fb.marksGiven} / {q.marks}
                </span>
              </div>
              <p className="text-sm font-medium text-text-primary mb-3">{q.questionText}</p>
              
              <div className="bg-background rounded-xl p-3 text-xs mb-4 border border-border">
                <span className="font-bold text-text-secondary mb-1 block">Your Answer:</span>
                <span className="text-text-primary">{attempt.answers[q.id] || '(No Answer)'}</span>
              </div>

              {fb.missingPoints && fb.missingPoints.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-bold text-yellow-500 uppercase">Missing Points:</span>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    {fb.missingPoints.map((mp: string, i: number) => <li key={i} className="text-xs text-text-secondary">{mp}</li>)}
                  </ul>
                </div>
              )}
              
              {fb.wrongPoints && fb.wrongPoints.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-bold text-red-500 uppercase">Incorrect Concepts:</span>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    {fb.wrongPoints.map((wp: string, i: number) => <li key={i} className="text-xs text-text-secondary">{wp}</li>)}
                  </ul>
                </div>
              )}

              <div className="mt-3 text-xs text-text-secondary leading-relaxed p-3 bg-surface rounded-lg border border-border border-l-2 border-l-primary">
                <span className="font-bold block mb-1">AI Explanation:</span>
                {fb.explanation}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onDone} className="w-full bg-surface hover:bg-background border border-border py-4 rounded-xl font-bold transition-colors">
        Back to Library
      </button>

    </motion.div>
  );
}
