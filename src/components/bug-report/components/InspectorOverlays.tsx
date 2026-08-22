import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { IconLoader2 } from '@tabler/icons-react';
import type { SelectedItem } from '../utils/collageBuilder';

export interface HoverBox {
  x: number;
  y: number;
  width: number;
  height: number;
  tag: string;
  id?: string;
  classes: string[];
  ancestorPath: string;
  selector: string;
}

interface InspectorOverlaysProps {
  inspectionMode: 'single' | 'group';
  selectedItems: SelectedItem[];
  hoverBox: HoverBox | null;
  isCapturing: boolean;
}

export const InspectorOverlays: React.FC<InspectorOverlaysProps> = ({
  inspectionMode,
  selectedItems,
  hoverBox,
  isCapturing,
}) => {
  return (
    <>
      {/* ─── Selected Items Bounding Boxes ─── */}
      {inspectionMode === 'group' && (
        <AnimatePresence>
          {selectedItems.map((item, idx) => {
            if (!item.element || !item.element.isConnected) return null;
            const r = item.element.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return null;

            return (
              <div
                key={item.id}
                style={{
                  position: 'fixed',
                  left: `${r.left}px`,
                  top: `${r.top}px`,
                  width: `${r.width}px`,
                  height: `${r.height}px`,
                  pointerEvents: 'none',
                  zIndex: 99997,
                }}
                className="border-2 border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.4)] rounded-md transition-all duration-75"
              >
                {/* Number Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '-12px',
                  }}
                  className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center shadow-lg border-2 border-zinc-900"
                >
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </AnimatePresence>
      )}

      {/* ─── Hover Bounding Box ─── */}
      <AnimatePresence>
        {hoverBox && !isCapturing && (
          <div
            style={{
              position: 'fixed',
              left: `${hoverBox.x}px`,
              top: `${hoverBox.y}px`,
              width: `${hoverBox.width}px`,
              height: `${hoverBox.height}px`,
              pointerEvents: 'none',
              zIndex: 99998,
            }}
            className="border-2 border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.35)] rounded-md transition-all duration-75"
          >
            {/* Element Tag Pill Badge */}
            <div
              style={{
                position: 'absolute',
                top: hoverBox.y < 45 ? `${hoverBox.height + 6}px` : '-32px',
                left: '0px',
              }}
              className="px-2.5 py-1 rounded-md bg-zinc-900/95 text-white border border-rose-500/40 text-[11px] font-mono flex items-center gap-2 shadow-lg backdrop-blur-md whitespace-nowrap"
            >
              <span className="font-bold text-rose-400">&lt;{hoverBox.tag}&gt;</span>
              {hoverBox.id && <span className="text-amber-300">#{hoverBox.id}</span>}
              {hoverBox.classes.length > 0 && (
                <span className="text-blue-300">.{hoverBox.classes[0]}</span>
              )}
              <span className="text-zinc-400 text-[10px]">
                {Math.round(hoverBox.width)} × {Math.round(hoverBox.height)}
              </span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Capturing Loader Overlay ─── */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100001] pointer-events-auto">
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3">
            <IconLoader2 size={24} className="animate-spin text-rose-400" />
            <div>
              <p className="text-sm font-bold">Generating Focused Element Snapshot...</p>
              <p className="text-xs text-zinc-400">
                Extracting element structure &amp; compiling group preview
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
