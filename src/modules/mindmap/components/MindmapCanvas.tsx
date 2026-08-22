import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore, type Mindmap } from '../../../store/useAppStore';
import { useToastStore } from '../../../store/useToastStore';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { MindmapModals } from './MindmapModals';
import { MindmapSvgLayer } from './canvas/MindmapSvgLayer';
import { MindmapNodeItem } from './canvas/MindmapNodeItem';
import { MindmapCanvasControls } from './canvas/MindmapCanvasControls';
import { MindmapToolbar } from './canvas/MindmapToolbar';
import { MiniMapPreview } from './canvas/MiniMapPreview';
import { calculateTidyLayout } from '../utils/mindmapLayout';
import { exportMindmapJson, exportMindmapSvg } from '../utils/mindmapExport';
import { useMindmapCanvasInteractions } from '../hooks/useMindmapCanvasInteractions';
import { useMindmapNodeOperations } from '../hooks/useMindmapNodeOperations';

export function MindmapCanvas({
  mindmap,
  onUpdate,
  isLeftSidebarOpen,
  setIsLeftSidebarOpen,
  isFullScreen,
  setIsFullScreen,
  isRenameModalOpen,
  setIsRenameModalOpen,
  titleInput,
  setTitleInput,
}: {
  mindmap: Mindmap;
  onUpdate: (data: Partial<Mindmap>) => void;
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (val: boolean) => void;
  isFullScreen: boolean;
  setIsFullScreen: (val: boolean) => void;
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (val: boolean) => void;
  titleInput: string;
  setTitleInput: (val: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const showConfirm = useAppStore((state) => state.showConfirm);
  const addToast = useToastStore((s) => s.addToast);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesModalNodeId, setNotesModalNodeId] = useState<string | null>(null);
  const [notesActiveTab, setNotesActiveTab] = useState<'view' | 'edit'>('view');
  const [canvasSearchQuery, setCanvasSearchQuery] = useState('');
  const [pdfViewerPdf, setPdfViewerPdf] = useState<{ name: string; base64: string } | null>(null);
  const [fullScreenImages, setFullScreenImages] = useState<string[] | null>(null);
  const [fullScreenImageIdx, setFullScreenImageIdx] = useState(0);

  useEffect(() => {
    if (!pdfViewerPdf) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPdfViewerPdf(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [pdfViewerPdf]);

  const [selectedNodeIdInternal, setSelectedNodeIdInternal] = useState<string | null>(null);

  const nodeOps = useMindmapNodeOperations({
    mindmap,
    selectedNodeId: selectedNodeIdInternal,
    setSelectedNodeId: setSelectedNodeIdInternal,
    onUpdate,
    showConfirm,
    setIsDrawerOpen,
  });

  const canvasInteractions = useMindmapCanvasInteractions({
    mindmap,
    containerRef,
    editingNodeId: nodeOps.editingNodeId,
    onUpdate,
    handleAddChildNode: nodeOps.handleAddChildNode,
    handleAddSiblingNode: nodeOps.handleAddSiblingNode,
    handleDeleteSelectedNode: nodeOps.handleDeleteSelectedNode,
  });

  // Sync internal selectedNodeId with canvas interactions
  useEffect(() => {
    setSelectedNodeIdInternal(canvasInteractions.selectedNodeId);
  }, [canvasInteractions.selectedNodeId]);

  const handleTidyLayout = () => {
    const newNodes = calculateTidyLayout(mindmap);
    if (newNodes) {
      onUpdate({ nodes: newNodes });
      addToast('Layout Aligned', 'Nodes have been reorganized neatly.', 'success');
    }
  };

  const notesModalNode = useMemo(() => {
    return mindmap.nodes.find((n) => n.id === notesModalNodeId) || null;
  }, [mindmap.nodes, notesModalNodeId]);

  const selectedNode =
    mindmap.nodes.find((n) => n.id === canvasInteractions.selectedNodeId) || null;

  return (
    <div className="flex-1 w-full h-full flex relative overflow-hidden touch-none">
      {/* Infinite Canvas */}
      <div
        ref={containerRef}
        onMouseDown={canvasInteractions.handleMouseDown}
        onMouseMove={canvasInteractions.handleMouseMove}
        onMouseUp={canvasInteractions.handleMouseUp}
        onDoubleClick={canvasInteractions.handleDoubleClickCanvas}
        className="flex-1 h-full select-none cursor-grab active:cursor-grabbing relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)]"
        style={{
          backgroundSize: `${30 * canvasInteractions.zoom}px ${30 * canvasInteractions.zoom}px`,
          backgroundPosition: `${canvasInteractions.pan.x}px ${canvasInteractions.pan.y}px`,
        }}
      >
        {/* Node & Link Scaled Canvas Container */}
        <div
          style={{
            transform: `translate(${canvasInteractions.pan.x}px, ${canvasInteractions.pan.y}px) scale(${canvasInteractions.zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}
        >
          {/* SVG Bezier Curves Layer */}
          <MindmapSvgLayer
            visibleLinks={nodeOps.visibleLinks}
            mindmap={mindmap}
            getNodeCenters={canvasInteractions.getNodeCenters}
          />

          {/* HTML Nodes Layer */}
          {nodeOps.visibleNodes.map((node) => (
            <MindmapNodeItem
              key={node.id}
              node={node}
              mindmap={mindmap}
              isSelected={canvasInteractions.selectedNodeId === node.id}
              isLinkingSource={nodeOps.linkingSourceId === node.id}
              isMatch={
                canvasSearchQuery.trim() !== '' &&
                node.text.toLowerCase().includes(canvasSearchQuery.toLowerCase())
              }
              editingNodeId={nodeOps.editingNodeId}
              editingText={nodeOps.editingText}
              setEditingText={nodeOps.setEditingText}
              setEditingNodeId={nodeOps.setEditingNodeId}
              handleSaveNodeText={nodeOps.handleSaveNodeText}
              handleStartDragNode={canvasInteractions.handleStartDragNode}
              handleNodeClick={nodeOps.handleNodeClick}
              handleStartEditNode={nodeOps.handleStartEditNode}
              handleToggleCollapse={nodeOps.handleToggleCollapse}
              setFullScreenImages={setFullScreenImages}
              setFullScreenImageIdx={setFullScreenImageIdx}
              setPdfViewerPdf={setPdfViewerPdf}
              setNotesModalNodeId={setNotesModalNodeId}
              setNotesActiveTab={setNotesActiveTab}
              setIsNotesModalOpen={setIsNotesModalOpen}
              setSelectedNodeId={canvasInteractions.setSelectedNodeId}
              setIsDrawerOpen={setIsDrawerOpen}
            />
          ))}
        </div>

        {/* Floating Canvas UI Indicators (Zoom state & Node search) */}
        <MindmapCanvasControls
          zoom={canvasInteractions.zoom}
          setZoom={canvasInteractions.setZoom}
          isLeftSidebarOpen={isLeftSidebarOpen}
          setIsLeftSidebarOpen={setIsLeftSidebarOpen}
          canvasSearchQuery={canvasSearchQuery}
          setCanvasSearchQuery={setCanvasSearchQuery}
          isZoomMenuOpen={canvasInteractions.isZoomMenuOpen}
          setIsZoomMenuOpen={canvasInteractions.setIsZoomMenuOpen}
          handleOpenAll={nodeOps.handleOpenAll}
          handleCloseAll={nodeOps.handleCloseAll}
          handleTidyLayout={handleTidyLayout}
          handleCenterCamera={canvasInteractions.handleCenterCamera}
        />

        {/* Mini-Map Preview */}
        <MiniMapPreview
          visibleNodes={nodeOps.visibleNodes}
          miniMapBounds={canvasInteractions.miniMapBounds}
        />

        {/* Floating Apple-Style Toolbar at Top Center */}
        <MindmapToolbar
          mindmap={mindmap}
          selectedNode={selectedNode}
          selectedNodeId={canvasInteractions.selectedNodeId}
          linkingSourceId={nodeOps.linkingSourceId}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          setLinkingSourceId={nodeOps.setLinkingSourceId}
          handleAddChildNode={nodeOps.handleAddChildNode}
          handleAddSiblingNode={nodeOps.handleAddSiblingNode}
          handleStartEditNode={nodeOps.handleStartEditNode}
          handleTidyLayout={handleTidyLayout}
          onUpdate={onUpdate}
          handleExportSvg={() => exportMindmapSvg(mindmap, nodeOps.visibleNodes, nodeOps.visibleLinks)}
          handleExportOutline={() => exportMindmapJson(mindmap)}
          handleDeleteSelectedNode={nodeOps.handleDeleteSelectedNode}
        />
      </div>

      {isDrawerOpen && selectedNode && (
        <NodeDetailsPanel
          selectedNode={selectedNode}
          newLinkUrl={nodeOps.newLinkUrl}
          setNewLinkUrl={nodeOps.setNewLinkUrl}
          handleAddLink={nodeOps.handleAddLink}
          handleRemoveLink={nodeOps.handleRemoveLink}
          handleImageUpload={nodeOps.handleImageUpload}
          handleRemoveImage={nodeOps.handleRemoveImage}
          handlePdfUpload={nodeOps.handlePdfUpload}
          handleRemovePdf={nodeOps.handleRemovePdf}
          handleUpdateNodeProp={nodeOps.handleUpdateNodeProp}
          handleChangeNodeColor={nodeOps.handleChangeNodeColor}
          setFullScreenImages={setFullScreenImages}
          setFullScreenImageIdx={setFullScreenImageIdx}
          setPdfViewerPdf={setPdfViewerPdf}
          setIsDrawerOpen={setIsDrawerOpen}
          setNotesModalNodeId={setNotesModalNodeId}
          setNotesActiveTab={setNotesActiveTab}
          setIsNotesModalOpen={setIsNotesModalOpen}
        />
      )}

      <MindmapModals
        isRenameModalOpen={isRenameModalOpen}
        setIsRenameModalOpen={setIsRenameModalOpen}
        titleInput={titleInput}
        setTitleInput={setTitleInput}
        handleRenameMindmap={() => {
          if (titleInput.trim()) {
            onUpdate({ title: titleInput.trim() });
            setIsRenameModalOpen(false);
          }
        }}
        fullScreenImages={fullScreenImages}
        setFullScreenImages={setFullScreenImages}
        fullScreenImageIdx={fullScreenImageIdx}
        setFullScreenImageIdx={setFullScreenImageIdx}
        pdfViewerPdf={pdfViewerPdf}
        setPdfViewerPdf={setPdfViewerPdf}
        isNotesModalOpen={isNotesModalOpen}
        setIsNotesModalOpen={setIsNotesModalOpen}
        notesModalNode={notesModalNode}
        setNotesModalNodeId={setNotesModalNodeId}
        notesActiveTab={notesActiveTab}
        setNotesActiveTab={setNotesActiveTab}
        onUpdate={onUpdate}
        mindmap={mindmap}
      />
    </div>
  );
}

export default MindmapCanvas;
