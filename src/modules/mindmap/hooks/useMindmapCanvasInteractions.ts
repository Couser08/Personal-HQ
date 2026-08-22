import { useState, useRef, useEffect, useMemo } from 'react';
import type { Mindmap, MindmapNode } from '../../../store/types';

interface UseMindmapCanvasInteractionsOptions {
  mindmap: Mindmap;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editingNodeId: string | null;
  onUpdate: (data: Partial<Mindmap>) => void;
  handleAddChildNode: () => void;
  handleAddSiblingNode: () => void;
  handleDeleteSelectedNode: () => void;
}

export function useMindmapCanvasInteractions({
  mindmap,
  containerRef,
  editingNodeId,
  onUpdate,
  handleAddChildNode,
  handleAddSiblingNode,
  handleDeleteSelectedNode,
}: UseMindmapCanvasInteractionsOptions) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cameraStartPan = useRef({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStartOffset = useRef({ x: 0, y: 0 });

  const handleCenterCamera = () => {
    if (mindmap.nodes.length === 0) return;
    if (!containerRef.current) return;

    const rootNode = mindmap.nodes.find((n) => n.isRoot) || mindmap.nodes[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rootNode.x + 80;
    const centerY = rootNode.y + 25;

    setPan({
      x: rect.width / 2 - centerX,
      y: rect.height / 2 - centerY,
    });
    setZoom(1);
  };

  useEffect(() => {
    handleCenterCamera();
    setSelectedNodeId(null);
  }, [mindmap.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable'))
      ) {
        return;
      }

      if (!selectedNodeId) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        handleAddChildNode();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSiblingNode();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelectedNode();
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        const selectedNode = mindmap.nodes.find((n) => n.id === selectedNodeId);
        if (selectedNode) {
          let candidates = mindmap.nodes.filter((n) => n.id !== selectedNodeId);
          if (e.key === 'ArrowUp') {
            candidates = candidates.filter((n) => n.y < selectedNode.y - 10);
          } else if (e.key === 'ArrowDown') {
            candidates = candidates.filter((n) => n.y > selectedNode.y + 10);
          } else if (e.key === 'ArrowLeft') {
            candidates = candidates.filter((n) => n.x < selectedNode.x - 10);
          } else if (e.key === 'ArrowRight') {
            candidates = candidates.filter((n) => n.x > selectedNode.x + 10);
          }

          if (candidates.length > 0) {
            let bestCandidate = candidates[0];
            let minDistance = Infinity;
            candidates.forEach((n) => {
              const dist = Math.pow(n.x - selectedNode.x, 2) + Math.pow(n.y - selectedNode.y, 2);
              if (dist < minDistance) {
                minDistance = dist;
                bestCandidate = n;
              }
            });
            setSelectedNodeId(bestCandidate.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, mindmap.nodes, mindmap.links, handleAddChildNode, handleAddSiblingNode, handleDeleteSelectedNode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (editingNodeId) return;

    setIsDraggingCanvas(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    cameraStartPan.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setPan({
        x: cameraStartPan.current.x + dx,
        y: cameraStartPan.current.y + dy,
      });
    } else if (draggingNodeId) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const x = (e.clientX - rect.left - pan.x) / zoom - nodeDragStartOffset.current.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - nodeDragStartOffset.current.y;

      onUpdate({
        nodes: mindmap.nodes.map((n) =>
          n.id === draggingNodeId ? { ...n, x: Math.round(x), y: Math.round(y) } : n,
        ),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNodeId(null);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = 1.08;
      let nextZoom = zoom;
      if (e.deltaY < 0) {
        nextZoom = Math.min(zoom * zoomFactor, 2.5);
      } else {
        nextZoom = Math.max(zoom / zoomFactor, 0.4);
      }

      const dx = mouseX - pan.x;
      const dy = mouseY - pan.y;

      setPan({
        x: mouseX - dx * (nextZoom / zoom),
        y: mouseY - dy * (nextZoom / zoom),
      });
      setZoom(nextZoom);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, pan, containerRef]);

  const handleDoubleClickCanvas = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (editingNodeId) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left - pan.x) / zoom - 80;
    const y = (e.clientY - rect.top - pan.y) / zoom - 22;

    const newNode: MindmapNode = {
      id: crypto.randomUUID(),
      text: 'Floating Idea',
      x: Math.round(x),
      y: Math.round(y),
      color: 'gray',
    };

    onUpdate({
      nodes: [...mindmap.nodes, newNode],
    });
    setSelectedNodeId(newNode.id);
  };

  const handleStartDragNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (editingNodeId === nodeId) return;

    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const node = mindmap.nodes.find((n) => n.id === nodeId);
    if (!node || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const nodeCenterX = (e.clientX - rect.left - pan.x) / zoom;
    const nodeCenterY = (e.clientY - rect.top - pan.y) / zoom;

    nodeDragStartOffset.current = {
      x: nodeCenterX - node.x,
      y: nodeCenterY - node.y,
    };
  };

  const miniMapBounds = useMemo(() => {
    let minX = 0,
      maxX = 900,
      minY = 0,
      maxY = 600;
    mindmap.nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
    return { minX, maxX, minY, maxY, width: maxX - minX + 200, height: maxY - minY + 100 };
  }, [mindmap.nodes]);

  const getNodeCenters = useMemo(() => {
    const centers: Record<string, { x: number; y: number }> = {};
    mindmap.nodes.forEach((node) => {
      centers[node.id] = {
        x: node.x + 80,
        y: node.y + 22,
      };
    });
    return centers;
  }, [mindmap.nodes]);

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    isZoomMenuOpen,
    setIsZoomMenuOpen,
    selectedNodeId,
    setSelectedNodeId,
    handleCenterCamera,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClickCanvas,
    handleStartDragNode,
    miniMapBounds,
    getNodeCenters,
  };
}
