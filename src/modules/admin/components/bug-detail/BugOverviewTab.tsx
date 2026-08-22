import React from 'react';
import { IconZoomIn, IconCode } from '@tabler/icons-react';
import type { BugReport } from '../../../../store/types';

interface BugOverviewTabProps {
  report: BugReport;
  setIsZoomModalOpen: (open: boolean) => void;
}

export const BugOverviewTab: React.FC<BugOverviewTabProps> = ({
  report,
  setIsZoomModalOpen,
}) => {
  const el = report.elementInfo;

  return (
    <div className="space-y-5 animate-in fade-in duration-150 text-left">
      {/* Visual Snapshot */}
      {report.screenshotData ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              📷 High-Resolution Viewport Capture
            </span>
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <IconZoomIn size={14} /> Fullscreen Zoom
            </button>
          </div>

          <div
            onClick={() => setIsZoomModalOpen(true)}
            className="relative bg-background rounded-3xl border border-border/80 p-3 max-h-80 overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-inner"
          >
            <img
              src={report.screenshotData}
              alt={report.title}
              className="max-h-72 w-auto object-contain rounded-2xl group-hover:scale-102 transition-transform"
            />

            {el?.viewport && (
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-xl bg-black/80 text-white text-xs font-mono font-bold backdrop-blur-md border border-white/10">
                Viewport: {el.viewport.width}×{el.viewport.height}px
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-surface-alt/40 border border-dashed border-border text-center text-text-muted">
          <IconCode size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold">No screenshot captured for this report.</p>
        </div>
      )}

      {/* Description */}
      <div className="p-5 rounded-3xl bg-surface border border-border/70 space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
          Bug Description &amp; Details
        </span>
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
          {report.description || 'No additional explanation provided.'}
        </p>
      </div>

      {/* Text Snippet inside Element (if captured) */}
      {el?.innerTextSnippet && (
        <div className="p-4 rounded-3xl bg-surface-alt/50 border border-border/70 space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
            Target Element Text Snippet
          </span>
          <blockquote className="text-xs font-mono text-text-primary bg-surface p-3 rounded-2xl border border-border/50 break-words">
            "{el.innerTextSnippet}"
          </blockquote>
        </div>
      )}
    </div>
  );
};
