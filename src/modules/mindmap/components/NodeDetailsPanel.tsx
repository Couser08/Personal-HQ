import { IconBook, IconLink, IconTrash } from '@tabler/icons-react';
import { type MindmapNode } from '../../../store/types';
import { COLOR_PRESETS, getDomainName, getDomainFavicon, type MindmapColor } from '../utils/mindmapUtils';

export function NodeDetailsPanel({
  selectedNode,
  newLinkUrl,
  setNewLinkUrl,
  handleAddLink,
  handleRemoveLink,
  handleImageUpload,
  handleRemoveImage,
  handlePdfUpload,
  handleRemovePdf,
  handleUpdateNodeProp,
  handleChangeNodeColor,
  setFullScreenImages,
  setFullScreenImageIdx,
  setPdfViewerPdf,
  setIsDrawerOpen,
  setNotesModalNodeId,
  setNotesActiveTab,
  setIsNotesModalOpen,
}: {
  selectedNode: MindmapNode;
  newLinkUrl: string;
  setNewLinkUrl: (val: string) => void;
  handleAddLink: () => void;
  handleRemoveLink: (url: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (idx: number) => void;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePdf: (idx: number) => void;
  handleUpdateNodeProp: (key: keyof MindmapNode, val: any) => void;
  handleChangeNodeColor: (color: MindmapColor) => void;
  setFullScreenImages: (val: string[] | null) => void;
  setFullScreenImageIdx: (val: number) => void;
  setPdfViewerPdf: (val: any) => void;
  setIsDrawerOpen: (val: boolean) => void;
  setNotesModalNodeId: (val: string | null) => void;
  setNotesActiveTab: (val: 'view' | 'edit') => void;
  setIsNotesModalOpen: (val: boolean) => void;
}) {
  return (
    <div className="w-[320px] bg-surface border-l border-border/50 flex flex-col relative z-20 shrink-0 h-full animate-fade-in shadow-xl text-left">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-text-primary">Advanced Panel</h3>
        <button
          onClick={() => setIsDrawerOpen(false)}
          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-border hover:bg-surface-alt text-text-secondary border-none bg-transparent cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title / Text Edit */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Node Name</label>
          <input
            type="text"
            value={selectedNode.text}
            onChange={(e) => handleUpdateNodeProp('text', e.target.value)}
            className="w-full bg-surface-alt border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-text-primary"
          />
        </div>

        {/* Node Color */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Node Color</label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => handleChangeNodeColor(color.id)}
                className={`h-8 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${color.bg} ${
                  (selectedNode.color || 'gray') === color.id
                    ? 'ring-2 ring-primary/30 scale-[1.02]'
                    : 'hover:scale-[1.02]'
                }`}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>

        {/* Long Markdown Notes */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Advanced Notes</label>
            <button
              type="button"
              onClick={() => {
                setNotesModalNodeId(selectedNode.id);
                setNotesActiveTab('view');
                setIsNotesModalOpen(true);
              }}
              className="text-[9px] font-extrabold text-amber-500 hover:text-amber-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer border-none bg-transparent"
            >
              <IconBook className="w-3 h-3" /> Reader View
            </button>
          </div>
          <textarea
            value={selectedNode.notes || ''}
            onChange={(e) => handleUpdateNodeProp('notes', e.target.value)}
            placeholder="Write long outline notes, logs, or details here..."
            rows={7}
            className="w-full bg-surface-alt border border-border/60 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary text-text-primary resize-y"
          />
        </div>

        {/* Multiple Links Manager */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Web Links</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="Paste URL (e.g. google.com)"
              className="flex-1 bg-surface-alt border border-border/60 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary text-text-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddLink();
              }}
            />
            <button
              type="button"
              onClick={handleAddLink}
              className="px-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-alt transition-colors cursor-pointer border-none"
            >
              Add
            </button>
          </div>

          {/* Links list */}
          {selectedNode.links && selectedNode.links.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
              {selectedNode.links.map((url) => (
                <div
                  key={url}
                  className="group flex items-center justify-between p-2.5 bg-surface border border-border/40 hover:bg-stone-50 dark:hover:bg-stone-900/40 rounded-2xl shadow-sm transition-all duration-150 relative"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-text-secondary hover:text-text-primary text-xs truncate max-w-[82%] font-medium"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/5 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                      {getDomainFavicon(url) ? (
                        <img
                          src={getDomainFavicon(url)}
                          alt=""
                          className="w-4.5 h-4.5 rounded-md"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/favicon.svg';
                          }}
                        />
                      ) : (
                        <IconLink className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex flex-col truncate leading-tight">
                      <span className="truncate text-text-primary font-bold text-xs">{getDomainName(url)}</span>
                      <span className="truncate text-text-muted text-[10px] mt-0.5">{url}</span>
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(url)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-text-muted transition-all cursor-pointer shrink-0 border-none bg-transparent"
                    title="Delete Link"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Multiple Images Manager */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Image Attachments</label>
          <div className="relative border border-dashed border-border/80 rounded-xl p-3 bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Upload Images</span>
            <span className="text-[8px] text-text-muted mt-0.5">Supports PNG, JPG, WebP</span>
          </div>

          {/* Thumbnails grid */}
          {selectedNode.images && selectedNode.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-1">
              {selectedNode.images.map((base64, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-surface shadow-sm">
                  <img
                    src={base64}
                    alt=""
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => {
                      setFullScreenImages(selectedNode.images || null);
                      setFullScreenImageIdx(idx);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 hover:bg-red-600 rounded-full text-white text-[10px] flex items-center justify-center transition-colors border-none cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF Attachments Manager */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-wider">PDF Attachments</label>
          <div className="relative border border-dashed border-border/80 rounded-xl p-3 bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handlePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Upload PDFs</span>
            <span className="text-[8px] text-text-muted mt-0.5">Attach documents & readings</span>
          </div>

          {/* PDFs List */}
          {selectedNode.pdfs && selectedNode.pdfs.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {selectedNode.pdfs.map((pdf, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-surface-alt/50 border border-border/40 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPdfViewerPdf(pdf)}
                    className="flex items-center gap-1.5 text-text-secondary hover:text-primary text-xs truncate max-w-[160px] font-medium text-left border-none bg-transparent cursor-pointer"
                    title="Click to View PDF"
                  >
                    <span className="bg-red-500/10 text-red-500 px-1 py-0.5 text-[8px] font-black rounded uppercase shrink-0">PDF</span>
                    <span className="truncate">{pdf.name}</span>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={pdf.base64}
                      download={pdf.name}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] font-bold text-text-muted hover:text-primary uppercase tracking-wider px-1.5 py-0.5 rounded hover:bg-surface-alt transition-colors"
                      title="Download"
                    >
                      ↓
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemovePdf(idx)}
                      className="text-text-muted hover:text-red-500 transition-colors text-sm leading-none px-1 border-none bg-transparent cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
