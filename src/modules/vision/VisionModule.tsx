import { useState, useRef, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import type { VisionNodeType } from '../../store/types';
import { VisionHeader } from './components/VisionHeader';
import { VisionBoardsSidebar } from './components/VisionBoardsSidebar';
import { VisionCreationDock } from './components/VisionCreationDock';
import { VisionBottomDock } from './components/VisionBottomDock';
import { VisionCanvas } from './components/VisionCanvas';
import { VisionInsightsPanel } from './components/VisionInsightsPanel';
import { VisionNodeInspector } from './components/VisionNodeInspector';
import { VisionDiscoverModal } from './components/VisionDiscoverModal';
import { VisionExportModal } from './components/VisionExportModal';
import { CreateBoardModal } from './components/CreateBoardModal';

export default function VisionModule() {
  const {
    visionBoards,
    activeBoardId,
    selectedNodeId,
    setSelectedNodeId,
    focusMode,
    addVisionNode,
    canvasPan,
    canvasZoom,
    setCanvasZoom,
    setCanvasPan,
  } = useAppStore();

  const addToast = useToastStore((s) => s.addToast);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Layout Drawers State (Responsive)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [viewTab, setViewTab] = useState<'DASHBOARD' | 'MY BOARDS'>('MY BOARDS');

  // Modals & Drawers
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectingNodeId, setInspectingNodeId] = useState<string | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Active Board with fallback
  const activeBoard = useMemo(() => {
    const found = visionBoards.find((b) => b.id === activeBoardId);
    return (
      found ||
      visionBoards[0] || {
        id: 'board-aesthetic-life',
        title: 'AESTHETIC LIFE',
        subtitle: '2025 Vision',
        category: 'FAVORITES' as const,
        icon: '✨',
        nodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }, [visionBoards, activeBoardId]);

  // Handle adding new node from creation dock directly into visible viewport center
  const handleAddNodeType = async (type: VisionNodeType) => {
    let title = 'New Node';
    let subtitle = '';
    let content = '';
    let imageUrl = '';
    let accentColor = '#3b82f6';
    let width = 320;
    let height = 220;

    if (type === 'image') {
      title = 'Coastal Haven';
      subtitle = 'Travel Ambition';
      imageUrl =
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop';
      accentColor = '#38bdf8';
      width = 340;
      height = 260;
    } else if (type === 'text') {
      title = 'CREATIVE LAB';
      subtitle = 'Typography Node';
      content = 'Design with poetic intention and timeless spatial balance.';
      accentColor = '#ec4899';
      width = 320;
      height = 210;
    } else if (type === 'goal') {
      title = 'MARATHON 42K';
      subtitle = 'Physical Peak';
      accentColor = '#3b82f6';
      width = 340;
      height = 160;
    } else if (type === 'audio') {
      title = 'Nordic Rain Lo-Fi';
      subtitle = 'Deep Ambient Flow';
      imageUrl =
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop';
      accentColor = '#10b981';
      width = 220;
      height = 240;
    } else if (type === 'quote') {
      title = '“';
      content = 'Simplicity is the ultimate sophistication.';
      accentColor = '#fef08a';
      width = 240;
      height = 180;
    } else if (type === 'shape') {
      title = 'Core Focus';
      content = 'Tectonic clarity in everyday execution.';
      accentColor = '#f59e0b';
      width = 260;
      height = 180;
    }

    const container = canvasContainerRef.current;
    const viewW = container?.clientWidth || window.innerWidth;
    const viewH = container?.clientHeight || window.innerHeight;

    // Center in current world view
    const worldX = Math.round((-canvasPan.x + viewW / 2 - width / 2) / canvasZoom);
    const worldY = Math.round((-canvasPan.y + viewH / 2 - height / 2) / canvasZoom);

    const newId = await addVisionNode({
      type,
      title,
      subtitle,
      content,
      imageUrl,
      accentColor,
      size: { width, height },
      position: { x: worldX, y: worldY },
    });

    setSelectedNodeId(newId);
    addToast('Card Created', `Added ${type} card directly to canvas.`, 'success');
  };

  // Fit View / Center Content
  const handleFitView = () => {
    if (activeBoard.nodes.length === 0) {
      setCanvasZoom(1.0);
      setCanvasPan({ x: 80, y: 40 });
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    activeBoard.nodes.forEach((n) => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.size?.width || 320));
      maxY = Math.max(maxY, n.position.y + (n.size?.height || 220));
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const viewportW = window.innerWidth - (leftSidebarOpen ? 300 : 0) - (rightSidebarOpen ? 310 : 0);
    const viewportH = window.innerHeight - 70;

    const scaleX = (viewportW * 0.8) / Math.max(contentWidth, 400);
    const scaleY = (viewportH * 0.8) / Math.max(contentHeight, 400);
    const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 1.2);

    const centerX = (viewportW - contentWidth * fitZoom) / 2 - minX * fitZoom;
    const centerY = (viewportH - contentHeight * fitZoom) / 2 - minY * fitZoom;

    setCanvasZoom(fitZoom);
    setCanvasPan({ x: Math.round(centerX), y: Math.round(centerY) });
  };

  const handleOpenInspector = (nodeId: string) => {
    setInspectingNodeId(nodeId);
    setIsInspectorOpen(true);
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-background text-text-primary">
      {/* ── TOP HEADER BAR ── */}
      <VisionHeader
        board={activeBoard}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenDiscover={() => setIsDiscoverOpen(true)}
        leftSidebarOpen={!focusMode && leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={!focusMode && rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        viewTab={viewTab}
        setViewTab={setViewTab}
      />

      {/* ── MAIN WORKSPACE AREA ── */}
      <div className="flex-1 relative flex flex-row overflow-hidden">
        {/* LEFT SIDEBAR (Multi-Board Navigator) */}
        {!focusMode && (
          <VisionBoardsSidebar
            isOpen={leftSidebarOpen}
            onClose={() => setLeftSidebarOpen(false)}
            onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
          />
        )}

        {/* CENTER CANVAS CONTAINER */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-background">
          {/* Canvas Engine */}
          <VisionCanvas
            board={activeBoard}
            onInspectNode={handleOpenInspector}
            containerRef={canvasContainerRef}
          />

          {/* Left Floating Creation Toolbar Dock */}
          <VisionCreationDock onAddNodeType={handleAddNodeType} />

          {/* Bottom Floating Canvas Navigation Dock */}
          <VisionBottomDock onFitView={handleFitView} />
        </main>

        {/* RIGHT SIDEBAR (Daily Affirmations & Mindfulness Space) */}
        {!focusMode && (
          <VisionInsightsPanel
            board={activeBoard}
            isOpen={rightSidebarOpen}
            onClose={() => setRightSidebarOpen(false)}
          />
        )}
      </div>

      {/* ── NODE INSPECTOR DRAWER (Edit Node) ── */}
      <VisionNodeInspector
        nodeId={inspectingNodeId || selectedNodeId}
        isOpen={isInspectorOpen}
        onClose={() => {
          setIsInspectorOpen(false);
          setInspectingNodeId(null);
        }}
      />

      {/* ── CREATE BOARD MODAL ── */}
      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
      />

      {/* ── DISCOVER INSPIRATION MODAL ── */}
      <VisionDiscoverModal
        isOpen={isDiscoverOpen}
        onClose={() => setIsDiscoverOpen(false)}
      />

      {/* ── SHARE & EXPORT MODAL (PNG / PDF) ── */}
      <VisionExportModal
        board={activeBoard}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvasContainerRef={canvasContainerRef}
      />
    </div>
  );
}
