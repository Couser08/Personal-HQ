import React from 'react';
import {
  IconLink,
  IconBook,
  IconExternalLink,
  IconPhoto,
} from '@tabler/icons-react';
import { type MindmapNode, type Mindmap } from '../../../../store/useAppStore';
import { COLOR_PRESETS, getDomainFavicon } from '../../utils/mindmapUtils';

interface MindmapNodeItemProps {
  node: MindmapNode;
  mindmap: Mindmap;
  isSelected: boolean;
  isLinkingSource: boolean;
  isMatch: boolean;
  editingNodeId: string | null;
  editingText: string;
  setEditingText: (text: string) => void;
  setEditingNodeId: (id: string | null) => void;
  handleSaveNodeText: (id: string) => void;
  handleStartDragNode: (e: React.MouseEvent, id: string) => void;
  handleNodeClick: (id: string) => void;
  handleStartEditNode: (node: MindmapNode) => void;
  handleToggleCollapse: (e: React.MouseEvent, id: string) => void;
  setFullScreenImages: (images: string[] | null) => void;
  setFullScreenImageIdx: (idx: number) => void;
  setPdfViewerPdf: (pdf: { name: string; base64: string } | null) => void;
  setNotesModalNodeId: (id: string | null) => void;
  setNotesActiveTab: (tab: 'view' | 'edit') => void;
  setIsNotesModalOpen: (open: boolean) => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsDrawerOpen: (open: boolean) => void;
}

export const MindmapNodeItem: React.FC<MindmapNodeItemProps> = ({
  node,
  mindmap,
  isSelected,
  isLinkingSource,
  isMatch,
  editingNodeId,
  editingText,
  setEditingText,
  setEditingNodeId,
  handleSaveNodeText,
  handleStartDragNode,
  handleNodeClick,
  handleStartEditNode,
  handleToggleCollapse,
  setFullScreenImages,
  setFullScreenImageIdx,
  setPdfViewerPdf,
  setNotesModalNodeId,
  setNotesActiveTab,
  setIsNotesModalOpen,
  setSelectedNodeId,
  setIsDrawerOpen,
}) => {
  const colorPreset = COLOR_PRESETS.find((c) => c.id === node.color) || COLOR_PRESETS[5];
  const hasChildren = mindmap.nodes.some((n) => n.parentId === node.id);

  return (
    <div
      onMouseDown={(e) => handleStartDragNode(e, node.id)}
      onClick={(e) => {
        e.stopPropagation();
        handleNodeClick(node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        handleStartEditNode(node);
      }}
      style={{
        left: node.x,
        top: node.y,
        width: node.isRoot ? '180px' : '160px',
        minHeight: node.isRoot ? '64px' : '44px',
        position: 'absolute',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
      }}
      className={`rounded-2xl border px-3 py-2 flex items-center justify-center text-center cursor-pointer transition-all shadow-sm font-semibold text-xs leading-tight relative group ${
        node.isRoot
          ? 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-text-primary text-[13px] font-black shadow-lg shadow-stone-150/40 dark:shadow-none flex-col gap-1.5 hover:shadow-xl'
          : `${colorPreset.bg} ${isSelected ? 'ring-4 ring-primary/15 border-primary shadow-md' : 'hover:shadow-md'}`
      } ${isLinkingSource ? 'ring-4 ring-amber-500/20 border-amber-500 animate-pulse' : ''} ${
        isMatch ? 'ring-4 ring-amber-400 border-amber-400 shadow-md scale-105 z-10' : ''
      }`}
    >
      {editingNodeId === node.id ? (
        <input
          type="text"
          value={editingText}
          autoFocus
          onBlur={() => handleSaveNodeText(node.id)}
          onChange={(e) => setEditingText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveNodeText(node.id);
            if (e.key === 'Escape') setEditingNodeId(null);
          }}
          className="w-full bg-surface-alt border border-primary/40 rounded-lg px-2 py-1 text-xs text-text-primary text-center font-bold outline-none focus:ring-1 focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex items-center justify-center flex-wrap gap-1 mb-1">
            {node.icon && <span className={`${node.isRoot ? 'text-lg mb-0.5' : 'text-xs'}`}>{node.icon}</span>}

            {node.linkUrl && (
              <a
                href={node.linkUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:opacity-80 p-0.5"
                title="Open Link"
              >
                <IconExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {node.links && node.links.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(node.links![0], '_blank', 'noopener,noreferrer');
                }}
                className="text-primary hover:opacity-80 p-0.5 cursor-pointer flex items-center"
                title={`Open link: ${node.links[0]}`}
              >
                {getDomainFavicon(node.links[0]) ? (
                  <img
                    src={getDomainFavicon(node.links[0])}
                    alt=""
                    className="w-3.5 h-3.5 rounded-sm"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/favicon.svg';
                    }}
                  />
                ) : (
                  <IconExternalLink className="w-3.5 h-3.5" />
                )}
              </span>
            )}

            {((node.images && node.images.length > 0) || node.imageUrl) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const imgs =
                    node.images && node.images.length > 0 ? node.images : node.imageUrl ? [node.imageUrl] : [];
                  if (imgs.length > 0) {
                    setFullScreenImages(imgs);
                    setFullScreenImageIdx(0);
                  }
                }}
                className="text-blue-500 hover:text-blue-600 p-0.5 cursor-pointer flex items-center justify-center pointer-events-auto border-none bg-transparent"
                title="Open Image Gallery"
              >
                <IconPhoto className="w-3.5 h-3.5" />
              </button>
            )}

            {node.pdfs && node.pdfs.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPdfViewerPdf(node.pdfs![0]);
                }}
                className="text-red-500 hover:text-red-600 p-0.5 cursor-pointer flex items-center justify-center font-bold text-[8px] border border-red-500/20 px-1 rounded bg-red-500/5 leading-none pointer-events-auto bg-transparent"
                title={`View ${node.pdfs[0].name}`}
              >
                PDF
              </button>
            )}

            {node.notes && <IconBook className="w-3.5 h-3.5 text-text-muted" title="Has markdown notes" />}
          </div>

          {(node.notes ||
            (node.links && node.links.length > 0) ||
            (node.images && node.images.length > 0) ||
            node.imageUrl ||
            (node.pdfs && node.pdfs.length > 0)) && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md border border-border/80 rounded-full px-2 py-1 shadow-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all z-50 pointer-events-auto shrink-0 select-none">
              {node.notes && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotesModalNodeId(node.id);
                    setNotesActiveTab('view');
                    setIsNotesModalOpen(true);
                  }}
                  className="w-6.5 h-6.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 flex items-center justify-center text-text-secondary hover:text-amber-500 transition-colors cursor-pointer border-none bg-transparent"
                  title="Read Advanced Notes"
                >
                  <IconBook className="w-3.5 h-3.5" />
                </button>
              )}
              {node.links && node.links.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                    setIsDrawerOpen(true);
                  }}
                  className="w-6.5 h-6.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 flex items-center justify-center text-text-secondary hover:text-blue-500 transition-colors cursor-pointer border-none bg-transparent"
                  title="View Web Links"
                >
                  <IconLink className="w-3.5 h-3.5" />
                </button>
              )}
              {((node.images && node.images.length > 0) || node.imageUrl) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const imgs =
                      node.images && node.images.length > 0 ? node.images : node.imageUrl ? [node.imageUrl] : [];
                    if (imgs.length > 0) {
                      setFullScreenImages(imgs);
                      setFullScreenImageIdx(0);
                    }
                  }}
                  className="w-6.5 h-6.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 flex items-center justify-center text-text-secondary hover:text-emerald-500 transition-colors cursor-pointer border-none bg-transparent"
                  title="Open Image Gallery"
                >
                  <IconPhoto className="w-3.5 h-3.5" />
                </button>
              )}
              {node.pdfs &&
                node.pdfs.length > 0 &&
                node.pdfs.map((pdf, pdfIdx) => (
                  <button
                    key={pdfIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfViewerPdf(pdf);
                    }}
                    className="h-6.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 flex items-center gap-1 px-1.5 text-text-secondary hover:text-red-500 transition-colors cursor-pointer pointer-events-auto border-none bg-transparent"
                    title={pdf.name}
                  >
                    <span className="text-[8px] font-bold text-red-500 border border-red-500/20 px-1 rounded bg-red-500/5 leading-none">
                      PDF
                    </span>
                    <span className="text-[10px] max-w-[60px] truncate">{pdf.name}</span>
                  </button>
                ))}
            </div>
          )}

          <span
            className={`break-words w-full truncate-3-lines ${
              node.isRoot ? 'font-extrabold text-[13px] tracking-tight' : 'font-bold'
            }`}
          >
            {node.text}
          </span>
          {node.isRoot && <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Mind Map</span>}
        </div>
      )}

      {hasChildren && !node.isRoot && (
        <button
          onClick={(e) => handleToggleCollapse(e, node.id)}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{
            position: 'absolute',
            left: node.side === 'left' ? '-7px' : node.side === 'right' ? 'auto' : '50%',
            right: node.side === 'right' ? '-7px' : 'auto',
            bottom: node.side === 'bottom' ? '-7px' : 'auto',
            top: node.side === 'bottom' ? 'auto' : '50%',
            transform: node.side === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: 20,
          }}
          className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] font-black transition-all shadow-sm pointer-events-auto ${
            node.collapsed
              ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600'
              : 'bg-surface hover:bg-surface-alt border-border text-text-secondary hover:text-text-primary'
          }`}
          title={node.collapsed ? 'Expand branch' : 'Collapse branch'}
        >
          {node.collapsed ? '+' : '–'}
        </button>
      )}
    </div>
  );
};
