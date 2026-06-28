import { useRef, useCallback } from 'react';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconList, IconListNumbers, IconH1,
  IconCode, IconHighlight, IconClearFormatting
} from '@tabler/icons-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  command?: string;
  value?: string;
  action?: 'code-block';
}

const TOOLBAR: ToolbarButton[] = [
  { label: 'Bold', icon: <IconBold className="w-4 h-4" />, command: 'bold' },
  { label: 'Italic', icon: <IconItalic className="w-4 h-4" />, command: 'italic' },
  { label: 'Underline', icon: <IconUnderline className="w-4 h-4" />, command: 'underline' },
  { label: 'Strikethrough', icon: <IconStrikethrough className="w-4 h-4" />, command: 'strikeThrough' },
  { label: 'Highlight', icon: <IconHighlight className="w-4 h-4" />, command: 'hiliteColor', value: '#fef08a' },
  { label: 'Bullet List', icon: <IconList className="w-4 h-4" />, command: 'insertUnorderedList' },
  { label: 'Numbered List', icon: <IconListNumbers className="w-4 h-4" />, command: 'insertOrderedList' },
  { label: 'Heading', icon: <IconH1 className="w-4 h-4" />, command: 'formatBlock', value: 'H1' },
  { label: 'Code Block', icon: <IconCode className="w-4 h-4" />, action: 'code-block' },
  { label: 'Clear Format', icon: <IconClearFormatting className="w-4 h-4" />, command: 'removeFormat' },
];

const GROUPS: ToolbarButton[][] = [TOOLBAR.slice(0, 5), TOOLBAR.slice(5, 7), TOOLBAR.slice(7, 9), TOOLBAR.slice(9)];

export const RichTextEditor = ({ value, onChange, placeholder = 'Write your thoughts...' }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const syncContent = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    syncContent();
  }, [syncContent]);

  const insertCodeBlock = useCallback(() => {
    const block = [
      '<div class="note-code-block" contenteditable="false">',
      '<div class="note-code-label">Code snippet</div>',
      '<textarea class="note-code-input" spellcheck="false">// Add code here</textarea>',
      '</div>',
      '<p><br></p>',
    ].join('');

    document.execCommand('insertHTML', false, block);
    editorRef.current?.focus();
    syncContent();
  }, [syncContent]);

  const handleInput = useCallback((event: React.FormEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) {
      target.textContent = target.value;
    }
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
  }, [value]);

  return (
    <div className="flex flex-col border border-border-alt rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0 transition-all">
      <div role="toolbar" aria-label="Text formatting" className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-surface-alt border-b border-border" onMouseDown={(e) => e.preventDefault()}>
        {GROUPS.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center">
            {groupIndex > 0 && <div className="w-px h-5 bg-border mx-1.5" aria-hidden="true" />}
            {group.map((button) => (
              <button
                key={button.label}
                type="button"
                title={button.label}
                aria-label={button.label}
                onClick={() => button.action === 'code-block' ? insertCodeBlock() : exec(button.command ?? '', button.value)}
                className="btn btn-ghost btn-sm btn-square"
              >
                {button.icon}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div
        ref={editorCallbackRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        className="rich-editor p-4"
        role="textbox"
        aria-multiline="true"
        aria-label="Note content"
      />
    </div>
  );
};
