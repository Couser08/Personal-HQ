import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  IconPlus, IconTrash, IconSearch, IconSitemap, IconZoomIn, 
  IconZoomOut, IconDownload, IconEdit, IconLink, IconFocusCentered
} from '@tabler/icons-react';
import { useAppStore, type Mindmap, type MindmapNode, type MindmapLink } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const COLOR_PRESETS = [
  { id: 'gray', label: 'Default', bg: 'bg-surface border-border text-text-primary' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500/10 border-blue-500/30 text-blue-500' },
  { id: 'rose', label: 'Red', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-500' },
  { id: 'green', label: 'Green', bg: 'bg-green-500/10 border-green-500/30 text-green-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500/10 border-purple-500/30 text-purple-500' }
] as const;

export default function MindmapModule() {
  const { mindmaps, addMindmap, updateMindmap, deleteMindmap, showConfirm } = useAppStore();

  const [activeMindmapId, setActiveMindmapId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  // Active mindmap state
  const activeMindmap = useMemo(() => {
    return mindmaps.find(m => m.id === activeMindmapId) || null;
  }, [mindmaps, activeMindmapId]);

  // Set first mindmap active automatically if none selected
  useEffect(() => {
    if (mindmaps.length > 0 && !activeMindmapId) {
      setActiveMindmapId(mindmaps[0].id);
    }
  }, [mindmaps, activeMindmapId]);

  const handleCreateMindmap = () => {
    const newId = crypto.randomUUID();
    const newMap: Mindmap = {
      id: newId,
      title: 'Untitled Mindmap',
      nodes: [
        { id: 'root', text: 'Central Idea', x: 250, y: 200, color: 'blue', isRoot: true }
      ],
      links: [],
      createdAt: new Date().toISOString()
    };
    addMindmap(newMap);
    setActiveMindmapId(newId);
  };

  const handleRenameMindmap = () => {
    if (activeMindmap && titleInput.trim()) {
      updateMindmap(activeMindmap.id, { title: titleInput.trim() });
      setIsRenameModalOpen(false);
    }
  };

  const handleOpenRename = () => {
    if (activeMindmap) {
      setTitleInput(activeMindmap.title);
      setIsRenameModalOpen(true);
    }
  };

  const filteredMindmaps = mindmaps.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-130px)] gap-6 overflow-hidden">
      {/* Sidebar - Mindmaps Catalog */}
      <div className="w-64 bg-surface-alt border border-border/60 rounded-[28px] p-5 flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base text-text-primary flex items-center gap-2">
            <IconSitemap className="w-5 h-5 text-primary" /> Mindmaps
          </h3>
          <button 
            onClick={handleCreateMindmap}
            className="w-8 h-8 rounded-full bg-primary hover:bg-primary-muted text-white flex items-center justify-center transition-all"
            title="Create Mindmap"
          >
            <IconPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search maps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
          />
        </div>

        {/* Mindmaps List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredMindmaps.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">No mindmaps found.</p>
          ) : (
            filteredMindmaps.map(m => (
              <div 
                key={m.id}
                onClick={() => setActiveMindmapId(m.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  m.id === activeMindmapId 
                    ? 'bg-surface border-primary/20 text-primary shadow-sm font-bold' 
                    : 'bg-transparent border-transparent hover:bg-surface/50 text-text-secondary'
                }`}
              >
                <span className="text-xs truncate flex-1 pr-2">{m.title}</span>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button 
                    onClick={e => {
                      e.stopPropagation();
                      setActiveMindmapId(m.id);
                      handleOpenRename();
                    }}
                    className="w-5 h-5 rounded hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary"
                  >
                    <IconEdit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={e => {
                      e.stopPropagation();
                      showConfirm('Delete Mindmap', `Delete "${m.title}" permanently?`, () => {
                        deleteMindmap(m.id);
                        if (activeMindmapId === m.id) {
                          setActiveMindmapId(null);
                        }
                      });
                    }}
                    className="w-5 h-5 rounded hover:bg-rose-500/10 flex items-center justify-center text-text-muted hover:text-rose-500"
                  >
                    <IconTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mindmap editor canvas */}
      <div className="flex-1 h-full relative bg-surface border border-border/60 rounded-[32px] overflow-hidden flex flex-col">
        {activeMindmap ? (
          <MindmapCanvas 
            mindmap={activeMindmap}
            onUpdate={(updatedData) => updateMindmap(activeMindmap.id, updatedData)}
          />
        ) : (
          <EmptyState
            icon={<IconSitemap className="w-9 h-9 text-text-muted" />}
            title="Select or create a mindmap"
            description="Visualize ideas, structure notes, or plan projects using infinite-canvas mindmaps."
            action={
              <button onClick={handleCreateMindmap} className="btn btn-primary btn-md rounded-full px-5">
                <IconPlus className="w-4 h-4" /> Create First Mindmap
              </button>
            }
          />
        )}
      </div>

      {/* Rename Modal */}
      <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} title="Rename Mindmap">
        <div className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Mindmap Title</label>
            <input
              type="text"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              required
              onKeyDown={e => e.key === 'Enter' && handleRenameMindmap()}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setIsRenameModalOpen(false)} className="btn btn-secondary btn-md rounded-full px-5">Cancel</button>
            <button onClick={handleRenameMindmap} className="btn btn-primary btn-md rounded-full px-6">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Infinite Mindmap Canvas component
function MindmapCanvas({ 
  mindmap, 
  onUpdate 
}: { 
  mindmap: Mindmap; 
  onUpdate: (data: Partial<Mindmap>) => void; 
}) {
  const { theme } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pan and Zoom Camera state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Linking mode state
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cameraStartPan = useRef({ x: 0, y: 0 });

  // Node Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStartOffset = useRef({ x: 0, y: 0 });

  // Node text inline edit state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Center camera on nodes
  const handleCenterCamera = () => {
    if (mindmap.nodes.length === 0) return;
    if (!containerRef.current) return;
    
    // Calculate bounding box of nodes
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    mindmap.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = minX + (maxX - minX) / 2 + 75; // center of nodes + half width
    const centerY = minY + (maxY - minY) / 2 + 22; // center of nodes + half height

    setPan({
      x: rect.width / 2 - centerX,
      y: rect.height / 2 - centerY
    });
    setZoom(1);
  };

  // Center once when loading a different mindmap
  useEffect(() => {
    handleCenterCamera();
    setSelectedNodeId(null);
    setLinkingSourceId(null);
    setEditingNodeId(null);
  }, [mindmap.id]);

  // Handle canvas background drag (Panning)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    if (editingNodeId) return;

    setIsDraggingCanvas(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    cameraStartPan.current = { ...pan };
  };

  // Mouse Move: handles panning camera or dragging nodes
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setPan({
        x: cameraStartPan.current.x + dx,
        y: cameraStartPan.current.y + dy
      });
    } else if (draggingNodeId) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate coordinates relative to scaled/panned canvas
      const x = (e.clientX - rect.left - pan.x) / zoom - nodeDragStartOffset.current.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - nodeDragStartOffset.current.y;
      
      onUpdate({
        nodes: mindmap.nodes.map(n => n.id === draggingNodeId ? { ...n, x: Math.round(x), y: Math.round(y) } : n)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNodeId(null);
  };

  // Zooming with scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Zoom relative to cursor point
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
      y: mouseY - dy * (nextZoom / zoom)
    });
    setZoom(nextZoom);
  };

  // Canvas Double Click: create a node at cursor coordinates
  const handleDoubleClickCanvas = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; // only trigger on direct background click
    if (editingNodeId) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left - pan.x) / zoom - 75; // offset half node width
    const y = (e.clientY - rect.top - pan.y) / zoom - 22; // offset half node height

    const newNode: MindmapNode = {
      id: crypto.randomUUID(),
      text: 'New Idea',
      x: Math.round(x),
      y: Math.round(y),
      color: 'gray'
    };

    onUpdate({
      nodes: [...mindmap.nodes, newNode]
    });
    setSelectedNodeId(newNode.id);
  };

  // Node Dragging Start
  const handleStartDragNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (editingNodeId === nodeId) return;

    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    
    const node = mindmap.nodes.find(n => n.id === nodeId);
    if (!node || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    // Store drag offset relative to the node's top-left corner
    const nodeCenterX = (e.clientX - rect.left - pan.x) / zoom;
    const nodeCenterY = (e.clientY - rect.top - pan.y) / zoom;
    
    nodeDragStartOffset.current = {
      x: nodeCenterX - node.x,
      y: nodeCenterY - node.y
    };
  };

  // Trigger Node Text Edit inline
  const handleStartEditNode = (node: MindmapNode) => {
    setEditingNodeId(node.id);
    setEditingText(node.text);
  };

  const handleSaveNodeText = (nodeId: string) => {
    const trimmed = editingText.trim();
    if (trimmed) {
      onUpdate({
        nodes: mindmap.nodes.map(n => n.id === nodeId ? { ...n, text: trimmed } : n)
      });
    }
    setEditingNodeId(null);
  };

  // Create Sub-node (Child node) connected to selected node
  const handleAddChildNode = () => {
    const parent = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!parent) return;

    const childId = crypto.randomUUID();
    
    // Position child 180px to the right of parent, offset vertically slightly
    const offsetAngle = (Math.random() - 0.5) * 40; // small random vertical offset
    const childNode: MindmapNode = {
      id: childId,
      text: 'Sub-topic',
      x: parent.x + 200,
      y: Math.round(parent.y + offsetAngle),
      color: parent.color || 'gray'
    };

    const childLink: MindmapLink = {
      source: parent.id,
      target: childId
    };

    onUpdate({
      nodes: [...mindmap.nodes, childNode],
      links: [...mindmap.links, childLink]
    });
    setSelectedNodeId(childId);
  };

  // Handle linking mode
  const handleNodeClick = (nodeId: string) => {
    if (linkingSourceId) {
      // Connect source to target if not same and link doesn't already exist
      if (linkingSourceId !== nodeId) {
        const linkExists = mindmap.links.some(l => 
          (l.source === linkingSourceId && l.target === nodeId) ||
          (l.source === nodeId && l.target === linkingSourceId)
        );
        if (!linkExists) {
          onUpdate({
            links: [...mindmap.links, { source: linkingSourceId, target: nodeId }]
          });
        }
      }
      setLinkingSourceId(null);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  // Delete selected node + associated links
  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    
    const node = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (node?.isRoot) {
      alert('Cannot delete the root node.');
      return;
    }

    onUpdate({
      nodes: mindmap.nodes.filter(n => n.id !== selectedNodeId),
      links: mindmap.links.filter(l => l.source !== selectedNodeId && l.target !== selectedNodeId)
    });
    setSelectedNodeId(null);
  };

  // Change color of selected node
  const handleChangeNodeColor = (colorId: 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'gray') => {
    if (!selectedNodeId) return;
    onUpdate({
      nodes: mindmap.nodes.map(n => n.id === selectedNodeId ? { ...n, color: colorId } : n)
    });
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mindmap, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${mindmap.title.toLowerCase().replace(/\s+/g, '_')}_mindmap.json`);
    dlAnchorElem.click();
  };

  // Center coordinate helpers for Bezier curve link overlays
  const getNodeCenters = useMemo(() => {
    const centers: Record<string, { x: number; y: number }> = {};
    mindmap.nodes.forEach(node => {
      centers[node.id] = {
        x: node.x + 80, // half width (160px width node)
        y: node.y + 22  // half height (44px height node)
      };
    });
    return centers;
  }, [mindmap.nodes]);

  const selectedNode = mindmap.nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClickCanvas}
      className="flex-1 w-full h-full select-none cursor-grab active:cursor-grabbing relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)]"
      style={{
        backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* Node & Link Scaled Container */}
      <div 
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          left: 0, top: 0, right: 0, bottom: 0,
          pointerEvents: 'none'
        }}
      >
        {/* SVG Bezier Curves Layer */}
        <svg 
          style={{ 
            position: 'absolute', 
            width: '100%', height: '100%', 
            left: 0, top: 0, 
            overflow: 'visible', pointerEvents: 'none'
          }}
        >
          {mindmap.links.map((link, idx) => {
            const start = getNodeCenters[link.source];
            const end = getNodeCenters[link.target];
            if (!start || !end) return null;

            // Draw clean bezier curves between node centers
            const controlX1 = start.x + (end.x - start.x) / 1.5;
            const controlY1 = start.y;
            const controlX2 = start.x + (end.x - start.x) / 3;
            const controlY2 = end.y;

            const isDark = document.documentElement.classList.contains('dark') || theme === 'dark';
            const strokeColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.18)';

            return (
              <path
                key={idx}
                d={`M ${start.x} ${start.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                className="opacity-70"
              />
            );
          })}
        </svg>

        {/* HTML Nodes Layer */}
        {mindmap.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isLinkingSource = linkingSourceId === node.id;
          const colorPreset = COLOR_PRESETS.find(c => c.id === node.color) || COLOR_PRESETS[0];

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
                width: '160px',
                minHeight: '44px',
                position: 'absolute',
                pointerEvents: 'auto',
                boxSizing: 'border-box'
              }}
              className={`rounded-2xl border px-3 py-2 flex items-center justify-center text-center cursor-pointer transition-shadow shadow-sm font-semibold text-xs leading-tight ${colorPreset.bg} ${
                isSelected 
                  ? 'ring-4 ring-primary/20 border-primary shadow-md' 
                  : isLinkingSource 
                  ? 'ring-4 ring-amber-500/20 border-amber-500 animate-pulse'
                  : 'hover:shadow'
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
                  className="w-full bg-surface-alt border border-primary/40 rounded-lg px-2.5 py-1 text-xs text-text-primary text-center font-bold outline-none focus:ring-1 focus:ring-primary"
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                />
              ) : (
                <span className="break-words w-full truncate-3-lines">{node.text}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Canvas UI Indicators */}
      <div className="absolute top-4 left-4 bg-surface/80 border border-border/50 px-3 py-1.5 rounded-full text-[10px] font-black text-text-secondary uppercase tracking-widest backdrop-blur shadow-sm select-none">
        {zoom === 1 ? '100% Zoom' : `${Math.round(zoom * 100)}% Zoom`}
      </div>

      {/* Top Right Tool Action Panel */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleCenterCamera}
          className="w-8 h-8 rounded-full bg-surface/80 border border-border/50 hover:bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary shadow-sm backdrop-blur transition-all active:scale-90"
          title="Center Mindmap"
        >
          <IconFocusCentered className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportJson}
          className="w-8 h-8 rounded-full bg-surface/80 border border-border/50 hover:bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary shadow-sm backdrop-blur transition-all active:scale-90"
          title="Export JSON"
        >
          <IconDownload className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Apple-Style Toolbar at Bottom Center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface/90 border border-border/60 p-3 rounded-[32px] shadow-xl backdrop-blur-md max-w-xl w-fit z-30 overflow-visible">
        {/* Zoom Operations */}
        <div className={`flex gap-1 pr-3 ${selectedNode ? 'border-r border-border/60' : ''}`}>
          <button 
            onClick={() => setZoom(prev => Math.max(prev / 1.15, 0.4))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-alt transition-colors active:scale-90"
            title="Zoom Out"
          >
            <IconZoomOut className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setZoom(prev => Math.min(prev * 1.15, 2.5))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-alt transition-colors active:scale-90"
            title="Zoom In"
          >
            <IconZoomIn className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Selected Node Actions */}
        {selectedNode ? (
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Add connected Sub-node */}
            <button
              onClick={handleAddChildNode}
              className="flex items-center gap-1.5 font-bold text-xs rounded-full px-4 py-2 bg-primary text-white hover:bg-primary/95 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <IconPlus className="w-3.5 h-3.5" /> Add Sub-topic
            </button>

            {/* Linking mode connector */}
            <button
              onClick={() => setLinkingSourceId(selectedNodeId)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                linkingSourceId === selectedNodeId 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-transparent border-border text-text-secondary hover:bg-surface-alt'
              }`}
              title="Connect to another Node"
            >
              <IconLink className="w-4 h-4" />
            </button>

            {/* Color selection buttons */}
            <div className="flex gap-1 items-center bg-surface-alt border border-border/50 p-0.5 rounded-full">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleChangeNodeColor(preset.id as any)}
                  className={`w-5 h-5 rounded-full transition-all border ${
                    preset.id === 'gray' 
                      ? 'bg-surface border-border hover:scale-115' 
                      : preset.id === 'blue' 
                      ? 'bg-blue-500 border-blue-600 hover:scale-115'
                      : preset.id === 'rose'
                      ? 'bg-rose-500 border-rose-600 hover:scale-115'
                      : preset.id === 'green'
                      ? 'bg-green-500 border-green-600 hover:scale-115'
                      : preset.id === 'amber'
                      ? 'bg-amber-500 border-amber-600 hover:scale-115'
                      : 'bg-purple-500 border-purple-600 hover:scale-115'
                  } ${selectedNode.color === preset.id ? 'scale-120 border-text-primary' : 'scale-100 border-transparent'}`}
                  title={`Set Color: ${preset.label}`}
                />
              ))}
            </div>

            {/* Delete Selection */}
            {!selectedNode.isRoot && (
              <button
                onClick={handleDeleteSelectedNode}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 border border-border/40 transition-all active:scale-90"
                title="Delete Selected Idea"
              >
                <IconTrash className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider pr-3">
            Double click canvas to add root node
          </p>
        )}
      </div>
    </div>
  );
}
