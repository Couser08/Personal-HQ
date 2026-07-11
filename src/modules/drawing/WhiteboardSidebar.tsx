import React from 'react';
import { 
  IconPlus, IconTrash, IconFileText, IconMaximize, 
  IconMinimize, IconChevronDown, IconChevronUp, IconChevronLeft 
} from '@tabler/icons-react';

interface Sketch {
  id: string;
  title: string;
  createdAt: string;
}

interface WhiteboardSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  isDrawFilesCollapsed: boolean;
  setIsDrawFilesCollapsed: (val: boolean) => void;
  sketches: Sketch[];
  activeSketchId: string;
  setActiveSketchId: (id: string) => void;
  renameId: string | null;
  renameTitle: string;
  setRenameTitle: (val: string) => void;
  finishRename: () => void;
  startRename: (id: string, currentTitle: string, e: React.MouseEvent) => void;
  handleDeleteSketch: (id: string, e: React.MouseEvent) => void;
  handleCreateNewSketch: () => void;
  isFullScreen: boolean;
  setIsFullScreen: (val: boolean) => void;
  isoGrid: boolean;
  setIsoGrid: (val: boolean) => void;
  excalidrawAPI: any;
  addStickyNote: (color: string) => void;
}

export const WhiteboardSidebar: React.FC<WhiteboardSidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isDrawFilesCollapsed,
  setIsDrawFilesCollapsed,
  sketches,
  activeSketchId,
  setActiveSketchId,
  renameId,
  renameTitle,
  setRenameTitle,
  finishRename,
  startRename,
  handleDeleteSketch,
  handleCreateNewSketch,
  isFullScreen,
  setIsFullScreen,
  isoGrid,
  setIsoGrid,
  excalidrawAPI,
  addStickyNote,
}) => {
  if (isSidebarCollapsed) return null;

  return (
    <div className="w-[250px] h-full flex flex-col gap-4 p-4.5 rounded-3xl border border-border/50 bg-surface/40 backdrop-blur-md shadow-sm shrink-0 text-left overflow-y-auto custom-scrollbar select-none">
      
      {/* Sketchbook Library Header */}
      <div 
        onClick={() => setIsDrawFilesCollapsed(!isDrawFilesCollapsed)}
        className="flex items-center justify-between pb-2 border-b border-border/40 cursor-pointer select-none group"
      >
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Sketchbook</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-text-secondary">Manage draw files</span>
            {isDrawFilesCollapsed ? (
              <IconChevronDown size={11} className="text-text-muted" />
            ) : (
              <IconChevronUp size={11} className="text-text-muted" />
            )}
          </div>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCreateNewSketch();
            }}
            className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/10"
            title="Create New Canvas"
          >
            <IconPlus size={15} />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarCollapsed(true);
            }}
            className="w-7 h-7 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-secondary flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Hide Sketch Library"
          >
            <IconChevronLeft size={14} />
          </button>
        </div>
      </div>

      {/* List of Save Slots */}
      {!isDrawFilesCollapsed && (
        <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto custom-scrollbar">
          {sketches.map((sk) => {
            const active = sk.id === activeSketchId;
            const isRenaming = renameId === sk.id;

            return (
              <div
                key={sk.id}
                onClick={() => setActiveSketchId(sk.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  active 
                    ? 'bg-surface border-border shadow-sm text-primary' 
                    : 'bg-transparent border-transparent hover:bg-surface-alt/45 text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <IconFileText size={15} className={active ? 'text-primary' : 'text-text-muted'} />
                  {isRenaming ? (
                    <input
                      type="text"
                      value={renameTitle}
                      onChange={(e) => setRenameTitle(e.target.value)}
                      onBlur={finishRename}
                      onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                      className="bg-transparent border-none outline-none font-semibold text-xs text-text-primary flex-1 py-0 min-w-0"
                      autoFocus
                    />
                  ) : (
                    <span 
                      onDoubleClick={(e) => startRename(sk.id, sk.title, e)}
                      className="text-xs font-bold truncate leading-none"
                    >
                      {sk.title}
                    </span>
                  )}
                </div>

                {!isRenaming && sketches.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteSketch(sk.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                  >
                    <IconTrash size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Mode snap option */}
      <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fullscreen Mode</span>
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
          >
            {isFullScreen ? <IconMinimize size={10} /> : <IconMaximize size={10} />}
            <span>{isFullScreen ? "Minimize" : "Maximize"}</span>
          </button>
        </div>
        <span className="text-[9px] text-text-secondary leading-normal">
          Expands the canvas to fill the entire screen for distraction-free sketching.
        </span>
      </div>

      {/* Isometric grid snap toggle options */}
      <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Isometric Grid</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isoGrid} 
              onChange={(e) => setIsoGrid(e.target.checked)} 
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <span className="text-[9px] text-text-secondary leading-normal">
          Snaps lines to 30-degree angles for technical drawing.
        </span>
      </div>

      {/* Sticky Notes */}
      <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sticky Notes</span>
        <p className="text-[9px] text-text-secondary leading-normal">
          Quickly drop a colored, grouped post-it note at the center of your screen viewport.
        </p>
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          <button
            onClick={() => addStickyNote('yellow')}
            disabled={!excalidrawAPI}
            className="h-6 rounded-md bg-[#fef08a] border border-[#ca8a04]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Add Yellow Sticky Note"
          />
          <button
            onClick={() => addStickyNote('blue')}
            disabled={!excalidrawAPI}
            className="h-6 rounded-md bg-[#bfdbfe] border border-[#2563eb]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Add Blue Sticky Note"
          />
          <button
            onClick={() => addStickyNote('pink')}
            disabled={!excalidrawAPI}
            className="h-6 rounded-md bg-[#fbcfe8] border border-[#db2777]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Add Pink Sticky Note"
          />
          <button
            onClick={() => addStickyNote('green')}
            disabled={!excalidrawAPI}
            className="h-6 rounded-md bg-[#bbf7d0] border border-[#16a34a]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Add Green Sticky Note"
          />
        </div>
      </div>

    </div>
  );
};
