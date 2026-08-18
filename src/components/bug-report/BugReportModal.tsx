import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBugReportStore } from '../../store/useBugReportStore';
import { type BugReportCategory, type BugReportSeverity } from '../../store/types';
import { 
  IconX, IconSend, IconCode, IconZoomIn, IconLoader2 
} from '@tabler/icons-react';
import { Modal } from '../ui/Modal';
import { CustomSelect } from '../ui/CustomSelect';

const CATEGORIES: { value: BugReportCategory; label: string }[] = [
  { value: 'UI Glitch', label: '🎨 UI / Visual Glitch' },
  { value: 'Data Sync', label: '🔄 Data Sync / Caching Issue' },
  { value: 'Performance', label: '⚡ Performance / Lag' },
  { value: 'Crash / Error', label: '💥 Crash / JavaScript Error' },
  { value: 'Other', label: '💡 Other / General Feedback' },
];

const SEVERITIES: { value: BugReportSeverity; label: string; color: string }[] = [
  { value: 'Low', label: 'Low', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { value: 'Medium', label: 'Medium', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'High', label: 'High', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { value: 'Critical', label: 'Critical', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
];

export function BugReportModal() {
  const { isModalOpen, closeModal, capturedElement, capturedScreenshot, submitBugReport } = useBugReportStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BugReportCategory>('UI Glitch');
  const [severity, setSeverity] = useState<BugReportSeverity>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await submitBugReport({
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
      });
      // reset
      setTitle('');
      setDescription('');
      setCategory('UI Glitch');
      setSeverity('Medium');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Report an Issue" maxWidthClassName="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2 font-sans">
          
          {/* Target Element & Screenshot Card */}
          <div className="bg-surface-alt/40 border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start">
            {/* Screenshot Thumbnail */}
            {capturedScreenshot ? (
              <div 
                onClick={() => setIsImageZoomed(true)}
                className="relative group w-full sm:w-44 h-28 bg-surface rounded-xl overflow-hidden border border-border cursor-zoom-in shrink-0 flex items-center justify-center shadow-sm"
              >
                <img 
                  src={capturedScreenshot} 
                  alt="Element Screenshot" 
                  className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <IconZoomIn size={20} />
                </div>
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  HQ Snapshot
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-44 h-28 bg-surface rounded-xl border border-border/50 flex flex-col items-center justify-center text-text-muted shrink-0 text-center p-2">
                <IconCode size={24} className="mb-1" />
                <span className="text-[10px]">DOM Element Selected</span>
              </div>
            )}

            {/* Element Metadata Chips */}
            <div className="flex-1 flex flex-col justify-between w-full overflow-hidden">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {capturedElement?.sectionName && (
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      📍 {capturedElement.sectionName}
                    </span>
                  )}
                  {capturedElement?.pageRoute && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border">
                      {capturedElement.pageRoute}
                    </span>
                  )}
                  {capturedElement?.isGroup ? (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      Group ({capturedElement.groupCount || capturedElement.groupElements?.length} items)
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      &lt;{capturedElement?.tag || 'element'}&gt;
                    </span>
                  )}
                  {capturedElement?.id && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      #{capturedElement.id}
                    </span>
                  )}
                  {capturedElement?.boundingRect && (
                    <span className="text-[10px] font-mono text-text-secondary">
                      {capturedElement.boundingRect.width}×{capturedElement.boundingRect.height}px (x: {capturedElement.boundingRect.x}, y: {capturedElement.boundingRect.y})
                    </span>
                  )}
                </div>

                <div className="bg-surface px-2.5 py-1.5 rounded-lg border border-border/60">
                  <span className="text-[9.5px] uppercase font-bold text-text-muted block mb-0.5">Ancestor Path</span>
                  <p className="text-[11px] font-mono text-text-primary break-all">
                    {capturedElement?.ancestorPath || capturedElement?.selector || 'Custom Element'}
                  </p>
                </div>

                {capturedElement?.classes && capturedElement.classes.length > 0 && (
                  <div className="text-[10px] font-mono text-text-muted truncate">
                    <span className="font-bold text-text-secondary">Classes ({capturedElement.classes.length}):</span> {capturedElement.classes.slice(0, 5).join(', ')}{capturedElement.classes.length > 5 ? '...' : ''}
                  </div>
                )}

                {capturedElement?.isGroup && capturedElement.groupElements && capturedElement.groupElements.length > 0 ? (
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {capturedElement.groupElements.map((el, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10.5px] font-mono bg-surface px-2 py-1 rounded border border-border/40 text-text-secondary">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[9px] shrink-0">
                          {i + 1}
                        </span>
                        {(el.pageTitle || el.pageModule) && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-sans font-bold text-text-primary shrink-0">
                            {el.pageTitle || el.pageModule}
                          </span>
                        )}
                        <span className="font-bold text-text-primary shrink-0">&lt;{el.tag}&gt;</span>
                        <span className="truncate flex-1">{el.ancestorPath || el.selector}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  capturedElement?.innerTextSnippet && (
                    <p className="text-[11px] text-text-secondary italic line-clamp-1">
                      "{capturedElement.innerTextSnippet}"
                    </p>
                  )
                )}
              </div>

              <span className="text-[10px] text-text-muted mt-2 block">
                Fingerprint, viewport & coordinates will be attached automatically to the report.
              </span>
            </div>
          </div>

          {/* Issue Title Input */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
              Issue Title / Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Button alignment broken on mobile view"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] font-medium text-text-primary focus:outline-none focus:border-primary transition-colors shadow-inner"
              required
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
                Category
              </label>
              <CustomSelect
                options={CATEGORIES}
                value={category}
                onChange={(val) => setCategory(val as BugReportCategory)}
              />
            </div>

            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
                Severity
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSeverity(s.value)}
                    className={`py-2 text-[12px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      severity === s.value
                        ? `${s.color} ring-2 ring-primary/30 shadow-sm font-black`
                        : 'bg-surface border-border text-text-secondary hover:bg-surface-alt'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Explanation */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
              What happened? (Explanation)
            </label>
            <textarea
              placeholder="Explain what went wrong, steps to reproduce, or what you expected to see..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-primary transition-colors resize-none custom-scrollbar"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
            <span className="text-[11px] text-text-muted">
              Auto-syncs to Database & App's <code className="font-mono bg-surface px-1 py-0.5 rounded">reports.md</code>
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-[13px] font-bold text-text-secondary hover:bg-surface rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="bg-primary hover:opacity-90 text-text-on-accent px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconSend size={16} />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {isImageZoomed && capturedScreenshot && (
          <div 
            onClick={() => setIsImageZoomed(false)}
            className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] bg-surface rounded-2xl overflow-hidden border border-border p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={capturedScreenshot} 
                alt="Zoomed Screenshot" 
                className="w-full h-full object-contain rounded-xl max-h-[75vh]" 
              />
              <button
                onClick={() => setIsImageZoomed(false)}
                className="absolute top-4 right-4 bg-zinc-900/80 text-white p-2 rounded-full hover:bg-zinc-900 backdrop-blur transition-colors"
              >
                <IconX size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
