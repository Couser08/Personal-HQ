import { useState, useMemo, useEffect, useRef } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconPlus, IconTrash, IconFolder, IconFileText 
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

  const excalidrawRef = useRef<any>(null);
  const debounceTimer = useRef<any>(null);

  const [activeSketchId, setActiveSketchId] = useState<string>(() => {
    const lastActive = localStorage.getItem('phq_active_sketch_id');
    return lastActive || 'default';
  });

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [isoGrid, setIsoGrid] = useState(false);

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
      return { elements: activeSketch.elements, appState: cleanApp };
    }
    return { elements: [], appState: {} };
  }, [activeSketch]);

  // Sync canvas theme changes dynamically
  useEffect(() => {
    if (excalidrawRef.current) {
      excalidrawRef.current.updateScene({
        appState: { 
          theme: theme === 'dark' ? 'dark' : 'light',
          viewBackgroundColor: isoGrid ? 'transparent' : (theme === 'dark' ? '#121214' : '#ffffff'),
          gridModeEnabled: isoGrid,
        }
      });
    }
  }, [theme, isoGrid]);

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
        }
        .excalidraw .Island, 
        .excalidraw .context-menu, 
        .excalidraw .dropdown-menu {
          background-color: ${theme === 'dark' ? 'rgba(20, 20, 22, 0.85)' : 'rgba(255, 255, 255, 0.85)'} !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(24, 24, 27, 0.08)'} !important;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, ${theme === 'dark' ? '0.6' : '0.1'}) !important;
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
          background-color: ${theme === 'dark' ? '#121214' : '#ffffff'} !important;
          background-image: 
            linear-gradient(30deg, ${theme === 'dark' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.08)'} 1px, transparent 1px),
            linear-gradient(150deg, ${theme === 'dark' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.08)'} 1px, transparent 1px) !important;
          background-size: 30px 51.96px !important;
        }
      `}</style>

      {/* ── Left Sidebar (Sketch Library & DB Status) ── */}
      <div className="w-[250px] h-full flex flex-col gap-4 p-4.5 rounded-3xl border border-border/50 bg-surface/40 backdrop-blur-md shadow-sm shrink-0 text-left overflow-y-auto custom-scrollbar">
        {/* Slot Library Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-text-muted">Sketchbook</span>
            <span className="text-[10px] text-text-secondary mt-0.5">Manage draw files</span>
          </div>
          <button
            onClick={handleCreateNewSketch}
            className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/10"
            title="Create New Canvas"
          >
            <IconPlus size={15} />
          </button>
        </div>

        {/* List of Save Slots */}
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

      {/* ── Main Canvas Viewport Area ── */}
      <div 
        key={activeSketchId} 
        className={`flex-grow h-full relative rounded-[32px] overflow-hidden border border-border/50 bg-surface shadow-[0_15px_50px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ${isoGrid ? 'iso-grid-active' : ''}`}
      >
        <Excalidraw
          theme={theme === 'dark' ? 'dark' : 'light'}
          initialData={{
            ...initialData,
            appState: {
              ...initialData.appState,
              viewBackgroundColor: isoGrid ? 'transparent' : (theme === 'dark' ? '#121214' : '#ffffff'),
              gridModeEnabled: isoGrid,
            }
          }}
          excalidrawAPI={(api) => {
            excalidrawRef.current = api;
          }}
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
