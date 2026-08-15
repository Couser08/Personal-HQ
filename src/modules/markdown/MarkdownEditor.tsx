import React from 'react';
import { 
  IconDownload, IconCopy, IconFileText, IconCheck, IconChevronRight, IconChevronLeft,
  IconBold, IconItalic, IconH1, IconH2, IconListCheck, IconQuote, IconTable,
  IconEye, IconMinimize
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
  isSaving?: boolean;
  isFocusMode?: boolean;
  setIsFocusMode?: (val: boolean) => void;
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
  isSaving = false,
  isFocusMode = false,
  setIsFocusMode,
}) => {

  const insertSyntax = (syntax: string, offset = 0) => {
    const textarea = document.getElementById('markdown-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    let replacement = syntax;
    if (selected) {
      if (syntax.startsWith('**') && syntax.endsWith('**')) {
        replacement = `**${selected}**`;
      } else if (syntax.startsWith('*') && syntax.endsWith('*')) {
        replacement = `*${selected}*`;
      } else if (syntax.startsWith('`') && syntax.endsWith('`')) {
        replacement = `\`${selected}\``;
      } else {
        replacement = syntax + selected;
      }
    }

    const newContent = before + replacement + after;
    
    // Trigger standard change handler
    const e = { target: { value: newContent } } as React.ChangeEvent<HTMLTextAreaElement>;
    handleTextareaChange(e);

    // Restore caret position and scroll position cleanly (Doherty Threshold / Flow fix)
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + replacement.length - offset;
      textarea.setSelectionRange(pos, pos);
      textarea.scrollTop = scrollTop;
    });
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  return (
    <section className={`flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all duration-300 min-w-0 flex-grow h-full ${
      isFocusMode ? 'max-w-4xl mx-auto w-full shadow-2xl' : 'flex-1'
    }`}>
      
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div className="flex items-center gap-3">
          {!isFocusMode && (
            <button
              onClick={() => setActiveDocId(null)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-sans"
            >
              ← Documents
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full relative shrink-0">
              {isSaving ? (
                <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" />
              ) : null}
              <span className={`absolute inset-0 rounded-full ${isSaving ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-primary font-sans flex items-center gap-2">
                <span>{isFocusMode ? 'Zen Focus Mode' : 'Markdown Writer'}</span>
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5 font-sans font-bold">
                {wordCount} words · {readingTime} min read · {isSaving ? 'Saving changes...' : 'Synced to DB'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Editor Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 border border-border bg-surface hover:bg-surface-hover rounded-xl text-xs font-bold text-text-secondary flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Copy Markdown Text"
          >
            {copied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 bg-primary hover:opacity-90 text-text-on-accent rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-subtle border-none"
            title="Download .md file"
          >
            <IconDownload size={14} />
            <span>Download</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 border border-border bg-surface hover:bg-surface-hover rounded-xl text-xs font-bold text-text-secondary flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download Rendered PDF"
          >
            <IconFileText size={14} />
            <span>PDF</span>
          </button>
          
          {/* Zen Focus Mode Toggle */}
          {setIsFocusMode && (
            <button
              onClick={() => {
                setIsFocusMode(!isFocusMode);
                if (!isFocusMode) setIsWorkspaceOpen(false); // Hide preview when going Zen
              }}
              className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                isFocusMode 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20' 
                  : 'border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary'
              }`}
              title={isFocusMode ? "Exit Zen Mode" : "Enter Zen Focus Mode"}
            >
              {isFocusMode ? <IconMinimize size={14} /> : <IconEye size={14} />}
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="px-3 py-2 border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary rounded-xl flex items-center justify-center cursor-pointer transition-all"
              title={isWorkspaceOpen ? "Hide Preview Pane" : "Show Preview Pane"}
            >
              {isWorkspaceOpen ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Document Title input */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-sans">Document Name</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full font-mono text-xs py-2 px-3.5 rounded-xl border border-border/80 bg-surface-alt text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="untitled.md"
        />
      </div>

      {/* Cute Format Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-surface-alt p-1.5 rounded-xl border border-border/50 select-none">
        <button onClick={() => insertSyntax('**Bold**', 2)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary border-none cursor-pointer" title="Bold"><IconBold size={15} /></button>
        <button onClick={() => insertSyntax('*Italic*', 1)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary border-none cursor-pointer" title="Italic"><IconItalic size={15} /></button>
        <button onClick={() => insertSyntax('# ', 0)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary border-none cursor-pointer" title="Heading 1"><IconH1 size={15} /></button>
        <button onClick={() => insertSyntax('## ', 0)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary border-none cursor-pointer" title="Heading 2"><IconH2 size={15} /></button>
        <button onClick={() => insertSyntax('- [ ] ', 0)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary border-none cursor-pointer" title="Checklist"><IconListCheck size={15} /></button>
        <button onClick={() => insertSyntax('\n> ', 0)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary border-none cursor-pointer" title="Blockquote"><IconQuote size={15} /></button>
        <button onClick={() => insertSyntax('\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n', 0)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary border-none cursor-pointer" title="Table"><IconTable size={15} /></button>
        <div className="h-4 w-px bg-border/80 mx-1" />
        <button onClick={() => insertSyntax('\n> [!NOTE]\n> ', 0)} className="text-[10px] font-black px-2 py-1 rounded-lg hover:bg-surface text-indigo-600 dark:text-indigo-400 border-none cursor-pointer" title="Note Alert">Alert Note</button>
        <button onClick={() => insertSyntax('\n> [!WARNING]\n> ', 0)} className="text-[10px] font-black px-2 py-1 rounded-lg hover:bg-surface text-amber-600 dark:text-amber-400 border-none cursor-pointer" title="Warning Alert">Alert Warning</button>
      </div>

      {/* Editor Textarea */}
      <div className="flex-grow flex flex-col min-h-0 relative text-left">
        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 font-sans">Markdown Content</label>
        <textarea
          id="markdown-editor-textarea"
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          className="w-full flex-grow bg-surface-alt text-text-primary border border-border/60 rounded-2xl p-4.5 focus:outline-none focus:border-primary font-mono text-sm leading-relaxed custom-scrollbar resize-none"
          placeholder="Start writing... Type / for block commands, or use the format toolbar above."
        />
        
        {/* Command Menu Popup */}
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
