import React, { useState } from 'react';
import { 
  IconZoomIn, IconCode, IconCopy, IconCheck, IconTrash, 
  IconChevronDown, IconClock, IconLayersIntersect,
  IconArrowUpRight, IconFileCode
} from '@tabler/icons-react';
import { type BugReport, type BugReportStatus } from '../../../store/types';
import { 
  getRouteMeta, 
  formatRelativeTime, 
  SEVERITY_CONFIG, 
  getStatusStyle, 
  CATEGORY_ICONS,
  LIFECYCLE_STATUSES 
} from '../utils/bugReportHelpers';
import { useToastStore } from '../../../store/useToastStore';

interface BugReportListItemProps {
  report: BugReport;
  onSelect: (report: BugReport) => void;
  onZoomScreenshot: (report: BugReport) => void;
  onUpdateStatus: (id: string, status: BugReportStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const BugReportListItem: React.FC<BugReportListItemProps> = ({
  report,
  onSelect,
  onZoomScreenshot,
  onUpdateStatus,
  onDelete,
}) => {
  const addToast = useToastStore((s) => s.addToast);
  const [isCopied, setIsCopied] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const routeMeta = getRouteMeta(report.route);
  const severityStyle = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.Medium;
  const statusStyle = getStatusStyle(report.status);
  const categoryIcon = CATEGORY_ICONS[report.category] || '📌';

  const handleCopyMarkdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = report.markdownContent || `# Bug: ${report.title}\n\n${report.description}`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      addToast('Copied', 'Report Markdown copied', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleStatusChange = async (e: React.MouseEvent, newStatus: BugReportStatus) => {
    e.stopPropagation();
    setIsStatusMenuOpen(false);
    if (newStatus === report.status) return;

    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(report.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete report "${report.title}"?`)) {
      onDelete(report.id);
    }
  };

  const el = report.elementInfo;
  const isGroup = el?.isGroup && (el.groupCount || 0) > 1;

  return (
    <div
      onClick={() => onSelect(report)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-surface/90 hover:bg-surface border border-border/70 hover:border-primary/40 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm text-left"
    >
      {/* Left section: Thumbnail + Details */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        
        {/* Thumbnail Preview */}
        {report.screenshotData ? (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onZoomScreenshot(report);
            }}
            className="group/thumb relative w-16 h-12 rounded-xl overflow-hidden bg-background border border-border shrink-0 flex items-center justify-center cursor-zoom-in"
          >
            <img src={report.screenshotData} alt="Thumb" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
              <IconZoomIn size={14} className="text-white" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-12 rounded-xl bg-surface-alt/70 border border-dashed border-border flex items-center justify-center text-text-muted shrink-0">
            <IconCode size={16} />
          </div>
        )}

        {/* Content & Metadata */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Severity */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${severityStyle.pillClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dotClass}`} />
              {severityStyle.label}
            </span>

            {/* Category */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-alt text-text-secondary border border-border/60">
              <span>{categoryIcon}</span>
              <span>{report.category}</span>
            </span>

            {/* Route */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-alt text-text-primary border border-border/60">
              <span>{routeMeta.icon}</span>
              <span>{routeMeta.label}</span>
            </span>

            {isGroup && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <IconLayersIntersect size={10} /> {el?.groupCount} Nodes
              </span>
            )}

            {report.fixedInFiles && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 truncate max-w-[160px]">
                <IconFileCode size={10} />
                <span className="truncate">{Array.isArray(report.fixedInFiles) ? report.fixedInFiles.join(', ') : report.fixedInFiles}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-xs sm:text-sm font-bold text-text-primary group-hover:text-primary transition-colors truncate">
            {report.title}
          </h4>

          {/* Selector snippet or short desc */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted truncate">
            {el?.selector ? (
              <span className="truncate">🎯 {el.selector}</span>
            ) : (
              <span className="truncate">{report.description || 'No description'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Status & Actions */}
      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
        {/* Time */}
        <span className="text-[11px] text-text-muted flex items-center gap-1 shrink-0">
          <IconClock size={12} />
          {formatRelativeTime(report.createdAt)}
        </span>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStatusMenuOpen(!isStatusMenuOpen);
            }}
            disabled={isUpdatingStatus}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${statusStyle.pillClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`} />
            <span>{statusStyle.label}</span>
            <IconChevronDown size={12} className="opacity-70" />
          </button>

          {isStatusMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-xl shadow-xl p-1 z-40 flex flex-col gap-0.5"
            >
              {LIFECYCLE_STATUSES.map((st) => {
                const cfg = getStatusStyle(st);
                const isCurrent = report.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={(e) => handleStatusChange(e, st)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-left cursor-pointer ${
                      isCurrent ? 'bg-primary/10 text-primary' : 'hover:bg-surface-alt text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                      {cfg.label}
                    </span>
                    {isCurrent && <IconCheck size={12} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action icons */}
        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="p-1.5 rounded-lg bg-surface hover:bg-surface-alt border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Copy Markdown"
        >
          {isCopied ? <IconCheck size={13} className="text-emerald-500" /> : <IconCopy size={13} />}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
          title="Delete Report"
        >
          <IconTrash size={13} />
        </button>

        <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-text-on-accent transition-colors">
          <IconArrowUpRight size={13} stroke={2.5} />
        </div>
      </div>
    </div>
  );
};
