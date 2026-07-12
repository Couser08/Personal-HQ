import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { type JournalStickyNote } from '../../../store/types';

export function StickyNoteCard({
  note,
  onUpdate,
  onDelete,
  isDark,
}: {
  note: JournalStickyNote;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  isDark: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.content);

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() !== note.content.trim()) {
      onUpdate(text.trim());
    }
  };

  return (
    <motion.div
      layout
      className={`relative p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[90px] shadow-sm text-left ${
        isDark
          ? 'bg-amber-950/20 border-amber-900/30 text-amber-200'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}
    >
      <button
        onClick={onDelete}
        className="absolute top-2.5 right-2.5 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-amber-800/60 hover:text-red-500 transition-colors cursor-pointer"
        title="Delete note"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      <div className="flex-1 mt-1 text-xs leading-relaxed font-semibold pr-6 select-text">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full bg-transparent focus:outline-none resize-none min-h-[60px]"
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="whitespace-pre-wrap cursor-pointer"
            title="Double click to edit"
          >
            {note.content || 'Blank sticky note...'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
