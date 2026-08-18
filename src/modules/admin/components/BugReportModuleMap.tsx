import React, { useState, useMemo } from 'react';
import { 
  IconChevronDown, IconChevronUp, IconAlertTriangle,
  IconClock, IconZoomIn, IconCode
} from '@tabler/icons-react';
import { type BugReport } from '../../../store/types';
import { 
  getRouteMeta, 
  formatRelativeTime, 
  SEVERITY_CONFIG, 
  STATUS_CONFIG,
  isBugResolved
} from '../utils/bugReportHelpers';

interface BugReportModuleMapProps {
  reports: BugReport[];
  onSelect: (report: BugReport) => void;
  onZoomScreenshot: (report: BugReport) => void;
}

export const BugReportModuleMap: React.FC<BugReportModuleMapProps> = ({
  reports,
  onSelect,
  onZoomScreenshot,
}) => {
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const moduleGroups = useMemo(() => {
    const groups: Record<string, { meta: any; reports: BugReport[]; resolved: number; open: number; critical: number }> = {};

    reports.forEach((r) => {
      const cleanRoute = (r.route || 'dashboard').replace(/^\//, '').toLowerCase();
      if (!groups[cleanRoute]) {
        groups[cleanRoute] = {
          meta: getRouteMeta(cleanRoute),
          reports: [],
          resolved: 0,
          open: 0,
          critical: 0,
        };
      }

      groups[cleanRoute].reports.push(r);
      if (isBugResolved(r.status)) {
        groups[cleanRoute].resolved++;
      } else {
        groups[cleanRoute].open++;
        if (r.severity === 'Critical') {
          groups[cleanRoute].critical++;
        }
      }
    });

    return Object.entries(groups).sort((a, b) => {
      // Sort modules with most open/critical issues first
      if (b[1].critical !== a[1].critical) return b[1].critical - a[1].critical;
      return b[1].open - a[1].open;
    });
  }, [reports]);

  const toggleCollapse = (route: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [route]: !prev[route],
    }));
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      {moduleGroups.map(([routeKey, grp]) => {
        const isCollapsed = !!collapsedModules[routeKey];
        const total = grp.reports.length;
        const progressPct = total > 0 ? Math.round((grp.resolved / total) * 100) : 0;
        const isFullyResolved = grp.open === 0 && total > 0;

        return (
          <div
            key={routeKey}
            className={`rounded-3xl bg-surface/90 border transition-all overflow-hidden backdrop-blur-md ${
              grp.critical > 0
                ? 'border-rose-500/40 shadow-xs'
                : isFullyResolved
                ? 'border-emerald-500/30'
                : 'border-border/70'
            }`}
          >
            {/* Module Accordion Header */}
            <div
              onClick={() => toggleCollapse(routeKey)}
              className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-surface-alt/40 transition-colors select-none flex-wrap gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-surface-alt border border-border/60 flex items-center justify-center text-xl shrink-0">
                  {grp.meta.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-text-primary">
                      {grp.meta.label}
                    </h3>
                    <code className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface-alt text-text-muted border border-border/50">
                      /{routeKey}
                    </code>
                    {grp.critical > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                        <IconAlertTriangle size={11} /> {grp.critical} Critical
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary font-medium">
                    {grp.resolved} of {total} issues resolved ({progressPct}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar & Badges */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-28 sm:w-40 flex flex-col gap-1">
                  <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden border border-border/40">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isFullyResolved ? 'bg-emerald-500' : progressPct > 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-surface-alt border border-border/60 text-text-primary">
                    {total} reports
                  </span>
                  <div className="p-1 rounded-xl bg-surface-alt text-text-secondary">
                    {isCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Cards Container */}
            {!isCollapsed && (
              <div className="p-4 sm:p-5 pt-0 border-t border-border/40 space-y-3 mt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  {grp.reports.map((report) => {
                    const sevStyle = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.Medium;
                    const stStyle = STATUS_CONFIG[report.status] || STATUS_CONFIG.open;
                    const el = report.elementInfo;

                    return (
                      <div
                        key={report.id}
                        onClick={() => onSelect(report)}
                        className="group flex flex-col justify-between gap-3 p-4 rounded-2xl bg-surface-alt/40 hover:bg-surface border border-border/60 hover:border-primary/40 transition-all cursor-pointer shadow-2xs text-left"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${sevStyle.pillClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sevStyle.dotClass}`} />
                              {sevStyle.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${stStyle.pillClass}`}>
                              {stStyle.label}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                            {report.title}
                          </h4>

                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {report.description || 'No description provided.'}
                          </p>

                          {el?.selector && (
                            <div className="text-[10px] font-mono text-text-muted mt-2 bg-surface px-2 py-1 rounded-lg truncate border border-border/40">
                              🎯 {el.selector}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-text-muted">
                          <span className="flex items-center gap-1 font-mono">
                            <IconClock size={12} /> {formatRelativeTime(report.createdAt)}
                          </span>

                          {report.screenshotData ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onZoomScreenshot(report);
                              }}
                              className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <IconZoomIn size={12} /> Snapshot
                            </button>
                          ) : (
                            <span className="text-text-muted flex items-center gap-1 font-mono text-[10px]">
                              <IconCode size={11} /> DOM Only
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
