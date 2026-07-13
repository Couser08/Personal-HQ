import { useRef, useCallback, useEffect, useState } from 'react';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconList, IconListNumbers, IconH1,
  IconCode, IconHighlight, IconClearFormatting, IconChevronDown
} from '@tabler/icons-react';
import { CustomSelect } from './CustomSelect';
import { Modal } from './Modal';

// shiki import removed to be dynamically imported only when code blocks exist on page

const HIGHLIGHT_COLORS = [
  { hex: '#fef08a', label: 'Yellow' },
  { hex: '#bbf7d0', label: 'Green' },
  { hex: '#bfdbfe', label: 'Blue' },
  { hex: '#fbcfe8', label: 'Pink' },
  { hex: '#fed7aa', label: 'Orange' },
  { hex: '#ddd6fe', label: 'Purple' },
  { hex: '#fecdd3', label: 'Red' },
  { hex: '#cffafe', label: 'Cyan' },
  { hex: '#ccfbf1', label: 'Teal' },
  { hex: '#d9f99d', label: 'Lime' },
];

const LANG_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
  { value: 'csharp',     label: 'C#' },
  { value: 'cpp',        label: 'C++' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'php',        label: 'PHP' },
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'sql',        label: 'SQL' },
  { value: 'bash',       label: 'Bash' },
  { value: 'json',       label: 'JSON' },
  { value: 'yaml',       label: 'YAML' },
  { value: 'markdown',   label: 'Markdown' },
  { value: 'other',      label: 'Other' },
];

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  command?: string;
  value?: string;
  action?: 'code-block';
}

const TOOLBAR: ToolbarButton[] = [
  { label: 'Bold',           icon: <IconBold className="w-4 h-4" />,            command: 'bold' },
  { label: 'Italic',         icon: <IconItalic className="w-4 h-4" />,          command: 'italic' },
  { label: 'Underline',      icon: <IconUnderline className="w-4 h-4" />,       command: 'underline' },
  { label: 'Strikethrough',  icon: <IconStrikethrough className="w-4 h-4" />,   command: 'strikeThrough' },
  { label: 'Highlight',      icon: <IconHighlight className="w-4 h-4" />,       command: 'hiliteColor', value: '#fef08a' },
  { label: 'Bullet List',    icon: <IconList className="w-4 h-4" />,            command: 'insertUnorderedList' },
  { label: 'Numbered List',  icon: <IconListNumbers className="w-4 h-4" />,     command: 'insertOrderedList' },
  { label: 'Heading',        icon: <IconH1 className="w-4 h-4" />,              command: 'formatBlock', value: 'H1' },
  { label: 'Code Block',     icon: <IconCode className="w-4 h-4" />,            action: 'code-block' },
  { label: 'Clear Format',   icon: <IconClearFormatting className="w-4 h-4" />, command: 'removeFormat' },
];

const GROUPS: ToolbarButton[][] = [
  TOOLBAR.slice(0, 5), TOOLBAR.slice(5, 7), TOOLBAR.slice(7, 9), TOOLBAR.slice(9),
];

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function highlightAllCodeBlocksInHtml(html: string, isDark: boolean): Promise<string> {
  if (typeof window === 'undefined' || !html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const theme = isDark ? 'github-dark' : 'snazzy-light';

  // 1. Check if there are actually any code blocks to highlight
  const codeBlocks = doc.querySelectorAll<HTMLElement>('.note-code-block');
  const plainPreCodes = doc.querySelectorAll('pre code');
  
  if (codeBlocks.length === 0 && plainPreCodes.length === 0) {
    return html;
  }

  // 2. Dynamically import shiki only if code blocks are present
  const { codeToHtml } = await import('shiki');

  // 3. Highlight custom note-code-blocks
  for (const block of Array.from(codeBlocks)) {
    const lang = block.getAttribute('data-language') || 'javascript';
    const encoded = block.getAttribute('data-code') || '';
    
    const codeElem = block.querySelector('.note-code-pre code');
    if (!codeElem) continue;

    let code = '';
    try {
      code = encoded ? decodeURIComponent(encoded) : (codeElem.textContent || '');
    } catch {
      code = codeElem.textContent || '';
    }

    if (!code) continue;

    try {
      const language = (lang && lang.toLowerCase() !== 'other') ? lang.toLowerCase() : 'javascript';
      const highlighted = await codeToHtml(code, { lang: language, theme });
      const tempDoc = parser.parseFromString(highlighted, 'text/html');
      const shikiCode = tempDoc.querySelector('code');
      if (shikiCode) {
        codeElem.innerHTML = shikiCode.innerHTML;
      } else {
        codeElem.innerHTML = escapeHtml(code);
      }
    } catch (e) {
      console.error('Shiki error:', e);
      codeElem.innerHTML = escapeHtml(code);
    }
  }

  // 4. Highlight plain pre > code blocks (for backwards compatibility)
  for (const codeElem of Array.from(plainPreCodes)) {
    if (codeElem.closest('.note-code-block')) continue;
    
    const preElem = codeElem.parentElement;
    if (!preElem) continue;
    
    let lang = 'javascript';
    const classList = Array.from(codeElem.classList).concat(Array.from(preElem.classList));
    const langClass = classList.find(c => c.startsWith('language-') || c.startsWith('lang-'));
    if (langClass) {
      lang = langClass.replace(/^(language-|lang-)/, '');
    } else {
      lang = detectLanguage(codeElem.textContent || '');
    }
    
    const codeText = codeElem.textContent || '';
    if (codeText) {
      try {
        const language = (lang && lang.toLowerCase() !== 'other') ? lang.toLowerCase() : 'javascript';
        const highlighted = await codeToHtml(codeText, { lang: language, theme });
        const tempDoc = parser.parseFromString(highlighted, 'text/html');
        const shikiCode = tempDoc.querySelector('code');
        if (shikiCode) {
          codeElem.innerHTML = shikiCode.innerHTML;
        } else {
          codeElem.innerHTML = escapeHtml(codeText);
        }
      } catch (e) {
        codeElem.innerHTML = escapeHtml(codeText);
      }
    }
  }

  return doc.body.innerHTML;
}

function detectLanguage(code: string): string {
  const trimmed = code.trim();
  if (trimmed.startsWith('<?php') || trimmed.includes('<?php') || (trimmed.includes('namespace ') && trimmed.includes('$this->'))) {
    return 'php';
  }
  if (trimmed.startsWith('import ') && (trimmed.includes("from 'react'") || trimmed.includes('from "react"'))) {
    return 'typescript';
  }
  if (trimmed.startsWith('def ') && trimmed.includes(':')) {
    return 'python';
  }
  if (trimmed.startsWith('public class ') || trimmed.includes('System.out.println')) {
    return 'java';
  }
  if (trimmed.includes('using System;') || (trimmed.includes('namespace ') && trimmed.includes('class ') && trimmed.includes('void Main'))) {
    return 'csharp';
  }
  if (trimmed.startsWith('package ') && (trimmed.includes('import "fmt"') || trimmed.includes('func main()'))) {
    return 'go';
  }
  if (trimmed.includes('fn main()') || trimmed.includes('let mut ')) {
    return 'rust';
  }
  if (trimmed.startsWith('select ') || trimmed.startsWith('SELECT ') || trimmed.includes('INSERT INTO ') || trimmed.includes('CREATE TABLE ')) {
    return 'sql';
  }
  if (trimmed.startsWith('<html') || trimmed.startsWith('<!DOCTYPE html>')) {
    return 'html';
  }
  if (trimmed.includes('{') && trimmed.includes(':') && (trimmed.includes('margin:') || trimmed.includes('padding:') || trimmed.includes('color:'))) {
    if (trimmed.includes('body {') || trimmed.includes('.class {') || trimmed.includes('#id {')) {
      return 'css';
    }
  }
  if (trimmed.startsWith('{') && trimmed.endsWith('}') && (trimmed.includes('":') || trimmed.includes('": '))) {
    return 'json';
  }
  return 'other';
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, onBlur, placeholder = 'Write your thoughts...' }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initRef   = useRef(false);

  // Store selection to restore focus after modal edits
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Highlighter color states
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Code modal state
  const [codeModal, setCodeModal] = useState<{
    open: boolean;
    elementId: string | null;
    code: string;
    lang: string;
  }>({
    open: false,
    elementId: null,
    code: '',
    lang: 'javascript',
  });

  const syncContent = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  useEffect(() => {
    const node = editorRef.current;
    if (!node || document.activeElement === node) return;

    let cancelled = false;
    const isDark = document.documentElement.classList.contains('dark');

    highlightAllCodeBlocksInHtml(value, isDark).then((html) => {
      if (cancelled || !editorRef.current || document.activeElement === editorRef.current) return;
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    syncContent();
  }, [syncContent]);

  // Capture selection range
  const saveRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      setSavedRange(sel.getRangeAt(0));
    } else {
      setSavedRange(null);
    }
  }, []);

  // Trigger modal for inserting/editing
  const openCodeModal = (elementId: string | null = null, code = '', lang = 'javascript') => {
    saveRange();
    setCodeModal({
      open: true,
      elementId,
      code,
      lang,
    });
  };

  // Click handler to catch edit clicks inside code blocks
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('note-code-edit-trigger')) {
      e.preventDefault();
      e.stopPropagation();
      const block = target.closest('.note-code-block') as HTMLElement;
      if (block) {
        const id = block.id;
        const lang = block.getAttribute('data-language') || 'javascript';
        const code = decodeURIComponent(block.getAttribute('data-code') || '');
        openCodeModal(id, code, lang);
      }
    }
  }, [saveRange]);

  // Save changes from the Code Modal
  const handleSaveCode = async () => {
    const { elementId, code, lang } = codeModal;
    const cleanCode = code.trim() || '// write code here';
    const escaped = escapeHtml(cleanCode);
    const encoded = encodeURIComponent(cleanCode);

    let highlightedCode = escaped;
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'github-dark' : 'snazzy-light';
    const language = (lang && lang.toLowerCase() !== 'other') ? lang.toLowerCase() : 'javascript';

    try {
      const { codeToHtml } = await import('shiki');
      const rawHtml = await codeToHtml(cleanCode, { lang: language, theme });
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');
      const shikiCode = doc.querySelector('code');
      if (shikiCode) {
        highlightedCode = shikiCode.innerHTML;
      }
    } catch (err) {
      console.error('Failed to highlight with Shiki:', err);
    }

    if (elementId && editorRef.current) {
      // Edit existing
      const block = editorRef.current.querySelector(`#${elementId}`);
      if (block) {
        block.setAttribute('data-language', lang);
        block.setAttribute('data-code', encoded);
        const badge = block.querySelector('.note-code-badge');
        if (badge) badge.textContent = lang;
        const codeElem = block.querySelector('.note-code-pre code');
        if (codeElem) codeElem.innerHTML = highlightedCode;
      }
    } else {
      // Insert new
      const newId = `cb-${Date.now()}`;
      const html = [
        `<div id="${newId}" class="note-code-block" data-language="${lang}" data-code="${encoded}" contenteditable="false">`,
        `  <div class="note-code-header">`,
        `    <span class="note-code-badge">${lang}</span>`,
        `    <button class="note-code-edit-trigger" type="button">Edit Code</button>`,
        `  </div>`,
        `  <pre class="note-code-pre"><code>${highlightedCode}</code></pre> `,
        `</div>`,
        `<p><br></p>`,
      ].join('\n');

      if (editorRef.current) {
        editorRef.current.focus();

        // Restore cursor selection if valid
        const sel = window.getSelection();
        if (savedRange && sel) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        }

        // Try to insert HTML at cursor
        if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
          document.execCommand('insertHTML', false, html);
        } else {
          // Fallback: append at the very end
          const wrapper = document.createElement('div');
          wrapper.innerHTML = html;
          while (wrapper.firstChild) {
            editorRef.current.appendChild(wrapper.firstChild);
          }
        }
      }
    }

    setCodeModal(prev => ({ ...prev, open: false }));
    syncContent();
  };

  const editorCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !initRef.current) {
      const isDark = document.documentElement.classList.contains('dark');
      highlightAllCodeBlocksInHtml(value, isDark).then(html => {
        if (editorRef.current) editorRef.current.innerHTML = html;
      });
      initRef.current = true;
      editorRef.current = node;
    } else if (node) {
      editorRef.current = node;
    }
  }, [value]); // eslint-disable-line

  return (
    <div className="flex flex-col border border-border-alt rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-surface-alt border-b border-border"
        onMouseDown={e => e.preventDefault()}
      >
        {GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && <div className="w-px h-5 bg-border mx-1.5" aria-hidden />}
            {group.map(btn => {
              if (btn.label === 'Highlight') {
                return (
                  <div key={btn.label} className="relative flex items-center bg-surface border border-border/30 rounded-lg mx-0.5 shadow-sm">
                    <button
                      type="button"
                      title={`Highlight (Color: ${HIGHLIGHT_COLORS.find(c => c.hex === activeHighlightColor)?.label || 'Yellow'})`}
                      aria-label="Apply Highlight"
                      onClick={() => exec('hiliteColor', activeHighlightColor)}
                      className="btn btn-ghost btn-sm btn-square pr-1 border-r border-border/40 h-7 rounded-l-lg cursor-pointer flex flex-col items-center justify-center gap-0.5"
                    >
                      <IconHighlight className="w-3.5 h-3.5 text-text-primary" />
                      <div className="w-3.5 h-1 rounded-full shrink-0" style={{ backgroundColor: activeHighlightColor }} />
                    </button>
                    <button
                      type="button"
                      title="Select Highlight Color"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="btn btn-ghost btn-sm px-1.5 h-7 rounded-r-lg hover:bg-surface-alt transition-all cursor-pointer flex items-center justify-center"
                    >
                      <IconChevronDown className="w-3 h-3 text-text-muted" />
                    </button>
                    
                    {showColorPicker && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
                        <div className="absolute top-full left-0 mt-1.5 p-2 bg-surface border border-border rounded-2xl shadow-high grid grid-cols-5 gap-2 z-50 w-max">
                          {HIGHLIGHT_COLORS.map(color => (
                            <button
                              key={color.hex}
                              type="button"
                              title={color.label}
                              onClick={() => {
                                setActiveHighlightColor(color.hex);
                                setShowColorPicker(false);
                                exec('hiliteColor', color.hex);
                              }}
                              className="w-6 h-6 rounded-full border border-border hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={btn.label}
                  type="button"
                  title={btn.label}
                  aria-label={btn.label}
                  onClick={() => btn.action === 'code-block'
                    ? openCodeModal(null, '', 'javascript')
                    : exec(btn.command ?? '', btn.value)
                  }
                  className="btn btn-ghost btn-sm btn-square cursor-pointer"
                >
                  {btn.icon}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Editable area */}
      <div
        ref={editorCallbackRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={syncContent}
        onBlur={onBlur}
        onClick={handleEditorClick}
        className="rich-editor p-4"
        role="textbox"
        aria-multiline="true"
        aria-label="Note content"
      />

      {/* Modal for adding/editing code snippets inside the Note */}
      <Modal
        isOpen={codeModal.open}
        onClose={() => setCodeModal(prev => ({ ...prev, open: false }))}
        title={codeModal.elementId ? "Edit Code Block" : "Insert Code Block"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Language</label>
            <CustomSelect
              value={codeModal.lang}
              onChange={val => setCodeModal(prev => ({ ...prev, lang: val }))}
              options={LANG_OPTIONS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Code</label>
            <textarea
              value={codeModal.code}
              onChange={e => {
                const val = e.target.value;
                setCodeModal(prev => {
                  let nextLang = prev.lang;
                  if (!prev.elementId && (prev.lang === 'javascript' || prev.lang === 'other')) {
                    const detected = detectLanguage(val);
                    if (detected !== 'other') {
                      nextLang = detected;
                    }
                  }
                  return { ...prev, code: val, lang: nextLang };
                });
              }}
              placeholder="// Paste or write your code here..."
              spellCheck={false}
              className="w-full bg-[#1e1e1e] text-[#d4d4d4] border border-border-alt rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-mono min-h-45"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
            <button
              onClick={() => setCodeModal(prev => ({ ...prev, open: false }))}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCode}
              className="btn btn-primary btn-md"
            >
              {codeModal.elementId ? "Save Changes" : "Insert"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
