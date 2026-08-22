import React, { useState } from 'react';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconList,
  IconListNumbers,
  IconH1,
  IconCode,
  IconHighlight,
  IconClearFormatting,
  IconChevronDown,
} from '@tabler/icons-react';
import { HIGHLIGHT_COLORS } from './editorUtils';

export interface ToolbarButton {
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
  {
    label: 'Strikethrough',
    icon: <IconStrikethrough className="w-4 h-4" />,
    command: 'strikeThrough',
  },
  {
    label: 'Highlight',
    icon: <IconHighlight className="w-4 h-4" />,
    command: 'hiliteColor',
    value: '#fef08a',
  },
  {
    label: 'Bullet List',
    icon: <IconList className="w-4 h-4" />,
    command: 'insertUnorderedList',
  },
  {
    label: 'Numbered List',
    icon: <IconListNumbers className="w-4 h-4" />,
    command: 'insertOrderedList',
  },
  { label: 'Heading', icon: <IconH1 className="w-4 h-4" />, command: 'formatBlock', value: 'H1' },
  { label: 'Code Block', icon: <IconCode className="w-4 h-4" />, action: 'code-block' },
  {
    label: 'Clear Format',
    icon: <IconClearFormatting className="w-4 h-4" />,
    command: 'removeFormat',
  },
];

const GROUPS: ToolbarButton[][] = [
  TOOLBAR.slice(0, 5),
  TOOLBAR.slice(5, 7),
  TOOLBAR.slice(7, 9),
  TOOLBAR.slice(9),
];

interface EditorToolbarProps {
  exec: (command: string, val?: string) => void;
  openCodeModal: (elementId?: string | null, code?: string, lang?: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ exec, openCodeModal }) => {
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex items-center gap-0.5 px-2 py-1.5 bg-surface-alt border-b border-border overflow-x-auto custom-scrollbar shrink-0 text-left"
      onMouseDown={(e) => e.preventDefault()}
    >
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center">
          {gi > 0 && <div className="w-px h-5 bg-border mx-1.5" aria-hidden />}
          {group.map((btn) => {
            if (btn.label === 'Highlight') {
              return (
                <div
                  key={btn.label}
                  className="relative flex items-center bg-surface border border-border/30 rounded-lg mx-0.5 shadow-sm"
                >
                  <button
                    type="button"
                    title={`Highlight (Color: ${
                      HIGHLIGHT_COLORS.find((c) => c.hex === activeHighlightColor)?.label ||
                      'Yellow'
                    })`}
                    aria-label="Apply Highlight"
                    onClick={() => exec('hiliteColor', activeHighlightColor)}
                    className="btn btn-ghost btn-sm btn-square pr-1 border-r border-border/40 h-7 rounded-l-lg cursor-pointer flex flex-col items-center justify-center gap-0.5"
                  >
                    <IconHighlight className="w-3.5 h-3.5 text-text-primary" />
                    <div
                      className="w-3.5 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: activeHighlightColor }}
                    />
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
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowColorPicker(false)}
                      />
                      <div className="absolute top-full left-0 mt-1.5 p-2 bg-surface border border-border rounded-2xl shadow-high grid grid-cols-5 gap-2 z-50 w-max">
                        {HIGHLIGHT_COLORS.map((color) => (
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
                onClick={() =>
                  btn.action === 'code-block'
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
  );
};
