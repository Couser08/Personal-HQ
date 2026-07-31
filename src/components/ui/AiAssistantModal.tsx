import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import {
  type Habit,
  type AiHistoryItem,
  type AiChatMessage,
  type AiSuggestion
} from '../../store/types';
import {
  IconSparkles, IconX, IconCheck, IconLoader2, IconPlus,
  IconListCheck, IconMessageDots, IconKey,
  IconArrowRight, IconHistory, IconSearch, IconFilter, IconStar,
  IconTarget, IconBulb,
  IconPlayerPlay, IconChevronRight, IconChecklist, IconThumbUp, IconThumbDown
} from '@tabler/icons-react';
import { createPortal } from 'react-dom';
import {
  generateAiTaskWithSubtasks,
  generateAiMarkdownDoc,
  generateAiGeneralResponse,
  generateAiClarificationQuestions,
  generateAiMultiStepPlan,
  type AiClarificationQuestion,
  type AiMultiStepPlanOutput
} from '../../lib/gemini';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: string;
}

type AiTab = 'chats' | 'multistep' | 'suggestions' | 'history' | 'settings';

export const AiAssistantModal = ({ isOpen, onClose, initialAction }: AiAssistantModalProps) => {
  const { settings, addTodoTask, addNote, addHabit, setActiveModule, todoTasks } = useAppStore(
    useShallow((state) => ({
      settings: state.settings,
      addTodoTask: state.addTodoTask,
      addNote: state.addNote,
      addHabit: state.addHabit,
      setActiveModule: state.setActiveModule,
      todoTasks: state.todoTasks,
    }))
  );

  const addToast = useToastStore((s) => s.addToast);
  const apiKey = settings.geminiApiKey || '';
  const model = settings.geminiModel || 'gemini-2.5-flash';

  const [activeTab, setActiveTab] = useState<AiTab>('chats');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<AiChatMessage[]>([]);

  // History State
  const [historyItems, setHistoryItems] = useState<AiHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem('phq_ai_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AiHistoryItem | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterStarred, setHistoryFilterStarred] = useState(false);

  // Multi-Step Pipeline State
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [pipelinePrompt, setPipelinePrompt] = useState('');
  const [clarificationQuestions, setClarificationQuestions] = useState<AiClarificationQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [generatedPlan, setGeneratedPlan] = useState<AiMultiStepPlanOutput | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionSteps, setExecutionSteps] = useState<{ id: string; title: string; status: 'pending' | 'in_progress' | 'completed' }[]>([
    { id: '1', title: 'Create Main Task', status: 'pending' },
    { id: '2', title: 'Create Subtasks Breakdown', status: 'pending' },
    { id: '3', title: 'Create .md Document Plan', status: 'pending' },
    { id: '4', title: 'Create Daily Study Habit', status: 'pending' },
  ]);

  // Handle Initial Quick Action from FAB
  useEffect(() => {
    if (initialAction === 'add_task') {
      setActiveTab('chats');
      setPrompt('Add a task: ');
    } else if (initialAction === 'breakdown') {
      setActiveTab('chats');
      setPrompt('Break down my task into smaller actionable subtasks');
    } else if (initialAction === 'goal') {
      setActiveTab('chats');
      setPrompt('Help me create a realistic 6-month goal plan');
    } else if (initialAction === 'suggest') {
      setActiveTab('suggestions');
    }
  }, [initialAction, isOpen]);

  // Persist History
  const saveHistoryItem = (item: AiHistoryItem) => {
    const next = [item, ...historyItems.filter(h => h.id !== item.id)];
    setHistoryItems(next);
    localStorage.setItem('phq_ai_history', JSON.stringify(next));
  };

  const toggleStarHistory = (id: string) => {
    const next = historyItems.map(h => h.id === id ? { ...h, isStarred: !h.isStarred } : h);
    setHistoryItems(next);
    localStorage.setItem('phq_ai_history', JSON.stringify(next));
  };

  // Time-aware Personalized Greeting Header
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌅' };
    return { text: 'Good night', emoji: '🌙' };
  }, []);

  // Personalized Suggestions
  const suggestionsList: AiSuggestion[] = useMemo(() => [
    {
      id: 'sug_1',
      title: `You have ${todoTasks.filter(t => !t.completed).length} pending tasks`,
      description: 'Your workload looks active today. Shall I prioritize high priority tasks for you?',
      contextTag: 'Current Tasks',
      reason: 'Based on uncompleted items in your To-Do list',
      actionLabel: 'Prioritize Tasks',
      actionType: 'prioritize',
    },
    {
      id: 'sug_2',
      title: 'Study & Work Goal Progress',
      description: 'You are on track with your study plan. Want to adjust tomorrow\'s focus targets?',
      contextTag: 'Goal Progress',
      reason: '38% progress recorded in study sprint',
      actionLabel: 'Adjust Plan',
      actionType: 'adjust_plan',
    },
    {
      id: 'sug_3',
      title: 'Peak Focus Time: 8:00 PM',
      description: 'Your productivity pattern shows highest completion around 8 PM. Block deep work?',
      contextTag: 'Your Pattern',
      reason: 'AI habit analysis detected focus peak',
      actionLabel: 'Schedule Session',
      actionType: 'schedule',
    },
  ], [todoTasks]);

  // Handle Conversational Submit in Chat
  const handleChatSubmit = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || prompt;
    if (!textToSubmit.trim()) return;

    if (!apiKey) {
      addToast('Key Required', 'Please set your Gemini API Key in Settings first.', 'warning');
      return;
    }

    const userMsg: AiChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setPrompt('');
    setIsGenerating(true);

    try {
      if (textToSubmit.toLowerCase().includes('break down') || textToSubmit.toLowerCase().includes('subtask')) {
        const res = await generateAiTaskWithSubtasks(apiKey, textToSubmit, model);
        const aiMsg: AiChatMessage = {
          id: `msg_${Date.now()}_a`,
          sender: 'ai',
          text: `Sure! I've broken down "${res.title}" into smaller actionable subtasks ⚡`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'todo', data: res },
        };
        setMessages(prev => [...prev, aiMsg]);
        saveHistoryItem({
          id: `hist_${Date.now()}`,
          title: `Break down: ${res.title}`,
          actionType: 'breakdown',
          summary: `${res.subtasks.length} subtasks created`,
          createdAt: new Date().toISOString(),
          messages: [userMsg, aiMsg],
          actionTaken: { label: `${res.subtasks.length} subtasks ready`, module: 'todo', count: res.subtasks.length },
        });
      } else if (textToSubmit.toLowerCase().includes('markdown') || textToSubmit.toLowerCase().includes('.md')) {
        const res = await generateAiMarkdownDoc(apiKey, textToSubmit, model);
        const aiMsg: AiChatMessage = {
          id: `msg_${Date.now()}_a`,
          sender: 'ai',
          text: `I've drafted your markdown document "${res.title}" 📝`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'markdown', data: res },
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const res = await generateAiGeneralResponse(apiKey, textToSubmit, model);
        const aiMsg: AiChatMessage = {
          id: `msg_${Date.now()}_a`,
          sender: 'ai',
          text: res,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err: any) {
      addToast('AI Error', err.message || 'Failed to generate response', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Multi-Step Pipeline Handlers
  const handleStartPipeline = async () => {
    if (!pipelinePrompt.trim()) return;
    if (!apiKey) {
      addToast('Key Required', 'Please set your Gemini API key in Settings.', 'warning');
      return;
    }

    setIsGenerating(true);
    setPipelineStep(1);

    try {
      // Step 1: Understand -> Step 2: Ask & Clarify
      const questions = await generateAiClarificationQuestions(apiKey, pipelinePrompt, model);
      setClarificationQuestions(questions);
      setPipelineStep(2);
    } catch (err: any) {
      addToast('Pipeline Error', err.message || 'Failed to initialize workflow', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAnswersAndPlan = async () => {
    if (!apiKey) return;
    setIsGenerating(true);
    const summary = Object.entries(selectedAnswers).map(([k, v]) => `${k}: ${v}`).join(', ');

    try {
      // Step 3: Plan
      const plan = await generateAiMultiStepPlan(apiKey, pipelinePrompt, summary, model);
      setGeneratedPlan(plan);
      setPipelineStep(3);
    } catch (err: any) {
      addToast('Plan Error', err.message || 'Failed to build plan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteAllSteps = async () => {
    if (!generatedPlan) return;
    setPipelineStep(4);
    setExecutionProgress(10);

    // Step 1: Create Main Task & Subtasks
    setExecutionSteps(prev => prev.map(s => s.id === '1' || s.id === '2' ? { ...s, status: 'in_progress' } : s));
    await new Promise(r => setTimeout(r, 600));

    const newTask = {
      id: `task_${Date.now()}`,
      projectId: null,
      title: generatedPlan.taskTitle,
      completed: false,
      priority: generatedPlan.priority,
      tags: generatedPlan.tags,
      dueDate: null,
      createdAt: new Date().toISOString(),
      subtasks: generatedPlan.subtasks.map((s, idx) => ({
        id: `sub_${Date.now()}_${idx}`,
        title: s.title,
        completed: false,
      })),
    };
    await addTodoTask(newTask);

    setExecutionSteps(prev => prev.map(s => s.id === '1' || s.id === '2' ? { ...s, status: 'completed' } : s));
    setExecutionProgress(50);

    // Step 2: Create .md File
    setExecutionSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'in_progress' } : s));
    await new Promise(r => setTimeout(r, 600));

    const newNote = {
      id: `note_${Date.now()}`,
      title: generatedPlan.markdownTitle,
      content: generatedPlan.markdownContent,
      tags: ['markdown', 'ai-plan'],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addNote(newNote);

    setExecutionSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'completed' } : s));
    setExecutionProgress(80);

    // Step 3: Create Habit
    setExecutionSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'in_progress' } : s));
    await new Promise(r => setTimeout(r, 500));

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: generatedPlan.habitName,
      description: `AI routine targeting ${generatedPlan.targetDaysPerWeek} days/week`,
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      frequencyCount: generatedPlan.targetDaysPerWeek,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    await addHabit(newHabit);

    setExecutionSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'completed' } : s));
    setExecutionProgress(100);
    setPipelineStep(5);

    saveHistoryItem({
      id: `hist_${Date.now()}`,
      title: `Multi-Step: ${generatedPlan.taskTitle}`,
      actionType: 'multistep',
      summary: `Created Task, ${generatedPlan.subtasks.length} Subtasks, Markdown File & Habit`,
      createdAt: new Date().toISOString(),
      messages: [],
      actionTaken: { label: '4/4 Multi-Step Actions Executed', module: 'dashboard', count: 4 },
    });
  };

  // Filter History Items
  const filteredHistory = useMemo(() => {
    return historyItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
                            item.summary.toLowerCase().includes(historySearch.toLowerCase());
      const matchesStarred = historyFilterStarred ? !!item.isStarred : true;
      return matchesSearch && matchesStarred;
    });
  }, [historyItems, historySearch, historyFilterStarred]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/80 z-50 cursor-pointer backdrop-blur-xs"
        />

        {/* Main Assistant Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="relative z-[60] w-full max-w-4xl bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] min-h-[620px]"
        >
          {/* Top Header & Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <IconSparkles size={20} stroke={2} />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  AI Assistant
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Productivity Companion
                  </span>
                </h2>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 self-stretch sm:self-auto overflow-x-auto custom-scrollbar">
              {([
                { id: 'chats', label: 'Assistant', icon: IconMessageDots },
                { id: 'multistep', label: 'Multi-Step', icon: IconChecklist },
                { id: 'suggestions', label: 'Suggestions', icon: IconBulb },
                { id: 'history', label: 'History', icon: IconHistory },
                { id: 'settings', label: 'Key', icon: IconKey },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedHistoryItem(null);
                    setActiveTab(id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:static flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
            >
              <IconX size={16} />
            </button>
          </div>

          {/* Modal Content Surface */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
            
            {/* ── TAB 1: ASSISTANT CHAT & GREETING ── */}
            {activeTab === 'chats' && (
              <div className="flex flex-col gap-6 h-full">
                {/* Robot Greeting Hero Banner */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-purple-950/30 via-zinc-900 to-zinc-950 border border-purple-500/20 rounded-3xl gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-2xl">
                        <IconSparkles size={40} stroke={1.5} />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-3 border-zinc-900 animate-pulse" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                        Hi Rahul! {timeGreeting.emoji}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md">
                        {timeGreeting.text}, let's build your best day! What are you working on right now? What's your next plan?
                      </p>
                    </div>

                    {/* Integrated 2-3 Personalized Suggestion Cards in Greeting */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-2 text-left">
                      {suggestionsList.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => handleChatSubmit(sug.title)}
                          className="p-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/40 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">{sug.contextTag}</span>
                          <p className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-2">{sug.title}</p>
                          <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                            {sug.actionLabel} <IconChevronRight size={12} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Chat Transcript */}
                <div className="flex-1 flex flex-col gap-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 max-w-xl ${
                        msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                            : 'bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-zinc-500 px-1">{msg.timestamp}</span>

                      {/* Interactive Task Result Card */}
                      {msg.resultCard?.type === 'todo' && (
                        <div className="p-4 rounded-2xl bg-zinc-950 border border-purple-500/30 text-left w-full mt-2 flex flex-col gap-3">
                          <h4 className="text-xs font-bold text-white">{msg.resultCard.data.title}</h4>
                          <div className="flex flex-col gap-1.5">
                            {msg.resultCard.data.subtasks.map((st: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                                <IconCheck size={14} className="text-purple-400" />
                                <span>{st.title}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={async () => {
                              const newTask = {
                                id: `task_${Date.now()}`,
                                projectId: null,
                                title: msg.resultCard.data.title,
                                completed: false,
                                priority: msg.resultCard.data.priority,
                                tags: msg.resultCard.data.tags,
                                dueDate: null,
                                createdAt: new Date().toISOString(),
                                subtasks: msg.resultCard.data.subtasks.map((s: any, i: number) => ({
                                  id: `sub_${Date.now()}_${i}`,
                                  title: s.title,
                                  completed: false,
                                })),
                              };
                              await addTodoTask(newTask);
                              setActiveModule('todo');
                              onClose();
                            }}
                            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                          >
                            <IconPlus size={14} /> Add 5 Tasks to To-Do Module
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-purple-400 self-start animate-pulse">
                      <IconLoader2 size={16} className="animate-spin" />
                      <span>AI is thinking & analyzing...</span>
                    </div>
                  )}
                </div>

                {/* Prompt Bar with Quick Action Pills */}
                <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                    <button
                      onClick={() => handleChatSubmit('Add a new task:')}
                      className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <IconPlus size={13} className="text-purple-400" /> Add Task
                    </button>
                    <button
                      onClick={() => handleChatSubmit('Break down my study task into smaller actionable subtasks')}
                      className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <IconListCheck size={13} className="text-indigo-400" /> Break Task
                    </button>
                    <button
                      onClick={() => handleChatSubmit('Help me build a realistic 6-month goal plan')}
                      className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <IconTarget size={13} className="text-emerald-400" /> Realistic Goal
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                      placeholder="Ask AI anything..."
                      className="flex-1 px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={() => handleChatSubmit()}
                      disabled={isGenerating || !prompt.trim()}
                      className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-md"
                    >
                      <IconSparkles size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: MULTI-STEP PIPELINE ── */}
            {activeTab === 'multistep' && (
              <div className="flex flex-col gap-6">
                {/* 5-Step Process Pipeline Indicator */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-bold overflow-x-auto custom-scrollbar gap-2">
                  {[
                    { num: 1, label: 'Understand' },
                    { num: 2, label: 'Ask & Clarify' },
                    { num: 3, label: 'Plan' },
                    { num: 4, label: 'Execute' },
                    { num: 5, label: 'Complete' },
                  ].map((s) => (
                    <div
                      key={s.num}
                      className={`flex items-center gap-2 shrink-0 ${
                        pipelineStep === s.num ? 'text-purple-400 font-extrabold' : pipelineStep > s.num ? 'text-emerald-400' : 'text-zinc-600'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        pipelineStep === s.num ? 'bg-purple-600 text-white' : pipelineStep > s.num ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {pipelineStep > s.num ? '✓' : s.num}
                      </span>
                      <span>{s.label}</span>
                      {s.num < 5 && <IconChevronRight size={14} className="text-zinc-700" />}
                    </div>
                  ))}
                </div>

                {/* Step 1: Input Request */}
                {pipelineStep === 1 && (
                  <div className="flex flex-col gap-4 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-left">
                    <h3 className="text-sm font-bold text-white">Create Multi-Step Goal or Project Workflow</h3>
                    <p className="text-xs text-zinc-400">Describe what you want to accomplish (e.g. *"Create a study task for OS exam, break into subtasks, write a .md study plan, and create a daily habit"*).</p>
                    <textarea
                      value={pipelinePrompt}
                      onChange={(e) => setPipelinePrompt(e.target.value)}
                      rows={3}
                      placeholder="e.g. Study for OS Exam: create main task, subtasks breakdown, markdown note, and habit target..."
                      className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                    <button
                      onClick={handleStartPipeline}
                      disabled={isGenerating || !pipelinePrompt.trim()}
                      className="py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGenerating ? <IconLoader2 size={16} className="animate-spin" /> : <IconSparkles size={16} />}
                      Start Multi-Step Workflow
                    </button>
                  </div>
                )}

                {/* Step 2: Ask & Clarify Interactive Questions */}
                {pipelineStep === 2 && (
                  <div className="flex flex-col gap-5 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-left">
                    <div className="flex items-center gap-2">
                      <IconSparkles size={18} className="text-purple-400" />
                      <h3 className="text-sm font-bold text-white">AI is asking a few clarification questions...</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                      {clarificationQuestions.map((q) => (
                        <div key={q.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
                          <label className="text-xs font-semibold text-zinc-200">{q.question}</label>
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  selectedAnswers[q.id] === opt
                                    ? 'bg-purple-600 text-white border border-purple-400'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirmAnswersAndPlan}
                      disabled={isGenerating}
                      className="py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGenerating ? <IconLoader2 size={16} className="animate-spin" /> : <IconArrowRight size={16} />}
                      Generate Custom Plan
                    </button>
                  </div>
                )}

                {/* Step 3: Plan Review & Confirm */}
                {pipelineStep === 3 && generatedPlan && (
                  <div className="flex flex-col gap-5 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-left">
                    <h3 className="text-sm font-bold text-white">Here is the plan AI will execute for you:</h3>
                    
                    <div className="flex flex-col gap-3">
                      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-white">1. Create Main Task</span>
                        <span className="text-zinc-400 font-medium">{generatedPlan.taskTitle}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-white">2. Create Subtasks ({generatedPlan.subtasks.length})</span>
                        <span className="text-purple-400 font-medium">Breakdown ready</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-white">3. Create .md File</span>
                        <span className="text-indigo-400 font-medium">{generatedPlan.markdownTitle}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-white">4. Create Habit</span>
                        <span className="text-emerald-400 font-medium">{generatedPlan.habitName}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleExecuteAllSteps}
                      className="py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <IconPlayerPlay size={16} /> Confirm & Execute All Steps
                    </button>
                  </div>
                )}

                {/* Step 4 & 5: Live Execution & Final Output */}
                {(pipelineStep === 4 || pipelineStep === 5) && (
                  <div className="flex flex-col gap-6 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">
                        {pipelineStep === 4 ? 'Executing the plan...' : 'All done! 🎉 Everything created successfully.'}
                      </h3>
                      <span className="text-xs font-mono font-bold text-purple-400">{executionProgress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${executionProgress}%` }} />
                    </div>

                    {/* Live Execution Steps List */}
                    <div className="flex flex-col gap-2.5">
                      {executionSteps.map((step) => (
                        <div key={step.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-200">{step.title}</span>
                          {step.status === 'completed' && <span className="text-emerald-400 font-bold flex items-center gap-1"><IconCheck size={14} /> Done</span>}
                          {step.status === 'in_progress' && <span className="text-purple-400 font-bold flex items-center gap-1"><IconLoader2 size={14} className="animate-spin" /> In Progress</span>}
                          {step.status === 'pending' && <span className="text-zinc-600 font-bold">Pending</span>}
                        </div>
                      ))}
                    </div>

                    {pipelineStep === 5 && (
                      <button
                        onClick={() => {
                          onClose();
                          setActiveModule('dashboard');
                        }}
                        className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        <IconArrowRight size={16} /> Go to Dashboard & View Results
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: PERSONALIZED SUGGESTIONS ── */}
            {activeTab === 'suggestions' && (
              <div className="flex flex-col gap-6 text-left">
                {/* Personalized Insight Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Streak</span>
                    <span className="text-sm font-black text-amber-400">🔥 7 Days</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Completed</span>
                    <span className="text-sm font-black text-purple-400">💬 9 Tasks</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Best Time</span>
                    <span className="text-sm font-black text-indigo-400">🕒 8:00 PM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Productivity</span>
                    <span className="text-sm font-black text-emerald-400">📈 +18% Up</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Suggested For You</h3>
                  <div className="flex flex-col gap-3">
                    {suggestionsList.map((sug) => (
                      <div key={sug.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/15 text-purple-400">{sug.contextTag}</span>
                            <span className="text-[11px] text-zinc-500">{sug.reason}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white">{sug.title}</h4>
                          <p className="text-[11.5px] text-zinc-400 mt-0.5">{sug.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('chats');
                            handleChatSubmit(sug.title);
                          }}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                        >
                          {sug.actionLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: HISTORY & DETAILS VIEW ── */}
            {activeTab === 'history' && (
              <div className="flex flex-col gap-5 text-left">
                {selectedHistoryItem ? (
                  /* History Details View */
                  <div className="flex flex-col gap-5 p-5 rounded-3xl bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <button
                        onClick={() => setSelectedHistoryItem(null)}
                        className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        ← Back to History List
                      </button>
                      <button
                        onClick={() => toggleStarHistory(selectedHistoryItem.id)}
                        className={`p-1.5 rounded-lg border ${
                          selectedHistoryItem.isStarred ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        <IconStar size={16} fill={selectedHistoryItem.isStarred ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{selectedHistoryItem.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{selectedHistoryItem.summary}</p>
                    </div>

                    {/* Chat Messages Replay */}
                    <div className="flex flex-col gap-3">
                      {selectedHistoryItem.messages.map((m) => (
                        <div key={m.id} className={`p-3.5 rounded-2xl text-xs ${m.sender === 'user' ? 'bg-purple-600 text-white self-end' : 'bg-zinc-900 text-zinc-200 border border-zinc-800 self-start'}`}>
                          {m.text}
                        </div>
                      ))}
                    </div>

                    {/* Feedback Ratings */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                      <span>Was this helpful?</span>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer"><IconThumbUp size={14} /></button>
                        <button className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer"><IconThumbDown size={14} /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* History List View */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <IconSearch size={16} className="absolute left-3 top-2.5 text-zinc-500" />
                        <input
                          type="text"
                          value={historySearch}
                          onChange={(e) => setHistorySearch(e.target.value)}
                          placeholder="Search history..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => setHistoryFilterStarred(!historyFilterStarred)}
                        className={`p-2 rounded-xl border cursor-pointer ${
                          historyFilterStarred ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        <IconFilter size={16} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {filteredHistory.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-8">No past AI conversations found.</p>
                      ) : (
                        filteredHistory.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedHistoryItem(item)}
                            className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                                <IconSparkles size={16} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-purple-300">{item.title}</h4>
                                <p className="text-[11px] text-zinc-400">{item.summary}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <IconChevronRight size={14} className="text-zinc-600 group-hover:text-white" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: AI SETTINGS ── */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-4 text-left p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
                <h3 className="text-sm font-bold text-white">Gemini API Key Configuration</h3>
                <p className="text-xs text-zinc-400">Configure your Google AI Studio API key to enable instant task breakdown, markdown generation & multi-step execution.</p>
                <input
                  type="password"
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => useAppStore.getState().updateSettings({ geminiApiKey: e.target.value.trim() })}
                  placeholder="AIzaSy..."
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
