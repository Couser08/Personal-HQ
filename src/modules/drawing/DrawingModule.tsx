import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { WhiteboardSidebar } from './WhiteboardSidebar';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import "@excalidraw/excalidraw/index.css";

const DEFAULT_SKETCH_ID = 'd3b07384-d113-4ec5-a55d-e0e22a76f2bc';

const sanitizeElements = (elements: readonly any[]) => {
  if (!Array.isArray(elements)) return [];
  return elements
    .filter(Boolean)
    .map(el => {
      if (el.type === 'arrow') {
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
    return lastActive || DEFAULT_SKETCH_ID;
  });

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [isoGrid, setIsoGrid] = useState(false);
  const [isDrawFilesCollapsed, setIsDrawFilesCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
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
        id: DEFAULT_SKETCH_ID,
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
      return { elements: (activeSketch.elements || []).filter(Boolean), appState: cleanApp };
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
      <WhiteboardSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isDrawFilesCollapsed={isDrawFilesCollapsed}
        setIsDrawFilesCollapsed={setIsDrawFilesCollapsed}
        sketches={sketches}
        activeSketchId={activeSketchId}
        setActiveSketchId={setActiveSketchId}
        renameId={renameId}
        renameTitle={renameTitle}
        setRenameTitle={setRenameTitle}
        finishRename={finishRename}
        startRename={startRename}
        handleDeleteSketch={handleDeleteSketch}
        handleCreateNewSketch={handleCreateNewSketch}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        isoGrid={isoGrid}
        setIsoGrid={setIsoGrid}
        excalidrawAPI={excalidrawAPI}
        addStickyNote={addStickyNote}
      />

      {/* ── Main Canvas Viewport Area ── */}
      <WhiteboardCanvas
        activeSketchId={activeSketchId}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isoGrid={isoGrid}
        resolvedTheme={resolvedTheme}
        initialData={initialData}
        canvasBackground={canvasBackground}
        setExcalidrawAPI={setExcalidrawAPI}
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
      />
    </motion.div>
  );
}
