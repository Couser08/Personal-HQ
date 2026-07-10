import React from 'react';
import { 
  IconDownload, IconCopy, IconFileText, IconCheck, IconChevronRight, IconChevronLeft 
} from '@tabler/icons-react';

interface SlashCommand {
  label: string;
  syntax: string;
  desc: string;
}

interface MarkdownEditorProps {
  title: string;
  handleTitleChange: (val: string) => void;
  content: string;
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleTextareaKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
  copied: boolean;
  handleCopy: () => void;
  handleDownload: () => void;
  handleExportPDF: () => void;
  isWorkspaceOpen: boolean;
  setIsWorkspaceOpen: (val: boolean) => void;
  setActiveDocId: (id: string | null) => void;
  slashMenu: { isOpen: boolean; triggerIndex: number; searchQuery: string };
  filteredCommands: SlashCommand[];
  activeCommandIndex: number;
  handleSelectSlashCommand: (syntax: string) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  title,
  handleTitleChange,
  content,
  handleTextareaChange,
  handleTextareaKeyDown,
  wordCount,
  copied,
  handleCopy,
  handleDownload,
  handleExportPDF,
  isWorkspaceOpen,
  setIsWorkspaceOpen,
  setActiveDocId,
  slashMenu,
  filteredCommands,
  activeCommandIndex,
  handleSelectSlashCommand,
}) => {
  return (
    <section className={`flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4.5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 min-w-0 flex-1 h-full`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveDocId(null)}
            className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-sans"
          >
            ← Back
          </button>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-text-primary font-sans">Markdown Editor</h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-sans">{wordCount} words · Synced to DB</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-md text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl flex items-center gap-1.5 cursor-pointer font-sans"
            title="Copy markdown text"
          >
            {copied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-primary btn-md text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl flex items-center gap-1.5 cursor-pointer font-sans"
            title="Download .md file"
          >
            <IconDownload size={14} />
            <span>Download</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            className="btn btn-secondary btn-md text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl flex items-center gap-1.5 cursor-pointer font-sans hover:text-primary transition-all"
            title="Download rendered PDF"
          >
            <IconFileText size={14} />
            <span>PDF</span>
          </button>
          
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="btn btn-secondary btn-md text-xs py-1.5 px-2 h-auto min-h-0 rounded-xl flex items-center justify-center cursor-pointer hover:text-primary transition-all font-sans"
            title={isWorkspaceOpen ? "Hide Preview Pane" : "Show Preview Pane"}
          >
            {isWorkspaceOpen ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-sans">Document Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="input-field w-full font-mono text-xs py-2 px-3.5 rounded-xl border-border bg-surface-alt"
          placeholder="untitled.md"
        />
      </div>

      <div className="flex-grow flex flex-col min-h-0 relative">
        <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5 font-sans">Markdown Source</label>
        <textarea
          id="markdown-editor-textarea"
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          className="w-full flex-grow bg-surface-alt text-text-primary border border-border/60 rounded-2xl p-4 focus:outline-none focus:border-primary font-mono text-sm leading-relaxed custom-scrollbar resize-none"
          placeholder="Type / for commands..."
        />
        
        {slashMenu.isOpen && filteredCommands.length > 0 && (
          <div className="absolute z-55 left-4 bottom-6 w-64 bg-surface border border-border rounded-2xl shadow-xl p-2 flex flex-col gap-1 max-h-56 overflow-y-auto custom-scrollbar font-sans select-none">
            <div className="text-[9px] font-black tracking-widest text-text-muted px-2.5 py-1.5 uppercase border-b border-border/40 mb-1">
              Basic Blocks
            </div>
            {filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.label}
                id={`slash-cmd-item-${idx}`}
                onClick={() => handleSelectSlashCommand(cmd.syntax)}
                className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer w-full ${
                  idx === activeCommandIndex ? 'bg-primary/10 text-primary' : 'hover:bg-surface-alt text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="text-xs font-bold">{cmd.label}</span>
                <span className="text-[9px] opacity-80 mt-0.5">{cmd.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
