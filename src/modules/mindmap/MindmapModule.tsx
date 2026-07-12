import { useState, useRef, useEffect, useMemo } from 'react';
import {
  IconPlus,
  IconArrowLeft,
  IconHistory,
  IconDownload,
  IconShare,
  IconCloudCheck,
  IconSitemap,
  IconArrowBackUp,
  IconArrowForwardUp,
} from '@tabler/icons-react';
import { useAppStore, type Mindmap, type MindmapNode, type MindmapLink } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '../../components/ui/EmptyState';
import { MindmapSidebar } from './components/MindmapSidebar';
import { MindmapCanvas } from './components/MindmapCanvas';
import { sanitizeMindmapNodes } from './utils/mindmapUtils';

export default function MindmapModule() {
  const { mindmaps, addMindmap, updateMindmap, deleteMindmap, showConfirm } = useAppStore(
    useShallow((state) => ({
      mindmaps: state.mindmaps,
      addMindmap: state.addMindmap,
      updateMindmap: state.updateMindmap,
      deleteMindmap: state.deleteMindmap,
      showConfirm: state.showConfirm,
    })),
  );

  const [activeMindmapId, setActiveMindmapId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  // New layout states
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

        const jsonToMindmapNodes = (
          value: any,
          label: string,
          parentId: string | null,
          nodes: any[],
          links: any[],
          depth: number = 0,
          _index: number = 0,
        ): string => {
          const id = `n-${nodes.length}-${Date.now()}`;
          const COLORS = ['blue', 'purple', 'teal', 'orange', 'pink', 'indigo', 'emerald', 'rose', 'amber'];
          const color = depth === 0 ? 'blue' : COLORS[(depth - 1) % COLORS.length];

          let displayText = label;
          if (value === null || value === undefined) displayText = `${label}: null`;
          else if (typeof value === 'boolean') displayText = `${label}: ${value}`;
          else if (typeof value === 'number') displayText = `${label}: ${value}`;
          else if (typeof value === 'string') {
            const safeVal = value.length > 40 ? value.slice(0, 40) + '…' : value;
            displayText = `${label}: ${safeVal}`;
          }

          const LEVEL_SPACING_X = 200;
          const LEVEL_SPACING_Y = 70;
          const nodeX = 120 + depth * LEVEL_SPACING_X;
          const nodeY = 80 + nodes.length * LEVEL_SPACING_Y;

          nodes.push({
            id,
            text: displayText,
            x: nodeX,
            y: nodeY,
            color,
            isRoot: depth === 0 && parentId === null,
            parentId: parentId ?? undefined,
            collapsed: depth >= 3,
          });

          if (parentId) {
            links.push({ source: parentId, target: id });
          }

          if (Array.isArray(value)) {
            value.slice(0, 20).forEach((item, i) => {
              const childLabel = `[${i}]`;
              jsonToMindmapNodes(item, childLabel, id, nodes, links, depth + 1, i);
            });
            if (value.length > 20) {
              const overflowId = `n-overflow-${nodes.length}`;
              nodes.push({
                id: overflowId,
                text: `… +${value.length - 20} more`,
                x: nodeX + LEVEL_SPACING_X,
                y: nodeY + LEVEL_SPACING_Y,
                color: 'gray',
                isRoot: false,
                parentId: id,
              });
              links.push({ source: id, target: overflowId });
            }
          } else if (typeof value === 'object' && value !== null) {
            const keys = Object.keys(value).slice(0, 20);
            keys.forEach((key, i) => {
              jsonToMindmapNodes(value[key], key, id, nodes, links, depth + 1, i);
            });
            if (Object.keys(value).length > 20) {
              const overflowId = `n-overflow-${nodes.length}`;
              nodes.push({
                id: overflowId,
                text: `… +${Object.keys(value).length - 20} more keys`,
                x: nodeX + LEVEL_SPACING_X,
                y: nodeY + LEVEL_SPACING_Y,
                color: 'gray',
                isRoot: false,
                parentId: id,
              });
              links.push({ source: id, target: overflowId });
            }
          }

          return id;
        };

        const parseSingleMap = (obj: any): any | null => {
          if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

          let nodes = obj.nodes || obj.elements || obj.vertices;
          if (!Array.isArray(nodes)) return null;

          const formattedNodes = nodes.map((node: any, index: number) => {
            const id = node.id || node.key || node.uuid || `node-${index}`;
            const text = node.text || node.label || node.title || node.name || 'Unnamed Node';
            return {
              id: id.toString(),
              text: text.toString(),
              x: typeof node.x === 'number' ? node.x : 450 + index * 20,
              y: typeof node.y === 'number' ? node.y : 250 + index * 20,
              color: node.color || 'gray',
              isRoot: node.isRoot || (index === 0 && !node.parentId),
              parentId: node.parentId ? node.parentId.toString() : undefined,
              side: node.side || undefined,
              collapsed: !!node.collapsed,
              notes: node.notes || undefined,
              links: Array.isArray(node.links) ? node.links : undefined,
              images: Array.isArray(node.images) ? node.images : undefined,
              pdfs: Array.isArray(node.pdfs) ? node.pdfs : undefined,
            };
          });

          let links = obj.links || obj.edges || obj.connections || [];
          if (!Array.isArray(links)) links = [];

          const formattedLinks = links
            .map((link: any) => {
              const source = link.source || link.from || link.start;
              const target = link.target || link.to || link.end;
              return { source: source ? source.toString() : '', target: target ? target.toString() : '' };
            })
            .filter((l: any) => l.source && l.target);

          if (formattedLinks.length === 0) {
            formattedNodes.forEach((node) => {
              if (node.parentId && !node.isRoot) {
                formattedLinks.push({ source: node.parentId, target: node.id });
              }
            });
          }

          const targets = new Set(formattedLinks.map((l: any) => l.target));
          const actualRoots = formattedNodes.filter((n: any) => !n.parentId && !targets.has(n.id));

          if (actualRoots.length > 1 || (actualRoots.length === 0 && formattedNodes.length > 0)) {
            const masterRootId = `n-root-${Date.now()}`;
            const masterTitle =
              obj.title ||
              obj.name ||
              (typeof file !== 'undefined' ? file.name.replace(/\.json$/i, '') : 'Imported Mindmap');

            formattedNodes.forEach((n: any) => {
              n.isRoot = false;
            });

            formattedNodes.unshift({
              id: masterRootId,
              text: masterTitle,
              x: 450,
              y: 250,
              color: 'gray',
              isRoot: true,
              parentId: undefined,
              side: undefined,
              collapsed: false,
              notes: undefined,
              links: undefined,
              images: undefined,
              pdfs: undefined,
            });

            actualRoots.forEach((r: any, i: number) => {
              r.parentId = masterRootId;
              r.x = 450 + (i % 2 === 0 ? 200 : -200);
              r.y = 350 + i * 80;
              formattedLinks.push({ source: masterRootId, target: r.id });
            });
          }

          return {
            title: obj.title || obj.name || 'Imported Mindmap',
            nodes: formattedNodes,
            links: formattedLinks,
            edgeStyle: obj.edgeStyle || 'solid',
          };
        };

        if (data && data.mindmaps && Array.isArray(data.mindmaps)) {
          data.mindmaps.forEach((item: any) => {
            const parsed = parseSingleMap(item);
            if (parsed) importedMaps.push(parsed);
          });
        } else if (Array.isArray(data) && data.length > 0 && data[0]?.nodes) {
          data.forEach((item: any) => {
            const parsed = parseSingleMap(item);
            if (parsed) importedMaps.push(parsed);
          });
        } else if (data?.nodes && Array.isArray(data.nodes)) {
          const parsed = parseSingleMap(data);
          if (parsed) importedMaps.push(parsed);
        } else {
          const nodes: any[] = [];
          const links: any[] = [];
          const rootLabel = file.name.replace(/\.json$/i, '') || 'Imported JSON';
          jsonToMindmapNodes(data, rootLabel, null, nodes, links, 0, 0);
          if (nodes.length > 0) {
            importedMaps.push({
              title: rootLabel,
              nodes,
              links,
              edgeStyle: 'solid',
            });
          }
        }

        if (importedMaps.length > 0) {
          let lastId = '';
          for (const map of importedMaps) {
            const newId = crypto.randomUUID();
            await addMindmap({
              ...map,
              id: newId,
              createdAt: new Date().toISOString(),
            });
            lastId = newId;
          }
          if (lastId) {
            setActiveMindmapId(lastId);
          }
        } else {
          alert('Could not parse JSON file. Please check the file format.');
        }
      } catch (err) {
        alert('Invalid JSON format. Please check the file and try again.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeMindmap = useMemo(() => {
    return mindmaps.find((m) => m.id === activeMindmapId) || null;
  }, [mindmaps, activeMindmapId]);

  useEffect(() => {
    const pending = localStorage.getItem('pendingMindmapId');
    if (pending && mindmaps.some((m) => m.id === pending)) {
      setActiveMindmapId(pending);
      localStorage.removeItem('pendingMindmapId');
    } else if (mindmaps.length > 0 && !activeMindmapId) {
      setActiveMindmapId(mindmaps[0].id);
    }
  }, [mindmaps, activeMindmapId]);

  const handleCreateMindmap = (customTitle?: string) => {
    const newId = crypto.randomUUID();

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
      { id: 'tl4', text: 'Mind Maps', x: 650, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '🗺️' },
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
      { source: 'tools', target: 'tl4' },
    ];

    const newMap: Mindmap = {
      id: newId,
      title: customTitle || (mindmaps.length === 0 ? 'Productivity Mind Map' : 'New Mindmap'),
      nodes: initialNodes,
      links: initialLinks,
      createdAt: new Date().toISOString(),
    };

    addMindmap(newMap);
    setActiveMindmapId(newId);
  };

  const handleResetToDefault = () => {
    if (!activeMindmap) return;
    showConfirm('Reset Mindmap', 'Reset all nodes & connections to default Outline?', () => {
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
        { id: 'tl4', text: 'Mind Maps', x: 650, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '🗺️' },
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
        { source: 'tools', target: 'tl4' },
      ];

      updateMindmap(activeMindmap.id, {
        nodes: initialNodes,
        links: initialLinks,
      });
    });
  };



  const handleOpenRename = () => {
    if (activeMindmap) {
      setTitleInput(activeMindmap.title);
      setIsRenameModalOpen(true);
    }
  };

  const filteredMindmaps = useMemo(() => {
    return mindmaps.filter((m) => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (selectedTagFilter) {
        const tagQuery = selectedTagFilter.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(tagQuery);
        const matchNodes = m.nodes.some((n) => n.text.toLowerCase().includes(tagQuery));
        return matchTitle || matchNodes;
      }
      return true;
    });
  }, [mindmaps, search, selectedTagFilter]);

  return (
    <div
      className={`flex gap-0 overflow-hidden bg-background text-text-primary transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-0 w-screen h-screen z-[150] rounded-none border-none'
          : 'h-[calc(100vh-130px)] rounded-[32px] border border-border/60'
      }`}
    >
      <MindmapSidebar
        filteredMindmaps={filteredMindmaps}
        search={search}
        setSearch={setSearch}
        selectedTagFilter={selectedTagFilter}
        setSelectedTagFilter={setSelectedTagFilter}
        activeMindmapId={activeMindmapId}
        setActiveMindmapId={setActiveMindmapId}
        handleCreateMindmap={handleCreateMindmap}
        handleOpenRename={handleOpenRename}
        deleteMindmap={deleteMindmap}
        showConfirm={showConfirm}
        isLeftSidebarOpen={isLeftSidebarOpen}
      />

      <div
        className={`flex-1 h-full relative bg-surface-alt/25 overflow-hidden flex flex-col ${
          activeMindmap ? 'flex w-full' : 'hidden md:flex'
        }`}
      >
        {activeMindmap ? (
          <>
            <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between bg-surface/30 backdrop-blur-md relative z-20 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveMindmapId(null)}
                  className="w-8 h-8 rounded-lg border border-border/50 bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary border-none cursor-pointer"
                  title="Back to Catalog"
                >
                  <IconArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-left leading-none">
                  <h3 className="font-extrabold text-sm text-text-primary">{activeMindmap.title}</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">Edited just now</p>
                </div>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                <IconCloudCheck className="w-5 h-5 text-emerald-500 shrink-0" title="All changes saved to local space" />
                <button
                  onClick={handleResetToDefault}
                  className="w-8 h-8 rounded-lg border border-border/40 bg-surface text-text-muted hover:text-rose-500 flex items-center justify-center transition-colors shrink-0 border-none cursor-pointer"
                  title="Reset Mindmap data layout to default hierarchy"
                >
                  <IconHistory className="w-4 h-4" />
                </button>
                <div className="flex gap-0.5 border-l border-r border-border/50 px-2.5 shrink-0">
                  <button
                    className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted shrink-0 border-none bg-transparent cursor-pointer"
                    title="Undo"
                  >
                    <IconArrowBackUp className="w-4.5 h-4.5" />
                  </button>
                  <button
                    className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted shrink-0 border-none bg-transparent cursor-pointer"
                    title="Redo"
                  >
                    <IconArrowForwardUp className="w-4.5 h-4.5" />
                  </button>
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
                  className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 border-none"
                  onClick={() => alert('Sharing features are synced locally. Export JSON/SVG to backup.')}
                >
                  <IconShare className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>

            <MindmapCanvas
              mindmap={activeMindmap}
              onUpdate={(updatedData) => {
                let finalNodes = updatedData.nodes || activeMindmap.nodes;
                const finalLinks = updatedData.links || activeMindmap.links;

                if (updatedData.nodes || updatedData.links) {
                  finalNodes = sanitizeMindmapNodes(finalNodes, finalLinks);
                }

                updateMindmap(activeMindmap.id, {
                  ...updatedData,
                  nodes: finalNodes,
                });
              }}
              isLeftSidebarOpen={isLeftSidebarOpen}
              setIsLeftSidebarOpen={setIsLeftSidebarOpen}
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              isRenameModalOpen={isRenameModalOpen}
              setIsRenameModalOpen={setIsRenameModalOpen}
              titleInput={titleInput}
              setTitleInput={setTitleInput}
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
    </div>
  );
}
