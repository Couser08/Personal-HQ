import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { parseMarkdown } from './markdownUtils';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { TEMPLATES, SLASH_COMMANDS } from './constants/templates';
import { exportMarkdownToPdf } from './utils/pdfExporter';
import { handleAutoListContinuation } from './utils/editorKeyHandlers';
import { MarkdownStyles } from './components/MarkdownStyles';
import { MarkdownCatalogView } from './components/MarkdownCatalogView';
import { CreateDocumentModal } from './components/CreateDocumentModal';

export default function MarkdownModule() {
  const { notes, addNote, updateNote, updateNoteLocally, deleteNote, fetchNoteDetail, showConfirm } = useAppStore(
    useShallow((state) => ({
      notes: state.notes,
      addNote: state.addNote,
      updateNote: state.updateNote,
      updateNoteLocally: state.updateNoteLocally,
      deleteNote: state.deleteNote,
      fetchNoteDetail: state.fetchNoteDetail,
      showConfirm: state.showConfirm,
    })),
  );

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES>('blank');
  const [workspaceSearch, setWorkspaceSearch] = useState('');

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markdownDocs = useMemo(() => {
    return notes.filter((n) => n.tags?.includes('markdown'));
  }, [notes]);

  const filteredMarkdownDocs = useMemo(() => {
    const q = workspaceSearch.toLowerCase().trim();
    if (!q) return markdownDocs;
    return markdownDocs.filter(
      (d) => d.title.toLowerCase().includes(q) || (d.content && d.content.toLowerCase().includes(q)),
    );
  }, [markdownDocs, workspaceSearch]);

  useEffect(() => {
    if (!activeDocId) {
      setTitle('');
      setContent('');
      return;
    }
    const doc = markdownDocs.find((d) => d.id === activeDocId);
    if (doc) {
      setTitle(doc.title);
      setContent(doc.content || '');
      if (!doc.content) {
        void fetchNoteDetail(activeDocId);
      }
    }
  }, [activeDocId, markdownDocs, fetchNoteDetail]);

  const getUniqueTitle = (rawTitle: string) => {
    const baseName = (rawTitle.trim() || 'untitled').replace(/\.md$/i, '');
    let candidate = `${baseName}.md`;
    if (!markdownDocs.some((d) => d.title.toLowerCase() === candidate.toLowerCase())) {
      return candidate;
    }
    let counter = 1;
    while (markdownDocs.some((d) => d.title.toLowerCase() === `${baseName} (${counter}).md`.toLowerCase())) {
      counter++;
    }
    return `${baseName} (${counter}).md`;
  };

  const handleCreateNewDoc = async () => {
    const uniqueTitle = getUniqueTitle(newDocTitle);
    const id = crypto.randomUUID();
    const newDoc = {
      id,
      title: uniqueTitle,
      content: TEMPLATES[selectedTemplate],
      tags: ['markdown'],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addNote(newDoc);
    setActiveDocId(id);
    setIsCreateModalOpen(false);
    setNewDocTitle('');
  };

  const handleCreateDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateNewDoc();
  };

  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNote(id);
    if (activeDocId === id) {
      setActiveDocId(null);
    }
  };

  const handleTitleChange = (newVal: string) => {
    if (!activeDocId) return;
    setTitle(newVal);
    setIsSaving(true);
    updateNoteLocally(activeDocId, { title: newVal });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      void updateNote(activeDocId, { title: newVal }, true).then(() => {
        setIsSaving(false);
      });
    }, 800);
  };

  const handleContentChange = (newVal: string) => {
    if (!activeDocId) return;
    setContent(newVal);
    setIsSaving(true);
    updateNoteLocally(activeDocId, { content: newVal });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      void updateNote(activeDocId, { content: newVal }, true).then(() => {
        setIsSaving(false);
      });
    }, 800);
  };

  const [copied, setCopied] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    triggerIndex: number;
    searchQuery: string;
  }>({
    isOpen: false,
    triggerIndex: -1,
    searchQuery: '',
  });
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  useEffect(() => {
    if (slashMenu.isOpen) {
      const activeEl = document.getElementById(`slash-cmd-item-${activeCommandIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeCommandIndex, slashMenu.isOpen]);

  const handleDownload = () => {
    if (!title) return;
    const filename = title.endsWith('.md') ? title : `${title}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const filteredCommands = useMemo(() => {
    const q = slashMenu.searchQuery.toLowerCase();
    return SLASH_COMMANDS.filter(
      (cmd) => cmd.label.toLowerCase().includes(q) || cmd.desc.toLowerCase().includes(q),
    );
  }, [slashMenu.searchQuery]);

  const handleSelectSlashCommand = (syntax: string) => {
    if (slashMenu.triggerIndex === -1) return;

    const before = content.slice(0, slashMenu.triggerIndex);
    const after = content.slice(slashMenu.triggerIndex + 1);

    const newContent = before + syntax + after;
    handleContentChange(newContent);
    setSlashMenu({ isOpen: false, triggerIndex: -1, searchQuery: '' });
    setActiveCommandIndex(0);

    setTimeout(() => {
      const textarea = document.getElementById('markdown-editor-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        const newCursorPos = slashMenu.triggerIndex + syntax.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleContentChange(value);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, selectionStart);

    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    if (
      lastSlashIndex !== -1 &&
      (lastSlashIndex === 0 ||
        textBeforeCursor[lastSlashIndex - 1] === ' ' ||
        textBeforeCursor[lastSlashIndex - 1] === '\n')
    ) {
      const query = textBeforeCursor.slice(lastSlashIndex + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        setSlashMenu({
          isOpen: true,
          triggerIndex: lastSlashIndex,
          searchQuery: query,
        });
        setActiveCommandIndex(0);
        return;
      }
    }

    setSlashMenu({ isOpen: false, triggerIndex: -1, searchQuery: '' });
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenu.isOpen && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown' || e.code === 'ArrowDown') {
        e.preventDefault();
        setActiveCommandIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      } else if (e.key === 'ArrowUp' || e.code === 'ArrowUp') {
        e.preventDefault();
        setActiveCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      } else if (e.key === 'Enter' || e.code === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeCommandIndex]) {
          handleSelectSlashCommand(filteredCommands[activeCommandIndex].syntax);
        }
        return;
      } else if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        setSlashMenu({ isOpen: false, triggerIndex: -1, searchQuery: '' });
        return;
      }
    }

    handleAutoListContinuation(e, handleContentChange);
  };

  const parsedHtml = useMemo(() => parseMarkdown(content), [content]);
  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="@container/markdown-catalog w-full h-full min-h-[calc(100dvh-4rem)] text-left"
    >
      <MarkdownStyles />

      {activeDocId === null ? (
        <MarkdownCatalogView
          markdownDocs={markdownDocs}
          filteredMarkdownDocs={filteredMarkdownDocs}
          workspaceSearch={workspaceSearch}
          setWorkspaceSearch={setWorkspaceSearch}
          openCreateModal={(tmpl) => {
            setNewDocTitle('');
            setSelectedTemplate(tmpl || 'blank');
            setIsCreateModalOpen(true);
          }}
          onSelectDoc={setActiveDocId}
          onDeleteDoc={(id, docTitle, e) => {
            showConfirm('Delete Document', `Are you sure you want to delete "${docTitle}"?`, () => {
              handleDeleteDoc(id, e);
            });
          }}
        />
      ) : (
        <div className="@container/markdown-workspace w-full min-h-[calc(100dvh-4rem)] flex flex-col gap-2.5 p-1 sm:p-2 relative text-left">
          {/* Mobile Edit / Preview Segmented Switcher */}
          <div className="lg:hidden flex items-center justify-between p-1.5 bg-surface rounded-2xl border border-border shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveDocId(null)}
              className="px-3 py-1.5 min-h-[36px] text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl cursor-pointer"
            >
              ← All Docs
            </button>

            <div className="flex items-center p-0.5 rounded-xl bg-surface-alt border border-border">
              <button
                type="button"
                onClick={() => setMobileTab('editor')}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mobileTab === 'editor' ? 'bg-surface text-text-primary shadow-xs font-black' : 'text-text-secondary'
                }`}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mobileTab === 'preview' ? 'bg-surface text-text-primary shadow-xs font-black' : 'text-text-secondary'
                }`}
              >
                👁️ Preview
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-4 relative">
            <div className={`flex-1 ${mobileTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
              {isEditorOpen && (
                <MarkdownEditor
                  title={title}
                  handleTitleChange={handleTitleChange}
                  content={content}
                  handleTextareaChange={handleTextareaChange}
                  handleTextareaKeyDown={handleTextareaKeyDown}
                  wordCount={wordCount}
                  copied={copied}
                  handleCopy={handleCopy}
                  handleDownload={handleDownload}
                  handleExportPDF={() => exportMarkdownToPdf(title)}
                  isWorkspaceOpen={isWorkspaceOpen}
                  setIsWorkspaceOpen={setIsWorkspaceOpen}
                  setActiveDocId={setActiveDocId}
                  slashMenu={slashMenu}
                  filteredCommands={filteredCommands}
                  activeCommandIndex={activeCommandIndex}
                  handleSelectSlashCommand={handleSelectSlashCommand}
                  isSaving={isSaving}
                  isFocusMode={isFocusMode}
                  setIsFocusMode={setIsFocusMode}
                />
              )}
            </div>

            <div className={`flex-1 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
              {isWorkspaceOpen && !isFocusMode && (
                <MarkdownPreview
                  parsedHtml={parsedHtml}
                  isEditorOpen={isEditorOpen}
                  setIsEditorOpen={setIsEditorOpen}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDocSubmit}
        newDocTitle={newDocTitle}
        setNewDocTitle={setNewDocTitle}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
      />
    </motion.div>
  );
}
