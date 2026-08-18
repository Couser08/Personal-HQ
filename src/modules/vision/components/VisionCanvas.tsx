import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionBoard, VisionNode } from '../../../store/types';
import { VisionNodeCard } from './VisionNodes';

interface VisionCanvasProps {
  board: VisionBoard;
  onInspectNode: (nodeId: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  board,
  onInspectNode,
  containerRef,
}) => {
  const {
    activeTool,
    canvasTheme,
    canvasZoom,
    setCanvasZoom,
    canvasPan,
    setCanvasPan,
    selectedNodeId,
    setSelectedNodeId,
    updateVisionNodePosition,
    updateVisionNodeSize,
    updateVisionNode,
    deleteVisionNode,
    duplicateVisionNode,
  } = useAppStore();

  // Dragging state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [resizingState, setResizingState] = useState<{
    nodeId: string;
    handle: string;
    startX: number;
    startY: number;
    initW: number;
    initH: number;
    initX: number;
    initY: number;
  } | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initNodeX: number;
    initNodeY: number;
  }>({ startX: 0, startY: 0, initNodeX: 0, initNodeY: 0 });

  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Touch gesture state
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    initPanX: number;
    initPanY: number;
    initDist: number;
    initZoom: number;
  }>({
    startX: 0,
    startY: 0,
    initPanX: 0,
    initPanY: 0,
    initDist: 0,
    initZoom: 1,
  });

  // ── FIX AUTO ZOOM: Native non-passive wheel listener attached to container DOM ──
  // This explicitly prevents browser from zooming the webpage on trackpad pinch or Ctrl+wheel!
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      // Intercept wheel to zoom/pan ONLY the canvas, never the browser document!
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Precise Pinch-to-zoom or Ctrl+Scroll
        const zoomDelta = e.deltaY < 0 ? 1.09 : 0.91;
        setCanvasZoom((prevZoom) => {
          const nextZoom = Math.min(Math.max(prevZoom * zoomDelta, 0.25), 2.5);
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          setCanvasPan((prevPan) => ({
            x: mouseX - (mouseX - prevPan.x) * (nextZoom / prevZoom),
            y: mouseY - (mouseY - prevPan.y) * (nextZoom / prevZoom),
          }));
          return nextZoom;
        });
      } else {
        // Smooth Canvas Pan
        setCanvasPan((prev) => ({
          x: prev.x - e.deltaX * 0.9,
          y: prev.y - e.deltaY * 0.9,
        }));
      }
    };

    container.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheelNative);
    };
  }, [containerRef, setCanvasZoom, setCanvasPan]);

  // ── LAPTOP KEYBOARD SHORTCUTS FOR ZOOM & PAN ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
      if (isInput) return;

      // Spacebar for Pan mode
      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }

      // Deselect
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        deleteVisionNode(selectedNodeId);
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedNodeId) {
        e.preventDefault();
        duplicateVisionNode(selectedNodeId);
      }

      // Zoom IN on laptop: '+' or '=' or ']' or Ctrl/Cmd + '='
      if (
        e.key === '+' ||
        e.key === '=' ||
        e.key === ']' ||
        ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+'))
      ) {
        e.preventDefault();
        setCanvasZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)));
      }

      // Zoom OUT on laptop: '-' or '_' or '[' or Ctrl/Cmd + '-'
      if (
        e.key === '-' ||
        e.key === '_' ||
        e.key === '[' ||
        ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_'))
      ) {
        e.preventDefault();
        setCanvasZoom((z) => Math.max(0.25, +(z - 0.15).toFixed(2)));
      }

      // Reset Zoom to 100%: '0' or Ctrl/Cmd + '0'
      if (e.key === '0' || ((e.ctrlKey || e.metaKey) && e.key === '0')) {
        e.preventDefault();
        setCanvasZoom(1.0);
        setCanvasPan({ x: 60, y: 30 });
      }

      // Arrow Keys to Pan
      if (e.key === 'ArrowLeft') {
        setCanvasPan((p) => ({ ...p, x: p.x + 50 }));
      } else if (e.key === 'ArrowRight') {
        setCanvasPan((p) => ({ ...p, x: p.x - 50 }));
      } else if (e.key === 'ArrowUp') {
        setCanvasPan((p) => ({ ...p, y: p.y + 50 }));
      } else if (e.key === 'ArrowDown') {
        setCanvasPan((p) => ({ ...p, y: p.y - 50 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeId, deleteVisionNode, duplicateVisionNode, setCanvasZoom, setCanvasPan, setSelectedNodeId]);

  // Pan Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const isBackground =
      e.target === containerRef.current ||
      (e.target as HTMLElement).dataset.canvasBackground === 'true';

    if (isBackground) {
      setSelectedNodeId(null);
    }

    if (isBackground || isSpacePressed || activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    } else if (draggedNodeId) {
      const deltaX = (e.clientX - dragRef.current.startX) / canvasZoom;
      const deltaY = (e.clientY - dragRef.current.startY) / canvasZoom;

      const newX = Math.round(dragRef.current.initNodeX + deltaX);
      const newY = Math.round(dragRef.current.initNodeY + deltaY);

      updateVisionNodePosition(draggedNodeId, { x: newX, y: newY });
    } else if (resizingState) {
      const deltaX = (e.clientX - resizingState.startX) / canvasZoom;
      const deltaY = (e.clientY - resizingState.startY) / canvasZoom;
      const handle = resizingState.handle;

      let newW = resizingState.initW;
      let newH = resizingState.initH;
      let newX = resizingState.initX;
      let newY = resizingState.initY;

      if (handle.includes('e')) newW = Math.max(180, resizingState.initW + deltaX);
      if (handle.includes('s')) newH = Math.max(140, resizingState.initH + deltaY);
      if (handle.includes('w')) {
        const potentialW = resizingState.initW - deltaX;
        if (potentialW >= 180) {
          newW = potentialW;
          newX = resizingState.initX + deltaX;
        }
      }
      if (handle.includes('n')) {
        const potentialH = resizingState.initH - deltaY;
        if (potentialH >= 140) {
          newH = potentialH;
          newY = resizingState.initY + deltaY;
        }
      }

      updateVisionNodeSize(resizingState.nodeId, {
        width: Math.round(newW),
        height: Math.round(newH),
      });
      updateVisionNodePosition(resizingState.nodeId, {
        x: Math.round(newX),
        y: Math.round(newY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
    setResizingState(null);
  };

  // Touch Gesture Handling for mobile/touchpads
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        initPanX: canvasPan.x,
        initPanY: canvasPan.y,
        initDist: 0,
        initZoom: canvasZoom,
      };
      if (activeTool === 'pan' || (e.target as HTMLElement).dataset.canvasBackground === 'true') {
        setIsPanning(true);
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      touchStateRef.current = {
        startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        initPanX: canvasPan.x,
        initPanY: canvasPan.y,
        initDist: dist,
        initZoom: canvasZoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedNodeId) {
      const touch = e.touches[0];
      const deltaX = (touch.clientX - dragRef.current.startX) / canvasZoom;
      const deltaY = (touch.clientY - dragRef.current.startY) / canvasZoom;

      const newX = Math.round(dragRef.current.initNodeX + deltaX);
      const newY = Math.round(dragRef.current.initNodeY + deltaY);

      updateVisionNodePosition(draggedNodeId, { x: newX, y: newY });
      return;
    }

    if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStateRef.current.startX;
      const deltaY = touch.clientY - touchStateRef.current.startY;

      setCanvasPan({
        x: touchStateRef.current.initPanX + deltaX,
        y: touchStateRef.current.initPanY + deltaY,
      });
    } else if (e.touches.length === 2 && touchStateRef.current.initDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      const ratio = dist / touchStateRef.current.initDist;
      setCanvasZoom(Math.min(Math.max(touchStateRef.current.initZoom * ratio, 0.25), 2.5));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
    setResizingState(null);
  };

  const handleNodeDragStart = (node: VisionNode, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initNodeX: node.position.x,
      initNodeY: node.position.y,
    };
    setDraggedNodeId(node.id);
  };

  const handleNodeResizeStart = (
    node: VisionNode,
    handle: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setResizingState({
      nodeId: node.id,
      handle,
      startX: clientX,
      startY: clientY,
      initW: node.size?.width || 300,
      initH: node.size?.height || 200,
      initX: node.position.x,
      initY: node.position.y,
    });
  };

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      data-canvas-background="true"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${
        activeTool === 'pan' || isSpacePressed
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-default'
      }`}
      style={{
        backgroundColor: 'var(--color-background, #f8fafc)',
      }}
    >
      {/* ── BACKGROUND GRID PATTERN LAYER ── */}
      <div
        data-canvas-background="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px`,
          backgroundSize: `${24 * canvasZoom}px ${24 * canvasZoom}px`,
          backgroundImage:
            canvasTheme === 'dots'
              ? `radial-gradient(circle, var(--canvas-dot-color, rgba(0,0,0,0.18)) ${1.2 * canvasZoom}px, transparent ${1.2 * canvasZoom}px)`
              : canvasTheme === 'grid'
              ? `linear-gradient(to right, var(--canvas-grid-color, rgba(0,0,0,0.08)) 1px, transparent 1px), linear-gradient(to bottom, var(--canvas-grid-color, rgba(0,0,0,0.08)) 1px, transparent 1px)`
              : 'none',
        }}
      />

      {/* ── TRANSFORMABLE WORLD LAYER ── */}
      <div
        style={{
          transform: `translate3d(${canvasPan.x}px, ${canvasPan.y}px, 0) scale(${canvasZoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
        className="absolute inset-0 pointer-events-auto"
      >
        {board.nodes.map((node) => (
          <VisionNodeCard
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={(e) => {
              e.stopPropagation();
              setSelectedNodeId(node.id);
            }}
            onInspect={() => onInspectNode(node.id)}
            onDuplicate={() => duplicateVisionNode(node.id)}
            onDelete={() => deleteVisionNode(node.id)}
            onUpdate={(updates) => updateVisionNode(node.id, updates)}
            onStartDrag={(e) => handleNodeDragStart(node, e)}
            onStartResize={(e, handle) => handleNodeResizeStart(node, handle, e)}
          />
        ))}
      </div>
    </div>
  );
};
