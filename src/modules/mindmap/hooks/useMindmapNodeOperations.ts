import React, { useState, useMemo } from 'react';
import type { Mindmap, MindmapNode, MindmapLink } from '../../../store/types';
import { type MindmapColor } from '../utils/mindmapUtils';
import { getNextAvailableColor, getDescendants } from '../utils/mindmapLayout';

interface UseMindmapNodeOperationsOptions {
  mindmap: Mindmap;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  onUpdate: (data: Partial<Mindmap>) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  setIsDrawerOpen: (open: boolean) => void;
}

export function useMindmapNodeOperations({
  mindmap,
  selectedNodeId,
  setSelectedNodeId,
  onUpdate,
  showConfirm,
  setIsDrawerOpen,
}: UseMindmapNodeOperationsOptions) {
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);

  const [newLinkUrl, setNewLinkUrl] = useState('');

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

  const handleAddChildNode = () => {
    const parent = mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!parent) return;

    const childId = crypto.randomUUID();
    let side: 'left' | 'right' | 'bottom' = (parent.side as any) || 'right';
    let x = parent.x;
    let y = parent.y;

    if (parent.isRoot) {
      const leftCount = mindmap.nodes.filter(
        (n) => n.parentId === parent.id && n.side === 'left',
      ).length;
      const rightCount = mindmap.nodes.filter(
        (n) => n.parentId === parent.id && n.side === 'right',
      ).length;
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

    const assignedColor = getNextAvailableColor(mindmap.nodes, parent.id, parent.color);

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
    setEditingNodeId(childId);
    setEditingText(childNode.text);
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

    const assignedColor = getNextAvailableColor(mindmap.nodes, parentId, parentNode?.color);

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
    setEditingNodeId(siblingId);
    setEditingText(siblingNode.text);
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
      nodes: mindmap.nodes.map((n) =>
        n.id === nodeId ? { ...n, collapsed: nextCollapsed } : n,
      ),
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
          (l) =>
            (l.source === linkingSourceId && l.target === nodeId) ||
            (l.source === nodeId && l.target === linkingSourceId),
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
            nodes: mindmap.nodes.filter(
              (n) => n.id !== selectedNodeId && !descendants.includes(n.id),
            ),
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
        links: mindmap.links.filter(
          (l) => l.source !== selectedNodeId && l.target !== selectedNodeId,
        ),
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

  return {
    editingNodeId,
    setEditingNodeId,
    editingText,
    setEditingText,
    linkingSourceId,
    setLinkingSourceId,
    newLinkUrl,
    setNewLinkUrl,
    handleStartEditNode,
    handleSaveNodeText,
    handleAddChildNode,
    handleAddSiblingNode,
    handleOpenAll,
    handleCloseAll,
    handleToggleCollapse,
    visibleNodes,
    visibleLinks,
    handleNodeClick,
    handleDeleteSelectedNode,
    handleChangeNodeColor,
    handleUpdateNodeProp,
    handleAddLink,
    handleRemoveLink,
    handleImageUpload,
    handleRemoveImage,
    handlePdfUpload,
    handleRemovePdf,
  };
}
