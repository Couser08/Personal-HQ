import React from 'react';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconList,
  IconListNumbers,
  IconAlignLeft,
  IconFileText,
  IconBookmark,
  IconPhoto,
  IconMaximize,
} from '@tabler/icons-react';

interface NotebookToolbarProps {
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  fontFamily: 'sans' | 'serif' | 'mono';
  setFontFamily: (font: 'sans' | 'serif' | 'mono') => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  executeFormatting: (command: string, value?: string) => void;
  activeHighlightColor: string;
  setActiveHighlightColor: (color: string) => void;
  applyHighlight: (colorId?: string) => void;
  isEditMode: boolean;
  openAddStickyModal: (color: 'yellow' | 'pink') => void;
  toggleBookmark: () => void;
  isBookmarked: boolean;
  onAddPages: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  triggerToast: (msg: string) => void;
}

export const NotebookToolbar: React.FC<NotebookToolbarProps> = ({
  zoomLevel,
  setZoomLevel,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  executeFormatting,
  activeHighlightColor,
  setActiveHighlightColor,
  applyHighlight,
  isEditMode,
  openAddStickyModal,
  toggleBookmark,
  isBookmarked,
  onAddPages,
  toggleFullscreen,
  isFullscreen,
  triggerToast,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 border bg-surface border-border rounded-2xl overflow-x-auto custom-scrollbar no-scrollbar flex-nowrap md:flex-wrap">
      {/* Zoom & Font selection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-surface-alt border border-border rounded-xl p-0.5 text-xs">
          <button
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            className="p-1 rounded-lg cursor-pointer hover:bg-surface"
          >
            -
          </button>
          <span className="px-2 font-mono font-bold text-[10px]">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
            className="p-1 rounded-lg cursor-pointer hover:bg-surface"
          >
            +
          </button>
        </div>

        <div className="relative">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="bg-surface-alt border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary cursor-pointer focus:outline-none"
          >
            <option value="sans">Aa Sans</option>
            <option value="serif">Aa Serif</option>
            <option value="mono">Aa Mono</option>
          </select>
        </div>

        <div className="flex items-center bg-surface-alt border border-border rounded-xl p-0.5 text-xs">
          <button
            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
            className="px-1.5 py-0.5 hover:bg-surface rounded cursor-pointer"
          >
            -
          </button>
          <span className="px-1.5 font-bold text-[10px]">{fontSize}px</span>
          <button
            onClick={() => setFontSize(Math.min(24, fontSize + 1))}
            className="px-1.5 py-0.5 hover:bg-surface rounded cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Text styling controls */}
      <div className="flex items-center gap-1.5 bg-surface-alt border border-border rounded-xl p-1">
        <button
          onClick={() => executeFormatting('bold')}
          className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
          title="Bold"
        >
          <IconBold size={14} />
        </button>
        <button
          onClick={() => executeFormatting('italic')}
          className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
          title="Italic"
        >
          <IconItalic size={14} />
        </button>
        <button
          onClick={() => executeFormatting('underline')}
          className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
          title="Underline"
        >
          <IconUnderline size={14} />
        </button>
        <button
          onClick={() => executeFormatting('strikeThrough')}
          className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
          title="Strikethrough"
        >
          <IconStrikethrough size={14} />
        </button>
        <span className="w-px h-4 mx-1 bg-border/60" />
        <button
          onClick={() => executeFormatting('insertUnorderedList')}
          className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
          title="Bullet List"
        >
          <IconList size={14} />
        </button>
        <button
          onClick={() => executeFormatting('insertOrderedList')}
          className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
          title="Numbered List"
        >
          <IconListNumbers size={14} />
        </button>
        <span className="w-px h-4 mx-1 bg-border/60" />
        <button
          onClick={() => executeFormatting('justifyLeft')}
          className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
          title="Align Left"
        >
          <IconAlignLeft size={14} />
        </button>
      </div>

      {/* Highlighter & colors */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-surface-alt border border-border rounded-xl p-1.5">
          {[
            { id: 'yellow', color: '#F59E0B' },
            { id: 'green', color: '#10B981' },
            { id: 'blue', color: '#3B82F6' },
            { id: 'purple', color: '#8B5CF6' },
            { id: 'pink', color: '#EC4899' },
          ].map((col) => (
            <button
              key={col.id}
              onClick={() => {
                setActiveHighlightColor(col.id);
                if (isEditMode) applyHighlight(col.id);
              }}
              title={`${col.id}${activeHighlightColor === col.id ? ' (active)' : ''}`}
              className={`rounded-full cursor-pointer transition-all duration-150 ${
                activeHighlightColor === col.id
                  ? 'w-4 h-4 ring-2 ring-offset-1 ring-rose-500'
                  : 'w-3.5 h-3.5 hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: col.color }}
            />
          ))}
        </div>

        <button
          onClick={() => openAddStickyModal('yellow')}
          className="p-2 transition-colors border cursor-pointer hover:bg-surface-hover border-border rounded-xl text-text-secondary"
        >
          <IconFileText size={16} />
        </button>
        <button
          onClick={toggleBookmark}
          className={`p-2 border rounded-xl cursor-pointer transition-colors ${
            isBookmarked
              ? 'bg-rose-500/10 text-rose-500 border-rose-200'
              : 'hover:bg-surface-hover text-text-secondary border-border'
          }`}
        >
          <IconBookmark size={16} />
        </button>
        <button
          onClick={() => triggerToast('Image insertion is coming soon in updates!')}
          className="p-2 transition-colors border cursor-pointer hover:bg-surface-hover border-border rounded-xl text-text-secondary"
        >
          <IconPhoto size={16} />
        </button>
      </div>

      {/* Fullscreen & Screen modes */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onAddPages}
          className="px-3.5 py-1.5 bg-rose-50/80 hover:bg-rose-100/80 text-rose-600 border border-rose-200 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-[0.97] transition-transform duration-100"
          title="Add 5 more pages to this notebook"
        >
          + Add 5 Pages
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2 transition-colors border cursor-pointer hover:bg-surface-hover border-border rounded-xl text-text-secondary"
        >
          <IconMaximize size={16} />
        </button>
      </div>
    </div>
  );
};
