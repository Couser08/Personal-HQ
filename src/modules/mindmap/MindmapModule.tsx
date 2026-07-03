import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  IconPlus, IconTrash, IconSearch, IconSitemap, IconZoomIn, 
  IconZoomOut, IconEdit, IconLink, IconFocusCentered,
  IconArrowLeft, IconChevronDown, IconFolder, IconShare,
  IconArrowBackUp, IconArrowForwardUp, IconCloudCheck
} from '@tabler/icons-react';
import { useAppStore, type Mindmap, type MindmapNode, type MindmapLink } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const COLOR_PRESETS = [
  { id: 'rose', label: 'Pink', bg: 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-400' },
  { id: 'amber', label: 'Orange', bg: 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-400' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/20 dark:border-purple-800/40 dark:text-purple-400' },
  { id: 'green', label: 'Green', bg: 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-800/40 dark:text-blue-400' },
  { id: 'gray', label: 'Gray', bg: 'bg-surface border-border text-text-primary' }
] as const;

export default function MindmapModule() {
  const { mindmaps, addMindmap, updateMindmap, deleteMindmap, showConfirm } = useAppStore();

  const [activeMindmapId, setActiveMindmapId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  // Active mindmap
  const activeMindmap = useMemo(() => {
    return mindmaps.find(m => m.id === activeMindmapId) || null;
  }, [mindmaps, activeMindmapId]);

  // Set first mindmap active automatically
  useEffect(() => {
    if (mindmaps.length > 0 && !activeMindmapId) {
      setActiveMindmapId(mindmaps[0].id);
    }
  }, [mindmaps, activeMindmapId]);

  // Create default Productivity Mindmap or empty
  const handleCreateMindmap = (customTitle?: string) => {
    const newId = crypto.randomUUID();
    
    // Initial nodes based exactly on the user mockup image:
    const initialNodes: MindmapNode[] = [
      { id: 'root', text: 'Productivity Mind Map', x: 450, y: 250, color: 'gray', isRoot: true, icon: '🧠' },
      
      // Main branch nodes
      { id: 'mindset', text: 'Mindset', x: 260, y: 150, color: 'rose', parentId: 'root', side: 'left' },
      { id: 'planning', text: 'Planning', x: 640, y: 150, color: 'amber', parentId: 'root', side: 'right' },
      { id: 'habits', text: 'Habits', x: 260, y: 350, color: 'purple', parentId: 'root', side: 'left' },
      { id: 'wellbeing', text: 'Wellbeing', x: 640, y: 350, color: 'green', parentId: 'root', side: 'right' },
      { id: 'tools', text: 'Tools', x: 450, y: 440, color: 'blue', parentId: 'root', side: 'bottom' },
      
      // Mindset Children (Left Flow)
      { id: 'ms1', text: 'Positive Thinking', x: 40, y: 60, color: 'gray', parentId: 'mindset', side: 'left', icon: '⭐' },
      { id: 'ms2', text: 'Growth Mindset', x: 40, y: 120, color: 'gray', parentId: 'mindset', side: 'left', icon: '📈' },
      { id: 'ms3', text: 'Self Discipline', x: 40, y: 180, color: 'gray', parentId: 'mindset', side: 'left', icon: '🛡️' },
      { id: 'ms4', text: 'Focus & Clarity', x: 40, y: 240, color: 'gray', parentId: 'mindset', side: 'left', icon: '🎯' },

      // Planning Children (Right Flow)
      { id: 'pl1', text: 'Set Goals', x: 860, y: 60, color: 'gray', parentId: 'planning', side: 'right', icon: '🎯' },
      { id: 'pl2', text: 'Prioritize Tasks', x: 860, y: 120, color: 'gray', parentId: 'planning', side: 'right', icon: '📋' },
      { id: 'pl3', text: 'Time Blocking', x: 860, y: 180, color: 'gray', parentId: 'planning', side: 'right', icon: '⏰' },
      { id: 'pl4', text: 'Review & Reflect', x: 860, y: 240, color: 'gray', parentId: 'planning', side: 'right', icon: '🔄' },

      // Habits Children (Left Flow)
      { id: 'hb1', text: 'Daily Routine', x: 40, y: 310, color: 'gray', parentId: 'habits', side: 'left', icon: '⏰' },
      { id: 'hb2', text: 'Morning Ritual', x: 40, y: 370, color: 'gray', parentId: 'habits', side: 'left', icon: '🌅' },
      { id: 'hb3', text: 'Pomodoro Technique', x: 40, y: 430, color: 'gray', parentId: 'habits', side: 'left', icon: '⏱️' },
      { id: 'hb4', text: 'Digital Detox', x: 40, y: 490, color: 'gray', parentId: 'habits', side: 'left', icon: '📱' },

      // Wellbeing Children (Right Flow)
      { id: 'wb1', text: 'Exercise', x: 860, y: 310, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🏋️' },
      { id: 'wb2', text: 'Meditation', x: 860, y: 370, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🧘' },
      { id: 'wb3', text: 'Healthy Diet', x: 860, y: 430, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🍏' },
      { id: 'wb4', text: 'Sleep', x: 860, y: 490, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🌙' },

      // Tools Children (Bottom Flow - ALIGNED HORIZONTALLY BELOW!)
      { id: 'tl1', text: 'Notes', x: 250, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '🗒️' },
      { id: 'tl2', text: 'Task Manager', x: 380, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '☑️' },
      { id: 'tl3', text: 'Calendar', x: 520, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '📅' },
      { id: 'tl4', text: 'Mind Maps', x: 650, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '🗺️' }
    ];

    const initialLinks: MindmapLink[] = [
      { source: 'root', target: 'mindset' },
      { source: 'root', target: 'planning' },
      { source: 'root', target: 'habits' },
      { source: 'root', target: 'wellbeing' },
      { source: 'root', target: 'tools' },
      
      { source: 'mindset', target: 'ms1' },
      { source: 'mindset', target: 'ms2' },
      { source: 'mindset', target: 'ms3' },
      { source: 'mindset', target: 'ms4' },

      { source: 'planning', target: 'pl1' },
      { source: 'planning', target: 'pl2' },
      { source: 'planning', target: 'pl3' },
      { source: 'planning', target: 'pl4' },

      { source: 'habits', target: 'hb1' },
      { source: 'habits', target: 'hb2' },
      { source: 'habits', target: 'hb3' },
      { source: 'habits', target: 'hb4' },

      { source: 'wellbeing', target: 'wb1' },
      { source: 'wellbeing', target: 'wb2' },
      { source: 'wellbeing', target: 'wb3' },
      { source: 'wellbeing', target: 'wb4' },

      { source: 'tools', target: 'tl1' },
      { source: 'tools', target: 'tl2' },
      { source: 'tools', target: 'tl3' },
      { source: 'tools', target: 'tl4' }
    ];

    const newMap: Mindmap = {
      id: newId,
      title: customTitle || (mindmaps.length === 0 ? 'Productivity Mind Map' : 'New Mindmap'),
      nodes: initialNodes,
      links: initialLinks,
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
    <div className="flex h-[calc(100vh-130px)] gap-0 overflow-hidden bg-background text-text-primary rounded-[32px] border border-border/60">
      
      {/* Workspace Sidebar List (Replicating FocusFlow sidebar UI mockup) */}
      <div className="w-[260px] bg-surface/40 border-r border-border/50 flex flex-col shrink-0">
        
        {/* Workspace Brand Selector */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
              FF
            </div>
            <div className="text-left leading-none">
              <p className="font-extrabold text-[13px] text-text-primary">FocusFlow</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Personal Space</p>
            </div>
          </div>
          <IconChevronDown className="w-4 h-4 text-text-secondary" />
        </div>

        {/* Sidebar Search */}
        <div className="p-3">
          <div className="relative">
            <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search maps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border/50 pl-9 pr-8 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-text-primary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border/60">
              ⌘K
            </span>
          </div>
        </div>

        {/* Directory header */}
        <div className="px-4 py-2 flex items-center justify-between text-text-secondary font-black text-[10px] tracking-wider uppercase">
          <span>MAPS</span>
          <button 
            onClick={() => handleCreateMindmap('Untitled Mindmap')}
            className="w-5 h-5 rounded hover:bg-surface-alt flex items-center justify-center text-text-secondary"
            title="Create New Mindmap"
          >
            <IconPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Maps directory scrolling list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {filteredMindmaps.length === 0 ? (
            <p className="text-[11px] text-text-muted text-center py-6">No maps saved.</p>
          ) : (
            filteredMindmaps.map(m => (
              <div 
                key={m.id}
                onClick={() => setActiveMindmapId(m.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                  m.id === activeMindmapId 
                    ? 'bg-rose-500/10 border-rose-500/10 text-rose-500 font-bold' 
                    : 'bg-transparent border-transparent hover:bg-surface-alt text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconFolder className={`w-4 h-4 shrink-0 ${m.id === activeMindmapId ? 'text-rose-500' : 'text-text-muted'}`} />
                  <div className="text-left leading-none truncate">
                    <p className="text-xs truncate">{m.title}</p>
                    <p className="text-[9px] text-text-muted mt-0.5 font-medium">Just now</p>
                  </div>
                </div>
                
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button 
                    onClick={e => {
                      e.stopPropagation();
                      setActiveMindmapId(m.id);
                      handleOpenRename();
                    }}
                    className="w-5.5 h-5.5 rounded hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary"
                  >
                    <IconEdit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={e => {
                      e.stopPropagation();
                      showConfirm('Delete Mindmap', `Delete "${m.title}"?`, () => {
                        deleteMindmap(m.id);
                        if (activeMindmapId === m.id) {
                          setActiveMindmapId(null);
                        }
                      });
                    }}
                    className="w-5.5 h-5.5 rounded hover:bg-rose-500/15 flex items-center justify-center text-text-muted hover:text-rose-500"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TAGS section */}
        <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between text-text-secondary font-black text-[10px] tracking-wider uppercase">
          <span>TAGS</span>
          <button className="w-5 h-5 rounded hover:bg-surface-alt flex items-center justify-center text-text-secondary">
            <IconPlus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-3 flex flex-wrap gap-1.5 border-b border-border/40">
          {['Work', 'Study', 'Personal', 'Ideas', 'Goals'].map((t, idx) => (
            <span 
              key={idx} 
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer ${
                idx === 0 ? 'bg-rose-500/10 text-rose-500' :
                idx === 1 ? 'bg-blue-500/10 text-blue-500' :
                idx === 2 ? 'bg-emerald-500/10 text-emerald-500' :
                idx === 3 ? 'bg-purple-500/10 text-purple-500' : 'bg-amber-500/10 text-amber-500'
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 text-left text-[11px] font-medium text-text-muted hover:text-text-primary cursor-pointer transition-colors">
          Recently Deleted
        </div>
      </div>

      {/* Mindmap editor canvas */}
      <div className="flex-1 h-full relative bg-surface-alt/25 overflow-hidden flex flex-col">
        {activeMindmap ? (
          <>
            {/* Top Canvas Header Bar */}
            <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-surface/30 backdrop-blur-md relative z-20 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveMindmapId(null)}
                  className="w-8 h-8 rounded-lg border border-border/50 bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary"
                  title="Back to Catalog"
                >
                  <IconArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-left leading-none">
                  <h3 className="font-extrabold text-sm text-text-primary">{activeMindmap.title}</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">Edited just now</p>
                </div>
              </div>

              {/* Header Action Menu tools */}
              <div className="flex items-center gap-3">
                <IconCloudCheck className="w-5 h-5 text-emerald-500" title="All changes saved to local space" />
                <div className="flex gap-0.5 border-l border-r border-border/50 px-2.5">
                  <button className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted" title="Undo"><IconArrowBackUp className="w-4.5 h-4.5" /></button>
                  <button className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted" title="Redo"><IconArrowForwardUp className="w-4.5 h-4.5" /></button>
                </div>
                <button 
                  className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                  onClick={() => alert("Sharing features are synced locally. Export JSON to backup.")}
                >
                  <IconShare className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>

            <MindmapCanvas 
              mindmap={activeMindmap}
              onUpdate={(updatedData) => updateMindmap(activeMindmap.id, updatedData)}
            />
          </>
        ) : (
          <EmptyState
            icon={<IconSitemap className="w-9 h-9 text-text-muted" />}
            title="Create a Mindmap"
            description="Replicate the mockup layouts by creating a default productivity mindmap."
            action={
              <button onClick={() => handleCreateMindmap()} className="btn btn-primary btn-md rounded-full px-5">
                <IconPlus className="w-4 h-4" /> Load Productivity Mindmap
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
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    mindmap.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = minX + (maxX - minX) / 2 + 80;
    const centerY = minY + (maxY - minY) / 2 + 22;

    setPan({
      x: rect.width / 2 - centerX,
      y: rect.height / 2 - centerY
    });
    setZoom(1);
  };

  // Center once on loading
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

  // Double click canvas: create root node or floating node
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
    const nodeCenterX = (e.clientX - rect.left - pan.x) / zoom;
    const nodeCenterY = (e.clientY - rect.top - pan.y) / zoom;
    
    nodeDragStartOffset.current = {
      x: nodeCenterX - node.x,
      y: nodeCenterY - node.y
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
        nodes: mindmap.nodes.map(n => n.id === nodeId ? { ...n, text: trimmed } : n)
      });
    }
    setEditingNodeId(null);
  };

  // Create Sub-node (Child node) connected to selected parent node
  const handleAddChildNode = () => {
    const parent = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!parent) return;

    const childId = crypto.randomUUID();
    
    // Choose side based on parent side, default to right for root
    let side: 'left' | 'right' | 'bottom' = parent.side || 'right';
    
    let x = parent.x;
    let y = parent.y;

    if (parent.isRoot) {
      // Determine side dynamically for children of root
      const leftCount = mindmap.nodes.filter(n => n.parentId === parent.id && n.side === 'left').length;
      const rightCount = mindmap.nodes.filter(n => n.parentId === parent.id && n.side === 'right').length;
      side = leftCount <= rightCount ? 'left' : 'right';
    }

    // Auto-spacing placement rules based on flow direction
    if (side === 'left') {
      x = parent.x - 200;
      const peerCount = mindmap.nodes.filter(n => n.parentId === parent.id).length;
      y = parent.y + (peerCount * 60) - 90;
    } else if (side === 'right') {
      x = parent.x + 200;
      const peerCount = mindmap.nodes.filter(n => n.parentId === parent.id).length;
      y = parent.y + (peerCount * 60) - 90;
    } else {
      // Bottom flow: horizontally stacked below
      y = parent.y + 120;
      const peerCount = mindmap.nodes.filter(n => n.parentId === parent.id).length;
      x = parent.x + (peerCount * 130) - 180;
    }

    const childNode: MindmapNode = {
      id: childId,
      text: 'Sub-topic',
      x: Math.round(x),
      y: Math.round(y),
      color: parent.color && parent.color !== 'gray' ? parent.color : 'gray',
      parentId: parent.id,
      side
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

  // Toggle Collapse / Expand state of parent branches via connection circle dots
  const handleToggleCollapse = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = mindmap.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const nextCollapsed = !node.collapsed;
    onUpdate({
      nodes: mindmap.nodes.map(n => n.id === nodeId ? { ...n, collapsed: nextCollapsed } : n)
    });
  };

  // Helper: check if a node is collapsed or hidden under a collapsed parent
  const isNodeHidden = (nodeId: string): boolean => {
    const node = mindmap.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    if (node.isRoot) return false;
    
    // Check if immediate parent is collapsed
    if (node.parentId) {
      const parent = mindmap.nodes.find(n => n.id === node.parentId);
      if (parent && (parent.collapsed || isNodeHidden(parent.id))) {
        return true;
      }
    }
    return false;
  };

  // Filter out collapsed/hidden elements
  const visibleNodes = useMemo(() => {
    return mindmap.nodes.filter(n => !isNodeHidden(n.id));
  }, [mindmap.nodes]);

  const visibleLinks = useMemo(() => {
    return mindmap.links.filter(l => !isNodeHidden(l.source) && !isNodeHidden(l.target));
  }, [mindmap.links, mindmap.nodes]);

  // Connect source to target
  const handleNodeClick = (nodeId: string) => {
    if (linkingSourceId) {
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

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    const node = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (node?.isRoot) {
      alert('Cannot delete the central idea.');
      return;
    }

    onUpdate({
      nodes: mindmap.nodes.filter(n => n.id !== selectedNodeId),
      links: mindmap.links.filter(l => l.source !== selectedNodeId && l.target !== selectedNodeId)
    });
    setSelectedNodeId(null);
  };

  const handleChangeNodeColor = (colorId: 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'gray') => {
    if (!selectedNodeId) return;
    onUpdate({
      nodes: mindmap.nodes.map(n => n.id === selectedNodeId ? { ...n, color: colorId } : n)
    });
  };

  // Coordinate math helpers for bezier curve branch connector path overlays
  const getNodeCenters = useMemo(() => {
    const centers: Record<string, { x: number; y: number }> = {};
    mindmap.nodes.forEach(node => {
      centers[node.id] = {
        x: node.x + 80,
        y: node.y + 22
      };
    });
    return centers;
  }, [mindmap.nodes]);

  const selectedNode = mindmap.nodes.find(n => n.id === selectedNodeId) || null;

  // Mini-Map box bounding variables
  const miniMapBounds = useMemo(() => {
    let minX = 0, maxX = 900, minY = 0, maxY = 600;
    mindmap.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
    return { minX, maxX, minY, maxY, width: maxX - minX + 200, height: maxY - minY + 100 };
  }, [mindmap.nodes]);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClickCanvas}
      className="flex-1 w-full h-full select-none cursor-grab active:cursor-grabbing relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)]"
      style={{
        backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* Node & Link Scaled Canvas Container */}
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
          {visibleLinks.map((link, idx) => {
            const sourceNode = mindmap.nodes.find(n => n.id === link.source);
            const targetNode = mindmap.nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;

            const start = getNodeCenters[link.source];
            const end = getNodeCenters[link.target];
            if (!start || !end) return null;

            // Calculate precise control points for flowing organic connector branches
            let pathData = '';
            const side = targetNode.side || 'right';

            if (side === 'left') {
              // Left alignment curve: starts left, moves left, ends right
              const xStart = sourceNode.x;
              const yStart = sourceNode.y + 22;
              const xEnd = targetNode.x + 160;
              const yEnd = targetNode.y + 22;
              
              const controlX1 = xStart - (xStart - xEnd) / 2;
              const controlX2 = xStart - (xStart - xEnd) / 2;
              pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
            } else if (side === 'right') {
              // Right alignment curve: starts right, moves right, ends left
              const xStart = sourceNode.x + 160;
              const yStart = sourceNode.y + 22;
              const xEnd = targetNode.x;
              const yEnd = targetNode.y + 22;

              const controlX1 = xStart + (xEnd - xStart) / 2;
              const controlX2 = xStart + (xEnd - xStart) / 2;
              pathData = `M ${xStart} ${yStart} C ${controlX1} ${yStart}, ${controlX2} ${yEnd}, ${xEnd} ${yEnd}`;
            } else {
              // Bottom flow curve: starts bottom, moves down, ends top
              const xStart = sourceNode.x + 80;
              const yStart = sourceNode.y + 44;
              const xEnd = targetNode.x + 80;
              const yEnd = targetNode.y;

              const controlY1 = yStart + (yEnd - yStart) / 2;
              const controlY2 = yStart + (yEnd - yStart) / 2;
              pathData = `M ${xStart} ${yStart} C ${xStart} ${controlY1}, ${xEnd} ${controlY2}, ${xEnd} ${yEnd}`;
            }

            // Get link color matched to parent node preset
            const colorPreset = COLOR_PRESETS.find(c => c.id === sourceNode.color);
            let strokeColor = 'rgba(148, 163, 184, 0.4)'; // fallback slate-400
            if (colorPreset && colorPreset.id !== 'gray') {
              strokeColor = colorPreset.id === 'rose' ? 'rgba(244, 63, 94, 0.45)' :
                            colorPreset.id === 'amber' ? 'rgba(245, 158, 11, 0.45)' :
                            colorPreset.id === 'purple' ? 'rgba(168, 85, 247, 0.45)' :
                            colorPreset.id === 'green' ? 'rgba(16, 185, 129, 0.45)' : 'rgba(59, 130, 246, 0.45)';
            }

            return (
              <path
                key={idx}
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* HTML Nodes Layer */}
        {visibleNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isLinkingSource = linkingSourceId === node.id;
          
          // Style classes
          const colorPreset = COLOR_PRESETS.find(c => c.id === node.color) || COLOR_PRESETS[5];

          // Determine if children exist to show expand/collapse dot toggle
          const hasChildren = mindmap.nodes.some(n => n.parentId === node.id);

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
                boxSizing: 'border-box'
              }}
              className={`rounded-2xl border px-3 py-2 flex items-center justify-center text-center cursor-pointer transition-all shadow-sm font-semibold text-xs leading-tight relative group ${
                node.isRoot 
                  ? 'bg-surface border-border text-text-primary text-sm font-black shadow-md flex-col gap-1' 
                  : `${colorPreset.bg} ${isSelected ? 'ring-4 ring-rose-500/10 border-rose-500 shadow-md' : 'hover:shadow'}`
              } ${isLinkingSource ? 'ring-4 ring-amber-500/20 border-amber-500 animate-pulse' : ''}`}
            >
              {/* Node Contents */}
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
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  {node.icon && (
                    <span className={`${node.isRoot ? 'text-lg mb-0.5' : 'mr-1.5 inline-block text-xs'}`}>
                      {node.icon}
                    </span>
                  )}
                  <span className={`break-words w-full truncate-3-lines ${node.isRoot ? 'font-extrabold text-[13px] tracking-tight' : 'font-bold'}`}>
                    {node.text}
                  </span>
                  {node.isRoot && <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Mind Map</span>}
                </div>
              )}

              {/* Collapsible dot toggle on branch border */}
              {hasChildren && !node.isRoot && (
                <button
                  onClick={(e) => handleToggleCollapse(e, node.id)}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    // Align on the outer border side facing children
                    left: node.side === 'left' ? '-7px' : node.side === 'right' ? 'auto' : '50%',
                    right: node.side === 'right' ? '-7px' : 'auto',
                    bottom: node.side === 'bottom' ? '-7px' : 'auto',
                    top: node.side === 'bottom' ? 'auto' : '50%',
                    transform: node.side === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
                    zIndex: 20
                  }}
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] font-black transition-all shadow-sm ${
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

      {/* Floating Canvas UI Indicators (Zoom state pill) */}
      <div className="absolute top-4 left-4 bg-surface/80 border border-border/50 px-3 py-1.5 rounded-full text-[10px] font-black text-text-secondary uppercase tracking-widest backdrop-blur shadow-sm select-none">
        {zoom === 1 ? '100% Zoom' : `${Math.round(zoom * 100)}% Zoom`}
      </div>

      {/* Zoom panel matching bottom-left controls */}
      <div className="absolute bottom-6 left-6 bg-surface/90 border border-border/60 p-2.5 rounded-2xl shadow-xl flex items-center gap-3.5 backdrop-blur z-20">
        <button 
          onClick={() => setZoom(prev => Math.max(prev / 1.15, 0.4))}
          className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary"
          title="Zoom Out"
        >
          <IconZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-black text-text-primary min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button 
          onClick={() => setZoom(prev => Math.min(prev * 1.15, 2.5))}
          className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary"
          title="Zoom In"
        >
          <IconZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleCenterCamera}
          className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-l border-border/50 pl-2"
          title="Center Canvas"
        >
          <IconFocusCentered className="w-4 h-4" />
        </button>
      </div>

      {/* Mini-Map Preview (Floating thumbnail widget in bottom-right corner) */}
      <div className="absolute bottom-6 right-6 w-32 h-24 bg-surface/90 border border-border/60 rounded-2xl shadow-xl p-2.5 backdrop-blur z-20 flex flex-col items-center justify-center overflow-hidden">
        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block select-none">
          Canvas Preview
        </span>
        <div className="relative w-full h-full bg-surface-alt/40 rounded-lg border border-border/30 overflow-hidden">
          {/* Miniature absolute Div nodes scaled down */}
          {visibleNodes.map(n => {
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
                  backgroundColor: n.isRoot ? 'var(--color-primary, #f43f5e)' :
                                   n.color === 'rose' ? '#f43f5e' :
                                   n.color === 'amber' ? '#f59e0b' :
                                   n.color === 'purple' ? '#a855f7' :
                                   n.color === 'green' ? '#10b880' : '#3b82f6',
                  borderRadius: '1px',
                  opacity: 0.8
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Apple-Style Toolbar at Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3.5 bg-surface/90 border border-border/60 p-2.5 rounded-2xl shadow-xl backdrop-blur-md max-w-xl w-fit z-20 overflow-visible">
        
        {/* Connection Link Connect Trigger */}
        <button
          onClick={() => {
            if (selectedNodeId) {
              setLinkingSourceId(selectedNodeId);
            } else {
              alert('Select a parent node first.');
            }
          }}
          className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-all ${
            linkingSourceId 
              ? 'bg-amber-500 text-white' 
              : 'bg-transparent text-text-secondary hover:bg-surface-alt'
          }`}
          title="Connect node connection line"
        >
          <IconLink className="w-4 h-4" />
        </button>

        {/* Add connected Sub-node */}
        <button
          onClick={handleAddChildNode}
          disabled={!selectedNodeId}
          className="flex items-center gap-1 font-bold text-[10px] rounded-lg px-3 py-1.5 bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <IconPlus className="w-3.5 h-3.5" /> Sub-topic
        </button>

        {/* Color selection buttons */}
        {selectedNode && (
          <div className="flex gap-1 items-center bg-surface-alt border border-border/50 p-0.5 rounded-lg border-l border-r border-border/50 px-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleChangeNodeColor(preset.id as any)}
                className={`w-4 h-4 rounded-full transition-all border ${
                  preset.id === 'gray' ? 'bg-surface border-border' :
                  preset.id === 'rose' ? 'bg-rose-500 border-rose-600' :
                  preset.id === 'amber' ? 'bg-amber-500 border-amber-600' :
                  preset.id === 'purple' ? 'bg-purple-500 border-purple-600' :
                  preset.id === 'green' ? 'bg-emerald-500 border-emerald-600' : 'bg-blue-500 border-blue-600'
                } ${selectedNode.color === preset.id ? 'scale-115 border-text-primary' : 'scale-90 border-transparent'}`}
                title={`Set Color: ${preset.label}`}
              />
            ))}
          </div>
        )}

        {/* Delete Selection */}
        {selectedNode && !selectedNode.isRoot && (
          <button
            onClick={handleDeleteSelectedNode}
            className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Delete Selected Node"
          >
            <IconTrash className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}
