import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore, type SavedLink } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandPinterest,
  IconLink,
  IconClipboardText,
  IconCheck,
  IconExternalLink,
} from '@tabler/icons-react';

export default function LinkSaverModule() {
  const { savedLinks, addSavedLink, deleteSavedLink } = useAppStore(
    useShallow((state) => ({
      savedLinks: state.savedLinks,
      addSavedLink: state.addSavedLink,
      deleteSavedLink: state.deleteSavedLink,
    }))
  );

  const [inputUrl, setInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'youtube' | 'instagram' | 'pinterest' | 'other'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Clipboard detection states
  const [detectedLink, setDetectedLink] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [lastDismissedLink, setLastDismissedLink] = useState<string | null>(null);

  // Active Selected Link for Details view
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Use a ref to prevent re-triggering the checkClipboard useEffect on savedLinks changes
  const savedLinksRef = useRef<SavedLink[]>(savedLinks);
  useEffect(() => {
    savedLinksRef.current = savedLinks;
  }, [savedLinks]);

  // Set initial selected link
  useEffect(() => {
    if (savedLinks.length > 0 && !selectedLinkId) {
      setSelectedLinkId(savedLinks[0].id);
    }
  }, [savedLinks, selectedLinkId]);

  // Helper functions
  const isYouTube = (url: string) => /youtube\.com|youtu\.be/i.test(url);
  const isInstagram = (url: string) => /instagram\.com/i.test(url);
  const isPinterest = (url: string) => /pinterest\.com|pin\.it/i.test(url);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const isValidLink = (url: string) => {
    try {
      const parsed = new URL(url);
      return isYouTube(url) || isInstagram(url) || isPinterest(url) || parsed.protocol.startsWith('http');
    } catch {
      return false;
    }
  };

  // Check Clipboard on Tab/Window Focus
  const checkClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) return;
      const text = await navigator.clipboard.readText();
      const cleanedText = text.trim();
      
      if (
        cleanedText &&
        isValidLink(cleanedText) &&
        !savedLinksRef.current.some((l) => l.url === cleanedText) &&
        cleanedText !== lastDismissedLink
      ) {
        setDetectedLink(cleanedText);
        setShowPopup(true);
      }
    } catch (err) {
      console.log('Clipboard permission not granted or unsupported', err);
    }
  };

  useEffect(() => {
    void checkClipboard();
    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, [lastDismissedLink]);

  // Action handlers
  const handleAddLink = async (url: string) => {
    const cleaned = url.trim();
    if (!cleaned || !isValidLink(cleaned)) return;

    let type: SavedLink['type'] = 'other';
    if (isYouTube(cleaned)) type = 'youtube';
    else if (isInstagram(cleaned)) type = 'instagram';
    else if (isPinterest(cleaned)) type = 'pinterest';

    let customTitle = 'Web Link';
    if (type === 'youtube') {
      const ytId = getYouTubeId(cleaned);
      customTitle = ytId ? `YouTube Video` : 'YouTube Link';
    } else if (type === 'instagram') {
      customTitle = 'Instagram Reel';
    } else if (type === 'pinterest') {
      customTitle = 'Pinterest Pin';
    }

    const newLink: SavedLink = {
      id: crypto.randomUUID(),
      url: cleaned,
      title: customTitle,
      type,
      savedAt: new Date().toISOString(),
    };

    try {
      await addSavedLink(newLink);
      setSelectedLinkId(newLink.id);
      setInputUrl('');
    } catch (err) {
      console.error('Failed to add saved link', err);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteSavedLink(id);
      if (selectedLinkId === id) {
        const remaining = savedLinks.filter((l) => l.id !== id);
        setSelectedLinkId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete saved link', err);
    }
  };

  const handleCopyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleAddLink(inputUrl);
  };

  const handleSaveClipboardLink = () => {
    if (detectedLink) {
      void handleAddLink(detectedLink);
      setShowPopup(false);
      setDetectedLink(null);
    }
  };

  const handleDismissClipboard = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the save click
    if (detectedLink) {
      setLastDismissedLink(detectedLink);
    }
    setShowPopup(false);
    setDetectedLink(null);
  };

  // Filter links
  const filteredLinks = useMemo(() => {
    return savedLinks.filter((l) => (activeTab === 'all' ? true : l.type === activeTab));
  }, [savedLinks, activeTab]);

  const activeLink = useMemo(() => {
    return savedLinks.find((l) => l.id === selectedLinkId) || null;
  }, [savedLinks, selectedLinkId]);

  const ytId = activeLink && activeLink.type === 'youtube' ? getYouTubeId(activeLink.url) : null;
  const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <div className="flex flex-col gap-4 text-left select-none max-h-[calc(100vh-130px)] overflow-hidden relative">
      
      {/* ── Floating "Flying on Air" Clipboard Card ── */}
      <AnimatePresence>
        {showPopup && detectedLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 80, rotate: -6 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10, 0],
              rotate: [2, -2, 2],
              transition: {
                y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 8, ease: 'easeInOut' },
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.6,
              y: 200,
              rotate: -12,
              transition: { duration: 0.35, ease: 'easeIn' }
            }}
            style={{ x: '-50%', willChange: 'transform, opacity' }}
            onClick={handleSaveClipboardLink}
            className="fixed bottom-24 left-1/2 z-[9999] w-[90%] max-w-sm cursor-pointer p-4 bg-gradient-to-br from-zinc-950 via-stone-900 to-black text-white border border-primary/30 rounded-3xl shadow-[0_24px_60px_rgba(244,63,94,0.35)] flex flex-col gap-3 hover:border-primary/60 transition-colors"
          >
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <IconClipboardText className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Clipboard Link Caught</span>
                <h4 className="text-xs font-bold text-white truncate w-[200px]" title={detectedLink}>
                  {detectedLink}
                </h4>
              </div>
            </div>

            {/* Hint & Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase">👆 Click Card to Save</span>
              
              <button
                onClick={handleDismissClipboard}
                className="text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl transition-colors border-none bg-white/5 cursor-pointer hover:bg-white/10"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Details Container (Dual-State Card) ── */}
      <div className="bg-surface border border-border/70 rounded-3xl p-4.5 shadow-sm min-h-[170px] flex flex-col justify-between shrink-0 relative overflow-hidden transition-all duration-300">
        {activeLink && selectedLinkId ? (
          /* State 1: Bookmark Details View */
          <div className="flex flex-col justify-between h-full gap-3">
            <div className="flex items-start gap-4">
              {/* Media Thumbnail or Platform Icon */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900/50 shrink-0 flex items-center justify-center relative shadow-inner">
                {thumbUrl ? (
                  <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : activeLink.type === 'instagram' ? (
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                    <IconBrandInstagram className="w-6 h-6 stroke-[1.5]" />
                  </div>
                ) : activeLink.type === 'pinterest' ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white">
                    <IconBrandPinterest className="w-6 h-6 stroke-[1.5]" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white">
                    <IconLink className="w-6 h-6 stroke-[1.5]" />
                  </div>
                )}
              </div>

              {/* Title & Platform info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1 text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-text-primary truncate leading-tight">
                    {activeLink.title}
                  </h3>
                  {activeLink.type === 'youtube' && <IconBrandYoutube className="w-4 h-4 text-red-500 shrink-0" />}
                  {activeLink.type === 'instagram' && <IconBrandInstagram className="w-4 h-4 text-pink-500 shrink-0" />}
                  {activeLink.type === 'pinterest' && <IconBrandPinterest className="w-4 h-4 text-red-600 shrink-0" />}
                </div>

                <a 
                  href={activeLink.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-primary font-bold hover:underline truncate block leading-snug"
                >
                  {activeLink.url}
                </a>

                <span className="text-[9px] font-bold text-text-muted mt-0.5">
                  Saved on {new Date(activeLink.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Bottom action drawer */}
            <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
              {/* Back to add button */}
              <button
                onClick={() => setSelectedLinkId(null)}
                className="text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent"
              >
                <IconPlus className="w-3.5 h-3.5" /> Add New Link
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={activeLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-alt border border-border text-text-primary hover:bg-surface-hover flex items-center gap-1 cursor-pointer no-underline"
                >
                  <IconExternalLink size={14} /> Open
                </a>
                <button
                  onClick={() => handleCopyLink(activeLink.id, activeLink.url)}
                  className="p-2 rounded-xl bg-surface-alt border border-border text-text-muted hover:text-text-primary cursor-pointer flex items-center justify-center"
                  title="Copy URL"
                >
                  {copiedId === activeLink.id ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                </button>
                <button
                  onClick={() => handleDeleteLink(activeLink.id)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer flex items-center justify-center border-none"
                  title="Delete Bookmark"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Save New Link Input Form */
          <form onSubmit={handleManualSubmit} className="flex flex-col justify-between h-full gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">Save New Bookmark</h3>
              <input
                type="text"
                placeholder="Paste YouTube, Instagram, or Pinterest URL..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="input-field w-full font-sans text-xs bg-surface-alt border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary/50"
              />
            </div>
            
            <div className="flex justify-between items-center border-t border-border/40 pt-3">
              {savedLinks.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedLinkId(savedLinks[0].id)}
                  className="text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
              ) : (
                <span className="text-[10px] text-text-muted">Fill field to save</span>
              )}

              <button
                type="submit"
                disabled={!inputUrl.trim() || !isValidLink(inputUrl)}
                className="btn btn-primary btn-md shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <IconPlus size={15} /> Save Link
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-border/40 shrink-0">
        {([
          { id: 'all', label: 'All' },
          { id: 'youtube', label: 'YouTube' },
          { id: 'instagram', label: 'Instagram' },
          { id: 'pinterest', label: 'Pinterest' },
          { id: 'other', label: 'Others' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-primary/20 font-black'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover border-border/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Middle: Normal Responsive Grid Layout (Replaced circular carousel) ── */}
      <div className="flex-grow overflow-y-auto no-scrollbar max-h-[300px] mt-2 pr-1 pb-4">
        {filteredLinks.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted italic border border-dashed border-border/50 rounded-2xl bg-surface-alt/10 w-full mx-auto">
            No bookmarks saved in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <AnimatePresence>
              {filteredLinks.map((link) => {
                const active = link.id === selectedLinkId;
                const linkYtId = link.type === 'youtube' ? getYouTubeId(link.url) : null;
                const linkThumbUrl = linkYtId ? `https://img.youtube.com/vi/${linkYtId}/hqdefault.jpg` : null;

                return (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{ willChange: 'transform, opacity' }}
                    onClick={() => setSelectedLinkId(link.id)}
                    className={`p-3 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all duration-200 group relative ${
                      active
                        ? 'border-primary bg-primary/5 shadow-sm shadow-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-hover'
                    }`}
                  >
                    {/* Media Thumbnail or Platform Icon */}
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900/50 flex items-center justify-center shrink-0 shadow-inner">
                      {linkThumbUrl ? (
                        <img src={linkThumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : link.type === 'instagram' ? (
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                          <IconBrandInstagram className="w-8 h-8 stroke-[1.5]" />
                        </div>
                      ) : link.type === 'pinterest' ? (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white">
                          <IconBrandPinterest className="w-8 h-8 stroke-[1.5]" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white">
                          <IconLink className="w-8 h-8 stroke-[1.5]" />
                        </div>
                      )}

                      {/* Small badge representing active */}
                      {active && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface animate-pulse" />
                      )}
                    </div>

                    {/* Title & Platform details */}
                    <div className="flex flex-col gap-0.5 text-left min-w-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-black text-text-primary truncate w-full" title={link.title}>
                          {link.title}
                        </span>
                        {link.type === 'youtube' && <IconBrandYoutube className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        {link.type === 'instagram' && <IconBrandInstagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                        {link.type === 'pinterest' && <IconBrandPinterest className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                      </div>
                      <span className="text-[9px] text-primary truncate font-bold block">{link.url}</span>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[8px] text-text-muted">
                          {new Date(link.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteLink(link.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                          title="Delete Bookmark"
                        >
                          <IconTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Spacer to push content above mobile virtual keyboards */}
      <div className="h-6 shrink-0" />
    </div>
  );
}
