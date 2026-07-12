import { IconPlus } from '@tabler/icons-react';
import { type JournalStickyNote } from '../../../store/types';
import { StickyNoteCard } from './StickyNoteCard';

export function StickyNotes({
  journalStickyNotes,
  addJournalStickyNote,
  updateJournalStickyNote,
  deleteJournalStickyNote,
  isDark,
}: {
  journalStickyNotes: JournalStickyNote[];
  addJournalStickyNote: (note: JournalStickyNote) => Promise<void>;
  updateJournalStickyNote: (id: string, data: Partial<JournalStickyNote>) => Promise<void>;
  deleteJournalStickyNote: (id: string) => Promise<void>;
  isDark: boolean;
}) {
  return (
    <div className="lg:col-span-4 bg-surface border border-border/70 rounded-3xl p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Sticky Notes</span>
            <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
              {journalStickyNotes.length}
            </span>
          </div>
          <button
            onClick={() => {
              addJournalStickyNote({
                id: crypto.randomUUID(),
                content: 'New sticky note. Double click to edit!',
                x: 0,
                y: 0,
                createdAt: new Date().toISOString()
              });
            }}
            className="p-1 rounded-lg text-amber-600 hover:bg-amber-500/10 cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
          >
            <IconPlus className="w-3.5 h-3.5" /> Add Note
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
          {journalStickyNotes.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted italic border border-dashed border-border/40 rounded-2xl">
              No sticky notes yet. Add one to capture quick thoughts!
            </div>
          ) : (
            journalStickyNotes.map((note) => (
              <StickyNoteCard
                key={note.id}
                note={note}
                onUpdate={(content) => updateJournalStickyNote(note.id, { content })}
                onDelete={() => deleteJournalStickyNote(note.id)}
                isDark={isDark}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
