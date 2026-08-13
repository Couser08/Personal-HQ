import React, { useState } from 'react';
import { IconBookmark, IconTrash, IconPencil, IconChevronRight } from '@tabler/icons-react';
import { type BookStickyNote } from '../../../store/types';

interface MarginNoteProps {
  note: BookStickyNote;
  onEdit: (note: BookStickyNote) => void;
  onDelete: (id: string) => void;
}

export const MarginNote: React.FC<MarginNoteProps> = ({ note, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; flag: string }> = {
    yellow: {
      bg: 'bg-amber-500/10 dark:bg-amber-400/15',
      border: 'border-amber-400/40',
      text: 'text-amber-900 dark:text-amber-200',
      flag: 'bg-amber-400 text-amber-950'
    },
    pink: {
      bg: 'bg-pink-500/10 dark:bg-pink-400/15',
      border: 'border-pink-400/40',
      text: 'text-pink-900 dark:text-pink-200',
      flag: 'bg-pink-400 text-pink-950'
    },
    blue: {
      bg: 'bg-sky-500/10 dark:bg-sky-400/15',
      border: 'border-sky-400/40',
      text: 'text-sky-900 dark:text-sky-200',
      flag: 'bg-sky-400 text-sky-950'
    },
    green: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-400/15',
      border: 'border-emerald-400/40',
      text: 'text-emerald-900 dark:text-emerald-200',
      flag: 'bg-emerald-400 text-emerald-950'
    }
  };

  const currentTheme = COLOR_CLASSES[note.color || 'yellow'] || COLOR_CLASSES.yellow;

  return (
    <div className="relative group my-2">
      {/* Margin Flag Indicator */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-r-xl border-y border-r shadow-subtle text-[11px] font-bold cursor-pointer transition-all ${currentTheme.flag} ${currentTheme.border} ${
          isExpanded ? 'ring-2 ring-primary/40 shadow-md' : 'hover:translate-x-0.5'
        }`}
      >
        <IconBookmark size={13} className="shrink-0 fill-current" />
        <span className="truncate max-w-[120px]">{note.title || 'Sticky Note'}</span>
        <IconChevronRight
          size={12}
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded Note Card */}
      {isExpanded && (
        <div
          className={`mt-1.5 p-3 rounded-2xl border shadow-lg flex flex-col gap-2 ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text} animate-in fade-in slide-in-from-left-2 duration-150 text-left`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-1.5">
            <span className="font-bold text-xs">{note.title}</span>
            <span className="text-[10px] opacity-75 font-mono">{note.date}</span>
          </div>

          <p className="text-xs leading-relaxed whitespace-pre-wrap">{note.content}</p>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => onEdit(note)}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Edit Note"
            >
              <IconPencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="p-1 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
              title="Delete Note"
            >
              <IconTrash size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
