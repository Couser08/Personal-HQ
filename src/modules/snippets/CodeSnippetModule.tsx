import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconSearch, IconTrash, IconCopy, IconCheck, IconCode, 
  IconStar, IconStarFilled, IconClock, IconFilter, IconEdit, IconDots
} from '@tabler/icons-react';
import { useAppStore, type CodeSnippet } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { TagInput } from '../../components/ui/TagInput';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CustomSelect, type SelectOption } from '../../components/ui/CustomSelect';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp',
  'cpp', 'go', 'rust', 'ruby', 'php', 'html', 'css',
  'sql', 'bash', 'json', 'yaml', 'markdown', 'other'
];
const LANGUAGE_OPTIONS: SelectOption[] = LANGUAGES.map(l => ({ value: l, label: l.toUpperCase() }));

export default function CodeSnippetModule() {
  const { snippets, addSnippet, updateSnippet, deleteSnippet, showConfirm } = useAppStore();
  const { addToast } = useToastStore();
  
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All Snippets');
  
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleOpenModal = (snippet?: CodeSnippet) => {
    if (snippet) {
      setEditingId(snippet.id);
      setTitle(snippet.title);
      setDescription(snippet.description || '');
      setLanguage(snippet.language);
      setCode(snippet.code);
      setTags(snippet.tags);
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setLanguage('javascript');
      setCode('');
      setTags([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !code.trim()) {
      addToast('Validation Error', 'Title and Code are required.', 'warning');
      return;
    }

    if (editingId) {
      updateSnippet(editingId, {
        title,
        description,
        language,
        code,
        tags,
        updatedAt: new Date().toISOString()
      });
    } else {
      const newSnippet: CodeSnippet = {
        id: crypto.randomUUID(),
        title,
        description,
        language,
        code,
        tags,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addSnippet(newSnippet);
      setSelectedSnippetId(newSnippet.id);
    }
    
    setIsModalOpen(false);
  };

  const handleCopy = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    addToast('Copied', 'Code copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (e: React.MouseEvent, snippet: CodeSnippet) => {
    e.stopPropagation();
    updateSnippet(snippet.id, { isFavorite: !snippet.isFavorite });
  };

  const filteredSnippets = useMemo(() => {
    let filtered = snippets;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(s) || n.code.toLowerCase().includes(s) || (n.description && n.description.toLowerCase().includes(s)));
    }
    
    if (activeFilter === 'Favorites') {
      filtered = filtered.filter(n => n.isFavorite);
    } else if (activeFilter === 'Recent') {
      // Top 10 most recent
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
    } else if (activeFilter !== 'All Snippets') {
      filtered = filtered.filter(n => n.language.toLowerCase() === activeFilter.toLowerCase());
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [snippets, search, activeFilter]);

  // Set default selected snippet if none is selected
  useMemo(() => {
    if (!selectedSnippetId && filteredSnippets.length > 0) {
      setSelectedSnippetId(filteredSnippets[0].id);
    }
  }, [filteredSnippets, selectedSnippetId]);

  const selectedSnippet = useMemo(() => snippets.find(s => s.id === selectedSnippetId), [snippets, selectedSnippetId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col h-full gap-6 pb-4"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Code Snippets Vault <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </h2>
          <p className="text-text-secondary text-sm">Save, organize, and reuse your code snippets</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary btn-md"
        >
          <IconPlus className="w-4 h-4" /> Add Snippet
        </button>
      </div>

      {/* Top Bar: Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search snippets by title, language, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 pr-4 py-3"
          />
        </div>
        
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All Snippets', 'Favorites', 'Recent', 'JSON', 'JavaScript', 'HTML', 'CSS', 'Python'].map(filter => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              >
                {filter === 'Favorites' && <IconStarFilled className="w-3.5 h-3.5 text-amber-500" />}
                {filter === 'Recent' && <IconClock className="w-3.5 h-3.5" />}
                {filter}
              </button>
            );
          })}
          <button className="btn btn-secondary btn-sm">
            More <IconFilter className="w-3 h-3" />
          </button>
        </div>
      </div>

      {snippets.length === 0 ? (
        <EmptyState
          icon={<IconCode className="w-9 h-9 text-text-muted" />}
          title="Your vault is empty"
          description="Store your frequently used code blocks, JSON configurations, and utility scripts."
          action={
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary btn-md"
            >
              Add your first snippet
            </button>
          }
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
          
          {/* Left: Masonry Grid of Snippets */}
          <div className="w-full lg:w-5/12 xl:w-1/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 content-start overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {filteredSnippets.map(snippet => {
                const isSelected = selectedSnippetId === snippet.id;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={snippet.id}
                    onClick={() => setSelectedSnippetId(snippet.id)}
                    className={`bg-surface border rounded-[16px] p-4 flex flex-col gap-3 cursor-pointer transition-all ${
                      isSelected ? 'border-primary shadow-[0_0_0_1px_rgba(244,63,94,1)] bg-primary/5' : 'border-border hover:border-border-alt'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-text-primary line-clamp-1">{snippet.title}</h3>
                        <span className="uppercase text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                          {snippet.language}
                        </span>
                      </div>
                      <button onClick={(e) => toggleFavorite(e, snippet)} className="btn btn-ghost btn-sm btn-square hover:text-amber-500">
                        {snippet.isFavorite ? <IconStarFilled className="w-4 h-4 text-amber-500" /> : <IconStar className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <p className="text-xs text-text-secondary line-clamp-2 m-0 h-8">
                      {snippet.description || 'No description provided.'}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-border-alt">
                      <span className="text-[11px] font-medium text-text-muted">{formatDate(snippet.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(snippet.code, snippet.id); }}
                          className="btn btn-ghost btn-sm btn-square"
                        >
                          {copiedId === snippet.id ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
                        </button>
                        <button className="btn btn-ghost btn-sm btn-square">
                          <IconDots className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right: Detailed Preview */}
          <div className="w-full lg:w-7/12 xl:w-2/3 bg-surface border border-border rounded-[16px] flex flex-col overflow-hidden">
            {selectedSnippet ? (
              <>
                <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surface-alt">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg text-text-primary">{selectedSnippet.title}</h2>
                    <span className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      {selectedSnippet.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleCopy(selectedSnippet.code, selectedSnippet.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      {copiedId === selectedSnippet.id ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />} 
                      Copy
                    </button>
                    <button 
                      onClick={() => handleOpenModal(selectedSnippet)}
                      className="btn btn-secondary btn-sm"
                    >
                      <IconEdit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => {
                        showConfirm('Delete Snippet', 'Are you sure you want to delete this snippet?', () => {
                          deleteSnippet(selectedSnippet.id);
                          setSelectedSnippetId(null);
                        });
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      <IconTrash className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4 code-preview-container">
                  <SyntaxHighlighter
                    language={selectedSnippet.language.toLowerCase()}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: '13px' }}
                    showLineNumbers={true}
                    wrapLines={true}
                  >
                    {selectedSnippet.code}
                  </SyntaxHighlighter>
                </div>
                
                <div className="px-6 py-4 border-t border-border bg-surface-alt flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-8">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Language</div>
                      <div className="text-sm font-semibold">{selectedSnippet.language.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Added On</div>
                      <div className="text-sm font-medium text-text-secondary">{formatDate(selectedSnippet.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Last Modified</div>
                      <div className="text-sm font-medium text-text-secondary">{formatDate(selectedSnippet.updatedAt || selectedSnippet.createdAt)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Tags</div>
                    <div className="flex gap-2">
                      {selectedSnippet.tags.length > 0 ? selectedSnippet.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs font-medium">{tag}</span>
                      )) : <span className="text-xs text-text-muted">No tags</span>}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm font-medium p-10">
                Select a snippet to preview
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Snippet" : "Add Code Snippet"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Title</label>
            <input
              type="text"
              placeholder="e.g. Express Server Setup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</label>
            <input
              type="text"
              placeholder="Brief description of what this does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Language</label>
            <CustomSelect
              value={language}
              onChange={val => setLanguage(val)}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Code</label>
            <textarea
              placeholder="// Your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#1e1e1e] text-[#d4d4d4] border border-border-alt rounded-[12px] px-4 py-4 focus:outline-none focus:border-primary transition-colors text-sm font-mono min-h-[250px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Tags</label>
            <TagInput tags={tags} onChange={setTags} placeholder="e.g. backend, nodejs" />
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border-alt">
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
              {editingId ? 'Save Changes' : 'Save Snippet'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
