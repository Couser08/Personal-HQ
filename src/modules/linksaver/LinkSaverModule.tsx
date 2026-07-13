import { useState, useEffect, useMemo, useRef } from 'react';
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
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';

interface SavedLink {
  id: string;
  url: string;
  title: string;
  type: 'youtube' | 'instagram' | 'pinterest' | 'other';
  savedAt: string;
}

export default function LinkSaverModule() {
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'youtube' | 'instagram' | 'pinterest' | 'other'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Clipboard detection states
  const [detectedLink, setDetectedLink] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [lastDismissedLink, setLastDismissedLink] = useState<string | null>(null);

  // Active Selected Link for Details view
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Pagination for the curved arc cards (5 per page)
  const [arcPage, setArcPage] = useState(0);

  // Use a ref to prevent re-triggering the checkClipboard useEffect on savedLinks changes
  const savedLinksRef = useRef<SavedLink[]>(savedLinks);
  useEffect(() => {
    savedLinksRef.current = savedLinks;
  }, [savedLinks]);

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('focusflow-link-saver');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSavedLinks(parsed);
        if (parsed.length > 0) {
          setSelectedLinkId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse saved links', e);
      }
    }
  }, []);

  // Reset page when tab changes
  useEffect(() => {
    setArcPage(0);
  }, [activeTab]);

  const saveLinksList = (list: SavedLink[]) => {
    setSavedLinks(list);
    localStorage.setItem('focusflow-link-saver', JSON.stringify(list));
  };

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
  const handleAddLink = (url: string) => {
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

    const next = [newLink, ...savedLinks];
    saveLinksList(next);
    setSelectedLinkId(newLink.id);
    setInputUrl('');
  };

  const handleDeleteLink = (id: string) => {
    const next = savedLinks.filter((l) => l.id !== id);
    saveLinksList(next);
    
    // Auto-adjust selected link ID
    if (selectedLinkId === id) {
      setSelectedLinkId(next.length > 0 ? next[0].id : null);
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
    handleAddLink(inputUrl);
  };

  const handleSaveClipboardLink = () => {
    if (detectedLink) {
      handleAddLink(detectedLink);
      setShowPopup(false);
      setDetectedLink(null);
    }
  };

  const handleDismissClipboard = () => {
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

  // Paginated links for the curved arc (5 per page)
  const arcLinks = useMemo(() => {
    return filteredLinks.slice(arcPage * 5, (arcPage + 1) * 5);
  }, [filteredLinks, arcPage]);

  const maxArcPages = Math.ceil(filteredLinks.length / 5);

  const activeLink = useMemo(() => {
    return savedLinks.find((l) => l.id === selectedLinkId) || null;
  }, [savedLinks, selectedLinkId]);

  const ytId = activeLink && activeLink.type === 'youtube' ? getYouTubeId(activeLink.url) : null;
  const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <div className="flex flex-col gap-4 text-left select-none max-h-[calc(100vh-130px)] overflow-hidden">
      
      {/* Clipboard Popup Banner */}
      {showPopup && detectedLink && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-black text-white p-3 border border-primary/20 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <IconClipboardText className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Pasted Link Detected</span>
              <p className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-md mt-0.5" title={detectedLink}>
                {detectedLink}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={handleDismissClipboard}
              className="text-[10px] font-bold uppercase text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={handleSaveClipboardLink}
              className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border-none shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}

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

      {/* ── Middle: Curved Arc Carousel ── */}
      <div className="relative flex-grow flex items-center justify-center min-h-[170px] max-h-[220px] select-none mt-2 overflow-visible">
        
        {/* Pagination Left button */}
        {maxArcPages > 1 && (
          <button
            onClick={() => setArcPage((prev) => Math.max(prev - 1, 0))}
            disabled={arcPage === 0}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-[110] w-8 h-8 rounded-xl bg-surface hover:bg-surface-hover border border-border text-text-secondary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer shadow-md"
          >
            <IconChevronLeft size={16} />
          </button>
        )}

        {/* Empty State */}
        {filteredLinks.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted italic border border-dashed border-border/50 rounded-2xl bg-surface-alt/10 w-full mx-4">
            No bookmarks saved.
          </div>
        ) : (
          /* Circular Arc representation */
          <div className="relative w-full h-full flex items-center justify-center overflow-visible">
            {arcLinks.map((link, idx) => {
              const N = arcLinks.length;
              // Normalize coordinate x from -1 to +1
              const x = N === 1 ? 0 : -1 + (2 * idx) / (N - 1);
              
              // Spacing horizontal width based on N count
              const horizontalSpread = N === 5 ? 38 : N === 4 ? 34 : N === 3 ? 28 : N === 2 ? 18 : 0;
              const leftPct = 50 + x * horizontalSpread;
              
              // Parabolic curve: translateY goes down on sides (ends are lowest)
              const depth = 28; // px vertical offset
              const translateY = Math.pow(x, 2) * depth;
              
              // Rotational angle along circular path
              const rotation = x * 10; // degrees
              
              const active = link.id === selectedLinkId;
              const linkYtId = link.type === 'youtube' ? getYouTubeId(link.url) : null;
              const linkThumbUrl = linkYtId ? `https://img.youtube.com/vi/${linkYtId}/hqdefault.jpg` : null;

              return (
                <div
                  key={link.id}
                  onClick={() => setSelectedLinkId(link.id)}
                  style={{
                    left: `${leftPct}%`,
                    transform: `translateX(-50%) translateY(${translateY}px) rotate(${rotation}deg)`,
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`absolute w-13 h-13 sm:w-15 sm:h-15 rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center shadow-md select-none group border-2 z-[100] ${
                    active 
                      ? 'border-primary ring-4 ring-primary/10 z-[105] scale-105' 
                      : 'border-border bg-surface hover:border-primary/40 hover:scale-103'
                  }`}
                >
                  {/* Miniature Cover Thumbnail */}
                  {linkThumbUrl ? (
                    <img src={linkThumbUrl} alt="Bookmark" className="w-full h-full object-cover" />
                  ) : link.type === 'instagram' ? (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                      <IconBrandInstagram className="w-5.5 h-5.5" />
                    </div>
                  ) : link.type === 'pinterest' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white">
                      <IconBrandPinterest className="w-5.5 h-5.5" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white">
                      <IconLink className="w-5.5 h-5.5" />
                    </div>
                  )}

                  {/* Micro Badge for active */}
                  {active && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface animate-pulse" />
                  )}

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow z-[999]">
                    {link.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Right button */}
        {maxArcPages > 1 && (
          <button
            onClick={() => setArcPage((prev) => Math.min(prev + 1, maxArcPages - 1))}
            disabled={arcPage === maxArcPages - 1}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-[110] w-8 h-8 rounded-xl bg-surface hover:bg-surface-hover border border-border text-text-secondary disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer shadow-md"
          >
            <IconChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Arc Page Indicator dots */}
      {maxArcPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-0.5 shrink-0">
          {Array.from({ length: maxArcPages }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === arcPage ? 'bg-primary w-3' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Spacer to push content above mobile virtual keyboards */}
      <div className="h-6 shrink-0" />
    </div>
  );
}
