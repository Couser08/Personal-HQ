import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconLink } from '@tabler/icons-react';
import { useAppStore, type Link } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '../../components/ui/EmptyState';
import { isYouTube, isInstagram, isPinterest, getDomain, isValidLink } from './utils/linkHelpers';
import { ClipboardPopupCard } from './components/ClipboardPopupCard';
import { LinkFiltersBar } from './components/LinkFiltersBar';
import { LinkCardItem } from './components/LinkCardItem';
import { LinkEditModal } from './components/LinkEditModal';
import { LinkDetailModal } from './components/LinkDetailModal';

export default function LinksModule() {
  const { links, addLink, deleteLink, updateLink, showConfirm } = useAppStore(
    useShallow((state) => ({
      links: state.links,
      addLink: state.addLink,
      deleteLink: state.deleteLink,
      updateLink: state.updateLink,
      showConfirm: state.showConfirm,
    })),
  );

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<
    'all' | 'youtube' | 'instagram' | 'pinterest' | 'other'
  >('all');
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

      let finalTitle =
        type === 'youtube'
          ? 'YouTube Video'
          : type === 'instagram'
          ? 'Instagram Reel'
          : type === 'pinterest'
          ? 'Pinterest Pin'
          : getDomain(detectedLink);

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
    links.forEach((l) => (l.tags || []).forEach((t: string) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [links]);

  // Filters logic
  const filteredLinks = useMemo(() => {
    let list = links;

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (l) => l.title.toLowerCase().includes(s) || l.url.toLowerCase().includes(s),
      );
    }
    if (selectedTag) {
      list = list.filter((l) => l.tags?.includes(selectedTag));
    }
    if (selectedPlatform !== 'all') {
      list = list.filter((l) => l.type === selectedPlatform);
    }
    if (selectedTerm !== 'all') {
      list = list.filter((l) => (l.termType || 'short') === selectedTerm);
    }

    return list.sort(
      (a, b) =>
        new Date(b.savedAt || b.createdAt || 0).getTime() -
        new Date(a.savedAt || a.createdAt || 0).getTime(),
    );
  }, [links, search, selectedTag, selectedPlatform, selectedTerm]);

  return (
    <motion.div
      data-component="LinkVaultModule"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col h-full gap-6 select-none text-left font-sans"
    >
      {/* Clipboard Caught Pop-up Card */}
      <ClipboardPopupCard
        showClipboardPopup={showClipboardPopup}
        detectedLink={detectedLink}
        handleSaveClipboardLink={handleSaveClipboardLink}
        handleDismissClipboard={handleDismissClipboard}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary leading-tight">
              Link Vault &amp; Saver
            </h2>
            <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0 animate-pulse" />
          </div>
          <p className="text-[13.5px] sm:text-[14px] text-text-secondary leading-relaxed mt-0.5">
            Organise resources, clipboard clips, and media bookmarks.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-md flex items-center gap-1.5"
        >
          <IconPlus className="w-4 h-4" /> Save Link
        </button>
      </div>

      {/* Controls: Search, Platform pills, Term type pills, Tag list */}
      <LinkFiltersBar
        search={search}
        setSearch={setSearch}
        selectedTerm={selectedTerm}
        setSelectedTerm={setSelectedTerm}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        allTags={allTags}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />

      {/* Grid of Link Cards */}
      {filteredLinks.length === 0 ? (
        <EmptyState
          icon={<IconLink className="w-9 h-9 text-text-tertiary" />}
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
            {filteredLinks.map((link) => (
              <LinkCardItem
                key={link.id}
                link={link}
                copiedId={copiedId}
                onSelect={setActiveDetailLink}
                onCopy={handleCopyLink}
                onEdit={handleOpenEditModal}
                onDelete={(id, e) => {
                  e.stopPropagation();
                  showConfirm(
                    'Delete Bookmark',
                    'Are you sure you want to delete this link?',
                    () => {
                      void deleteLink(id);
                    },
                  );
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <LinkEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingLink={editingLink}
        url={url}
        setUrl={setUrl}
        title={title}
        setTitle={setTitle}
        termType={termType}
        setTermType={setTermType}
        tags={tags}
        setTags={setTags}
        handleSave={handleSave}
      />

      {/* Details & Inline YouTube Embed Player Modal */}
      <LinkDetailModal
        link={activeDetailLink}
        isOpen={activeDetailLink !== null}
        onClose={() => setActiveDetailLink(null)}
        onOpenEditModal={handleOpenEditModal}
        deleteLink={deleteLink}
        showConfirm={showConfirm}
      />
    </motion.div>
  );
}
