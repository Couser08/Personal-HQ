import React, { useState } from 'react';
import { 
  IconCopy, IconCheck, IconTrash, 
  IconShieldCheck, IconClock, IconDeviceDesktop, IconDeviceMobile,
  IconLayersIntersect, IconArrowUpRight, IconFileCode, IconChevronDown
} from '@tabler/icons-react';
import { type BugReport, type BugReportStatus } from '../../../store/types';
import { 
  getRouteMeta, 
  formatRelativeTime, 
  parseUserAgent, 
  SEVERITY_CONFIG, 
  getStatusStyle,
  CATEGORY_ICONS,
  LIFECYCLE_STATUSES
} from '../utils/bugReportHelpers';
import { useToastStore } from '../../../store/useToastStore';
import { formatReportMarkdown } from '../../../store/useBugReportStore';

interface BugReportCardProps {
  report: BugReport;
  onSelect: (report: BugReport) => void;
  onUpdateStatus: (id: string, status: BugReportStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onZoomScreenshot?: (report: BugReport) => void;
}

export const BugReportCard: React.FC<BugReportCardProps> = ({
  report,
  onSelect,
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
  const ua = parseUserAgent(report.userAgent);

  const handleCopyMarkdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = formatReportMarkdown(report);
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      addToast('Copied', 'Report Markdown copied to clipboard', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      addToast('Copy Failed', 'Failed to copy markdown to clipboard', 'error');
    }
  };

  const handleCopySelector = async (e: React.MouseEvent, selector: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(selector);
      addToast('Selector Copied', selector, 'success');
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

  const handleToggleQuickResolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: BugReportStatus = (report.status === 'verified_done' || report.status === 'Resolved') ? 'open' : 'verified_done';
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(report.id, nextStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete report "${report.title}"?`)) {
      onDelete(report.id);
    }
  };

  const reporterEmail = report.userEmail || report.reporter || 'Anonymous User';
  const reporterInitial = reporterEmail.charAt(0).toUpperCase();

  const el = report.elementInfo;
  const isGroup = el?.isGroup && (el.groupCount || 0) > 1;
  const isResolved = report.status === 'verified_done' || report.status === 'Resolved' || report.status === 'Closed';

  return (
    <div
      onClick={() => onSelect(report)}
      className="group relative flex flex-col justify-between bg-surface/90 hover:bg-surface border border-border/70 hover:border-primary/40 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md text-left"
    >
      {/* Top Accent Stripe based on Status */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
          report.status === 'open' || report.status === 'Open' ? 'bg-amber-500' :
          report.status === 'in_review' || report.status === 'In Progress' ? 'bg-blue-500' :
          report.status === 'fixed_pending_verification' ? 'bg-purple-500' :
          isResolved ? 'bg-emerald-500' : 'bg-rose-500'
        }`} 
      />

      {/* ── CARD HEADER ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          
          {/* Severity + Category + Route Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Severity Pill */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${severityStyle.pillClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dotClass}`} />
              <span>{severityStyle.label}</span>
            </span>

            {/* Category Pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-alt/70 text-text-secondary border border-border/60">
              <span>{categoryIcon}</span>
              <span>{report.category}</span>
            </span>

            {/* Module / Route Breadcrumb */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-alt/70 text-text-primary border border-border/60">
              <span>{routeMeta.icon}</span>
              <span>{routeMeta.label}</span>
            </span>
          </div>

          {/* Status Quick Changer Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsStatusMenuOpen(!isStatusMenuOpen);
              }}
              disabled={isUpdatingStatus}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${statusStyle.pillClass}`}
              title="Click to quickly change status"
            >
              <span className={`w-2 h-2 rounded-full ${statusStyle.dotClass}`} />
              <span>{statusStyle.label}</span>
              <IconChevronDown size={13} className={`opacity-70 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Status Dropdown Popover */}
            {isStatusMenuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-2xl shadow-xl p-1.5 z-40 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
              >
                {LIFECYCLE_STATUSES.map((st) => {
                  const cfg = getStatusStyle(st);
                  const isCurrent = report.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={(e) => handleStatusChange(e, st)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                        isCurrent ? 'bg-primary/10 text-primary' : 'hover:bg-surface-alt text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                        {cfg.label}
                      </span>
                      {isCurrent && <IconCheck size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CARD BODY: MEDIA & CONTENT ── */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-1 items-start">
          
          {/* Left: Location & Technical Diagnostics Box (Zero Image Egress) */}
          <div className="sm:col-span-4 w-full">
            <div className="w-full h-full min-h-[110px] rounded-2xl bg-surface-alt/70 border border-border/70 p-3 flex flex-col justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Target Location</span>
                <div className="flex items-center gap-1 text-xs font-bold text-text-primary truncate">
                  <span>{routeMeta.icon}</span>
                  <span className="truncate">{report.sectionName || el?.sectionName || routeMeta.label}</span>
                </div>
                <div className="text-[11px] font-mono text-text-muted truncate">
                  {report.pageRoute || report.route || '/dashboard'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/40">
                {el?.tag && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-primary font-bold">
                    &lt;{el.tag}&gt;
                  </span>
                )}
                {report.elementInfo?.boundingRect && (
                  <span className="text-[10px] font-mono text-text-muted">
                    {Math.round(report.elementInfo.boundingRect.width)}×{Math.round(report.elementInfo.boundingRect.height)}px
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description & Technical Diagnostics */}
          <div className="sm:col-span-8 flex flex-col justify-between gap-3 min-w-0">
            <div>
              {/* Title */}
              <h3 className="text-[15px] font-black text-text-primary leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {report.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed font-normal">
                {report.description || 'No additional explanation provided.'}
              </p>
            </div>

            {/* Fix Status Banner (if fixed or verified) */}
            {report.fixedInFiles && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono truncate">
                <IconFileCode size={13} className="shrink-0" />
                <span className="truncate"><strong>Fixed in:</strong> {Array.isArray(report.fixedInFiles) ? report.fixedInFiles.join(', ') : report.fixedInFiles}</span>
              </div>
            )}

            {/* DOM Element & Tech Diagnostics Badges */}
            <div className="flex flex-col gap-1.5 pt-0.5">
              {el?.selector && (
                <div className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl bg-surface-alt/70 border border-border/60 text-[11px] font-mono overflow-hidden">
                  <div className="flex items-center gap-1.5 truncate text-text-secondary min-w-0">
                    <span className="text-primary font-bold shrink-0">🎯</span>
                    <span className="truncate font-semibold text-text-primary" title={el.selector}>
                      {el.selector}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCopySelector(e, el.selector)}
                    className="p-1 hover:bg-surface rounded text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
                    title="Copy CSS Selector"
                  >
                    <IconCopy size={12} />
                  </button>
                </div>
              )}

              {/* Meta strip: Tag, Geometry, Snippet, Device */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-text-muted">
                {el?.tag && (
                  <span className="px-2 py-0.5 rounded-md bg-surface border border-border text-text-primary font-bold">
                    &lt;{el.tag}&gt;
                  </span>
                )}

                {isGroup && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold">
                    <IconLayersIntersect size={11} /> {el.groupCount} Nodes Linked
                  </span>
                )}

                {el?.boundingRect && (
                  <span className="px-2 py-0.5 rounded-md bg-surface border border-border text-text-secondary">
                    x:{Math.round(el.boundingRect.x)} y:{Math.round(el.boundingRect.y)}
                  </span>
                )}

                {/* Device Pill */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-text-secondary">
                  {ua.isMobile ? <IconDeviceMobile size={11} /> : <IconDeviceDesktop size={11} />}
                  <span>{ua.os} · {ua.browser}</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CARD FOOTER ── */}
      <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap text-xs">
        
        {/* Reporter info & Date */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
            {reporterInitial}
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] truncate">
            <span className="font-medium text-text-secondary truncate max-w-[140px] sm:max-w-[200px]" title={reporterEmail}>
              {reporterEmail}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 shrink-0">
              <IconClock size={12} /> {formatRelativeTime(report.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Resolve / Reopen Button */}
          <button
            type="button"
            onClick={handleToggleQuickResolve}
            disabled={isUpdatingStatus}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isResolved
                ? 'bg-surface-alt hover:bg-surface border border-border text-text-secondary'
                : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/30'
            }`}
            title={isResolved ? 'Reopen Bug Report' : 'Verify & Mark Done'}
          >
            {isResolved ? <IconShieldCheck size={13} /> : <IconCheck size={13} stroke={2.5} />}
            <span>{isResolved ? 'Reopen' : 'Verify Done'}</span>
          </button>

          {/* Copy MD Button */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded-xl bg-surface hover:bg-surface-alt border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Copy Report Markdown"
          >
            {isCopied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
            title="Delete Report"
          >
            <IconTrash size={14} />
          </button>

          {/* Inspect Arrow */}
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-text-on-accent transition-colors flex items-center justify-center">
            <IconArrowUpRight size={14} stroke={2.5} />
          </div>
        </div>

      </div>
    </div>
  );
};
