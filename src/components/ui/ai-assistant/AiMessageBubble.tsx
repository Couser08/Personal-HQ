import { motion } from 'framer-motion';
import {
  IconSparkles, IconChevronRight, IconCheck,
  IconArrowRight, IconNotes, IconPlayerPlay, IconLoader2
} from '@tabler/icons-react';
import type { AiChatMessage } from '../../../store/types';
import { CopyButton } from './CopyButton';
import { DynamicClarificationForm } from './DynamicClarificationForm';
import { AiStructuredReply, plainPreviewFromMarkdown } from './AiStructuredReply';

interface AiMessageBubbleProps {
  msg: AiChatMessage;
  isGenerating: boolean;
  executionProgress: number;
  handleChatSubmit: (prompt: string) => void;
  handleClarificationSubmit: (
    msg: AiChatMessage,
    answers: Record<string, string | string[]>,
    summary: string
  ) => void;
  handleExecuteInChatPlan: (msgId: string) => void;
  setActiveModule: (module: string) => void;
  onClose: () => void;
  addNote: (note: any) => Promise<void>;
  addToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AiMessageBubble = ({
  msg,
  isGenerating,
  executionProgress,
  handleChatSubmit,
  handleClarificationSubmit,
  handleExecuteInChatPlan,
  setActiveModule,
  onClose,
  addNote,
  addToast
}: AiMessageBubbleProps) => {
  const copyText = msg.blocks?.length
    ? [msg.text, ...msg.blocks.map((b) => {
        if (b.type === 'heading' || b.type === 'paragraph' || b.type === 'callout') return b.text;
        if (b.type === 'bullets' || b.type === 'steps') return b.items.join('\n');
        return '';
      })].filter(Boolean).join('\n\n')
    : msg.text;

  return (
    <div className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-full`}>
      {msg.sender === 'ai' && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
          <IconSparkles size={14} className="text-white" stroke={2} />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 ${
        msg.sender === 'user'
          ? 'items-end max-w-[72%]'
          : msg.resultCard?.type === 'clarification'
            ? 'items-start w-full max-w-2xl'
            : 'items-start max-w-[80%]'
      }`}>
        <div className={`relative group px-4 py-3 rounded-2xl text-xs leading-relaxed ${
          msg.sender === 'user'
            ? 'bg-primary text-text-on-accent rounded-tr-none'
            : 'bg-surface-alt border border-border text-text-primary rounded-tl-none'
        }`}>
          {msg.sender === 'ai' ? (
            <AiStructuredReply text={msg.text} blocks={msg.blocks} />
          ) : (
            <span className="whitespace-pre-wrap">{msg.text}</span>
          )}
          {msg.sender === 'ai' && (
            <div className="absolute -top-2 -right-2 bg-surface border border-border rounded-lg shadow-sm">
              <CopyButton text={copyText} />
            </div>
          )}
        </div>

        <span className="text-[10px] text-text-muted px-0.5">{msg.timestamp}</span>

        {/* ── Clarification Card ── */}
        {msg.resultCard?.type === 'clarification' && !msg.resultCard?.submitted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 p-4 sm:p-5 rounded-xl bg-surface border border-primary/25 w-full max-w-2xl shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">
              Quick questions
            </p>
            <DynamicClarificationForm
              fields={msg.resultCard.data}
              disabled={isGenerating}
              onSubmit={(answers, summary) => handleClarificationSubmit(msg, answers, summary)}
            />
          </motion.div>
        )}

        {msg.resultCard?.type === 'clarification' && msg.resultCard?.submitted && (
          <div className="mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-[11px] text-text-muted w-full max-w-2xl">
            Answers submitted
          </div>
        )}

        {/* ── Task Select Card ── */}
        {msg.resultCard?.type === 'task_select' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-border w-full max-w-xs shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Select Task</span>
            {msg.resultCard.tasks.map((t: any) => (
              <motion.button key={t.id} whileTap={{ scale: 0.97 }} onClick={() => handleChatSubmit(`Break down task "${t.title}"`)} className="px-3 py-2 rounded-lg bg-surface-alt hover:bg-surface-hover border border-border text-left text-xs font-semibold text-text-primary flex items-center justify-between cursor-pointer group transition-all">
                <span className="truncate">{t.title}</span>
                <IconChevronRight size={12} className="text-text-muted group-hover:text-primary shrink-0" />
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── Task / Breakdown Card ── */}
        {msg.resultCard?.type === 'todo' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border-l-2 border-l-primary border border-border w-full max-w-sm shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-text-primary truncate">{msg.resultCard.data.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${msg.resultCard.data.priority === 'high' ? 'bg-red-500/10 text-red-500' : msg.resultCard.data.priority === 'low' ? 'bg-emerald-500/10 text-emerald-500' : msg.resultCard.data.priority === 'none' ? 'bg-surface-alt text-text-muted' : 'bg-amber-500/10 text-amber-500'}`}>
                {(msg.resultCard.data.priority || 'medium').toUpperCase()}
              </span>
            </div>
            {(msg.resultCard.data.startTime || msg.resultCard.data.endTime) && (
              <p className="text-[11px] text-text-secondary">
                {msg.resultCard.data.startTime || '??'} – {msg.resultCard.data.endTime || '??'}
              </p>
            )}
            {Array.isArray(msg.resultCard.data.tags) && msg.resultCard.data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {msg.resultCard.data.tags.map((tag: string) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-alt border border-border text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {(msg.resultCard.data.subtasks || []).length > 0 && (
              <>
                {(msg.resultCard.data.subtasks || []).slice(0, 4).map((st: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <div className="w-4 h-4 rounded border border-primary/40 flex items-center justify-center bg-primary/5 shrink-0">
                      <IconCheck size={10} className="text-primary" />
                    </div>
                    <span className="truncate">{typeof st === 'string' ? st : st.title}</span>
                  </div>
                ))}
                {(msg.resultCard.data.subtasks || []).length > 4 && (
                  <span className="text-[10px] text-text-muted">+{(msg.resultCard.data.subtasks || []).length - 4} more subtasks</span>
                )}
              </>
            )}
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setActiveModule('todo'); onClose(); }} className="w-full mt-1 py-2 rounded-lg bg-primary text-text-on-accent text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity">
              <IconArrowRight size={13} /> View in To-Do
            </motion.button>
          </motion.div>
        )}

        {/* ── Markdown Card (preview, not raw .md source) ── */}
        {msg.resultCard?.type === 'markdown' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-border w-full max-w-xs shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <IconNotes size={14} className="text-primary" />
              <span className="text-xs font-bold text-text-primary truncate">{msg.resultCard.data.title}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-text-secondary bg-surface-alt rounded-lg p-2.5 border border-border">
              {plainPreviewFromMarkdown(msg.resultCard.data.content || '', 180)}
            </p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={async () => { try { await addNote({ id: `note_${Date.now()}`, title: msg.resultCard.data.title, content: msg.resultCard.data.content, tags: ['ai'], pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); setActiveModule('markdown'); onClose(); } catch(e: any) { addToast('Error', e.message, 'error'); } }} className="w-full py-2 rounded-lg bg-primary text-text-on-accent text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity">
              <IconArrowRight size={13} /> Open in Markdown
            </motion.button>
          </motion.div>
        )}

        {/* ── Habit Card ── */}
        {msg.resultCard?.type === 'habit' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border-l-2 border-l-emerald-500 border border-border w-full max-w-xs shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                <IconCheck size={14} className="text-emerald-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-text-primary truncate">{msg.resultCard.data.name}</span>
                <span className="text-[10px] text-text-muted truncate">{msg.resultCard.data.description || 'New habit routine'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-medium mt-1">
              <span className="bg-surface-alt border border-border px-2 py-1 rounded-md text-text-secondary">
                {msg.resultCard.data.frequencyType === 'daily' ? 'Daily' : msg.resultCard.data.frequencyType === 'weekly_days' ? 'Specific Days' : `${msg.resultCard.data.frequencyCount}x a week`}
              </span>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setActiveModule('habits'); onClose(); }} className="w-full mt-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity">
              <IconArrowRight size={13} /> View in Habits
            </motion.button>
          </motion.div>
        )}

        {/* ── Multi-Step Plan Card ── */}
        {msg.resultCard?.type === 'multistep_plan' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-primary/20 w-full max-w-xs shadow-sm flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Multi-Step Plan</span>
              <p className="text-xs font-bold text-text-primary mt-0.5">{msg.resultCard.data.taskTitle}</p>
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-text-secondary">
              <div className="flex justify-between gap-2">
                <span>Subtasks</span>
                <span className="font-semibold text-text-primary">{msg.resultCard.data.subtasks?.length || 0}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Notes doc</span>
                <span className="font-semibold text-text-primary truncate max-w-[140px]">{msg.resultCard.data.markdownTitle}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Habit</span>
                <span className="font-semibold text-text-primary truncate max-w-[140px]">{msg.resultCard.data.habitName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {['Task', 'Subtasks', 'Notes', 'Habit'].map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">{i+1}</div>
                    <span className="text-[9px] text-text-muted mt-0.5 text-center">{step}</span>
                  </div>
                  {i < 3 && <div className="w-4 h-px bg-border mb-3" />}
                </div>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleExecuteInChatPlan(msg.id)} disabled={isGenerating} className="w-full py-2 rounded-lg bg-primary text-text-on-accent text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
              {isGenerating ? <><IconLoader2 size={13} className="animate-spin" /> Executing ({executionProgress}%)...</> : <><IconPlayerPlay size={13} /> Execute All Steps</>}
            </motion.button>
          </motion.div>
        )}

        {/* ── Multi-Step Completed ── */}
        {msg.resultCard?.type === 'multistep_completed' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-emerald-500/20 w-full max-w-xs shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1"><IconCheck size={12} /> Completed</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[{l:'Tasks', m:'todo'},{l:'Notes', m:'markdown'},{l:'Habit', m:'habits'},{l:'Dashboard', m:'dashboard'}].map(({l, m}) => (
                <motion.button key={m} whileTap={{ scale: 0.96 }} onClick={() => { setActiveModule(m); onClose(); }} className="p-2 rounded-lg bg-surface-alt border border-border text-left hover:border-primary/40 cursor-pointer transition-all">
                  <span className="text-[10px] text-text-muted block">{l}</span>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">View <IconChevronRight size={10} /></span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
