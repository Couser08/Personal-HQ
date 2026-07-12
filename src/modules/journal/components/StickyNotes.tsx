import { useState } from 'react';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import { type JournalStickyNote } from '../../../store/types';

export function StickyNotes({
  journalStickyNotes,
  addJournalStickyNote,
  updateJournalStickyNote,
  deleteJournalStickyNote,
}: {
  journalStickyNotes: JournalStickyNote[];
  addJournalStickyNote: (note: JournalStickyNote) => Promise<void>;
  updateJournalStickyNote: (id: string, data: Partial<JournalStickyNote>) => Promise<void>;
  deleteJournalStickyNote: (id: string) => Promise<void>;
  isDark: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const dotColors = [
    'bg-amber-400 ring-amber-400/20',
    'bg-rose-400 ring-rose-400/20',
    'bg-sky-400 ring-sky-400/20',
    'bg-emerald-400 ring-emerald-400/20',
    'bg-purple-400 ring-purple-400/20',
  ];

  const handleStartEdit = (note: JournalStickyNote) => {
    setEditingId(note.id);
    setEditText(note.content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) {
      await deleteJournalStickyNote(id);
    } else {
      await updateJournalStickyNote(id, { content: editText.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="bg-surface border border-border/70 rounded-3xl p-5 shadow-subtle flex flex-col gap-4 text-left">
      {/* List Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">Sticky Notes</span>
          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] font-bold">
            {journalStickyNotes.length}
          </span>
        </div>
        <button
          onClick={() => {
            const newId = crypto.randomUUID();
            addJournalStickyNote({
              id: newId,
              content: 'New sticky note. Click to edit!',
              x: 0,
              y: 0,
              createdAt: new Date().toISOString(),
            });
          }}
          className="p-1 rounded-lg text-amber-600 hover:bg-amber-500/10 cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border-none bg-transparent"
        >
          <IconPlus className="w-3.5 h-3.5" /> Add Note
        </button>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
        {journalStickyNotes.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted italic border border-dashed border-border/40 rounded-2xl">
            No sticky notes yet. Add one to capture quick thoughts!
          </div>
        ) : (
          journalStickyNotes.map((note, index) => {
            const isEditing = editingId === note.id;
            const dotColor = dotColors[index % dotColors.length];

            return (
              <div
                key={note.id}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-surface-alt transition-colors group"
              >
                {/* Pin Color Indicator */}
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ring-4 ${dotColor}`} />

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => handleSaveEdit(note.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(note.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full bg-surface border border-primary rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none"
                        autoFocus
                      />
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevent blur before click
                          handleSaveEdit(note.id);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer border-none"
                      >
                        <IconCheck className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p
                      onClick={() => handleStartEdit(note)}
                      className="text-xs text-text-secondary truncate cursor-pointer hover:text-text-primary hover:underline font-medium"
                      title="Click to edit note"
                    >
                      {note.content}
                    </p>
                  )}
                </div>

                {/* Action Trigger (styled as a small pill button like "View" in holidays) */}
                <button
                  onClick={() => deleteJournalStickyNote(note.id)}
                  className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 transition-colors border-none cursor-pointer shrink-0"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
