import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconBug,
  IconX,
  IconLayersSubtract,
  IconCheck,
  IconTarget,
  IconRotate,
  IconDots,
} from '@tabler/icons-react';
import { ALL_PAGES } from '../constants/pages';
import type { SelectedItem } from '../utils/collageBuilder';

interface InspectorToolbarProps {
  inspectionMode: 'single' | 'group';
  setInspectionMode: (mode: 'single' | 'group') => void;
  selectedItems: SelectedItem[];
  setSelectedItems: (items: SelectedItem[]) => void;
  isCapturing: boolean;
  isPageSwitcherOpen: boolean;
  setIsPageSwitcherOpen: (open: boolean) => void;
  activeModule: string;
  setActiveModule: (mod: string) => void;
  captureGroupElements: () => void;
  cancelInspection: () => void;
}

export const InspectorToolbar: React.FC<InspectorToolbarProps> = ({
  inspectionMode,
  setInspectionMode,
  selectedItems,
  setSelectedItems,
  isCapturing,
  isPageSwitcherOpen,
  setIsPageSwitcherOpen,
  activeModule,
  setActiveModule,
  captureGroupElements,
  cancelInspection,
}) => {
  return (
    <div className="pointer-events-auto fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100000] w-auto max-w-[96vw] flex flex-col items-center gap-2">
      {/* Page Switcher Popover */}
      <AnimatePresence>
        {isPageSwitcherOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="bg-zinc-950/95 text-white border border-white/20 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl w-[94vw] max-w-2xl max-h-[60vh] sm:max-h-[420px] overflow-y-auto custom-scrollbar flex flex-col gap-3 pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 px-1">
              <div>
                <h4 className="text-[13px] sm:text-sm font-bold text-white tracking-tight">
                  Switch Workspace / Page
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Navigate to any module to select elements across multiple pages for a unified report.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPageSwitcherOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close page switcher"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {ALL_PAGES.map((page) => {
                const isActive = activeModule === page.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(page.id);
                      setIsPageSwitcherOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-500 text-white shadow-md font-bold'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5'
                    }`}
                  >
                    <span className="text-base shrink-0">{page.emoji}</span>
                    <span className="truncate flex-1">{page.label}</span>
                    {isActive && <IconCheck size={14} className="shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Dock */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.92 }}
        transition={{ type: 'spring', damping: 26, stiffness: 360 }}
        className="flex flex-row items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full bg-zinc-950/95 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-2xl whitespace-nowrap"
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 pl-1">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <IconBug size={15} className="text-rose-400 shrink-0" />
          <span className="text-[11.5px] font-bold tracking-tight hidden md:inline text-zinc-200">
            {isCapturing
              ? 'Capturing...'
              : inspectionMode === 'single'
              ? 'Tap element to report'
              : 'Select elements'}
          </span>
        </div>

        <div className="h-4 w-px bg-white/20" />

        {/* Mode Switcher */}
        <div className="flex items-center bg-zinc-800/80 p-0.5 rounded-full border border-zinc-700/60">
          <button
            type="button"
            onClick={() => {
              setInspectionMode('single');
              setSelectedItems([]);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
              inspectionMode === 'single' ? 'bg-rose-500 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <IconTarget size={12} />
            <span>Single</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectionMode('group')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
              inspectionMode === 'group' ? 'bg-rose-500 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <IconLayersSubtract size={12} />
            <span>Group</span>
          </button>
        </div>

        {/* Page Switcher Trigger */}
        <button
          type="button"
          onClick={() => setIsPageSwitcherOpen(!isPageSwitcherOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
            isPageSwitcherOpen
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60'
          }`}
          title="Switch workspace / page while reporting"
        >
          <IconDots size={14} />
          <span className="hidden sm:inline">Pages</span>
        </button>

        {/* Group Mode Actions */}
        {inspectionMode === 'group' && (
          <>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-[10.5px] font-mono font-bold text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
              {selectedItems.length}
            </span>

            {selectedItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => void captureGroupElements()}
                  disabled={isCapturing}
                  className="flex items-center gap-1 text-[11.5px] font-extrabold bg-white text-zinc-900 hover:bg-zinc-100 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <IconCheck size={13} />
                  <span>Done ({selectedItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Reset selection"
                >
                  <IconRotate size={13} />
                </button>
              </>
            )}
          </>
        )}

        <div className="h-4 w-px bg-white/20" />

        {/* Exit Button */}
        <button
          type="button"
          onClick={cancelInspection}
          disabled={isCapturing}
          className="flex items-center gap-1 text-[11.5px] font-extrabold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer active:scale-95"
          title="Exit bug report mode"
        >
          <IconX size={13} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </motion.div>
    </div>
  );
};
