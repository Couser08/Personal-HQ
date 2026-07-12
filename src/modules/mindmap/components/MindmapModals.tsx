import { motion, AnimatePresence } from 'framer-motion';
import { IconBook, IconDownload } from '@tabler/icons-react';
import { Modal } from '../../../components/ui/Modal';
import { renderMarkdown } from '../utils/mindmapUtils';
import { type MindmapNode, type Mindmap } from '../../../store/types';

export function MindmapModals({
  isRenameModalOpen,
  setIsRenameModalOpen,
  titleInput,
  setTitleInput,
  handleRenameMindmap,
  fullScreenImages,
  setFullScreenImages,
  fullScreenImageIdx,
  setFullScreenImageIdx,
  pdfViewerPdf,
  setPdfViewerPdf,
  isNotesModalOpen,
  setIsNotesModalOpen,
  notesModalNode,
  setNotesModalNodeId,
  notesActiveTab,
  setNotesActiveTab,
  onUpdate,
  mindmap,
}: {
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (val: boolean) => void;
  titleInput: string;
  setTitleInput: (val: string) => void;
  handleRenameMindmap: () => void;
  fullScreenImages: string[] | null;
  setFullScreenImages: (val: string[] | null) => void;
  fullScreenImageIdx: number;
  setFullScreenImageIdx: (val: number) => void;
  pdfViewerPdf: { name: string; base64: string } | null;
  setPdfViewerPdf: (val: { name: string; base64: string } | null) => void;
  isNotesModalOpen: boolean;
  setIsNotesModalOpen: (val: boolean) => void;
  notesModalNode: MindmapNode | null;
  setNotesModalNodeId: (val: string | null) => void;
  notesActiveTab: 'view' | 'edit';
  setNotesActiveTab: (val: 'view' | 'edit') => void;
  onUpdate: (data: Partial<Mindmap>) => void;
  mindmap: Mindmap;
}) {
  return (
    <>
      {/* Rename Modal */}
      <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} title="Rename Mindmap">
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Mindmap Title</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              required
              onKeyDown={(e) => e.key === 'Enter' && handleRenameMindmap()}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setIsRenameModalOpen(false)} className="btn btn-secondary btn-md rounded-full px-5">
              Cancel
            </button>
            <button onClick={handleRenameMindmap} className="btn btn-primary btn-md rounded-full px-6">
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Full Screen Image Preview Modal */}
      <AnimatePresence>
        {fullScreenImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-between p-6 select-none"
            onClick={() => setFullScreenImages(null)}
          >
            {/* Header controls */}
            <div className="w-full flex items-center justify-between max-w-5xl z-10">
              <span className="text-xs font-mono font-bold tracking-widest text-gray-400">
                IMAGE {fullScreenImageIdx + 1} OF {fullScreenImages.length}
              </span>
              <div className="flex gap-4 items-center">
                <a
                  href={fullScreenImages[fullScreenImageIdx]}
                  download={`image-${fullScreenImageIdx + 1}.png`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-full text-xs font-bold transition-colors uppercase tracking-wider"
                >
                  Download
                </a>
                <button
                  onClick={() => setFullScreenImages(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center font-bold text-lg transition-colors border-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Image display */}
            <div className="flex-1 w-full flex items-center justify-center max-w-5xl relative" onClick={(e) => e.stopPropagation()}>
              {fullScreenImages.length > 1 && (
                <button
                  onClick={() => setFullScreenImageIdx(fullScreenImageIdx === 0 ? fullScreenImages.length - 1 : fullScreenImageIdx - 1)}
                  className="absolute left-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 active:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/15 text-lg font-bold cursor-pointer"
                >
                  &#8592;
                </button>
              )}

              <motion.img
                key={fullScreenImageIdx}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={fullScreenImages[fullScreenImageIdx]}
                alt="Fullscreen Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl pointer-events-auto"
              />

              {fullScreenImages.length > 1 && (
                <button
                  onClick={() => setFullScreenImageIdx(fullScreenImageIdx === fullScreenImages.length - 1 ? 0 : fullScreenImageIdx + 1)}
                  className="absolute right-4 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 active:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/15 text-lg font-bold cursor-pointer"
                >
                  &#8594;
                </button>
              )}
            </div>

            {/* Footer hints */}
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider z-10">Click outside or press Close to exit</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {pdfViewerPdf && (() => {
          const fileExt = pdfViewerPdf.name.split('.').pop()?.toUpperCase() || 'PDF';
          const fileSizeEstimate = pdfViewerPdf.base64 ? `${(pdfViewerPdf.base64.length / 1024 / 1.37).toFixed(0)} KB` : '';
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center select-none"
              onClick={() => setPdfViewerPdf(null)}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 24 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                className="relative flex flex-col w-[96vw] max-w-5xl h-[92vh] rounded-[28px] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'linear-gradient(145deg, rgba(28,28,30,0.98), rgba(20,20,22,0.99))',
                  boxShadow:
                    '0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px -20px rgba(0,0,0,0.7), 0 0 80px -10px rgba(239,68,68,0.05)',
                }}
              >
                {/* Top Toolbar */}
                <div
                  className="flex items-center justify-between px-5 py-3.5 shrink-0 relative z-10"
                  style={{
                    background: 'linear-gradient(180deg, rgba(44,44,46,0.95) 0%, rgba(34,34,36,0.9) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))',
                          border: '1px solid rgba(239,68,68,0.15)',
                          boxShadow: '0 0 16px -4px rgba(239,68,68,0.15)',
                        }}
                      >
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">{fileExt}</span>
                      </div>
                    </div>
                    <div className="min-w-0 text-left">
                      <h3 className="text-[13px] font-bold text-white truncate max-w-[300px] leading-tight">{pdfViewerPdf.name}</h3>
                      {fileSizeEstimate && (
                        <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block">{fileSizeEstimate} · Document</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={pdfViewerPdf.base64}
                      download={pdfViewerPdf.name}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold text-gray-300 uppercase tracking-wider transition-all hover:text-white"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                      }}
                      title="Download PDF"
                    >
                      <IconDownload className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>

                    <div className="w-px h-5 bg-white/8 mx-1" />

                    <button
                      type="button"
                      onClick={() => setPdfViewerPdf(null)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer border-none"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                      }}
                      title="Close (Esc)"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1.5 1.5L12.5 12.5M12.5 1.5L1.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Viewport */}
                <div className="flex-1 overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none" />
                  <iframe src={pdfViewerPdf.base64} title={pdfViewerPdf.name} className="w-full h-full border-0" style={{ background: '#f5f5f5' }} />
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[rgba(20,20,22,0.8)] to-transparent z-10 pointer-events-none" />
                </div>

                {/* Bottom Bar */}
                <div
                  className="flex items-center justify-between px-5 py-2.5 shrink-0"
                  style={{
                    background: 'rgba(30,30,32,0.95)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="text-[10px] text-gray-600 font-semibold text-left">Use browser controls to navigate pages</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-600 font-semibold flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono font-bold text-gray-500 border border-white/5">Esc</kbd>
                      to close
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Apple Notes Style Modal */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setNotesModalNodeId(null);
        }}
        title={notesModalNode ? `Notes: ${notesModalNode.text}` : 'Advanced Notes'}
      >
        {notesModalNode && (
          <div className="flex flex-col h-[480px] font-sans">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4 shrink-0">
              <div className="text-left">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Apple-Style Outliner</span>
              </div>

              {/* Tab Toggles */}
              <div className="flex bg-surface-alt p-1 rounded-xl border border-border/50 shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setNotesActiveTab('view')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer border-none bg-transparent ${
                    notesActiveTab === 'view' ? 'bg-surface text-amber-600 shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Reader
                </button>
                <button
                  type="button"
                  onClick={() => setNotesActiveTab('edit')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer border-none bg-transparent ${
                    notesActiveTab === 'edit' ? 'bg-surface text-amber-600 shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Edit Note
                </button>
              </div>
            </div>

            {/* Note Area */}
            <div
              className={`flex-1 overflow-y-auto rounded-2xl border border-border/30 p-5 text-left transition-all ${
                notesActiveTab === 'view'
                  ? 'bg-[#fcfaf2] dark:bg-[#1c1a17] text-stone-850 dark:text-stone-200 border-amber-900/10'
                  : 'bg-surface-alt/65 text-text-primary'
              }`}
              style={{
                fontFamily: notesActiveTab === 'view' ? 'Georgia, Cambria, serif' : 'inherit',
              }}
            >
              {notesActiveTab === 'view' ? (
                <div className="prose max-w-none dark:prose-invert">
                  {notesModalNode.notes && notesModalNode.notes.trim() ? (
                    renderMarkdown(notesModalNode.notes)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-stone-400 dark:text-stone-500 gap-2">
                      <IconBook className="w-8 h-8 opacity-40" />
                      <p className="text-xs italic font-semibold">No notes written yet. Switch to "Edit Note" to write.</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={notesModalNode.notes || ''}
                  onChange={(e) => {
                    onUpdate({
                      nodes: mindmap.nodes.map((n) => (n.id === notesModalNode.id ? { ...n, notes: e.target.value } : n)),
                    });
                  }}
                  placeholder="Write outlines, details, paste ChatGPT tables or markdown here..."
                  className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-[11px] leading-relaxed focus:ring-0 text-text-primary"
                  autoFocus
                />
              )}
            </div>

            {/* Footer status bar */}
            <div className="mt-3 text-right">
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">
                {notesModalNode.notes ? `${notesModalNode.notes.length} characters` : 'Empty note'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
