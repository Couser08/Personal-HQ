import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconSearch, IconTrash, IconLink, IconCopy, IconCheck, 
  IconExternalLink, IconBrandYoutube, IconBrandInstagram, IconBrandPinterest, 
  IconClipboardText, IconClock, IconInfinity, IconEdit
} from '@tabler/icons-react';
import { useAppStore, type Link } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { TagInput } from '../../components/ui/TagInput';
import { EmptyState } from '../../components/ui/EmptyState';

export default function LinksModule() {
  const { links, addLink, deleteLink, updateLink, showConfirm } = useAppStore(
    useShallow(state => ({
      links: state.links,
      addLink: state.addLink,
      deleteLink: state.deleteLink,
      updateLink: state.updateLink,
      showConfirm: state.showConfirm,
    }))
  );
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'youtube' | 'instagram' | 'pinterest' | 'other'>('all');
  const [selectedTerm, setSelectedTerm] = useState<'all' | 'short' | 'long'>('all');

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [termType, setTermType] = useState<'short' | 'long'>('short');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Clipboard catcher states
  const [detectedLink, setDetectedLink] = useState<string | null>(null);
  const [showClipboardPopup, setShowClipboardPopup] = useState(false);
  const [lastDismissedLink, setLastDismissedLink] = useState<string | null>(null);

  // Link Detail view modal
  const [activeDetailLink, setActiveDetailLink] = useState<Link | null>(null);

  const linksRef = useRef<Link[]>(links);
  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  // Clipboard detection
  const isYouTube = (u: string) => /youtube\.com|youtu\.be/i.test(u);
  const isInstagram = (u: string) => /instagram\.com/i.test(u);
  const isPinterest = (u: string) => /pinterest\.com|pin\.it/i.test(u);
  
  const getYouTubeId = (u: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = u.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getDomain = (u: string) => {
    try {
      const urlObj = new URL(u);
      return urlObj.hostname;
    } catch {
      return u;
    }
  };

  const isValidLink = (u: string) => {
    try {
      const parsed = new URL(u);
      return isYouTube(u) || isInstagram(u) || isPinterest(u) || parsed.protocol.startsWith('http');
    } catch {
      return false;
    }
  };

  const checkClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) return;
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim();
      
      if (
        cleaned &&
        isValidLink(cleaned) &&
        !linksRef.current.some((l) => l.url === cleaned) &&
        cleaned !== lastDismissedLink
      ) {
        setDetectedLink(cleaned);
        setShowClipboardPopup(true);
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

  const handleOpenAddModal = () => {
    setEditingLink(null);
    setTitle('');
    setUrl('');
    setTags([]);
    setTermType('short');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link: Link, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLink(link);
    setTitle(link.title);
    setUrl(link.url);
    setTags(link.tags || []);
    setTermType((link.termType as 'short' | 'long') || 'short');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!url.trim()) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    let type: Link['type'] = 'other';
    if (isYouTube(finalUrl)) type = 'youtube';
    else if (isInstagram(finalUrl)) type = 'instagram';
    else if (isPinterest(finalUrl)) type = 'pinterest';

    let finalTitle = title.trim();
    if (!finalTitle) {
      if (type === 'youtube') finalTitle = 'YouTube Video';
      else if (type === 'instagram') finalTitle = 'Instagram Reel';
      else if (type === 'pinterest') finalTitle = 'Pinterest Pin';
      else finalTitle = getDomain(finalUrl);
    }

    const payload = {
      title: finalTitle,
      url: finalUrl,
      tags,
      type,
      termType,
    };

    if (editingLink) {
      void updateLink(editingLink.id, payload);
    } else {
      void addLink({
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        ...payload,
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveClipboardLink = () => {
    if (detectedLink) {
      let type: Link['type'] = 'other';
      if (isYouTube(detectedLink)) type = 'youtube';
      else if (isInstagram(detectedLink)) type = 'instagram';
      else if (isPinterest(detectedLink)) type = 'pinterest';

      let finalTitle = type === 'youtube' ? 'YouTube Video' : 
                       type === 'instagram' ? 'Instagram Reel' : 
                       type === 'pinterest' ? 'Pinterest Pin' : getDomain(detectedLink);

      void addLink({
        id: crypto.randomUUID(),
        url: detectedLink,
        title: finalTitle,
        tags: [],
        type,
        termType: 'short',
        savedAt: new Date().toISOString(),
      });
      setShowClipboardPopup(false);
      setDetectedLink(null);
    }
  };

  const handleDismissClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (detectedLink) {
      setLastDismissedLink(detectedLink);
    }
    setShowClipboardPopup(false);
    setDetectedLink(null);
  };

  const handleCopyLink = (id: string, linkUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Compile unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    links.forEach(l => (l.tags || []).forEach((t: string) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [links]);

  // Filters logic
  const filteredLinks = useMemo(() => {
    let list = links;
    
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l => l.title.toLowerCase().includes(s) || l.url.toLowerCase().includes(s));
    }
    if (selectedTag) {
      list = list.filter(l => l.tags?.includes(selectedTag));
    }
    if (selectedPlatform !== 'all') {
      list = list.filter(l => l.type === selectedPlatform);
    }
    if (selectedTerm !== 'all') {
      list = list.filter(l => (l.termType || 'short') === selectedTerm);
    }
    
    return list.sort((a, b) => new Date(b.savedAt || b.createdAt || 0).getTime() - new Date(a.savedAt || a.createdAt || 0).getTime());
  }, [links, search, selectedTag, selectedPlatform, selectedTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col h-full gap-6 select-none"
    >
      {/* ── Clipboard Caught Pop-up Card ── */}
      <AnimatePresence>
        {showClipboardPopup && detectedLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 80, rotate: -3 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -6, 0],
              rotate: [1, -1, 1],
              transition: {
                y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                rotate: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
              }
            }}
            exit={{ opacity: 0, scale: 0.7, y: 120, transition: { duration: 0.25 } }}
            style={{ x: '-50%', willChange: 'transform, opacity' }}
            onClick={handleSaveClipboardLink}
            className="fixed bottom-24 left-1/2 z-[9999] w-[90%] max-w-sm cursor-pointer p-4 bg-gradient-to-br from-zinc-950 via-stone-900 to-black text-white border border-primary/30 rounded-3xl shadow-[0_24px_60px_rgba(244,63,94,0.3)] flex flex-col gap-3 hover:border-primary/50"
          >
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
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase">👆 Click Card to Quick Save</span>
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2.5">
            Link Vault & Saver
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </h2>
          <p className="text-text-secondary text-sm">Organise resources, clipboard clips, and media bookmarks.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary btn-md flex items-center gap-1.5">
          <IconPlus className="w-4 h-4" /> Save Link
        </button>
      </div>

      {/* Controls: Search, Platform pills, Term type pills, Tag list */}
      <div className="flex flex-col gap-4 bg-surface-alt/40 border border-border/40 p-4.5 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              id="search-links"
              name="searchLinks"
              aria-label="Search links"
              type="search"
              placeholder="Search by title, domain, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 transition-all text-xs font-semibold"
            />
          </div>

          {/* Term Type pills */}
          <div className="flex bg-stone-100 dark:bg-stone-900/60 p-1.5 rounded-2xl border border-border/40 text-xs font-bold gap-1 shrink-0">
            {([
              { id: 'all', label: 'All Terms' },
              { id: 'short', label: 'Short Term' },
              { id: 'long', label: 'Long Term' },
            ] as const).map(t => (
              <button 
                key={t.id} 
                onClick={() => setSelectedTerm(t.id)}
                className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                  selectedTerm === t.id 
                    ? 'bg-surface text-primary shadow-sm border border-border/30 font-black' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-text-muted mr-2">Platforms:</span>
          {([
            { id: 'all', label: 'All' },
            { id: 'youtube', label: 'YouTube', icon: IconBrandYoutube, color: 'text-red-500' },
            { id: 'instagram', label: 'Instagram', icon: IconBrandInstagram, color: 'text-pink-500' },
            { id: 'pinterest', label: 'Pinterest', icon: IconBrandPinterest, color: 'text-red-600' },
            { id: 'other', label: 'Web/Others', icon: IconLink, color: 'text-zinc-500' }
          ] as { id: string; label: string; icon?: any; color?: string }[]).map((p) => {
            const Icon = p.icon;
            const active = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active 
                    ? 'bg-primary/10 text-primary border border-primary/20 font-bold' 
                    : 'bg-surface hover:bg-surface-hover border border-border/40 text-text-secondary hover:text-text-primary'
                }`}
              >
                {Icon && <Icon size={14} className={p.color} />}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tags badges list */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/20">
            <span className="text-[10px] uppercase font-black tracking-widest text-text-muted mr-2">Tags:</span>
            <Badge 
              variant={selectedTag === null ? 'primary' : 'default'} 
              className="cursor-pointer font-bold text-[10px]"
              onClick={() => setSelectedTag(null)}
            >
              All Tags
            </Badge>
            {allTags.map(tag => (
              <Badge 
                key={tag} 
                variant={selectedTag === tag ? 'primary' : 'default'} 
                className="cursor-pointer font-bold text-[10px]"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Link Cards */}
      {filteredLinks.length === 0 ? (
        <EmptyState
          icon={<IconLink className="w-9 h-9 text-text-muted" />}
          title="No links matched"
          description="Save links using the button above or copy any link to clipboard and focus back here."
          action={
            <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
              <IconPlus className="w-4 h-4" /> Save First Link
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
          <AnimatePresence>
            {filteredLinks.map(link => {
              const ytId = link.type === 'youtube' ? getYouTubeId(link.url) : null;
              const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
              const domain = getDomain(link.url);
              const isLongTerm = link.termType === 'long';
              return (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setActiveDetailLink(link)}
                  className={`bg-surface/30 dark:bg-zinc-950/40 backdrop-blur-md border border-border/30 hover:border-border dark:border-zinc-900/60 dark:hover:border-zinc-800 p-5 rounded-[28px] flex flex-col gap-4 group transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 cursor-pointer relative overflow-hidden ${
                    link.type === 'youtube' ? 'hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.12)] hover:border-red-500/30' :
                    link.type === 'instagram' ? 'hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.12)] hover:border-pink-500/30' :
                    link.type === 'pinterest' ? 'hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.12)] hover:border-red-600/30' : 
                    'hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.12)] hover:border-primary/20'
                  }`}
                >
                  {/* Platform visual or Thumbnail */}
                  <div className="relative w-full h-34 rounded-[22px] overflow-hidden bg-stone-100 dark:bg-zinc-900/40 flex items-center justify-center shrink-0 border border-border/30 dark:border-zinc-900/40 shadow-inner">
                    {thumbUrl ? (
                      <img 
                        src={thumbUrl} 
                        alt="Video Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                    ) : link.type === 'instagram' ? (
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                        <IconBrandInstagram className="w-10 h-10 stroke-[1.25] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    ) : link.type === 'pinterest' ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white">
                        <IconBrandPinterest className="w-10 h-10 stroke-[1.25] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-850 to-zinc-950 flex items-center justify-center text-white">
                        <IconLink className="w-10 h-10 stroke-[1.25] text-zinc-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                    {/* Platform Brand Badge on visual */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white flex items-center gap-1.5 border border-white/10 shadow-sm z-10">
                      {link.type === 'youtube' && <IconBrandYoutube size={12} className="text-red-500" />}
                      {link.type === 'instagram' && <IconBrandInstagram size={12} className="text-pink-500" />}
                      {link.type === 'pinterest' && <IconBrandPinterest size={12} className="text-red-600" />}
                      {link.type === 'other' && <IconLink size={12} className="text-zinc-400" />}
                      <span>{link.type === 'other' ? 'Web' : link.type}</span>
                    </div>

                    {/* Term type Badge */}
                    <div className="absolute bottom-3 right-3 z-10">
                      {isLongTerm ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-full bg-emerald-500/90 text-white border border-emerald-400/20 shadow-md">
                          <IconInfinity size={10} strokeWidth={3} /> Long Term
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-full bg-amber-500/95 text-stone-950 border border-amber-400/20 shadow-md">
                          <IconClock size={10} strokeWidth={3} /> Temp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Domain info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-left">
                    <h3 className="font-extrabold text-[14px] leading-snug text-text-primary group-hover:text-primary transition-colors line-clamp-2" title={link.title}>
                      {link.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold">
                      <span className="truncate">{domain}</span>
                      {link.savedAt && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-border/80" />
                          <span>
                            {new Date(link.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tags and actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/30 dark:border-zinc-900 mt-auto">
                    {/* Tags slice */}
                    <div className="flex flex-wrap gap-1 max-w-[55%] overflow-hidden">
                      {link.tags && link.tags.length > 0 ? (
                        link.tags.slice(0, 2).map((t: string) => (
                          <Badge key={t} className="text-[9px] py-0.5 px-2 bg-primary/5 text-primary border-none rounded-md font-semibold">
                            {t}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[9px] text-text-muted italic font-medium">No tags</span>
                      )}
                      {link.tags && link.tags.length > 2 && (
                        <Badge className="text-[9px] py-0.5 px-2 bg-surface-alt text-text-muted border-none rounded-md font-semibold">
                          +{link.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Actions on card */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={(e) => handleCopyLink(link.id, link.url, e)}
                        className="w-7.5 h-7.5 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent active:scale-90"
                        title="Copy URL"
                      >
                        {copiedId === link.id ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={(e) => handleOpenEditModal(link, e)}
                        className="w-7.5 h-7.5 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-none bg-transparent active:scale-90"
                        title="Edit details"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm('Delete Bookmark', 'Are you sure you want to delete this link?', () => {
                            void deleteLink(link.id);
                          });
                        }}
                        className="w-7.5 h-7.5 rounded-xl flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent active:scale-90"
                        title="Delete"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLink ? 'Edit Saved Link' : 'Save New Resource Link'}
      >
        <div className="flex flex-col gap-4 text-left">
          {/* URL Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-link-url" className="text-xs font-black uppercase text-text-muted">URL</label>
            <input
              id="modal-link-url"
              name="url"
              type="url"
              placeholder="e.g. https://react.dev"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50 text-xs font-semibold"
            />
          </div>

          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-link-title" className="text-xs font-black uppercase text-text-muted">Title (Optional)</label>
            <input
              id="modal-link-title"
              name="title"
              type="text"
              placeholder="Leave blank to auto-generate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50 text-xs font-semibold"
            />
          </div>

          {/* Term Type Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase text-text-muted">Retention Term</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTermType('short')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  termType === 'short'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : 'bg-surface-alt border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <IconClock size={14} /> Temporary Clip
              </button>
              <button
                type="button"
                onClick={() => setTermType('long')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  termType === 'long'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : 'bg-surface-alt border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <IconInfinity size={14} /> Long-Term Vault
              </button>
            </div>
          </div>

          {/* Tags input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-text-muted">Tags (press Enter)</label>
            <TagInput tags={tags} onChange={setTags} placeholder="e.g. dev, study, work" />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/40">
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-md rounded-xl cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary btn-md rounded-xl cursor-pointer">
              {editingLink ? 'Update Link' : 'Save Link'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Details & Inline YouTube Embed Player Modal ── */}
      <Modal
        isOpen={activeDetailLink !== null}
        onClose={() => setActiveDetailLink(null)}
        title={activeDetailLink?.title || 'Link Information'}
      >
        {activeDetailLink && (
          <div className="flex flex-col gap-4 text-left">
            {/* Inline YouTube Player if URL is YouTube */}
            {activeDetailLink.type === 'youtube' && getYouTubeId(activeDetailLink.url) && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-border">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeDetailLink.url)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="flex flex-col gap-2 p-4 bg-surface-alt/60 rounded-2xl border border-border/40">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Direct Address</span>
              <a
                href={activeDetailLink.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:underline break-all flex items-center gap-1.5"
              >
                {activeDetailLink.url}
                <IconExternalLink size={14} className="shrink-0" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Retention Type</span>
                <div className="mt-1">
                  {activeDetailLink.termType === 'long' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                      <IconInfinity size={12} /> Long-Term Vault
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/25">
                      <IconClock size={12} /> Temporary Clip
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Platform Category</span>
                <span className="mt-1 text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-1">
                  {activeDetailLink.type === 'youtube' && <IconBrandYoutube size={15} className="text-red-500" />}
                  {activeDetailLink.type === 'instagram' && <IconBrandInstagram size={15} className="text-pink-500" />}
                  {activeDetailLink.type === 'pinterest' && <IconBrandPinterest size={15} className="text-red-600" />}
                  {activeDetailLink.type === 'other' && <IconLink size={15} className="text-zinc-400" />}
                  {activeDetailLink.type === 'other' ? 'Web Link' : activeDetailLink.type}
                </span>
              </div>
            </div>

            {/* Tags section */}
            {activeDetailLink.tags && activeDetailLink.tags.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Attached Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeDetailLink.tags || []).map((t: string) => (
                    <Badge key={t} variant="primary" className="text-[10px] font-bold py-0.5 px-2.5">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Footer action logs */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
              <span className="text-[9px] font-bold text-text-muted">
                Saved on {new Date(activeDetailLink.savedAt || activeDetailLink.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    const l = activeDetailLink;
                    setActiveDetailLink(null);
                    handleOpenEditModal(l, e);
                  }}
                  className="btn btn-secondary btn-sm flex items-center gap-1"
                >
                  <IconEdit size={14} /> Edit details
                </button>
                <button
                  onClick={() => {
                    const id = activeDetailLink.id;
                    setActiveDetailLink(null);
                    showConfirm('Delete Link', 'Delete this bookmark permanently?', () => {
                      void deleteLink(id);
                    });
                  }}
                  className="px-4 py-2 text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none rounded-xl transition-all cursor-pointer"
                >
                  Delete Link
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
