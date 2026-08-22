import React from 'react';
import { IconMapPin, IconDots } from '@tabler/icons-react';
import type { VisionNode } from '../../../../store/types';

interface MapNodeViewProps {
  node: VisionNode;
  activeMapPinIndex: number;
  setActiveMapPinIndex: (idx: number) => void;
  onToggleMenu: (e: React.MouseEvent) => void;
}

export const MapNodeView: React.FC<MapNodeViewProps> = ({
  node,
  activeMapPinIndex,
  setActiveMapPinIndex,
  onToggleMenu,
}) => {
  return (
    <div className="w-full h-full p-4 flex flex-col justify-between bg-surface border border-border/80 text-text-primary">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconMapPin size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">
            {node.title || 'TRAVEL MAP'}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleMenu}
          className="w-6 h-6 rounded-lg text-text-tertiary hover:bg-surface-alt flex items-center justify-center cursor-pointer"
        >
          <IconDots size={14} />
        </button>
      </div>

      {/* World Map Vector */}
      <div className="relative w-full flex-1 rounded-2xl bg-surface-alt/70 border border-border/40 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 400 200"
          className="w-full h-full opacity-40 text-text-secondary fill-current pointer-events-none"
        >
          <path d="M50,40 Q90,30 110,60 Q130,90 100,120 Q60,110 50,40 Z" />
          <path d="M100,130 Q120,135 125,160 Q110,180 95,160 Z" />
          <path d="M180,30 Q250,20 280,50 Q260,90 200,80 Q170,50 180,30 Z" />
          <path d="M190,95 Q230,95 240,140 Q210,165 185,130 Z" />
          <path d="M290,60 Q360,50 370,100 Q330,120 300,90 Z" />
          <path d="M310,130 Q350,130 360,160 Q320,170 310,130 Z" />
        </svg>

        {/* Interactive Pins */}
        {(
          node.mapPins || [
            { id: 'p1', title: 'New York', lat: 40.7, lng: -74, note: 'The city of dreams.' },
            { id: 'p2', title: 'Maldives', lat: 3.2, lng: 73.2, note: 'Overwater villa retreat.' },
            { id: 'p3', title: 'Tokyo', lat: 35.6, lng: 139.6, note: 'Design studios & neon.' },
          ]
        ).map((pin, idx) => {
          const x = 70 + idx * 110;
          const y = 50 + (idx % 2) * 40;
          const isActive = activeMapPinIndex === idx;

          return (
            <button
              key={pin.id || idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMapPinIndex(idx);
              }}
              style={{ left: `${x}px`, top: `${y}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-10"
              title={pin.title}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-primary scale-125 ring-4 ring-primary/30'
                    : 'bg-primary/70 hover:scale-110'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Destination Card Teaser */}
      {node.mapPins && node.mapPins[activeMapPinIndex] && (
        <div className="mt-3 p-2.5 rounded-xl bg-surface-alt border border-border flex items-center gap-3">
          {node.mapPins[activeMapPinIndex].imageUrl && (
            <img
              src={node.mapPins[activeMapPinIndex].imageUrl}
              alt={node.mapPins[activeMapPinIndex].title}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[12px] font-black text-text-primary block truncate">
              {node.mapPins[activeMapPinIndex].title}
            </span>
            <p className="text-[10.5px] text-text-tertiary line-clamp-2 leading-tight">
              {node.mapPins[activeMapPinIndex].note || 'A place to grow, explore and create my story.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
