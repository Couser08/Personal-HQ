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
  IconListCheck, IconKey,
  IconArrowRight, IconHistory, IconSearch, IconStar,
  IconTarget, IconPlayerPlay, IconChevronRight
} from '@tabler/icons-react';
import { createPortal } from 'react-dom';
import {
  generateAiTaskWithSubtasks,
  generateAiMarkdownDoc,
  generateAiGeneralResponse,
  generateAiMultiStepPlan,
  isMultiStepIntent,
  type AiMultiStepPlanOutput
} from '../../lib/gemini';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: string;
}

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

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);

  // Active In-Chat Multi-Step State
  const [multiStepPlan, setMultiStepPlan] = useState<AiMultiStepPlanOutput | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);

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

  // Handle Initial Quick Action from FAB
  useEffect(() => {
    if (initialAction === 'add_task') {
      setPrompt('Add a task: ');
    } else if (initialAction === 'breakdown') {
      setPrompt('Break down my task into smaller subtasks');
    } else if (initialAction === 'goal') {
      setPrompt('Help me create a realistic 6-month goal plan');
    } else if (initialAction === 'suggest') {
      setPrompt('Suggest tasks based on my current workload');
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

  // Time-aware Greeting Header
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

  // Main Unified Conversational Submit
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
      // Check if prompt is Multi-Step Intent
      if (isMultiStepIntent(textToSubmit)) {
        // Generate Multi-Step Plan Card directly in Chat
        const plan = await generateAiMultiStepPlan(apiKey, textToSubmit, 'Standard preference', model);
        setMultiStepPlan(plan);

        const planMsgId = `msg_${Date.now()}_a`;

        const aiMsg: AiChatMessage = {
          id: planMsgId,
          sender: 'ai',
          text: `I've created a complete multi-step workflow for "${plan.taskTitle}" 🎯`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'multistep_plan', data: plan },
        };

        setMessages(prev => [...prev, aiMsg]);
        saveHistoryItem({
          id: `hist_${Date.now()}`,
          title: `Multi-Step: ${plan.taskTitle}`,
          actionType: 'multistep',
          summary: `Task breakdown, .md file & habit plan created`,
          createdAt: new Date().toISOString(),
          messages: [userMsg, aiMsg],
        });
      } else if (textToSubmit.toLowerCase().includes('break down') || textToSubmit.toLowerCase().includes('subtask')) {
        const res = await generateAiTaskWithSubtasks(apiKey, textToSubmit, model);
        const aiMsg: AiChatMessage = {
          id: `msg_${Date.now()}_a`,
          sender: 'ai',
          text: `Sure! I've broken down "${res.title}" into smaller actionable subtasks ⚡`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'todo', data: res },
        };
        setMessages(prev => [...prev, aiMsg]);
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

  // In-Chat Execution of Multi-Step Plan
  const handleExecuteInChatPlan = async (msgId: string) => {
    if (!multiStepPlan) return;
    setIsGenerating(true);
    setExecutionProgress(10);

    await new Promise(r => setTimeout(r, 400));

    const newTask = {
      id: `task_${Date.now()}`,
      projectId: null,
      title: multiStepPlan.taskTitle,
      completed: false,
      priority: multiStepPlan.priority,
      tags: multiStepPlan.tags,
      dueDate: null,
      createdAt: new Date().toISOString(),
      subtasks: multiStepPlan.subtasks.map((s: { title: string }, idx: number) => ({
        id: `sub_${Date.now()}_${idx}`,
        title: s.title,
        completed: false,
      })),
    };
    await addTodoTask(newTask);
    setExecutionProgress(50);

    await new Promise(r => setTimeout(r, 400));

    const newNote = {
      id: `note_${Date.now()}`,
      title: multiStepPlan.markdownTitle,
      content: multiStepPlan.markdownContent,
      tags: ['markdown', 'ai-plan'],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addNote(newNote);
    setExecutionProgress(85);

    await new Promise(r => setTimeout(r, 400));

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: multiStepPlan.habitName,
      description: `AI routine targeting ${multiStepPlan.targetDaysPerWeek} days/week`,
      frequencyType: 'daily',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      frequencyCount: multiStepPlan.targetDaysPerWeek,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    await addHabit(newHabit);

    setExecutionProgress(100);
    setIsGenerating(false);

    // Update Message to Completed State
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.resultCard) {
        return {
          ...m,
          text: `All done! 🎉 Created Main Task, ${multiStepPlan.subtasks.length} Subtasks, Markdown File & Habit Routine.`,
          resultCard: { type: 'multistep_completed', data: multiStepPlan },
        };
      }
      return m;
    }));

    addToast('Success', 'Multi-step workflow executed cleanly!', 'success');
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
          className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 cursor-pointer backdrop-blur-xs"
        />

        {/* Theme-Adaptive Main Assistant Surface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="relative z-[60] w-full max-w-4xl bg-surface text-text-primary border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] min-h-[620px]"
        >
          {/* Top Theme-Adaptive Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-alt/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
                <IconSparkles size={22} stroke={2} />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-text-primary flex items-center gap-2">
                  AI Productivity Companion
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                    {model}
                  </span>
                </h2>
                <p className="text-xs text-text-muted">Smart personalized chat, multi-step actions & workspace sync</p>
              </div>
            </div>

            {/* Header Controls: History, Settings & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsOverlay(false);
                  setShowHistoryOverlay(!showHistoryOverlay);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  showHistoryOverlay ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface-alt hover:bg-surface-hover text-text-secondary border-border'
                }`}
                title="AI History"
              >
                <IconHistory size={15} />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowHistoryOverlay(false);
                  setShowSettingsOverlay(!showSettingsOverlay);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  showSettingsOverlay ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface-alt hover:bg-surface-hover text-text-secondary border-border'
                }`}
                title="API Settings"
              >
                <IconKey size={15} />
                <span className="hidden sm:inline">Key</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-alt hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer border border-border"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>

          {/* Settings Overlay Drawer */}
          {showSettingsOverlay && (
            <div className="p-5 border-b border-border bg-surface-alt/90 text-left flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <IconKey size={16} className="text-primary" /> Gemini API Settings
                </h3>
                <button onClick={() => setShowSettingsOverlay(false)} className="text-xs text-text-muted hover:underline cursor-pointer">Close</button>
              </div>
              <p className="text-xs text-text-secondary">Enter your Google AI Studio API key to enable AI task breakdown, live markdown generation & multi-step execution.</p>
              <input
                type="password"
                value={settings.geminiApiKey || ''}
                onChange={(e) => useAppStore.getState().updateSettings({ geminiApiKey: e.target.value.trim() })}
                placeholder="AIzaSy..."
                className="w-full p-2.5 rounded-xl bg-surface border border-border text-xs font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {/* History Overlay Drawer */}
          {showHistoryOverlay && (
            <div className="p-5 border-b border-border bg-surface-alt/95 text-left flex flex-col gap-4 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <IconHistory size={16} className="text-primary" /> AI Conversation History
                </h3>
                <button onClick={() => setShowHistoryOverlay(false)} className="text-xs text-text-muted hover:underline cursor-pointer">Close</button>
              </div>

              {selectedHistoryItem ? (
                /* History Details View */
                <div className="flex flex-col gap-4 p-4 rounded-2xl bg-surface border border-border">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <button onClick={() => setSelectedHistoryItem(null)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                      ← Back to History List
                    </button>
                    <button
                      onClick={() => toggleStarHistory(selectedHistoryItem.id)}
                      className={`p-1.5 rounded-lg border ${selectedHistoryItem.isStarred ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-surface-alt text-text-muted border-border'}`}
                    >
                      <IconStar size={15} fill={selectedHistoryItem.isStarred ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{selectedHistoryItem.title}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">{selectedHistoryItem.summary}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedHistoryItem.messages.map((m) => (
                      <div key={m.id} className={`p-3 rounded-xl text-xs ${m.sender === 'user' ? 'bg-primary text-white self-end' : 'bg-surface-alt text-text-primary border border-border self-start'}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* History Timeline List */
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <IconSearch size={15} className="absolute left-3 top-2.5 text-text-muted" />
                      <input
                        type="text"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder="Search history..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setHistoryFilterStarred(!historyFilterStarred)}
                      className={`p-2 rounded-xl border cursor-pointer ${historyFilterStarred ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-surface text-text-muted border-border'}`}
                    >
                      <IconStar size={15} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredHistory.length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-6">No past AI history entries found.</p>
                    ) : (
                      filteredHistory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedHistoryItem(item)}
                          className="p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                              <IconSparkles size={14} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">{item.title}</h4>
                              <p className="text-[10.5px] text-text-muted">{item.summary}</p>
                            </div>
                          </div>
                          <IconChevronRight size={14} className="text-text-muted group-hover:text-text-primary" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MAIN UNIFIED CONVERSATIONAL CHAT FEED */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 text-left">
            {/* Greeting & Personalization Hero Banner (Shown at top when starting conversation) */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center p-6 bg-surface-alt/70 border border-border rounded-3xl gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
                    <IconSparkles size={32} stroke={1.75} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-surface animate-pulse" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-text-primary flex items-center justify-center gap-2">
                    Hi Rahul! {timeGreeting.emoji}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 max-w-md">
                    {timeGreeting.text}, let's build your best day! What are you working on right now? What's your next plan?
                  </p>
                </div>

                {/* Integrated 2-3 Personalized Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-1 text-left">
                  {suggestionsList.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => handleChatSubmit(sug.title)}
                      className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-xs group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{sug.contextTag}</span>
                      <p className="text-xs font-semibold text-text-primary group-hover:text-primary line-clamp-2">{sug.title}</p>
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                        {sug.actionLabel} <IconChevronRight size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Transcript Messages */}
            <div className="flex-1 flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 max-w-2xl ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none shadow-sm'
                        : 'bg-surface-alt text-text-primary border border-border rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-text-muted px-1">{msg.timestamp}</span>

                  {/* IN-CHAT MULTI-STEP PLAN PREVIEW CARD */}
                  {msg.resultCard?.type === 'multistep_plan' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-surface border border-primary/30 shadow-md text-left w-full mt-2 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Multi-Step Execution Plan</span>
                          <h4 className="text-sm font-bold text-text-primary">{msg.resultCard.data.taskTitle}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          4 Actions Included
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between">
                          <span className="font-semibold text-text-primary">1. Main Task</span>
                          <span className="text-text-muted text-[11px] truncate max-w-[120px]">{msg.resultCard.data.taskTitle}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between">
                          <span className="font-semibold text-text-primary">2. Subtasks ({msg.resultCard.data.subtasks.length})</span>
                          <span className="text-primary font-bold text-[11px]">Breakdown ready</span>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between">
                          <span className="font-semibold text-text-primary">3. .md Document</span>
                          <span className="text-primary font-bold text-[11px]">{msg.resultCard.data.markdownTitle}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between">
                          <span className="font-semibold text-text-primary">4. Habit Routine</span>
                          <span className="text-emerald-500 font-bold text-[11px]">{msg.resultCard.data.habitName}</span>
                        </div>
                      </div>

                      {/* 1-Click In-Chat Confirm & Execute All Button */}
                      <button
                        onClick={() => handleExecuteInChatPlan(msg.id)}
                        disabled={isGenerating}
                        className="w-full py-3 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all mt-1"
                      >
                        {isGenerating ? (
                          <>
                            <IconLoader2 size={16} className="animate-spin" /> Executing Steps Live ({executionProgress}%)...
                          </>
                        ) : (
                          <>
                            <IconPlayerPlay size={16} /> Confirm & Execute All Steps
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* IN-CHAT MULTI-STEP COMPLETED OUTPUT CARD */}
                  {msg.resultCard?.type === 'multistep_completed' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-surface border border-emerald-500/30 shadow-md text-left w-full mt-2 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                          <IconCheck size={14} /> Multi-Step Actions Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <button onClick={() => { onClose(); setActiveModule('todo'); }} className="p-2.5 rounded-xl bg-surface-alt border border-border text-left hover:border-primary transition-colors cursor-pointer">
                          <span className="text-[10px] text-text-muted block">Task Created</span>
                          <span className="font-bold text-primary flex items-center gap-1">View Tasks <IconChevronRight size={12} /></span>
                        </button>
                        <button onClick={() => { onClose(); setActiveModule('markdown'); }} className="p-2.5 rounded-xl bg-surface-alt border border-border text-left hover:border-primary transition-colors cursor-pointer">
                          <span className="text-[10px] text-text-muted block">.MD File</span>
                          <span className="font-bold text-primary flex items-center gap-1">Open File <IconChevronRight size={12} /></span>
                        </button>
                        <button onClick={() => { onClose(); setActiveModule('habits'); }} className="p-2.5 rounded-xl bg-surface-alt border border-border text-left hover:border-primary transition-colors cursor-pointer">
                          <span className="text-[10px] text-text-muted block">Habit Setup</span>
                          <span className="font-bold text-emerald-500 flex items-center gap-1">View Habit <IconChevronRight size={12} /></span>
                        </button>
                        <button onClick={() => { onClose(); setActiveModule('dashboard'); }} className="p-2.5 rounded-xl bg-surface-alt border border-border text-left hover:border-primary transition-colors cursor-pointer">
                          <span className="text-[10px] text-text-muted block">Dashboard</span>
                          <span className="font-bold text-text-primary flex items-center gap-1">Overview <IconChevronRight size={12} /></span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* To-Do Task Result Card */}
                  {msg.resultCard?.type === 'todo' && (
                    <div className="p-4 rounded-2xl bg-surface border border-primary/30 text-left w-full mt-2 flex flex-col gap-3 shadow-xs">
                      <h4 className="text-xs font-bold text-text-primary">{msg.resultCard.data.title}</h4>
                      <div className="flex flex-col gap-1.5">
                        {msg.resultCard.data.subtasks.map((st: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                            <IconCheck size={14} className="text-primary" />
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
                        className="w-full py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-1"
                      >
                        <IconPlus size={14} /> Add Tasks & Open To-Do Module
                      </button>
                    </div>
                  )}

                  {/* Markdown Result Card */}
                  {msg.resultCard?.type === 'markdown' && (
                    <div className="p-4 rounded-2xl bg-surface border border-primary/30 text-left w-full mt-2 flex flex-col gap-3 shadow-xs">
                      <h4 className="text-xs font-bold text-text-primary">{msg.resultCard.data.title}</h4>
                      <div className="p-3 rounded-lg bg-surface-alt text-text-secondary font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap border border-border custom-scrollbar">
                        {msg.resultCard.data.content}
                      </div>
                      <button
                        onClick={async () => {
                          const newNote = {
                            id: `note_${Date.now()}`,
                            title: msg.resultCard.data.title,
                            content: msg.resultCard.data.content,
                            tags: ['markdown', 'ai-generated'],
                            pinned: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          await addNote(newNote);
                          setActiveModule('markdown');
                          onClose();
                        }}
                        className="w-full py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-1"
                      >
                        <IconArrowRight size={14} /> Open & Write Live in Markdown Workspace
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-alt border border-border text-xs text-primary self-start animate-pulse">
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>AI is thinking & processing multi-step intent...</span>
                </div>
              )}
            </div>

            {/* Bottom Conversational Prompt Bar */}
            <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => handleChatSubmit('Add a new task:')}
                  className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-hover border border-border text-[11px] font-bold text-text-secondary flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <IconPlus size={13} className="text-primary" /> Add Task
                </button>
                <button
                  onClick={() => handleChatSubmit('Break down my study task into smaller subtasks')}
                  className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-hover border border-border text-[11px] font-bold text-text-secondary flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <IconListCheck size={13} className="text-primary" /> Break Task
                </button>
                <button
                  onClick={() => handleChatSubmit('Help me build a realistic 6-month goal plan')}
                  className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-hover border border-border text-[11px] font-bold text-text-secondary flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <IconTarget size={13} className="text-emerald-500" /> Realistic Goal
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask AI anything or describe a multi-step request..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-surface-alt border border-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={() => handleChatSubmit()}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-5 py-3 rounded-2xl bg-primary hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-md"
                >
                  <IconSparkles size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
