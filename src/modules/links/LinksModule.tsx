import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconSearch, IconTrash, IconExternalLink, IconLink as IconLinkTabler } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { TagInput } from '../../components/ui/TagInput';

export default function LinksModule() {
  const { links, addLink, deleteLink , showConfirm} = useAppStore();
  
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
          className="bg-primary hover:bg-primary-muted text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus className="w-4 h-4" /> Add Link
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full max-w-md">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-alt border border-border-alt rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedTag === null ? 'primary' : 'default'}
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTag === tag ? 'primary' : 'default'}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {links.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 mb-6 rounded-full bg-surface-alt flex items-center justify-center">
            <IconLinkTabler className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-medium mb-2">No links saved yet</h3>
          <p className="text-text-secondary max-w-md mb-6">Create a centralized vault for all your important resources, articles, and tools.</p>
          <button
            onClick={handleOpenModal}
            className="text-primary hover:underline font-medium"
          >
            Add your first link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredLinks.map(link => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={link.id}
                className="bg-surface border border-border p-4 rounded-xl flex flex-col gap-3 group hover:border-border transition-colors cursor-pointer"
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-surface-alt flex items-center justify-center shrink-0 mt-1">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${getDomain(link.url)}&sz=32`} 
                      alt=""
                      className="w-5 h-5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">{link.title}</h3>
                    <p className="text-xs text-text-muted truncate">{getDomain(link.url)}</p>
                  </div>
                  <IconExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex flex-wrap gap-1">
                    {link.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} className="text-[10px] py-0 px-1.5">{tag}</Badge>
                    ))}
                    {link.tags.length > 3 && <Badge className="text-[10px] py-0 px-1.5">+{link.tags.length - 3}</Badge>}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm('Confirm Delete', 'Delete this link?', () => { deleteLink(link.id); });
                    }}
                    className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
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
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-muted text-white rounded-lg transition-colors"
            >
              Save Link
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
