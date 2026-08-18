import React from 'react';
import { IconBug, IconClock, IconCircleCheck, IconLayersSubtract, IconShieldCheck } from '@tabler/icons-react';

interface BugReportStatsProps {
  stats: {
    total: number;
    open: number;
    inReview: number;
    pendingVerification: number;
    verifiedDone: number;
    reopened: number;
  };
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const BugReportStats: React.FC<BugReportStatsProps> = ({
  stats,
  activeFilter,
  onFilterChange,
}) => {
  const kpis = [
    {
      id: 'All',
      label: 'Total Reports',
      count: stats.total,
      icon: <IconLayersSubtract className="w-5 h-5 text-text-muted" />,
      accent: 'text-text-primary',
      bgGlow: 'hover:border-primary/40',
      activeRing: activeFilter === 'All' ? 'ring-2 ring-primary/40 border-primary' : '',
    },
    {
      id: 'fixed_pending_verification',
      label: 'Pending Verification',
      count: stats.pendingVerification,
      icon: <IconShieldCheck className="w-5 h-5 text-purple-500 animate-pulse" />,
      accent: 'text-purple-500 font-black',
      bgGlow: 'hover:border-purple-500/40',
      activeRing: activeFilter === 'fixed_pending_verification' ? 'ring-2 ring-purple-500/40 border-purple-500 bg-purple-500/5' : '',
    },
    {
      id: 'open',
      label: 'Open & Triage',
      count: stats.open + stats.reopened,
      icon: <IconBug className="w-5 h-5 text-amber-500" />,
      accent: 'text-amber-500',
      bgGlow: 'hover:border-amber-500/40',
      activeRing: (activeFilter === 'open' || activeFilter === 'Open') ? 'ring-2 ring-amber-500/40 border-amber-500 bg-amber-500/5' : '',
    },
    {
      id: 'in_review',
      label: 'In Review',
      count: stats.inReview,
      icon: <IconClock className="w-5 h-5 text-blue-500" />,
      accent: 'text-blue-500',
      bgGlow: 'hover:border-blue-500/40',
      activeRing: (activeFilter === 'in_review' || activeFilter === 'In Progress') ? 'ring-2 ring-blue-500/40 border-blue-500 bg-blue-500/5' : '',
    },
    {
      id: 'verified_done',
      label: 'Release-Ready (Done)',
      count: stats.verifiedDone,
      icon: <IconCircleCheck className="w-5 h-5 text-emerald-500" />,
      accent: 'text-emerald-500',
      bgGlow: 'hover:border-emerald-500/40',
      activeRing: (activeFilter === 'verified_done' || activeFilter === 'Resolved') ? 'ring-2 ring-emerald-500/40 border-emerald-500 bg-emerald-500/5' : '',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {kpis.map((kpi) => (
        <button
          key={kpi.id}
          type="button"
          onClick={() => onFilterChange(kpi.id)}
          className={`relative flex flex-col justify-between p-4 rounded-3xl bg-surface/90 border border-border/70 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${kpi.bgGlow} ${kpi.activeRing}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              {kpi.label}
            </span>
            <div className="p-1.5 rounded-xl bg-surface-alt/70 border border-border/50">
              {kpi.icon}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight ${kpi.accent}`}>
              {kpi.count}
            </span>
            {kpi.id !== 'All' && stats.total > 0 && (
              <span className="text-[10px] font-bold text-text-muted">
                ({Math.round((kpi.count / stats.total) * 100)}%)
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
