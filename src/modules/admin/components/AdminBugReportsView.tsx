import React from 'react';
import { IconBug } from '@tabler/icons-react';
import type { BugReport } from '../../../store/types';
import { type AdminViewMode } from './BugReportToolbar';
import { BugReportCard } from './BugReportCard';
import { BugReportListItem } from './BugReportListItem';
import { BugReportKanban } from './BugReportKanban';
import { BugReportModuleMap } from './BugReportModuleMap';

interface AdminBugReportsViewProps {
  filteredReports: BugReport[];
  viewMode: AdminViewMode;
  setSelectedReport: (report: BugReport | null) => void;
  updateReportStatus: (id: string, status: any, extra?: Partial<BugReport>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}

export const AdminBugReportsView: React.FC<AdminBugReportsViewProps> = ({
  filteredReports,
  viewMode,
  setSelectedReport,
  updateReportStatus,
  deleteReport,
}) => {
  if (filteredReports.length === 0) {
    return (
      <div className="text-center py-20 bg-surface/60 border border-dashed border-border/80 rounded-4xl p-8 backdrop-blur-sm text-left">
        <div className="w-14 h-14 rounded-3xl bg-surface-alt/70 text-text-muted flex items-center justify-center mx-auto mb-3 border border-border/60">
          <IconBug size={28} className="opacity-60" />
        </div>
        <h3 className="text-base font-extrabold text-text-primary text-center">
          No Bug Reports Found
        </h3>
        <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto text-center">
          No reports match your current filter parameters. Try clearing your search query or
          selecting a different status.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <BugReportCard
            key={report.id}
            report={report}
            onSelect={setSelectedReport}
            onZoomScreenshot={(r) => setSelectedReport(r)}
            onUpdateStatus={updateReportStatus}
            onDelete={deleteReport}
          />
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2.5">
        {filteredReports.map((report) => (
          <BugReportListItem
            key={report.id}
            report={report}
            onSelect={setSelectedReport}
            onZoomScreenshot={(r) => setSelectedReport(r)}
            onUpdateStatus={updateReportStatus}
            onDelete={deleteReport}
          />
        ))}
      </div>
    );
  }

  if (viewMode === 'kanban') {
    return (
      <BugReportKanban
        reports={filteredReports}
        onSelect={setSelectedReport}
        onZoomScreenshot={(r) => setSelectedReport(r)}
        onUpdateStatus={updateReportStatus}
      />
    );
  }

  return (
    <BugReportModuleMap
      reports={filteredReports}
      onSelect={setSelectedReport}
      onZoomScreenshot={(r) => setSelectedReport(r)}
    />
  );
};
