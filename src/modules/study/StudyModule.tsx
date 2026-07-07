import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlus, IconTrash, IconBook, IconCheck, IconSearch,
  IconTargetArrow, IconChecklist, IconLayoutGrid, IconArrowLeft, IconClock,
  IconCode, IconLink, IconHelpCircle, IconNotes, IconEdit, IconRefresh,
  IconFileText, IconDots, IconCopy,
  IconBrandYoutube, IconExternalLink, IconBrandGithub,
  IconChevronLeft, IconChevronRight, IconArrowsShuffle
} from '@tabler/icons-react';
import { useAppStore, type Topic } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { ShikiHighlighter } from '../../components/ui/ShikiHighlighter';

const FILTERS = ['all', 'active', 'completed'] as const;
type StudyFilter = typeof FILTERS[number];

// Helper to format study minutes
const formatMinutes = (m: number = 0) => {
  if (m < 60) return `${m}m`;
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

// Clean HTML to text for plain previews
const cleanHtmlText = (html: string) => {
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export default function StudyModule() {
  const {
    subjects, addSubject, addTopic, deleteSubject, deleteTopic,
    updateTopic, showConfirm, theme
  } = useAppStore(useShallow(state => ({
    subjects: state.subjects,
    addSubject: state.addSubject,
    addTopic: state.addTopic,
    deleteSubject: state.deleteSubject,
    deleteTopic: state.deleteTopic,
    updateTopic: state.updateTopic,
    showConfirm: state.showConfirm,
    theme: state.theme
  })));

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Navigation states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Subject Dashboard tabs: 'overview', 'topics', 'notes', 'snippets', 'resources', 'tasks', 'analytics'
  const [subjectTab, setSubjectTab] = useState<'overview' | 'topics' | 'notes' | 'snippets' | 'resources' | 'tasks' | 'analytics'>('overview');
  // Topic Workspace tabs: 'overview', 'notes', 'code', 'resources', 'tasks', 'questions', 'flashcards', 'revision'
  const [topicTab, setTopicTab] = useState<'overview' | 'notes' | 'code' | 'resources' | 'tasks' | 'questions' | 'flashcards' | 'revision'>('overview');

  // Search & Filters on main screen
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StudyFilter>('all');

  // Add Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [semester, setSemester] = useState('');

  // Add Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicName, setTopicName] = useState('');

  // Local state for modals inside Workspace
  const [noteModal, setNoteModal] = useState<{ open: boolean; noteId: string | null; title: string; content: string; isReadOnly: boolean }>({ open: false, noteId: null, title: '', content: '', isReadOnly: false });
  const [snippetModal, setSnippetModal] = useState<{ open: boolean; snippetId: string | null; title: string; lang: string; code: string; desc: string; tags: string }>({ open: false, snippetId: null, title: '', lang: 'javascript', code: '', desc: '', tags: '' });
  const [resourceModal, setResourceModal] = useState<{ open: boolean; title: string; url: string; type: 'link' | 'pdf' | 'doc' | 'image' | 'video' | 'youtube' }>({ open: false, title: '', url: '', type: 'link' });
  const [questionModal, setQuestionModal] = useState<{ open: boolean; question: string; answer: string; difficulty: 'easy' | 'medium' | 'hard' }>({ open: false, question: '', answer: '', difficulty: 'medium' });
  const [flashcardModal, setFlashcardModal] = useState<{ open: boolean; front: string; back: string }>({ open: false, front: '', back: '' });
  const [taskInput, setTaskInput] = useState('');

  // Spaced repetition flashcard active state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Local focus timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(1500); // 25 mins by default
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(1500);
  const [timerPreset, setTimerPreset] = useState<number>(20); // mins

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(s => s - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Automatically save elapsed focus session minutes to analytics
      const elapsedMins = Math.round(timerDuration / 60);
      if (selectedSubjectId && selectedTopicId && elapsedMins > 0) {
        const subject = subjects.find(s => s.id === selectedSubjectId);
        const topic = subject?.topics.find(t => t.id === selectedTopicId);
        if (topic) {
          const totalSpent = (topic.timeSpent || 0) + elapsedMins;
          const studySessions = (topic.analytics?.studySessions || 0) + 1;
          updateTopic(selectedSubjectId, selectedTopicId, {
            timeSpent: totalSpent,
            analytics: {
              ...topic.analytics,
              timeSpent: totalSpent,
              studySessions,
            }
          });
        }
      }
      alert('Focus session completed! Take a break.');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSecondsLeft, timerDuration, selectedSubjectId, selectedTopicId, updateTopic, subjects]);

  const startTimer = (mins: number) => {
    setTimerPreset(mins);
    const secs = mins * 60;
    setTimerDuration(secs);
    setTimerSecondsLeft(secs);
    setTimerRunning(true);
  };

  // Find active subject and topic objects
  const activeSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  const activeTopic = useMemo(() => activeSubject?.topics.find(t => t.id === selectedTopicId), [activeSubject, selectedTopicId]);

  // Main screen calculation
  const subjectCards = useMemo(() => {
    return subjects
      .map((subject) => {
        const total = subject.topics.length;
        const completed = subject.topics.filter((t) => t.done).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Accumulate details
        let notesCount = 0;
        let snippetCount = 0;
        let resourcesCount = 0;
        let questionsCount = 0;
        let flashcardsCount = 0;
        let tasksCount = 0;
        let studyTime = 0;

        subject.topics.forEach(t => {
          notesCount += t.notes?.length || 0;
          snippetCount += t.snippets?.length || 0;
          resourcesCount += t.resources?.length || 0;
          questionsCount += t.questions?.length || 0;
          flashcardsCount += t.flashcards?.length || 0;
          tasksCount += t.tasks?.length || 0;
          studyTime += t.timeSpent || 0;
        });

        const nextTopic = subject.topics.find((t) => !t.done);
        return {
          ...subject, total, completed, pending, progress,
          nextTopicName: nextTopic?.name ?? 'All completed',
          nextTopicId: nextTopic?.id ?? null,
          notesCount, snippetCount, resourcesCount, questionsCount, flashcardsCount, tasksCount, studyTime
        };
      })
      .filter((subject) => {
        const query = search.toLowerCase();
        const matchesSearch = subject.name.toLowerCase().includes(query) || subject.topics.some((t) => t.name.toLowerCase().includes(query));
        if (!matchesSearch) return false;
        if (filter === 'active') return subject.pending > 0;
        if (filter === 'completed') return subject.total > 0 && subject.pending === 0;
        return true;
      });
  }, [subjects, search, filter]);

  // Stats aggregate
  const stats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    let totalNotes = 0;
    let totalSnippets = 0;
    let totalResources = 0;
    let totalFlashcards = 0;
    let totalQuestions = 0;
    let totalStudyTime = 0;

    subjects.forEach((subject) => {
      subject.topics.forEach((t) => {
        totalTopics++;
        if (t.done) completedTopics++;
        totalNotes += t.notes?.length || 0;
        totalSnippets += t.snippets?.length || 0;
        totalResources += t.resources?.length || 0;
        totalFlashcards += t.flashcards?.length || 0;
        totalQuestions += t.questions?.length || 0;
        totalStudyTime += t.timeSpent || 0;
      });
    });

    return {
      totalTopics, completedTopics, pendingTopics: totalTopics - completedTopics,
      percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      totalNotes, totalSnippets, totalResources, totalFlashcards, totalQuestions, totalStudyTime
    };
  }, [subjects]);

  const handleSaveSubject = () => {
    if (!subjectName.trim()) return;
    addSubject({ id: crypto.randomUUID(), name: subjectName, semester, topics: [] });
    setSubjectName('');
    setSemester('');
    setIsSubjectModalOpen(false);
  };

  const handleSaveTopic = () => {
    if (!topicName.trim() || !selectedSubjectId) return;
    addTopic(selectedSubjectId, {
      id: crypto.randomUUID(),
      name: topicName,
      done: false,
      difficulty: 'medium',
      priority: 'medium',
      timeSpent: 0,
      notes: [],
      snippets: [],
      resources: [],
      questions: [],
      flashcards: [],
      tasks: [],
      tags: [],
    });
    setTopicName('');
    setIsTopicModalOpen(false);
  };

  // Continue unfinished topic helper
  const handleContinueLearning = (subject: any) => {
    if (subject.nextTopicId) {
      setSelectedSubjectId(subject.id);
      setSelectedTopicId(subject.nextTopicId);
      setTopicTab('overview');
    }
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  /*  SUB-MUTATIONS WITHIN TOPIC WORKSPACE                                      */
  /* ────────────────────────────────────────────────────────────────────────── */

  const handleUpdateTopicField = (fieldData: Partial<Topic>) => {
    if (selectedSubjectId && selectedTopicId) {
      updateTopic(selectedSubjectId, selectedTopicId, fieldData);
    }
  };

  // Topic Notes
  const handleSaveTopicNote = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const notesList = activeTopic.notes ? [...activeTopic.notes] : [];
    if (noteModal.noteId) {
      const idx = notesList.findIndex(n => n.id === noteModal.noteId);
      if (idx !== -1) {
        notesList[idx] = {
          ...notesList[idx],
          title: noteModal.title,
          content: noteModal.content,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      notesList.push({
        id: crypto.randomUUID(),
        title: noteModal.title || 'Untitled Note',
        content: noteModal.content,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    updateTopic(selectedSubjectId, selectedTopicId, { notes: notesList });
    setNoteModal({ open: false, noteId: null, title: '', content: '', isReadOnly: false });
  };

  // Topic Code Snippets
  const handleSaveTopicSnippet = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const snippetsList = activeTopic.snippets ? [...activeTopic.snippets] : [];
    const tagsArr = snippetModal.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (snippetModal.snippetId) {
      const idx = snippetsList.findIndex(s => s.id === snippetModal.snippetId);
      if (idx !== -1) {
        snippetsList[idx] = {
          ...snippetsList[idx],
          title: snippetModal.title,
          language: snippetModal.lang,
          code: snippetModal.code,
          description: snippetModal.desc,
          tags: tagsArr
        };
      }
    } else {
      snippetsList.push({
        id: crypto.randomUUID(),
        title: snippetModal.title || 'Code Example',
        language: snippetModal.lang,
        code: snippetModal.code,
        description: snippetModal.desc,
        tags: tagsArr
      });
    }
    updateTopic(selectedSubjectId, selectedTopicId, { snippets: snippetsList });
    setSnippetModal({ open: false, snippetId: null, title: '', lang: 'javascript', code: '', desc: '', tags: '' });
  };

  // Topic Resources
  const handleSaveTopicResource = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const resourcesList = activeTopic.resources ? [...activeTopic.resources] : [];
    resourcesList.push({
      id: crypto.randomUUID(),
      title: resourceModal.title || 'Resource Link',
      url: resourceModal.url,
      type: resourceModal.type,
      uploadDate: new Date().toLocaleDateString('en-GB')
    });
    updateTopic(selectedSubjectId, selectedTopicId, { resources: resourcesList });
    setResourceModal({ open: false, title: '', url: '', type: 'link' });
  };

  // Topic Tasks
  const handleAddTopicTask = () => {
    if (!taskInput.trim() || !activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const tasksList = activeTopic.tasks ? [...activeTopic.tasks] : [];
    tasksList.push({
      id: crypto.randomUUID(),
      title: taskInput.trim(),
      done: false
    });
    updateTopic(selectedSubjectId, selectedTopicId, { tasks: tasksList });
    setTaskInput('');
  };

  const handleToggleTopicTask = (taskId: string) => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const tasksList = activeTopic.tasks?.map(t => t.id === taskId ? { ...t, done: !t.done } : t) || [];
    updateTopic(selectedSubjectId, selectedTopicId, { tasks: tasksList });
  };

  const handleDeleteTopicTask = (taskId: string) => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const tasksList = activeTopic.tasks?.filter(t => t.id !== taskId) || [];
    updateTopic(selectedSubjectId, selectedTopicId, { tasks: tasksList });
  };

  // Topic Questions
  const handleSaveTopicQuestion = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const questionsList = activeTopic.questions ? [...activeTopic.questions] : [];
    questionsList.push({
      id: crypto.randomUUID(),
      question: questionModal.question,
      answer: questionModal.answer,
      difficulty: questionModal.difficulty as 'easy' | 'medium' | 'hard',
      status: 'unsolved' as 'solved' | 'unsolved'
    });
    updateTopic(selectedSubjectId, selectedTopicId, { questions: questionsList });
    setQuestionModal({ open: false, question: '', answer: '', difficulty: 'medium' });
  };

  const handleToggleQuestionSolved = (qId: string) => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const questionsList = activeTopic.questions?.map(q => q.id === qId ? { ...q, status: (q.status === 'solved' ? 'unsolved' : 'solved') as 'solved' | 'unsolved' } : q) || [];
    updateTopic(selectedSubjectId, selectedTopicId, { questions: questionsList });
  };

  // Topic Flashcards
  const handleSaveTopicFlashcard = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const flashcardsList = activeTopic.flashcards ? [...activeTopic.flashcards] : [];
    flashcardsList.push({
      id: crypto.randomUUID(),
      front: flashcardModal.front,
      back: flashcardModal.back,
      difficulty: 'medium',
      revisionCount: 0
    });
    updateTopic(selectedSubjectId, selectedTopicId, { flashcards: flashcardsList });
    setFlashcardModal({ open: false, front: '', back: '' });
  };

  const handleRateFlashcard = (rating: 'easy' | 'medium' | 'hard') => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const cards = activeTopic.flashcards ? [...activeTopic.flashcards] : [];
    const current = cards[currentFlashcardIndex];
    if (current) {
      cards[currentFlashcardIndex] = {
        ...current,
        difficulty: rating,
        revisionCount: (current.revisionCount || 0) + 1,
        lastReviewed: new Date().toISOString(),
        nextReview: new Date(Date.now() + (rating === 'easy' ? 4 : rating === 'medium' ? 2 : 1) * 24 * 60 * 60 * 1000).toISOString()
      };
      updateTopic(selectedSubjectId, selectedTopicId, { flashcards: cards });
    }
    setFlashcardFlipped(false);
    if (currentFlashcardIndex < cards.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
    } else {
      setCurrentFlashcardIndex(0);
      alert('You have completed reviewing all flashcards for this round!');
    }
  };

  useEffect(() => {
    if (topicTab !== 'flashcards' || !activeTopic?.flashcards?.length) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable'))) {
        return;
      }
      
      const cards = activeTopic.flashcards || [];
      if (e.key === ' ') {
        e.preventDefault();
        setFlashcardFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFlashcardFlipped(false);
        setCurrentFlashcardIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFlashcardFlipped(false);
        setCurrentFlashcardIndex(prev => Math.min(prev + 1, cards.length - 1));
      } else if (flashcardFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRateFlashcard('easy');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRateFlashcard('medium');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRateFlashcard('hard');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topicTab, activeTopic?.flashcards, flashcardFlipped, currentFlashcardIndex]);

  /* ────────────────────────────────────────────────────────────────────────── */
  /*  RENDER BRANCHES: Workspace, Subject Dashboard, or root listing            */
  /* ────────────────────────────────────────────────────────────────────────── */

  // 1. TOPIC WORKSPACE VIEW
  if (activeSubject && activeTopic) {
    const totalTasks = activeTopic.tasks?.length || 0;
    const doneTasks = activeTopic.tasks?.filter(t => t.done).length || 0;
    const taskPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="flex flex-col gap-6"
      >
        {/* Breadcrumb Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <button onClick={() => setSelectedTopicId(null)} className="hover:text-primary transition-colors">Study Tracker</button>
              <span>/</span>
              <button onClick={() => setSelectedTopicId(null)} className="hover:text-primary transition-colors">{activeSubject.name}</button>
              <span>/</span>
              <span className="text-text-primary font-medium">{activeTopic.name}</span>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {activeTopic.name}
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${activeTopic.done ? 'bg-green-500' : 'bg-primary'}`} />
            </h1>
          </div>
          <button
            onClick={() => setSelectedTopicId(null)}
            className="btn btn-secondary btn-md flex items-center gap-2"
          >
            <IconArrowLeft className="w-4 h-4" /> Back to Subject
          </button>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex border-b border-border overflow-x-auto gap-1">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'notes', label: `Notes (${activeTopic.notes?.length || 0})` },
            { id: 'code', label: `Code (${activeTopic.snippets?.length || 0})` },
            { id: 'resources', label: `Resources (${activeTopic.resources?.length || 0})` },
            { id: 'tasks', label: `Tasks (${doneTasks}/${totalTasks})` },
            { id: 'questions', label: `Questions (${activeTopic.questions?.length || 0})` },
            { id: 'flashcards', label: `Flashcards (${activeTopic.flashcards?.length || 0})` },
            { id: 'revision', label: 'Revision' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setTopicTab(tab.id)}
              className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                topicTab === tab.id
                  ? 'border-primary text-primary'
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
              {/* Left Column: Stats & Description */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-base text-text-primary">Topic Parameters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Difficulty</label>
                      <CustomSelect
                        value={activeTopic.difficulty || 'medium'}
                        onChange={val => handleUpdateTopicField({ difficulty: val as any })}
                        options={[
                          { value: 'easy', label: '🟢 Easy' },
                          { value: 'medium', label: '🟡 Medium' },
                          { value: 'hard', label: '🔴 Hard' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Priority</label>
                      <CustomSelect
                        value={activeTopic.priority || 'medium'}
                        onChange={val => handleUpdateTopicField({ priority: val as any })}
                        options={[
                          { value: 'low', label: '🔵 Low' },
                          { value: 'medium', label: '🟡 Medium' },
                          { value: 'high', label: '🔴 High' }
                        ]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Topic Description</label>
                    <textarea
                      value={activeTopic.description || ''}
                      onChange={e => handleUpdateTopicField({ description: e.target.value })}
                      placeholder="Add key objectives, goals, or summary of this topic..."
                      className="w-full bg-surface-alt border border-border-alt rounded-xl p-3 text-sm focus:outline-none focus:border-primary min-h-[100px] resize-vertical"
                    />
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface border border-border p-4 rounded-2xl">
                    <p className="text-xs text-text-secondary">Focus Time</p>
                    <p className="text-xl font-bold mt-1 text-primary">{formatMinutes(activeTopic.timeSpent)}</p>
                  </div>
                  <div className="bg-surface border border-border p-4 rounded-2xl">
                    <p className="text-xs text-text-secondary">Solved Qs</p>
                    <p className="text-xl font-bold mt-1 text-green-500">
                      {activeTopic.questions?.filter(q => q.status === 'solved').length || 0}
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

              {/* Right Column: Focus Timer Integration */}
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6 text-center space-y-6">
                  <div>
                    <h3 className="font-bold text-base text-text-primary">Focus Session</h3>
                    <p className="text-xs text-text-secondary mt-1">Clock study time directly into analytics</p>
                  </div>

                  {/* Visual SVG Timer Dial */}
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="64" stroke="var(--border-border-alt)" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="72" cy="72" r="64"
                        stroke="#f43f5e" strokeWidth="8" fill="transparent"
                        strokeDasharray={402}
                        strokeDashoffset={402 - (402 * (timerSecondsLeft / (timerDuration || 1))) }
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold font-mono">
                        {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex justify-center gap-2">
                    {[5, 10, 20, 25].map(m => (
                      <button
                        key={m}
                        onClick={() => startTimer(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          timerPreset === m
                            ? 'bg-primary text-white border-primary'
                            : 'border-border bg-surface hover:bg-surface-hover text-text-secondary'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {timerRunning ? (
                      <button
                        onClick={() => setTimerRunning(false)}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Pause Focus
                      </button>
                    ) : (
                      <button
                        onClick={() => setTimerRunning(true)}
                        className="flex-1 py-2.5 bg-primary hover:bg-primary-muted text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Start Focus
                      </button>
                    )}
                    <button
                      onClick={() => { setTimerRunning(false); setTimerSecondsLeft(timerDuration); }}
                      className="px-4 py-2.5 border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Mark Completed Switch */}
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
                  {activeTopic.notes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => setNoteModal({ open: true, noteId: note.id, title: note.title, content: note.content, isReadOnly: true })}
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
                          onClick={e => {
                            e.stopPropagation();
                            showConfirm('Delete Note', 'Delete this note permanently?', () => {
                              const list = activeTopic.notes?.filter(n => n.id !== note.id) || [];
                              handleUpdateTopicField({ notes: list });
                            });
                          }}
                          className="text-text-muted hover:text-text-primary p-1 shrink-0"
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
                          onClick={e => {
                            e.stopPropagation();
                            showConfirm('Delete Note', 'Delete this note permanently?', () => {
                              const list = activeTopic.notes?.filter(n => n.id !== note.id) || [];
                              handleUpdateTopicField({ notes: list });
                            });
                          }}
                          className="text-rose-500 font-medium hover:text-rose-600 transition-colors"
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
                  onClick={() => setSnippetModal({ open: true, snippetId: null, title: '', lang: 'javascript', code: '', desc: '', tags: '' })}
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
                  {activeTopic.snippets.map(snip => (
                    <div
                      key={snip.id}
                      className="bg-surface border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 rounded-3xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${
                            snip.language.toLowerCase() === 'javascript' || snip.language.toLowerCase() === 'js' ? 'bg-[#F7DF1E] text-black' :
                            snip.language.toLowerCase() === 'typescript' || snip.language.toLowerCase() === 'ts' ? 'bg-[#3178C6] text-white' :
                            snip.language.toLowerCase() === 'python' ? 'bg-[#3776AB] text-white' :
                            snip.language.toLowerCase() === 'html' ? 'bg-[#E34F26] text-white' :
                            snip.language.toLowerCase() === 'css' ? 'bg-[#1572B6] text-white' :
                            'bg-gray-100 dark:bg-gray-800 text-text-primary'
                          }`}>
                            {snip.language.toLowerCase() === 'javascript' ? 'JS' : 
                             snip.language.toLowerCase() === 'typescript' ? 'TS' :
                             snip.language.substring(0, 2).toUpperCase()}
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
                            onClick={() => setSnippetModal({ open: true, snippetId: snip.id, title: snip.title, lang: snip.language, code: snip.code, desc: snip.description || '', tags: snip.tags?.join(', ') || '' })}
                            className="btn btn-ghost btn-sm btn-square"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const list = activeTopic.snippets?.filter(s => s.id !== snip.id) || [];
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
                            // Assuming there's a toast function available, ideally we'd show a toast here.
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-surface/80 backdrop-blur border border-border text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary z-10"
                          title="Copy Code"
                        >
                          <IconCopy className="w-4 h-4" />
                        </button>
                        <div className="p-1">
                          <ShikiHighlighter
                            code={snip.code}
                            lang={snip.language}
                            theme={isDark ? 'one-dark-pro' : 'snazzy-light'}
                          />
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
                  {activeTopic.resources.map(res => (
                    <div
                      key={res.id}
                      className="bg-surface border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 rounded-3xl p-5 flex items-center justify-between gap-4 transition-shadow hover:shadow-md"
                    >
                      <div className="min-w-0 flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                          res.type === 'youtube' || res.type === 'video' ? 'bg-[#FF0000]/10 text-[#FF0000]' :
                          res.type === 'pdf' ? 'bg-red-500/10 text-red-500' :
                          res.url.includes('github.com') ? 'bg-gray-800/10 text-gray-800 dark:bg-gray-100/10 dark:text-gray-100' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {res.type === 'youtube' || res.type === 'video' ? <IconBrandYoutube className="w-7 h-7" /> : 
                           res.type === 'pdf' ? <IconFileText className="w-7 h-7" /> : 
                           res.url.includes('github.com') ? <IconBrandGithub className="w-7 h-7" /> :
                           <IconLink className="w-7 h-7" />}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <p className="text-base font-bold text-text-primary line-clamp-1 leading-tight">{res.title}</p>
                          <p className="text-xs text-text-muted mt-1 truncate">{res.url}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 w-max">
                              {res.type === 'youtube' || res.type === 'video' ? 'Video' : res.type === 'pdf' ? 'Document' : 'Link'}
                            </span>
                            {res.tags?.map(t => (
                              <span key={t} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 w-max">
                                {t}
                              </span>
                            ))}
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
                            const list = activeTopic.resources?.filter(r => r.id !== res.id) || [];
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
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-text-primary mb-2 leading-tight">Topic-Specific<br/>Checklist</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Break down your topic into small, actionable tasks.
                  </p>
                </div>
                
                <div className="pt-6 border-t border-border/60">
                  <h4 className="font-bold text-base text-text-primary mb-2">All clear</h4>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-text-muted leading-relaxed">
                      Divide this topic into micro actionable tasks (e.g. review, practice, quiz).
                    </p>
                    {(!activeTopic.tasks?.length || activeTopic.tasks.every(t => t.done)) ? (
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

              {/* Right Column */}
              <div className="bg-surface rounded-3xl p-6 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Read Textbook page 231"
                      value={taskInput}
                      onChange={e => setTaskInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTopicTask()}
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
                      {activeTopic.tasks.map(task => (
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
                            <span className={`text-sm font-medium transition-all ${task.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                              {task.title}
                            </span>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteTopicTask(task.id); }}
                            className="p-2 rounded-xl text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
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
                  {activeTopic.questions.map(q => (
                    <div
                      key={q.id}
                      className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                            q.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500' : q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                            q.status === 'solved' ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/10 text-text-muted'
                          }`}>
                            {q.status}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const list = activeTopic.questions?.filter(qi => qi.id !== q.id) || [];
                            handleUpdateTopicField({ questions: list });
                          }}
                          className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{q.question}</p>
                      {q.answer && <p className="text-xs text-text-secondary bg-surface-alt p-3.5 rounded-xl border border-border-alt leading-relaxed">{q.answer}</p>}
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
              {/* Header Info */}
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
                          updateTopic(selectedSubjectId!, selectedTopicId!, { flashcards: shuffled });
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

              {!activeTopic.flashcards?.length ? (
                <EmptyState
                  icon={<IconRefresh className="w-8 h-8 text-text-muted" />}
                  title="Flashcards vault empty"
                  description="Leverage flashcards for active recall and spaced repetition memory enhancement."
                  action={
                    <button
                      onClick={() => setFlashcardModal({ open: true, front: '', back: '' })}
                      className="btn btn-primary btn-md"
                    >
                      Create First Card
                    </button>
                  }
                />
              ) : (
                <div className="space-y-6 flex flex-col items-center w-full">
                  {/* Progress Indicator */}
                  <div className="w-full space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary tracking-wide">
                      <span>PROGRESS</span>
                      <span>Card {currentFlashcardIndex + 1} of {activeTopic.flashcards.length}</span>
                    </div>
                    <div className="w-full bg-border-alt h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300 rounded-full" 
                        style={{ width: `${Math.round(((currentFlashcardIndex + 1) / activeTopic.flashcards.length) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-6 w-full justify-center">
                    
                    {/* Card Container (3D Flip Effect - Vertical & Minimal) */}
                    <div
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      style={{ perspective: 1200 }}
                      className="w-[320px] h-[430px] sm:w-[360px] sm:h-[480px] cursor-pointer relative select-none"
                    >
                      <motion.div
                        animate={{ rotateY: flashcardFlipped ? 180 : 0 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="w-full h-full relative"
                      >
                        {/* Front Side */}
                        <div
                          style={{ backfaceVisibility: 'hidden' }}
                          className="absolute inset-0 bg-surface border border-border rounded-[28px] p-8 flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden transition-colors"
                        >
                          <span className="px-3.5 py-1 text-[10px] font-black text-text-secondary bg-surface-alt border border-border/50 rounded-full uppercase tracking-widest">
                            Question
                          </span>
                          <p className="text-2xl font-bold text-text-primary max-w-xs leading-relaxed px-2 my-auto">
                            {activeTopic.flashcards[currentFlashcardIndex]?.front}
                          </p>
                          <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Tap to flip</span>
                        </div>

                        {/* Back Side */}
                        <div
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          className="absolute inset-0 bg-surface border border-border rounded-[28px] p-8 flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden transition-colors"
                        >
                          <span className="px-3.5 py-1 text-[10px] font-black text-text-secondary bg-surface-alt border border-border/50 rounded-full uppercase tracking-widest">
                            Answer
                          </span>
                          <p className="text-lg font-semibold text-text-primary max-w-xs leading-relaxed px-2 overflow-y-auto max-h-[280px] my-auto scrollbar-thin">
                            {activeTopic.flashcards[currentFlashcardIndex]?.back}
                          </p>
                          <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Tap to flip back</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-6 w-full justify-center mt-2">
                      <button
                        onClick={() => { setFlashcardFlipped(false); setCurrentFlashcardIndex(prev => Math.max(prev - 1, 0)); }}
                        disabled={currentFlashcardIndex === 0}
                        className="w-10 h-10 rounded-full border border-border hover:bg-surface-hover flex items-center justify-center text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <IconChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Dot Page Pills */}
                      <div className="flex gap-1.5 items-center flex-wrap justify-center max-w-[150px]">
                        {activeTopic.flashcards.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setFlashcardFlipped(false);
                              setCurrentFlashcardIndex(idx);
                            }}
                            className={`transition-all rounded-full h-1.5 ${
                              idx === currentFlashcardIndex ? 'w-4 bg-primary' : 'w-1.5 bg-border-alt hover:bg-text-secondary'
                            }`}
                            aria-label={`Go to flashcard ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => { setFlashcardFlipped(false); setCurrentFlashcardIndex(prev => Math.min(prev + 1, activeTopic.flashcards!.length - 1)); }}
                        disabled={currentFlashcardIndex === activeTopic.flashcards.length - 1}
                        className="w-10 h-10 rounded-full border border-border hover:bg-surface-hover flex items-center justify-center text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <IconChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Rating Actions */}
                    {flashcardFlipped && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-3.5 mt-2 w-full max-w-sm"
                      >
                        <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted">How well did you recall?</p>
                        <div className="flex justify-center gap-3 w-full">
                          <button
                            onClick={() => handleRateFlashcard('easy')}
                            className="flex-1 py-3 bg-surface border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10 font-semibold text-xs rounded-xl transition-colors shadow-sm"
                          >
                            Easy (4D)
                          </button>
                          <button
                            onClick={() => handleRateFlashcard('medium')}
                            className="flex-1 py-3 bg-surface border border-amber-500/30 hover:border-amber-500 hover:bg-amber-50 text-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/10 font-semibold text-xs rounded-xl transition-colors shadow-sm"
                          >
                            Medium (2D)
                          </button>
                          <button
                            onClick={() => handleRateFlashcard('hard')}
                            className="flex-1 py-3 bg-surface border border-rose-500/30 hover:border-rose-500 hover:bg-rose-50 text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 font-semibold text-xs rounded-xl transition-colors shadow-sm"
                          >
                            Hard (1D)
                          </button>
                        </div>
                      </motion.div>
                    )}
                    {/* Keyboard Shortcuts Hint */}
                    <div className="hidden sm:block text-[10px] text-text-muted font-black tracking-widest uppercase mt-4 text-center select-none bg-surface-alt/40 border border-border/40 px-4 py-2 rounded-full">
                      Keyboard shortcuts: [Space] Flip • [← / →] Prev/Next • [1 / 2 / 3] Easy/Med/Hard
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {topicTab === 'revision' && (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-text-primary mb-2 leading-tight">Memory & Revision<br/>Spacing</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Smart repetition to help you remember better.
                  </p>
                </div>
                
                <div className="bg-surface rounded-3xl p-8 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex flex-col items-center justify-center min-h-[220px]">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border dark:text-gray-800" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset="42" strokeLinecap="round" className="text-primary" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-text-primary">85<span className="text-lg">%</span></span>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted mt-6">Retention Rate</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="bg-surface rounded-3xl p-6 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5 flex flex-col">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">Spacing Schedule Intervals</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Session 1', subtitle: 'Same day', status: 'Completed', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
                    { label: 'Session 2', subtitle: '1 Day', status: 'Tomorrow', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                    { label: 'Session 3', subtitle: '3 Days', status: 'Upcoming', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
                    { label: 'Session 4', subtitle: '7 Days', status: 'Upcoming', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
                    { label: 'Session 5', subtitle: '30 Days', status: 'Upcoming', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
                  ].map((lvl, idx) => (
                    <div key={lvl.label} className="bg-surface hover:bg-surface-alt transition-colors rounded-2xl p-4 flex justify-between items-center cursor-pointer group">
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
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${lvl.color}`}>
                          {lvl.status}
                        </span>
                        <IconChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals within Topic Workspace */}
        <Modal
          isOpen={noteModal.open}
          onClose={() => setNoteModal(prev => ({ ...prev, open: false }))}
          title={noteModal.isReadOnly ? "View Note" : noteModal.noteId ? "Edit Note" : "Create Note"}
          maxWidthClassName="max-w-4xl"
        >
          <div className="flex flex-col gap-4 text-left">
            {noteModal.isReadOnly ? (
              <>
                <h3 className="text-lg font-bold text-text-primary select-text">{noteModal.title || 'Untitled Note'}</h3>
                <div 
                  className="prose dark:prose-invert max-h-96 overflow-y-auto p-4 bg-surface-alt border border-border-alt rounded-2xl text-xs font-semibold leading-relaxed text-text-secondary select-text"
                  dangerouslySetInnerHTML={{ __html: noteModal.content || '<p class="italic text-text-muted">No content</p>' }}
                />
                <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
                  <button
                    onClick={() => setNoteModal(prev => ({ ...prev, open: false }))}
                    className="btn btn-secondary btn-md"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setNoteModal(prev => ({ ...prev, isReadOnly: false }))}
                    className="btn btn-primary btn-md"
                  >
                    Edit Note
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Title"
                  value={noteModal.title}
                  onChange={e => setNoteModal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-transparent border-none text-lg font-bold focus:outline-none placeholder:text-text-muted text-text-primary"
                />
                <RichTextEditor
                  key={noteModal.noteId || 'new'}
                  value={noteModal.content}
                  onChange={val => setNoteModal(prev => ({ ...prev, content: val }))}
                />
                <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
                  <button
                    onClick={() => setNoteModal(prev => ({ ...prev, open: false }))}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTopicNote}
                    className="btn btn-primary btn-md"
                  >
                    Save Note
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={snippetModal.open}
          onClose={() => setSnippetModal(prev => ({ ...prev, open: false }))}
          title={snippetModal.snippetId ? "Edit Snippet" : "Add Snippet"}
          maxWidthClassName="max-w-3xl"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Title</label>
              <input
                type="text"
                placeholder="e.g. DFS Algorithm"
                value={snippetModal.title}
                onChange={e => setSnippetModal(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Language</label>
              <CustomSelect
                value={snippetModal.lang}
                onChange={val => setSnippetModal(prev => ({ ...prev, lang: val }))}
                options={[
                  { value: 'javascript', label: 'JavaScript' },
                  { value: 'typescript', label: 'TypeScript' },
                  { value: 'python', label: 'Python' },
                  { value: 'cpp', label: 'C++' },
                  { value: 'java', label: 'Java' },
                  { value: 'html', label: 'HTML' },
                  { value: 'css', label: 'CSS' }
                ]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Code</label>
              <textarea
                placeholder="// Code snippet..."
                value={snippetModal.code}
                onChange={e => setSnippetModal(prev => ({ ...prev, code: e.target.value }))}
                className="w-full bg-[#1e1e1e] text-[#d4d4d4] border border-border-alt rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-mono text-xs min-h-[160px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</label>
              <input
                type="text"
                placeholder="Short description..."
                value={snippetModal.desc}
                onChange={e => setSnippetModal(prev => ({ ...prev, desc: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="dfs, algorithm"
                value={snippetModal.tags}
                onChange={e => setSnippetModal(prev => ({ ...prev, tags: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
              <button
                onClick={() => setSnippetModal(prev => ({ ...prev, open: false }))}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTopicSnippet}
                className="btn btn-primary btn-md"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={resourceModal.open}
          onClose={() => setResourceModal(prev => ({ ...prev, open: false }))}
          title="Add Study Material Link"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Title</label>
              <input
                type="text"
                placeholder="e.g. CPU Scheduling Tutorial"
                value={resourceModal.title}
                onChange={e => setResourceModal(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={resourceModal.url}
                onChange={e => setResourceModal(prev => ({ ...prev, url: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Type</label>
              <CustomSelect
                value={resourceModal.type}
                onChange={val => setResourceModal(prev => ({ ...prev, type: val as any }))}
                options={[
                  { value: 'link', label: '🔗 Website' },
                  { value: 'pdf', label: '📄 PDF' },
                  { value: 'youtube', label: '📺 YouTube Link' },
                  { value: 'doc', label: '📝 Doc Document' }
                ]}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
              <button
                onClick={() => setResourceModal(prev => ({ ...prev, open: false }))}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTopicResource}
                className="btn btn-primary btn-md"
              >
                Add Link
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={questionModal.open}
          onClose={() => setQuestionModal(prev => ({ ...prev, open: false }))}
          title="Add Question Node"
          maxWidthClassName="max-w-3xl"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Question</label>
              <input
                type="text"
                placeholder="What is SJF scheduling?"
                value={questionModal.question}
                onChange={e => setQuestionModal(prev => ({ ...prev, question: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Reference Answer</label>
              <textarea
                placeholder="Short outline..."
                value={questionModal.answer}
                onChange={e => setQuestionModal(prev => ({ ...prev, answer: e.target.value }))}
                className="w-full bg-surface-alt border border-border-alt rounded-xl p-3 text-sm focus:outline-none focus:border-primary min-h-[100px] resize-vertical"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Difficulty</label>
              <CustomSelect
                value={questionModal.difficulty}
                onChange={val => setQuestionModal(prev => ({ ...prev, difficulty: val as any }))}
                options={[
                  { value: 'easy', label: '🟢 Easy' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'hard', label: '🔴 Hard' }
                ]}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
              <button
                onClick={() => setQuestionModal(prev => ({ ...prev, open: false }))}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTopicQuestion}
                className="btn btn-primary btn-md"
              >
                Save Question
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={flashcardModal.open}
          onClose={() => setFlashcardModal(prev => ({ ...prev, open: false }))}
          title="Create Flashcard"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Front (Question)</label>
              <input
                type="text"
                placeholder="e.g. What is Mutex?"
                value={flashcardModal.front}
                onChange={e => setFlashcardModal(prev => ({ ...prev, front: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Back (Answer)</label>
              <input
                type="text"
                placeholder="e.g. Mutual Exclusion Object..."
                value={flashcardModal.back}
                onChange={e => setFlashcardModal(prev => ({ ...prev, back: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
              <button
                onClick={() => setFlashcardModal(prev => ({ ...prev, open: false }))}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTopicFlashcard}
                className="btn btn-primary btn-md"
              >
                Create Card
              </button>
            </div>
          </div>
        </Modal>
      </motion.div>
    );
  }

  // 2. SUBJECT DETAILS DASHBOARD VIEW
  if (activeSubject) {
    const total = activeSubject.topics.length;
    const completed = activeSubject.topics.filter((t) => t.done).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Collect totals from topics
    let totalNotes = 0;
    let totalSnippets = 0;
    let totalResources = 0;
    let totalFlashcards = 0;
    let totalQuestions = 0;
    let totalTasks = 0;
    let studyTime = 0;

    activeSubject.topics.forEach(t => {
      totalNotes += t.notes?.length || 0;
      totalSnippets += t.snippets?.length || 0;
      totalResources += t.resources?.length || 0;
      totalFlashcards += t.flashcards?.length || 0;
      totalQuestions += t.questions?.length || 0;
      totalTasks += t.tasks?.length || 0;
      studyTime += t.timeSpent || 0;
    });

    const nextUnfinishedTopic = activeSubject.topics.find(t => !t.done);

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="flex flex-col gap-6"
      >
        {/* Subject Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <button onClick={() => setSelectedSubjectId(null)} className="hover:text-primary transition-colors">Study Tracker</button>
              <span>/</span>
              <span className="text-text-primary font-medium">{activeSubject.name}</span>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {activeSubject.name}
              {activeSubject.semester && <span className="text-xs font-semibold text-text-muted bg-surface-alt px-2.5 py-1 rounded-full border border-border-alt">{activeSubject.semester}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className="btn btn-secondary btn-md"
            >
              <IconArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setIsTopicModalOpen(true)}
              className="btn btn-primary btn-md"
            >
              <IconPlus className="w-4 h-4" /> Add Topic
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border overflow-x-auto gap-1">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'topics', label: `Topics (${total})` },
            { id: 'notes', label: `Notes (${totalNotes})` },
            { id: 'snippets', label: `Snippets (${totalSnippets})` },
            { id: 'resources', label: `Resources (${totalResources})` },
            { id: 'tasks', label: `Tasks (${totalTasks})` }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubjectTab(tab.id)}
              className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                subjectTab === tab.id
                  ? 'border-primary text-primary'
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
              {/* Dashboard stats panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="var(--border-border-alt)" strokeWidth="4" fill="transparent" />
                        <circle cx="28" cy="28" r="24" stroke="#f43f5e" strokeWidth="4" fill="transparent" strokeDasharray={151} strokeDashoffset={151 - (151 * progress) / 100} />
                      </svg>
                      <span className="absolute text-xs font-bold">{progress}%</span>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Progress</p>
                      <p className="text-sm font-semibold text-text-primary mt-0.5">{completed} of {total} completed</p>
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
                      <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Continue learning</span>
                      <h3 className="font-bold text-base text-text-primary mt-1.5">{nextUnfinishedTopic.name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Resume from where you last left off</p>
                    </div>
                    <button
                      onClick={() => handleContinueLearning(activeSubject)}
                      className="btn btn-primary btn-md"
                    >
                      Resume Learning
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface border border-border rounded-2xl p-5 text-sm text-text-secondary">
                    🎉 Excellent! All topics inside this subject have been successfully completed!
                  </div>
                )}

                {/* List of topics preview */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Topics Outline</p>
                  <div className="flex flex-col gap-2">
                    {activeSubject.topics.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTopicId(t.id)}
                        className="bg-surface border border-border hover:border-primary/20 rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all hover:translate-x-0.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${t.done ? 'bg-green-500' : 'bg-primary'}`} />
                          <span className="font-semibold text-sm text-text-primary">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
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
                  action={<button onClick={() => setIsTopicModalOpen(true)} className="btn btn-primary btn-md">Add First Topic</button>}
                />
              ) : (
                <div className="flex flex-col gap-5 relative z-10">
                  {activeSubject.topics.map((t) => {
                    const totalTasks = t.tasks?.length || 0;
                    const doneTasks = t.tasks?.filter(tk => tk.done).length || 0;
                    const progressPct = t.done ? 100 : (totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0);
                    
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTopicId(t.id)}
                        className={`group bg-surface border rounded-[24px] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative ${
                          t.done 
                            ? 'border-green-500/20 bg-green-500/[0.01] hover:border-green-500/40' 
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        {/* Timeline Node Ring */}
                        <div className={`absolute -left-[23px] md:-left-[39px] w-4 h-4 rounded-full border-4 bg-background z-20 transition-all ${
                          t.done ? 'border-green-500' : 'border-border group-hover:border-primary'
                        }`} />

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
                            <span className="absolute text-[10px] font-black text-text-primary">
                              {t.done ? '✓' : `${progressPct}%`}
                            </span>
                          </div>

                          <div className="min-w-0 space-y-1">
                            <h4 className={`font-bold text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1 ${
                              t.done ? 'line-through text-text-muted decoration-green-500/30' : ''
                            }`}>
                              {t.name}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black ${
                                t.difficulty === 'hard' 
                                  ? 'bg-rose-500/10 text-rose-500' 
                                  : t.difficulty === 'easy' 
                                  ? 'bg-green-500/10 text-green-500' 
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}>
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
                          {/* Syllabus Stats */}
                          <div className="text-xs text-text-muted space-x-2">
                            <span>📝 {t.notes?.length || 0}</span>
                            <span>•</span>
                            <span>💻 {t.snippets?.length || 0}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {/* Toggle Done Action */}
                            <button
                              onClick={e => {
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
                            
                            {/* Delete Action */}
                            <button
                              onClick={e => {
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
                {activeSubject.topics.flatMap(t => (t.notes || []).map(note => ({ ...note, topicName: t.name, topicId: t.id }))).map(note => (
                  <div
                    key={note.id}
                    onClick={() => { setSelectedTopicId(note.topicId); setTopicTab('notes'); }}
                    className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:border-primary/20 transition-all"
                  >
                    <span className="text-[10px] uppercase font-bold text-text-muted">{note.topicName}</span>
                    <h4 className="font-bold text-sm text-text-primary mt-1 line-clamp-1">{note.title}</h4>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{cleanHtmlText(note.content)}</p>
                  </div>
                ))}
                {totalNotes === 0 && (
                  <div className="col-span-2 text-center text-text-muted p-10">No notes written inside this subject yet.</div>
                )}
              </div>
            </div>
          )}

          {subjectTab === 'snippets' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base">Saved Code Snippets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSubject.topics.flatMap(t => (t.snippets || []).map(snip => ({ ...snip, topicName: t.name, topicId: t.id }))).map(snip => (
                  <div key={snip.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted">{snip.topicName}</span>
                      <h4 className="font-bold text-sm text-text-primary mt-1 line-clamp-1">{snip.title}</h4>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-border w-full">
                      <ShikiHighlighter
                        code={snip.code}
                        lang={snip.language}
                        theme={isDark ? 'one-dark-pro' : 'snazzy-light'}
                      />
                    </div>
                  </div>
                ))}
                {totalSnippets === 0 && (
                  <div className="col-span-2 text-center text-text-muted p-10">No snippets saved inside this subject yet.</div>
                )}
              </div>
            </div>
          )}

          {subjectTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base">Resource Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeSubject.topics.flatMap(t => (t.resources || []).map(res => ({ ...res, topicName: t.name, topicId: t.id }))).map(res => (
                  <div key={res.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text-primary truncate">{res.title}</p>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{res.topicName} • {res.url}</p>
                    </div>
                    <a href={res.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-surface-alt border hover:bg-surface-hover rounded-lg text-xs font-semibold text-text-primary shrink-0 transition-colors">
                      Open
                    </a>
                  </div>
                ))}
                {totalResources === 0 && (
                  <div className="col-span-2 text-center text-text-muted p-10">No study links logged inside this subject yet.</div>
                )}
              </div>
            </div>
          )}

          {subjectTab === 'tasks' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-bold text-base">Checklist</h3>
              <div className="border border-border rounded-2xl overflow-hidden bg-surface divide-y divide-border">
                {activeSubject.topics.flatMap(t => (t.tasks || []).map(task => ({ ...task, topicName: t.name, topicId: t.id }))).map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTopicTask(task.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-hover/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.done ? 'bg-primary border-primary' : 'border-text-muted'}`}>
                        {task.done && <IconCheck className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm ${task.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                        {task.title} <span className="text-[10px] text-text-muted font-normal ml-2">({task.topicName})</span>
                      </span>
                    </div>
                  </div>
                ))}
                {totalTasks === 0 && (
                  <div className="text-center text-text-muted p-10">No tasks created inside this subject yet.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal additions */}
        <Modal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} title="Add Topic" maxWidthClassName="max-w-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-secondary">Topic Name</label>
              <input type="text" placeholder="e.g. Memory Management" value={topicName} onChange={(e) => setTopicName(e.target.value)} className="input-field" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsTopicModalOpen(false)} className="btn btn-secondary btn-md">Cancel</button>
              <button onClick={handleSaveTopic} className="btn btn-primary btn-md">Add Topic</button>
            </div>
          </div>
        </Modal>
      </motion.div>
    );
  }

  // 3. SUBJECT LISTING (ROOT VIEW)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col h-full gap-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Study Tracker <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          </h2>
          <p className="text-text-secondary text-sm">Organize subjects, topics, flashcards, and timers into unified study workspaces.</p>
        </div>
        <button
          onClick={() => setIsSubjectModalOpen(true)}
          className="btn btn-primary btn-md"
        >
          <IconPlus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Focus momentum card */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-2 bg-surface border border-border rounded-[22px] p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Focus board</p>
              <h3 className="text-lg font-bold mt-1">Overall study momentum</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <IconTargetArrow className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProgressBar progress={stats.percentage} className="flex-1" />
            <span className="font-bold text-lg shrink-0">{stats.percentage}%</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Subjects</p>
              <p className="text-xl font-bold mt-2">{subjects.length}</p>
            </div>
            <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Done</p>
              <p className="text-xl font-bold mt-2 text-green-500">{stats.completedTopics}</p>
            </div>
            <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Pending</p>
              <p className="text-xl font-bold mt-2 text-amber-500">{stats.pendingTopics}</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-surface border border-border rounded-[22px] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Quick stats</p>
              <h3 className="text-lg font-bold mt-1">Study Material Metrics</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <IconChecklist className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-alt border border-border-alt rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary font-semibold">Total Notes</p>
                <p className="text-lg font-bold mt-0.5">{stats.totalNotes}</p>
              </div>
              <span>📝</span>
            </div>
            <div className="bg-surface-alt border border-border-alt rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary font-semibold">Study Time</p>
                <p className="text-lg font-bold mt-0.5">{formatMinutes(stats.totalStudyTime)}</p>
              </div>
              <span>⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-surface border border-border rounded-[22px] p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects or topics"
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`btn btn-sm ${filter === item ? 'btn-primary' : 'btn-secondary'}`}
            >
              {item === 'all' ? 'All' : item === 'active' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Subject List Grid */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={<IconBook className="w-9 h-9 text-text-muted" />}
          title="No subjects added yet"
          description="Create your first subject and break it into small topics to track progress clearly."
          action={<button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary btn-md"><IconPlus className="w-4 h-4" /> Add First Subject</button>}
        />
      ) : subjectCards.length === 0 ? (
        <div className="bg-surface border border-border rounded-[22px] p-10 text-center text-text-muted">
          No study items match your current search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
          <AnimatePresence>
            {subjectCards.map((subject) => (
              <motion.div
                layout
                key={subject.id}
                onClick={() => { setSelectedSubjectId(subject.id); setSubjectTab('overview'); }}
                className="bg-surface border border-border rounded-[22px] overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <IconLayoutGrid className="w-4 h-4" />
                        </span>
                        {subject.semester && (
                          <span className="text-[11px] text-text-muted bg-surface-alt px-2.5 py-1 rounded-full border border-border-alt">
                            {subject.semester}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg line-clamp-1 text-text-primary">{subject.name}</h3>
                      <p className="text-sm text-text-secondary">{subject.completed}/{subject.total} topics completed</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirm('Confirm Delete', 'Delete this subject and all its topics?', () => {
                          deleteSubject(subject.id);
                        });
                      }}
                      className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl bg-surface-alt border border-border-alt p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-text-muted">Progress</span>
                      <span className="font-semibold text-primary">{subject.progress}%</span>
                    </div>
                    <ProgressBar progress={subject.progress} />
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{subject.pending} pending</span>
                      <span>{subject.total} total</span>
                    </div>
                  </div>

                  {/* Actions inside Card */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleContinueLearning(subject); }}
                      disabled={subject.pending === 0}
                      className="btn btn-primary btn-sm flex-1 disabled:opacity-40"
                    >
                      Continue
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSubjectId(subject.id); setSubjectTab('topics'); }}
                      className="btn btn-secondary btn-sm"
                    >
                      View Outline
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add Subject" maxWidthClassName="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Subject Name</label>
            <input type="text" placeholder="e.g. Operating Systems" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="input-field" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Semester or Label</label>
            <input type="text" placeholder="e.g. Sem 4, Fall 2025" value={semester} onChange={(e) => setSemester(e.target.value)} className="input-field" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsSubjectModalOpen(false)} className="btn btn-secondary btn-md">Cancel</button>
            <button onClick={handleSaveSubject} className="btn btn-primary btn-md">Add Subject</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
