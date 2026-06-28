import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconBook, IconChevronDown, IconCheck, IconSearch, IconTargetArrow, IconChecklist, IconLayoutGrid } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';

const FILTERS = ['all', 'active', 'completed'] as const;
type StudyFilter = typeof FILTERS[number];

export default function StudyModule() {
  const { subjects, addSubject, addTopic, toggleTopic, deleteSubject, deleteTopic, showConfirm } = useAppStore();
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [subjectName, setSubjectName] = useState('');
  const [semester, setSemester] = useState('');
  const [topicName, setTopicName] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StudyFilter>('all');

  const toggleExpand = (id: string) => {
    setExpandedSubjects((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveSubject = () => {
    if (!subjectName.trim()) return;
    addSubject({ id: crypto.randomUUID(), name: subjectName, semester, topics: [] });
    setSubjectName('');
    setSemester('');
    setIsSubjectModalOpen(false);
  };

  const handleSaveTopic = () => {
    if (!topicName.trim() || !activeSubjectId) return;
    addTopic(activeSubjectId, { id: crypto.randomUUID(), name: topicName, done: false });
    setTopicName('');
    setIsTopicModalOpen(false);
    setExpandedSubjects((previous) => new Set(previous).add(activeSubjectId));
  };

  const subjectCards = useMemo(() => {
    return subjects
      .map((subject) => {
        const total = subject.topics.length;
        const completed = subject.topics.filter((topic) => topic.done).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const nextTopic = subject.topics.find((topic) => !topic.done)?.name ?? 'All topics completed';
        return { ...subject, total, completed, pending, progress, nextTopic };
      })
      .filter((subject) => {
        const query = search.toLowerCase();
        const matchesSearch = subject.name.toLowerCase().includes(query) || subject.topics.some((topic) => topic.name.toLowerCase().includes(query));
        if (!matchesSearch) return false;
        if (filter === 'active') return subject.pending > 0;
        if (filter === 'completed') return subject.total > 0 && subject.pending === 0;
        return true;
      })
      .sort((left, right) => {
        if (left.pending === 0 && right.pending > 0) return 1;
        if (left.pending > 0 && right.pending === 0) return -1;
        return right.progress - left.progress;
      });
  }, [subjects, search, filter]);

  const stats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    subjects.forEach((subject) => {
      totalTopics += subject.topics.length;
      completedTopics += subject.topics.filter((topic) => topic.done).length;
    });
    const activeSubjects = subjects.filter((subject) => subject.topics.some((topic) => !topic.done)).length;
    return {
      totalTopics,
      completedTopics,
      pendingTopics: totalTopics - completedTopics,
      activeSubjects,
      percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    };
  }, [subjects]);

  const focusSubject = subjectCards.find((subject) => subject.pending > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">Study Tracker <span className="w-2 h-2 rounded-full bg-primary inline-block"></span></h2>
          <p className="text-text-secondary text-sm">Plan subjects, break work into topics, and keep your next move obvious.</p>
        </div>
        <button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary btn-md"><IconPlus className="w-4 h-4" /> Add Subject</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-2 bg-surface border border-border rounded-[22px] p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Focus board</p>
              <h3 className="text-lg font-bold mt-1">Overall study momentum</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><IconTargetArrow className="w-5 h-5" /></div>
          </div>
          <div className="flex items-center gap-4"><ProgressBar progress={stats.percentage} className="flex-1" /><span className="font-bold text-lg shrink-0">{stats.percentage}%</span></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-surface-alt border border-border-alt p-4"><p className="text-xs uppercase tracking-[0.08em] text-text-muted">Subjects</p><p className="text-xl font-bold mt-2">{subjects.length}</p></div>
            <div className="rounded-2xl bg-surface-alt border border-border-alt p-4"><p className="text-xs uppercase tracking-[0.08em] text-text-muted">Done</p><p className="text-xl font-bold mt-2 text-green-500">{stats.completedTopics}</p></div>
            <div className="rounded-2xl bg-surface-alt border border-border-alt p-4"><p className="text-xs uppercase tracking-[0.08em] text-text-muted">Pending</p><p className="text-xl font-bold mt-2 text-amber-500">{stats.pendingTopics}</p></div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-surface border border-border rounded-[22px] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Next up</p>
              <h3 className="text-lg font-bold mt-1">Your best next focus</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><IconChecklist className="w-5 h-5" /></div>
          </div>
          {focusSubject ? (
            <div className="rounded-2xl bg-surface-alt border border-border-alt p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-semibold">{focusSubject.name}</p><p className="text-xs text-text-secondary mt-1">{focusSubject.pending} topic{focusSubject.pending !== 1 ? 's' : ''} left</p></div>
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">{focusSubject.progress}%</span>
              </div>
              <p className="text-sm text-text-secondary">Next topic: {focusSubject.nextTopic}</p>
            </div>
          ) : <div className="rounded-2xl bg-surface-alt border border-border-alt p-4 text-sm text-text-secondary">Everything is caught up. Add a new subject or break an existing one into more topics.</div>}
          <div className="text-xs text-text-muted">Active subjects: {stats.activeSubjects}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[22px] p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl"><IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects or topics" className="input-field pl-10" /></div>
        <div className="flex items-center gap-2 flex-wrap">{FILTERS.map((item) => <button key={item} onClick={() => setFilter(item)} className={`btn btn-sm ${filter === item ? 'btn-primary' : 'btn-secondary'}`}>{item === 'all' ? 'All' : item === 'active' ? 'In Progress' : 'Completed'}</button>)}</div>
      </div>

      {subjects.length === 0 ? (
        <EmptyState icon={<IconBook className="w-9 h-9 text-text-muted" />} title="No subjects added yet" description="Create your first subject and break it into small topics to track progress clearly." action={<button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary btn-md"><IconPlus className="w-4 h-4" /> Add First Subject</button>} />
      ) : subjectCards.length === 0 ? (
        <div className="bg-surface border border-border rounded-[22px] p-10 text-center text-text-muted">No study items match your current search or filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
          <AnimatePresence>
            {subjectCards.map((subject) => {
              const isExpanded = expandedSubjects.has(subject.id);
              return (
                <motion.div layout key={subject.id} className="bg-surface border border-border rounded-[22px] overflow-hidden group">
                  <div className="p-5 cursor-pointer hover:bg-surface-hover transition-colors flex flex-col gap-4" onClick={() => toggleExpand(subject.id)}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><IconLayoutGrid className="w-4 h-4" /></span>
                          {subject.semester && <span className="text-[11px] text-text-muted bg-surface-alt px-2.5 py-1 rounded-full border border-border-alt">{subject.semester}</span>}
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-1">{subject.name}</h3>
                        <p className="text-sm text-text-secondary">{subject.completed}/{subject.total} topics completed</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); showConfirm('Confirm Delete', 'Delete this subject and all its topics?', () => { deleteSubject(subject.id); }); }} className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100"><IconTrash className="w-4 h-4" /></button>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}><IconChevronDown className="w-5 h-5 text-text-muted" /></motion.div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-surface-alt border border-border-alt p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3 text-xs"><span className="text-text-muted">Progress</span><span className="font-semibold text-primary">{subject.progress}%</span></div>
                      <ProgressBar progress={subject.progress} />
                      <div className="flex items-center justify-between text-xs text-text-muted"><span>{subject.pending} pending</span><span>{subject.total} total</span></div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border bg-surface-alt">
                        <div className="p-3 flex flex-col gap-2">
                          {subject.topics.map((topic) => (
                            <div key={topic.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border-alt transition-colors group/topic cursor-pointer" onClick={() => toggleTopic(subject.id, topic.id)}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${topic.done ? 'bg-primary border-primary' : 'border-text-muted'}`}>{topic.done && <IconCheck className="w-3 h-3 text-white" />}</div>
                                <span className={`text-sm transition-colors ${topic.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>{topic.name}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); deleteTopic(subject.id, topic.id); }} className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500 opacity-0 group-hover/topic:opacity-100"><IconTrash className="w-3 h-3" /></button>
                            </div>
                          ))}

                          <button onClick={(e) => { e.stopPropagation(); setActiveSubjectId(subject.id); setIsTopicModalOpen(true); }} className="btn btn-secondary btn-md justify-start w-full mt-1"><IconPlus className="w-4 h-4" /> Add Topic</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add Subject">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-text-secondary">Subject Name</label><input type="text" placeholder="e.g. Operating Systems" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="input-field" /></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-text-secondary">Semester or Label</label><input type="text" placeholder="e.g. Sem 4, Fall 2025" value={semester} onChange={(e) => setSemester(e.target.value)} className="input-field" /></div>
          <div className="flex justify-end gap-2 mt-4"><button onClick={() => setIsSubjectModalOpen(false)} className="btn btn-secondary btn-md">Cancel</button><button onClick={handleSaveSubject} className="btn btn-primary btn-md">Add Subject</button></div>
        </div>
      </Modal>

      <Modal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} title="Add Topic">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-text-secondary">Topic Name</label><input type="text" placeholder="e.g. Process Management" value={topicName} onChange={(e) => setTopicName(e.target.value)} className="input-field" /></div>
          <div className="flex justify-end gap-2 mt-4"><button onClick={() => setIsTopicModalOpen(false)} className="btn btn-secondary btn-md">Cancel</button><button onClick={handleSaveTopic} className="btn btn-primary btn-md">Add Topic</button></div>
        </div>
      </Modal>
    </motion.div>
  );
}
