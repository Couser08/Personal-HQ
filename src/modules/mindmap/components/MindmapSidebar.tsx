import { IconSearch, IconPlus, IconFolder, IconEdit, IconTrash, IconChevronDown } from '@tabler/icons-react';
import { type Mindmap } from '../../../store/types';

export function MindmapSidebar({
  filteredMindmaps,
  search,
  setSearch,
  selectedTagFilter,
  setSelectedTagFilter,
  activeMindmapId,
  setActiveMindmapId,
  handleCreateMindmap,
  handleOpenRename,
  deleteMindmap,
  showConfirm,
  isLeftSidebarOpen,
}: {
  filteredMindmaps: Mindmap[];
  search: string;
  setSearch: (val: string) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (val: string | null) => void;
  activeMindmapId: string | null;
  setActiveMindmapId: (val: string | null) => void;
  handleCreateMindmap: (title?: string) => void;
  handleOpenRename: () => void;
  deleteMindmap: (id: string) => Promise<void>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  isLeftSidebarOpen: boolean;
}) {
  return (
    <div
      className={`bg-surface/40 border-r border-border/50 flex flex-col shrink-0 transition-all duration-300 ${
        isLeftSidebarOpen
          ? activeMindmapId
            ? 'hidden md:flex w-[260px]'
            : 'flex w-full md:w-[260px]'
          : 'w-0 overflow-hidden border-r-0 hidden'
      }`}
    >
      {/* Workspace Brand Selector */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
            FF
          </div>
          <div className="text-left leading-none">
            <p className="font-extrabold text-[13px] text-text-primary">FocusFlow</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Personal Space</p>
          </div>
        </div>
        <IconChevronDown className="w-4 h-4 text-text-secondary" />
      </div>

      {/* Sidebar Search */}
      <div className="p-3">
        <div className="relative">
          <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search maps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border/50 pl-9 pr-8 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-text-primary"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border/60">
            ⌘K
          </span>
        </div>
      </div>

      {/* Directory header */}
      <div className="px-4 py-2 flex items-center justify-between text-text-secondary font-black text-[10px] tracking-wider uppercase">
        <span>MAPS</span>
        <button
          onClick={() => handleCreateMindmap('Untitled Mindmap')}
          className="w-5 h-5 rounded hover:bg-surface-alt flex items-center justify-center text-text-secondary border-none bg-transparent cursor-pointer"
          title="Create New Mindmap"
        >
          <IconPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Maps directory scrolling list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filteredMindmaps.length === 0 ? (
          <p className="text-[11px] text-text-muted text-center py-6">No maps saved.</p>
        ) : (
          filteredMindmaps.map((m) => (
            <div
              key={m.id}
              onClick={() => setActiveMindmapId(m.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                m.id === activeMindmapId
                  ? 'bg-stone-100/70 dark:bg-stone-900 border-border/50 text-text-primary font-bold shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-surface-alt/70 text-text-secondary'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconFolder className={`w-4 h-4 shrink-0 ${m.id === activeMindmapId ? 'text-primary' : 'text-text-muted'}`} />
                <div className="text-left leading-none truncate">
                  <p className="text-xs truncate font-bold">{m.title}</p>
                  <p className="text-[9px] text-text-muted mt-0.5 font-bold uppercase">{m.nodes?.length || 0} nodes</p>
                </div>
              </div>

              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMindmapId(m.id);
                    handleOpenRename();
                  }}
                  className="w-5.5 h-5.5 rounded hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary border-none bg-transparent cursor-pointer"
                >
                  <IconEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showConfirm('Delete Mindmap', `Delete "${m.title}"?`, () => {
                      deleteMindmap(m.id);
                      if (activeMindmapId === m.id) {
                        setActiveMindmapId(null);
                      }
                    });
                  }}
                  className="w-5.5 h-5.5 rounded hover:bg-rose-500/15 flex items-center justify-center text-text-muted hover:text-rose-500 border-none bg-transparent cursor-pointer"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TAGS section */}
      <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between text-text-secondary font-black text-[10px] tracking-wider uppercase">
        <span>TAGS</span>
        <button className="w-5 h-5 rounded hover:bg-surface-alt flex items-center justify-center text-text-secondary border-none bg-transparent cursor-pointer">
          <IconPlus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 flex flex-wrap gap-1.5 border-b border-border/40">
        {['Work', 'Study', 'Personal', 'Ideas', 'Goals'].map((t, idx) => {
          const isActive = selectedTagFilter === t;
          return (
            <span
              key={idx}
              onClick={() => setSelectedTagFilter(isActive ? null : t)}
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-all duration-150 ${
                t === 'Work'
                  ? isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                  : t === 'Study'
                  ? isActive
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                  : t === 'Personal'
                  ? isActive
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                  : t === 'Ideas'
                  ? isActive
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
                  : isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
              }`}
            >
              {t}
            </span>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 text-left text-[11px] font-medium text-text-muted hover:text-text-primary cursor-pointer transition-colors">
        Recently Deleted
      </div>
    </div>
  );
}
