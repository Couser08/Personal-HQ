import { IconSearch, IconTrash } from '@tabler/icons-react';
import { type JournalEntry } from '../../../store/types';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDateTime } from '../utils';

export function JournalSidebar({
  filteredEntries,
  search,
  setSearch,
  activeTab,
  setActiveTab,
  createEntry,
  setActiveEntryId,
  deleteJournalEntry,
  showConfirm,
}: {
  filteredEntries: JournalEntry[];
  search: string;
  setSearch: (val: string) => void;
  activeTab: 'all' | 'favorites';
  setActiveTab: (tab: 'all' | 'favorites') => void;
  createEntry: () => void;
  setActiveEntryId: (id: string | null) => void;
  deleteJournalEntry: (id: string) => Promise<void>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}) {
  return (
    <div className="lg:col-span-8 flex flex-col gap-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-grow">
          <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search journal entries..."
            className="input-field w-full pl-10 bg-surface"
          />
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-border shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-surface-alt text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Entries
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'favorites' ? 'bg-surface-alt text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredEntries.length === 0 ? (
        <div className="bg-surface border border-border/70 rounded-3xl p-12 text-center shadow-sm">
          <EmptyState
            title="No journal entries found"
            description="Create a new journal entry or clear the search filter to get started."
            action={
              <button onClick={createEntry} className="btn btn-primary btn-md">
                Create First Entry
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries.map((entry) => {
            const cleanContent = (entry.content || '').replace(/<[^>]*>/g, '').trim();
            const snippet = cleanContent
              ? cleanContent.length > 90
                ? cleanContent.slice(0, 90) + '...'
                : cleanContent
              : 'Nothing written yet.';

            return (
              <div
                key={entry.id}
                onClick={() => {
                  setActiveEntryId(entry.id);
                }}
                className="group relative bg-surface border border-border/70 hover:border-primary/40 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between min-h-[190px] overflow-hidden"
              >
                <div className="absolute w-24 h-24 rounded-full pointer-events-none -top-10 -left-10 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />

                <div className="relative z-10 flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                      {formatDateTime(entry.date)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-surface-alt text-text-primary border border-border/50">
                        {entry.mood}
                      </span>
                      {entry.pinned && (
                        <span className="text-rose-500 font-extrabold text-[9px] tracking-wider bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full">
                          PINNED
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors leading-tight mt-1">
                    {entry.title || 'Untitled Entry'}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mt-1">{snippet}</p>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-border/40 pt-4 mt-4">
                  <div className="flex flex-wrap gap-1 max-w-[70%]">
                    {entry.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[9px] font-semibold text-text-muted bg-surface-alt px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                    {entry.tags.length > 2 && (
                      <span className="text-[9px] font-semibold text-text-muted">+{entry.tags.length - 2}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm(
                        'Delete Journal Entry',
                        `Are you sure you want to delete "${entry.title || 'Untitled Entry'}"? This action cannot be undone.`,
                        () => deleteJournalEntry(entry.id)
                      );
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Entry"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
