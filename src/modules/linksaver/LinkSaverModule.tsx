import { useState, useEffect, useMemo } from 'react';
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
        !savedLinks.some((l) => l.url === cleanedText) &&
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
    // Check when component mounts or tab focus changes
    void checkClipboard();
    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, [savedLinks, lastDismissedLink]);

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
    <div className="flex flex-col gap-6 text-left select-none">
      
      {/* Clipboard Popup Banner */}
      {showPopup && detectedLink && (
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-stone-900 to-neutral-950 text-white p-4 border border-primary/20 shadow-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <IconClipboardText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Detected Copied Link</span>
              <p className="text-xs font-bold text-white truncate max-w-sm sm:max-w-md md:max-w-lg mt-0.5" title={detectedLink}>
                {detectedLink}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleDismissClipboard}
              className="text-[10px] font-black uppercase text-stone-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={handleSaveClipboardLink}
              className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-subtle border-none"
            >
              Save Link
            </button>
          </div>
        </div>
      )}

      {/* Manual Input form */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Paste YouTube, Instagram, or Pinterest URL..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="input-field flex-1 font-sans text-xs bg-surface"
        />
        <button
          type="submit"
          disabled={!inputUrl.trim() || !isValidLink(inputUrl)}
          className="btn btn-primary btn-md shrink-0 flex items-center gap-1 h-auto py-2.5 rounded-xl cursor-pointer"
        >
          <IconPlus size={16} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </form>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
        {([
          { id: 'all', label: 'All Links' },
          { id: 'youtube', label: 'YouTube' },
          { id: 'instagram', label: 'Instagram' },
          { id: 'pinterest', label: 'Pinterest' },
          { id: 'other', label: 'Others' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover border-border/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List Grid */}
      {filteredLinks.length === 0 ? (
        <div className="py-16 text-center text-xs text-text-muted italic border border-dashed border-border/50 rounded-[32px] bg-surface-alt/20">
          No saved links found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => {
            const ytId = link.type === 'youtube' ? getYouTubeId(link.url) : null;
            const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

            return (
              <div
                key={link.id}
                className="group relative bg-surface border border-border/70 rounded-[28px] overflow-hidden flex flex-col justify-between shadow-subtle hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200 min-h-[220px]"
              >
                {/* Visual Header / Cover */}
                <div className="relative h-28 w-full bg-stone-100 dark:bg-stone-900/50 overflow-hidden shrink-0 flex items-center justify-center">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt="YouTube thumbnail" className="w-full h-full object-cover" />
                  ) : link.type === 'instagram' ? (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                      <IconBrandInstagram className="w-12 h-12 stroke-[1.2] opacity-80" />
                    </div>
                  ) : link.type === 'pinterest' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white">
                      <IconBrandPinterest className="w-12 h-12 stroke-[1.2] opacity-80" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-stone-950 flex items-center justify-center text-white">
                      <IconLink className="w-12 h-12 stroke-[1.2] opacity-60" />
                    </div>
                  )}

                  {/* Open Link hover overlay button (Apple style) */}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white cursor-pointer no-underline"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform transform scale-90 group-hover:scale-100 duration-200">
                      <IconExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </a>
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    {/* Platform Badge */}
                    <div className="flex items-center gap-1.5">
                      {link.type === 'youtube' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-red-500/10 text-red-500"><IconBrandYoutube className="w-3.5 h-3.5 shrink-0" />YouTube</span>}
                      {link.type === 'instagram' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-pink-500/10 text-pink-500"><IconBrandInstagram className="w-3.5 h-3.5 shrink-0" />Instagram</span>}
                      {link.type === 'pinterest' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-red-600/10 text-red-600"><IconBrandPinterest className="w-3.5 h-3.5 shrink-0" />Pinterest</span>}
                      {link.type === 'other' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-neutral-500/10 text-neutral-500"><IconLink className="w-3.5 h-3.5 shrink-0" />Web</span>}
                    </div>

                    {/* URL Snippet */}
                    <p className="text-xs font-bold text-text-primary mt-2 break-all line-clamp-2 leading-relaxed" title={link.url}>
                      {link.url}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-[9px] font-semibold text-text-muted">
                      {new Date(link.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyLink(link.id, link.url)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer border-none bg-transparent"
                        title="Copy Link URL"
                      >
                        {copiedId === link.id ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                        title="Delete Link"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
