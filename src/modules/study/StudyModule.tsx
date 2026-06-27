import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconBook, IconChevronDown, IconCheck } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function StudyModule() {
  const { subjects, addSubject, addTopic, toggleTopic, deleteSubject, deleteTopic , showConfirm} = useAppStore();
  
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [semester, setSemester] = useState('');
  const [topicName, setTopicName] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveSubject = () => {
    if (!subjectName.trim()) return;
    addSubject({
      id: crypto.randomUUID(),
      name: subjectName,
      semester,
      topics: []
    });
    setSubjectName('');
    setSemester('');
    setIsSubjectModalOpen(false);
  };

  const handleSaveTopic = () => {
    if (!topicName.trim() || !activeSubjectId) return;
    addTopic(activeSubjectId, {
      id: crypto.randomUUID(),
      name: topicName,
      done: false
    });
    setTopicName('');
    setIsTopicModalOpen(false);
    
    // Auto expand the subject when adding a topic
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      next.add(activeSubjectId);
      return next;
    });
  };

  const stats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    subjects.forEach(s => {
      totalTopics += s.topics.length;
      completedTopics += s.topics.filter(t => t.done).length;
    });
    return {
      totalTopics,
      completedTopics,
      pendingTopics: totalTopics - completedTopics,
      percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
    };
  }, [subjects]);

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
            Study Tracker <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </h2>
          <p className="text-text-secondary text-sm">Track your subjects and progress</p>
        </div>
        <button
          onClick={() => setIsSubjectModalOpen(true)}
          className="bg-primary hover:bg-primary-muted text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-5 rounded-xl md:col-span-2 flex flex-col justify-center">
          <p className="text-sm text-text-secondary mb-2">Overall Progress</p>
          <div className="flex items-center gap-4">
            <ProgressBar progress={stats.percentage} className="flex-1" />
            <span className="font-bold text-lg">{stats.percentage}%</span>
          </div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <p className="text-sm text-text-secondary mb-1">Topics Completed</p>
          <p className="text-2xl font-bold text-green-500">{stats.completedTopics}</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <p className="text-sm text-text-secondary mb-1">Topics Pending</p>
          <p className="text-2xl font-bold text-amber-500">{stats.pendingTopics}</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 mb-6 rounded-full bg-surface-alt flex items-center justify-center">
            <IconBook className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-medium mb-2">No subjects added</h3>
          <p className="text-text-secondary max-w-md mb-6">Create subjects and break them down into smaller topics to track your study progress.</p>
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="text-primary hover:underline font-medium"
          >
            Add your first subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
          <AnimatePresence>
            {subjects.map(subject => {
              const isExpanded = expandedSubjects.has(subject.id);
              const total = subject.topics.length;
              const done = subject.topics.filter(t => t.done).length;
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <motion.div
                  layout
                  key={subject.id}
                  className="bg-surface border border-border rounded-xl overflow-hidden group"
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-surface-hover transition-colors flex flex-col gap-3"
                    onClick={() => toggleExpand(subject.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                        {subject.semester && (
                          <span className="text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded mt-1 inline-block">
                            {subject.semester}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm('Confirm Delete', 'Delete this subject and all its topics?', () => { deleteSubject(subject.id); });
                          }}
                          className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconChevronDown className="w-5 h-5 text-text-muted" />
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <ProgressBar progress={progress} />
                      <span className="text-xs font-medium text-text-secondary shrink-0 w-8 text-right">{progress}%</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-surface-alt"
                      >
                        <div className="p-2 flex flex-col gap-1">
                          {subject.topics.map(topic => (
                            <div 
                              key={topic.id}
                              className="flex items-center justify-between p-2 rounded hover:bg-surface-alt transition-colors group/topic cursor-pointer"
                              onClick={() => toggleTopic(subject.id, topic.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${topic.done ? 'bg-primary border-primary' : 'border-text-muted'}`}>
                                  {topic.done && <IconCheck className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm transition-colors ${topic.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                                  {topic.name}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTopic(subject.id, topic.id);
                                }}
                                className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover/topic:opacity-100"
                              >
                                <IconTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSubjectId(subject.id);
                              setIsTopicModalOpen(true);
                            }}
                            className="flex items-center gap-2 p-2 mt-1 text-sm text-text-muted hover:text-primary transition-colors w-full"
                          >
                            <IconPlus className="w-4 h-4" /> Add Topic
                          </button>
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

      {/* Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Subject"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Semester/Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Sem 4, Fall 2025"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSubject}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-muted text-white rounded-lg transition-colors"
            >
              Add Subject
            </button>
          </div>
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title="Add Topic"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Topic Name</label>
            <input
              type="text"
              placeholder="e.g. Process Management"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsTopicModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTopic}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-muted text-white rounded-lg transition-colors"
            >
              Add Topic
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
