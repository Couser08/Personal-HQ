import { useState, useRef, useEffect, useMemo } from 'react';
import {
  IconPlus,
  IconTrash,
  IconSearch,
  IconZoomIn,
  IconZoomOut,
  IconEdit,
  IconLink,
  IconFocusCentered,
  IconChevronDown,
  IconChevronUp,
  IconChevronLeft,
  IconChevronRight,
  IconLayout,
  IconBook,
  IconExternalLink,
  IconDownload,
  IconPhoto,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react';
import { useAppStore, type Mindmap, type MindmapNode, type MindmapLink } from '../../../store/useAppStore';
import { useToastStore } from '../../../store/useToastStore';
import { COLOR_PRESETS, getDomainFavicon, type MindmapColor } from '../utils/mindmapUtils';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { MindmapModals } from './MindmapModals';

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


  const handleTidyLayout = () => {
    if (!mindmap) return;
    const rootNode = mindmap.nodes.find((n) => n.isRoot);
    if (!rootNode) return;

    // Reset root position to center
    const newNodes = [...mindmap.nodes];
    const rootIndex = newNodes.findIndex((n) => n.id === rootNode.id);
    const rx = 450;
    const ry = 250;
    newNodes[rootIndex] = { ...rootNode, x: rx, y: ry };

    // Get direct children of root
    const rootChildren = newNodes.filter((n) => n.parentId === rootNode.id);

    // Split children into left and right
    const rightChildren: typeof rootChildren = [];
    const leftChildren: typeof rootChildren = [];

    rootChildren.forEach((child, index) => {
      const side = child.side || (index % 2 === 0 ? 'right' : 'left');
      if (side === 'left') {
        leftChildren.push(child);
      } else {
        rightChildren.push(child);
      }
    });

    const layoutSubTree = (
      parentId: string,
      parentX: number,
      parentY: number,
      direction: 'left' | 'right',
      verticalSpacing: number,
    ) => {
      const children = newNodes.filter((n) => n.parentId === parentId);
      if (children.length === 0) return;

      const totalHeight = (children.length - 1) * verticalSpacing;
      const startY = parentY - totalHeight / 2;

      children.forEach((child, index) => {
        const childX = direction === 'right' ? parentX + 220 : parentX - 220;
        const childY = startY + index * verticalSpacing;

        const childIdx = newNodes.findIndex((n) => n.id === child.id);
        newNodes[childIdx] = { ...child, x: childX, y: childY, side: direction };

        layoutSubTree(child.id, childX, childY, direction, verticalSpacing * 0.85);
      });
    };

    // Layout right sub-tree
    if (rightChildren.length > 0) {
      const rTotalHeight = (rightChildren.length - 1) * 120;
      const rStartY = ry - rTotalHeight / 2;
      rightChildren.forEach((child, idx) => {
        const cx = rx + 240;
        const cy = rStartY + idx * 120;
        const childIdx = newNodes.findIndex((n) => n.id === child.id);
        newNodes[childIdx] = { ...child, x: cx, y: cy, side: 'right' };
        layoutSubTree(child.id, cx, cy, 'right', 90);
      });
    }

    // Layout left sub-tree
    if (leftChildren.length > 0) {
      const lTotalHeight = (leftChildren.length - 1) * 120;
      const lStartY = ry - lTotalHeight / 2;
      leftChildren.forEach((child, idx) => {
        const cx = rx - 240;
        const cy = lStartY + idx * 120;
        const childIdx = newNodes.findIndex((n) => n.id === child.id);
        newNodes[childIdx] = { ...child, x: cx, y: cy, side: 'left' };
        layoutSubTree(child.id, cx, cy, 'left', 90);
      });
    }

    onUpdate({ nodes: newNodes });
    addToast('Layout Aligned', 'Nodes have been reorganized neatly.', 'success');
  };

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesModalNodeId, setNotesModalNodeId] = useState<string | null>(null);
  const [notesActiveTab, setNotesActiveTab] = useState<'view' | 'edit'>('view');
  const [canvasSearchQuery, setCanvasSearchQuery] = useState('');

  const [pdfViewerPdf, setPdfViewerPdf] = useState<{ name: string; base64: string } | null>(null);

  useEffect(() => {
    if (!pdfViewerPdf) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPdfViewerPdf(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [pdfViewerPdf]);

  const notesModalNode = useMemo(() => {
    return mindmap.nodes.find((n) => n.id === notesModalNodeId) || null;
  }, [mindmap.nodes, notesModalNodeId]);

  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [fullScreenImages, setFullScreenImages] = useState<string[] | null>(null);
  const [fullScreenImageIdx, setFullScreenImageIdx] = useState(0);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cameraStartPan = useRef({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStartOffset = useRef({ x: 0, y: 0 });

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    setLinkingSourceId(null);
    setEditingNodeId(null);
    setIsDrawerOpen(false);
  }, [mindmap.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable'))
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, mindmap.nodes]);

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
        nodes: mindmap.nodes.map((n) => (n.id === draggingNodeId ? { ...n, x: Math.round(x), y: Math.round(y) } : n)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

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

  const handleStartEditNode = (node: MindmapNode) => {
    setEditingNodeId(node.id);
    setEditingText(node.text);
  };

  const handleSaveNodeText = (nodeId: string) => {
    const trimmed = editingText.trim();
    if (trimmed) {
      onUpdate({
        nodes: mindmap.nodes.map((n) => (n.id === nodeId ? { ...n, text: trimmed } : n)),
      });
    }
    setEditingNodeId(null);
  };

  const getNextAvailableColor = (parentId: string, currentParentColor?: MindmapColor): MindmapColor => {
    const COLORS: MindmapColor[] = ['rose', 'amber', 'purple', 'green', 'blue'];
    const siblingColors = mindmap.nodes.filter((n) => n.parentId === parentId).map((n) => n.color);
    const available = COLORS.filter((c) => c !== currentParentColor && !siblingColors.includes(c));
    if (available.length > 0) return available[0];
    const fallbackColors = COLORS.filter((c) => c !== currentParentColor);
    return fallbackColors[Math.floor(Math.random() * fallbackColors.length)] || 'blue';
  };

  const handleAddChildNode = () => {
    const parent = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!parent) return;

    const childId = crypto.randomUUID();
    let side: 'left' | 'right' | 'bottom' = parent.side || 'right';
    let x = parent.x;
    let y = parent.y;

    if (parent.isRoot) {
      const leftCount = mindmap.nodes.filter((n) => n.parentId === parent.id && n.side === 'left').length;
      const rightCount = mindmap.nodes.filter((n) => n.parentId === parent.id && n.side === 'right').length;
      side = leftCount <= rightCount ? 'left' : 'right';
    }

    if (side === 'left') {
      x = parent.x - 200;
      const peerCount = mindmap.nodes.filter((n) => n.parentId === parent.id).length;
      y = parent.y + peerCount * 60 - 90;
    } else if (side === 'right') {
      x = parent.x + 200;
      const peerCount = mindmap.nodes.filter((n) => n.parentId === parent.id).length;
      y = parent.y + peerCount * 60 - 90;
    } else {
      y = parent.y + 120;
      const peerCount = mindmap.nodes.filter((n) => n.parentId === parent.id).length;
      x = parent.x + peerCount * 130 - 180;
    }

    const assignedColor = getNextAvailableColor(parent.id, parent.color);

    const childNode: MindmapNode = {
      id: childId,
      text: 'Sub-topic',
      x: Math.round(x),
      y: Math.round(y),
      color: assignedColor,
      parentId: parent.id,
      side,
    };

    const childLink: MindmapLink = {
      source: parent.id,
      target: childId,
    };

    onUpdate({
      nodes: [...mindmap.nodes, childNode],
      links: [...mindmap.links, childLink],
    });
    setSelectedNodeId(childId);
  };

  const handleAddSiblingNode = () => {
    const selected = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!selected || selected.isRoot) return;

    const parentId = selected.parentId;
    if (!parentId) return;

    const parentNode = mindmap.nodes.find((n) => n.id === parentId);

    const siblingId = crypto.randomUUID();
    const side = selected.side || 'right';

    let x = selected.x;
    let y = selected.y + 60;

    if (side === 'bottom') {
      x = selected.x + 135;
      y = selected.y;
    }

    const assignedColor = getNextAvailableColor(parentId, parentNode?.color);

    const siblingNode: MindmapNode = {
      id: siblingId,
      text: 'New Topic',
      x: Math.round(x),
      y: Math.round(y),
      color: assignedColor,
      parentId,
      side,
    };

    const siblingLink: MindmapLink = {
      source: parentId,
      target: siblingId,
    };

    onUpdate({
      nodes: [...mindmap.nodes, siblingNode],
      links: [...mindmap.links, siblingLink],
    });
    setSelectedNodeId(siblingId);
  };

  const handleOpenAll = () => {
    onUpdate({
      nodes: mindmap.nodes.map((n) => (n.isRoot ? n : { ...n, collapsed: false })),
    });
  };

  const handleCloseAll = () => {
    onUpdate({
      nodes: mindmap.nodes.map((n) => (n.isRoot ? n : { ...n, collapsed: true })),
    });
  };

  const handleToggleCollapse = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const node = mindmap.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const nextCollapsed = !node.collapsed;
    onUpdate({
      nodes: mindmap.nodes.map((n) => (n.id === nodeId ? { ...n, collapsed: nextCollapsed } : n)),
    });
  };

  const isNodeHidden = (nodeId: string): boolean => {
    const node = mindmap.nodes.find((n) => n.id === nodeId);
    if (!node) return false;
    if (node.isRoot) return false;

    if (node.parentId) {
      const parent = mindmap.nodes.find((n) => n.id === node.parentId);
      if (parent && (parent.collapsed || isNodeHidden(parent.id))) {
        return true;
      }
    }
    return false;
  };

  const visibleNodes = useMemo(() => {
    return mindmap.nodes.filter((n) => !isNodeHidden(n.id));
  }, [mindmap.nodes]);

  const visibleLinks = useMemo(() => {
    return mindmap.links.filter((l) => !isNodeHidden(l.source) && !isNodeHidden(l.target));
  }, [mindmap.links, mindmap.nodes]);

  const handleNodeClick = (nodeId: string) => {
    if (linkingSourceId) {
      if (linkingSourceId !== nodeId) {
        const linkExists = mindmap.links.some(
          (l) => (l.source === linkingSourceId && l.target === nodeId) || (l.source === nodeId && l.target === linkingSourceId),
        );
        if (!linkExists) {
          onUpdate({
            links: [...mindmap.links, { source: linkingSourceId, target: nodeId }],
          });
        }
      }
      setLinkingSourceId(null);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const getDescendants = (nodeId: string, nodes: MindmapNode[]): string[] => {
    const childIds = nodes.filter((n) => n.parentId === nodeId).map((n) => n.id);
    let descendants = [...childIds];
    childIds.forEach((id) => {
      descendants = [...descendants, ...getDescendants(id, nodes)];
    });
    return descendants;
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    const node = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (node?.isRoot) {
      alert('Cannot delete the central idea.');
      return;
    }

    const descendants = getDescendants(selectedNodeId, mindmap.nodes);
    if (descendants.length > 0) {
      showConfirm(
        'Delete Node and Sub-topics',
        'Deleting this topic will also delete all of its sub-topics recursively. Do you want to proceed?',
        () => {
          onUpdate({
            nodes: mindmap.nodes.filter((n) => n.id !== selectedNodeId && !descendants.includes(n.id)),
            links: mindmap.links.filter(
              (l) =>
                l.source !== selectedNodeId &&
                !descendants.includes(l.source as string) &&
                l.target !== selectedNodeId &&
                !descendants.includes(l.target as string),
            ),
          });
          setSelectedNodeId(null);
          setIsDrawerOpen(false);
        },
      );
    } else {
      onUpdate({
        nodes: mindmap.nodes.filter((n) => n.id !== selectedNodeId),
        links: mindmap.links.filter((l) => l.source !== selectedNodeId && l.target !== selectedNodeId),
      });
      setSelectedNodeId(null);
      setIsDrawerOpen(false);
    }
  };

  const handleChangeNodeColor = (colorId: MindmapColor) => {
    if (!selectedNodeId) return;
    onUpdate({
      nodes: mindmap.nodes.map((n) => (n.id === selectedNodeId ? { ...n, color: colorId } : n)),
    });
  };

  const handleUpdateNodeProp = (key: keyof MindmapNode, val: any) => {
    if (!selectedNodeId) return;
    onUpdate({
      nodes: mindmap.nodes.map((n) => (n.id === selectedNodeId ? { ...n, [key]: val } : n)),
    });
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !selectedNodeId) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const currentNode = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentLinks = currentNode.links || [];
    if (!currentLinks.includes(url)) {
      handleUpdateNodeProp('links', [...currentLinks, url]);
    }
    setNewLinkUrl('');
  };

  const handleRemoveLink = (urlToRemove: string) => {
    const currentNode = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentLinks = currentNode.links || [];
    handleUpdateNodeProp('links', currentLinks.filter((u) => u !== urlToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedNodeId) return;
    const currentNode = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentImages = currentNode.images || [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          handleUpdateNodeProp('images', [...currentImages, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const currentNode = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentImages = currentNode.images || [];
    handleUpdateNodeProp('images', currentImages.filter((_, idx) => idx !== index));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedNodeId) return;
    const currentNode = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentPdfs = currentNode.pdfs || [];

    Array.from(files).forEach((file) => {
      if (file.type !== 'application/pdf') return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          handleUpdateNodeProp('pdfs', [...currentPdfs, { name: file.name, base64 }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePdf = (index: number) => {
    const currentNode = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentPdfs = currentNode.pdfs || [];
    handleUpdateNodeProp('pdfs', currentPdfs.filter((_, idx) => idx !== index));
  };

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

  const selectedNode = mindmap.nodes.find((n) => n.id === selectedNodeId) || null;

  const handleExportOutline = () => {
    const dataStr = JSON.stringify(mindmap, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${mindmap.title.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSvg = () => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" style="background:#f8fafc;">`;

    visibleLinks.forEach((link) => {
      const sourceNode = mindmap.nodes.find((n) => n.id === link.source);
      const targetNode = mindmap.nodes.find((n) => n.id === link.target);
      if (!sourceNode || !targetNode) return;

      let pathData = '';
      const side = targetNode.side || 'right';

      if (side === 'left') {
        const xStart = sourceNode.isRoot ? sourceNode.x : sourceNode.x;
        const yStart = sourceNode.isRoot ? sourceNode.y + 32 : sourceNode.y + 22;
        const xEnd = targetNode.x + 160;
        const yEnd = targetNode.y + 22;
        const controlX1 = xStart - (xStart - xEnd) / 2;
        const controlX2 = xStart - (xStart - xEnd) / 2;
        pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
      } else if (side === 'right') {
        const xStart = sourceNode.isRoot ? sourceNode.x + 180 : sourceNode.x + 160;
        const yStart = sourceNode.isRoot ? sourceNode.y + 32 : sourceNode.y + 22;
        const xEnd = targetNode.x;
        const yEnd = targetNode.y + 22;
        const controlX1 = xStart + (xEnd - xStart) / 2;
        const controlX2 = xStart + (xEnd - xStart) / 2;
        pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
      } else {
        const xStart = sourceNode.isRoot ? sourceNode.x + 90 : sourceNode.x + 80;
        const yStart = sourceNode.isRoot ? sourceNode.y + 64 : sourceNode.y + 44;
        const xEnd = targetNode.x + 80;
        const yEnd = targetNode.y;
        const controlY1 = yStart + (yEnd - yStart) / 2;
        const controlY2 = yStart + (yEnd - yStart) / 2;
        pathData = `M ${xStart} ${yStart} C ${xStart} ${controlY1}, ${xEnd} ${controlY2}, ${xEnd} ${yEnd}`;
      }

      let strokeColor = '#cbd5e1';
      if (sourceNode.color && sourceNode.color !== 'gray') {
        strokeColor =
          sourceNode.color === 'rose'
            ? '#fda4af'
            : sourceNode.color === 'amber'
            ? '#fcd34d'
            : sourceNode.color === 'purple'
            ? '#d8b4fe'
            : sourceNode.color === 'green'
            ? '#6ee7b7'
            : '#93c5fd';
      }

      svgContent += `<path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />`;
    });

    visibleNodes.forEach((node) => {
      const width = node.isRoot ? 180 : 160;
      const height = node.isRoot ? 64 : 44;
      const fillColor =
        node.isRoot
          ? '#ffffff'
          : node.color === 'rose'
          ? '#fff1f2'
          : node.color === 'amber'
          ? '#fef3c7'
          : node.color === 'purple'
          ? '#faf5ff'
          : node.color === 'green'
          ? '#ecfdf5'
          : '#eff6ff';
      const strokeColor =
        node.isRoot
          ? '#cbd5e1'
          : node.color === 'rose'
          ? '#fda4af'
          : node.color === 'amber'
          ? '#fde047'
          : node.color === 'purple'
          ? '#e9d5ff'
          : node.color === 'green'
          ? '#a7f3d0'
          : '#bfdbfe';
      const textColor =
        node.isRoot
          ? '#1e293b'
          : node.color === 'rose'
          ? '#e11d48'
          : node.color === 'amber'
          ? '#d97706'
          : node.color === 'purple'
          ? '#9333ea'
          : node.color === 'green'
          ? '#059669'
          : '#2563eb';

      svgContent += `<g transform="translate(${node.x}, ${node.y})">
        <rect width="${width}" height="${height}" rx="12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" />
        <text x="${width / 2}" y="${height / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">${node.text}</text>
      </g>`;
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${mindmap.title}.svg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="flex-1 w-full h-full flex relative overflow-hidden">
      {/* Infinite Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClickCanvas}
        className="flex-1 h-full select-none cursor-grab active:cursor-grabbing relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)]"
        style={{
          backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Node & Link Scaled Canvas Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
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
          <svg
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              overflow: 'visible',
              pointerEvents: 'none',
            }}
          >
            {visibleLinks.map((link, idx) => {
              const sourceNode = mindmap.nodes.find((n) => n.id === link.source);
              const targetNode = mindmap.nodes.find((n) => n.id === link.target);
              if (!sourceNode || !targetNode) return null;

              const start = getNodeCenters[link.source];
              const end = getNodeCenters[link.target];
              if (!start || !end) return null;

              let pathData = '';
              const side = targetNode.side || 'right';

              if (side === 'left') {
                const xStart = sourceNode.x;
                const yStart = sourceNode.y + 22;
                const xEnd = targetNode.x + 160;
                const yEnd = targetNode.y + 22;
                const controlX1 = xStart - (xStart - xEnd) / 2;
                const controlX2 = xStart - (xStart - xEnd) / 2;
                pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
              } else if (side === 'right') {
                const xStart = sourceNode.x + 160;
                const yStart = sourceNode.y + 22;
                const xEnd = targetNode.x;
                const yEnd = targetNode.y + 22;
                const controlX1 = xStart + (xEnd - xStart) / 2;
                const controlX2 = xStart + (xEnd - xStart) / 2;
                pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
              } else {
                const xStart = sourceNode.x + 80;
                const yStart = sourceNode.y + 44;
                const xEnd = targetNode.x + 80;
                const yEnd = targetNode.y;
                const controlY1 = yStart + (yEnd - yStart) / 2;
                const controlY2 = yStart + (yEnd - yStart) / 2;
                pathData = `M ${xStart} ${yStart} C ${xStart} ${controlY1}, ${xEnd} ${controlY2}, ${xEnd} ${yEnd}`;
              }

              const colorPreset = COLOR_PRESETS.find((c) => c.id === sourceNode.color);
              let strokeColor = 'rgba(148, 163, 184, 0.25)';
              if (colorPreset && colorPreset.id !== 'gray') {
                strokeColor =
                  colorPreset.id === 'rose'
                    ? 'rgba(244, 63, 94, 0.3)'
                    : colorPreset.id === 'amber'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : colorPreset.id === 'purple'
                    ? 'rgba(168, 85, 247, 0.3)'
                    : colorPreset.id === 'green'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(59, 130, 246, 0.3)';
              }

              const edgeStyle = mindmap.edgeStyle || 'solid';
              const strokeDasharray = edgeStyle === 'dashed' ? '6, 6' : edgeStyle === 'dotted' ? '2, 5' : 'none';

              return (
                <path
                  key={idx}
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* HTML Nodes Layer */}
          {visibleNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isLinkingSource = linkingSourceId === node.id;
            const colorPreset = COLOR_PRESETS.find((c) => c.id === node.color) || COLOR_PRESETS[5];
            const hasChildren = mindmap.nodes.some((n) => n.parentId === node.id);
            const isMatch = canvasSearchQuery.trim() !== '' && node.text.toLowerCase().includes(canvasSearchQuery.toLowerCase());

            return (
              <div
                key={node.id}
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
                              onError={(e) => (e.currentTarget.style.display = 'none')}
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
          })}
        </div>

        {/* Floating Canvas UI Indicators (Zoom state & Node search) */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
          <div className="bg-surface/80 border border-border/50 px-3 py-1.5 rounded-2xl text-[10px] font-black text-text-secondary uppercase tracking-widest backdrop-blur shadow-sm select-none">
            {zoom === 1 ? '100% Zoom' : `${Math.round(zoom * 100)}% Zoom`}
          </div>

          <div className="relative flex items-center bg-surface/80 border border-border/50 rounded-2xl shadow-sm backdrop-blur">
            <IconSearch className="w-3.5 h-3.5 absolute left-3 text-text-muted" />
            <input
              type="text"
              placeholder="Find node..."
              value={canvasSearchQuery}
              onChange={(e) => setCanvasSearchQuery(e.target.value)}
              className="bg-transparent border-none pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted w-28 focus:w-44 transition-all duration-300 rounded-2xl"
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

        {/* Zoom and layout controls */}
        <div className="absolute bottom-20 md:bottom-6 left-4 md:left-6 bg-surface/90 border border-border/60 p-2.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur z-20 max-w-[90vw] overflow-x-auto no-scrollbar flex-nowrap shrink-0">
          <button
            type="button"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-none bg-transparent cursor-pointer"
            title={isLeftSidebarOpen ? 'Collapse Left Panel' : 'Expand Left Panel'}
          >
            {isLeftSidebarOpen ? <IconChevronLeft className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-r border-border/50 pr-2 border-none bg-transparent cursor-pointer"
            title={isFullScreen ? 'Exit Full Screen' : 'Zen Full Screen Mode'}
          >
            {isFullScreen ? <IconMinimize className="w-4 h-4" /> : <IconMaximize className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(prev / 1.15, 0.4))}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-none bg-transparent cursor-pointer"
            title="Zoom Out"
          >
            <IconZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-black text-text-primary min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(prev * 1.15, 2.5))}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-r border-border/50 pr-2 border-none bg-transparent cursor-pointer"
            title="Zoom In"
          >
            <IconZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCenterCamera}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-none bg-transparent cursor-pointer"
            title="Center Canvas"
          >
            <IconFocusCentered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTidyLayout}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-r border-border/50 pr-2 border-none bg-transparent cursor-pointer"
            title="Auto-Arrange Layout"
          >
            <IconLayout className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenAll}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-none bg-transparent cursor-pointer"
            title="Expand All Branches"
          >
            <IconChevronDown className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCloseAll}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-none bg-transparent cursor-pointer"
            title="Collapse All Branches"
          >
            <IconChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Mini-Map Preview */}
        <div className="absolute bottom-6 right-6 w-32 h-24 bg-surface/90 border border-border/60 rounded-2xl shadow-xl p-2.5 backdrop-blur z-20 flex flex-col items-center justify-center overflow-hidden hidden md:flex">
          <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block select-none">
            Canvas Preview
          </span>
          <div className="relative w-full h-full bg-surface-alt/40 rounded-lg border border-border/30 overflow-hidden">
            {visibleNodes.map((n) => {
              const scaleX = 100 / miniMapBounds.width;
              const scaleY = 60 / miniMapBounds.height;
              const left = (n.x - miniMapBounds.minX) * scaleX;
              const top = (n.y - miniMapBounds.minY) * scaleY;
              return (
                <div
                  key={n.id}
                  style={{
                    left: `${left + 5}%`,
                    top: `${top + 10}%`,
                    width: n.isRoot ? '12px' : '9px',
                    height: '4px',
                    position: 'absolute',
                    backgroundColor:
                      n.isRoot
                        ? 'var(--color-primary, #f43f5e)'
                        : n.color === 'rose'
                        ? '#f43f5e'
                        : n.color === 'amber'
                        ? '#f59e0b'
                        : n.color === 'purple'
                        ? '#a855f7'
                        : n.color === 'green'
                        ? '#10b880'
                        : '#3b82f6',
                    borderRadius: '1px',
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Floating Apple-Style Toolbar at Top Center */}
        <div className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-3 bg-surface/90 border border-border/60 p-1.5 sm:p-2 rounded-2xl shadow-xl backdrop-blur-md max-w-[95vw] md:max-w-2xl w-fit z-20 overflow-x-auto no-scrollbar flex-nowrap shrink-0">
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
            className="flex items-center gap-1 font-bold text-[10px] rounded-lg px-2 sm:px-3 py-1.5 bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none border-none shrink-0"
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
      </div>

      {isDrawerOpen && selectedNode && (
        <NodeDetailsPanel
          selectedNode={selectedNode}
          newLinkUrl={newLinkUrl}
          setNewLinkUrl={setNewLinkUrl}
          handleAddLink={handleAddLink}
          handleRemoveLink={handleRemoveLink}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
          handlePdfUpload={handlePdfUpload}
          handleRemovePdf={handleRemovePdf}
          handleUpdateNodeProp={handleUpdateNodeProp}
          handleChangeNodeColor={handleChangeNodeColor}
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
