import React from 'react';
import {
  IconMinimize,
  IconMaximize,
  IconLink,
  IconPlus,
  IconEdit,
  IconBook,
  IconLayout,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react';
import { type Mindmap, type MindmapNode } from '../../../../store/useAppStore';

interface MindmapToolbarProps {
  mindmap: Mindmap;
  selectedNode: MindmapNode | null;
  selectedNodeId: string | null;
  linkingSourceId: string | null;
  isFullScreen: boolean;
  setIsFullScreen: (val: boolean) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (val: boolean) => void;
  setLinkingSourceId: (id: string | null) => void;
  handleAddChildNode: () => void;
  handleAddSiblingNode: () => void;
  handleStartEditNode: (node: MindmapNode) => void;
  handleTidyLayout: () => void;
  onUpdate: (data: Partial<Mindmap>) => void;
  handleExportSvg: () => void;
  handleExportOutline: () => void;
  handleDeleteSelectedNode: () => void;
}

export const MindmapToolbar: React.FC<MindmapToolbarProps> = ({
  mindmap,
  selectedNode,
  selectedNodeId,
  linkingSourceId,
  isFullScreen,
  setIsFullScreen,
  isDrawerOpen,
  setIsDrawerOpen,
  setLinkingSourceId,
  handleAddChildNode,
  handleAddSiblingNode,
  handleStartEditNode,
  handleTidyLayout,
  onUpdate,
  handleExportSvg,
  handleExportOutline,
  handleDeleteSelectedNode,
}) => {
  return (
    <div className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 sm:gap-3 bg-surface/90 border border-border/60 p-1.5 sm:p-2 rounded-2xl shadow-xl backdrop-blur-md w-[95vw] md:max-w-2xl md:w-fit z-20 flex-wrap shrink-0">
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-all border-none bg-transparent cursor-pointer shrink-0 ${
          isFullScreen ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-surface-alt'
        }`}
        title={isFullScreen ? 'Exit Zen Mode' : 'Zen Mode'}
      >
        {isFullScreen ? <IconMinimize className="w-4 h-4" /> : <IconMaximize className="w-4 h-4" />}
      </button>

      <div className="w-px h-5 bg-border/40 shrink-0 mx-0.5" />

      <button
        onClick={() => {
          if (selectedNodeId) {
            setLinkingSourceId(selectedNodeId);
          } else {
            alert('Select a parent node first.');
          }
        }}
        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-all border-none bg-transparent cursor-pointer shrink-0 ${
          linkingSourceId ? 'bg-amber-500 text-white' : 'bg-transparent text-text-secondary hover:bg-surface-alt'
        }`}
        title="Connect node connection line"
      >
        <IconLink className="w-4 h-4" />
      </button>

      <button
        onClick={handleAddChildNode}
        disabled={!selectedNodeId}
        className="flex items-center gap-1 font-bold text-[10px] rounded-lg px-2 sm:px-3 py-1.5 bg-primary text-text-on-accent hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none border-none shrink-0"
      >
        <IconPlus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sub-topic</span>
      </button>

      <button
        onClick={handleAddSiblingNode}
        disabled={!selectedNodeId || selectedNode?.isRoot}
        className="flex items-center gap-1 font-bold text-[10px] rounded-lg px-2 sm:px-3 py-1.5 border border-border bg-surface hover:bg-surface-alt transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none text-text-secondary shrink-0"
      >
        <IconPlus className="w-3.5 h-3.5 text-text-muted" /> <span className="hidden sm:inline">Sibling</span>
      </button>

      <button
        onClick={() => {
          if (selectedNode) handleStartEditNode(selectedNode);
        }}
        disabled={!selectedNodeId}
        className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-alt disabled:opacity-40 border-none bg-transparent cursor-pointer shrink-0"
        title="Edit Node Text"
      >
        <IconEdit className="w-4 h-4" />
      </button>

      <button
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        disabled={!selectedNodeId}
        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 border-none bg-transparent cursor-pointer shrink-0 ${
          isDrawerOpen ? 'bg-primary/15 text-primary' : 'text-text-secondary hover:bg-surface-alt'
        }`}
        title="Open Advanced Notes & Media Panel"
      >
        <IconBook className="w-4 h-4" />
      </button>

      <button
        onClick={handleTidyLayout}
        className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-alt transition-colors border-none bg-transparent cursor-pointer shrink-0"
        title="Auto Align Mindmap Nodes neatly"
      >
        <IconLayout className="w-4 h-4" />
      </button>

      <div className="flex gap-1 items-center bg-surface-alt border border-border/50 p-0.5 rounded-lg border-l border-r border-border/50 px-1 sm:px-2 shrink-0">
        {['solid', 'dashed', 'dotted'].map((style) => (
          <button
            key={style}
            onClick={() => onUpdate({ edgeStyle: style as any })}
            className={`w-10 sm:w-14 h-5 rounded flex items-center justify-center transition-all border-none bg-transparent cursor-pointer shrink-0 ${
              (mindmap.edgeStyle || 'solid') === style
                ? 'bg-surface border border-border text-text-primary font-bold text-[8px] sm:text-[9px] uppercase tracking-wider shadow-sm'
                : 'text-text-muted hover:text-text-primary font-medium text-[8px] sm:text-[9px] uppercase tracking-wider'
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="relative group/export border-l border-border/50 pl-2 flex items-center shrink-0">
        <button
          className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-alt border-none bg-transparent cursor-pointer"
          title="Export Options"
        >
          <IconDownload className="w-4.5 h-4.5" />
        </button>

        <div className="absolute top-full right-0 pt-2 hidden group-hover/export:block z-30">
          <div className="bg-surface border border-border/55 rounded-xl shadow-lg p-1 min-w-[130px]">
            <button
              onClick={handleExportSvg}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt text-xs font-bold text-text-secondary hover:text-text-primary transition-colors border-none bg-transparent cursor-pointer"
            >
              Export SVG
            </button>
            <button
              onClick={handleExportOutline}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt text-xs font-bold text-text-secondary hover:text-text-primary transition-colors border-none bg-transparent cursor-pointer"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {selectedNode && !selectedNode.isRoot && (
        <button
          onClick={handleDeleteSelectedNode}
          className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors border-none bg-transparent cursor-pointer shrink-0"
          title="Delete Selected Node"
        >
          <IconTrash className="w-4.5 h-4.5" />
        </button>
      )}
    </div>
  );
};
