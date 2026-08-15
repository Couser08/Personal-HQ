import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  IconZoomIn,
  IconZoomOut,
  IconFocusCentered,
  IconPlus,
  IconSparkles,
  IconArrowsSort,
} from '@tabler/icons-react';
import type { Vision, Habit } from '../../../store/types';
import { VisionCardWidget } from './VisionCardWidget';
import { VisionMiniMap } from './VisionMiniMap';
import { useAppStore } from '../../../store/useAppStore';

interface VisionCanvasProps {
  visions: Vision[];
  habits: Habit[];
  onOpenDetail: (vision: Vision) => void;
  onOpenAssignTasks: (vision: Vision) => void;
  onDeleteVision: (id: string) => void;
  onOpenCreate: () => void;
}

const ROPE_TIER_HEIGHTS = [160, 720, 1280, 1840, 2400];
const CARD_WIDTH = 360;
const CARD_GAP = 60;

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  visions,
  habits,
  onOpenDetail,
  onOpenAssignTasks,
  onDeleteVision,
  onOpenCreate,
}) => {
  const updateVisionPosition = useAppStore((s) => s.updateVisionPosition);

  // Viewport transformation
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 40 });
  const [zoom, setZoom] = useState<number>(0.9);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState<boolean>(true);

  // Dragging card state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialCardX: number;
    initialCardY: number;
  }>({ startX: 0, startY: 0, initialCardX: 0, initialCardY: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  // Track container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Compute computed positions for visions that don't have position yet
  const positionedVisions = useMemo(() => {
    const cardsPerRow = 4;
    return visions.map((v, index) => {
      if (v.position) return v;

      // Auto assign to rope tiers
      const rowIndex = Math.floor(index / cardsPerRow);
      const colIndex = index % cardsPerRow;
      const ropeY = ROPE_TIER_HEIGHTS[rowIndex] || 160 + rowIndex * 560;

      // Add a slight natural tilt (-2.5 to +2.5 deg) based on index
      const naturalRotation = ((index % 5) - 2) * 1.2;

      return {
        ...v,
        position: {
          x: 100 + colIndex * (CARD_WIDTH + CARD_GAP),
          y: ropeY + 40,
        },
        rotation: v.rotation !== undefined ? v.rotation : naturalRotation,
        ropeTier: rowIndex,
      };
    });
  }, [visions]);

  // Keybindings for Space+Drag and Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setIsSpacePressed(true);
      }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setZoom(1.0);
        setPan({ x: 80, y: 40 });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel handling for zoom & pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom centered on cursor
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.25), 2.0);
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          setPan((prevPan) => ({
            x: mouseX - (mouseX - prevPan.x) * (nextZoom / prevZoom),
            y: mouseY - (mouseY - prevPan.y) * (nextZoom / prevZoom),
          }));
        }
        return nextZoom;
      });
    } else {
      // Smooth Pan
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  }, []);

  // Canvas Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background or holding space / middle click
    if (
      e.target === containerRef.current ||
      (e.target as HTMLElement).dataset.canvasSurface ||
      isSpacePressed ||
      e.button === 1
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggedCardId) {
      const deltaX = (e.clientX - dragRef.current.startX) / zoom;
      const deltaY = (e.clientY - dragRef.current.startY) / zoom;

      const newX = Math.round(dragRef.current.initialCardX + deltaX);
      const newY = Math.round(dragRef.current.initialCardY + deltaY);

      // Local optimistic update in store
      updateVisionPosition(draggedCardId, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedCardId(null);
  };

  // Touch Gesture Handling for Mobile (Pan & Pinch-to-zoom)
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    initialDistance: number;
    initialZoom: number;
  }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
    initialDistance: 0,
    initialZoom: 1,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single finger pan
      const touch = e.touches[0];
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
        initialDistance: 0,
        initialZoom: zoom,
      };
      setIsPanning(true);
    } else if (e.touches.length === 2) {
      // Two finger pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      touchStateRef.current = {
        startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        initialPanX: pan.x,
        initialPanY: pan.y,
        initialDistance: dist,
        initialZoom: zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedCardId) {
      // Card drag via touch
      const touch = e.touches[0];
      const deltaX = (touch.clientX - dragRef.current.startX) / zoom;
      const deltaY = (touch.clientY - dragRef.current.startY) / zoom;

      const newX = Math.round(dragRef.current.initialCardX + deltaX);
      const newY = Math.round(dragRef.current.initialCardY + deltaY);

      updateVisionPosition(draggedCardId, { x: newX, y: newY });
      return;
    }

    if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStateRef.current.startX;
      const deltaY = touch.clientY - touchStateRef.current.startY;

      setPan({
        x: touchStateRef.current.initialPanX + deltaX,
        y: touchStateRef.current.initialPanY + deltaY,
      });
    } else if (e.touches.length === 2 && touchStateRef.current.initialDistance > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      const ratio = dist / touchStateRef.current.initialDistance;
      const nextZoom = Math.min(
        Math.max(touchStateRef.current.initialZoom * ratio, 0.25),
        2.0
      );
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggedCardId(null);
  };

  // Start dragging a specific card
  const handleCardDragStart = (
    cardId: string,
    currentPos: { x: number; y: number },
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialCardX: currentPos.x,
      initialCardY: currentPos.y,
    };
    setDraggedCardId(cardId);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.25));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 80, y: 40 });
  };

  // Fit all cards in view
  const handleFitView = () => {
    if (positionedVisions.length === 0) {
      handleResetZoom();
      return;
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    positionedVisions.forEach((v) => {
      const x = v.position?.x || 0;
      const y = v.position?.y || 0;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + CARD_WIDTH);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + 420);
    });

    const padding = 120;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;

    const scaleX = dimensions.width / contentW;
    const scaleY = dimensions.height / contentH;
    const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.2);

    const fitPanX = (dimensions.width - contentW * fitZoom) / 2 - (minX - padding) * fitZoom;
    const fitPanY = (dimensions.height - contentH * fitZoom) / 2 - (minY - padding) * fitZoom;

    setZoom(fitZoom);
    setPan({ x: fitPanX, y: fitPanY });
  };

  // Auto-Tidy Ropes Layout
  const handleTidyRopes = () => {
    const cardsPerRow = 4;
    positionedVisions.forEach((v, idx) => {
      const rowIndex = Math.floor(idx / cardsPerRow);
      const colIndex = idx % cardsPerRow;
      const ropeY = ROPE_TIER_HEIGHTS[rowIndex] || 160 + rowIndex * 560;
      const targetX = 100 + colIndex * (CARD_WIDTH + CARD_GAP);
      const targetY = ropeY + 40;
      const naturalRotation = ((idx % 5) - 2) * 1.2;

      updateVisionPosition(v.id, { x: targetX, y: targetY }, naturalRotation);
    });
  };

  // Calculate World Canvas bounds for Ropes
  const minWorldX = -1000;
  const maxWorldX = Math.max(
    ...positionedVisions.map((v) => (v.position?.x || 0) + CARD_WIDTH + 800),
    3200
  );

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-canvas-surface="true"
      className={`relative w-full h-full min-h-[600px] overflow-hidden select-none bg-background ${
        isPanning || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        touchAction: 'none',
        // Infinite dynamic dot grid pattern synced with pan & zoom
        backgroundImage: `radial-gradient(var(--border-border-alt) 1.2px, transparent 1.2px)`,
        backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* ── TRANSFORM CONTAINER (World Space) ── */}
      <div
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
        data-canvas-surface="true"
        className="absolute inset-0 pointer-events-none"
      >
        {/* ── HANGING ROPES & CABLES LAYER ── */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            {/* Natural Twine Rope Gradient */}
            <linearGradient id="twineRope" x1="0" y1="0" x2="100%" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="25%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#92400e" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <filter id="ropeShadow" x="-5%" y="-20%" width="110%" height="150%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Main Horizontal Rope Lines */}
          {ROPE_TIER_HEIGHTS.map((ropeY, idx) => {
            // Find all cards on this tier
            const tierCards = positionedVisions.filter(
              (v) => Math.abs((v.position?.y || 0) - ropeY) < 280
            );

            // Generate saggy curve control points
            const startX = minWorldX;
            const endX = maxWorldX;
            const midX = (startX + endX) / 2;
            const sagAmount = 24 + tierCards.length * 4;

            return (
              <g key={`rope-${idx}`} filter="url(#ropeShadow)">
                {/* Left and Right Wall Wooden Anchors */}
                <rect
                  x={startX - 15}
                  y={ropeY - 14}
                  width="30"
                  height="28"
                  rx="6"
                  fill="#78350f"
                  stroke="#451a03"
                  strokeWidth="2"
                />
                <circle cx={startX} cy={ropeY} r="5" fill="#fef3c7" />

                <rect
                  x={endX - 15}
                  y={ropeY - 14}
                  width="30"
                  height="28"
                  rx="6"
                  fill="#78350f"
                  stroke="#451a03"
                  strokeWidth="2"
                />
                <circle cx={endX} cy={ropeY} r="5" fill="#fef3c7" />

                {/* Sagging Natural Rope Bézier Path */}
                <path
                  d={`M ${startX} ${ropeY} Q ${midX} ${ropeY + sagAmount} ${endX} ${ropeY}`}
                  fill="none"
                  stroke="url(#twineRope)"
                  strokeWidth="4"
                  strokeDasharray="6 2"
                  strokeLinecap="round"
                />

                {/* Secondary highlight string */}
                <path
                  d={`M ${startX} ${ropeY - 1} Q ${midX} ${ropeY + sagAmount - 1} ${endX} ${ropeY - 1}`}
                  fill="none"
                  stroke="#fef3c7"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              </g>
            );
          })}

          {/* Vertical Strings connecting Clothespins to Cards when pulled down */}
          {positionedVisions.map((v) => {
            const posX = v.position?.x || 0;
            const posY = v.position?.y || 0;
            const cardCenterTopX = posX + CARD_WIDTH / 2;
            const cardTopY = posY;

            // Find closest rope
            const closestRopeY =
              ROPE_TIER_HEIGHTS.reduce((prev, curr) =>
                Math.abs(curr - cardTopY) < Math.abs(prev - cardTopY) ? curr : prev
              ) || 160;

            // If card is noticeably below or above rope, draw a realistic tether string
            const isOffset = Math.abs(closestRopeY - cardTopY) > 20;

            if (isOffset) {
              return (
                <g key={`tether-${v.id}`}>
                  {/* Pin anchor at rope */}
                  <circle
                    cx={cardCenterTopX}
                    cy={closestRopeY}
                    r="4"
                    fill="#92400e"
                    stroke="#fef3c7"
                    strokeWidth="1.5"
                  />
                  {/* Tension string */}
                  <line
                    x1={cardCenterTopX}
                    y1={closestRopeY}
                    x2={cardCenterTopX}
                    y2={cardTopY}
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                </g>
              );
            }
            return null;
          })}
        </svg>

        {/* ── VISION CARDS LAYER ── */}
        <div className="absolute inset-0 pointer-events-none">
          {positionedVisions.map((vision) => {
            const posX = vision.position?.x || 0;
            const posY = vision.position?.y || 0;

            return (
              <div
                key={vision.id}
                style={{
                  position: 'absolute',
                  left: `${posX}px`,
                  top: `${posY}px`,
                }}
                className="pointer-events-auto"
              >
                <VisionCardWidget
                  vision={vision}
                  habits={habits}
                  onOpenDetail={() => onOpenDetail(vision)}
                  onOpenAssignTasks={() => onOpenAssignTasks(vision)}
                  onDelete={() => onDeleteVision(vision.id)}
                  isDragging={draggedCardId === vision.id}
                  onDragStart={(e) =>
                    handleCardDragStart(
                      vision.id,
                      vision.position || { x: posX, y: posY },
                      e
                    )
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FLOATING TOP STATS & QUICK ACTIONS ── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 pointer-events-auto bg-surface/90 backdrop-blur-xl border border-border px-3.5 py-2 rounded-2xl shadow-lg">
          <span className="text-[12px] font-extrabold text-text-primary flex items-center gap-1.5">
            <IconSparkles size={16} className="text-primary" />
            <span>Vision Canvas</span>
          </span>
          <span className="text-text-muted">·</span>
          <span className="text-[12px] font-semibold text-text-secondary">
            {positionedVisions.length} Visions
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Auto Tidy Ropes */}
          <button
            onClick={handleTidyRopes}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface/90 backdrop-blur-xl border border-border shadow-md text-[12px] font-bold text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-all cursor-pointer"
            title="Auto-arrange cards neatly along ropes"
          >
            <IconArrowsSort size={15} />
            <span className="hidden sm:inline">Tidy Board</span>
          </button>

          {/* Plant a Seed / Add Vision */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-text-on-accent shadow-lg text-[13px] font-bold hover:opacity-90 transition-transform active:scale-95 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Plant Vision</span>
          </button>
        </div>
      </div>

      {/* ── FLOATING BOTTOM CANVAS CONTROLS ── */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20 pointer-events-auto">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-xl">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <IconZoomOut size={16} />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-[11px] font-bold text-text-primary hover:bg-surface-alt rounded-lg transition-colors cursor-pointer"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <IconZoomIn size={16} />
          </button>

          <div className="w-px h-4 bg-border my-auto mx-0.5" />

          <button
            onClick={handleFitView}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
            title="Fit all visions into view"
          >
            <IconFocusCentered size={16} />
          </button>
        </div>
      </div>

      {/* ── FLOATING RADAR MINIMAP ── */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <VisionMiniMap
          visions={positionedVisions}
          viewport={{
            x: pan.x,
            y: pan.y,
            zoom,
            width: dimensions.width,
            height: dimensions.height,
          }}
          onCenterAt={(worldX, worldY) => {
            setPan({
              x: dimensions.width / 2 - worldX * zoom,
              y: dimensions.height / 2 - worldY * zoom,
            });
          }}
          isOpen={isMiniMapOpen}
          onToggle={() => setIsMiniMapOpen(!isMiniMapOpen)}
        />
      </div>
    </div>
  );
};
