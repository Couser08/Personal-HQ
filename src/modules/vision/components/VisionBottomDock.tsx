import React, { useState } from 'react';
import {
  IconHandStop,
  IconPointer,
  IconArrowBackUp,
  IconZoomIn,
  IconZoomOut,
  IconFocusCentered,
  IconChevronUp,
  IconHelpCircle,
  IconKeyboard,
  IconX,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';

interface VisionBottomDockProps {
  onFitView: () => void;
}

export const VisionBottomDock: React.FC<VisionBottomDockProps> = ({ onFitView }) => {
  const {
    activeTool,
    setActiveTool,
    canvasZoom,
    setCanvasZoom,
    resetCanvasView,
  } = useAppStore();

  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const zoomPercent = Math.round(canvasZoom * 100);
  const zoomPresets = [50, 75, 100, 125, 150, 200];

  const shortcutsList = [
    { label: 'Zoom In', keys: '+  or  =  or  ]' },
    { label: 'Zoom Out', keys: '-  or  _  or  [' },
    { label: 'Reset Zoom (100%)', keys: '0  or  Ctrl + 0' },
    { label: 'Pan Canvas', keys: 'Space + Drag  /  Arrow Keys' },
    { label: 'Hand Tool (Pan Mode)', keys: 'H' },
    { label: 'Select Tool (Pointer)', keys: 'V' },
    { label: 'Duplicate Card', keys: 'Ctrl + D' },
    { label: 'Delete Card', keys: 'Delete  /  Backspace' },
    { label: 'Edit Card Properties', keys: 'Double-Click Card' },
    { label: 'Deselect Card', keys: 'Escape' },
  ];

  return (
    <>
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center select-none pointer-events-auto">
        {/* Main Floating Glass Dock */}
        <nav
          aria-label="Canvas Controls Dock"
          className="bg-surface/95 backdrop-blur-2xl border border-border rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl flex items-center gap-1 sm:gap-2 ring-1 ring-black/5 dark:ring-white/5"
        >
          {/* Hand (Pan Mode) Tool */}
          <button
            type="button"
            onClick={() => setActiveTool('pan')}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-hidden ${
              activeTool === 'pan'
                ? 'bg-text-primary text-text-on-accent shadow-md scale-105'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
            }`}
            title="Pan Canvas (Press H or hold Space)"
            aria-label="Pan Canvas Tool"
          >
            <IconHandStop size={20} />
            <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5 leading-none opacity-80">
              Pan
            </span>
          </button>

          {/* Pointer (Select / Transform) Tool */}
          <button
            type="button"
            onClick={() => setActiveTool('select')}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-hidden ${
              activeTool === 'select'
                ? 'bg-text-primary text-text-on-accent shadow-md scale-105'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
            }`}
            title="Select & Move (Press V)"
            aria-label="Select Tool"
          >
            <IconPointer size={20} />
            <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5 leading-none opacity-80">
              Select
            </span>
          </button>

          <div className="w-[1px] h-7 bg-border mx-1" />

          {/* Zoom Out Button (-) */}
          <button
            type="button"
            onClick={() => setCanvasZoom((z) => Math.max(0.25, +(z - 0.15).toFixed(2)))}
            className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl text-text-secondary hover:text-text-primary hover:bg-surface-alt items-center justify-center transition-all cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
            title="Zoom Out (Press - or [ )"
            aria-label="Zoom Out"
          >
            <IconZoomOut size={18} />
          </button>

          {/* Zoom Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowZoomMenu((prev) => !prev)}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl sm:rounded-2xl text-[11.5px] sm:text-[12.5px] font-black text-text-primary hover:bg-surface-alt transition-all cursor-pointer min-w-[55px] sm:min-w-[70px] justify-center focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
              title="Zoom Presets"
              aria-label={`Current Zoom: ${zoomPercent}%`}
            >
              <span>{zoomPercent}%</span>
              <IconChevronUp
                size={14}
                className={`text-text-tertiary transition-transform duration-200 ${
                  showZoomMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Zoom Presets Popover */}
            {showZoomMenu && (
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2 bg-surface/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[150px] z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-black uppercase text-text-tertiary">
                  <span>Zoom Level</span>
                  <span className="font-mono text-text-secondary">Ctrl + / -</span>
                </div>

                {zoomPresets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setCanvasZoom(pct / 100);
                      setShowZoomMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-left text-[12px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                      zoomPercent === pct
                        ? 'bg-text-primary text-text-on-accent'
                        : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                    }`}
                  >
                    <span>{pct}%</span>
                    {pct === 100 && <span className="text-[10px] opacity-75">1:1 Actual</span>}
                  </button>
                ))}

                <div className="w-full h-[1px] bg-border my-1" />

                <button
                  type="button"
                  onClick={() => {
                    onFitView();
                    setShowZoomMenu(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-left text-[12px] font-bold text-text-secondary hover:bg-surface-alt hover:text-text-primary flex items-center gap-2 cursor-pointer"
                >
                  <IconFocusCentered size={15} />
                  <span>Fit All to Screen</span>
                </button>
              </div>
            )}
          </div>

          {/* Zoom In Button (+) */}
          <button
            type="button"
            onClick={() => setCanvasZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
            className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl text-text-secondary hover:text-text-primary hover:bg-surface-alt items-center justify-center transition-all cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
            title="Zoom In (Press + or = or ] )"
            aria-label="Zoom In"
          >
            <IconZoomIn size={18} />
          </button>

          <div className="hidden sm:block w-[1px] h-7 bg-border mx-1" />

          {/* Reset / Center View Button */}
          <button
            type="button"
            onClick={resetCanvasView}
            className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl text-text-secondary hover:text-text-primary hover:bg-surface-alt items-center justify-center transition-all cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
            title="Reset 100% (Press 0)"
            aria-label="Reset View to 100%"
          >
            <IconArrowBackUp size={19} />
          </button>

          {/* Fit View Button */}
          <button
            type="button"
            onClick={onFitView}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl text-text-secondary hover:text-text-primary hover:bg-surface-alt flex items-center justify-center transition-all cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
            title="Fit All Nodes"
            aria-label="Fit All Nodes"
          >
            <IconFocusCentered size={19} />
          </button>

          {/* Keyboard Shortcuts Helper Button */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl text-text-tertiary hover:text-text-primary hover:bg-surface-alt flex items-center justify-center transition-all cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
            title="Keyboard Shortcuts"
            aria-label="Keyboard Shortcuts"
          >
            <IconHelpCircle size={18} />
          </button>
        </nav>
      </div>

      {/* Keyboard Shortcuts Dialog Modal (max-w-2xl wide format) */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-surface-alt border border-border flex items-center justify-center text-primary shadow-xs">
                  <IconKeyboard size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                    Canvas Laptop Shortcuts
                  </h3>
                  <p className="text-[11.5px] font-semibold text-text-tertiary">
                    Keyboard controls to navigate and design faster
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="w-9 h-9 rounded-xl bg-surface-alt hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* 2-Column Responsive Grid of Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px]">
              {shortcutsList.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-alt/70 border border-border/60"
                >
                  <span className="font-semibold text-text-secondary pr-2">
                    {item.label}
                  </span>
                  <span className="font-mono text-[12px] font-bold px-2.5 py-1 bg-surface rounded-xl border border-border text-text-primary shadow-2xs whitespace-nowrap">
                    {item.keys}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-6 py-2.5 rounded-xl bg-text-primary text-text-on-accent text-[12.5px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
