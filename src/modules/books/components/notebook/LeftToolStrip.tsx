import React, { useRef, useState } from 'react';
import {
  IconList,
  IconPlus,
  IconFileText,
  IconHighlight,
  IconBookmark,
  IconSearch,
  IconSparkles,
  IconSettings,
} from '@tabler/icons-react';

interface LeftToolStripProps {
  showTopicsPanel: boolean;
  setShowTopicsPanel: (val: boolean) => void;
  showNotesPanel: boolean;
  setShowNotesPanel: (val: boolean) => void;
  activeLeftTab: 'toc' | 'sticky' | 'highlighter' | 'bookmarks' | 'search' | 'ai' | 'settings';
  setActiveLeftTab: (tab: 'toc' | 'sticky' | 'highlighter' | 'bookmarks' | 'search' | 'ai' | 'settings') => void;
  activeHighlightColor: string;
  setActiveHighlightColor: (color: string) => void;
  applyHighlight: (colorId?: string) => void;
  toggleBookmark: () => void;
  searchInnerQuery: string;
  setSearchInnerQuery: (query: string) => void;
  isSearchBoxOpen: boolean;
  setIsSearchBoxOpen: (open: boolean) => void;
  openAddTopicModal: () => void;
  openAddStickyModal: (color: 'yellow' | 'pink') => void;
}

export const LeftToolStrip: React.FC<LeftToolStripProps> = ({
  showTopicsPanel,
  setShowTopicsPanel,
  showNotesPanel,
  setShowNotesPanel,
  activeLeftTab,
  setActiveLeftTab,
  activeHighlightColor,
  setActiveHighlightColor,
  applyHighlight,
  toggleBookmark,
  searchInnerQuery,
  setSearchInnerQuery,
  isSearchBoxOpen,
  setIsSearchBoxOpen,
  openAddTopicModal,
  openAddStickyModal,
}) => {
  const [isHighlighterHovered, setIsHighlighterHovered] = useState(false);
  const highlighterHoverTimerRef = useRef<any>(null);

  return (
    <div className="w-full sm:w-12 bg-surface border border-border rounded-2xl p-1.5 flex flex-row sm:flex-col gap-1.5 sm:gap-2.5 items-center justify-between sm:justify-start overflow-x-auto sm:overflow-visible shrink-0">
      {[
        { id: 'toc', icon: IconList, label: 'Table of Contents', toggle: () => setShowTopicsPanel(!showTopicsPanel) },
        { id: 'add-topic', icon: IconPlus, label: 'Add Topic', toggle: openAddTopicModal },
        { id: 'sticky', icon: IconFileText, label: 'Sticky Notes', toggle: () => setShowNotesPanel(!showNotesPanel) },
        { id: 'add-sticky', icon: IconPlus, label: 'Add Sticky Note', toggle: () => openAddStickyModal('yellow') },
        { id: 'highlighter', icon: IconHighlight, label: 'Apply Highlight', toggle: applyHighlight },
        { id: 'bookmarks', icon: IconBookmark, label: 'Bookmark Page', toggle: toggleBookmark },
        { id: 'search', icon: IconSearch, label: 'Search Content', toggle: () => setIsSearchBoxOpen(!isSearchBoxOpen) },
        { id: 'ai', icon: IconSparkles, label: 'AI Assistant', toggle: () => setActiveLeftTab('ai') },
        { id: 'settings', icon: IconSettings, label: 'Notebook Settings', toggle: () => setActiveLeftTab('settings') },
      ].map((item) => {
        const Icon = item.icon;
        const isTabActive = activeLeftTab === item.id;

        if (item.id === 'highlighter') {
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => {
                if (highlighterHoverTimerRef.current) {
                  clearTimeout(highlighterHoverTimerRef.current);
                }
                setIsHighlighterHovered(true);
              }}
              onMouseLeave={() => {
                highlighterHoverTimerRef.current = setTimeout(() => {
                  setIsHighlighterHovered(false);
                }, 300);
              }}
            >
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHighlight(activeHighlightColor)}
                title={item.label}
                className={`p-2 rounded-xl transition-all cursor-pointer active:scale-[0.97] transition-transform ${
                  isTabActive
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={18} />
              </button>

              {isHighlighterHovered && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-surface border border-border shadow-high rounded-xl px-2.5 py-2 z-[9999] whitespace-nowrap animate-fadeIn">
                  {[
                    { id: 'yellow', color: '#FEF08A', border: '#d4a017' },
                    { id: 'green', color: '#BBF7D0', border: '#22a05a' },
                    { id: 'blue', color: '#DBEAFE', border: '#3b82f6' },
                    { id: 'purple', color: '#F3E8FF', border: '#8b5cf6' },
                    { id: 'pink', color: '#FCE7F3', border: '#ec4899' },
                  ].map((col) => {
                    const isActive = activeHighlightColor === col.id;
                    return (
                      <div key={col.id} className="relative flex items-center justify-center">
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setActiveHighlightColor(col.id);
                            applyHighlight(col.id);
                          }}
                          title={`${col.id}${isActive ? ' (active)' : ''}`}
                          className={`rounded-full cursor-pointer transition-all ${
                            isActive
                              ? 'w-5 h-5 scale-110 shadow-md'
                              : 'w-4 h-4 hover:scale-125'
                          }`}
                          style={{
                            backgroundColor: col.color,
                            border: isActive ? `2.5px solid ${col.border}` : '1.5px solid rgba(0,0,0,0.12)',
                            boxShadow: isActive ? `0 0 0 2px white, 0 0 0 3.5px ${col.border}` : undefined
                          }}
                        />
                        {isActive && (
                          <svg className="absolute pointer-events-none" width="9" height="9" viewBox="0 0 10 10">
                            <path d="M2 5l2.5 2.5L8 3" stroke={col.border} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        if (item.id === 'search') {
          return (
            <div key={item.id} className="relative flex items-center">
              <button
                onClick={() => setIsSearchBoxOpen(!isSearchBoxOpen)}
                title={item.label}
                className={`p-2 rounded-xl transition-all cursor-pointer active:scale-[0.97] transition-transform ${
                  isSearchBoxOpen || searchInnerQuery
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={18} />
              </button>

              {isSearchBoxOpen && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-surface border border-border shadow-high rounded-xl p-1.5 z-[9999] whitespace-nowrap animate-slideRight">
                  <input
                    type="text"
                    value={searchInnerQuery}
                    onChange={(e) => setSearchInnerQuery(e.target.value)}
                    placeholder="Search word..."
                    className="bg-transparent text-xs text-text-primary focus:outline-none w-32 px-1 py-0.5 border-none"
                    autoFocus
                  />
                  {searchInnerQuery && (
                    <button
                      onClick={() => setSearchInnerQuery('')}
                      className="text-[10px] text-text-muted hover:text-text-primary font-bold px-1 py-0.5 border-none bg-transparent cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        }

        const isAddSticky = item.id === 'add-sticky';
        const isAddTopic = item.id === 'add-topic';

        return (
          <button
            key={item.id}
            onMouseDown={(e) => {
              if (item.id === 'bookmarks' || isAddTopic || isAddSticky) {
                e.preventDefault();
              }
            }}
            onClick={() => {
              if (item.id === 'ai' || item.id === 'settings') {
                setActiveLeftTab(item.id as any);
              } else {
                item.toggle();
              }
            }}
            title={item.label}
            className={`p-2 rounded-xl transition-all cursor-pointer relative active:scale-[0.97] transition-transform ${
              isTabActive
                ? 'bg-rose-500/10 text-rose-500'
                : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon size={18} className={isAddSticky ? 'text-amber-500' : isAddTopic ? 'text-rose-500' : ''} />
            {isAddSticky && <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full border border-surface" />}
            {isAddTopic && <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-surface" />}
          </button>
        );
      })}
    </div>
  );
};
