import { motion } from 'framer-motion';
import { 
  IconSparkles, IconChevronRight, IconCheck, 
  IconArrowRight, IconNotes, IconPlayerPlay, IconLoader2 
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AiChatMessage } from '../../../store/types';
import { CopyButton } from './CopyButton';
import { DynamicClarificationForm } from './DynamicClarificationForm';

interface AiMessageBubbleProps {
  msg: AiChatMessage;
  isGenerating: boolean;
  executionProgress: number;
  handleChatSubmit: (prompt: string) => void;
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
  handleExecuteInChatPlan,
  setActiveModule,
  onClose,
  addNote,
  addToast
}: AiMessageBubbleProps) => {
  return (
    <div className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-full`}>
      {msg.sender === 'ai' && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
          <IconSparkles size={14} className="text-white" stroke={2} />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end max-w-[72%]' : 'items-start max-w-[80%]'}`}>
        <div className={`relative group px-4 py-3 rounded-2xl text-xs leading-relaxed ${
          msg.sender === 'user'
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-surface-alt border border-border text-text-primary rounded-tl-none'
        }`}>
          {msg.sender === 'ai' ? (
            <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
            </div>
          ) : msg.text}
          {msg.sender === 'ai' && (
            <div className="absolute -top-2 -right-2 bg-surface border border-border rounded-lg shadow-sm">
              <CopyButton text={msg.text} />
            </div>
          )}
        </div>

        <span className="text-[10px] text-text-muted px-0.5">{msg.timestamp}</span>

        {/* ── Clarification Card ── */}
        {msg.resultCard?.type === 'clarification' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-primary/25 w-full max-w-xs shadow-sm">
            <DynamicClarificationForm fields={msg.resultCard.data} onSubmit={ans => handleChatSubmit(`Here is the requested information:\n${ans}`)} />
          </motion.div>
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
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border-l-2 border-l-primary border border-border w-full max-w-xs shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary truncate">{msg.resultCard.data.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${msg.resultCard.data.priority === 'high' ? 'bg-red-500/10 text-red-500' : msg.resultCard.data.priority === 'low' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {(msg.resultCard.data.priority || 'medium').toUpperCase()}
              </span>
            </div>
            {(msg.resultCard.data.subtasks || []).slice(0, 4).map((st: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-text-secondary">
                <div className="w-4 h-4 rounded border border-primary/40 flex items-center justify-center bg-primary/5 shrink-0">
                  <IconCheck size={10} className="text-primary" />
                </div>
                <span className="truncate">{typeof st === 'string' ? st : st.title}</span>
              </div>
            ))}
            {(msg.resultCard.data.subtasks || []).length > 4 && <span className="text-[10px] text-text-muted">+{(msg.resultCard.data.subtasks || []).length - 4} more subtasks</span>}
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setActiveModule('todo'); onClose(); }} className="w-full mt-1 py-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity">
              <IconArrowRight size={13} /> View in To-Do
            </motion.button>
          </motion.div>
        )}

        {/* ── Markdown Card ── */}
        {msg.resultCard?.type === 'markdown' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-border w-full max-w-xs shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <IconNotes size={14} className="text-primary" />
              <span className="text-xs font-bold text-text-primary truncate">{msg.resultCard.data.title}</span>
            </div>
            <pre className="text-[10px] text-text-muted bg-surface-alt rounded-lg p-2 overflow-hidden max-h-20 font-mono leading-relaxed border border-border">{msg.resultCard.data.content?.slice(0, 200)}...</pre>
            <motion.button whileTap={{ scale: 0.97 }} onClick={async () => { try { await addNote({ id: `note_${Date.now()}`, title: msg.resultCard.data.title, content: msg.resultCard.data.content, tags: ['ai'], pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); setActiveModule('markdown'); onClose(); } catch(e: any) { addToast('Error', e.message, 'error'); } }} className="w-full py-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity">
              <IconArrowRight size={13} /> Open in Markdown
            </motion.button>
          </motion.div>
        )}

        {/* ── Habit Card ── */}
        {msg.resultCard?.type === 'habit' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border-l-2 border-l-emerald-500 border border-border w-full max-w-xs shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="text-emerald-500 text-xs">⭐</span>
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
            <div className="flex items-center gap-1.5">
              {['Task', 'Subtasks', '.md', 'Habit'].map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">{i+1}</div>
                    <span className="text-[9px] text-text-muted mt-0.5 text-center">{step}</span>
                  </div>
                  {i < 3 && <div className="w-4 h-px bg-border mb-3" />}
                </div>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleExecuteInChatPlan(msg.id)} disabled={isGenerating} className="w-full py-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
              {isGenerating ? <><IconLoader2 size={13} className="animate-spin" /> Executing ({executionProgress}%)...</> : <><IconPlayerPlay size={13} /> Execute All Steps</>}
            </motion.button>
          </motion.div>
        )}

        {/* ── Multi-Step Completed ── */}
        {msg.resultCard?.type === 'multistep_completed' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-emerald-500/20 w-full max-w-xs shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1"><IconCheck size={12} /> Completed</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[{l:'Tasks', m:'todo'},{l:'.md File', m:'markdown'},{l:'Habit', m:'habits'},{l:'Dashboard', m:'dashboard'}].map(({l, m}) => (
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
