import React from 'react';
import { IconSparkles, IconSettings } from '@tabler/icons-react';
import { type Book } from '../../../../store/types';

interface AiAssistantOverlayProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiOutput: string;
  isAiLoading: boolean;
  handleAiPrompt: () => void;
  handleApplyAiText: () => void;
  onClose: () => void;
}

export const AiAssistantOverlay: React.FC<AiAssistantOverlayProps> = ({
  aiPrompt,
  setAiPrompt,
  aiOutput,
  isAiLoading,
  handleAiPrompt,
  handleApplyAiText,
  onClose,
}) => {
  return (
    <div className="fixed bottom-24 left-10 w-80 bg-surface border border-border rounded-2xl shadow-high z-50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-xs font-black text-text-primary flex items-center gap-1.5">
          <IconSparkles size={14} className="text-rose-500" /> AI Notebook Assistant
        </span>
        <button onClick={onClose} className="text-xs cursor-pointer text-text-muted hover:text-text-primary">
          Close
        </button>
      </div>
      <textarea
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        placeholder="Ask AI to 'summarize' or 'improve structure' of this page..."
        className="w-full h-16 p-2 text-xs border resize-none bg-surface-alt border-border rounded-xl focus:outline-none focus:border-rose-500 text-text-primary"
      />
      <button
        onClick={handleAiPrompt}
        disabled={isAiLoading || !aiPrompt.trim()}
        className="flex items-center justify-center w-full gap-1 py-2 text-xs font-bold text-white transition-colors bg-rose-500 cursor-pointer hover:bg-rose-600 rounded-xl active:scale-[0.97] transition-transform duration-100"
      >
        {isAiLoading ? 'AI is thinking...' : 'Generate Suggestion'}
      </button>

      {aiOutput && (
        <div className="p-3 mt-1 space-y-2 border border-border bg-surface-alt rounded-xl">
          <div className="text-[10px] text-text-secondary leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap font-mono">
            {aiOutput}
          </div>
          <button
            onClick={handleApplyAiText}
            className="w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer active:scale-[0.97] transition-transform duration-100"
          >
            Apply to Page
          </button>
        </div>
      )}
    </div>
  );
};

interface NotebookSettingsOverlayProps {
  book: Book;
  updateBook: (id: string, updates: Partial<Book>) => void;
  onClose: () => void;
}

export const NotebookSettingsOverlay: React.FC<NotebookSettingsOverlayProps> = ({
  book,
  updateBook,
  onClose,
}) => {
  return (
    <div className="fixed bottom-24 left-10 w-72 bg-surface border border-border rounded-2xl shadow-high z-50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-xs font-black text-text-primary flex items-center gap-1.5">
          <IconSettings size={14} className="text-rose-500" /> Notebook Configurations
        </span>
        <button onClick={onClose} className="text-xs cursor-pointer text-text-muted hover:text-text-primary">
          Close
        </button>
      </div>

      <div className="space-y-3.5 text-xs text-text-primary">
        <div className="flex items-center justify-between">
          <span>Total Pages Limit</span>
          <span className="font-mono bg-surface-alt border border-border rounded px-2 py-0.5 font-bold">
            {book.pagesCount} pages
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Created At</span>
          <span className="font-bold text-text-secondary">
            {new Date(book.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1">
          <span>Adjust Page Count</span>
          <div className="flex items-center bg-surface-alt border border-border rounded-xl p-0.5">
            <button
              onClick={() => updateBook(book.id, { pagesCount: Math.max(5, (book.pagesCount || 5) - 5) })}
              className="px-2.5 py-1 hover:bg-surface rounded-lg cursor-pointer font-bold text-xs"
              title="Remove 5 pages"
            >
              -5
            </button>
            <span className="px-2 font-mono font-bold text-[10px]">{book.pagesCount || 5}</span>
            <button
              onClick={() => updateBook(book.id, { pagesCount: (book.pagesCount || 5) + 5 })}
              className="px-2.5 py-1 hover:bg-surface rounded-lg cursor-pointer font-bold text-xs"
              title="Add 5 pages"
            >
              +5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
