import { motion } from 'framer-motion';
import {
  IconArrowLeft,
  IconPlus,
  IconNotes,
  IconCode,
  IconLink,
  IconHelpCircle,
  IconRefresh,
  IconFileText,
  IconDots,
  IconCopy,
  IconBrandYoutube,
  IconBrandGithub,
  IconExternalLink,
  IconTrash,
  IconCheck,
  IconChecklist,
  IconArrowsShuffle,
  IconChevronRight,
  IconEdit,
} from '@tabler/icons-react';
import { useToastStore } from '../../../store/useToastStore';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ShikiHighlighter } from '../../../components/ui/ShikiHighlighter';
import { formatMinutes } from '../utils/studyUtils';
import { StudyTimer } from './StudyTimer';
import { FlashcardStudy } from './FlashcardStudy';

interface TopicWorkspaceProps {
  activeSubject: any;
  activeTopic: any;
  setSelectedTopicId: (id: string | null) => void;
  topicTab: string;
  setTopicTab: (tab: any) => void;
  timerRunning: boolean;
  setTimerRunning: (val: boolean) => void;
  timerDuration: number;
  timerSecondsLeft: number;
  setTimerSecondsLeft: (val: number | ((prev: number) => number)) => void;
  timerPreset: number;
  startTimer: (mins: number) => void;
  handleUpdateTopicField: (data: any) => void;
  setNoteModal: (val: any) => void;
  setSnippetModal: (val: any) => void;
  setResourceModal: (val: any) => void;
  setQuestionModal: (val: any) => void;
  setFlashcardModal: (val: any) => void;
  taskInput: string;
  setTaskInput: (val: string) => void;
  handleAddTopicTask: () => void;
  handleToggleTopicTask: (taskId: string) => void;
  handleDeleteTopicTask: (taskId: string) => void;
  handleToggleQuestionSolved: (qId: string) => void;
  currentFlashcardIndex: number;
  setCurrentFlashcardIndex: (val: number | ((prev: number) => number)) => void;
  flashcardFlipped: boolean;
  setFlashcardFlipped: (val: boolean | ((prev: boolean) => boolean)) => void;
  handleRateFlashcard: (rating: 'easy' | 'medium' | 'hard') => void;
  updateTopic: (subjId: string, topicId: string, data: any) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  isDark: boolean;
}

export function TopicWorkspace({
  activeSubject,
  activeTopic,
  setSelectedTopicId,
  topicTab,
  setTopicTab,
  timerRunning,
  setTimerRunning,
  timerDuration,
  timerSecondsLeft,
  setTimerSecondsLeft,
  timerPreset,
  startTimer,
  handleUpdateTopicField,
  setNoteModal,
  setSnippetModal,
  setResourceModal,
  setQuestionModal,
  setFlashcardModal,
  taskInput,
  setTaskInput,
  handleAddTopicTask,
  handleToggleTopicTask,
  handleDeleteTopicTask,
  handleToggleQuestionSolved,
  currentFlashcardIndex,
  setCurrentFlashcardIndex,
  flashcardFlipped,
  setFlashcardFlipped,
  handleRateFlashcard,
  updateTopic,
  showConfirm,
  isDark,
}: TopicWorkspaceProps) {
  const addToast = useToastStore((s) => s.addToast);

  const totalTasks = activeTopic.tasks?.length || 0;
  const doneTasks = activeTopic.tasks?.filter((t: any) => t.done).length || 0;
  const taskPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex flex-col gap-6 text-left"
    >
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <button onClick={() => setSelectedTopicId(null)} className="hover:text-primary transition-colors border-none bg-transparent cursor-pointer">
              Study Tracker
            </button>
            <span>/</span>
            <button onClick={() => setSelectedTopicId(null)} className="hover:text-primary transition-colors border-none bg-transparent cursor-pointer">
              {activeSubject.name}
            </button>
            <span>/</span>
            <span className="text-text-primary font-medium">{activeTopic.name}</span>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {activeTopic.name}
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${activeTopic.done ? 'bg-green-500' : 'bg-primary'}`} />
          </h1>
        </div>
        <button onClick={() => setSelectedTopicId(null)} className="btn btn-secondary btn-md flex items-center gap-2">
          <IconArrowLeft className="w-4 h-4" /> Back to Subject
        </button>
      </div>

      {/* Workspace Tab Bar */}
      <div className="flex border-b border-border overflow-x-auto gap-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'notes', label: `Notes (${activeTopic.notes?.length || 0})` },
          { id: 'code', label: `Code (${activeTopic.snippets?.length || 0})` },
          { id: 'resources', label: `Resources (${activeTopic.resources?.length || 0})` },
          { id: 'tasks', label: `Tasks (${doneTasks}/${totalTasks})` },
          { id: 'questions', label: `Questions (${activeTopic.questions?.length || 0})` },
          { id: 'flashcards', label: `Flashcards (${activeTopic.flashcards?.length || 0})` },
          { id: 'revision', label: 'Revision' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTopicTab(tab.id)}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap border-none bg-transparent cursor-pointer ${
              topicTab === tab.id
                ? 'border-primary text-primary border-b-2 border-solid !border-b-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-alt'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workspace Tab Panels */}
      <div className="min-h-[500px]">
        {topicTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-base text-text-primary">Topic Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Difficulty</label>
                    <CustomSelect
                      value={activeTopic.difficulty || 'medium'}
                      onChange={(val) => handleUpdateTopicField({ difficulty: val as any })}
                      options={[
                        { value: 'easy', label: '🟢 Easy' },
                        { value: 'medium', label: '🟡 Medium' },
                        { value: 'hard', label: '🔴 Hard' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Priority</label>
                    <CustomSelect
                      value={activeTopic.priority || 'medium'}
                      onChange={(val) => handleUpdateTopicField({ priority: val as any })}
                      options={[
                        { value: 'low', label: '🔵 Low' },
                        { value: 'medium', label: '🟡 Medium' },
                        { value: 'high', label: '🔴 High' },
                      ]}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Topic Description</label>
                  <textarea
                    value={activeTopic.description || ''}
                    onChange={(e) => handleUpdateTopicField({ description: e.target.value })}
                    placeholder="Add key objectives, goals, or summary of this topic..."
                    className="w-full bg-surface-alt border border-border-alt rounded-xl p-3 text-sm focus:outline-none focus:border-primary min-h-[100px] resize-vertical"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-surface border border-border p-4 rounded-2xl">
                  <p className="text-xs text-text-secondary">Focus Time</p>
                  <p className="text-xl font-bold mt-1 text-primary">{formatMinutes(activeTopic.timeSpent)}</p>
                </div>
                <div className="bg-surface border border-border p-4 rounded-2xl">
                  <p className="text-xs text-text-secondary">Solved Qs</p>
                  <p className="text-xl font-bold mt-1 text-green-500">
                    {activeTopic.questions?.filter((q: any) => q.status === 'solved').length || 0}
                  </p>
                </div>
                <div className="bg-surface border border-border p-4 rounded-2xl">
                  <p className="text-xs text-text-secondary">Flashcards</p>
                  <p className="text-xl font-bold mt-1 text-blue-500">{activeTopic.flashcards?.length || 0}</p>
                </div>
                <div className="bg-surface border border-border p-4 rounded-2xl">
                  <p className="text-xs text-text-secondary">Done Tasks</p>
                  <p className="text-xl font-bold mt-1 text-amber-500">{taskPercent}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <StudyTimer
                timerRunning={timerRunning}
                setTimerRunning={setTimerRunning}
                timerDuration={timerDuration}
                timerSecondsLeft={timerSecondsLeft}
                setTimerSecondsLeft={setTimerSecondsLeft}
                timerPreset={timerPreset}
                startTimer={startTimer}
              />

              <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-text-primary">Completed Topic</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Mark this learning node finished</p>
                </div>
                <button
                  onClick={() => handleUpdateTopicField({ done: !activeTopic.done })}
                  className={`btn btn-sm ${activeTopic.done ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {activeTopic.done ? '✓ Done' : 'Mark Done'}
                </button>
              </div>
            </div>
          </div>
        )}

        {topicTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Saved Notes</h3>
              <button
                onClick={() => setNoteModal({ open: true, noteId: null, title: '', content: '', isReadOnly: false })}
                className="btn btn-primary btn-sm"
              >
                <IconPlus className="w-4 h-4" /> Add Note
              </button>
            </div>

            {!activeTopic.notes?.length ? (
              <EmptyState
                icon={<IconNotes className="w-8 h-8 text-text-muted" />}
                title="No notes for this topic"
                description="Use the rich text editor to compile revision summaries, exam concepts, and core thoughts."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTopic.notes.map((note: any) => (
                  <div
                    key={note.id}
                    onClick={() =>
                      setNoteModal({ open: true, noteId: note.id, title: note.title, content: note.content, isReadOnly: true })
                    }
                    className="bg-surface border border-border hover:border-primary/25 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-sm flex flex-col gap-4 relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                          <IconFileText className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-sm text-text-primary line-clamp-1">{note.title}</h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm('Delete Note', 'Delete this note permanently?', () => {
                            const list = activeTopic.notes?.filter((n: any) => n.id !== note.id) || [];
                            handleUpdateTopicField({ notes: list });
                          });
                        }}
                        className="text-text-muted hover:text-text-primary p-1 shrink-0 border-none bg-transparent cursor-pointer"
                      >
                        <IconDots className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="note-preview text-xs text-text-secondary leading-relaxed overflow-hidden" style={{ maxHeight: '180px' }}>
                      <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-border-alt text-[10px] text-text-muted">
                      <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm('Delete Note', 'Delete this note permanently?', () => {
                            const list = activeTopic.notes?.filter((n: any) => n.id !== note.id) || [];
                            handleUpdateTopicField({ notes: list });
                          });
                        }}
                        className="text-rose-500 font-medium hover:text-rose-600 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {topicTab === 'code' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Programming Examples</h3>
              <button
                onClick={() =>
                  setSnippetModal({
                    open: true,
                    snippetId: null,
                    title: '',
                    lang: 'javascript',
                    code: '',
                    desc: '',
                    tags: '',
                  })
                }
                className="btn btn-primary btn-sm"
              >
                <IconPlus className="w-4 h-4" /> Add Snippet
              </button>
            </div>

            {!activeTopic.snippets?.length ? (
              <EmptyState
                icon={<IconCode className="w-8 h-8 text-text-muted" />}
                title="No snippets saved"
                description="Keep code snippets, syntax templates, or terminal command lists handy right inside the workspace."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTopic.snippets.map((snip: any) => (
                  <div
                    key={snip.id}
                    className="bg-surface border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 rounded-3xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${
                            snip.language.toLowerCase() === 'javascript' || snip.language.toLowerCase() === 'js'
                              ? 'bg-[#F7DF1E] text-black'
                              : snip.language.toLowerCase() === 'typescript' || snip.language.toLowerCase() === 'ts'
                              ? 'bg-[#3178C6] text-white'
                              : snip.language.toLowerCase() === 'python'
                              ? 'bg-[#3776AB] text-white'
                              : snip.language.toLowerCase() === 'html'
                              ? 'bg-[#E34F26] text-white'
                              : snip.language.toLowerCase() === 'css'
                              ? 'bg-[#1572B6] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-text-primary'
                          }`}
                        >
                          {snip.language.toLowerCase() === 'javascript'
                            ? 'JS'
                            : snip.language.toLowerCase() === 'typescript'
                            ? 'TS'
                            : snip.language.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-bold text-base text-text-primary line-clamp-1 leading-tight mb-1">{snip.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md w-max">
                            {snip.language}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSnippetModal({
                              open: true,
                              snippetId: snip.id,
                              title: snip.title,
                              lang: snip.language,
                              code: snip.code,
                              desc: snip.description || '',
                              tags: snip.tags?.join(', ') || '',
                            })
                          }
                          className="btn btn-ghost btn-sm btn-square"
                        >
                          <IconEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const list = activeTopic.snippets?.filter((s: any) => s.id !== snip.id) || [];
                            handleUpdateTopicField({ snippets: list });
                          }}
                          className="btn btn-ghost btn-sm btn-square hover:text-rose-500"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {snip.description && <p className="text-sm text-text-secondary leading-relaxed pl-1">{snip.description}</p>}
                    <div className="rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 ring-1 ring-black/5 dark:ring-white/5 relative group">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(snip.code);
                          addToast('Code Copied', 'Snippet text copied to clipboard.', 'success');
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-surface/80 backdrop-blur border border-border text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary z-10 cursor-pointer"
                        title="Copy Code"
                      >
                        <IconCopy className="w-4 h-4" />
                      </button>
                      <div className="p-1">
                        <ShikiHighlighter code={snip.code} lang={snip.language} theme={isDark ? 'one-dark-pro' : 'snazzy-light'} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {topicTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Study Materials</h3>
              <button
                onClick={() => setResourceModal({ open: true, title: '', url: '', type: 'link' })}
                className="btn btn-primary btn-sm"
              >
                <IconPlus className="w-4 h-4" /> Add Resource
              </button>
            </div>

            {!activeTopic.resources?.length ? (
              <EmptyState
                icon={<IconLink className="w-8 h-8 text-text-muted" />}
                title="No resource nodes"
                description="Save YouTube tutorials, PDF manuals, website research, or bookmarks for instant reference."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTopic.resources.map((res: any) => (
                  <div
                    key={res.id}
                    className="bg-surface border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 rounded-3xl p-5 flex items-center justify-between gap-4 transition-shadow hover:shadow-md"
                  >
                    <div className="min-w-0 flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                          res.type === 'youtube' || res.type === 'video'
                            ? 'bg-[#FF0000]/10 text-[#FF0000]'
                            : res.type === 'pdf'
                            ? 'bg-red-500/10 text-red-500'
                            : res.url.includes('github.com')
                            ? 'bg-gray-800/10 text-gray-800 dark:bg-gray-100/10 dark:text-gray-100'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {res.type === 'youtube' || res.type === 'video' ? (
                          <IconBrandYoutube className="w-7 h-7" />
                        ) : res.type === 'pdf' ? (
                          <IconFileText className="w-7 h-7" />
                        ) : res.url.includes('github.com') ? (
                          <IconBrandGithub className="w-7 h-7" />
                        ) : (
                          <IconLink className="w-7 h-7" />
                        )}
                      </div>
                      <div className="min-w-0 flex flex-col justify-center text-left">
                        <p className="text-base font-bold text-text-primary line-clamp-1 leading-tight">{res.title}</p>
                        <p className="text-xs text-text-muted mt-1 truncate max-w-[200px]">{res.url}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 w-max">
                            {res.type === 'youtube' || res.type === 'video' ? 'Video' : res.type === 'pdf' ? 'Document' : 'Link'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-surface hover:bg-gray-50 dark:hover:bg-gray-800 ring-1 ring-black/5 dark:ring-white/5 shadow-sm rounded-full text-sm font-bold text-text-primary transition-all flex items-center gap-2"
                      >
                        Open <IconExternalLink className="w-4 h-4 text-text-muted" />
                      </a>
                      <button
                        onClick={() => {
                          const list = activeTopic.resources?.filter((r: any) => r.id !== res.id) || [];
                          handleUpdateTopicField({ resources: list });
                        }}
                        className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {topicTab === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-text-primary mb-2 leading-tight">
                  Topic-Specific
                  <br />
                  Checklist
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">Break down your topic into small, actionable tasks.</p>
              </div>

              <div className="pt-6 border-t border-border/60">
                <h4 className="font-bold text-base text-text-primary mb-2">All clear</h4>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-text-muted leading-relaxed">
                    Divide this topic into micro actionable tasks (e.g. review, practice, quiz).
                  </p>
                  {!activeTopic.tasks?.length || activeTopic.tasks.every((t: any) => t.done) ? (
                    <div className="w-10 h-10 rounded-full border-2 border-green-500 text-green-500 flex items-center justify-center shrink-0 shadow-sm">
                      <IconCheck className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-text-muted" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-6 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex flex-col min-h-[300px]">
              <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Read Textbook page 231"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTopicTask()}
                    className="input-field flex-1 h-9 bg-surface-alt border-none shadow-inner text-sm px-4 rounded-full"
                  />
                </div>
                <button
                  onClick={handleAddTopicTask}
                  disabled={!taskInput.trim()}
                  className="btn btn-primary btn-sm rounded-full h-9 px-4 shadow-md shadow-red-500/20 whitespace-nowrap disabled:opacity-50"
                >
                  <IconPlus className="w-4 h-4" /> Add Task
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {!activeTopic.tasks?.length ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                      <IconChecklist className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg text-text-primary mb-1">No tasks yet</h4>
                    <p className="text-sm text-text-secondary">Add your first task to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeTopic.tasks.map((task: any) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTopicTask(task.id)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-alt transition-colors cursor-pointer border border-transparent hover:border-border group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shadow-inner ${
                              task.done ? 'bg-green-500 border-green-500 text-white' : 'border-border bg-surface'
                            }`}
                          >
                            {task.done && <IconCheck className="w-3 h-3" />}
                          </div>
                          <span
                            className={`text-sm font-medium transition-all ${
                              task.done ? 'text-text-muted line-through' : 'text-text-primary'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopicTask(task.id);
                          }}
                          className="p-2 rounded-xl text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {topicTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Exam & Interview Questions</h3>
              <button
                onClick={() => setQuestionModal({ open: true, question: '', answer: '', difficulty: 'medium' })}
                className="btn btn-primary btn-sm"
              >
                <IconPlus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {!activeTopic.questions?.length ? (
              <EmptyState
                icon={<IconHelpCircle className="w-8 h-8 text-text-muted" />}
                title="No questions logged"
                description="Add potential final exam questions, interview exercises, or typical MCQs to verify logic."
              />
            ) : (
              <div className="space-y-3">
                {activeTopic.questions.map((q: any) => (
                  <div key={q.id} className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                            q.difficulty === 'hard'
                              ? 'bg-rose-500/10 text-rose-500'
                              : q.difficulty === 'medium'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                            q.status === 'solved' ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/10 text-text-muted'
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const list = activeTopic.questions?.filter((qi: any) => qi.id !== q.id) || [];
                          handleUpdateTopicField({ questions: list });
                        }}
                        className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{q.question}</p>
                    {q.answer && (
                      <p className="text-xs text-text-secondary bg-surface-alt p-3.5 rounded-xl border border-border-alt leading-relaxed">
                        {q.answer}
                      </p>
                    )}
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => handleToggleQuestionSolved(q.id)}
                        className={`btn btn-sm ${q.status === 'solved' ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {q.status === 'solved' ? 'Mark Unsolved' : '✓ Mark Solved'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {topicTab === 'flashcards' && (
          <div className="space-y-6 max-w-2xl mx-auto pb-10 px-4">
            <div className="flex justify-between items-center bg-surface-alt border border-border/40 p-4 rounded-3xl">
              <div>
                <h3 className="font-extrabold text-[15px] text-text-primary">Flashcard Deck</h3>
                <p className="text-[10px] text-text-secondary font-medium">Review topics using active recall</p>
              </div>
              <div className="flex gap-2">
                {activeTopic.flashcards && activeTopic.flashcards.length > 0 && (
                  <>
                    <button
                      onClick={() => {
                        if (!activeTopic.flashcards || activeTopic.flashcards.length <= 1) return;
                        const shuffled = [...activeTopic.flashcards].sort(() => Math.random() - 0.5);
                        updateTopic(activeSubject.id, activeTopic.id, { flashcards: shuffled });
                        setCurrentFlashcardIndex(0);
                        setFlashcardFlipped(false);
                      }}
                      className="btn btn-secondary btn-sm flex items-center gap-1 text-[11px] font-bold rounded-full px-3 py-1.5"
                      title="Shuffle Deck"
                    >
                      <IconArrowsShuffle className="w-3.5 h-3.5" /> Shuffle
                    </button>
                    <button
                      onClick={() => {
                        setCurrentFlashcardIndex(0);
                        setFlashcardFlipped(false);
                      }}
                      className="btn btn-secondary btn-sm flex items-center gap-1 text-[11px] font-bold rounded-full px-3 py-1.5"
                      title="Restart Review"
                    >
                      <IconRefresh className="w-3.5 h-3.5" /> Reset
                    </button>
                  </>
                )}
                <button
                  onClick={() => setFlashcardModal({ open: true, front: '', back: '' })}
                  className="btn btn-primary btn-sm flex items-center gap-1 text-[11px] font-bold rounded-full px-3.5 py-1.5"
                >
                  <IconPlus className="w-3.5 h-3.5" /> Add Card
                </button>
              </div>
            </div>

            <FlashcardStudy
              flashcards={activeTopic.flashcards || []}
              currentFlashcardIndex={currentFlashcardIndex}
              setCurrentFlashcardIndex={setCurrentFlashcardIndex}
              flashcardFlipped={flashcardFlipped}
              setFlashcardFlipped={setFlashcardFlipped}
              handleRateFlashcard={handleRateFlashcard}
              setFlashcardModal={setFlashcardModal}
            />
          </div>
        )}

        {topicTab === 'revision' && (
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-text-primary mb-2 leading-tight">
                  Memory & Revision
                  <br />
                  Spacing
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">Smart repetition to help you remember better.</p>
              </div>

              <div className="bg-surface rounded-3xl p-8 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex flex-col items-center justify-center min-h-[220px]">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border dark:text-gray-800" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray="283"
                      strokeDashoffset={42}
                      strokeLinecap="round"
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-text-primary">
                      85<span className="text-lg">%</span>
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted mt-6">Retention Rate</span>
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-6 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex flex-col">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">Spacing Schedule Intervals</p>
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: 'Session 1',
                    subtitle: 'Same day',
                    status: 'Completed',
                    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
                  },
                  {
                    label: 'Session 2',
                    subtitle: '1 Day',
                    status: 'Tomorrow',
                    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  },
                  {
                    label: 'Session 3',
                    subtitle: '3 Days',
                    status: 'Upcoming',
                    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
                  },
                  {
                    label: 'Session 4',
                    subtitle: '7 Days',
                    status: 'Upcoming',
                    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
                  },
                  {
                    label: 'Session 5',
                    subtitle: '30 Days',
                    status: 'Upcoming',
                    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
                  },
                ].map((lvl, idx) => (
                  <div
                    key={lvl.label}
                    className="bg-surface hover:bg-surface-alt transition-colors rounded-2xl p-4 flex justify-between items-center cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border-none flex items-center justify-center text-sm font-bold shadow-inner">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-text-primary font-bold">{lvl.label}</span>
                        <span className="text-xs text-text-muted">{lvl.subtitle}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${lvl.color}`}>{lvl.status}</span>
                      <IconChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
