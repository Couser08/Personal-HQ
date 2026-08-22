import React from 'react';
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconZoomIn,
  IconZoomOut,
  IconLayout,
  IconFocusCentered,
  IconDots,
} from '@tabler/icons-react';

interface MindmapCanvasControlsProps {
  zoom: number;
  setZoom: (fn: (prev: number) => number) => void;
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (val: boolean) => void;
  canvasSearchQuery: string;
  setCanvasSearchQuery: (q: string) => void;
  isZoomMenuOpen: boolean;
  setIsZoomMenuOpen: (open: boolean) => void;
  handleOpenAll: () => void;
  handleCloseAll: () => void;
  handleTidyLayout: () => void;
  handleCenterCamera: () => void;
}

export const MindmapCanvasControls: React.FC<MindmapCanvasControlsProps> = ({
  zoom,
  setZoom,
  isLeftSidebarOpen,
  setIsLeftSidebarOpen,
  canvasSearchQuery,
  setCanvasSearchQuery,
  isZoomMenuOpen,
  setIsZoomMenuOpen,
  handleOpenAll,
  handleCloseAll,
  handleTidyLayout,
  handleCenterCamera,
}) => {
  return (
    <>
      {/* Floating Canvas UI Indicators (Zoom state & Node search) */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 sm:gap-2 z-30 flex-wrap sm:flex-nowrap max-w-[calc(100%-2rem)]">
        {/* Sidebar Toggle Button on top left */}
        <button
          type="button"
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all border border-border/50 shadow-md backdrop-blur cursor-pointer shrink-0 ${
            isLeftSidebarOpen ? 'bg-primary text-white border-primary' : 'bg-surface/85 text-text-secondary hover:bg-surface-alt'
          }`}
          title={isLeftSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {isLeftSidebarOpen ? <IconChevronLeft className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
        </button>

        <div className="hidden sm:block bg-surface/80 border border-border/50 px-3 py-1.5 rounded-2xl text-[10px] font-black text-text-secondary uppercase tracking-widest backdrop-blur shadow-sm select-none">
          {zoom === 1 ? '100% Zoom' : `${Math.round(zoom * 100)}% Zoom`}
        </div>

        <div className="relative flex items-center bg-surface/80 border border-border/50 rounded-2xl shadow-sm backdrop-blur">
          <IconSearch className="w-3.5 h-3.5 absolute left-3 text-text-muted" />
          <input
            type="text"
            placeholder="Find node..."
            value={canvasSearchQuery}
            onChange={(e) => setCanvasSearchQuery(e.target.value)}
            className="bg-transparent border-none pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted w-24 sm:w-28 focus:w-40 transition-all duration-300 rounded-2xl"
          />
          {canvasSearchQuery && (
            <button
              type="button"
              onClick={() => setCanvasSearchQuery('')}
              className="absolute right-2 text-text-muted hover:text-text-primary text-[11px] font-bold border-none bg-transparent cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Zoom and layout controls vertical popover menu */}
      <div className="absolute bottom-24 md:bottom-4 left-4 z-30 flex flex-col items-center gap-2.5">
        {isZoomMenuOpen && (
          <div className="flex flex-col gap-2 animate-fade-in-up">
            <button
              type="button"
              onClick={() => {
                handleOpenAll();
                setIsZoomMenuOpen(false);
              }}
              className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Expand All Branches"
            >
              <IconChevronDown className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                handleCloseAll();
                setIsZoomMenuOpen(false);
              }}
              className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Collapse All Branches"
            >
              <IconChevronUp className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom((prev) => Math.min(prev * 1.15, 2.5));
              }}
              className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Zoom In"
            >
              <IconZoomIn className="w-5 h-5" />
            </button>

            <div className="w-10 h-7 rounded-lg bg-surface-alt border border-border/40 text-text-primary text-[10px] font-extrabold flex items-center justify-center shadow-sm select-none">
              {Math.round(zoom * 100)}%
            </div>

            <button
              type="button"
              onClick={() => {
                setZoom((prev) => Math.max(prev / 1.15, 0.4));
              }}
              className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Zoom Out"
            >
              <IconZoomOut className="w-5 h-5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleTidyLayout}
          className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
          title="Auto-Arrange Layout"
        >
          <IconLayout className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleCenterCamera}
          className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
          title="Center Camera"
        >
          <IconFocusCentered className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
          className={`w-10 h-10 rounded-2xl border border-border/80 text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
            isZoomMenuOpen ? 'bg-primary text-white border-primary' : 'bg-surface hover:bg-surface-hover'
          }`}
          title="More Canvas Controls"
        >
          <IconDots className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
