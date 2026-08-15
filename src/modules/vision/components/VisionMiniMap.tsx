import React from 'react';
import type { Vision } from '../../../store/types';

interface VisionMiniMapProps {
  visions: Vision[];
  viewport: { x: number; y: number; zoom: number; width: number; height: number };
  onCenterAt: (x: number, y: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const VisionMiniMap: React.FC<VisionMiniMapProps> = ({
  visions,
  viewport,
  onCenterAt,
  isOpen,
  onToggle,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="px-3 py-1.5 rounded-xl bg-surface/90 backdrop-blur-md border border-border shadow-md text-[11px] font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
      >
        🗺️ MiniMap
      </button>
    );
  }

  // Define virtual world bounds
  const mapWidth = 180;
  const mapHeight = 110;

  // Find min and max positions of all visions
  let minX = -1200;
  let maxX = 2400;
  let minY = -600;
  let maxY = 1800;

  visions.forEach((v) => {
    if (v.position) {
      if (v.position.x < minX) minX = v.position.x - 400;
      if (v.position.x > maxX) maxX = v.position.x + 800;
      if (v.position.y < minY) minY = v.position.y - 400;
      if (v.position.y > maxY) maxY = v.position.y + 800;
    }
  });

  const worldWidth = Math.max(maxX - minX, 2000);
  const worldHeight = Math.max(maxY - minY, 1400);

  const scaleX = mapWidth / worldWidth;
  const scaleY = mapHeight / worldHeight;

  // Viewport rect calculation
  const vpWorldX = -viewport.x / viewport.zoom;
  const vpWorldY = -viewport.y / viewport.zoom;
  const vpWorldW = viewport.width / viewport.zoom;
  const vpWorldH = viewport.height / viewport.zoom;

  const vpMapX = Math.max(0, Math.min(mapWidth, (vpWorldX - minX) * scaleX));
  const vpMapY = Math.max(0, Math.min(mapHeight, (vpWorldY - minY) * scaleY));
  const vpMapW = Math.max(8, Math.min(mapWidth, vpWorldW * scaleX));
  const vpMapH = Math.max(8, Math.min(mapHeight, vpWorldH * scaleY));

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickMapX = e.clientX - rect.left;
    const clickMapY = e.clientY - rect.top;

    const targetWorldX = minX + clickMapX / scaleX;
    const targetWorldY = minY + clickMapY / scaleY;

    onCenterAt(targetWorldX, targetWorldY);
  };

  return (
    <div className="flex flex-col gap-1 p-2 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-xl select-none">
      <div className="flex items-center justify-between px-1 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
        <span>Board Radar</span>
        <button
          onClick={onToggle}
          className="text-text-muted hover:text-text-primary cursor-pointer p-0.5"
        >
          ✕
        </button>
      </div>

      <div
        onClick={handleMapClick}
        style={{ width: mapWidth, height: mapHeight }}
        className="relative bg-surface-alt rounded-xl border border-border overflow-hidden cursor-crosshair"
      >
        {/* Render Card markers */}
        {visions.map((v) => {
          const posX = v.position ? (v.position.x - minX) * scaleX : 0;
          const posY = v.position ? (v.position.y - minY) * scaleY : 0;

          return (
            <div
              key={v.id}
              style={{
                left: `${posX}px`,
                top: `${posY}px`,
                width: '14px',
                height: '9px',
              }}
              className={`absolute rounded-[2px] border ${
                v.status === 'Achieved'
                  ? 'bg-emerald-500 border-emerald-400'
                  : v.status === 'In Progress'
                  ? 'bg-amber-500 border-amber-400'
                  : 'bg-primary border-primary/50'
              } shadow-xs opacity-85`}
              title={v.title}
            />
          );
        })}

        {/* Viewport Indicator Rectangle */}
        <div
          style={{
            left: `${vpMapX}px`,
            top: `${vpMapY}px`,
            width: `${vpMapW}px`,
            height: `${vpMapH}px`,
          }}
          className="absolute border-2 border-primary bg-primary/15 rounded-md pointer-events-none transition-all duration-75"
        />
      </div>
    </div>
  );
};
