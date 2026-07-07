import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconDownload, IconCopy, IconFileText, 
  IconEye, IconPencil, IconSitemap, IconCheck, IconPlus,
  IconChevronLeft, IconChevronRight, IconTrash
} from '@tabler/icons-react';
import "@excalidraw/excalidraw/index.css";
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

// Helper to parse Markdown tables
const parseTables = (text: string): string => {
  const lines = text.split(/\r?\n/);
  let inTable = false;
  let tableLines: string[] = [];
  const resultLines: string[] = [];

  const renderHtmlTable = (rows: string[]): string => {
    if (rows.length === 0) return '';
    
    // Filter out separator rows like |---| or | :--- |
    const cleanRows = rows.filter(r => {
      const content = r.replace(/[|:\s-]/g, '');
      return content.length > 0;
    });

    if (cleanRows.length === 0) return '';

    let html = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-border/60 text-left text-sm rounded-xl overflow-hidden">';
    
    // Header
    const headers = cleanRows[0]
      .split('|')
      .slice(1, -1)
      .map(h => h.trim());
      
    html += '<thead class="bg-surface-alt border-b border-border/80"><tr>';
    headers.forEach(h => {
      html += `<th class="px-4 py-3 font-bold text-text-primary border-r border-border/40 last:border-r-0">${h}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody class="divide-y divide-border/30">';
    for (let rIdx = 1; rIdx < cleanRows.length; rIdx++) {
      const cells = cleanRows[rIdx]
        .split('|')
        .slice(1, -1)
        .map(c => c.trim());
      
      html += '<tr class="hover:bg-surface-alt/25 transition-colors">';
      cells.forEach(c => {
        html += `<td class="px-4 py-3 text-text-secondary border-r border-border/35 last:border-r-0">${c}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableRow = line.startsWith('|') && line.endsWith('|');

    if (isTableRow) {
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      if (inTable) {
        resultLines.push(renderHtmlTable(tableLines));
        inTable = false;
      }
      resultLines.push(lines[i]);
    }
  }
  if (inTable) {
    resultLines.push(renderHtmlTable(tableLines));
  }
  return resultLines.join('\n');
};

// Custom regex-based Markdown to HTML parser
const parseMarkdown = (md: string): string => {
  if (!md) return '<p class="text-text-muted italic">No content written yet. Select a template or write markdown to begin.</p>';
  
  // 1. Extract code blocks first to protect them from HTML escaping
  const codeBlocks: string[] = [];
  let html = md.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    // Escape HTML inside code safely
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const lines = escapedCode.split('\n');
    const numberedLines = lines.map((l: string, i: number) =>
      `<span class="code-line"><span class="code-ln">${i + 1}</span><span class="code-lc">${l}</span></span>`
    ).join('\n');
    const langLabel = lang || 'text';
    const copyId = `cb-${Math.random().toString(36).slice(2,8)}`;
    const svgCopy = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    codeBlocks.push(
      `<div class="md-code-block" id="${copyId}">`
      + `<div class="md-code-header"><span class="md-code-lang">${langLabel}</span>`
      + `<button class="md-code-copy" onclick="(function(btn){const code=btn.closest('.md-code-block').querySelector('code').innerText;navigator.clipboard.writeText(code).then(()=>{btn.querySelector('.md-copy-label').textContent='Copied!';setTimeout(()=>btn.querySelector('.md-copy-label').textContent='Copy',2000)}).catch(()=>{})})(this)">${svgCopy}<span class="md-copy-label">Copy</span></button>`
      + `</div>`
      + `<pre class="md-code-pre"><code>${numberedLines}</code></pre>`
      + `</div>`
    );
    return `__CODEBLOCK_${codeBlocks.length - 1}__`;
  });

  // 2. Escape remaining HTML entities
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Parse tables
  html = parseTables(html);
    
  // 3. Headers
  html = html.replace(/^###### (.*?)$/gm, '<h6 class="text-xs font-black text-text-primary uppercase tracking-wider mt-4 mb-2">$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5 class="text-sm font-extrabold text-text-primary mt-5 mb-2">$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-base font-black text-text-primary tracking-tight mt-6 mb-2">$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-black text-text-primary tracking-tight mt-7 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-black text-text-primary tracking-tight mt-8 mb-3 pb-1 border-b border-border/30">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-black text-text-primary tracking-tight mt-10 mb-4 pb-2 border-b border-border/50">$1</h1>');
  
  // 4. Alert boxes (GitHub style)
  html = html.replace(/^&gt;\s*\[!NOTE\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-blue-500/10 border-l-4 border-blue-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Note</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!TIP\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-emerald-500/10 border-l-4 border-emerald-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Tip</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!IMPORTANT\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-purple-500/10 border-l-4 border-purple-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">Important</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!WARNING\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">Warning</p>$1</div>');
  html = html.replace(/^&gt;\s*\[!CAUTION\]\s*\n([\s\S]*?)(?=\n\n|\n&gt;|\n\s*\n|$)/gmi, '<div class="p-4 mb-4 rounded-2xl bg-rose-500/10 border-l-4 border-rose-500 text-text-primary"><p class="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">Caution</p>$1</div>');
  
  // Standard blockquotes
  html = html.replace(/^&gt;\s*(.*?)$/gm, '<blockquote class="border-l-4 border-border/80 pl-4 py-1 italic text-text-secondary my-4">$1</blockquote>');

  // 5. Horizontal lines (---)
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
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('<div') ||
      trimmed.startsWith('<li') ||
      /^__CODEBLOCK_\d+__$/.test(trimmed)
    ) {
      return p;
    }
    return `<p class="my-3 text-sm leading-relaxed text-text-secondary">${p}</p>`;
  });
  
  let result = formatted.join('\n');
  
  // Restore code blocks after all other processing
  codeBlocks.forEach((block, i) => {
    result = result.replace(`__CODEBLOCK_${i}__`, block);
  });
  
  return result;
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

  // Create new document in Supabase
  // Create new document from popup
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
    // Instant local cache save
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
    // Instant local cache save
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
      {/* Scoped Apple Typography + Claude-style code blocks */}
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
        .md-preview table { width: 100%; border-collapse: collapse; margin: 1.6rem 0; font-size: 0.85rem; border-radius: 12px; overflow: hidden; }
        .md-preview th { background: rgba(0,0,0,0.02); font-weight: 700; border: 1px solid rgba(0,0,0,0.06); padding: 0.7rem 1rem; color: var(--color-text-primary); }
        .dark .md-preview th { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.06); }
        .md-preview td { border: 1px solid rgba(0,0,0,0.06); padding: 0.7rem 1rem; color: var(--color-text-secondary); font-weight: 550; }
        .dark .md-preview td { border-color: rgba(255,255,255,0.06); }
        
        /* Claude-style code block */
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
        /* Dashboard View of MD Files */
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-24">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

          {/* Quick template chips */}
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
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <IconPlus size={15} /> Create Document
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        /* Document Editor and Preview Workspace Split View */
        <div className="w-full h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 p-2 relative text-left">
          
          {/* Left Column: Markdown Editor Panel (added min-w-0 to prevent right-side cutoff) */}
          {isEditorOpen && (
            <section className={`flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4.5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 min-w-0 ${
              isWorkspaceOpen ? 'flex-1' : 'w-full h-full'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
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

              <div className="flex-1 flex flex-col min-h-0 relative">
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
                  <div className="absolute z-55 left-4 bottom-6 w-64 bg-surface border border-border rounded-2xl shadow-xl p-2 flex flex-col gap-1 max-h-56 overflow-y-auto custom-scrollbar font-sans">
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

          {/* Right Column: Tabbed Preview & Whiteboard Workspace (added min-w-0 to prevent right-side cutoff) */}
          {isWorkspaceOpen && (
            <section className={`flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4.5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 min-w-0 ${
              isEditorOpen ? 'flex-1' : 'w-full h-full'
            }`}>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex bg-surface-alt p-1 rounded-xl border border-border/50 shadow-sm shrink-0">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                      activeTab === 'preview' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <IconEye size={14} />
                    <span>Live Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sketch')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                      activeTab === 'sketch' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <IconPencil size={14} />
                    <span>Whiteboard Sketch</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('mermaid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
                      activeTab === 'mermaid' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <IconSitemap size={14} />
                    <span>Pro Guide</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsEditorOpen(!isEditorOpen)}
                  className="btn btn-secondary btn-md text-xs py-1.5 px-2 h-auto min-h-0 rounded-xl flex items-center justify-center cursor-pointer hover:text-primary transition-all ml-auto font-sans"
                  title={isEditorOpen ? "Hide Editor Pane" : "Show Editor Pane"}
                >
                  {isEditorOpen ? <IconChevronLeft size={14} /> : <IconChevronRight size={14} />}
                </button>
              </div>

              <div className="flex-grow min-h-0 relative overflow-hidden flex flex-col">
                {activeTab === 'preview' && (
                  <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 bg-surface border border-border/40 rounded-2xl p-6 text-left">
                    {/* Rendered Preview with md-preview layout class */}
                    <article 
                      className="max-w-none text-text-primary md-preview overflow-hidden break-words"
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
                    <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans">Markdown Pro Tips</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary leading-relaxed font-sans">
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

                    <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 font-sans">
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Mermaid Code Diagrams</span>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Use the following copyable templates in your markdown log to draw diagrams:
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">Flowchart Layout</span>
                        <button
                          onClick={() => handleContentChange(content + `\n\n\`\`\`mermaid\ngraph TD\n    A[Start] --> B[Task 1]\n    B --> C{Choice?}\n    C -- Yes --> D[Result 1]\n    C -- No --> E[Result 2]\n\`\`\``)}
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

                    <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">Sequence Flow</span>
                        <button
                          onClick={() => handleContentChange(content + `\n\n\`\`\`mermaid\nsequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: Jolly good!\n\`\`\``)}
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

                    <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">Project Timeline</span>
                        <button
                          onClick={() => handleContentChange(content + `\n\n\`\`\`mermaid\ngantt\n    title A Gantt Diagram\n    dateFormat  YYYY-MM-DD\n    section Section\n    A task           :a1, 2026-07-01, 30d\n\`\`\``)}
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

        </div>
      )}

      {/* Creation Presets Popup Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Markdown Document"
      >
        <form onSubmit={handleCreateDocSubmit} className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g., sprint-log.md"
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-250/60 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-neutral-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Structural Preset</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setSelectedTemplate('blank')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                  selectedTemplate === 'blank'
                    ? 'border-neutral-900 bg-neutral-900/5 dark:border-neutral-100 dark:bg-neutral-100/5 text-neutral-900 dark:text-neutral-100 font-bold'
                    : 'border-neutral-250/60 hover:bg-neutral-50 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="text-xs font-bold font-sans">Blank Document</span>
                <span className="text-[10px] opacity-80 font-medium font-sans">Start writing fresh</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedTemplate('dailyLog')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                  selectedTemplate === 'dailyLog'
                    ? 'border-neutral-900 bg-neutral-900/5 dark:border-neutral-100 dark:bg-neutral-100/5 text-neutral-900 dark:text-neutral-100 font-bold'
                    : 'border-neutral-250/60 hover:bg-neutral-50 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="text-xs font-bold font-sans">Daily Project Log</span>
                <span className="text-[10px] opacity-80 font-medium font-sans">Daily goals & activity logs</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('roadmap')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                  selectedTemplate === 'roadmap'
                    ? 'border-neutral-900 bg-neutral-900/5 dark:border-neutral-100 dark:bg-neutral-100/5 text-neutral-900 dark:text-neutral-100 font-bold'
                    : 'border-neutral-250/60 hover:bg-neutral-50 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="text-xs font-bold font-sans">Project Roadmap</span>
                <span className="text-[10px] opacity-80 font-medium font-sans">Version timelines & feature checklists</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('spec')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                  selectedTemplate === 'spec'
                    ? 'border-neutral-900 bg-neutral-900/5 dark:border-neutral-100 dark:bg-neutral-100/5 text-neutral-900 dark:text-neutral-100 font-bold'
                    : 'border-neutral-250/60 hover:bg-neutral-50 dark:border-neutral-800 text-neutral-500'
                }`}
              >
                <span className="text-xs font-bold font-sans">RFC Technical Spec</span>
                <span className="text-[10px] opacity-80 font-medium font-sans">Proposals and logic architectures</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-105 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-805 rounded-xl transition-all cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-850 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-black rounded-xl transition-all cursor-pointer font-sans"
            >
              Create Document
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
