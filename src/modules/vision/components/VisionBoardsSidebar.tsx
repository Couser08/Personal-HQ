import React, { useState, useMemo } from 'react';
import {
  IconSearch,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconClock,
  IconFolder,
  IconTrash,
  IconLayoutGrid,
  IconX,
  IconSparkles,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionBoard } from '../../../store/types';

interface VisionBoardsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateBoard: () => void;
}

export const VisionBoardsSidebar: React.FC<VisionBoardsSidebarProps> = ({
  isOpen,
  onClose,
  onOpenCreateBoard,
}) => {
  const {
    visionBoards,
    activeBoardId,
    setActiveBoard,
    toggleFavoriteBoard,
    showConfirm,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeRailTab, setActiveRailTab] = useState<'all' | 'favorites' | 'folders' | 'history'>('all');

  const filteredBoards = useMemo(() => {
    let result = visionBoards;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.subtitle?.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }
    if (activeRailTab === 'favorites') {
      result = result.filter((b) => b.isFavorite);
    }
    return result;
  }, [visionBoards, searchQuery, activeRailTab]);

  const favorites = filteredBoards.filter((b) => b.isFavorite || b.category === 'FAVORITES');
  const personal = filteredBoards.filter((b) => !b.isFavorite && b.category !== 'FAVORITES');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-20 w-[300px] sm:w-[320px] bg-surface/95 lg:bg-surface/50 backdrop-blur-xl border-r border-border flex flex-row transition-transform duration-300 ease-in-out shrink-0 overflow-hidden shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full lg:w-0 lg:border-r-0'
        }`}
      >
        {/* SLIM LEFT RAIL (Utility Icons) */}
        <div className="w-14 sm:w-16 border-r border-border/80 bg-surface-alt/70 flex flex-col items-center py-4 justify-between shrink-0">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveRailTab('all')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                activeRailTab === 'all'
                  ? 'bg-text-primary text-text-on-accent shadow-md'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface'
              }`}
              title="All Boards"
            >
              <IconLayoutGrid size={20} />
            </button>

            <button
              type="button"
              onClick={() => setActiveRailTab('favorites')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                activeRailTab === 'favorites'
                  ? 'bg-text-primary text-text-on-accent shadow-md'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface'
              }`}
              title="Favorite Boards"
            >
              <IconStar size={20} />
            </button>

            <button
              type="button"
              onClick={() => setActiveRailTab('folders')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                activeRailTab === 'folders'
                  ? 'bg-text-primary text-text-on-accent shadow-md'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface'
              }`}
              title="Board Collections"
            >
              <IconFolder size={20} />
            </button>

            <button
              type="button"
              onClick={() => setActiveRailTab('history')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                activeRailTab === 'history'
                  ? 'bg-text-primary text-text-on-accent shadow-md'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface'
              }`}
              title="Recently Viewed"
            >
              <IconClock size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                showConfirm(
                  'Clean Workspace',
                  'Would you like to manage your archived vision boards?',
                  () => {}
                );
              }}
              className="w-11 h-11 rounded-2xl text-text-tertiary hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
              title="Manage Archive"
            >
              <IconTrash size={20} />
            </button>
          </div>
        </div>

        {/* MAIN DRAWER CONTENT */}
        <div className="flex-1 flex flex-col h-full min-w-0 p-4 overflow-y-auto custom-scrollbar">
          {/* Top Bar for Mobile Close */}
          <div className="flex items-center justify-between pb-3 lg:hidden">
            <div className="flex items-center gap-2">
              <IconSparkles size={18} className="text-primary" />
              <span className="text-sm font-black text-text-primary uppercase tracking-wider">
                My Boards
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Close sidebar"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Search Boards Input */}
          <div className="relative mb-5">
            <IconSearch
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-surface-alt/80 border border-border text-[13px] font-semibold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          {/* Boards List */}
          <div className="space-y-6 flex-1 min-h-0">
            {/* FAVORITES SECTION */}
            {favorites.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[10.5px] font-black uppercase tracking-widest text-text-tertiary">
                    Favorites
                  </span>
                  <span className="text-[10px] font-bold text-text-tertiary px-1.5 py-0.5 rounded-md bg-surface-alt">
                    {favorites.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {favorites.map((board) => {
                    const isActive = board.id === activeBoardId;
                    return (
                      <div
                        key={board.id}
                        onClick={() => {
                          setActiveBoard(board.id);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-bold transition-all cursor-pointer select-none ${
                          isActive
                            ? 'bg-surface border border-border shadow-xs text-text-primary ring-1 ring-primary/30'
                            : 'bg-surface-alt/40 hover:bg-surface-alt hover:text-text-primary text-text-secondary border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-base leading-none shrink-0">
                            {board.icon || '✨'}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate leading-tight">{board.title}</span>
                            {board.subtitle && (
                              <span className="text-[10px] text-text-tertiary font-normal truncate">
                                {board.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteBoard(board.id);
                            }}
                            className="p-1 rounded-lg hover:bg-surface text-amber-500 cursor-pointer"
                            title="Toggle favorite"
                          >
                            <IconStarFilled size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PERSONAL SECTION */}
            {personal.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[10.5px] font-black uppercase tracking-widest text-text-tertiary">
                    Personal
                  </span>
                  <span className="text-[10px] font-bold text-text-tertiary px-1.5 py-0.5 rounded-md bg-surface-alt">
                    {personal.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {personal.map((board) => {
                    const isActive = board.id === activeBoardId;
                    return (
                      <div
                        key={board.id}
                        onClick={() => {
                          setActiveBoard(board.id);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-bold transition-all cursor-pointer select-none ${
                          isActive
                            ? 'bg-surface border border-border shadow-xs text-text-primary ring-1 ring-primary/30'
                            : 'bg-surface-alt/40 hover:bg-surface-alt hover:text-text-primary text-text-secondary border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-base leading-none shrink-0">
                            {board.icon || '🌿'}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate leading-tight">{board.title}</span>
                            {board.subtitle && (
                              <span className="text-[10px] text-text-tertiary font-normal truncate">
                                {board.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteBoard(board.id);
                            }}
                            className="p-1 rounded-lg hover:bg-surface text-text-tertiary hover:text-amber-500 cursor-pointer"
                            title="Toggle favorite"
                          >
                            <IconStar size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredBoards.length === 0 && (
              <div className="py-8 text-center text-text-tertiary text-xs">
                No boards found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>

          {/* + NEW BOARD BUTTON */}
          <div className="pt-4 mt-auto border-t border-border/70">
            <button
              type="button"
              onClick={onOpenCreateBoard}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-surface-alt/50 hover:bg-surface text-text-primary text-[13px] font-extrabold transition-all cursor-pointer shadow-xs min-h-[44px]"
            >
              <IconPlus size={16} />
              <span>New Board</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
