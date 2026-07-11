import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconSearch, IconTrash, IconCopy, IconCheck, 
  IconTerminal, IconTag, IconBook, IconInfoCircle 
} from '@tabler/icons-react';
import { useAppStore, type TilLog } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { Modal } from '../../components/ui/Modal';
import { ShikiHighlighter } from '../../components/ui/ShikiHighlighter';
import { TagInput } from '../../components/ui/TagInput';

export default function TilModule() {
  const { theme, tilLogs, addTilLog, deleteTilLog, showConfirm } = useAppStore(useShallow(state => ({
    theme: state.theme,
    tilLogs: state.tilLogs,
    addTilLog: state.addTilLog,
    deleteTilLog: state.deleteTilLog,
    showConfirm: state.showConfirm,
  })));
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Terminal Input State
  const [terminalInput, setTerminalInput] = useState('');
  
  // Expanded Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalTags, setModalTags] = useState<string[]>([]);

  // Resolve Dark Mode state
  const isDark = useMemo(() => {
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    // Sakura and Light themes are light modes, others are dark modes
    return theme !== 'light' && theme !== 'sakura';
  }, [theme]);

  // Determine Shiki Theme dynamically
  const shikiTheme = isDark ? 'one-dark-pro' : 'min-light';

  // Parser for the Terminal Input Command
  const parseCommandLine = (line: string) => {
    // Extract hashtags (e.g. #rust)
    const tagRegex = /#[\w-]+/g;
    const tags = (line.match(tagRegex) || []).map(t => t.slice(1).toLowerCase());
    let cleanLine = line.replace(tagRegex, '').trim();

    // Extract code blocks inside backticks `code`
    const codeRegex = /`([^`]+)`/;
    const codeMatch = cleanLine.match(codeRegex);
    let code = '';
    if (codeMatch) {
      code = codeMatch[1];
      cleanLine = cleanLine.replace(codeRegex, '').trim();
    }

    // Remaining line is the title/message
    const title = cleanLine || 'Quick Learning Log';

    return { title, code, tags };
  };

  // Live parsed state for the HUD
  const liveParsed = useMemo(() => {
    if (!terminalInput.trim()) return null;
    return parseCommandLine(terminalInput);
  }, [terminalInput]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const { title, code, tags } = parseCommandLine(terminalInput);
    
    // Structure content: if there is code, store code in backticks inside the content
    let finalContent = '';
    if (code) {
      finalContent = `Code snippet:\n\`\`\`\n${code}\n\`\`\``;
    }

    const newLog: TilLog = {
      id: crypto.randomUUID(),
      title: title,
      content: finalContent || 'Logged via Quick Console.',
      tags: tags.length > 0 ? tags : ['general'],
      createdAt: new Date().toISOString(),
    };

    addTilLog(newLog);
    setTerminalInput('');
    addToast('Logged Successfully', `Added "${title}" to your memory vault.`, 'success');
  };

  const handleSaveModal = () => {
    if (!modalTitle.trim()) {
      addToast('Validation Error', 'Title is required.', 'warning');
      return;
    }

    const newLog: TilLog = {
      id: crypto.randomUUID(),
      title: modalTitle.trim(),
      content: modalContent.trim() || 'No description provided.',
      tags: modalTags.length > 0 ? modalTags : ['general'],
      createdAt: new Date().toISOString(),
    };

    addTilLog(newLog);
    setIsModalOpen(false);
    
    // Reset Form
    setModalTitle('');
    setModalContent('');
    setModalTags([]);
    addToast('Logged Successfully', `Added "${newLog.title}" to your memory vault.`, 'success');
  };

  const handleDelete = (id: string, title: string) => {
    showConfirm('Delete Log', `Are you sure you want to delete this TIL: "${title}"?`, () => {
      deleteTilLog(id);
      addToast('Deleted', 'TIL log removed.', 'success');
    });
  };

  const handleCopyCode = (id: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    addToast('Copied', 'Code snippet copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get all unique tags sorted by popularity
  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    tilLogs.forEach(log => {
      log.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }, [tilLogs]);

  // Filter logs based on search and tag selection
  const filteredLogs = useMemo(() => {
    let result = [...tilLogs];

    if (selectedTag) {
      result = result.filter(log => log.tags.includes(selectedTag));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(log => 
        log.title.toLowerCase().includes(q) || 
        log.content.toLowerCase().includes(q) ||
        log.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tilLogs, selectedTag, search]);

  // Check if content has code block markdown to render with Shiki
  const parseCodeBlock = (content: string) => {
    const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)\n```/;
    const match = content.match(codeBlockRegex);
    if (match) {
      return {
        hasCode: true,
        lang: match[1] || 'javascript',
        code: match[2].trim(),
        textBefore: content.split(codeBlockRegex)[0].trim(),
      };
    }
    return { hasCode: false, lang: '', code: '', textBefore: content };
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-24 text-left select-none animate-fade-in">
      
      {/* ── Title Header ── */}
      <div className="flex flex-col justify-between gap-4 pt-4 mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-1">Developer Journal</p>
          <h2 className="text-4xl font-black leading-none tracking-tight text-text-primary">Today I Learned</h2>
          <p className="text-[15px] text-text-secondary font-medium mt-2">Log code snippets, commands, and key concepts daily.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex gap-2 items-center px-6 py-3 text-white rounded-full font-bold text-[14px] active:scale-95 transition-all w-max shrink-0 hover:opacity-90 cursor-pointer bg-rose-500 hover:bg-rose-600 shadow-[0_4px_16px_rgba(244,63,94,0.3)]"
        >
          <IconPlus className="w-5 h-5" /> Add Log
        </button>
      </div>

      {/* ── Terminal Quick Capture Console ── */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden relative">
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <IconTerminal className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">TIL Quick Capture Terminal</span>
          </div>
        </div>

        {/* Preset Cheat Chips */}
        <div className="flex flex-wrap gap-1.5 items-center mb-4 select-none">
          <span className="text-[9px] font-black uppercase text-zinc-600 tracking-wider font-mono mr-1.5">Presets:</span>
          {[
            { label: '/git log', text: 'Added Git undo commit command `git reset --soft HEAD~1` #git #cli' },
            { label: '/docker cleanup', text: 'Clean unused docker memory space `docker system prune` #docker #cli' },
            { label: '/python print', text: 'Python console print formatting template `print(f"Index: {i}")` #python' },
            { label: '/js promise', text: 'JS Promise resolve constructor `new Promise((resolve) => resolve())` #javascript' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTerminalInput(chip.text)}
              className="px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-[9px] font-mono transition-all cursor-pointer hover:bg-zinc-900 active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleTerminalSubmit} className="flex flex-col gap-2 font-mono">
          <div className="flex items-center gap-2 text-[13px] text-zinc-300">
            <span className="text-emerald-400 shrink-0">til@hq:~$</span>
            <input 
              type="text"
              placeholder="Type title, `code block` in backticks and #tags, then click Enter..."
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none p-0 text-[13px] text-white placeholder-zinc-700 caret-rose-500 selection:bg-rose-500/20"
            />
          </div>
          
          <div className="flex items-center gap-1 text-[9px] text-zinc-600 select-none mt-1">
            <IconInfoCircle className="w-3.5 h-3.5" />
            <span>Click any preset above to test, or write your own. Title is regular text, code is inside `backticks`, categories start with #.</span>
          </div>
        </form>

        {/* Live Parser HUD */}
        <AnimatePresence>
          {liveParsed && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="border-t border-zinc-800/60 pt-4 text-xs font-mono text-zinc-400 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900/60">
                <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Live Parser HUD</span>
                <span className="text-[8.5px] text-zinc-600">Dynamic parsing indicator</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Parsed Title</span>
                  <span className="text-zinc-200 bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl truncate block">
                    {liveParsed.title}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Parsed Code</span>
                  <span className="text-emerald-400 bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl truncate block font-mono">
                    {liveParsed.code ? `\`${liveParsed.code}\`` : <span className="text-zinc-700 italic">No code snippet found</span>}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Parsed Hashtags</span>
                  <div className="flex flex-wrap gap-1.5 bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl min-h-[36px] items-center">
                    {liveParsed.tags.length > 0 ? (
                      liveParsed.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/10 rounded-md text-[9px] font-extrabold lowercase">
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-rose-400/25 border border-rose-500/5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold lowercase">#general</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Search & Filter Hub ── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-border/40">
        <div className="relative w-full md:max-w-xs">
          <IconSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text"
            placeholder="Search learnings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border/60 rounded-full pl-11 pr-4 py-2.5 text-xs font-semibold text-text-primary focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all"
          />
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer border ${
              selectedTag === null 
                ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                : 'bg-surface border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            All Logs
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer border flex items-center gap-1.5 ${
                tag === selectedTag 
                  ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                  : 'bg-surface border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconTag size={12} className={tag === selectedTag ? 'text-white' : 'text-text-muted'} />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Timeline Learning Feed ── */}
      <div className="relative flex flex-col gap-6">
        
        {/* Timeline Center Line */}
        {filteredLogs.length > 0 && (
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border/40 hidden md:block" />
        )}

        <AnimatePresence mode="popLayout">
          {filteredLogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 bg-surface border border-border/40 rounded-[32px] text-center p-6 shadow-sm"
            >
              <div className="w-16 h-16 rounded-[20px] bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/10">
                <IconBook className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-text-primary">No learnings logged</h3>
              <p className="text-xs text-text-secondary max-w-xs mt-2 leading-relaxed">
                Log quick CLI hacks, code solutions, or tags. Let's populate your memory vault!
              </p>
            </motion.div>
          ) : (
            filteredLogs.map((log) => {
              const { hasCode, lang, code, textBefore } = parseCodeBlock(log.content);

              return (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="flex gap-6 text-left items-start md:pl-0 pl-2 group"
                >
                  {/* Left Bullet marker node (matches date) */}
                  <div className="w-12 h-12 rounded-[18px] bg-surface-alt border border-border flex flex-col items-center justify-center shadow-sm shrink-0 z-10 hidden md:flex">
                    <span className="text-[10px] font-black text-text-muted uppercase leading-none">
                      {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-[13px] font-black text-text-primary mt-0.5 leading-none">
                      {new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric' })}
                    </span>
                  </div>

                  {/* Main feed Card content */}
                  <div className="flex-grow bg-surface border border-border/55 rounded-[28px] p-6 shadow-sm flex flex-col gap-3 relative hover:shadow-md hover:border-border transition-all">
                    
                    {/* Top Row Title / Actions */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[15px] font-black text-text-primary tracking-tight leading-tight">
                            {log.title}
                          </h3>
                          <span className="inline-block md:hidden px-2 py-0.5 bg-surface-alt border border-border text-[9px] font-bold text-text-secondary rounded-md">
                            {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {textBefore && textBefore !== 'Logged via Quick Console.' && (
                          <p className="text-[12.5px] text-text-secondary leading-relaxed font-medium mt-1">
                            {textBefore}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleDelete(log.id, log.title)}
                        className="p-2 rounded-xl border border-border/40 text-text-muted hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/25 transition-all cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center shrink-0 active:scale-95"
                        title="Delete log entry"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>

                    {/* Rendering Code block with dynamic light/dark highlighting */}
                    {hasCode && (
                      <div className={`relative rounded-2xl overflow-hidden border text-[12px] font-mono shadow-sm group ${
                        isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-stone-50/60 border-stone-200/80'
                      }`}>
                        <div className={`flex items-center justify-between px-4 py-2 border-b text-[10px] font-bold uppercase tracking-wider ${
                          isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-stone-100 border-stone-200/80 text-stone-500'
                        }`}>
                          <span>{lang}</span>
                          <button
                            onClick={() => handleCopyCode(log.id, code)}
                            className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
                          >
                            {copiedId === log.id ? (
                              <>
                                <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <IconCopy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-4 overflow-x-auto scrollbar-thin">
                          <ShikiHighlighter 
                            code={code}
                            lang={lang}
                            theme={shikiTheme}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tag list */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {log.tags.map(t => (
                        <span 
                          key={t}
                          onClick={() => setSelectedTag(t === selectedTag ? null : t)}
                          className="px-2.5 py-1 bg-surface-alt hover:bg-rose-500/10 border border-border/65 text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-rose-500 rounded-lg cursor-pointer transition-all"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                  </div>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>

      </div>

      {/* ── Expanded Add Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Today's Learning"
      >
        <div className="flex flex-col gap-5 pt-2">
          
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted mb-2">Title / Concept</label>
            <input 
              type="text"
              required
              placeholder="e.g. Memory Ownership Model in Rust"
              value={modalTitle}
              onChange={e => setModalTitle(e.target.value)}
              className="w-full bg-surface-alt border border-border/80 rounded-xl px-4 py-3 text-[14px] text-text-primary placeholder-zinc-400 dark:placeholder-zinc-650 outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted mb-2">Content / Code Snippet</label>
            <textarea
              rows={5}
              placeholder="Describe what you learned. You can insert code blocks like this:&#10;```rust&#10;fn main() {&#10;    println!(&quot;Hello&quot;);&#10;}&#10;```"
              value={modalContent}
              onChange={e => setModalContent(e.target.value)}
              className="w-full bg-surface-alt border border-border/80 rounded-xl px-4 py-3 text-[14px] text-text-primary placeholder-zinc-400 dark:placeholder-zinc-650 outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all font-sans resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted mb-2">Category Tags</label>
            <TagInput
              tags={modalTags}
              onChange={setModalTags}
              placeholder="Type tag and press enter..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/30">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-surface-alt border border-border/80 text-text-secondary rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveModal}
              className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer hover:bg-rose-600 shadow-sm"
            >
              Save Log
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}
