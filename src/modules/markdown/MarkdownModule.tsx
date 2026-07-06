import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconDownload, IconCopy, IconFileText, 
  IconEye, IconPencil, IconSitemap, IconCheck, IconPlus,
  IconChevronLeft, IconChevronRight
} from '@tabler/icons-react';
import "@excalidraw/excalidraw/index.css";

// Custom regex-based Markdown to HTML parser
const parseMarkdown = (md: string): string => {
  if (!md) return '<p class="text-text-muted italic">No content written yet. Select a template or write markdown to begin.</p>';
  
  // Escape HTML entities to prevent rendering conflicts
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // 1. Headers
  html = html.replace(/^###### (.*?)$/gm, '<h6 class="text-xs font-black text-text-primary uppercase tracking-wider mt-4 mb-2">$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5 class="text-sm font-extrabold text-text-primary mt-5 mb-2">$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-base font-black text-text-primary tracking-tight mt-6 mb-2">$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-black text-text-primary tracking-tight mt-7 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-black text-text-primary tracking-tight mt-8 mb-3 pb-1 border-b border-border/30">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-black text-text-primary tracking-tight mt-10 mb-4 pb-2 border-b border-border/50">$1</h1>');
  
  // 2. Alert boxes (GitHub style)
  html = html.replace(/^&gt;\s*\[!NOTE\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-blue-500/10 border-l-4 border-blue-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Note</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!TIP\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-emerald-500/10 border-l-4 border-emerald-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Tip</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!IMPORTANT\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-purple-500/10 border-l-4 border-purple-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">Important</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!WARNING\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">Warning</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!CAUTION\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-rose-500/10 border-l-4 border-rose-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">Caution</p>$1</div>');
  
  // Standard blockquotes
  html = html.replace(/^&gt;\s*(.*?)$/gm, '<blockquote class="border-l-4 border-border/80 pl-4 py-1 italic text-text-secondary my-4">$1</blockquote>');

  // 3. Fenced Code Blocks (``` lang ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    return `<pre class="bg-zinc-950 dark:bg-black/40 text-zinc-200 border border-border/30 rounded-2xl p-4 my-4 overflow-x-auto font-mono text-xs"><div class="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500 pb-2 mb-2 border-b border-zinc-800"><span>${lang || 'code'}</span></div><code>${code}</code></pre>`;
  });

  // 4. Horizontal lines (---)
  html = html.replace(/^---$/gm, '<hr class="my-6 border-border/40" />');

  // 5. Checklist items
  html = html.replace(/^- \[(x|X)\] (.*?)$/gm, '<div class="flex items-center gap-2 text-text-primary my-1.5"><input type="checkbox" checked disabled class="accent-primary rounded" /><span>$2</span></div>');
  html = html.replace(/^- \[\s\] (.*?)$/gm, '<div class="flex items-center gap-2 text-text-secondary my-1.5"><input type="checkbox" disabled class="rounded" /><span>$2</span></div>');

  // 6. Bullet points
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc pl-1 text-text-secondary my-1">$1</li>');

  // 7. Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.*?)__/g, '<u>$1</u>');

  // 8. Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-surface-alt text-primary font-mono text-[11px] px-1.5 py-0.5 rounded border border-border/40">$1</code>');

  // 9. Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold">$1</a>');

  // Parse double newline paragraph breaks
  const paragraphs = html.split(/\n{2,}/);
  const formatted = paragraphs.map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<pre') || trimmed.startsWith('<hr') || trimmed.startsWith('<div') || trimmed.startsWith('<li')) {
      return p;
    }
    return `<p class="my-3 text-sm leading-relaxed text-text-secondary">${p}</p>`;
  });
  
  return formatted.join('\n');
};

const TEMPLATES = {
  blank: `# Document Title\n\nStart writing here...`,
  
  dailyLog: `# Daily Project Log

> **Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  
> **Project:** Personal App  
> **Status:** [Active]  
> **Focus:** Features & UI Development  

---

## 🎯 Daily Objectives
*   [ ] Fix dark mode styling and theme properties.
*   [ ] Refactor drawing canvas helper to lock grounding elements.
*   [ ] Resize popup forms to take proper horizontal and vertical space.

---

## ⏱️ Activity Log

### 🌅 Morning Session (09:00 - 12:30)
- Set up state variables and custom toggle handlers.
- Checked element coordinates inside the main canvas workspace.

### ☀️ Afternoon Session (13:30 - 17:00)
- Tested local file uploader configurations.
- Verified compilation builds cleanly without strict TS errors.

---

## 🛠️ Technical Decisions
To ensure optimal performance, we implemented custom Base64 image caching directly inside user metadata.

---

## ⚠️ Blockers & Roadblocks

> [!WARNING]
> Ensure all unused packages or local imports are cleaned up before launching to prevent build checks from failing.

---

## 🎨 Diagram & Architecture
This diagram outlines the daily state transitions.

\`\`\`mermaid
graph TD
    A[Start] --> B[Daily Review]
    B --> C[Implementation]
    C --> D[Verification Check]
    D --> E[Finish]
\`\`\`

---

## 📅 Action Items for Tomorrow
*   [ ] Implement export functions for custom files.
`,

  roadmap: `# Project Roadmap: Version 1.0

## 📍 Overview
High-level timeline and feature list for the upcoming releases.

---

## 🗺️ Phases & Milestones

### Phase 1: Core System
*   [x] Database structure definitions.
*   [x] Sidebar module toggling.

### Phase 2: Whiteboard & Drawings
*   [ ] Support SVG and high-resolution PNG exports.
*   [ ] Grounding / Locking elements to prevent selections.

---

## 📊 Feature Progress Checklist
*   [x] Custom metadata saves.
*   [ ] Export to Markdown.
*   [ ] Mermaid rendering guide.
`,

  spec: `# RFC: Whiteboard Grounding Feature

**Author:** Dev Team  
**Status:** Proposal  

---

## 📖 Introduction
This document details the design specifications for adding element grounding to the drawing whiteboard module.

## 💡 Proposed Solution
Introduce element-specific locking properties to frozen background elements.

\`\`\`typescript
interface CanvasElement {
  id: string;
  type: string;
  locked: boolean; // Grounding property
}
\`\`\`
`
};

const SLASH_COMMANDS = [
  { label: 'Heading 1', syntax: '# ', desc: 'Large title heading' },
  { label: 'Heading 2', syntax: '## ', desc: 'Medium section heading' },
  { label: 'Heading 3', syntax: '### ', desc: 'Small subsection heading' },
  { label: 'Checklist Item', syntax: '- [ ] ', desc: 'To-do list item' },
  { label: 'Bullet List', syntax: '- ', desc: 'Simple bullet point' },
  { label: 'Code Block', syntax: '```javascript\n\n```', desc: 'Code block syntax' },
  { label: 'Alert Note', syntax: '> [!NOTE]\n> ', desc: 'Blue notice box' },
  { label: 'Alert Warning', syntax: '> [!WARNING]\n> ', desc: 'Yellow warning box' },
];

export default function MarkdownModule() {
  const { theme } = useAppStore(useShallow(state => ({ theme: state.theme })));
  
  // Resolve theme to light/dark
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme === 'dark' ? 'dark' : 'light';
  }, [theme]);

  const [title, setTitle] = useState('document.md');
  const [content, setContent] = useState(() => {
    return localStorage.getItem('phq_markdown_draft') || TEMPLATES.dailyLog;
  });
  
  const [activeTab, setActiveTab] = useState<'preview' | 'sketch' | 'mermaid'>('preview');
  const [copied, setCopied] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

  // Slash commands popup state
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    triggerIndex: number;
    searchQuery: string;
  }>({
    isOpen: false,
    triggerIndex: -1,
    searchQuery: '',
  });
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  // Autosave draft
  useEffect(() => {
    localStorage.setItem('phq_markdown_draft', content);
  }, [content]);

  // Scroll active slash command into view
  useEffect(() => {
    if (slashMenu.isOpen) {
      const activeEl = document.getElementById(`slash-cmd-item-${activeCommandIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeCommandIndex, slashMenu.isOpen]);

  // Load a template
  const handleLoadTemplate = (key: keyof typeof TEMPLATES) => {
    setContent(TEMPLATES[key]);
  };

  // Download markdown file
  const handleDownload = () => {
    const filename = title.endsWith('.md') ? title : `${title}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const filteredCommands = useMemo(() => {
    const q = slashMenu.searchQuery.toLowerCase();
    return SLASH_COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(q) || 
      cmd.desc.toLowerCase().includes(q)
    );
  }, [slashMenu.searchQuery]);

  const handleSelectSlashCommand = (syntax: string) => {
    if (slashMenu.triggerIndex === -1) return;
    
    const before = content.slice(0, slashMenu.triggerIndex);
    const after = content.slice(slashMenu.triggerIndex + 1);
    
    const newContent = before + syntax + after;
    setContent(newContent);
    setSlashMenu({ isOpen: false, triggerIndex: -1, searchQuery: '' });
    setActiveCommandIndex(0);
    
    setTimeout(() => {
      const textarea = document.getElementById('markdown-editor-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        const newCursorPos = slashMenu.triggerIndex + syntax.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, selectionStart);
    
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    if (lastSlashIndex !== -1 && (lastSlashIndex === 0 || textBeforeCursor[lastSlashIndex - 1] === ' ' || textBeforeCursor[lastSlashIndex - 1] === '\n')) {
      const query = textBeforeCursor.slice(lastSlashIndex + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        setSlashMenu({
          isOpen: true,
          triggerIndex: lastSlashIndex,
          searchQuery: query,
        });
        setActiveCommandIndex(0);
        return;
      }
    }
    
    setSlashMenu({ isOpen: false, triggerIndex: -1, searchQuery: '' });
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenu.isOpen && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown' || e.code === 'ArrowDown') {
        e.preventDefault();
        setActiveCommandIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp' || e.code === 'ArrowUp') {
        e.preventDefault();
        setActiveCommandIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' || e.code === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeCommandIndex]) {
          handleSelectSlashCommand(filteredCommands[activeCommandIndex].syntax);
        }
      } else if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        setSlashMenu({ isOpen: false, triggerIndex: -1, searchQuery: '' });
      }
    }
  };

  const parsedHtml = useMemo(() => parseMarkdown(content), [content]);
  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 p-2 relative text-left"
    >
      {/* Left Column: Markdown Editor Panel */}
      {isEditorOpen && (
        <section className={`flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4.5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 ${
          isWorkspaceOpen ? 'flex-1' : 'w-full h-full'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <IconFileText size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Markdown Editor</h3>
                <p className="text-[10px] text-text-muted mt-0.5">{wordCount} words · Autosaved draft</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => handleLoadTemplate(e.target.value as keyof typeof TEMPLATES)}
                className="select-field text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl"
                defaultValue="dailyLog"
              >
                <option value="blank">Load Blank</option>
                <option value="dailyLog">Load Daily Log (Apple UI)</option>
                <option value="roadmap">Load Roadmap</option>
                <option value="spec">Load Tech Spec</option>
              </select>
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-md text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl flex items-center gap-1.5"
                title="Copy markdown text"
              >
                {copied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-primary btn-md text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl flex items-center gap-1.5"
                title="Download .md file"
              >
                <IconDownload size={14} />
                <span>Download</span>
              </button>
              
              {/* Collapse/Expand Workspace Pane Toggle */}
              <button
                onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                className="btn btn-secondary btn-md text-xs py-1.5 px-2 h-auto min-h-0 rounded-xl flex items-center justify-center cursor-pointer hover:text-primary transition-all"
                title={isWorkspaceOpen ? "Hide Preview Pane" : "Show Preview Pane"}
              >
                {isWorkspaceOpen ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full font-mono text-xs py-2 px-3.5 rounded-xl border-border bg-surface-alt"
              placeholder="document.md"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0 relative">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Markdown Source</label>
            <textarea
              id="markdown-editor-textarea"
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaKeyDown}
              className="w-full flex-grow bg-surface-alt text-text-primary border border-border/60 rounded-2xl p-4 focus:outline-none focus:border-primary font-mono text-sm leading-relaxed custom-scrollbar resize-none"
              placeholder="Type / for commands..."
            />
            {/* Notion-style Slash Menu */}
            {slashMenu.isOpen && filteredCommands.length > 0 && (
              <div className="absolute z-50 left-4 bottom-6 w-64 bg-surface border border-border rounded-2xl shadow-xl p-2 flex flex-col gap-1 max-h-56 overflow-y-auto custom-scrollbar">
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
      )}

      {/* Right Column: Tabbed Preview & Whiteboard Workspace */}
      {isWorkspaceOpen && (
        <section className={`flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4.5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 ${
          isEditorOpen ? 'flex-1' : 'w-full h-full'
        }`}>
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex bg-surface-alt p-1 rounded-xl border border-border/50 shadow-sm shrink-0">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <IconEye size={14} />
                <span>Live Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('sketch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'sketch' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <IconPencil size={14} />
                <span>Whiteboard Sketch</span>
              </button>
              <button
                onClick={() => setActiveTab('mermaid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'mermaid' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <IconSitemap size={14} />
                <span>Pro Guide</span>
              </button>
            </div>

            {/* Collapse/Expand Editor Pane Toggle */}
            <button
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className="btn btn-secondary btn-md text-xs py-1.5 px-2 h-auto min-h-0 rounded-xl flex items-center justify-center cursor-pointer hover:text-primary transition-all ml-auto"
              title={isEditorOpen ? "Hide Editor Pane" : "Show Editor Pane"}
            >
              {isEditorOpen ? <IconChevronLeft size={14} /> : <IconChevronRight size={14} />}
            </button>
          </div>

          <div className="flex-grow min-h-0 relative overflow-hidden flex flex-col">
          {activeTab === 'preview' && (
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 bg-surface border border-border/40 rounded-2xl p-6 text-left">
              <article 
                className="max-w-none text-text-primary text-[14px]"
                dangerouslySetInnerHTML={{ __html: parsedHtml }}
              />
            </div>
          )}

          {activeTab === 'sketch' && (
            <div className="flex-1 w-full border border-border/60 rounded-2xl overflow-hidden relative min-h-[450px]">
              <Excalidraw 
                theme={resolvedTheme}
              />
            </div>
          )}

          {activeTab === 'mermaid' && (
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-4">
              {/* Markdown Pro Tips */}
              <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Markdown Pro Tips</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary leading-relaxed">
                  <div className="flex flex-col gap-1 bg-surface-alt p-3 rounded-xl border border-border/40">
                    <span className="font-bold text-text-primary">✨ Alerts & Callouts</span>
                    <p>Github-style alerts:</p>
                    <pre className="bg-black/10 p-1.5 rounded font-mono text-[9px]">
{`> [!NOTE]
> This is a callout box`}
                    </pre>
                  </div>
                  <div className="flex flex-col gap-1 bg-surface-alt p-3 rounded-xl border border-border/40">
                    <span className="font-bold text-text-primary">⚡ Slash Commands</span>
                    <p>Type <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold text-primary bg-surface">/</code> in the editor to quickly insert headers, lists, code blocks, or callouts.</p>
                  </div>
                  <div className="flex flex-col gap-1 bg-surface-alt p-3 rounded-xl border border-border/40">
                    <span className="font-bold text-text-primary">✓ Checklists</span>
                    <p>Track tasks easily:</p>
                    <pre className="bg-black/10 p-1.5 rounded font-mono text-[9px]">
{`- [ ] Task to do
- [x] Task completed`}
                    </pre>
                  </div>
                  <div className="flex flex-col gap-1 bg-surface-alt p-3 rounded-xl border border-border/40">
                    <span className="font-bold text-text-primary">📊 LaTeX Math</span>
                    <p>Render inline math with <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold text-primary bg-surface">$E=mc^2$</code> or block-level math using <code className="bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold text-primary bg-surface">$$...$$</code>.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Mermaid Code Diagrams</span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Use the following copyable templates in your markdown log to draw diagrams:
                </p>
              </div>

              {/* Template 1 */}
              <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">Flowchart Layout</span>
                  <button
                    onClick={() => setContent(prev => prev + `\n\n\`\`\`mermaid\ngraph TD\n    A[Start] --> B[Task 1]\n    B --> C{Choice?}\n    C -- Yes --> D[Result 1]\n    C -- No --> E[Result 2]\n\`\`\``)}
                    className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <IconPlus size={10} />
                    <span>Insert Flowchart</span>
                  </button>
                </div>
                <pre className="bg-zinc-950 dark:bg-black/20 text-zinc-300 border border-border/30 rounded-xl p-3 font-mono text-[10px] leading-relaxed">
{`\`\`\`mermaid
graph TD
    A[Start] --> B[Task 1]
    B --> C{Choice?}
    C -- Yes --> D[Result 1]
    C -- No --> E[Result 2]
\`\`\``}
                </pre>
              </div>

              {/* Template 2 */}
              <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">Sequence Flow</span>
                  <button
                    onClick={() => setContent(prev => prev + `\n\n\`\`\`mermaid\nsequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: Jolly good!\n\`\`\``)}
                    className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <IconPlus size={10} />
                    <span>Insert Sequence</span>
                  </button>
                </div>
                <pre className="bg-zinc-950 dark:bg-black/20 text-zinc-300 border border-border/30 rounded-xl p-3 font-mono text-[10px] leading-relaxed">
{`\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Jolly good!
\`\`\``}
                </pre>
              </div>

              {/* Template 3 */}
              <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">Project Timeline</span>
                  <button
                    onClick={() => setContent(prev => prev + `\n\n\`\`\`mermaid\ngantt\n    title A Gantt Diagram\n    dateFormat  YYYY-MM-DD\n    section Section\n    A task           :a1, 2026-07-01, 30d\n\`\`\``)}
                    className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <IconPlus size={10} />
                    <span>Insert Gantt</span>
                  </button>
                </div>
                <pre className="bg-zinc-950 dark:bg-black/20 text-zinc-300 border border-border/30 rounded-xl p-3 font-mono text-[10px] leading-relaxed">
{`\`\`\`mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2026-07-01, 30d
\`\`\``}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>
      )}
    </motion.div>
  );
}
