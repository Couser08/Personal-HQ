import React from 'react';
import { IconUser, IconClock } from '@tabler/icons-react';
import { type BugReport, type BugReportStatus } from '../../../../store/types';
import {
  getRouteMeta,
  formatRelativeTime,
  SEVERITY_CONFIG,
  getStatusStyle,
  CATEGORY_ICONS,
  LIFECYCLE_STATUSES,
} from '../../utils/bugReportHelpers';

interface BugDetailHeaderProps {
  report: BugReport;
  handleStatusChange: (status: BugReportStatus) => void;
}

export const BugDetailHeader: React.FC<BugDetailHeaderProps> = ({
  report,
  handleStatusChange,
}) => {
  const routeMeta = getRouteMeta(report.route);
  const severityStyle = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.Medium;
  const statusStyle = getStatusStyle(report.status);
  const categoryIcon = CATEGORY_ICONS[report.category] || '📌';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-alt/50 border border-border/70">
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${severityStyle.pillClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dotClass}`} />
            {severityStyle.label} Severity
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface border border-border text-text-secondary">
            <span>{categoryIcon}</span>
            <span>{report.category}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface border border-border text-text-primary">
            <span>{routeMeta.icon}</span>
            <span>{routeMeta.label}</span>
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-text-primary leading-tight">
          {report.title}
        </h2>

        <p className="text-xs text-text-muted flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-mono">
            <IconUser size={13} /> {report.userEmail || report.reporter || 'Anonymous'}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <IconClock size={13} /> {new Date(report.createdAt).toLocaleString()} (
            {formatRelativeTime(report.createdAt)})
          </span>
        </p>
      </div>

      {/* Status Controller */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Workflow Status
          </span>
          <select
            value={report.status}
            onChange={(e) => handleStatusChange(e.target.value as BugReportStatus)}
            className={`bg-surface border font-bold text-xs rounded-2xl px-3 py-2 focus:outline-none focus:border-primary shadow-xs cursor-pointer ${statusStyle.pillClass}`}
          >
            {LIFECYCLE_STATUSES.map((st) => {
              const cfg = getStatusStyle(st);
              return (
                <option key={st} value={st}>
                  {cfg.icon} {cfg.label}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};
