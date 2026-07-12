import {
  IconPlus,
  IconArrowLeft,
  IconClock,
  IconChecklist,
  IconTrash,
  IconBook,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ShikiHighlighter } from '../../../components/ui/ShikiHighlighter';
import { formatMinutes, cleanHtmlText } from '../utils/studyUtils';

interface SubjectDashboardProps {
  activeSubject: any;
  setSelectedSubjectId: (id: string | null) => void;
  setSelectedTopicId: (id: string | null) => void;
  subjectTab: string;
  setSubjectTab: (tab: any) => void;
  setTopicTab: (tab: any) => void;
  isTopicModalOpen: boolean;
  setIsTopicModalOpen: (val: boolean) => void;
  handleContinueLearning: (subject: any) => void;
  updateTopic: (subjId: string, topicId: string, data: any) => void;
  deleteTopic: (subjId: string, topicId: string) => Promise<void>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  isDark: boolean;
  handleToggleTopicTask: (taskId: string) => void;
}

export function SubjectDashboard({
  activeSubject,
  setSelectedSubjectId,
  setSelectedTopicId,
  subjectTab,
  setSubjectTab,
  setTopicTab,
  setIsTopicModalOpen,
  handleContinueLearning,
  updateTopic,
  deleteTopic,
  showConfirm,
  isDark,
  handleToggleTopicTask,
}: SubjectDashboardProps) {
  const total = activeSubject.topics.length;
  const completed = activeSubject.topics.filter((t: any) => t.done).length;
  const pending = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  let totalNotes = 0;
  let totalSnippets = 0;
  let totalResources = 0;
  let totalFlashcards = 0;
  let totalQuestions = 0;
  let totalTasks = 0;
  let studyTime = 0;

  activeSubject.topics.forEach((t: any) => {
    totalNotes += t.notes?.length || 0;
    totalSnippets += t.snippets?.length || 0;
    totalResources += t.resources?.length || 0;
    totalFlashcards += t.flashcards?.length || 0;
    totalQuestions += t.questions?.length || 0;
    totalTasks += t.tasks?.length || 0;
    studyTime += t.timeSpent || 0;
  });

  const nextUnfinishedTopic = activeSubject.topics.find((t: any) => !t.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex flex-col gap-6 text-left"
    >
      {/* Subject Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <button onClick={() => setSelectedSubjectId(null)} className="hover:text-primary transition-colors border-none bg-transparent cursor-pointer">
              Study Tracker
            </button>
            <span>/</span>
            <span className="text-text-primary font-medium">{activeSubject.name}</span>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {activeSubject.name}
            {activeSubject.semester && (
              <span className="text-xs font-semibold text-text-muted bg-surface-alt px-2.5 py-1 rounded-full border border-border-alt">
                {activeSubject.semester}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedSubjectId(null)} className="btn btn-secondary btn-md">
            <IconArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => setIsTopicModalOpen(true)} className="btn btn-primary btn-md">
            <IconPlus className="w-4 h-4" /> Add Topic
          </button>
        </div>
      </div>

      {/* Tab Selection */}
      <div className="flex border-b border-border overflow-x-auto gap-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'topics', label: `Topics (${total})` },
          { id: 'notes', label: `Notes (${totalNotes})` },
          { id: 'snippets', label: `Snippets (${totalSnippets})` },
          { id: 'resources', label: `Resources (${totalResources})` },
          { id: 'tasks', label: `Tasks (${totalTasks})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubjectTab(tab.id)}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap border-none bg-transparent cursor-pointer ${
              subjectTab === tab.id
                ? 'border-primary text-primary border-b-2 border-solid !border-b-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-alt'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel Render */}
      <div className="min-h-[400px]">
        {subjectTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="var(--border-border-alt)" strokeWidth="4" fill="transparent" />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        stroke="#f43f5e"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={151}
                        strokeDashoffset={151 - (151 * progress) / 100}
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-text-primary">{progress}%</span>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Progress</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">
                      {completed} of {total} completed
                    </p>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <IconClock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Study Time</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">{formatMinutes(studyTime)}</p>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                    <IconChecklist className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Remaining</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">{pending} Pending Topics</p>
                  </div>
                </div>
              </div>

              {/* Continue Learning card */}
              {nextUnfinishedTopic ? (
                <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      Continue learning
                    </span>
                    <h3 className="font-bold text-base text-text-primary mt-1.5">{nextUnfinishedTopic.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">Resume from where you last left off</p>
                  </div>
                  <button onClick={() => handleContinueLearning(activeSubject)} className="btn btn-primary btn-md">
                    Resume Learning
                  </button>
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-2xl p-5 text-sm text-text-secondary font-semibold">
                  🎉 Excellent! All topics inside this subject have been successfully completed!
                </div>
              )}

              {/* List of topics preview */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Topics Outline</p>
                <div className="flex flex-col gap-2">
                  {activeSubject.topics.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopicId(t.id)}
                      className="bg-surface border border-border hover:border-primary/20 rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all hover:translate-x-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${t.done ? 'bg-green-500' : 'bg-primary'}`} />
                        <span className="font-semibold text-sm text-text-primary">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted font-bold">
                        <span>{t.notes?.length || 0} Notes</span>
                        <span>•</span>
                        <span>{t.snippets?.length || 0} Code</span>
                        <span className="w-5 h-5 rounded-full bg-surface-alt border flex items-center justify-center">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Column: quick stats summaries */}
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-text-primary">Subject Contents</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-surface-alt border border-border-alt p-3 rounded-xl">
                    <p className="text-xl font-bold text-text-primary">{totalNotes}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Notes</p>
                  </div>
                  <div className="bg-surface-alt border border-border-alt p-3 rounded-xl">
                    <p className="text-xl font-bold text-text-primary">{totalSnippets}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Snippets</p>
                  </div>
                  <div className="bg-surface-alt border border-border-alt p-3 rounded-xl">
                    <p className="text-xl font-bold text-text-primary">{totalResources}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Resources</p>
                  </div>
                  <div className="bg-surface-alt border border-border-alt p-3 rounded-xl">
                    <p className="text-xl font-bold text-text-primary">{totalFlashcards}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Cards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {subjectTab === 'topics' && (
          <div className="space-y-4 relative pl-4 md:pl-8">
            {/* Timeline Connector Line */}
            {activeSubject.topics.length > 1 && (
              <div className="absolute left-1.5 md:left-3.5 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-border-alt z-0" />
            )}

            {!activeSubject.topics.length ? (
              <EmptyState
                icon={<IconBook className="w-8 h-8 text-text-muted" />}
                title="No topics added"
                description="Divide the syllabus of this subject into modular topics to track focus, notes, and progress separately."
                action={
                  <button onClick={() => setIsTopicModalOpen(true)} className="btn btn-primary btn-md">
                    Add First Topic
                  </button>
                }
              />
            ) : (
              <div className="flex flex-col gap-5 relative z-10">
                {activeSubject.topics.map((t: any) => {
                  const totalTasks = t.tasks?.length || 0;
                  const doneTasks = t.tasks?.filter((tk: any) => tk.done).length || 0;
                  const progressPct = t.done ? 100 : totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopicId(t.id)}
                      className={`group bg-surface border rounded-[24px] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative ${
                        t.done ? 'border-green-500/20 bg-green-500/[0.01] hover:border-green-500/40' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {/* Timeline Node Ring */}
                      <div
                        className={`absolute -left-[23px] md:-left-[39px] w-4 h-4 rounded-full border-4 bg-background z-20 transition-all ${
                          t.done ? 'border-green-500' : 'border-border group-hover:border-primary'
                        }`}
                      />

                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Radial Progress Ring */}
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0 bg-surface-alt rounded-full border border-border/40 shadow-inner">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="19" stroke="var(--border-border-alt)" strokeWidth="3" fill="transparent" />
                            <circle
                              cx="24"
                              cy="24"
                              r="19"
                              stroke={t.done ? '#10b981' : 'var(--color-primary)'}
                              strokeWidth="3"
                              fill="transparent"
                              strokeDasharray={119.3}
                              strokeDashoffset={119.3 - (119.3 * progressPct) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-500"
                            />
                          </svg>
                          <span className="absolute text-[10px] font-black text-text-primary">{t.done ? '✓' : `${progressPct}%`}</span>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <h4
                            className={`font-bold text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1 ${
                              t.done ? 'line-through text-text-muted decoration-green-500/30' : ''
                            }`}
                          >
                            {t.name}
                          </h4>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black ${
                                t.difficulty === 'hard'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : t.difficulty === 'easy'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {t.difficulty || 'medium'}
                            </span>
                            {t.priority && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold bg-surface-alt border border-border-alt text-text-secondary">
                                {t.priority}
                              </span>
                            )}
                            {t.timeSpent ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-primary/5 text-primary">
                                ⏱️ {formatMinutes(t.timeSpent)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right side controls */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t border-border-alt md:border-none">
                        <div className="text-xs text-text-muted space-x-2 font-bold">
                          <span>📝 {t.notes?.length || 0}</span>
                          <span>•</span>
                          <span>💻 {t.snippets?.length || 0}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTopic(activeSubject.id, t.id, { done: !t.done });
                            }}
                            className={`btn btn-sm btn-square rounded-full ${
                              t.done ? 'bg-green-500/15 text-green-500 hover:bg-green-500/25 border-none' : 'btn-secondary'
                            }`}
                            title={t.done ? 'Mark as In Progress' : 'Mark as Completed'}
                          >
                            {t.done ? '✓' : '○'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showConfirm('Delete Topic', 'Delete this topic permanently?', () => {
                                deleteTopic(activeSubject.id, t.id);
                              });
                            }}
                            className="btn btn-ghost btn-sm btn-square hover:text-rose-500"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {subjectTab === 'notes' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base">Notes Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubject.topics
                .flatMap((t: any) => (t.notes || []).map((note: any) => ({ ...note, topicName: t.name, topicId: t.id })))
                .map((note: any) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedTopicId(note.topicId);
                      setTopicTab('notes');
                    }}
                    className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:border-primary/20 transition-all"
                  >
                    <span className="text-[10px] uppercase font-bold text-text-muted">{note.topicName}</span>
                    <h4 className="font-bold text-sm text-text-primary mt-1 line-clamp-1">{note.title}</h4>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{cleanHtmlText(note.content)}</p>
                  </div>
                ))}
              {totalNotes === 0 && <div className="col-span-2 text-center text-text-muted p-10 font-bold">No notes written inside this subject yet.</div>}
            </div>
          </div>
        )}

        {subjectTab === 'snippets' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base">Saved Code Snippets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubject.topics
                .flatMap((t: any) => (t.snippets || []).map((snip: any) => ({ ...snip, topicName: t.name, topicId: t.id })))
                .map((snip: any) => (
                  <div key={snip.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-text-muted">{snip.topicName}</span>
                      <h4 className="font-bold text-sm text-text-primary mt-1 line-clamp-1">{snip.title}</h4>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-border w-full">
                      <ShikiHighlighter code={snip.code} lang={snip.language} theme={isDark ? 'one-dark-pro' : 'snazzy-light'} />
                    </div>
                  </div>
                ))}
              {totalSnippets === 0 && <div className="col-span-2 text-center text-text-muted p-10 font-bold">No snippets saved inside this subject yet.</div>}
            </div>
          </div>
        )}

        {subjectTab === 'resources' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base">Resource Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSubject.topics
                .flatMap((t: any) => (t.resources || []).map((res: any) => ({ ...res, topicName: t.name, topicId: t.id })))
                .map((res: any) => (
                  <div key={res.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-semibold text-text-primary truncate">{res.title}</p>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">
                        {res.topicName} • {res.url}
                      </p>
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-surface-alt border hover:bg-surface-hover rounded-lg text-xs font-semibold text-text-primary shrink-0 transition-colors"
                    >
                      Open
                    </a>
                  </div>
                ))}
              {totalResources === 0 && <div className="col-span-2 text-center text-text-muted p-10 font-bold">No study links logged inside this subject yet.</div>}
            </div>
          </div>
        )}

        {subjectTab === 'tasks' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="font-bold text-base">Checklist</h3>
            <div className="border border-border rounded-2xl overflow-hidden bg-surface divide-y divide-border">
              {activeSubject.topics
                .flatMap((t: any) => (t.tasks || []).map((task: any) => ({ ...task, topicName: t.name, topicId: t.id })))
                .map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTopicTask(task.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-hover/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          task.done ? 'bg-primary border-primary' : 'border-text-muted'
                        }`}
                      >
                        {task.done && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className={`text-sm ${task.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                        {task.title} <span className="text-[10px] text-text-muted font-normal ml-2">({task.topicName})</span>
                      </span>
                    </div>
                  </div>
                ))}
              {totalTasks === 0 && <div className="text-center text-text-muted p-10 font-bold">No tasks created inside this subject yet.</div>}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
