import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { IconPlus, IconFileText, IconTrash } from '@tabler/icons-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { parseMarkdown } from './markdownUtils';
import { MarkdownSidebar } from './MarkdownSidebar';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

const TEMPLATES = {
  blank: `# Document Title\n\nStart writing here...`,
  
  dailyLog: `# Daily Project Log
200: 
201: > **Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  
202: > **Project:** Personal App  
203: > **Status:** [Active]  
204: > **Focus:** Features & UI Development  
205: 
206: ---
207: 
208: ## 🎯 Daily Objectives
209: *   [ ] Fix dark mode styling and theme properties.
210: *   [ ] Refactor drawing canvas helper to lock grounding elements.
211: *   [ ] Resize popup forms to take proper horizontal and vertical space.
212: 
213: ---
214: 
215: ## ⏱️ Activity Log
216: 
217: ### 🌅 Morning Session (09:00 - 12:30)
218: - Set up state variables and custom toggle handlers.
219: - Checked element coordinates inside the main canvas workspace.
220: 
221: ### ☀️ Afternoon Session (13:30 - 17:00)
222: - Tested local file uploader configurations.
223: - Verified compilation builds cleanly without strict TS errors.
224: 
225: ---
226: 
227: ## 🛠️ Technical Decisions
228: To ensure optimal performance, we implemented custom Base64 image caching directly inside user metadata.
229: 
230: ---
231: 
232: ## ⚠️ Blockers & Roadblocks
233: 
234: > [!WARNING]
235: > Ensure all unused packages or local imports are cleaned up before launching to prevent build checks from failing.
236: 
237: ---
238: 
239: ## 🎨 Diagram & Architecture
240: This diagram outlines the daily state transitions.
241: 
242: \`\`\`mermaid
243: graph TD
244:     A[Start] --> B[Daily Review]
245:     B --> C[Implementation]
246:     C --> D[Verification Check]
247:     D --> E[Finish]
248: \`\`\`
249: 
250: ---
251: 
252: ## 📅 Action Items for Tomorrow
253: *   [ ] Implement export functions for custom files.
254: `,
  
  roadmap: `# Project Roadmap: Version 1.0
258: 
259: ## 📍 Overview
260: High-level timeline and feature list for the upcoming releases.
261: 
262: ---
263: 
264: ## 🗺️ Phases & Milestones
265: 
266: ### Phase 1: Core System
267: *   [x] Database structure definitions.
268: *   [x] Sidebar module toggling.
269: 
270: ### Phase 2: Whiteboard & Drawings
271: *   [ ] Support SVG and high-resolution PNG exports.
272: *   [ ] Grounding / Locking elements to prevent selections.
273: 
274: ---
275: 
276: ## 📊 Feature Progress Checklist
277: *   [x] Custom metadata saves.
278: *   [ ] Export to Markdown.
279: *   [ ] Mermaid rendering guide.
280: `,
  
  spec: `# RFC: Whiteboard Grounding Feature
283: 
284: **Author:** Dev Team  
285: **Status:** Proposal  
286: 
287: ---
288: 
289: ## 📖 Introduction
290: This document details the design specifications for adding element grounding to the drawing whiteboard module.
291: 
292: ## 💡 Proposed Solution
293: Introduce element-specific locking properties to frozen background elements.
294: 
295: \`\`\`typescript
296: interface CanvasElement {
297:   id: string;
298:   type: string;
299:   locked: boolean; // Grounding property
300: }
301: \`\`\`
302: `
};

const SLASH_COMMANDS = [
  { label: 'Heading 1', syntax: '# ', desc: 'Large title heading' },
  { label: 'Heading 2', syntax: '## ', desc: 'Medium section heading' },
  { label: 'Heading 3', syntax: '### ', desc: 'Small subsection heading' },
  { label: 'Checklist Item', syntax: '- [ ] ', desc: 'To-do list item' },
  { label: 'Bullet List', syntax: '- ', desc: 'Simple bullet point' },
  { label: 'Numbered List', syntax: '1. ', desc: 'Numbered list item' },
  { label: 'Table', syntax: '\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |\n', desc: 'Insert markdown table' },
  { label: 'Code Block', syntax: '```javascript\n\n```', desc: 'Code block syntax' },
  { label: 'Alert Note', syntax: '> [!NOTE]\n> ', desc: 'Blue notice box' },
  { label: 'Alert Warning', syntax: '> [!WARNING]\n> ', desc: 'Yellow warning box' },
];

export default function MarkdownModule() {
  const { notes, addNote, updateNote, deleteNote, theme, showConfirm } = useAppStore(useShallow(state => ({
    notes: state.notes,
    addNote: state.addNote,
    updateNote: state.updateNote,
    deleteNote: state.deleteNote,
    theme: state.theme,
    showConfirm: state.showConfirm,
  })));
  
  // Resolve theme to light/dark
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme === 'dark' ? 'dark' : 'light';
  }, [theme]);

  // Obsidian-like workspace state
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Custom document creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES>('blank');

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedDocIdRef = useRef<string | null>(null);

  // Compute markdown documents only
  const markdownDocs = useMemo(() => {
    return notes.filter(n => n.tags?.includes('markdown'));
  }, [notes]);

  // Load document content ONLY when activeDocId changes to prevent cursor resets
  useEffect(() => {
    const doc = markdownDocs.find(d => d.id === activeDocId);
    if (doc) {
      setTitle(doc.title);
      setContent(doc.content);
      loadedDocIdRef.current = activeDocId;
    } else {
      setTitle('');
      setContent('');
      loadedDocIdRef.current = null;
    }
  }, [activeDocId, markdownDocs]);

  // Create new document
  const handleCreateNewDoc = async () => {
    const finalTitle = newDocTitle.trim() || 'untitled.md';
    const finalTitleWithExt = finalTitle.endsWith('.md') ? finalTitle : `${finalTitle}.md`;
    const id = crypto.randomUUID();
    const newDoc = {
      id,
      title: finalTitleWithExt,
      content: TEMPLATES[selectedTemplate],
      tags: ['markdown'],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await addNote(newDoc);
    setActiveDocId(id);
    setIsCreateModalOpen(false);
    setNewDocTitle('');
  };

  const handleCreateDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateNewDoc();
  };

  // Delete document
  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNote(id);
    if (activeDocId === id) {
      setActiveDocId(null);
    }
  };

  // Debounced title save
  const handleTitleChange = (newVal: string) => {
    if (!activeDocId) return;
    setTitle(newVal);
    updateNote(activeDocId, { title: newVal }, true);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(activeDocId, { title: newVal });
    }, 1500);
  };

  // Debounced content save
  const handleContentChange = (newVal: string) => {
    if (!activeDocId) return;
    setContent(newVal);
    updateNote(activeDocId, { content: newVal }, true);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(activeDocId, { content: newVal });
    }, 1500);
  };

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

  // Scroll active slash command into view
  useEffect(() => {
    if (slashMenu.isOpen) {
      const activeEl = document.getElementById(`slash-cmd-item-${activeCommandIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeCommandIndex, slashMenu.isOpen]);

  // Download markdown file
  const handleDownload = () => {
    if (!title) return;
    const filename = title.endsWith('.md') ? title : `${title}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Export rendered Markdown preview to PDF
  const handleExportPDF = () => {
    const previewEl = document.getElementById('markdown-preview-pane');
    if (!previewEl) return;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!doc) return;

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML)
      .join('\n');

    const htmlContent = `
      <html>
        <head>
          <title>${title || 'document'}</title>
          ${styles}
          <style>
            body {
              background: white !important;
              color: black !important;
              padding: 40px !important;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
            .md-code-block {
              background: #f4f4f5 !important;
              border: 1px solid #e4e4e7 !important;
              color: #18181b !important;
              page-break-inside: avoid;
            }
            .md-code-header {
              background: #e4e4e7 !important;
              border-bottom: 1px solid #d4d4d8 !important;
              color: #27272a !important;
            }
            .code-line {
              border-bottom: none !important;
            }
            .code-ln {
              color: #a1a1aa !important;
              border-right: 1px solid #e4e4e7 !important;
            }
            code, pre {
              background: #f4f4f5 !important;
              color: #09090b !important;
            }
            h1, h2, h3, h4, h5, h6 {
              color: black !important;
              border-color: #e4e4e7 !important;
              page-break-after: avoid;
            }
            th, td {
              border-color: #d4d4d8 !important;
            }
            thead {
              background: #f4f4f5 !important;
            }
            blockquote {
              border-color: #d4d4d8 !important;
              color: #71717a !important;
            }
            hr {
              border-color: #e4e4e7 !important;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
          </style>
        </head>
        <body class="dark:bg-white dark:text-black">
          <div class="markdown-preview-content md-preview">
            ${previewEl.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 100);
            };
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();
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
    handleContentChange(newContent);
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
    handleContentChange(value);
    
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
      className="w-full h-full min-h-[calc(100vh-140px)] text-left"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .md-preview h1 { font-size: 1.8rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: var(--color-text-primary); border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 0.6rem; font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.025em; }
        .dark .md-preview h1 { border-bottom-color: rgba(255,255,255,0.06); }
        .md-preview h2 { font-size: 1.35rem; font-weight: 700; margin-top: 1.6rem; margin-bottom: 0.8rem; color: var(--color-text-primary); border-bottom: 1px solid rgba(0,0,0,0.04); padding-bottom: 0.4rem; font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
        .dark .md-preview h2 { border-bottom-color: rgba(255,255,255,0.04); }
        .md-preview h3 { font-size: 1.1rem; font-weight: 700; margin-top: 1.3rem; margin-bottom: 0.6rem; color: var(--color-text-primary); font-family: system-ui, -apple-system, sans-serif; }
        .md-preview p { line-height: 1.6; margin-bottom: 1rem; color: var(--color-text-secondary); font-size: 13.5px; font-weight: 550; }
        .md-preview ul, .md-preview ol { margin-bottom: 1rem; padding-left: 1.2rem; }
        .md-preview li { margin-bottom: 0.4rem; color: var(--color-text-secondary); font-size: 13px; font-weight: 550; }
        .md-preview blockquote { border-left: 4px solid var(--color-primary); padding-left: 1rem; font-style: italic; color: var(--color-text-muted); margin: 1.2rem 0; font-size: 13px; font-weight: 500; }
        .md-preview :not(pre) > code { font-family: monospace; background: rgba(0,0,0,0.04); padding: 0.15rem 0.35rem; border-radius: 6px; font-size: 0.85em; font-weight: 600; color: #ff2d55; }
        .dark .md-preview :not(pre) > code { background: rgba(255,255,255,0.08); color: #ff3b30; }
        .md-preview table { width: 100%; border-collapse: collapse; margin: 1.75rem 0; font-size: 13px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); background: var(--bg-surface); box-shadow: 0 4px 20px -10px rgba(0,0,0,0.05); }
        .dark .md-preview table { border-color: rgba(255,255,255,0.08); box-shadow: 0 4px 20px -10px rgba(0,0,0,0.3); }
        .md-preview th { background: rgba(0,0,0,0.02); font-weight: 700; color: var(--color-text-primary); padding: 0.85rem 1.1rem; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid rgba(0,0,0,0.06); }
        .dark .md-preview th { background: rgba(255,255,255,0.03); border-bottom-color: rgba(255,255,255,0.1); }
        .md-preview td { padding: 0.85rem 1.1rem; color: var(--color-text-secondary); border-bottom: 1px solid rgba(0,0,0,0.04); transition: background-color 0.15s ease; }
        .dark .md-preview td { border-bottom-color: rgba(255,255,255,0.05); }
        .md-preview tr:last-child td { border-bottom: none; }
        .md-preview tr:hover td { background: rgba(0,0,0,0.015); }
        .dark .md-preview tr:hover td { background: rgba(255,255,255,0.015); }
        .md-code-block { margin: 1.25rem 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: #0d1117; }
        .md-code-header { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1rem; background: #161b22; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .md-code-lang { font-family: SFMono-Regular, Consolas, monospace; font-size: 11px; font-weight: 600; color: #8b949e; text-transform: lowercase; letter-spacing: 0.02em; }
        .md-code-copy { display: flex; align-items: center; gap: 5px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 500; color: #8b949e; background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 6px; transition: color 0.15s, background 0.15s; }
        .md-code-copy:hover { color: #e6edf3; background: rgba(255,255,255,0.06); }
        .md-code-pre { margin: 0; padding: 1rem; overflow-x: auto; background: #0d1117; }
        .md-code-pre code { font-family: SFMono-Regular, Consolas, 'Courier New', monospace; font-size: 12.5px; line-height: 1.7; color: #e6edf3; background: transparent; display: block; }
        .code-line { display: block; }
        .code-ln { display: inline-block; min-width: 2.2rem; padding-right: 1rem; color: #3d444d; font-size: 11.5px; user-select: none; text-align: right; }
        .code-lc { color: #e6edf3; white-space: pre; }
      `}} />

      {activeDocId === null ? (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-24 select-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
                Markdown Workspace
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {markdownDocs.length > 0
                  ? `${markdownDocs.length} document${markdownDocs.length !== 1 ? 's' : ''} · ${markdownDocs.reduce((acc, d) => acc + d.content.split(/\s+/).filter(Boolean).length, 0).toLocaleString()} total words`
                  : 'Create documentation, timelines, and flowcharts in markdown.'}
              </p>
            </div>
            <button
              onClick={() => {
                setNewDocTitle('');
                setSelectedTemplate('blank');
                setIsCreateModalOpen(true);
              }}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <IconPlus size={15} /> New Document
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mr-1">Quick Start:</span>
            {([
              { key: 'blank', label: '📄 Blank' },
              { key: 'dailyLog', label: '🗓 Daily Log' },
              { key: 'roadmap', label: '🗺 Roadmap' },
              { key: 'spec', label: '📐 Spec Doc' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setNewDocTitle('');
                  setSelectedTemplate(key);
                  setIsCreateModalOpen(true);
                }}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-alt text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>

          {markdownDocs.length === 0 ? (
            <EmptyState
              icon={<IconFileText className="w-10 h-10 text-text-muted" />}
              title="No Markdown Documents"
              description="Create a document using one of the structural presets (Daily log, Roadmap, Spec)."
              action={
                <button
                  onClick={() => {
                    setNewDocTitle('');
                    setSelectedTemplate('blank');
                    setIsCreateModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm flex items-center gap-2 animate-none"
                >
                  <IconPlus size={15} /> Create Document
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {markdownDocs.map(doc => {
                const wc = doc.content.split(/\s+/).filter(Boolean).length;
                const preview = doc.content.replace(/[#*`>_\-=\[\]]/g, '').trim().slice(0, 90);
                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className="p-5 bg-surface border border-border rounded-3xl hover:border-primary/30 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between min-h-[165px] relative group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <IconFileText size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-bold text-text-primary truncate block">{doc.title}</span>
                          <p className="text-[11px] text-text-secondary font-medium mt-1 line-clamp-2 leading-relaxed">
                            {preview || 'No content yet...'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-text-muted">
                          {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-semibold text-text-muted">{wc.toLocaleString()} words</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm('Delete Document', `Are you sure you want to delete "${doc.title}"?`, () => {
                            handleDeleteDoc(doc.id, e);
                          });
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Delete document"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 p-2 relative text-left">
          <MarkdownSidebar
            activeDocId={activeDocId}
            setActiveDocId={setActiveDocId}
            markdownDocs={markdownDocs}
            handleDeleteDoc={handleDeleteDoc}
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
            newDocTitle={newDocTitle}
            setNewDocTitle={setNewDocTitle}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            handleCreateDocSubmit={handleCreateDocSubmit}
            TEMPLATES={TEMPLATES}
          />
          
          {isEditorOpen && (
            <MarkdownEditor
              title={title}
              handleTitleChange={handleTitleChange}
              content={content}
              handleTextareaChange={handleTextareaChange}
              handleTextareaKeyDown={handleTextareaKeyDown}
              wordCount={wordCount}
              copied={copied}
              handleCopy={handleCopy}
              handleDownload={handleDownload}
              handleExportPDF={handleExportPDF}
              isWorkspaceOpen={isWorkspaceOpen}
              setIsWorkspaceOpen={setIsWorkspaceOpen}
              setActiveDocId={setActiveDocId}
              slashMenu={slashMenu}
              filteredCommands={filteredCommands}
              activeCommandIndex={activeCommandIndex}
              handleSelectSlashCommand={handleSelectSlashCommand}
            />
          )}

          {isWorkspaceOpen && (
            <MarkdownPreview
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              parsedHtml={parsedHtml}
              resolvedTheme={resolvedTheme}
              isEditorOpen={isEditorOpen}
              setIsEditorOpen={setIsEditorOpen}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}
