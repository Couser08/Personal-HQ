import React from 'react';
import { Card } from '../../../components/ui/Card';

interface DashboardRecentActivityProps {
  recentActivity: {
    id: string;
    title: string;
    type: string;
    date: string;
    icon: any;
    module: string;
    color: string;
  }[];
  setActiveModule: (m: any) => void;
}

export const DashboardRecentActivity: React.FC<DashboardRecentActivityProps> = ({
  recentActivity,
  setActiveModule,
}) => {
  return (
    <Card padding="lg" className="flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">Recent Activity</h3>
        <span className="text-[12px] text-text-tertiary">Auto-synced</span>
      </div>

      <div className="flex flex-col divide-y divide-border-hairline">
        {recentActivity.length === 0 ? (
          <p className="text-[13px] text-text-secondary italic py-4">No recent activity logged.</p>
        ) : (
          recentActivity.map((activity, i) => (
            <button
              key={`${activity.id}-${i}`}
              onClick={() => setActiveModule(activity.module)}
              className="flex items-center justify-between py-3.5 hover:bg-surface-alt/50 transition-colors text-left cursor-pointer px-2 rounded-[10px]"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-text-secondary shrink-0">
                  <activity.icon size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-text-primary truncate max-w-sm">
                    {activity.title}
                  </p>
                  <span className="text-[11px] text-text-secondary">{activity.type}</span>
                </div>
              </div>
              <span className="text-[12px] text-text-tertiary shrink-0">
                {new Date(activity.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </button>
          ))
        )}
      </div>
    </Card>
  );
};
