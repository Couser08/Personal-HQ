import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconSearch, IconTrash, IconLink as IconLinkTabler, IconCopy, IconCheck } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { TagInput } from '../../components/ui/TagInput';
import { EmptyState } from '../../components/ui/EmptyState';

export default function LinksModule() {
  const { links, addLink, deleteLink , showConfirm} = useAppStore(useShallow(state => ({
    links: state.links,
    addLink: state.addLink,
    deleteLink: state.deleteLink,
    showConfirm: state.showConfirm,
  })));
  
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleOpenModal = () => {
    setTitle('');
    setUrl('');
    setTags([]);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    addLink({
      id: crypto.randomUUID(),
      title,
      url: finalUrl,
      tags,
      savedAt: new Date().toISOString()
    });
    
    setIsModalOpen(false);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    links.forEach(l => l.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [links]);

  const filteredLinks = useMemo(() => {
    let filtered = links;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l => l.title.toLowerCase().includes(s) || l.url.toLowerCase().includes(s));
    }
    if (selectedTag) {
      filtered = filtered.filter(l => l.tags.includes(selectedTag));
    }
    return filtered.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }, [links, search, selectedTag]);

  const getDomain = (linkUrl: string) => {
    try {
      const urlObj = new URL(linkUrl);
      return urlObj.hostname;
    } catch {
      return linkUrl;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full gap-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Link Vault <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </h2>
          <p className="text-text-secondary text-sm">Save and organize your important links</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="btn btn-primary btn-md"
        >
          <IconPlus className="w-4 h-4" /> Add Link
        </button>
      </div>

      {/* Search — full width, then tags below */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search links…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-alt border border-border-alt rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant={selectedTag === null ? 'primary' : 'default'} onClick={() => setSelectedTag(null)}>All</Badge>
            {allTags.map(tag => (
              <Badge key={tag} variant={selectedTag === tag ? 'primary' : 'default'} onClick={() => setSelectedTag(tag)}>{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={<IconLinkTabler className="w-9 h-9 text-text-muted" />}
          title="No links saved yet"
          description="Create a centralized vault for all your important resources, articles, and tools."
          action={
            <button onClick={handleOpenModal} className="btn btn-primary btn-md">
              <IconPlus className="w-4 h-4" /> Add First Link
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredLinks.map(link => (
              <LinkCard 
                key={link.id}
                link={link}
                onDelete={(id) => {
                  showConfirm('Confirm Delete', 'Delete this link?', () => { deleteLink(id); });
                }}
                getDomain={getDomain}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Link"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Title</label>
            <input
              type="text"
              placeholder="e.g. React Documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">URL</label>
            <input
              type="url"
              placeholder="e.g. https://react.dev"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Tags (press Enter to add)</label>
            <TagInput tags={tags} onChange={setTags} placeholder="e.g. dev, docs, frontend" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-md"
            >
              Save Link
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

// Modern grid item card for Link Vault
function LinkCard({ 
  link, 
  onDelete, 
  getDomain 
}: { 
  link: any; 
  onDelete: (id: string) => void; 
  getDomain: (url: string) => string; 
}) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const domain = getDomain(link.url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-surface border border-border/80 p-5 rounded-[24px] flex flex-col gap-4 group hover:-translate-y-1 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer relative"
      onClick={() => window.open(link.url, '_blank')}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Favicon Loader with Custom Fallback SVG */}
        <div className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center shrink-0 border border-border/40">
          {imgError ? (
            <IconLinkTabler className="w-5 h-5 text-text-muted" />
          ) : (
            <img 
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
              alt=""
              className="w-5 h-5 rounded-sm object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        
        {/* Hover Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button 
            onClick={handleCopy}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 bg-surface hover:bg-surface-hover transition-colors"
            title="Copy URL"
          >
            {copied ? <IconCheck className="w-4 h-4 text-emerald-500" /> : <IconCopy className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(link.id);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 bg-surface hover:bg-rose-500/10 transition-colors"
            title="Delete Link"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[15px] leading-snug text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
          {link.title}
        </h3>
        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-alt border border-border/50 text-text-muted tracking-wide">
          {domain}
        </span>
      </div>

      {/* Tags */}
      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-3 border-t border-border/40 mt-auto">
          {link.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} className="text-[10px] py-0 px-2 font-bold bg-primary/5 text-primary border-none">
              {tag}
            </Badge>
          ))}
          {link.tags.length > 3 && (
            <Badge className="text-[10px] py-0 px-2 font-bold bg-surface-alt text-text-muted border-none">
              +{link.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  );
}
