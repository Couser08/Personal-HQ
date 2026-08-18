import React from 'react';
import { 
  IconZoomIn, IconClock, 
  IconArrowRight, IconCheck,
  IconCircleDot
} from '@tabler/icons-react';
import { type BugReport, type BugReportStatus } from '../../../store/types';
import { 
  getRouteMeta, 
  formatRelativeTime, 
  SEVERITY_CONFIG, 
  CATEGORY_ICONS,
  LIFECYCLE_STATUSES
} from '../utils/bugReportHelpers';

interface BugReportKanbanProps {
  reports: BugReport[];
  onSelect: (report: BugReport) => void;
  onZoomScreenshot: (report: BugReport) => void;
  onUpdateStatus: (id: string, status: BugReportStatus) => Promise<void>;
}

const COLUMN_CONFIG: Record<string, { title: string; color: string; bg: string; dot: string; icon: string }> = {
  open: { title: 'Open / Triage', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-500', icon: '🟡' },
  in_review: { title: 'In Review', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', dot: 'bg-blue-500', icon: '🔵' },
  fixed_pending_verification: { title: 'Fixed (Verify QA)', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30', dot: 'bg-purple-500', icon: '🟣' },
  verified_done: { title: 'Verified & Done', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-500', icon: '🟢' },
  reopened: { title: 'Reopened', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30', dot: 'bg-rose-500', icon: '🔴' },
};

function normalizeForColumn(status: BugReportStatus): string {
  const s = String(status).toLowerCase();
  if (s === 'open') return 'open';
  if (s === 'in review' || s === 'in progress' || s === 'in_review') return 'in_review';
  if (s === 'fixed_pending_verification' || s === 'pending_verification') return 'fixed_pending_verification';
  if (s === 'resolved' || s === 'closed' || s === 'verified_done' || s === 'done') return 'verified_done';
  if (s === 'reopened') return 'reopened';
  return 'open';
}

export const BugReportKanban: React.FC<BugReportKanbanProps> = ({
  reports,
  onSelect,
  onZoomScreenshot,
  onUpdateStatus,
}) => {
  const columns: BugReportStatus[] = LIFECYCLE_STATUSES;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 custom-scrollbar">
      {columns.map((colKey) => {
        const colCfg = COLUMN_CONFIG[colKey] || COLUMN_CONFIG.open;
        const colReports = reports.filter((r) => normalizeForColumn(r.status) === colKey);

        return (
          <div
            key={colKey}
            className="flex flex-col gap-3 p-3.5 rounded-3xl bg-surface-alt/40 border border-border/70 min-w-[240px] text-left"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1.5 py-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${colCfg.dot}`} />
                <h3 className={`text-xs font-black uppercase tracking-wider ${colCfg.color}`}>
                  {colCfg.title}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${colCfg.bg} ${colCfg.color}`}>
                {colReports.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-2.5 min-h-[300px]">
              {colReports.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-border/60 rounded-2xl text-text-muted/60 text-center">
                  <IconCircleDot size={20} className="mb-1 opacity-40" />
                  <span className="text-[11px] font-medium italic">No reports</span>
                </div>
              ) : (
                colReports.map((report) => {
                  const severityStyle = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.Medium;
                  const routeMeta = getRouteMeta(report.route);
                  const categoryIcon = CATEGORY_ICONS[report.category] || '📌';
                  const el = report.elementInfo;

                  return (
                    <div
                      key={report.id}
                      onClick={() => onSelect(report)}
                      className="group relative flex flex-col gap-2.5 p-3.5 rounded-2xl bg-surface hover:bg-surface-alt/70 border border-border/70 hover:border-primary/40 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${severityStyle.pillClass}`}>
                            <span className={`w-1 h-1 rounded-full ${severityStyle.dotClass}`} />
                            {severityStyle.label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-alt text-text-secondary border border-border/60 font-bold">
                            {categoryIcon}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-text-muted font-bold truncate max-w-[90px]">
                          {routeMeta.icon} /{report.route}
                        </span>
                      </div>

                      {/* Thumbnail (if available) */}
                      {report.screenshotData && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onZoomScreenshot(report);
                          }}
                          className="relative w-full h-24 rounded-xl overflow-hidden bg-background border border-border flex items-center justify-center cursor-zoom-in group/img"
                        >
                          <img src={report.screenshotData} alt="Snapshot" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <IconZoomIn size={14} className="text-white" />
                          </div>
                        </div>
                      )}

                      {/* Title */}
                      <h4 className="text-xs font-black text-text-primary leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {report.title}
                      </h4>

                      {/* Selector / Target summary */}
                      {el?.selector && (
                        <div className="text-[10px] font-mono text-text-muted bg-surface-alt/70 px-2 py-1 rounded-lg truncate border border-border/50">
                          🎯 {el.selector}
                        </div>
                      )}

                      {/* Fix indicator badge if fix files are present */}
                      {report.fixedInFiles && (
                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 truncate flex items-center gap-1">
                          <IconCheck size={11} stroke={3} />
                          <span className="truncate">Fixed: {Array.isArray(report.fixedInFiles) ? report.fixedInFiles.join(', ') : report.fixedInFiles}</span>
                        </div>
                      )}

                      {/* Footer: Date & Quick Pipeline Mover */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-text-muted">
                        <span className="flex items-center gap-1 font-mono">
                          <IconClock size={11} /> {formatRelativeTime(report.createdAt)}
                        </span>

                        {/* Fast Move Forward Button */}
                        {colKey === 'open' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(report.id, 'in_review');
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold transition-colors cursor-pointer"
                            title="Move to In Review"
                          >
                            <span>Review</span>
                            <IconArrowRight size={10} />
                          </button>
                        )}

                        {colKey === 'in_review' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(report.id, 'fixed_pending_verification');
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white font-bold transition-colors cursor-pointer"
                            title="Mark as Fixed & Ready for QA"
                          >
                            <span>Fixed</span>
                            <IconArrowRight size={10} />
                          </button>
                        )}

                        {colKey === 'fixed_pending_verification' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(report.id, 'verified_done');
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold transition-colors cursor-pointer"
                            title="Verify and Mark Done"
                          >
                            <IconCheck size={10} />
                            <span>Verify</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
