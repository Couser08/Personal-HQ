import React from 'react';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconHighlight,
  IconFileText,
  IconX
} from '@tabler/icons-react';

interface SelectionToolbarProps {
  position: { top: number; left: number } | null;
  onFormat: (command: string, value?: string) => void;
  onHighlight: (color: string) => void;
  onAddNote: () => void;
  onClose: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  position,
  onFormat,
  onHighlight,
  onAddNote,
  onClose
}) => {
  if (!position) return null;

  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%) translateY(-8px)'
      }}
      className="fixed z-[9999] bg-surface/95 backdrop-blur-md border border-border shadow-xl rounded-2xl p-1.5 flex items-center gap-1 text-text-primary animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Formatting Tools */}
      <div className="flex items-center gap-0.5 border-r border-border/50 pr-1.5">
        <button
          type="button"
          onClick={() => onFormat('bold')}
          className="p-1.5 hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Bold (Cmd+B)"
        >
          <IconBold size={15} />
        </button>
        <button
          type="button"
          onClick={() => onFormat('italic')}
          className="p-1.5 hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Italic (Cmd+I)"
        >
          <IconItalic size={15} />
        </button>
        <button
          type="button"
          onClick={() => onFormat('underline')}
          className="p-1.5 hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Underline (Cmd+U)"
        >
          <IconUnderline size={15} />
        </button>
        <button
          type="button"
          onClick={() => onFormat('strikeThrough')}
          className="p-1.5 hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Strikethrough"
        >
          <IconStrikethrough size={15} />
        </button>
      </div>

      {/* Highlights Palette */}
      <div className="flex items-center gap-1 px-1 border-r border-border/50 pr-1.5">
        <IconHighlight size={14} className="text-text-muted mr-0.5 shrink-0" />
        {[
          { id: 'yellow', bg: 'bg-amber-300 dark:bg-amber-400' },
          { id: 'green', bg: 'bg-emerald-300 dark:bg-emerald-400' },
          { id: 'pink', bg: 'bg-pink-300 dark:bg-pink-400' },
          { id: 'blue', bg: 'bg-sky-300 dark:bg-sky-400' }
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onHighlight(c.id)}
            className={`w-4 h-4 rounded-full ${c.bg} hover:scale-125 transition-transform cursor-pointer border border-black/10 shadow-sm`}
            title={`Highlight ${c.id}`}
          />
        ))}
      </div>

      {/* Add Note Button */}
      <button
        type="button"
        onClick={onAddNote}
        className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer"
        title="Add sticky note to selection"
      >
        <IconFileText size={14} />
        <span>+ Note</span>
      </button>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text-primary transition-colors cursor-pointer ml-0.5"
      >
        <IconX size={13} />
      </button>
    </div>
  );
};
