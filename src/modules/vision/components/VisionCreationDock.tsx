import React, { useState } from 'react';
import {
  IconPlus,
  IconPhoto,
  IconTypography,
  IconTarget,
  IconVolume,
  IconCode,
  IconHexagon,
  IconPalette,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionNodeType } from '../../../store/types';

interface VisionCreationDockProps {
  onAddNodeType: (type: VisionNodeType) => void;
  onOpenThemeMenu?: () => void;
}

export const VisionCreationDock: React.FC<VisionCreationDockProps> = ({
  onAddNodeType,
}) => {
  const { canvasTheme, setCanvasTheme } = useAppStore();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const tools: Array<{
    type: VisionNodeType;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    { type: 'image', label: 'Image', icon: <IconPhoto size={18} />, color: 'text-sky-500' },
    { type: 'text', label: 'Text', icon: <IconTypography size={18} />, color: 'text-pink-500' },
    { type: 'goal', label: 'Goal', icon: <IconTarget size={18} />, color: 'text-blue-500' },
    { type: 'audio', label: 'Audio', icon: <IconVolume size={18} />, color: 'text-emerald-500' },
    { type: 'embed', label: 'Embed', icon: <IconCode size={18} />, color: 'text-purple-500' },
    { type: 'shape', label: 'Shape', icon: <IconHexagon size={18} />, color: 'text-amber-500' },
  ];

  const handleCreate = (type: VisionNodeType) => {
    onAddNodeType(type);
    setIsOpenMobile(false);
  };

  return (
    <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
      {/* Main Dock Container */}
      <div className="bg-surface/90 backdrop-blur-2xl border border-border/80 rounded-3xl p-1.5 sm:p-2 shadow-xl flex flex-col items-center gap-1.5 sm:gap-2">
        {/* Main Plus Button */}
        <button
          type="button"
          onClick={() => setIsOpenMobile((prev) => !prev)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-text-primary text-text-on-accent flex items-center justify-center shadow-md hover:opacity-90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Add Node to Canvas"
          aria-label="Add Node to Canvas"
        >
          <IconPlus size={22} className={`transition-transform duration-200 ${isOpenMobile ? 'rotate-45' : ''}`} />
        </button>

        {/* Desktop Visible / Mobile Collapsible Items */}
        <div className={`flex flex-col items-center gap-1 sm:gap-1.5 transition-all duration-300 ${
          isOpenMobile ? 'flex' : 'hidden sm:flex'
        }`}>
          {tools.map((tool) => (
            <button
              key={tool.type}
              type="button"
              onClick={() => handleCreate(tool.type)}
              className="group relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-all cursor-pointer"
              title={`Add ${tool.label} Node`}
              aria-label={`Add ${tool.label} Node`}
            >
              <span className={`transition-transform group-hover:scale-110 ${tool.color}`}>
                {tool.icon}
              </span>
              <span className="text-[9.5px] font-black uppercase tracking-tighter text-text-tertiary group-hover:text-text-primary mt-0.5 leading-none">
                {tool.label}
              </span>

              {/* Tooltip on desktop */}
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-xl bg-text-primary text-text-on-accent text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg hidden sm:block">
                Add {tool.label}
              </div>
            </button>
          ))}

          {/* Palette (Canvas Theme) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowThemePicker((prev) => !prev)}
              className="group relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-all cursor-pointer"
              title="Canvas Grid & Style"
              aria-label="Canvas Grid & Style"
            >
              <IconPalette size={18} className="text-violet-500 group-hover:scale-110 transition-transform" />
              <span className="text-[9.5px] font-black uppercase tracking-tighter text-text-tertiary group-hover:text-text-primary mt-0.5 leading-none">
                Palette
              </span>
            </button>

            {/* Theme Dropdown Popover */}
            {showThemePicker && (
              <div className="absolute left-full bottom-0 ml-3 p-2 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col gap-1.5 z-30 min-w-[140px]">
                <span className="text-[10px] font-black uppercase text-text-tertiary px-2 py-1">
                  Grid Pattern
                </span>
                {(['dots', 'grid', 'blank'] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => {
                      setCanvasTheme(theme);
                      setShowThemePicker(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-left text-[12px] font-bold capitalize transition-all cursor-pointer ${
                      canvasTheme === theme
                        ? 'bg-text-primary text-text-on-accent'
                        : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                    }`}
                  >
                    {theme === 'dots' ? '● Dot Matrix' : theme === 'grid' ? '# Square Grid' : '○ Clean Blank'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
