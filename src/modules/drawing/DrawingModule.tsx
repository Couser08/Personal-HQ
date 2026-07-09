import { useState, useMemo, useEffect, useRef } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconPlus, IconTrash, IconFolder, IconFileText,
  IconMaximize, IconMinimize, IconChevronDown, IconChevronUp,
  IconChevronLeft, IconChevronRight
} from '@tabler/icons-react';
import "@excalidraw/excalidraw/index.css";

const sanitizeElements = (elements: readonly any[]) => {
  if (!Array.isArray(elements)) return [];
  return elements.map(el => {
    if (el && el.type === 'arrow') {
      return {
        ...el,
        endArrowhead: el.endArrowhead || 'arrow',
        startArrowhead: el.startArrowhead || null,
      };
    }
    return el;
  });
};

export default function DrawingModule() {
  const { theme, setDrawingData, notes, addNote, updateNote, deleteNote } = useAppStore(useShallow(state => ({
    theme: state.theme,
    setDrawingData: state.setDrawingData,
    notes: state.notes,
    addNote: state.addNote,
    updateNote: state.updateNote,
    deleteNote: state.deleteNote,
  })));

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const debounceTimer = useRef<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Resolve theme to 'dark' or 'light' supporting 'system' preference
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      media.addEventListener('change', listener);
      setResolvedTheme(media.matches ? 'dark' : 'light');
      return () => media.removeEventListener('change', listener);
    } else {
      setResolvedTheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  const [activeSketchId, setActiveSketchId] = useState<string>(() => {
    const lastActive = localStorage.getItem('phq_active_sketch_id');
    return lastActive || 'default';
  });

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [isoGrid, setIsoGrid] = useState(false);
  const [isDrawFilesCollapsed, setIsDrawFilesCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const canvasBackground = resolvedTheme === 'dark' ? '#121214' : '#ffffff';
  const panelBackground = resolvedTheme === 'dark' ? 'rgba(17, 17, 19, 0.92)' : 'rgba(255, 255, 255, 0.92)';

  const addStickyNote = (color: string) => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    
    const zoom = appState.zoom.value || 1;
    const centerX = -appState.scrollX + (window.innerWidth / 2) / zoom;
    const centerY = -appState.scrollY + (window.innerHeight / 2) / zoom;
    
    const rectId = crypto.randomUUID();
    const textId = crypto.randomUUID();
    
    const colors: Record<string, { bg: string; stroke: string }> = {
      yellow: { bg: '#fef08a', stroke: '#ca8a04' },
      blue: { bg: '#bfdbfe', stroke: '#2563eb' },
      pink: { bg: '#fbcfe8', stroke: '#db2777' },
      green: { bg: '#bbf7d0', stroke: '#16a34a' }
    };
    
    const themeColors = colors[color] || colors.yellow;
    
    const stickyRect = {
      id: rectId,
      type: 'rectangle',
      x: centerX - 80,
      y: centerY - 80,
      width: 160,
      height: 160,
      strokeColor: themeColors.stroke,
      backgroundColor: themeColors.bg,
      fillStyle: 'solid',
      strokeWidth: 1.5,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      locked: false,
      groupIds: [rectId],
    };

    const stickyText = {
      id: textId,
      type: 'text',
      x: centerX - 60,
      y: centerY - 30,
      width: 120,
      height: 60,
      strokeColor: '#1e293b',
      backgroundColor: 'transparent',
      fillStyle: 'hachure',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      locked: false,
      text: 'Sticky Note\n(double click to edit)',
      fontSize: 14,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      groupIds: [rectId],
    };

    excalidrawAPI.updateScene({
      elements: [...elements, stickyRect, stickyText]
    });
  };

  // Sync active sketch ID to local storage for quick reload defaults
  useEffect(() => {
    localStorage.setItem('phq_active_sketch_id', activeSketchId);
  }, [activeSketchId]);

  // Map notes containing the 'sketch' tag to sketch entries
  const sketches = useMemo(() => {
    const list = notes.filter(n => n.tags && n.tags.includes('sketch'));
    return list.map(n => {
      let elements: any[] = [];
      let appState: any = {};
      try {
        const parsed = JSON.parse(n.content);
        elements = sanitizeElements(parsed.elements || []);
        appState = parsed.appState || {};
      } catch (e) {}
      return {
        id: n.id,
        title: n.title,
        elements,
        appState,
        createdAt: new Date(n.createdAt).toLocaleDateString(),
      };
    });
  }, [notes]);

  // Seed default drawing sketch note if list is loaded but no sketches exist
  useEffect(() => {
    const list = notes.filter(n => n.tags && n.tags.includes('sketch'));
    if (list.length === 0) {
      addNote({
        id: 'default',
        title: 'First Sketch',
        content: JSON.stringify({ elements: [], appState: {} }),
        pinned: false,

        tags: ['sketch'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [notes, addNote]);

  // Load the current active sketch elements
  const activeSketch = useMemo(() => {
    const found = sketches.find(s => s.id === activeSketchId) || sketches[0];
    return found;
  }, [sketches, activeSketchId]);

  // Prepare initialData for the current active sketch (used only on remount)
  const initialData = useMemo(() => {
    if (activeSketch) {
      const cleanApp = { ...(activeSketch.appState || {}) };
      delete cleanApp.collaborators;
      cleanApp.theme = resolvedTheme;
      cleanApp.viewBackgroundColor = isoGrid ? 'transparent' : (resolvedTheme === 'dark' ? '#121214' : '#ffffff');
      cleanApp.gridModeEnabled = isoGrid;
      return { elements: activeSketch.elements, appState: cleanApp };
    }
    return { elements: [], appState: {} };
  }, [activeSketch, resolvedTheme, isoGrid]);

  // Sync canvas theme changes dynamically
  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        appState: { 
          theme: resolvedTheme,
          viewBackgroundColor: isoGrid ? 'transparent' : (resolvedTheme === 'dark' ? '#121214' : '#ffffff'),
          gridModeEnabled: isoGrid,
        }
      });
    }
  }, [excalidrawAPI, resolvedTheme, isoGrid]);

  const handleCreateNewSketch = () => {
    const id = crypto.randomUUID();
    addNote({
      id,
      title: `Sketch ${sketches.length + 1}`,
      content: JSON.stringify({ elements: [], appState: {} }),
      pinned: false,

      tags: ['sketch'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveSketchId(id);
  };

  const handleDeleteSketch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sketches.length <= 1) return;

    deleteNote(id);
    if (activeSketchId === id) {
      const remaining = sketches.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setActiveSketchId(remaining[0].id);
      }
    }
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameId(id);
    setRenameTitle(currentTitle);
  };

  const finishRename = () => {
    if (renameTitle.trim() && renameId) {
      updateNote(renameId, { title: renameTitle.trim() });
    }
    setRenameId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-[calc(100vh-140px)] flex gap-4 p-2 relative"
      style={{ background: 'var(--bg-background)' }}
    >
      {/* Scope premium glass CSS overrides for Excalidraw controls */}
      <style>{`
        .excalidraw {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          --color-primary: #f43f5e !important;
          --color-primary-darker: #e11d48 !important;
          --color-primary-light: rgba(244, 63, 94, 0.1) !important;
          --border-radius-lg: 20px !important;
          --border-radius-md: 14px !important;
          --border-radius-sm: 8px !important;
          background-color: ${canvasBackground} !important;
        }
        .excalidraw .excalidraw-container {
          background-color: ${canvasBackground} !important;
        }
        .excalidraw .layer-ui__wrapper,
        .excalidraw .App-menu__left,
        .excalidraw .App-menu__right,
        .excalidraw .Island--has-radius,
        .excalidraw .layer-ui__wrapper__top-right {
          background-color: transparent !important;
        }
        .excalidraw .Island, 
        .excalidraw .context-menu, 
        .excalidraw .dropdown-menu {
          background-color: ${panelBackground} !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
          border: 1px solid ${resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(24, 24, 27, 0.08)'} !important;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, ${resolvedTheme === 'dark' ? '0.6' : '0.1'}) !important;
        }
        .excalidraw .ToolIcon__keybutton,
        .excalidraw .buttonList button,
        .excalidraw .dropdown-menu-item {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .excalidraw .ToolIcon__keybutton:hover,
        .excalidraw .buttonList button:hover {
          transform: translateY(-1px) scale(1.03) !important;
        }
        .excalidraw .ToolIcon__keybutton:active,
        .excalidraw .buttonList button:active {
          transform: scale(0.96) !important;
        }
        .iso-grid-active .excalidraw,
        .iso-grid-active .excalidraw .excalidraw-container,
        .iso-grid-active .excalidraw .InteractiveCanvas,
        .iso-grid-active .excalidraw .excalidraw-container canvas {
          background: transparent !important;
        }
        .iso-grid-active {
          background-color: ${canvasBackground} !important;
          background-image: 
            linear-gradient(30deg, ${resolvedTheme === 'dark' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.08)'} 1px, transparent 1px),
            linear-gradient(150deg, ${resolvedTheme === 'dark' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.08)'} 1px, transparent 1px) !important;
          background-size: 30px 51.96px !important;
        }
      `}</style>

      {/* ── Left Sidebar (Sketch Library & DB Status) ── */}
      {!isSidebarCollapsed && (
        <div className="w-[250px] h-full flex flex-col gap-4 p-4.5 rounded-3xl border border-border/50 bg-surface/40 backdrop-blur-md shadow-sm shrink-0 text-left overflow-y-auto custom-scrollbar">
          {/* Slot Library Header */}
          <div 
            onClick={() => setIsDrawFilesCollapsed(!isDrawFilesCollapsed)}
            className="flex items-center justify-between pb-2 border-b border-border/40 cursor-pointer select-none group"
          >
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Sketchbook</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-text-secondary">Manage draw files</span>
                {isDrawFilesCollapsed ? (
                  <IconChevronDown size={11} className="text-text-muted" />
                ) : (
                  <IconChevronUp size={11} className="text-text-muted" />
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateNewSketch();
              }}
              className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/10"
              title="Create New Canvas"
            >
              <IconPlus size={15} />
            </button>
          </div>

          {/* List of Save Slots */}
          {!isDrawFilesCollapsed && (
            <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto custom-scrollbar">
            {sketches.map((sk) => {
              const active = sk.id === activeSketchId;
              const isRenaming = renameId === sk.id;

              return (
                <div
                  key={sk.id}
                  onClick={() => setActiveSketchId(sk.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    active 
                      ? 'bg-surface border-border shadow-sm text-primary' 
                      : 'bg-transparent border-transparent hover:bg-surface-alt/45 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <IconFileText size={15} className={active ? 'text-primary' : 'text-text-muted'} />
                    {isRenaming ? (
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                        className="bg-transparent border-none outline-none font-semibold text-xs text-text-primary flex-1 py-0 min-w-0"
                        autoFocus
                      />
                    ) : (
                      <span 
                        onDoubleClick={(e) => startRename(sk.id, sk.title, e)}
                        className="text-xs font-bold truncate leading-none"
                      >
                        {sk.title}
                      </span>
                    )}
                  </div>

                  {!isRenaming && sketches.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSketch(sk.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                    >
                      <IconTrash size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

          {/* Fullscreen Mode snap option */}
          <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fullscreen Mode</span>
              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
              >
                {isFullScreen ? <IconMinimize size={10} /> : <IconMaximize size={10} />}
                <span>{isFullScreen ? "Minimize" : "Maximize"}</span>
              </button>
            </div>
            <span className="text-[9px] text-text-secondary leading-normal">
              Expands the canvas to fill the entire screen for distraction-free sketching.
            </span>
          </div>

          {/* Isometric grid snap toggle options */}
          <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Isometric Grid</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isoGrid} 
                  onChange={(e) => setIsoGrid(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <span className="text-[9px] text-text-secondary leading-normal">
              Snaps lines to 30-degree angles for technical drawing.
            </span>
          </div>

          {/* Canvas Element Grounding */}
          <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Ground Elements</span>
              <IconFolder size={14} className="text-text-muted" />
            </div>
            <p className="text-[9px] text-text-secondary leading-normal">
              Ground elements to lock them. They won't interfere with background canvas selection.
            </p>
            <div className="flex flex-col gap-1.5 mt-1">
              <button
                onClick={() => {
                  if (!excalidrawAPI) return;
                  const elements = excalidrawAPI.getSceneElements();
                  const appState = excalidrawAPI.getAppState();
                  const selectedIds = appState.selectedElementIds || {};
                  const updated = elements.map((el: any) => {
                    if (selectedIds[el.id]) {
                      return { ...el, locked: true };
                    }
                    return el;
                  });
                  excalidrawAPI.updateScene({ elements: updated });
                }}
                disabled={!excalidrawAPI}
                className="w-full py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-55 cursor-pointer text-center"
              >
                Ground Selected
              </button>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    if (!excalidrawAPI) return;
                    const elements = excalidrawAPI.getSceneElements();
                    const updated = elements.map((el: any) => ({ ...el, locked: true }));
                    excalidrawAPI.updateScene({ elements: updated });
                  }}
                  disabled={!excalidrawAPI}
                  className="flex-1 py-1 rounded-lg bg-surface-alt hover:bg-surface-hover text-text-primary border border-border text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-55 cursor-pointer text-center"
                >
                  Ground All
                </button>
                <button
                  onClick={() => {
                    if (!excalidrawAPI) return;
                    const elements = excalidrawAPI.getSceneElements();
                    const updated = elements.map((el: any) => ({ ...el, locked: false }));
                    excalidrawAPI.updateScene({ elements: updated });
                  }}
                  disabled={!excalidrawAPI}
                  className="flex-1 py-1 rounded-lg bg-surface-alt hover:bg-surface-hover text-text-primary border border-border text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-55 cursor-pointer text-center"
                >
                  Unground All
                </button>
              </div>
            </div>
          </div>

          {/* Element Grouping */}
          <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Element Grouping</span>
              <span className="text-[9px] text-text-muted font-bold font-mono">Ctrl+G / Shift+G</span>
            </div>
            <p className="text-[9px] text-text-secondary leading-normal">
              Select multiple elements to group them together for joint transformation and scaling.
            </p>
            <div className="flex gap-1.5 mt-1">
              <button
                onClick={() => {
                  if (!excalidrawAPI) return;
                  const elements = excalidrawAPI.getSceneElements();
                  const appState = excalidrawAPI.getAppState();
                  const selectedIds = appState.selectedElementIds || {};
                  
                  const groupId = crypto.randomUUID();
                  const updated = elements.map((el: any) => {
                    if (selectedIds[el.id]) {
                      const groupIds = el.groupIds || [];
                      return { ...el, groupIds: [...groupIds, groupId] };
                    }
                    return el;
                  });
                  excalidrawAPI.updateScene({ elements: updated });
                }}
                disabled={!excalidrawAPI}
                className="flex-1 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-55 cursor-pointer text-center"
              >
                Group
              </button>
              <button
                onClick={() => {
                  if (!excalidrawAPI) return;
                  const elements = excalidrawAPI.getSceneElements();
                  const appState = excalidrawAPI.getAppState();
                  const selectedIds = appState.selectedElementIds || {};
                  
                  const updated = elements.map((el: any) => {
                    if (selectedIds[el.id] && el.groupIds && el.groupIds.length > 0) {
                      return { ...el, groupIds: el.groupIds.slice(0, -1) };
                    }
                    return el;
                  });
                  excalidrawAPI.updateScene({ elements: updated });
                }}
                disabled={!excalidrawAPI}
                className="flex-1 py-1 rounded-lg bg-surface-alt hover:bg-surface-hover text-text-primary border border-border text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-55 cursor-pointer text-center"
              >
                Ungroup
              </button>
            </div>
          </div>

          {/* Sticky Notes */}
          <div className="p-3 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sticky Notes</span>
            <p className="text-[9px] text-text-secondary leading-normal">
              Quickly drop a colored, grouped post-it note at the center of your screen viewport.
            </p>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              <button
                onClick={() => addStickyNote('yellow')}
                disabled={!excalidrawAPI}
                className="h-6 rounded-md bg-[#fef08a] border border-[#ca8a04]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Add Yellow Sticky Note"
              />
              <button
                onClick={() => addStickyNote('blue')}
                disabled={!excalidrawAPI}
                className="h-6 rounded-md bg-[#bfdbfe] border border-[#2563eb]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Add Blue Sticky Note"
              />
              <button
                onClick={() => addStickyNote('pink')}
                disabled={!excalidrawAPI}
                className="h-6 rounded-md bg-[#fbcfe8] border border-[#db2777]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Add Pink Sticky Note"
              />
              <button
                onClick={() => addStickyNote('green')}
                disabled={!excalidrawAPI}
                className="h-6 rounded-md bg-[#bbf7d0] border border-[#16a34a]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Add Green Sticky Note"
              />
            </div>
          </div>

          {/* Sidebar Info Banner */}
          <div className="mt-auto p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <IconFolder size={14} className="text-text-muted" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Cloud Storage</span>
            </div>
            <div className="text-[11px] font-semibold text-text-secondary flex flex-col gap-1 mt-0.5">
              <div className="flex justify-between">
                <span>Saved Slots:</span>
                <span className="font-mono text-text-primary">{sketches.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Supabase Sync:</span>
                <span className="text-emerald-500 font-extrabold uppercase text-[9px] tracking-wider">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Canvas Viewport Area ── */}
      <div 
        key={activeSketchId} 
        className={`relative bg-surface overflow-hidden ${
          isFullScreen 
            ? 'fixed inset-0 z-[500] w-screen h-screen rounded-none border-none shadow-none' 
            : 'flex-grow h-full rounded-[32px] border border-border/50 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]'
        } ${isoGrid ? 'iso-grid-active' : ''}`}
      >
        {/* Floating Sidebar toggle button */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-3.5 left-4 z-[99999] p-2.5 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          title={isSidebarCollapsed ? "Show Sketch Library" : "Hide Sketch Library"}
        >
          {isSidebarCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </button>

        {/* Floating Fullscreen toggle button */}
        <button
          type="button"
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="absolute top-3.5 right-16 z-[99999] p-2.5 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
        >
          {isFullScreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
        </button>

        <Excalidraw
          theme={resolvedTheme}
          initialData={{
            ...initialData,
            appState: {
              ...initialData.appState,
              viewBackgroundColor: isoGrid ? 'transparent' : canvasBackground,
              gridModeEnabled: isoGrid,
            }
          }}
          excalidrawAPI={setExcalidrawAPI}
          onChange={(elements, appState) => {
            if (debounceTimer.current) {
              clearTimeout(debounceTimer.current);
            }
            
            debounceTimer.current = setTimeout(() => {
              const cleanApp: any = { ...appState };
              delete cleanApp.collaborators;
              
              if (activeSketch) {
                updateNote(activeSketch.id, {
                  content: JSON.stringify({ elements: sanitizeElements(elements), appState: cleanApp })
                }, true);
                setDrawingData(elements as any[], cleanApp);
              }
            }, 500);
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.Separator />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Hints.HelpHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.Heading>
                Personal HQ Whiteboard
              </WelcomeScreen.Center.Heading>
              <WelcomeScreen.Center.Menu>
                <WelcomeScreen.Center.MenuItemLoadScene />
                <WelcomeScreen.Center.MenuItemHelp />
              </WelcomeScreen.Center.Menu>
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
      </div>
    </motion.div>
  );
}
