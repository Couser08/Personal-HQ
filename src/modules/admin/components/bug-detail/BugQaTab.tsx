import React, { useState } from 'react';
import { IconShieldCheck, IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import type { BugReport } from '../../../../store/types';

interface BugQaTabProps {
  report: BugReport;
  onUpdateStatus: (id: string, status: any, extra?: Partial<BugReport>) => Promise<void>;
  addToast: (titleOrMessage: string, messageOrType: string, type?: any) => void;
}

export const BugQaTab: React.FC<BugQaTabProps> = ({
  report,
  onUpdateStatus,
  addToast,
}) => {
  const [fixFilesInput, setFixFilesInput] = useState('');
  const [fixNotesInput, setFixNotesInput] = useState('');
  const [verificationNotesInput, setVerificationNotesInput] = useState('');
  const [isSavingExtra, setIsSavingExtra] = useState(false);

  const handleSaveFixInfo = async () => {
    setIsSavingExtra(true);
    try {
      await onUpdateStatus(report.id, report.status, {
        fixedInFiles: fixFilesInput || report.fixedInFiles,
        fixNotes: fixNotesInput || report.fixNotes,
        verificationNotes: verificationNotesInput || report.verificationNotes,
        fixedAt: fixFilesInput ? new Date().toISOString() : report.fixedAt,
      });
      addToast('Saved', 'Fix & Verification info updated.', 'success');
    } finally {
      setIsSavingExtra(false);
    }
  };

  const handleVerifyPass = async () => {
    await onUpdateStatus(report.id, 'verified_done', {
      verificationNotes: verificationNotesInput || 'Verified fix confirmed working.',
      verifiedAt: new Date().toISOString(),
    });
    addToast('Verified', 'Bug marked as Verified & Done.', 'success');
  };

  const handleVerifyFail = async () => {
    await onUpdateStatus(report.id, 'reopened', {
      verificationNotes: verificationNotesInput || 'QA verification failed. Reopening bug.',
      verifiedAt: undefined,
    });
    addToast('Reopened', 'Bug reopened for further fixes.', 'warning');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150 text-xs text-left">
      {/* QA Action Banner */}
      <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <IconShieldCheck size={18} /> QA Verification Gateway
          </h4>
          <p className="text-xs text-text-secondary mt-1">
            Confirm that the reported visual or functional glitch has been verified resolved in
            code.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleVerifyFail}
            className="px-3.5 py-2 rounded-2xl bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <IconAlertTriangle size={14} />
            <span>Reopen Bug</span>
          </button>

          <button
            type="button"
            onClick={handleVerifyPass}
            className="px-4 py-2 rounded-2xl bg-emerald-500 hover:opacity-90 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <IconCheck size={15} stroke={2.5} />
            <span>Verify as Done</span>
          </button>
        </div>
      </div>

      {/* Fix Details Form */}
      <div className="p-5 rounded-3xl bg-surface border border-border/70 space-y-4">
        <span className="text-xs font-black uppercase tracking-wider text-text-secondary block">
          Implementation &amp; Resolution Details
        </span>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase">Fixed In Files</label>
          <input
            type="text"
            defaultValue={
              Array.isArray(report.fixedInFiles)
                ? report.fixedInFiles.join(', ')
                : report.fixedInFiles || ''
            }
            onChange={(e) => setFixFilesInput(e.target.value)}
            placeholder="e.g. src/modules/books/components/NotebookEditor.tsx"
            className="w-full bg-surface-alt border border-border/70 rounded-2xl px-3.5 py-2.5 font-mono text-xs text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase">
            Fix Notes &amp; Technical Explanation
          </label>
          <textarea
            rows={3}
            defaultValue={report.fixNotes || ''}
            onChange={(e) => setFixNotesInput(e.target.value)}
            placeholder="Explain what was fixed, refactored, or tuned..."
            className="w-full bg-surface-alt border border-border/70 rounded-2xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-primary custom-scrollbar resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-muted uppercase">
            QA / Verification Proof &amp; Notes
          </label>
          <textarea
            rows={2}
            defaultValue={report.verificationNotes || ''}
            onChange={(e) => setVerificationNotesInput(e.target.value)}
            placeholder="Results of visual checks, browser compatibility, or automated tests..."
            className="w-full bg-surface-alt border border-border/70 rounded-2xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-primary custom-scrollbar resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveFixInfo}
            disabled={isSavingExtra}
            className="px-5 py-2 rounded-2xl bg-primary hover:opacity-90 text-text-on-accent font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <IconCheck size={14} />
            <span>{isSavingExtra ? 'Saving...' : 'Save Fix Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
