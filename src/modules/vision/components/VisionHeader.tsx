import React, { useState } from 'react';
import {
  IconSparkles,
  IconShare,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconCheck,
  IconEdit,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionBoard } from '../../../store/types';

interface VisionHeaderProps {
  board: VisionBoard;
  onOpenExport: () => void;
  onOpenDiscover: () => void;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  viewTab?: 'DASHBOARD' | 'MY BOARDS';
  setViewTab?: (tab: 'DASHBOARD' | 'MY BOARDS') => void;
}

export const VisionHeader: React.FC<VisionHeaderProps> = ({
  board,
  onOpenExport,
  onOpenDiscover,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
}) => {
  const { focusMode, setFocusMode, updateBoard } = useAppStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(board.title);
  const [subtitleInput, setSubtitleInput] = useState(board.subtitle || '');

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      updateBoard(board.id, {
        title: titleInput.trim(),
        subtitle: subtitleInput.trim(),
      });
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="relative z-30 shrink-0 w-full border-b border-border/80 bg-surface/80 backdrop-blur-xl px-3 sm:px-5 py-2.5 sm:py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-full">
        {/* LEFT ZONE: Brand Badge & Board Drawer Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setLeftSidebarOpen((prev) => !prev)}
            aria-label="Toggle Boards Sidebar"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-surface-alt border border-border text-text-primary hover:bg-surface hover:border-border-alt transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            title="Toggle boards list"
          >
            {leftSidebarOpen ? (
              <IconLayoutSidebarLeftCollapse size={20} />
            ) : (
              <IconLayoutSidebarLeftExpand size={20} />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-surface-alt text-text-primary border border-border flex items-center justify-center shrink-0 shadow-xs">
              <IconSparkles size={18} className="text-primary" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[13px] font-extrabold tracking-tight text-text-primary leading-tight">
                My Boards
              </span>
              <span className="text-[10.5px] font-semibold text-text-tertiary">
                Visual Canvas
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE ZONE: Active Board Title & Inline Editing */}
        <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1 sm:px-4">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 max-w-full">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="px-2.5 py-1 text-[13px] sm:text-[15px] font-black uppercase tracking-wider rounded-lg bg-surface border border-primary text-text-primary focus:outline-none max-w-[140px] sm:max-w-[200px]"
                autoFocus
              />
              <input
                type="text"
                value={subtitleInput}
                onChange={(e) => setSubtitleInput(e.target.value)}
                placeholder="Subtitle"
                className="hidden sm:block px-2 py-1 text-[11px] rounded-lg bg-surface border border-border text-text-secondary focus:outline-none max-w-[150px]"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1.5 rounded-lg bg-text-primary text-text-on-accent hover:opacity-90 cursor-pointer"
                title="Save board title"
              >
                <IconCheck size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleInput(board.title);
                setSubtitleInput(board.subtitle || '');
                setIsEditingTitle(true);
              }}
              className="group flex flex-col items-center text-center cursor-pointer max-w-full"
              title="Click to edit board title"
            >
              <div className="flex items-center gap-1.5 max-w-full">
                <span className="text-[13px] sm:text-[16px] font-black text-text-primary uppercase tracking-widest truncate">
                  {board.title}
                </span>
                <IconEdit
                  size={13}
                  className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              {board.subtitle && (
                <span className="hidden sm:inline text-[10px] sm:text-[11.5px] font-medium text-text-tertiary truncate">
                  {board.subtitle}
                </span>
              )}
            </button>
          )}
        </div>

        {/* RIGHT ZONE: Focus Mode, Share, Discover, Affirmations Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Focus Mode Switch */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-alt border border-border">
            <span className="text-[11px] font-black tracking-wider uppercase text-text-secondary select-none">
              Focus Mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={focusMode}
              onClick={() => setFocusMode(!focusMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                focusMode ? 'bg-primary' : 'bg-border'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-surface transition-transform duration-200 shadow-xs ${
                  focusMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Share / Export */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-surface-alt hover:bg-surface border border-border text-text-primary transition-all cursor-pointer shadow-xs min-h-[40px]"
            title="Share or Export Canvas (PNG/PDF)"
          >
            <IconShare size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Discover Button */}
          <button
            type="button"
            onClick={onOpenDiscover}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-surface-alt hover:bg-surface border border-border text-text-primary transition-all cursor-pointer shadow-xs min-h-[40px]"
            title="Discover community inspiration boards"
          >
            <IconSparkles size={15} className="text-primary" />
            <span className="hidden md:inline">Discover</span>
          </button>

          {/* RIGHT SIDEBAR (Affirmations) Toggle */}
          <button
            type="button"
            onClick={() => setRightSidebarOpen((prev) => !prev)}
            aria-label="Toggle Daily Affirmations Panel"
            className="w-10 h-10 rounded-2xl bg-surface-alt border border-border text-text-primary hover:bg-surface hover:border-border-alt transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            title="Toggle affirmations panel"
          >
            {rightSidebarOpen ? (
              <IconLayoutSidebarRightCollapse size={20} />
            ) : (
              <IconLayoutSidebarRightExpand size={20} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
