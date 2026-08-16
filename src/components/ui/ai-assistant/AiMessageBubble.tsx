import { motion } from 'framer-motion';
import {
  IconSparkles, IconChevronRight, IconArrowRight, IconNotes
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AiChatMessage } from '../../../store/types';
import { CopyButton } from './CopyButton';
import { AiToolBadge } from './AiToolBadge';

interface AiMessageBubbleProps {
  msg: AiChatMessage;
  isGenerating: boolean;
  executionProgress: number;
  handleChatSubmit: (prompt: string) => void;
  handleClarificationSubmit?: (
    msg: AiChatMessage,
    answers: Record<string, string | string[]>,
    summary: string
  ) => void;
  handleExecuteInChatPlan?: (msgId: string) => void;
  setActiveModule: (module: string) => void;
  onClose: () => void;
  addNote: (note: any) => Promise<void>;
  addToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AiMessageBubble = ({
  msg,
  handleChatSubmit,
  setActiveModule,
  onClose,
  addNote,
  addToast
}: AiMessageBubbleProps) => {
  return (
    <div className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-full`}>
      {msg.sender === 'ai' && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0 mt-0.5">
          <IconSparkles size={14} className="text-white" stroke={2.2} />
        </div>
      )}

      <div className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end max-w-[78%]' : 'items-start max-w-[85%]'}`}>
        
        {/* ── Tool Execution Badges ── */}
        {msg.executedTools && msg.executedTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-0.5">
            {msg.executedTools.map((tool) => (
              <AiToolBadge
                key={tool.stepId}
                step={tool}
                onNavigateToModule={(mod) => {
                  setActiveModule(mod);
                  onClose();
                }}
              />
            ))}
          </div>
        )}

        {/* ── Main Message Bubble ── */}
        <div className={`relative group px-4 py-3 rounded-2xl text-xs leading-relaxed ${
          msg.sender === 'user'
            ? 'bg-primary text-text-on-accent rounded-tr-none shadow-sm'
            : 'bg-surface-alt border border-border text-text-primary rounded-tl-none shadow-sm'
        }`}>
          {msg.sender === 'ai' ? (
            <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed space-y-2 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:pl-4 [&_ol]:my-1.5 [&_ol]:pl-4 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_h4]:text-xs [&_pre]:my-2 [&_pre]:p-2.5 [&_pre]:rounded-lg [&_pre]:bg-surface [&_code]:font-mono [&_code]:text-[11px] [&_code]:bg-surface/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_strong]:text-text-primary [&_a]:text-primary [&_table]:text-[11px] [&_table]:border [&_table]:border-border [&_th]:p-1.5 [&_td]:p-1.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{msg.text}</span>
          )}

          {msg.sender === 'ai' && (
            <div className="absolute -top-2 -right-2 bg-surface border border-border rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={msg.text} />
            </div>
          )}
        </div>

        {/* ── Timestamp ── */}
        <span className="text-[10px] text-text-muted px-0.5">{msg.timestamp}</span>

        {/* ── Interactive Task Selection Card (Breakdown flow) ── */}
        {msg.resultCard?.type === 'task_select' && Array.isArray(msg.resultCard.tasks) && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-3.5 rounded-xl bg-surface border border-border w-full max-w-sm shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Select Task to Break Down:</span>
            <div className="flex flex-col gap-1.5">
              {msg.resultCard.tasks.slice(0, 5).map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => handleChatSubmit(`Break down task "${t.title}" (ID: ${t.id})`)}
                  className="px-3 py-2 rounded-lg bg-surface-alt hover:bg-surface-hover border border-border text-left text-xs font-semibold text-text-primary flex items-center justify-between cursor-pointer group transition-all"
                >
                  <span className="truncate">{t.title}</span>
                  <IconChevronRight size={12} className="text-text-muted group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Markdown Document Preview Card ── */}
        {msg.resultCard?.type === 'markdown' && msg.resultCard.data && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-4 rounded-xl bg-surface border border-border w-full max-w-md shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconNotes size={15} className="text-primary" />
                <span className="text-xs font-bold text-text-primary">{msg.resultCard.data.title}</span>
              </div>
              <button
                onClick={async () => {
                  await addNote({
                    id: `note_${Date.now()}`,
                    title: msg.resultCard.data.title,
                    content: msg.resultCard.data.content,
                    tags: ['ai-draft'],
                    pinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                  addToast('Saved', `Document saved to Notes`, 'success');
                }}
                className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-text-on-accent text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Save to Notes</span>
                <IconArrowRight size={11} />
              </button>
            </div>
            <div className="p-3 rounded-lg bg-surface-alt border border-border max-h-40 overflow-y-auto text-[11px] font-mono text-text-secondary custom-scrollbar">
              <pre className="whitespace-pre-wrap">{msg.resultCard.data.content}</pre>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
