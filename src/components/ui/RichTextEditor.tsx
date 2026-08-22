import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  escapeHtml,
  highlightAllCodeBlocksInHtml,
} from './editor/editorUtils';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorCodeModal, type CodeModalState } from './editor/EditorCodeModal';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Write your thoughts...',
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  // Store selection to restore focus after modal edits
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Code modal state
  const [codeModal, setCodeModal] = useState<CodeModalState>({
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

  const exec = useCallback(
    (command: string, val?: string) => {
      document.execCommand(command, false, val);
      editorRef.current?.focus();
      syncContent();
    },
    [syncContent],
  );

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
  const openCodeModal = (
    elementId: string | null = null,
    code = '',
    lang = 'javascript',
  ) => {
    saveRange();
    setCodeModal({
      open: true,
      elementId,
      code,
      lang,
    });
  };

  // Click handler to catch edit clicks inside code blocks
  const handleEditorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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
    },
    [saveRange],
  );

  // Save changes from the Code Modal
  const handleSaveCode = async () => {
    const { elementId, code, lang } = codeModal;
    const cleanCode = code.trim() || '// write code here';
    const escaped = escapeHtml(cleanCode);
    const encoded = encodeURIComponent(cleanCode);

    let highlightedCode = escaped;
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'github-dark' : 'snazzy-light';
    const language =
      lang && lang.toLowerCase() !== 'other' ? lang.toLowerCase() : 'javascript';

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

    setCodeModal((prev) => ({ ...prev, open: false }));
    syncContent();
  };

  const editorCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && !initRef.current) {
        const isDark = document.documentElement.classList.contains('dark');
        highlightAllCodeBlocksInHtml(value, isDark).then((html) => {
          if (editorRef.current) editorRef.current.innerHTML = html;
        });
        initRef.current = true;
        editorRef.current = node;
      } else if (node) {
        editorRef.current = node;
      }
    },
    [value], // eslint-disable-line
  );

  return (
    <div className="flex flex-col border border-border-alt rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
      {/* Toolbar */}
      <EditorToolbar exec={exec} openCodeModal={openCodeModal} />

      {/* Editable area */}
      <div
        ref={editorCallbackRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={syncContent}
        onBlur={onBlur}
        onClick={handleEditorClick}
        className="rich-editor p-4 text-left"
        role="textbox"
        aria-multiline="true"
        aria-label="Note content"
      />

      {/* Modal for adding/editing code snippets inside the Note */}
      <EditorCodeModal
        codeModal={codeModal}
        setCodeModal={setCodeModal}
        handleSaveCode={handleSaveCode}
      />
    </div>
  );
};
