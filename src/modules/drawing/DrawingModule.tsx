import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconPencil, IconSquare, IconCircle, IconMinus, 
  IconTrash, IconDownload, IconArrowBackUp, IconArrowForwardUp,
  IconGridPattern, IconPalette, IconLayoutGrid
} from '@tabler/icons-react';

interface Point {
  x: number;
  y: number;
}

interface DrawingShape {
  id: string;
  type: 'pen' | 'rect' | 'circle' | 'line';
  points: Point[];
  color: string;
  strokeWidth: number;
}

const PRESET_COLORS = [
  '#000000', // Black (adapts in dark mode)
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

export default function DrawingModule() {
  const { theme, drawingElements, setDrawingData } = useAppStore(useShallow(state => ({
    theme: state.theme,
    drawingElements: state.drawingElements,
    setDrawingData: state.setDrawingData
  })));

  // Core Canvas State
  const [tool, setTool] = useState<'pen' | 'rect' | 'circle' | 'line'>('pen');
  const [color, setColor] = useState('#f43f5e');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [shapes, setShapes] = useState<DrawingShape[]>(() => (drawingElements as DrawingShape[]) || []);
  const [history, setHistory] = useState<DrawingShape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [gridType, setGridType] = useState<'dots' | 'grid' | 'none'>('dots');

  // Drawing coordinates state
  const isDrawing = useRef(false);
  const currentShape = useRef<DrawingShape | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state to Zustand
  const syncToStore = useCallback((updatedShapes: DrawingShape[]) => {
    setDrawingData(updatedShapes, {});
  }, [setDrawingData]);

  // Handle Resize and Canvas Setup
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  // Redraw Canvas on change
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    
    if (gridType === 'dots') {
      ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
      const gap = 20;
      for (let x = 0; x < width; x += gap) {
        for (let y = 0; y < height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (gridType === 'grid') {
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
      ctx.lineWidth = 1;
      const gap = 30;
      for (let x = 0; x < width; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Adjust theme color for default black
    const resolveColor = (c: string) => {
      if (c === '#000000') {
        return theme === 'dark' ? '#ffffff' : '#18181b';
      }
      return c;
    };

    // Draw Shapes
    shapes.forEach((shape) => {
      ctx.strokeStyle = resolveColor(shape.color);
      ctx.lineWidth = shape.strokeWidth;
      ctx.beginPath();

      if (shape.type === 'pen') {
        if (shape.points.length < 2) return;
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      } else if (shape.type === 'rect') {
        const start = shape.points[0];
        const end = shape.points[shape.points.length - 1];
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (shape.type === 'circle') {
        const start = shape.points[0];
        const end = shape.points[shape.points.length - 1];
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === 'line') {
        const start = shape.points[0];
        const end = shape.points[shape.points.length - 1];
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    });
  }, [shapes, gridType, theme]);

  // Initial Setup & Event binding
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Get relative mouse position on canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Drawing controls
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const pos = getMousePos(e);
    
    currentShape.current = {
      id: Math.random().toString(36).substr(2, 9),
      type: tool,
      points: [pos],
      color,
      strokeWidth,
    };

    setShapes((prev) => [...prev, currentShape.current as DrawingShape]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentShape.current) return;
    const pos = getMousePos(e);

    if (tool === 'pen') {
      currentShape.current.points.push(pos);
      setShapes((prev) => 
        prev.map((s) => s.id === currentShape.current?.id ? { ...s, points: [...s.points, pos] } : s)
      );
    } else {
      // Shape update (rectangle, circle, line)
      currentShape.current.points[1] = pos;
      setShapes((prev) =>
        prev.map((s) => s.id === currentShape.current?.id ? { ...s, points: [s.points[0], pos] } : s)
      );
    }
  };

  const endDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    // Save to history for Undo/Redo
    const newHistory = history.slice(0, historyIndex + 1);
    const updatedShapes = [...shapes];
    
    setHistory([...newHistory, updatedShapes]);
    setHistoryIndex(newHistory.length);
    syncToStore(updatedShapes);
    currentShape.current = null;
  };

  // Actions
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const prevIndex = historyIndex - 1;
      const prevShapes = prevIndex >= 0 ? history[prevIndex] : [];
      setShapes(prevShapes);
      setHistoryIndex(prevIndex);
      syncToStore(prevShapes);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextShapes = history[nextIndex];
      setShapes(nextShapes);
      setHistoryIndex(nextIndex);
      syncToStore(nextShapes);
    }
  };

  const handleClear = () => {
    setShapes([]);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, []]);
    setHistoryIndex(newHistory.length);
    syncToStore([]);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with actual background applied to export it
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Draw background color
    exportCtx.fillStyle = theme === 'dark' ? '#18181b' : '#ffffff';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw original canvas content on top
    exportCtx.drawImage(canvas, 0, 0);

    const url = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'personal-hq-drawing.png';
    link.href = url;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-[calc(100vh-140px)] flex gap-4 p-2 relative select-none"
    >
      {/* ── Main Canvas Viewport ── */}
      <div 
        ref={containerRef}
        className="flex-1 h-full relative rounded-3xl overflow-hidden border border-border/50 bg-surface/50 backdrop-blur-sm cursor-crosshair shadow-sm"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Floating Controls Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-surface/90 border border-border/60 shadow-lg pointer-events-auto flex items-center gap-3 backdrop-blur-md">
            <span className="text-xs font-bold text-text-primary tracking-tight">Drawing Canvas</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex gap-2 pointer-events-auto">
            {/* Undo/Redo & Actions bar */}
            <div className="flex p-1 rounded-2xl bg-surface/90 border border-border/60 shadow-lg backdrop-blur-md gap-0.5">
              <button 
                onClick={handleUndo}
                disabled={historyIndex < 0}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-secondary hover:bg-surface-alt transition-all cursor-pointer"
                title="Undo"
              >
                <IconArrowBackUp size={16} />
              </button>
              <button 
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:hover:text-text-secondary hover:bg-surface-alt transition-all cursor-pointer"
                title="Redo"
              >
                <IconArrowForwardUp size={16} />
              </button>
              <div className="w-px h-5 bg-border/60 my-auto mx-1" />
              <button 
                onClick={handleClear}
                className="p-2 rounded-xl text-text-secondary hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
                title="Clear Canvas"
              >
                <IconTrash size={16} />
              </button>
              <button 
                onClick={handleExport}
                className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                title="Export Image"
              >
                <IconDownload size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Tools Toolbar (Apple-style pill at bottom center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center p-1.5 bg-surface/90 border border-border/60 rounded-3xl shadow-xl backdrop-blur-md gap-1">
          {(['pen', 'rect', 'circle', 'line'] as const).map((t) => {
            const active = tool === t;
            let Icon = IconPencil;
            if (t === 'rect') Icon = IconSquare;
            if (t === 'circle') Icon = IconCircle;
            if (t === 'line') Icon = IconMinus;

            return (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  active 
                    ? 'bg-primary text-white scale-105 shadow-md shadow-primary/20' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                }`}
                title={t.toUpperCase()}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Apple-Style Floating Styling Panel (Right Sidebar) ── */}
      <div className="w-72 h-full flex flex-col gap-4 p-5 rounded-3xl border border-border/50 bg-surface/40 backdrop-blur-md shadow-sm text-left">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Style Panel</h3>
          <p className="text-[10px] text-text-secondary mt-0.5">Customize properties & strokes</p>
        </div>

        {/* Color Palette Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <IconPalette size={12} /> Brush Color
          </label>
          <div className="grid grid-cols-5 gap-2 mt-1">
            {PRESET_COLORS.map((c) => {
              const active = color === c;
              return (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-xl relative flex items-center justify-center border border-border/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                  style={{ backgroundColor: c === '#000000' && theme === 'dark' ? '#ffffff' : c }}
                >
                  {active && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white dark:bg-black border border-black/10 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-border/40 my-1" />

        {/* Stroke Width Slider */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">
            Stroke Width ({strokeWidth}px)
          </label>
          <div className="flex items-center gap-3 mt-1">
            <input 
              type="range"
              min={2}
              max={24}
              step={1}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="flex-1 accent-primary h-1 bg-surface-alt rounded-lg appearance-none cursor-pointer"
            />
            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border/60 text-[10px] font-bold text-text-primary shadow-sm">
              {strokeWidth}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-border/40 my-1" />

        {/* Grid Type Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <IconGridPattern size={12} /> Canvas Grid
          </label>
          <div className="grid grid-cols-3 gap-1.5 mt-1 bg-surface-alt p-1 rounded-xl border border-border/50">
            {(['dots', 'grid', 'none'] as const).map((g) => {
              const active = gridType === g;
              return (
                <button
                  key={g}
                  onClick={() => setGridType(g)}
                  className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    active 
                      ? 'bg-surface text-primary shadow-sm border border-border/30' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Extra Apple styling metadata details */}
        <div className="mt-auto p-4.5 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <IconLayoutGrid size={14} className="text-text-muted" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status</span>
          </div>
          <div className="text-[11px] font-semibold text-text-secondary flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between">
              <span>Canvas Objects:</span>
              <span className="font-mono text-text-primary">{shapes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Autosave:</span>
              <span className="text-emerald-500 font-extrabold uppercase text-[9px] tracking-wider">Active</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
