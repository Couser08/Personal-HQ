import React from 'react';
import {
  IconArrowLeft,
  IconCloudCheck,
  IconHistory,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDownload,
  IconShare,
} from '@tabler/icons-react';
import { type Mindmap } from '../../../store/useAppStore';

interface MindmapHeaderProps {
  activeMindmap: Mindmap;
  onBack: () => void;
  onResetToDefault: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MindmapHeader: React.FC<MindmapHeaderProps> = ({
  activeMindmap,
  onBack,
  onResetToDefault,
  fileInputRef,
  handleImportJson,
}) => {
  return (
    <div className="min-h-[3.5rem] py-2 border-b border-border/40 px-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/30 backdrop-blur-md relative z-20 shrink-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg border border-border/50 bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary border-none cursor-pointer"
          title="Back to Catalog"
        >
          <IconArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-left leading-none">
          <h3 className="font-extrabold text-sm text-text-primary">{activeMindmap.title}</h3>
          <p className="text-[10px] text-text-muted mt-0.5">Edited just now</p>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar justify-start sm:justify-end">
        <IconCloudCheck className="w-5 h-5 text-emerald-500 shrink-0" title="All changes saved to local space" />
        <button
          onClick={onResetToDefault}
          className="w-8 h-8 rounded-lg border border-border/40 bg-surface text-text-muted hover:text-rose-500 flex items-center justify-center transition-colors shrink-0 border-none cursor-pointer"
          title="Reset Mindmap data layout to default hierarchy"
        >
          <IconHistory className="w-4 h-4" />
        </button>
        <div className="flex gap-0.5 border-l border-r border-border/50 px-2.5 shrink-0">
          <button
            className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted shrink-0 border-none bg-transparent cursor-pointer"
            title="Undo"
          >
            <IconArrowBackUp className="w-4.5 h-4.5" />
          </button>
          <button
            className="w-7 h-7 rounded hover:bg-surface-alt flex items-center justify-center text-text-muted shrink-0 border-none bg-transparent cursor-pointer"
            title="Redo"
          >
            <IconArrowForwardUp className="w-4.5 h-4.5" />
          </button>
        </div>
        <input type="file" accept=".json" ref={fileInputRef as any} onChange={handleImportJson} className="hidden" />
        <button
          className="px-4 py-1.5 rounded-full bg-surface hover:bg-surface-alt text-text-primary border border-border font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
          onClick={() => fileInputRef.current?.click()}
          title="Import JSON Mindmap"
        >
          <IconDownload className="w-3.5 h-3.5 rotate-180" /> Import
        </button>
        <button
          className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-text-on-accent font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 border-none"
          onClick={() => alert('Sharing features are synced locally. Export JSON/SVG to backup.')}
        >
          <IconShare className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  );
};
