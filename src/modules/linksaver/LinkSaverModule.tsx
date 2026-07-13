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
        setSavedLinks(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse saved links', e);
      }
    }
  }, []);

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
    setInputUrl('');
  };

  const handleDeleteLink = (id: string) => {
    const next = savedLinks.filter((l) => l.id !== id);
    saveLinksList(next);
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

  return (
    <div className="flex flex-col gap-5 text-left select-none max-h-[calc(100vh-180px)] overflow-hidden">
      
      {/* Clipboard Popup Banner */}
      {showPopup && detectedLink && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-black text-white p-3.5 border border-primary/20 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <IconClipboardText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Pasted Link Detected</span>
              <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md mt-0.5" title={detectedLink}>
                {detectedLink}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={handleDismissClipboard}
              className="text-[10px] font-bold uppercase text-zinc-450 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={handleSaveClipboardLink}
              className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border-none shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Manual Input form */}
      <form onSubmit={handleManualSubmit} className="flex gap-2 shrink-0">
        <input
          type="text"
          placeholder="Paste YouTube, Instagram, or Pinterest URL..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="input-field flex-1 font-sans text-xs bg-surface border border-border/60 rounded-xl px-3 py-2.5 outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          disabled={!inputUrl.trim() || !isValidLink(inputUrl)}
          className="btn btn-primary btn-md shrink-0 flex items-center gap-1.5 px-4 h-auto py-2 rounded-xl cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        >
          <IconPlus size={15} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </form>

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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-transparent whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover border-border/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookmarks List Container (scrolls independently to prevent keyboard overflow) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-16 flex flex-col gap-2.5">
        {filteredLinks.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted italic border border-dashed border-border/50 rounded-2xl bg-surface-alt/10">
            No saved links found.
          </div>
        ) : (
          filteredLinks.map((link) => {
            const ytId = link.type === 'youtube' ? getYouTubeId(link.url) : null;
            const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

            return (
              <div
                key={link.id}
                className="group relative bg-surface border border-border/70 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-border transition-all duration-200"
              >
                {/* Left Side: Small cover thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900/50 shrink-0 flex items-center justify-center relative">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : link.type === 'instagram' ? (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-650 flex items-center justify-center text-white">
                      <IconBrandInstagram className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  ) : link.type === 'pinterest' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white">
                      <IconBrandPinterest className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white">
                      <IconLink className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  )}
                </div>

                {/* Center Content: Title and URL description */}
                <div className="flex-1 min-w-0 text-left flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-text-primary truncate">
                      {link.title}
                    </span>
                    {/* Tiny Platform Icon */}
                    {link.type === 'youtube' && <IconBrandYoutube className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    {link.type === 'instagram' && <IconBrandInstagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                    {link.type === 'pinterest' && <IconBrandPinterest className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                  </div>
                  
                  <span className="text-[10px] text-text-secondary truncate block hover:text-primary transition-colors">
                    <a href={link.url} target="_blank" rel="noreferrer" className="no-underline text-inherit cursor-pointer">
                      {link.url}
                    </a>
                  </span>
                  
                  <span className="text-[8px] font-semibold text-text-muted mt-0.5">
                    {new Date(link.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Right Side: Quick Action Buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {/* Open Link */}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
                    title="Open Link"
                  >
                    <IconExternalLink size={14} />
                  </a>

                  {/* Copy Link */}
                  <button
                    onClick={() => handleCopyLink(link.id, link.url)}
                    className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer border-none bg-transparent"
                    title="Copy URL"
                  >
                    {copiedId === link.id ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                  </button>

                  {/* Delete Link */}
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                    title="Delete Link"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
