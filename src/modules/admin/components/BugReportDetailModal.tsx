import React, { useState, useEffect } from 'react';
import {
  IconZoomIn,
  IconCode,
  IconCopy,
  IconTrash,
  IconChecklist,
  IconTerminal2,
  IconFileText,
} from '@tabler/icons-react';
import { Modal } from '../../../components/ui/Modal';
import { type BugReport, type BugReportStatus } from '../../../store/types';
import { useToastStore } from '../../../store/useToastStore';
import { bugReportService } from '../../../lib/db';
import { BugDetailHeader } from './bug-detail/BugDetailHeader';
import { BugOverviewTab } from './bug-detail/BugOverviewTab';
import { BugDomTab } from './bug-detail/BugDomTab';
import { BugQaTab } from './bug-detail/BugQaTab';
import { BugEnvTab, BugMarkdownTab } from './bug-detail/BugEnvAndMarkdownTabs';
import { BugScreenshotZoomModal } from './bug-detail/BugScreenshotZoomModal';

interface BugReportDetailModalProps {
  report: BugReport | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: BugReportStatus, extra?: Partial<BugReport>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const BugReportDetailModal: React.FC<BugReportDetailModalProps> = ({
  report: initialReport,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  const [report, setReport] = useState<BugReport | null>(initialReport);
  const addToast = useToastStore((s) => s.addToast);
  const [activeTab, setActiveTab] = useState<'overview' | 'dom' | 'qa' | 'env' | 'markdown'>(
    'overview',
  );
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setReport(initialReport);
    if (initialReport?.id && !initialReport.screenshotData) {
      void bugReportService.fetchDetail(initialReport.id).then((full) => {
        if (full) {
          setReport((prev) => (prev && prev.id === full.id ? { ...prev, ...full } : prev));
        }
      });
    }
  }, [initialReport]);

  if (!report) return null;

  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      addToast('Copied', `${label} copied to clipboard`, 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleStatusChange = async (newStatus: BugReportStatus) => {
    await onUpdateStatus(report.id, newStatus);
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently delete report "${report.title}"?`)) {
      onDelete(report.id);
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Bug Diagnostics & Telemetry Inspector"
        maxWidthClassName="max-w-4xl"
      >
        <div className="space-y-6 pt-2 font-sans text-left">
          {/* Header Card */}
          <BugDetailHeader report={report} handleStatusChange={handleStatusChange} />

          {/* Inspection Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-alt/60 p-1 rounded-2xl border border-border/70 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconZoomIn size={15} /> Visual & Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dom')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'dom'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconCode size={15} /> DOM & Geometry
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'qa'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconChecklist size={15} /> Fix & Verification
              {report.fixedInFiles && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('env')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'env'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconTerminal2 size={15} /> Client Environment
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'markdown'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconFileText size={15} /> Markdown Ledger
            </button>
          </div>

          {activeTab === 'overview' && (
            <BugOverviewTab report={report} setIsZoomModalOpen={setIsZoomModalOpen} />
          )}

          {activeTab === 'dom' && (
            <BugDomTab report={report} copiedKey={copiedKey} handleCopy={handleCopy} />
          )}

          {activeTab === 'qa' && (
            <BugQaTab
              report={report}
              onUpdateStatus={onUpdateStatus}
              addToast={addToast}
            />
          )}

          {activeTab === 'env' && <BugEnvTab report={report} />}

          {activeTab === 'markdown' && (
            <BugMarkdownTab report={report} copiedKey={copiedKey} handleCopy={handleCopy} />
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/70 flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 px-4 py-2.5 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
            >
              <IconTrash size={15} />
              <span>Delete Report</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    report.markdownContent || `# Bug: ${report.title}`,
                    'md-footer',
                    'Markdown',
                  )
                }
                className="flex items-center gap-1.5 text-xs font-bold text-text-primary bg-surface hover:bg-surface-alt border border-border px-4 py-2.5 rounded-2xl transition-colors cursor-pointer"
              >
                <IconCopy size={15} />
                <span>Copy MD</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-primary hover:opacity-90 text-text-on-accent text-xs font-bold px-6 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <BugScreenshotZoomModal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        screenshotData={report.screenshotData}
      />
    </>
  );
};
