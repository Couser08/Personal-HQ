import React, { useState, useEffect } from 'react';
import { 
  IconZoomIn, IconCode, IconCopy, IconCheck, IconTrash, 
  IconClipboardCopy, IconClock, IconUser,
  IconDeviceDesktop, IconDeviceMobile, IconLayersIntersect,
  IconFileText, IconTerminal2, IconX,
  IconShieldCheck, IconAlertTriangle, IconChecklist
} from '@tabler/icons-react';
import { Modal } from '../../../components/ui/Modal';
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
import { bugReportService } from '../../../lib/db';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'dom' | 'qa' | 'env' | 'markdown'>('overview');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync initial report and fetch on-demand full details if screenshot is missing
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

  // QA Verification Form State
  const [fixFilesInput, setFixFilesInput] = useState('');
  const [fixNotesInput, setFixNotesInput] = useState('');
  const [verificationNotesInput, setVerificationNotesInput] = useState('');
  const [isSavingExtra, setIsSavingExtra] = useState(false);

  if (!report) return null;

  const routeMeta = getRouteMeta(report.route);
  const severityStyle = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.Medium;
  const statusStyle = getStatusStyle(report.status);
  const categoryIcon = CATEGORY_ICONS[report.category] || '📌';
  const ua = parseUserAgent(report.userAgent);

  const el = report.elementInfo;
  const isGroup = el?.isGroup && (el.groupCount || 0) > 1;

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
          
          {/* ── HEADER CARD ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-alt/50 border border-border/70">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${severityStyle.pillClass}`}>
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
                  <IconClock size={13} /> {new Date(report.createdAt).toLocaleString()} ({formatRelativeTime(report.createdAt)})
                </span>
              </p>
            </div>

            {/* Status Controller */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Workflow Status</span>
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

          {/* ── INSPECTION TABS ── */}
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
              {report.fixedInFiles && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
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

          {/* ── TAB 1: VISUAL & OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Visual Snapshot */}
              {report.screenshotData ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      📷 High-Resolution Viewport Capture
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsZoomModalOpen(true)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <IconZoomIn size={14} /> Fullscreen Zoom
                    </button>
                  </div>

                  <div 
                    onClick={() => setIsZoomModalOpen(true)}
                    className="relative bg-background rounded-3xl border border-border/80 p-3 max-h-80 overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-inner"
                  >
                    <img
                      src={report.screenshotData}
                      alt={report.title}
                      className="max-h-72 w-auto object-contain rounded-2xl group-hover:scale-102 transition-transform"
                    />

                    {el?.viewport && (
                      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-xl bg-black/80 text-white text-xs font-mono font-bold backdrop-blur-md border border-white/10">
                        Viewport: {el.viewport.width}×{el.viewport.height}px
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-surface-alt/40 border border-dashed border-border text-center text-text-muted">
                  <IconCode size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">No screenshot captured for this report.</p>
                </div>
              )}

              {/* Description */}
              <div className="p-5 rounded-3xl bg-surface border border-border/70 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                  Bug Description & Details
                </span>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {report.description || 'No additional explanation provided.'}
                </p>
              </div>

              {/* Text Snippet inside Element (if captured) */}
              {el?.innerTextSnippet && (
                <div className="p-4 rounded-3xl bg-surface-alt/50 border border-border/70 space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                    Target Element Text Snippet
                  </span>
                  <blockquote className="text-xs font-mono text-text-primary bg-surface p-3 rounded-2xl border border-border/50 break-words">
                    "{el.innerTextSnippet}"
                  </blockquote>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: DOM & GEOMETRY ── */}
          {activeTab === 'dom' && (
            <div className="space-y-4 animate-in fade-in duration-150 font-mono text-xs">
              {el ? (
                <>
                  {/* Ancestor Path */}
                  <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-text-muted font-sans flex items-center gap-1.5">
                        <span>🌳</span> Complete Ancestor Nesting Path
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(el.ancestorPath || el.selector, 'ancestor', 'Ancestor Path')}
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold font-sans cursor-pointer"
                      >
                        {copiedKey === 'ancestor' ? <IconCheck size={13} /> : <IconCopy size={13} />}
                        <span>{copiedKey === 'ancestor' ? 'Copied' : 'Copy Path'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/60 text-text-primary break-all font-semibold">
                      {el.ancestorPath || el.selector}
                    </div>
                  </div>

                  {/* Geometry Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-3xl bg-surface border border-border/70">
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block mb-1">
                        Tag & Identifier
                      </span>
                      <p className="text-sm font-bold text-text-primary">
                        &lt;{el.tag}&gt; {el.id ? `#${el.id}` : ''}
                      </p>
                    </div>

                    <div className="p-4 rounded-3xl bg-surface border border-border/70">
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block mb-1">
                        Dimensions (W × H)
                      </span>
                      <p className="text-sm font-bold text-primary">
                        {Math.round(el.boundingRect.width)} × {Math.round(el.boundingRect.height)} px
                      </p>
                    </div>

                    <div className="p-4 rounded-3xl bg-surface border border-border/70">
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block mb-1">
                        Coordinates (X, Y)
                      </span>
                      <p className="text-sm font-bold text-text-primary">
                        x: {Math.round(el.boundingRect.x)}, y: {Math.round(el.boundingRect.y)}
                      </p>
                    </div>
                  </div>

                  {/* Data Attributes */}
                  {el.dataAttributes && Object.keys(el.dataAttributes).length > 0 && (
                    <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-text-muted font-sans block">
                        Captured Data Attributes
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.entries(el.dataAttributes).map(([key, val]) => (
                          <span
                            key={key}
                            className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px]"
                          >
                            <strong>{key}</strong>: "{val}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Class Token Badges */}
                  {el.classes && el.classes.length > 0 && (
                    <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-text-muted font-sans block">
                          Applied CSS Classes ({el.classes.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(el.classes.join(' '), 'classes', 'Classes')}
                          className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold font-sans cursor-pointer"
                        >
                          {copiedKey === 'classes' ? <IconCheck size={13} /> : <IconCopy size={13} />}
                          <span>{copiedKey === 'classes' ? 'Copied' : 'Copy All'}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto custom-scrollbar p-1">
                        {el.classes.map((cls, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-surface-alt border border-border/60 text-text-secondary text-[11px]"
                          >
                            .{cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multi-Element Cluster (if group) */}
                  {isGroup && el.groupElements && (
                    <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-500 font-sans flex items-center gap-1.5">
                        <IconLayersIntersect size={14} /> Linked Cluster Elements ({el.groupElements.length})
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {el.groupElements.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-2xl bg-surface-alt/70 border border-border/50 flex items-center justify-between gap-3 text-[11px]"
                          >
                            <span className="text-text-primary font-bold">
                              #{idx + 1} &lt;{item.tag}&gt;
                            </span>
                            <span className="text-text-muted truncate flex-1 font-mono">
                              {item.selector}
                            </span>
                            <span className="text-text-secondary font-bold shrink-0">
                              {Math.round(item.boundingRect.width)}×{Math.round(item.boundingRect.height)}px
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 rounded-3xl bg-surface-alt/40 border border-dashed border-border text-center text-text-muted">
                  <p className="text-xs font-bold font-sans">No DOM Element telemetry was captured for this report.</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: FIX & QA VERIFICATION ── */}
          {activeTab === 'qa' && (
            <div className="space-y-5 animate-in fade-in duration-150 text-xs">
              
              {/* QA Action Banner if Pending Verification */}
              <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <IconShieldCheck size={18} /> QA Verification Gateway
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Confirm that the reported visual or functional glitch has been verified resolved in code.
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
                  Implementation & Resolution Details
                </span>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase">Fixed In Files</label>
                  <input
                    type="text"
                    defaultValue={Array.isArray(report.fixedInFiles) ? report.fixedInFiles.join(', ') : (report.fixedInFiles || '')}
                    onChange={(e) => setFixFilesInput(e.target.value)}
                    placeholder="e.g. src/modules/books/components/NotebookEditor.tsx"
                    className="w-full bg-surface-alt border border-border/70 rounded-2xl px-3.5 py-2.5 font-mono text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase">Fix Notes & Technical Explanation</label>
                  <textarea
                    rows={3}
                    defaultValue={report.fixNotes || ''}
                    onChange={(e) => setFixNotesInput(e.target.value)}
                    placeholder="Explain what was fixed, refactored, or tuned..."
                    className="w-full bg-surface-alt border border-border/70 rounded-2xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-primary custom-scrollbar resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase">QA / Verification Proof & Notes</label>
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
          )}

          {/* ── TAB 4: CLIENT ENVIRONMENT ── */}
          {activeTab === 'env' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    Operating System & Browser
                  </span>
                  <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                    {ua.isMobile ? <IconDeviceMobile size={16} /> : <IconDeviceDesktop size={16} />}
                    <span>{ua.os} · {ua.browser}</span>
                  </p>
                </div>

                <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    Report Route / Subsystem
                  </span>
                  <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span>{routeMeta.icon}</span>
                    <span>/{report.route}</span>
                  </p>
                </div>
              </div>

              {/* Viewport & Scrolling */}
              {el?.viewport && (
                <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2 font-mono">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block">
                    Client Viewport Resolution & Scroll State
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-surface-alt">
                      <span className="text-[10px] text-text-muted block">Width</span>
                      <strong className="text-text-primary">{el.viewport.width}px</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-alt">
                      <span className="text-[10px] text-text-muted block">Height</span>
                      <strong className="text-text-primary">{el.viewport.height}px</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-alt">
                      <span className="text-[10px] text-text-muted block">Scroll X</span>
                      <strong className="text-text-primary">{el.viewport.scrollX}px</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-alt">
                      <span className="text-[10px] text-text-muted block">Scroll Y</span>
                      <strong className="text-text-primary">{el.viewport.scrollY}px</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* User Agent String */}
              {report.userAgent && (
                <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-1.5 font-mono">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block">
                    Raw User-Agent Header
                  </span>
                  <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/60 text-text-secondary text-[11px] break-all">
                    {report.userAgent}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: MARKDOWN ── */}
          {activeTab === 'markdown' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                  Complete Markdown Entry
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(report.markdownContent || `# Bug: ${report.title}`, 'md', 'Markdown')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:opacity-90 text-text-on-accent text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  {copiedKey === 'md' ? <IconCheck size={14} /> : <IconClipboardCopy size={14} />}
                  <span>{copiedKey === 'md' ? 'Copied' : 'Copy Markdown'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-3xl bg-background border border-border font-mono text-xs text-text-primary max-h-72 overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                {report.markdownContent || `# Bug: ${report.title}\n\n${report.description}`}
              </pre>
            </div>
          )}

          {/* ── FOOTER ACTIONS ── */}
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
                onClick={() => handleCopy(report.markdownContent || `# Bug: ${report.title}`, 'md-footer', 'Markdown')}
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

      {/* ── FULLSCREEN IMAGE ZOOM MODAL ── */}
      {isZoomModalOpen && report.screenshotData && (
        <div
          onClick={() => setIsZoomModalOpen(false)}
          className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-6xl max-h-[90vh] bg-surface rounded-3xl overflow-hidden border border-white/20 p-2 shadow-2xl">
            <img
              src={report.screenshotData}
              alt="Zoomed Screenshot"
              className="max-h-[82vh] w-auto object-contain rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer shadow-lg"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
