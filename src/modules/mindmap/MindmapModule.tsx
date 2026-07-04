import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconTrash, IconSearch, IconSitemap, IconZoomIn, 
  IconZoomOut, IconEdit, IconLink, IconFocusCentered,
  IconArrowLeft, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, 
  IconFolder, IconShare, IconArrowBackUp, IconArrowForwardUp, IconCloudCheck,
  IconLayout, IconBook, IconExternalLink, IconDownload, IconHistory, IconPhoto,
  IconMaximize, IconMinimize
} from '@tabler/icons-react';
import { useAppStore, type Mindmap, type MindmapNode, type MindmapLink } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const COLOR_PRESETS = [
  { id: 'rose', label: 'Pink', bg: 'bg-rose-500/[0.04] border-rose-500/20 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-400 hover:bg-rose-500/[0.08] hover:border-rose-500/30' },
  { id: 'amber', label: 'Orange', bg: 'bg-amber-500/[0.04] border-amber-500/20 text-amber-600 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-400 hover:bg-amber-500/[0.08] hover:border-amber-500/30' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500/[0.04] border-purple-500/20 text-purple-600 dark:bg-purple-950/20 dark:border-purple-800/40 dark:text-purple-400 hover:bg-purple-500/[0.08] hover:border-purple-500/30' },
  { id: 'green', label: 'Green', bg: 'bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400 hover:bg-emerald-500/[0.08] hover:border-emerald-500/30' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500/[0.04] border-blue-500/20 text-blue-600 dark:bg-blue-950/20 dark:border-blue-800/40 dark:text-blue-400 hover:bg-blue-500/[0.08] hover:border-blue-500/30' },
  { id: 'gray', label: 'Gray', bg: 'bg-surface border-border text-text-primary hover:bg-surface-alt' }
] as const;

const getDomainName = (urlStr: string) => {
  try {
    const u = urlStr.startsWith('http') ? urlStr : 'https://' + urlStr;
    return new URL(u).hostname.replace('www.', '');
  } catch {
    return urlStr;
  }
};

type MindmapColor = NonNullable<MindmapNode['color']>;

// Helper: reconstruct the hierarchy in case properties are missing
const sanitizeMindmapNodes = (nodes: MindmapNode[], links: MindmapLink[]): MindmapNode[] => {
  const root = nodes.find(n => n.isRoot) || nodes[0];
  if (!root) return nodes;

  const nodeMap = new Map<string, MindmapNode>(nodes.map(n => [n.id, { ...n }]));
  const visited = new Set<string>();
  const queue: { id: string; parentId?: string; side?: 'left' | 'right' | 'bottom' }[] = [{ id: root.id }];

  // BFS traversal to discover and repair parentId & side connections
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const node = nodeMap.get(current.id);
    if (node) {
      if (!node.isRoot) {
        if (current.parentId && !node.parentId) node.parentId = current.parentId;
        if (current.side && !node.side) node.side = current.side;
      }
    }

    const connectedLinks = links.filter(l => l.source === current.id || l.target === current.id);
    connectedLinks.forEach(link => {
      const neighborId = link.source === current.id ? link.target : link.source;
      if (!visited.has(neighborId)) {
        let side = current.side;
        if (current.id === root.id) {
          const neighbor = nodes.find(n => n.id === neighborId);
          if (neighbor) {
            if (neighbor.x < root.x - 50) side = 'left';
            else if (neighbor.x > root.x + 50) side = 'right';
            else side = 'bottom';
          }
        }
        queue.push({ id: neighborId, parentId: current.id, side });
      }
    });
  }

  return Array.from(nodeMap.values());
};

export default function MindmapModule() {
  const { mindmaps, addMindmap, updateMindmap, deleteMindmap, showConfirm } = useAppStore();

  const [activeMindmapId, setActiveMindmapId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  // New layout and search states
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const data = JSON.parse(rawContent);
        
        let importedMaps: any[] = [];
        
        const parseSingleMap = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return null;
          
          let nodes = obj.nodes || obj.elements || obj.vertices;
          if (!Array.isArray(nodes) && Array.isArray(obj)) {
            nodes = obj;
          }
          if (!Array.isArray(nodes)) return null;
          
          const formattedNodes = nodes.map((node: any, index: number) => {
            const id = node.id || node.key || node.uuid || `node-${index}`;
            const text = node.text || node.label || node.title || node.name || 'Unnamed Node';
            return {
              id: id.toString(),
              text: text.toString(),
              x: typeof node.x === 'number' ? node.x : 450 + (index * 20),
              y: typeof node.y === 'number' ? node.y : 250 + (index * 20),
              color: node.color || 'gray',
              isRoot: node.isRoot || (index === 0 && !node.parentId),
              parentId: node.parentId ? node.parentId.toString() : undefined,
              side: node.side || undefined,
              collapsed: !!node.collapsed,
              notes: node.notes || undefined,
              links: Array.isArray(node.links) ? node.links : undefined,
              images: Array.isArray(node.images) ? node.images : undefined,
              pdfs: Array.isArray(node.pdfs) ? node.pdfs : undefined
            };
          });

          let links = obj.links || obj.edges || obj.connections || [];
          if (!Array.isArray(links)) {
            links = [];
          }

          const formattedLinks = links.map((link: any) => {
            const source = link.source || link.from || link.start;
            const target = link.target || link.to || link.end;
            return {
              source: source ? source.toString() : '',
              target: target ? target.toString() : ''
            };
          }).filter((l: any) => l.source && l.target);

          if (formattedLinks.length === 0) {
            formattedNodes.forEach(node => {
              if (node.parentId && !node.isRoot) {
                formattedLinks.push({
                  source: node.parentId,
                  target: node.id
                });
              }
            });
          }

          return {
            title: obj.title || obj.name || 'Imported Workspace Map',
            nodes: formattedNodes,
            links: formattedLinks,
            edgeStyle: obj.edgeStyle || 'solid'
          };
        };

        if (Array.isArray(data)) {
          if (data.length > 0 && (data[0].id || data[0].text)) {
            const parsed = parseSingleMap(data);
            if (parsed) importedMaps.push(parsed);
          } else {
            data.forEach(item => {
              const parsed = parseSingleMap(item);
              if (parsed) importedMaps.push(parsed);
            });
          }
        } else if (data && data.mindmaps && Array.isArray(data.mindmaps)) {
          data.mindmaps.forEach((item: any) => {
            const parsed = parseSingleMap(item);
            if (parsed) importedMaps.push(parsed);
          });
        } else {
          const parsed = parseSingleMap(data);
          if (parsed) importedMaps.push(parsed);
        }

        if (importedMaps.length > 0) {
          let lastId = '';
          for (const map of importedMaps) {
            const newId = crypto.randomUUID();
            await addMindmap({
              ...map,
              id: newId,
              createdAt: new Date().toISOString()
            });
            lastId = newId;
          }
          if (lastId) {
            setActiveMindmapId(lastId);
          }
        } else {
          alert("Invalid mindmap file structure (nodes or links missing).");
        }
      } catch (err) {
        alert("Invalid JSON format or import failed");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

  // Create default Productivity Mindmap
  const handleCreateMindmap = (customTitle?: string) => {
    const newId = crypto.randomUUID();
    
    // Default nodes array
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

      // Tools Children (Bottom Flow)
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

  const handleResetToDefault = () => {
    if (!activeMindmap) return;
    showConfirm(
      'Reset Mindmap',
      'Reset all nodes & connections to default Outline?',
      () => {
        // Recreate default Productivity layout on current ID
        const initialNodes: MindmapNode[] = [
          { id: 'root', text: 'Productivity Mind Map', x: 450, y: 250, color: 'gray', isRoot: true, icon: '🧠' },
          { id: 'mindset', text: 'Mindset', x: 260, y: 150, color: 'rose', parentId: 'root', side: 'left' },
          { id: 'planning', text: 'Planning', x: 640, y: 150, color: 'amber', parentId: 'root', side: 'right' },
          { id: 'habits', text: 'Habits', x: 260, y: 350, color: 'purple', parentId: 'root', side: 'left' },
          { id: 'wellbeing', text: 'Wellbeing', x: 640, y: 350, color: 'green', parentId: 'root', side: 'right' },
          { id: 'tools', text: 'Tools', x: 450, y: 440, color: 'blue', parentId: 'root', side: 'bottom' },
          
          { id: 'ms1', text: 'Positive Thinking', x: 40, y: 60, color: 'gray', parentId: 'mindset', side: 'left', icon: '⭐' },
          { id: 'ms2', text: 'Growth Mindset', x: 40, y: 120, color: 'gray', parentId: 'mindset', side: 'left', icon: '📈' },
          { id: 'ms3', text: 'Self Discipline', x: 40, y: 180, color: 'gray', parentId: 'mindset', side: 'left', icon: '🛡️' },
          { id: 'ms4', text: 'Focus & Clarity', x: 40, y: 240, color: 'gray', parentId: 'mindset', side: 'left', icon: '🎯' },

          { id: 'pl1', text: 'Set Goals', x: 860, y: 60, color: 'gray', parentId: 'planning', side: 'right', icon: '🎯' },
          { id: 'pl2', text: 'Prioritize Tasks', x: 860, y: 120, color: 'gray', parentId: 'planning', side: 'right', icon: '📋' },
          { id: 'pl3', text: 'Time Blocking', x: 860, y: 180, color: 'gray', parentId: 'planning', side: 'right', icon: '⏰' },
          { id: 'pl4', text: 'Review & Reflect', x: 860, y: 240, color: 'gray', parentId: 'planning', side: 'right', icon: '🔄' },

          { id: 'hb1', text: 'Daily Routine', x: 40, y: 310, color: 'gray', parentId: 'habits', side: 'left', icon: '⏰' },
          { id: 'hb2', text: 'Morning Ritual', x: 40, y: 370, color: 'gray', parentId: 'habits', side: 'left', icon: '🌅' },
          { id: 'hb3', text: 'Pomodoro Technique', x: 40, y: 430, color: 'gray', parentId: 'habits', side: 'left', icon: '⏱️' },
          { id: 'hb4', text: 'Digital Detox', x: 40, y: 490, color: 'gray', parentId: 'habits', side: 'left', icon: '📱' },

          { id: 'wb1', text: 'Exercise', x: 860, y: 310, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🏋️' },
          { id: 'wb2', text: 'Meditation', x: 860, y: 370, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🧘' },
          { id: 'wb3', text: 'Healthy Diet', x: 860, y: 430, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🍏' },
          { id: 'wb4', text: 'Sleep', x: 860, y: 490, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🌙' },

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

        updateMindmap(activeMindmap.id, {
          nodes: initialNodes,
          links: initialLinks
        });
      }
    );
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

  const filteredMindmaps = useMemo(() => {
    return mindmaps.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (selectedTagFilter) {
        const tagQuery = selectedTagFilter.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(tagQuery);
        const matchNodes = m.nodes.some(n => n.text.toLowerCase().includes(tagQuery));
        return matchTitle || matchNodes;
      }
      return true;
    });
  }, [mindmaps, search, selectedTagFilter]);

  return (
    <div className={`flex gap-0 overflow-hidden bg-background text-text-primary transition-all duration-300 ${
      isFullScreen 
        ? 'fixed inset-0 w-screen h-screen z-[150] rounded-none border-none' 
        : 'h-[calc(100vh-130px)] rounded-[32px] border border-border/60'
    }`}>
      
      {/* Workspace Sidebar List */}
      <div 
        className={`bg-surface/40 border-r border-border/50 flex flex-col shrink-0 transition-all duration-300 ${
          isLeftSidebarOpen 
            ? activeMindmapId ? 'hidden md:flex w-[260px]' : 'flex w-full md:w-[260px]' 
            : 'w-0 overflow-hidden border-r-0 hidden'
        }`}
      >
        
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
                    ? 'bg-stone-100/70 dark:bg-stone-900 border-border/50 text-text-primary font-bold shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-surface-alt/70 text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconFolder className={`w-4 h-4 shrink-0 ${m.id === activeMindmapId ? 'text-primary' : 'text-text-muted'}`} />
                  <div className="text-left leading-none truncate">
                    <p className="text-xs truncate font-bold">{m.title}</p>
                    <p className="text-[9px] text-text-muted mt-0.5 font-bold uppercase">{m.nodes?.length || 0} nodes</p>
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
          {['Work', 'Study', 'Personal', 'Ideas', 'Goals'].map((t, idx) => {
            const isActive = selectedTagFilter === t;
            return (
              <span 
                key={idx} 
                onClick={() => setSelectedTagFilter(isActive ? null : t)}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-all duration-150 ${
                  t === 'Work' ? (isActive ? 'bg-rose-500 text-white shadow-sm' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20') :
                  t === 'Study' ? (isActive ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20') :
                  t === 'Personal' ? (isActive ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20') :
                  t === 'Ideas' ? (isActive ? 'bg-purple-500 text-white shadow-sm' : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20') : 
                  (isActive ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20')
                }`}
              >
                {t}
              </span>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 text-left text-[11px] font-medium text-text-muted hover:text-text-primary cursor-pointer transition-colors">
          Recently Deleted
        </div>
      </div>

      {/* Mindmap editor canvas */}
      <div className={`flex-1 h-full relative bg-surface-alt/25 overflow-hidden flex flex-col ${activeMindmap ? 'flex w-full' : 'hidden md:flex'}`}>
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
              <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                <IconCloudCheck className="w-5 h-5 text-emerald-500 shrink-0" title="All changes saved to local space" />
                <button 
                  onClick={handleResetToDefault}
                  className="w-8 h-8 rounded-lg border border-border/40 bg-surface text-text-muted hover:text-rose-500 flex items-center justify-center transition-colors shrink-0"
                  title="Reset Mindmap data layout to default hierarchy"
                >
                  <IconHistory className="w-4 h-4" />
                </button>
                <div className="flex gap-0.5 border-l border-r border-border/50 px-2.5 shrink-0">
                  <button className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted shrink-0" title="Undo"><IconArrowBackUp className="w-4.5 h-4.5" /></button>
                  <button className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted shrink-0" title="Redo"><IconArrowForwardUp className="w-4.5 h-4.5" /></button>
                </div>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJson} className="hidden" />
                <button 
                  className="px-4 py-1.5 rounded-full bg-surface hover:bg-surface-alt text-text-primary border border-border font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import JSON Mindmap"
                >
                  <IconDownload className="w-3.5 h-3.5 rotate-180" /> Import
                </button>
                <button 
                  className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                  onClick={() => alert("Sharing features are synced locally. Export JSON/SVG to backup.")}
                >
                  <IconShare className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>

            <MindmapCanvas 
              mindmap={activeMindmap}
              onUpdate={(updatedData) => {
                // Automatically sanitize nodes to reconstruct hierarchies
                let finalNodes = updatedData.nodes || activeMindmap.nodes;
                const finalLinks = updatedData.links || activeMindmap.links;
                
                if (updatedData.nodes || updatedData.links) {
                  finalNodes = sanitizeMindmapNodes(finalNodes, finalLinks);
                }

                updateMindmap(activeMindmap.id, {
                  ...updatedData,
                  nodes: finalNodes
                });
              }}
              isLeftSidebarOpen={isLeftSidebarOpen}
              setIsLeftSidebarOpen={setIsLeftSidebarOpen}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
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


// Lightweight Markdown parser matching Apple UI/UX styling for ChatGPT/Gemini outputs
function renderMarkdown(md: string): React.ReactNode {
  if (!md) return null;

  // Split by double line breaks or single line breaks with different prefixes to get blocks
  const rawBlocks = md.split(/\n\n+/);
  const blocks: string[] = [];

  rawBlocks.forEach(b => {
    const trimmed = b.trim();
    if (trimmed.startsWith('```')) {
      blocks.push(b);
    } else if (trimmed.startsWith('|')) {
      blocks.push(b);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
      blocks.push(b);
    } else {
      blocks.push(b);
    }
  });

  return (
    <div className="space-y-4">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Fenced code blocks
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const code = lines.slice(1, lines.length - (lines[lines.length - 1].trim() === '```' ? 1 : 0)).join('\n');
          return (
            <pre key={bIdx} className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 overflow-x-auto text-[11px] font-mono text-stone-800 dark:text-stone-300 leading-relaxed my-2 shadow-inner">
              <code>{code}</code>
            </pre>
          );
        }

        // Tables
        if (trimmed.startsWith('|')) {
          const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
          if (lines.length > 0) {
            const hasSeparator = lines[1] && lines[1].replace(/[\s\-\|]/g, '') === '';
            const dataLines = hasSeparator ? [lines[0], ...lines.slice(2)] : lines;

            const parseRow = (rowStr: string) => {
              return rowStr.split('|').slice(1, -1).map(c => c.trim());
            };

            const headerCells = parseRow(dataLines[0]);
            const bodyRows = dataLines.slice(1).map(parseRow);

            return (
              <div key={bIdx} className="overflow-x-auto my-3 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm bg-white dark:bg-stone-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
                      {headerCells.map((cell, cIdx) => (
                        <th key={cIdx} className="px-4 py-2.5 font-bold text-stone-700 dark:text-stone-300 border-r border-stone-200/50 last:border-0">
                          {renderInlineMarkdown(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 text-stone-600 dark:text-stone-400 font-medium leading-relaxed border-r border-stone-200/40 dark:border-stone-800/40 last:border-0">
                            {renderInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Headers
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (match) {
            const level = match[1].length;
            const text = match[2];
            const content = renderInlineMarkdown(text);
            if (level === 1) return <h1 key={bIdx} className="text-xl font-black text-stone-800 dark:text-stone-100 tracking-tight mt-6 mb-2 border-b border-stone-200 dark:border-stone-800 pb-2">{content}</h1>;
            if (level === 2) return <h2 key={bIdx} className="text-lg font-extrabold text-stone-800 dark:text-stone-200 tracking-tight mt-5 mb-2">{content}</h2>;
            if (level === 3) return <h3 key={bIdx} className="text-base font-bold text-stone-750 dark:text-stone-205 mt-4 mb-1.5">{content}</h3>;
            return <h4 key={bIdx} className="text-sm font-bold text-stone-600 dark:text-stone-400 mt-3 mb-1">{content}</h4>;
          }
        }

        // Blockquotes
        if (trimmed.startsWith('>')) {
          const lines = trimmed.split('\n').map(l => l.replace(/^>\s?/, ''));
          return (
            <blockquote key={bIdx} className="border-l-4 border-amber-500 bg-amber-500/5 dark:bg-amber-500/2 rounded-r-xl px-4 py-3 text-xs italic text-stone-600 dark:text-stone-400 my-3 leading-relaxed">
              {renderMarkdown(lines.join('\n\n'))}
            </blockquote>
          );
        }

        // Lists
        const listLines = trimmed.split('\n');
        const isBulletList = listLines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || l.trim().startsWith('• '));
        const isOrderedList = listLines.every(l => /^\d+\.\s+/.test(l.trim()));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 dark:text-stone-400 my-3">
              {listLines.map((line, lIdx) => (
                <li key={lIdx} className="font-medium leading-relaxed">
                  {renderInlineMarkdown(line.trim().replace(/^[-*•]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        if (isOrderedList) {
          return (
            <ol key={bIdx} className="list-decimal pl-5 space-y-1.5 text-xs text-stone-600 dark:text-stone-400 my-3">
              {listLines.map((line, lIdx) => (
                <li key={lIdx} className="font-medium leading-relaxed">
                  {renderInlineMarkdown(line.trim().replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Default: Paragraph with soft line breaks
        const lines = trimmed.split('\n');
        return (
          <p key={bIdx} className="text-xs text-stone-650 dark:text-stone-350 font-medium leading-relaxed mb-3">
            {lines.map((line, lIdx) => (
              <span key={lIdx} className="block">
                {renderInlineMarkdown(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  let parts: Array<{ type: 'text' | 'bold' | 'italic' | 'code' | 'link'; content: string; url?: string }> = [
    { type: 'text', content: text }
  ];

  const splitParts = (
    regex: RegExp, 
    type: 'bold' | 'italic' | 'code' | 'link',
    processMatch: (match: RegExpExecArray) => { content: string; url?: string }
  ) => {
    let newParts: typeof parts = [];
    for (const part of parts) {
      if (part.type !== 'text') {
        newParts.push(part);
        continue;
      }

      let lastIndex = 0;
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(part.content)) !== null) {
        if (match.index > lastIndex) {
          newParts.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
        }
        const processed = processMatch(match);
        newParts.push({ type, ...processed });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.content.length) {
        newParts.push({ type: 'text', content: part.content.substring(lastIndex) });
      }
    }
    parts = newParts;
  };

  splitParts(/`([^`]+)`/g, 'code', (m) => ({ content: m[1] }));
  splitParts(/\[([^\]]+)\]\(([^)]+)\)/g, 'link', (m) => ({ content: m[1], url: m[2] }));
  splitParts(/\*\*([^*]+)\*\*/g, 'bold', (m) => ({ content: m[1] }));
  splitParts(/\*([^*]+)\*/g, 'italic', (m) => ({ content: m[1] }));

  return parts.map((part, idx) => {
    switch (part.type) {
      case 'bold': return <strong key={idx} className="font-extrabold text-stone-900 dark:text-white">{part.content}</strong>;
      case 'italic': return <em key={idx} className="italic text-stone-700 dark:text-stone-300">{part.content}</em>;
      case 'code': return <code key={idx} className="bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold border border-stone-200/50 dark:border-stone-850">{part.content}</code>;
      case 'link': return <a key={idx} href={part.url} target="_blank" rel="noopener noreferrer" className="text-amber-650 dark:text-amber-450 hover:underline font-bold inline-flex items-center gap-0.5">{part.content}</a>;
      default: return <span key={idx}>{part.content}</span>;
    }
  });
}

// Infinite Mindmap Canvas component
function MindmapCanvas({ 
  mindmap, 
  onUpdate,
  isLeftSidebarOpen,
  setIsLeftSidebarOpen,
  isFullScreen,
  setIsFullScreen
}: { 
  mindmap: Mindmap; 
  onUpdate: (data: Partial<Mindmap>) => void; 
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (val: boolean) => void;
  isFullScreen: boolean;
  setIsFullScreen: (val: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { showConfirm } = useAppStore();
  
  // Apple Notes Modal State
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesModalNodeId, setNotesModalNodeId] = useState<string | null>(null);
  const [notesActiveTab, setNotesActiveTab] = useState<'view' | 'edit'>('view');
  const [canvasSearchQuery, setCanvasSearchQuery] = useState('');

  const notesModalNode = useMemo(() => {
    return mindmap.nodes.find(n => n.id === notesModalNodeId) || null;
  }, [mindmap.nodes, notesModalNodeId]);
  
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [fullScreenImages, setFullScreenImages] = useState<string[] | null>(null);
  const [fullScreenImageIdx, setFullScreenImageIdx] = useState(0);
  
  // Pan and Zoom Camera state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Linking/Dragging/Drawer/Exporter states
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cameraStartPan = useRef({ x: 0, y: 0 });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStartOffset = useRef({ x: 0, y: 0 });

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Right side panel drawer for notes/attachments
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  useEffect(() => {
    handleCenterCamera();
    setSelectedNodeId(null);
    setLinkingSourceId(null);
    setEditingNodeId(null);
    setIsDrawerOpen(false);
  }, [mindmap.id]);

  // Keyboard Shortcuts Handler (Tab for child, Enter for sibling)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger canvas shortcuts while typing inside inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable'))) {
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
  }, [selectedNodeId, mindmap.nodes, mindmap.links]);

  // Handle canvas background drag (Panning)
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

  // Auto color assignment helper
  const getNextAvailableColor = (parentId: string, currentParentColor?: MindmapColor): MindmapColor => {
    const COLORS: MindmapColor[] = ['rose', 'amber', 'purple', 'green', 'blue'];
    const siblingColors = mindmap.nodes.filter(n => n.parentId === parentId).map(n => n.color);
    const available = COLORS.filter(c => c !== currentParentColor && !siblingColors.includes(c));
    if (available.length > 0) return available[0];
    const fallbackColors = COLORS.filter(c => c !== currentParentColor);
    return fallbackColors[Math.floor(Math.random() * fallbackColors.length)] || 'blue';
  };

  // Add child subtopic
  const handleAddChildNode = () => {
    const parent = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!parent) return;

    const childId = crypto.randomUUID();
    let side: 'left' | 'right' | 'bottom' = parent.side || 'right';
    let x = parent.x;
    let y = parent.y;

    if (parent.isRoot) {
      const leftCount = mindmap.nodes.filter(n => n.parentId === parent.id && n.side === 'left').length;
      const rightCount = mindmap.nodes.filter(n => n.parentId === parent.id && n.side === 'right').length;
      side = leftCount <= rightCount ? 'left' : 'right';
    }

    if (side === 'left') {
      x = parent.x - 200;
      const peerCount = mindmap.nodes.filter(n => n.parentId === parent.id).length;
      y = parent.y + (peerCount * 60) - 90;
    } else if (side === 'right') {
      x = parent.x + 200;
      const peerCount = mindmap.nodes.filter(n => n.parentId === parent.id).length;
      y = parent.y + (peerCount * 60) - 90;
    } else {
      y = parent.y + 120;
      const peerCount = mindmap.nodes.filter(n => n.parentId === parent.id).length;
      x = parent.x + (peerCount * 130) - 180;
    }

    const assignedColor = getNextAvailableColor(parent.id, parent.color);

    const childNode: MindmapNode = {
      id: childId,
      text: 'Sub-topic',
      x: Math.round(x),
      y: Math.round(y),
      color: assignedColor,
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

  // Add sibling subtopic (Enter key)
  const handleAddSiblingNode = () => {
    const selected = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!selected || selected.isRoot) return;

    const parentId = selected.parentId;
    if (!parentId) return;
    
    const parentNode = mindmap.nodes.find(n => n.id === parentId);

    const siblingId = crypto.randomUUID();
    const side = selected.side || 'right';

    let x = selected.x;
    let y = selected.y + 60; // stack below sibling

    if (side === 'bottom') {
      x = selected.x + 135; // horizontal stack
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
      side
    };

    const siblingLink: MindmapLink = {
      source: parentId,
      target: siblingId
    };

    onUpdate({
      nodes: [...mindmap.nodes, siblingNode],
      links: [...mindmap.links, siblingLink]
    });
    setSelectedNodeId(siblingId);
  };

  // Auto-Arrange Layout algorithm
  const handleAutoArrange = () => {
    const root = mindmap.nodes.find(n => n.isRoot);
    if (!root) return;

    const newNodes = [...mindmap.nodes];
    const rootIndex = newNodes.findIndex(n => n.id === root.id);
    newNodes[rootIndex] = { ...root, x: 450, y: 250 }; // Center root node

    const primaryBranches = newNodes.filter(n => n.parentId === root.id);
    const leftBranches = primaryBranches.filter(n => n.side === 'left');
    const rightBranches = primaryBranches.filter(n => n.side === 'right');
    const bottomBranches = primaryBranches.filter(n => n.side === 'bottom');

    // Layout left branches
    leftBranches.forEach((branch, bIdx) => {
      const bX = root.x - 190;
      const bY = root.y + (bIdx - (leftBranches.length - 1) / 2) * 200;
      const nodeIdx = newNodes.findIndex(n => n.id === branch.id);
      newNodes[nodeIdx] = { ...branch, x: Math.round(bX), y: Math.round(bY) };

      const children = newNodes.filter(n => n.parentId === branch.id);
      children.forEach((child, cIdx) => {
        const cX = bX - 220;
        const cY = bY + (cIdx - (children.length - 1) / 2) * 60;
        const cNodeIdx = newNodes.findIndex(n => n.id === child.id);
        newNodes[cNodeIdx] = { ...child, x: Math.round(cX), y: Math.round(cY) };
      });
    });

    // Layout right branches
    rightBranches.forEach((branch, bIdx) => {
      const bX = root.x + 190;
      const bY = root.y + (bIdx - (rightBranches.length - 1) / 2) * 200;
      const nodeIdx = newNodes.findIndex(n => n.id === branch.id);
      newNodes[nodeIdx] = { ...branch, x: Math.round(bX), y: Math.round(bY) };

      const children = newNodes.filter(n => n.parentId === branch.id);
      children.forEach((child, cIdx) => {
        const cX = bX + 220;
        const cY = bY + (cIdx - (children.length - 1) / 2) * 60;
        const cNodeIdx = newNodes.findIndex(n => n.id === child.id);
        newNodes[cNodeIdx] = { ...child, x: Math.round(cX), y: Math.round(cY) };
      });
    });

    // Layout bottom branches (Horizontal alignment below)
    bottomBranches.forEach((branch, bIdx) => {
      const bX = root.x + (bIdx - (bottomBranches.length - 1) / 2) * 240;
      const bY = root.y + 190;
      const nodeIdx = newNodes.findIndex(n => n.id === branch.id);
      newNodes[nodeIdx] = { ...branch, x: Math.round(bX), y: Math.round(bY) };

      const children = newNodes.filter(n => n.parentId === branch.id);
      children.forEach((child, cIdx) => {
        const cY = bY + 120;
        const cX = bX + (cIdx - (children.length - 1) / 2) * 140;
        const cNodeIdx = newNodes.findIndex(n => n.id === child.id);
        newNodes[cNodeIdx] = { ...child, x: Math.round(cX), y: Math.round(cY) };
      });
    });

    onUpdate({ nodes: newNodes });
    handleCenterCamera();
  };

  const handleOpenAll = () => {
    onUpdate({
      nodes: mindmap.nodes.map(n => n.isRoot ? n : { ...n, collapsed: false })
    });
  };

  const handleCloseAll = () => {
    onUpdate({
      nodes: mindmap.nodes.map(n => n.isRoot ? n : { ...n, collapsed: true })
    });
  };

  // Toggle Collapse / Expand parent branch
  const handleToggleCollapse = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const node = mindmap.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const nextCollapsed = !node.collapsed;
    
    // Trigger deep state update
    onUpdate({
      nodes: mindmap.nodes.map(n => n.id === nodeId ? { ...n, collapsed: nextCollapsed } : n)
    });
  };

  // Helper recursive checking for branch folding
  const isNodeHidden = (nodeId: string): boolean => {
    const node = mindmap.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    if (node.isRoot) return false;
    
    if (node.parentId) {
      const parent = mindmap.nodes.find(n => n.id === node.parentId);
      if (parent && (parent.collapsed || isNodeHidden(parent.id))) {
        return true;
      }
    }
    return false;
  };

  const visibleNodes = useMemo(() => {
    return mindmap.nodes.filter(n => !isNodeHidden(n.id));
  }, [mindmap.nodes]);

  const visibleLinks = useMemo(() => {
    return mindmap.links.filter(l => !isNodeHidden(l.source) && !isNodeHidden(l.target));
  }, [mindmap.links, mindmap.nodes]);

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

  const getDescendants = (nodeId: string, nodes: MindmapNode[]): string[] => {
    const childIds = nodes.filter(n => n.parentId === nodeId).map(n => n.id);
    let descendants = [...childIds];
    childIds.forEach(id => {
      descendants = [...descendants, ...getDescendants(id, nodes)];
    });
    return descendants;
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    const node = mindmap.nodes.find(n => n.id === selectedNodeId);
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
            nodes: mindmap.nodes.filter(n => n.id !== selectedNodeId && !descendants.includes(n.id)),
            links: mindmap.links.filter(l => 
              l.source !== selectedNodeId && 
              !descendants.includes(l.source as string) && 
              l.target !== selectedNodeId && 
              !descendants.includes(l.target as string)
            )
          });
          setSelectedNodeId(null);
          setIsDrawerOpen(false);
        }
      );
    } else {
      onUpdate({
        nodes: mindmap.nodes.filter(n => n.id !== selectedNodeId),
        links: mindmap.links.filter(l => l.source !== selectedNodeId && l.target !== selectedNodeId)
      });
      setSelectedNodeId(null);
      setIsDrawerOpen(false);
    }
  };

  const handleChangeNodeColor = (colorId: MindmapColor) => {
    if (!selectedNodeId) return;
    onUpdate({
      nodes: mindmap.nodes.map(n => n.id === selectedNodeId ? { ...n, color: colorId } : n)
    });
  };

  // Node editing state updates inside sliding drawer
  const handleUpdateNodeProp = (key: keyof MindmapNode, val: any) => {
    if (!selectedNodeId) return;
    onUpdate({
      nodes: mindmap.nodes.map(n => n.id === selectedNodeId ? { ...n, [key]: val } : n)
    });
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !selectedNodeId) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const currentNode = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentLinks = currentNode.links || [];
    if (!currentLinks.includes(url)) {
      handleUpdateNodeProp('links', [...currentLinks, url]);
    }
    setNewLinkUrl('');
  };

  const handleRemoveLink = (urlToRemove: string) => {
    const currentNode = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentLinks = currentNode.links || [];
    handleUpdateNodeProp('links', currentLinks.filter(u => u !== urlToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedNodeId) return;
    const currentNode = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentImages = currentNode.images || [];

    Array.from(files).forEach(file => {
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
    const currentNode = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentImages = currentNode.images || [];
    handleUpdateNodeProp('images', currentImages.filter((_, idx) => idx !== index));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedNodeId) return;
    const currentNode = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentPdfs = currentNode.pdfs || [];

    Array.from(files).forEach(file => {
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
    const currentNode = mindmap.nodes.find(n => n.id === selectedNodeId);
    if (!currentNode) return;
    const currentPdfs = currentNode.pdfs || [];
    handleUpdateNodeProp('pdfs', currentPdfs.filter((_, idx) => idx !== index));
  };

  const getDomainFavicon = (urlStr: string) => {
    try {
      const domain = new URL(urlStr).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  // Bezier connectors
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

  // JSON Export (For backup & importing)
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

  // SVG Export
  const handleExportSvg = () => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" style="background:#f8fafc;">`;
    
    // Draw connection links
    visibleLinks.forEach(link => {
      const sourceNode = mindmap.nodes.find(n => n.id === link.source);
      const targetNode = mindmap.nodes.find(n => n.id === link.target);
      if (!sourceNode || !targetNode) return;
      const start = { x: sourceNode.x + 80, y: sourceNode.y + 22 };
      const end = { x: targetNode.x + 80, y: targetNode.y + 22 };
      
      svgContent += `<path d="M ${start.x} ${start.y} C ${start.x + (end.x - start.x)/2} ${start.y}, ${start.x + (end.x - start.x)/2} ${end.y}, ${end.x} ${end.y}" fill="none" stroke="#cbd5e1" stroke-width="2" />`;
    });

    // Draw nodes
    visibleNodes.forEach(node => {
      const width = node.isRoot ? 180 : 160;
      const height = node.isRoot ? 64 : 44;
      const fillColor = node.isRoot ? '#ffffff' :
                        node.color === 'rose' ? '#fff1f2' :
                        node.color === 'amber' ? '#fef3c7' :
                        node.color === 'purple' ? '#faf5ff' :
                        node.color === 'green' ? '#ecfdf5' : '#eff6ff';
      const strokeColor = node.isRoot ? '#cbd5e1' :
                          node.color === 'rose' ? '#fda4af' :
                          node.color === 'amber' ? '#fde047' :
                          node.color === 'purple' ? '#e9d5ff' :
                          node.color === 'green' ? '#a7f3d0' : '#bfdbfe';
      const textColor = node.isRoot ? '#1e293b' :
                        node.color === 'rose' ? '#e11d48' :
                        node.color === 'amber' ? '#d97706' :
                        node.color === 'purple' ? '#9333ea' :
                        node.color === 'green' ? '#059669' : '#2563eb';

      svgContent += `<g transform="translate(${node.x}, ${node.y})">
        <rect width="${width}" height="${height}" rx="12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" />
        <text x="${width/2}" y="${height/2 + 5}" text-anchor="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">${node.text}</text>
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

              const colorPreset = COLOR_PRESETS.find(c => c.id === sourceNode.color);
              let strokeColor = 'rgba(148, 163, 184, 0.25)';
              if (colorPreset && colorPreset.id !== 'gray') {
                strokeColor = colorPreset.id === 'rose' ? 'rgba(244, 63, 94, 0.3)' :
                              colorPreset.id === 'amber' ? 'rgba(245, 158, 11, 0.3)' :
                              colorPreset.id === 'purple' ? 'rgba(168, 85, 247, 0.3)' :
                              colorPreset.id === 'green' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)';
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
            const colorPreset = COLOR_PRESETS.find(c => c.id === node.color) || COLOR_PRESETS[5];
            const hasChildren = mindmap.nodes.some(n => n.parentId === node.id);
            const isMatch = canvasSearchQuery.trim() !== '' && 
              node.text.toLowerCase().includes(canvasSearchQuery.toLowerCase());

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
                    ? 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-text-primary text-[13px] font-black shadow-lg shadow-stone-150/40 dark:shadow-none flex-col gap-1.5 hover:shadow-xl' 
                    : `${colorPreset.bg} ${isSelected ? 'ring-4 ring-primary/15 border-primary shadow-md' : 'hover:shadow-md'}`
                } ${isLinkingSource ? 'ring-4 ring-amber-500/20 border-amber-500 animate-pulse' : ''} ${
                  isMatch ? 'ring-4 ring-amber-400 border-amber-400 shadow-md scale-105 z-10' : ''
                }`}
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
                    <div className="flex items-center justify-center flex-wrap gap-1 mb-1">
                      {node.icon && (
                        <span className={`${node.isRoot ? 'text-lg mb-0.5' : 'text-xs'}`}>
                          {node.icon}
                        </span>
                      )}
                      
                      {/* Attached legacy/external hyperlink badge */}
                      {node.linkUrl && (
                        <a 
                          href={node.linkUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-primary hover:opacity-80 p-0.5"
                          title="Open Link"
                        >
                          <IconExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* New multiple links indicator */}
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
                            <img src={getDomainFavicon(node.links[0])} alt="" className="w-3.5 h-3.5 rounded-sm" onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <IconExternalLink className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}

                      {/* Image attachments icon badge */}
                      {((node.images && node.images.length > 0) || node.imageUrl) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const imgs = node.images && node.images.length > 0 ? node.images : node.imageUrl ? [node.imageUrl] : [];
                            if (imgs.length > 0) {
                              setFullScreenImages(imgs);
                              setFullScreenImageIdx(0);
                            }
                          }}
                          className="text-blue-500 hover:text-blue-600 p-0.5 cursor-pointer flex items-center justify-center pointer-events-auto"
                          title="Open Image Gallery"
                        >
                          <IconPhoto className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* PDF attachments indicator */}
                      {node.pdfs && node.pdfs.length > 0 && (
                        <a
                          href={node.pdfs[0].base64}
                          download={node.pdfs[0].name}
                          onClick={e => e.stopPropagation()}
                          className="text-red-500 hover:text-red-600 p-0.5 cursor-pointer flex items-center justify-center font-bold text-[8px] border border-red-500/20 px-1 rounded bg-red-500/5 leading-none"
                          title={`Download ${node.pdfs[0].name}`}
                        >
                          PDF
                        </a>
                      )}

                      {/* Notes indicator badge */}
                      {node.notes && (
                        <IconBook className="w-3.5 h-3.5 text-text-muted" title="Has markdown notes" />
                      )}
                    </div>

                    {/* Apple-style Hover Overlay (Only if items are available) */}
                    {(node.notes || (node.links && node.links.length > 0) || (node.images && node.images.length > 0) || node.imageUrl) && (
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
                            className="w-6.5 h-6.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-text-secondary hover:text-amber-500 transition-colors cursor-pointer"
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
                            className="w-6.5 h-6.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-text-secondary hover:text-blue-500 transition-colors cursor-pointer"
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
                              const imgs = node.images && node.images.length > 0 ? node.images : node.imageUrl ? [node.imageUrl] : [];
                              if (imgs.length > 0) {
                                setFullScreenImages(imgs);
                                setFullScreenImageIdx(0);
                              }
                            }}
                            className="w-6.5 h-6.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-text-secondary hover:text-emerald-500 transition-colors cursor-pointer"
                            title="Open Image Gallery"
                          >
                            <IconPhoto className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
                    onMouseDown={e => {
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
                      zIndex: 20
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
              onChange={e => setCanvasSearchQuery(e.target.value)}
              className="bg-transparent border-none pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-0 text-text-primary placeholder:text-text-muted w-28 focus:w-44 transition-all duration-300 rounded-2xl"
            />
            {canvasSearchQuery && (
              <button
                type="button"
                onClick={() => setCanvasSearchQuery('')}
                className="absolute right-2 text-text-muted hover:text-text-primary text-[11px] font-bold"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Zoom and layout controls */}
        <div className="absolute bottom-6 left-6 bg-surface/90 border border-border/60 p-2.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur z-20">
          {/* Collapse/Expand Left List Panel */}
          <button 
            type="button"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary"
            title={isLeftSidebarOpen ? "Collapse Left Panel" : "Expand Left Panel"}
          >
            {isLeftSidebarOpen ? <IconChevronLeft className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
          </button>

          {/* Fullscreen Zen Mode Toggle */}
          <button 
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-r border-border/50 pr-2"
            title={isFullScreen ? "Exit Full Screen" : "Zen Full Screen Mode"}
          >
            {isFullScreen ? <IconMinimize className="w-4 h-4" /> : <IconMaximize className="w-4 h-4" />}
          </button>

          <button 
            type="button"
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
            type="button"
            onClick={() => setZoom(prev => Math.min(prev * 1.15, 2.5))}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-r border-border/50 pr-2"
            title="Zoom In"
          >
            <IconZoomIn className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={handleCenterCamera}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary"
            title="Center Canvas"
          >
            <IconFocusCentered className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={handleAutoArrange}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary border-r border-border/50 pr-2"
            title="Auto-Arrange Layout"
          >
            <IconLayout className="w-4 h-4" />
          </button>

          {/* Open All (Expand all branches) */}
          <button 
            type="button"
            onClick={handleOpenAll}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary"
            title="Expand All Branches"
          >
            <IconChevronDown className="w-4 h-4" />
          </button>

          {/* Close All (Collapse all branches) */}
          <button 
            type="button"
            onClick={handleCloseAll}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-secondary"
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-surface/90 border border-border/60 p-2 sm:p-2.5 rounded-2xl shadow-xl backdrop-blur-md max-w-[90vw] md:max-w-2xl w-fit z-20 overflow-visible">
          
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

          {/* Add child node */}
          <button
            onClick={handleAddChildNode}
            disabled={!selectedNodeId}
            className="flex items-center gap-1 font-bold text-[10px] rounded-lg px-3 py-1.5 bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <IconPlus className="w-3.5 h-3.5" /> Sub-topic
          </button>

          {/* Sibling node */}
          <button
            onClick={handleAddSiblingNode}
            disabled={!selectedNodeId || selectedNode?.isRoot}
            className="flex items-center gap-1 font-bold text-[10px] rounded-lg px-3 py-1.5 border border-border bg-surface hover:bg-surface-alt transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none text-text-secondary"
          >
            <IconPlus className="w-3.5 h-3.5 text-text-muted" /> Sibling
          </button>

          {/* Edit selected Node Trigger */}
          <button
            onClick={() => {
              if (selectedNode) handleStartEditNode(selectedNode);
            }}
            disabled={!selectedNodeId}
            className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-alt disabled:opacity-40"
            title="Edit Node Text"
          >
            <IconEdit className="w-4 h-4" />
          </button>

          {/* Notes Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            disabled={!selectedNodeId}
            className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${
              isDrawerOpen 
                ? 'bg-primary/15 text-primary' 
                : 'text-text-secondary hover:bg-surface-alt'
            }`}
            title="Open Advanced Notes & Media Panel"
          >
            <IconBook className="w-4 h-4" />
          </button>

          {/* Outline Style customizer */}
          <div className="flex gap-1 items-center bg-surface-alt border border-border/50 p-0.5 rounded-lg border-l border-r border-border/50 px-2">
            {['solid', 'dashed', 'dotted'].map((style) => (
              <button
                key={style}
                onClick={() => onUpdate({ edgeStyle: style as any })}
                className={`w-14 h-5 rounded flex items-center justify-center transition-all ${
                  (mindmap.edgeStyle || 'solid') === style ? 'bg-surface border border-border text-text-primary font-bold text-[9px] uppercase tracking-wider shadow-sm' : 'text-text-muted hover:text-text-primary font-medium text-[9px] uppercase tracking-wider'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Outline Export Dropdown */}
          <div className="relative group/export border-l border-border/50 pl-2 flex items-center">
            <button 
              className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-alt"
              title="Export Options"
            >
              <IconDownload className="w-4.5 h-4.5" />
            </button>
            
            {/* The invisible bridge that prevents hover gap issues */}
            <div className="absolute top-full right-0 pt-2 hidden group-hover/export:block z-30">
              <div className="bg-surface border border-border/55 rounded-xl shadow-lg p-1 min-w-[130px]">
                <button 
                  onClick={handleExportSvg}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Export SVG
                </button>
                <button 
                  onClick={handleExportOutline}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>

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

      {/* Slide-out Drawer Node Panel (Advanced Notes, Image URLs, Attachment Links) */}
      {isDrawerOpen && selectedNode && (
        <div className="w-[320px] bg-surface border-l border-border/50 flex flex-col relative z-20 shrink-0 h-full animate-fade-in shadow-xl text-left">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-text-primary">Advanced Panel</h3>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-border hover:bg-surface-alt text-text-secondary"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Title / Text Edit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Node Name</label>
              <input
                type="text"
                value={selectedNode.text}
                onChange={e => handleUpdateNodeProp('text', e.target.value)}
                className="w-full bg-surface-alt border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-text-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Node Color</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleChangeNodeColor(color.id)}
                    className={`h-8 rounded-lg border text-[10px] font-black transition-all ${color.bg} ${
                      (selectedNode.color || 'gray') === color.id
                        ? 'ring-2 ring-primary/30 scale-[1.02]'
                        : 'hover:scale-[1.02]'
                    }`}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>

            {/* long markdown notes */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Advanced Notes</label>
                <button
                  type="button"
                  onClick={() => {
                    setNotesModalNodeId(selectedNode.id);
                    setNotesActiveTab('view');
                    setIsNotesModalOpen(true);
                  }}
                  className="text-[9px] font-extrabold text-amber-500 hover:text-amber-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <IconBook className="w-3 h-3" /> Reader View
                </button>
              </div>
              <textarea
                value={selectedNode.notes || ''}
                onChange={e => handleUpdateNodeProp('notes', e.target.value)}
                placeholder="Write long outline notes, logs, or details here..."
                rows={7}
                className="w-full bg-surface-alt border border-border/60 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary text-text-primary resize-y"
              />
            </div>

            {/* Multiple Links Manager */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Web Links</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLinkUrl}
                  onChange={e => setNewLinkUrl(e.target.value)}
                  placeholder="Paste URL (e.g. google.com)"
                  className="flex-1 bg-surface-alt border border-border/60 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary text-text-primary"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddLink(); }}
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-alt transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Links list */}
              {selectedNode.links && selectedNode.links.length > 0 && (
                <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
                  {selectedNode.links.map(url => (
                    <div key={url} className="group flex items-center justify-between p-2.5 bg-surface border border-border/40 hover:bg-stone-50 dark:hover:bg-stone-900/40 rounded-2xl shadow-sm transition-all duration-150 relative">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-text-secondary hover:text-text-primary text-xs truncate max-w-[82%] font-medium"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-500/5 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                          {getDomainFavicon(url) ? (
                            <img src={getDomainFavicon(url)} alt="" className="w-4.5 h-4.5 rounded-md" onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <IconLink className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col truncate leading-tight">
                          <span className="truncate text-text-primary font-bold text-xs">{getDomainName(url)}</span>
                          <span className="truncate text-text-muted text-[10px] mt-0.5">{url}</span>
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(url)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-text-muted transition-all cursor-pointer shrink-0"
                        title="Delete Link"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Multiple Images Manager */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Image Attachments</label>
              <div className="relative border border-dashed border-border/80 rounded-xl p-3 bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Upload Images</span>
                <span className="text-[8px] text-text-muted mt-0.5">Supports PNG, JPG, WebP</span>
              </div>

              {/* Thumbnails grid */}
              {selectedNode.images && selectedNode.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {selectedNode.images.map((base64, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-surface shadow-sm">
                      <img
                        src={base64}
                        alt=""
                        className="w-full h-full object-cover cursor-zoom-in"
                        onClick={() => { setFullScreenImages(selectedNode.images || null); setFullScreenImageIdx(idx); }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 hover:bg-red-600 rounded-full text-white text-[10px] flex items-center justify-center transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Attachments Manager */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">PDF Attachments</label>
              <div className="relative border border-dashed border-border/80 rounded-xl p-3 bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Upload PDFs</span>
                <span className="text-[8px] text-text-muted mt-0.5">Attach documents & readings</span>
              </div>

              {/* PDFs List */}
              {selectedNode.pdfs && selectedNode.pdfs.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                  {selectedNode.pdfs.map((pdf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-surface-alt/50 border border-border/40 rounded-xl">
                      <a
                        href={pdf.base64}
                        download={pdf.name}
                        className="flex items-center gap-1.5 text-text-secondary hover:text-primary text-xs truncate max-w-[180px] font-medium"
                        title="Click to Download PDF"
                      >
                        <span className="bg-red-500/10 text-red-500 px-1 py-0.5 text-[8px] font-black rounded uppercase">PDF</span>
                        <span className="truncate">{pdf.name}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemovePdf(idx)}
                        className="text-text-muted hover:text-red-500 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Full Screen Image Preview Modal (Apple-style UI/UX) */}
      <AnimatePresence>
        {fullScreenImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-between p-6 select-none"
            onClick={() => setFullScreenImages(null)}
          >
            {/* Header controls */}
            <div className="w-full flex items-center justify-between max-w-5xl z-10">
              <span className="text-xs font-mono font-bold tracking-widest text-gray-400">
                IMAGE {fullScreenImageIdx + 1} OF {fullScreenImages.length}
              </span>
              <div className="flex gap-4 items-center">
                <a
                  href={fullScreenImages[fullScreenImageIdx]}
                  download={`image-${fullScreenImageIdx + 1}.png`}
                  onClick={e => e.stopPropagation()}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-full text-xs font-bold transition-colors uppercase tracking-wider"
                >
                  Download
                </a>
                <button
                  onClick={() => setFullScreenImages(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center font-bold text-lg transition-colors"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Image display */}
            <div 
              className="flex-1 w-full flex items-center justify-center max-w-5xl relative"
              onClick={e => e.stopPropagation()}
            >
              {fullScreenImages.length > 1 && (
                <button
                  onClick={() => setFullScreenImageIdx(prev => (prev === 0 ? fullScreenImages.length - 1 : prev - 1))}
                  className="absolute left-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 active:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/15 text-lg font-bold"
                >
                  &#8592;
                </button>
              )}

              <motion.img
                key={fullScreenImageIdx}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={fullScreenImages[fullScreenImageIdx]}
                alt="Fullscreen Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl pointer-events-auto"
              />

              {fullScreenImages.length > 1 && (
                <button
                  onClick={() => setFullScreenImageIdx(prev => (prev === fullScreenImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 active:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/15 text-lg font-bold"
                >
                  &#8594;
                </button>
              )}
            </div>

            {/* Footer hints */}
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider z-10">
              Click outside or press Close to exit
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apple Notes Style Modal */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setNotesModalNodeId(null);
        }}
        title={notesModalNode ? `Notes: ${notesModalNode.text}` : "Advanced Notes"}
      >
        {notesModalNode && (
          <div className="flex flex-col h-[480px]">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4 shrink-0">
              <div className="text-left">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Apple-Style Outliner</span>
              </div>
              
              {/* Tab Toggles: View vs Edit */}
              <div className="flex bg-surface-alt p-1 rounded-xl border border-border/50 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setNotesActiveTab('view')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    notesActiveTab === 'view'
                      ? 'bg-surface text-amber-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Reader
                </button>
                <button
                  type="button"
                  onClick={() => setNotesActiveTab('edit')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    notesActiveTab === 'edit'
                      ? 'bg-surface text-amber-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Edit Note
                </button>
              </div>
            </div>

            {/* Note Area */}
            <div 
              className={`flex-1 overflow-y-auto rounded-2xl border border-border/30 p-5 text-left transition-all ${
                notesActiveTab === 'view'
                  ? 'bg-[#fcfaf2] dark:bg-[#1c1a17] text-stone-850 dark:text-stone-200 border-amber-900/10'
                  : 'bg-surface-alt/65 text-text-primary'
              }`}
              style={{
                fontFamily: notesActiveTab === 'view' ? 'Georgia, Cambria, serif' : 'inherit'
              }}
            >
              {notesActiveTab === 'view' ? (
                <div className="prose max-w-none dark:prose-invert">
                  {notesModalNode.notes && notesModalNode.notes.trim() ? (
                    renderMarkdown(notesModalNode.notes)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-stone-400 dark:text-stone-500 gap-2">
                      <IconBook className="w-8 h-8 opacity-40" />
                      <p className="text-xs italic font-semibold">No notes written yet. Switch to "Edit Note" to write.</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={notesModalNode.notes || ''}
                  onChange={(e) => {
                    onUpdate({
                      nodes: mindmap.nodes.map(n => n.id === notesModalNode.id ? { ...n, notes: e.target.value } : n)
                    });
                  }}
                  placeholder="Write outlines, details, paste ChatGPT tables or markdown here..."
                  className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-[11px] leading-relaxed focus:ring-0 text-text-primary"
                  autoFocus
                />
              )}
            </div>

            {/* Footer status bar */}
            <div className="mt-3 text-right">
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">
                {notesModalNode.notes ? `${notesModalNode.notes.length} characters` : 'Empty note'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
