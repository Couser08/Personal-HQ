import { useRef, useCallback, useState } from 'react';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconList, IconListNumbers, IconH1,
  IconCode, IconHighlight, IconClearFormatting, IconChevronDown, IconCheck
} from '@tabler/icons-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Language list ─────────────────────────────────────────────────────── */
const LANG_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
  { value: 'csharp',     label: 'C#' },
  { value: 'cpp',        label: 'C++' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'sql',        label: 'SQL' },
  { value: 'bash',       label: 'Bash' },
  { value: 'json',       label: 'JSON' },
  { value: 'yaml',       label: 'YAML' },
  { value: 'markdown',   label: 'Markdown' },
  { value: 'other',      label: 'Other' },
];

/* ── Small inline language picker (not portal, lives in the code block) ── */
function LangPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const openPanel = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top:  r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 160),
      zIndex: 9999,
    });
    setOpen(true);
  };

  const label = LANG_OPTIONS.find(l => l.value === value)?.label ?? value.toUpperCase();

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => open ? setOpen(false) : openPanel()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          padding: '2px 8px', borderRadius: 6,
          background: 'rgba(244,63,94,0.15)', color: '#f43f5e',
          border: 'none', cursor: 'pointer',
        }}
      >
        {label}
        <IconChevronDown style={{ width: 12, height: 12, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Invisible backdrop */}
              <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />
              <motion.ul
                initial={{ opacity: 0, scaleY: 0.92 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.92 }}
                transition={{ type: 'spring', damping: 24, stiffness: 400 }}
                style={{
                  ...panelStyle,
                  transformOrigin: 'top left',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-border)',
                  borderRadius: 12,
                  padding: '4px 0',
                  maxHeight: 240,
                  overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  listStyle: 'none', margin: 0,
                }}
              >
                {LANG_OPTIONS.map(opt => (
                  <li
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                      fontWeight: opt.value === value ? 600 : 400,
                      color: opt.value === value ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {opt.label}
                    {opt.value === value && <IconCheck style={{ width: 13, height: 13, color: 'var(--primary)' }} />}
                  </li>
                ))}
              </motion.ul>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/* ── Standalone Code Block (used inside Rich Text Editor via insertHTML) ─ */
export function NoteCodeBlock({
  initialCode = '// Add code here',
  initialLang = 'javascript',
  onRemove,
}: {
  initialCode?: string;
  initialLang?: string;
  onRemove?: () => void;
}) {
  const [code, setCode]   = useState(initialCode);
  const [lang, setLang]   = useState(initialLang);
  const [editing, setEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  return (
    <div
      contentEditable={false}
      style={{
        margin: '12px 0',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-border)',
        background: '#1e1e1e',
      }}
    >
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: '#252526', borderBottom: '1px solid #333',
      }}>
        <LangPicker value={lang} onChange={setLang} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={startEdit}
            style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              background: 'transparent', color: '#8a8a8a', border: '1px solid #444',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Editor vs Preview */}
      {editing ? (
        <textarea
          ref={textRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onBlur={() => setEditing(false)}
          spellCheck={false}
          style={{
            display: 'block', width: '100%', boxSizing: 'border-box',
            padding: '16px', minHeight: 140,
            background: '#1e1e1e', color: '#d4d4d4',
            fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6,
            border: 'none', outline: 'none', resize: 'vertical',
          }}
        />
      ) : (
        <div onClick={startEdit} style={{ cursor: 'text' }}>
          <SyntaxHighlighter
            language={lang}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{ margin: 0, padding: '16px', background: 'transparent', fontSize: 13 }}
          >
            {code || ' '}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

/* ── Toolbar ────────────────────────────────────────────────────────────── */
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

/* ── Main editor ────────────────────────────────────────────────────────── */
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder = 'Write your thoughts...' }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initRef   = useRef(false);

  const syncContent = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    syncContent();
  }, [syncContent]);

  /** Insert a placeholder <div> that React replaces with NoteCodeBlock */
  const insertCodeBlock = useCallback(() => {
    const id = `cb-${Date.now()}`;
    const placeholder = `<div id="${id}" data-code-block="true" contenteditable="false" style="margin:12px 0;padding:20px;background:#1e1e1e;border-radius:12px;border:1px solid #333;color:#8a8a8a;font-size:13px;font-family:monospace;cursor:pointer" onclick="this.querySelector('textarea')?.focus()">// Click Edit in the Code Vault to add code here…<br><br><span style="font-size:11px;opacity:0.6">[Code block — open note to edit with language picker]</span></div><p><br></p>`;
    document.execCommand('insertHTML', false, placeholder);
    editorRef.current?.focus();
    syncContent();
  }, [syncContent]);

  const editorCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !initRef.current) {
      node.innerHTML = value;
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
            {group.map(btn => (
              <button
                key={btn.label}
                type="button"
                title={btn.label}
                aria-label={btn.label}
                onClick={() => btn.action === 'code-block'
                  ? insertCodeBlock()
                  : exec(btn.command ?? '', btn.value)
                }
                className="btn btn-ghost btn-sm btn-square"
              >
                {btn.icon}
              </button>
            ))}
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
        className="rich-editor p-4"
        role="textbox"
        aria-multiline="true"
        aria-label="Note content"
      />
    </div>
  );
};
