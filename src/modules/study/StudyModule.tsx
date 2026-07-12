import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlus,
  IconSearch,
  IconChecklist,
  IconBook,
  IconTargetArrow,
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';

import { FILTERS, type StudyFilter, formatMinutes } from './utils/studyUtils';
import { SubjectCard } from './components/SubjectCard';
import { SubjectDashboard } from './components/SubjectDashboard';
import { TopicWorkspace } from './components/TopicWorkspace';
import { StudyModals } from './components/StudyModals';

export default function StudyModule() {
  const {
    subjects,
    addSubject,
    addTopic,
    deleteSubject,
    deleteTopic,
    updateTopic,
    showConfirm,
    theme,
  } = useAppStore(
    useShallow((state) => ({
      subjects: state.subjects,
      addSubject: state.addSubject,
      addTopic: state.addTopic,
      deleteSubject: state.deleteSubject,
      deleteTopic: state.deleteTopic,
      updateTopic: state.updateTopic,
      showConfirm: state.showConfirm,
      theme: state.theme,
    })),
  );

  const addToast = useToastStore((s) => s.addToast);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Navigation states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Subject Dashboard tabs: 'overview', 'topics', 'notes', 'snippets', 'resources', 'tasks'
  const [subjectTab, setSubjectTab] = useState<'overview' | 'topics' | 'notes' | 'snippets' | 'resources' | 'tasks'>('overview');
  // Topic Workspace tabs: 'overview', 'notes', 'code', 'resources', 'tasks', 'questions', 'flashcards', 'revision'
  const [topicTab, setTopicTab] = useState<
    'overview' | 'notes' | 'code' | 'resources' | 'tasks' | 'questions' | 'flashcards' | 'revision'
  >('overview');

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
  const [noteModal, setNoteModal] = useState<{
    open: boolean;
    noteId: string | null;
    title: string;
    content: string;
    isReadOnly: boolean;
  }>({ open: false, noteId: null, title: '', content: '', isReadOnly: false });

  const [snippetModal, setSnippetModal] = useState<{
    open: boolean;
    snippetId: string | null;
    title: string;
    lang: string;
    code: string;
    desc: string;
    tags: string;
  }>({ open: false, snippetId: null, title: '', lang: 'javascript', code: '', desc: '', tags: '' });

  const [resourceModal, setResourceModal] = useState<{
    open: boolean;
    title: string;
    url: string;
    type: 'link' | 'pdf' | 'doc' | 'image' | 'video' | 'youtube';
  }>({ open: false, title: '', url: '', type: 'link' });

  const [questionModal, setQuestionModal] = useState<{
    open: boolean;
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>({ open: false, question: '', answer: '', difficulty: 'medium' });

  const [flashcardModal, setFlashcardModal] = useState<{ open: boolean; front: string; back: string }>({
    open: false,
    front: '',
    back: '',
  });

  const [taskInput, setTaskInput] = useState('');

  // Spaced repetition flashcard active state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Local focus timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(1500); // 25 mins by default
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(1500);
  const [timerPreset, setTimerPreset] = useState<number>(25); // mins

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      const elapsedMins = Math.round(timerDuration / 60);
      if (selectedSubjectId && selectedTopicId && elapsedMins > 0) {
        const subject = subjects.find((s) => s.id === selectedSubjectId);
        const topic = subject?.topics.find((t) => t.id === selectedTopicId);
        if (topic) {
          const totalSpent = (topic.timeSpent || 0) + elapsedMins;
          const studySessions = (topic.analytics?.studySessions || 0) + 1;
          updateTopic(selectedSubjectId, selectedTopicId, {
            timeSpent: totalSpent,
            analytics: {
              ...topic.analytics,
              timeSpent: totalSpent,
              studySessions,
            },
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
  const activeSubject = useMemo(() => subjects.find((s) => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  const activeTopic = useMemo(
    () => activeSubject?.topics.find((t) => t.id === selectedTopicId),
    [activeSubject, selectedTopicId],
  );

  // Main screen calculation
  const subjectCards = useMemo(() => {
    return subjects
      .map((subject) => {
        const total = subject.topics.length;
        const completed = subject.topics.filter((t) => t.done).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        let notesCount = 0;
        let snippetCount = 0;
        let resourcesCount = 0;
        let questionsCount = 0;
        let flashcardsCount = 0;
        let tasksCount = 0;
        let studyTime = 0;

        subject.topics.forEach((t) => {
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
          ...subject,
          total,
          completed,
          pending,
          progress,
          nextTopicName: nextTopic?.name ?? 'All completed',
          nextTopicId: nextTopic?.id ?? null,
          notesCount,
          snippetCount,
          resourcesCount,
          questionsCount,
          flashcardsCount,
          tasksCount,
          studyTime,
        };
      })
      .filter((subject) => {
        const query = search.toLowerCase();
        const matchesSearch =
          subject.name.toLowerCase().includes(query) || subject.topics.some((t) => t.name.toLowerCase().includes(query));
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
      totalTopics,
      completedTopics,
      pendingTopics: totalTopics - completedTopics,
      percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      totalNotes,
      totalSnippets,
      totalResources,
      totalFlashcards,
      totalQuestions,
      totalStudyTime,
    };
  }, [subjects]);

  const handleSaveSubject = () => {
    if (!subjectName.trim()) return;
    addSubject({ id: crypto.randomUUID(), name: subjectName, semester, topics: [] });
    setSubjectName('');
    setSemester('');
    setIsSubjectModalOpen(false);
    addToast('Subject Created', 'New study subject folder created.', 'success');
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
    addToast('Topic Added', 'New topic node added to this subject outline.', 'success');
  };

  const handleContinueLearning = (subject: any) => {
    if (subject.nextTopicId) {
      setSelectedSubjectId(subject.id);
      setSelectedTopicId(subject.nextTopicId);
      setTopicTab('overview');
    }
  };

  const handleUpdateTopicField = (fieldData: Partial<any>) => {
    if (selectedSubjectId && selectedTopicId) {
      updateTopic(selectedSubjectId, selectedTopicId, fieldData);
    }
  };

  const handleSaveTopicNote = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const notesList = activeTopic.notes ? [...activeTopic.notes] : [];
    if (noteModal.noteId) {
      const idx = notesList.findIndex((n) => n.id === noteModal.noteId);
      if (idx !== -1) {
        notesList[idx] = {
          ...notesList[idx],
          title: noteModal.title,
          content: noteModal.content,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      notesList.push({
        id: crypto.randomUUID(),
        title: noteModal.title || 'Untitled Note',
        content: noteModal.content,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    updateTopic(selectedSubjectId, selectedTopicId, { notes: notesList });
    setNoteModal({ open: false, noteId: null, title: '', content: '', isReadOnly: false });
    addToast('Note Saved', 'Topic summary note saved.', 'success');
  };

  const handleSaveTopicSnippet = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const snippetsList = activeTopic.snippets ? [...activeTopic.snippets] : [];
    const tagsArr = snippetModal.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (snippetModal.snippetId) {
      const idx = snippetsList.findIndex((s) => s.id === snippetModal.snippetId);
      if (idx !== -1) {
        snippetsList[idx] = {
          ...snippetsList[idx],
          title: snippetModal.title,
          language: snippetModal.lang,
          code: snippetModal.code,
          description: snippetModal.desc,
          tags: tagsArr,
        };
      }
    } else {
      snippetsList.push({
        id: crypto.randomUUID(),
        title: snippetModal.title || 'Code Example',
        language: snippetModal.lang,
        code: snippetModal.code,
        description: snippetModal.desc,
        tags: tagsArr,
      });
    }
    updateTopic(selectedSubjectId, selectedTopicId, { snippets: snippetsList });
    setSnippetModal({ open: false, snippetId: null, title: '', lang: 'javascript', code: '', desc: '', tags: '' });
    addToast('Snippet Saved', 'Code snippet saved to library.', 'success');
  };

  const handleSaveTopicResource = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const resourcesList = activeTopic.resources ? [...activeTopic.resources] : [];
    resourcesList.push({
      id: crypto.randomUUID(),
      title: resourceModal.title || 'Resource Link',
      url: resourceModal.url,
      type: resourceModal.type,
      uploadDate: new Date().toLocaleDateString('en-GB'),
    });
    updateTopic(selectedSubjectId, selectedTopicId, { resources: resourcesList });
    setResourceModal({ open: false, title: '', url: '', type: 'link' });
    addToast('Resource Linked', 'Study link saved for review.', 'success');
  };

  const handleAddTopicTask = () => {
    if (!taskInput.trim() || !activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const tasksList = activeTopic.tasks ? [...activeTopic.tasks] : [];
    tasksList.push({
      id: crypto.randomUUID(),
      title: taskInput.trim(),
      done: false,
    });
    updateTopic(selectedSubjectId, selectedTopicId, { tasks: tasksList });
    setTaskInput('');
    addToast('Task Checklist Item Added', 'Action item saved to checklist.', 'success');
  };

  const handleToggleTopicTask = (taskId: string) => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const tasksList = activeTopic.tasks?.map((t: any) => (t.id === taskId ? { ...t, done: !t.done } : t)) || [];
    updateTopic(selectedSubjectId, selectedTopicId, { tasks: tasksList });
  };

  const handleDeleteTopicTask = (taskId: string) => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const tasksList = activeTopic.tasks?.filter((t: any) => t.id !== taskId) || [];
    updateTopic(selectedSubjectId, selectedTopicId, { tasks: tasksList });
  };

  const handleSaveTopicQuestion = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const questionsList = activeTopic.questions ? [...activeTopic.questions] : [];
    questionsList.push({
      id: crypto.randomUUID(),
      question: questionModal.question,
      answer: questionModal.answer,
      difficulty: questionModal.difficulty as 'easy' | 'medium' | 'hard',
      status: 'unsolved' as 'solved' | 'unsolved',
    });
    updateTopic(selectedSubjectId, selectedTopicId, { questions: questionsList });
    setQuestionModal({ open: false, question: '', answer: '', difficulty: 'medium' });
    addToast('Question Logged', 'Question logged for review.', 'success');
  };

  const handleToggleQuestionSolved = (qId: string) => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const questionsList =
      activeTopic.questions?.map((q: any) =>
        q.id === qId ? { ...q, status: (q.status === 'solved' ? 'unsolved' : 'solved') as 'solved' | 'unsolved' } : q,
      ) || [];
    updateTopic(selectedSubjectId, selectedTopicId, { questions: questionsList });
  };

  const handleSaveTopicFlashcard = () => {
    if (!activeTopic || !selectedSubjectId || !selectedTopicId) return;
    const flashcardsList = activeTopic.flashcards ? [...activeTopic.flashcards] : [];
    flashcardsList.push({
      id: crypto.randomUUID(),
      front: flashcardModal.front,
      back: flashcardModal.back,
      difficulty: 'medium',
      revisionCount: 0,
    });
    updateTopic(selectedSubjectId, selectedTopicId, { flashcards: flashcardsList });
    setFlashcardModal({ open: false, front: '', back: '' });
    addToast('Flashcard Created', 'Flashcard added to topic deck.', 'success');
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
        nextReview: new Date(
          Date.now() + (rating === 'easy' ? 4 : rating === 'medium' ? 2 : 1) * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };
      updateTopic(selectedSubjectId, selectedTopicId, { flashcards: cards });
    }
    setFlashcardFlipped(false);
    if (currentFlashcardIndex < cards.length - 1) {
      setCurrentFlashcardIndex((prev) => prev + 1);
    } else {
      setCurrentFlashcardIndex(0);
      alert('You have completed reviewing all flashcards for this round!');
    }
  };

  if (activeSubject && activeTopic) {
    return (
      <>
        <TopicWorkspace
          activeSubject={activeSubject}
          activeTopic={activeTopic}
          setSelectedTopicId={setSelectedTopicId}
          topicTab={topicTab}
          setTopicTab={setTopicTab}
          timerRunning={timerRunning}
          setTimerRunning={setTimerRunning}
          timerDuration={timerDuration}
          timerSecondsLeft={timerSecondsLeft}
          setTimerSecondsLeft={setTimerSecondsLeft}
          timerPreset={timerPreset}
          startTimer={startTimer}
          handleUpdateTopicField={handleUpdateTopicField}
          setNoteModal={setNoteModal}
          setSnippetModal={setSnippetModal}
          setResourceModal={setResourceModal}
          setQuestionModal={setQuestionModal}
          setFlashcardModal={setFlashcardModal}
          taskInput={taskInput}
          setTaskInput={setTaskInput}
          handleAddTopicTask={handleAddTopicTask}
          handleToggleTopicTask={handleToggleTopicTask}
          handleDeleteTopicTask={handleDeleteTopicTask}
          handleToggleQuestionSolved={handleToggleQuestionSolved}
          currentFlashcardIndex={currentFlashcardIndex}
          setCurrentFlashcardIndex={setCurrentFlashcardIndex}
          flashcardFlipped={flashcardFlipped}
          setFlashcardFlipped={setFlashcardFlipped}
          handleRateFlashcard={handleRateFlashcard}
          updateTopic={updateTopic}
          showConfirm={showConfirm}
          isDark={isDark}
        />

        <StudyModals
          noteModal={noteModal}
          setNoteModal={setNoteModal}
          handleSaveTopicNote={handleSaveTopicNote}
          snippetModal={snippetModal}
          setSnippetModal={setSnippetModal}
          handleSaveTopicSnippet={handleSaveTopicSnippet}
          resourceModal={resourceModal}
          setResourceModal={setResourceModal}
          handleSaveTopicResource={handleSaveTopicResource}
          questionModal={questionModal}
          setQuestionModal={setQuestionModal}
          handleSaveTopicQuestion={handleSaveTopicQuestion}
          flashcardModal={flashcardModal}
          setFlashcardModal={setFlashcardModal}
          handleSaveTopicFlashcard={handleSaveTopicFlashcard}
          isSubjectModalOpen={isSubjectModalOpen}
          setIsSubjectModalOpen={setIsSubjectModalOpen}
          subjectName={subjectName}
          setSubjectName={setSubjectName}
          semester={semester}
          setSemester={setSemester}
          handleSaveSubject={handleSaveSubject}
          isTopicModalOpen={isTopicModalOpen}
          setIsTopicModalOpen={setIsTopicModalOpen}
          topicName={topicName}
          setTopicName={setTopicName}
          handleSaveTopic={handleSaveTopic}
        />
      </>
    );
  }

  if (activeSubject) {
    return (
      <>
        <SubjectDashboard
          activeSubject={activeSubject}
          setSelectedSubjectId={setSelectedSubjectId}
          setSelectedTopicId={setSelectedTopicId}
          subjectTab={subjectTab}
          setSubjectTab={setSubjectTab}
          setTopicTab={setTopicTab}
          isTopicModalOpen={isTopicModalOpen}
          setIsTopicModalOpen={setIsTopicModalOpen}
          handleContinueLearning={handleContinueLearning}
          updateTopic={updateTopic}
          deleteTopic={deleteTopic}
          showConfirm={showConfirm}
          isDark={isDark}
          handleToggleTopicTask={handleToggleTopicTask}
        />

        <StudyModals
          noteModal={noteModal}
          setNoteModal={setNoteModal}
          handleSaveTopicNote={handleSaveTopicNote}
          snippetModal={snippetModal}
          setSnippetModal={setSnippetModal}
          handleSaveTopicSnippet={handleSaveTopicSnippet}
          resourceModal={resourceModal}
          setResourceModal={setResourceModal}
          handleSaveTopicResource={handleSaveTopicResource}
          questionModal={questionModal}
          setQuestionModal={setQuestionModal}
          handleSaveTopicQuestion={handleSaveTopicQuestion}
          flashcardModal={flashcardModal}
          setFlashcardModal={setFlashcardModal}
          handleSaveTopicFlashcard={handleSaveTopicFlashcard}
          isSubjectModalOpen={isSubjectModalOpen}
          setIsSubjectModalOpen={setIsSubjectModalOpen}
          subjectName={subjectName}
          setSubjectName={setSubjectName}
          semester={semester}
          setSemester={setSemester}
          handleSaveSubject={handleSaveSubject}
          isTopicModalOpen={isTopicModalOpen}
          setIsTopicModalOpen={setIsTopicModalOpen}
          topicName={topicName}
          setTopicName={setTopicName}
          handleSaveTopic={handleSaveTopic}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="flex flex-col h-full gap-6 font-sans"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Study Tracker <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            </h2>
            <p className="text-text-secondary text-sm">
              Organize subjects, topics, flashcards, and timers into unified study workspaces.
            </p>
          </div>
          <button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary btn-md rounded-full px-5">
            <IconPlus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        {/* Focus momentum card */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 text-left">
          <div className="xl:col-span-2 bg-surface border border-border rounded-[22px] p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted font-bold">Focus board</p>
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
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted font-bold">Subjects</p>
                <p className="text-xl font-bold mt-2">{subjects.length}</p>
              </div>
              <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted font-bold">Done</p>
                <p className="text-xl font-bold mt-2 text-green-500">{stats.completedTopics}</p>
              </div>
              <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted font-bold">Pending</p>
                <p className="text-xl font-bold mt-2 text-amber-500">{stats.pendingTopics}</p>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-surface border border-border rounded-[22px] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted font-bold">Quick stats</p>
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
                <span className="text-lg">📝</span>
              </div>
              <div className="bg-surface-alt border border-border-alt rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary font-semibold">Study Time</p>
                  <p className="text-lg font-bold mt-0.5">{formatMinutes(stats.totalStudyTime)}</p>
                </div>
                <span className="text-lg">⏱️</span>
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
                className={`btn btn-sm rounded-full px-4 ${filter === item ? 'btn-primary' : 'btn-secondary'}`}
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
            action={
              <button onClick={() => setIsSubjectModalOpen(true)} className="btn btn-primary btn-md rounded-full px-5">
                <IconPlus className="w-4 h-4" /> Add First Subject
              </button>
            }
          />
        ) : subjectCards.length === 0 ? (
          <div className="bg-surface border border-border rounded-[22px] p-10 text-center text-text-muted font-semibold">
            No study items match your current search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
            <AnimatePresence>
              {subjectCards.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  showConfirm={showConfirm}
                  deleteSubject={deleteSubject}
                  setSelectedSubjectId={setSelectedSubjectId}
                  setSubjectTab={setSubjectTab}
                  handleContinueLearning={handleContinueLearning}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <StudyModals
        noteModal={noteModal}
        setNoteModal={setNoteModal}
        handleSaveTopicNote={handleSaveTopicNote}
        snippetModal={snippetModal}
        setSnippetModal={setSnippetModal}
        handleSaveTopicSnippet={handleSaveTopicSnippet}
        resourceModal={resourceModal}
        setResourceModal={setResourceModal}
        handleSaveTopicResource={handleSaveTopicResource}
        questionModal={questionModal}
        setQuestionModal={setQuestionModal}
        handleSaveTopicQuestion={handleSaveTopicQuestion}
        flashcardModal={flashcardModal}
        setFlashcardModal={setFlashcardModal}
        handleSaveTopicFlashcard={handleSaveTopicFlashcard}
        isSubjectModalOpen={isSubjectModalOpen}
        setIsSubjectModalOpen={setIsSubjectModalOpen}
        subjectName={subjectName}
        setSubjectName={setSubjectName}
        semester={semester}
        setSemester={setSemester}
        handleSaveSubject={handleSaveSubject}
        isTopicModalOpen={isTopicModalOpen}
        setIsTopicModalOpen={setIsTopicModalOpen}
        topicName={topicName}
        setTopicName={setTopicName}
        handleSaveTopic={handleSaveTopic}
      />
    </>
  );
}
