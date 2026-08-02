import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { createPortal } from 'react-dom';
import { 
  IconSparkles, IconX, IconPlus, IconKey, 
  IconHistory, IconChevronRight, IconLoader2 
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import { useToastStore } from '../../../store/useToastStore';
import { type Habit, type AiHistoryItem, type AiChatMessage } from '../../../store/types';
import { 
  generateAiGeneralResponse, 
  generateRealAppContextSuggestions, 
  analyzeAndClassifyUserPrompt, 
  type AiMultiStepPlanOutput 
} from '../../../lib/gemini';

// Subcomponents
import { AiWorkspaceStats } from './AiWorkspaceStats';
import { AiChatHistory } from './AiChatHistory';
import { AiChatInput } from './AiChatInput';
import { AiMessageBubble } from './AiMessageBubble';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: string;
}

export const AiAssistantModal = ({ isOpen, onClose, initialAction }: AiAssistantModalProps) => {
  const { settings, addTodoTask, updateTodoTask, addNote, addHabit, setActiveModule, todoTasks, habits, journals } = useAppStore(
    useShallow((state) => ({
      settings: state.settings,
      addTodoTask: state.addTodoTask,
      updateTodoTask: state.updateTodoTask,
      addNote: state.addNote,
      addHabit: state.addHabit,
      setActiveModule: state.setActiveModule,
      todoTasks: state.todoTasks,
      habits: state.habits,
      journals: state.journals,
    }))
  );

  const addToast = useToastStore((s) => s.addToast);
  const apiKey = settings.geminiApiKey || '';
  const model = settings.geminiModel || 'gemini-2.5-flash';

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [activeView, setActiveView] = useState<'chat' | 'history'>('chat');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [multiStepPlan, setMultiStepPlan] = useState<AiMultiStepPlanOutput | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [historyItems, setHistoryItems] = useState<AiHistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('phq_ai_history') || '[]'); } catch { return []; }
  });
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AiHistoryItem | null>(null);
  const [historySearch, setHistorySearch] = useState('');

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle Initial Quick Action from FAB
  useEffect(() => {
    if (!isOpen) return;
    if (initialAction === 'add_task') setPrompt('Add a task: ');
    else if (initialAction === 'breakdown') handleChatSubmit('Break down a task');
    else if (initialAction === 'goal') setPrompt('Help me create a realistic 6-month goal plan');
    else if (initialAction === 'suggest') setPrompt('Suggest tasks based on my current workload');
  }, [initialAction, isOpen]);

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

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌅' };
    return { text: 'Good night', emoji: '🌙' };
  }, []);

  const contextSuggestions = useMemo(() => generateRealAppContextSuggestions(todoTasks, habits, journals), [todoTasks, habits, journals]);

  const workspaceStats = useMemo(() => {
    const pending = todoTasks.filter(t => !t.completed && !t.deleted).length;
    const todayStr = new Date().toISOString().split('T')[0];
    const habitsDue = habits.filter(h => !h.completedDates?.includes(todayStr)).length;
    const completedToday = todoTasks.filter(t => t.completed && t.createdAt?.startsWith(todayStr)).length;
    const totalToday = todoTasks.filter(t => t.createdAt?.startsWith(todayStr)).length;
    const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);
    return { pending, habitsDue, completedToday, totalToday, maxStreak };
  }, [todoTasks, habits]);

  const filteredHistory = useMemo(() =>
    historyItems.filter(i => i.title.toLowerCase().includes(historySearch.toLowerCase())),
    [historyItems, historySearch]
  );

  const handleChatSubmit = async (customPrompt?: string) => {
    const textToSubmit = (customPrompt ?? prompt).trim();
    if (!textToSubmit) return;
    if (!apiKey) { addToast('Key Required', 'Set your Gemini API Key in Settings.', 'warning'); return; }

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
      if (['break down a task', 'break task', 'break it down'].includes(textToSubmit.toLowerCase())) {
        const pending = todoTasks.filter(t => !t.completed && !t.deleted);
        if (pending.length > 0) {
          setMessages(prev => [...prev, {
            id: `msg_${Date.now()}_a`, sender: 'ai',
            text: 'Which task should I break into subtasks?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resultCard: { type: 'task_select', tasks: pending },
          }]);
          setIsGenerating(false);
          return;
        }
      }

      const result = await analyzeAndClassifyUserPrompt(apiKey, textToSubmit, model, settings.aiPersona);

      if (result.intent === 'ASK_CLARIFICATION' && result.clarificationFields) {
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_a`, sender: 'ai',
          text: result.replyText || 'I need a few details to help you better.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'clarification', data: result.clarificationFields },
        }]);
      } else if (result.intent === 'CREATE_TODO_TASK' && result.taskData) {
        const newTask = {
          id: `task_${Date.now()}`, projectId: null, title: result.taskData.title,
          completed: false, priority: result.taskData.priority || 'medium',
          tags: result.taskData.tags || ['ai-created'], dueDate: null,
          createdAt: new Date().toISOString(),
          subtasks: (result.taskData.subtasks || []).map((s: any, i: number) => ({ id: `sub_${Date.now()}_${i}`, title: typeof s === 'string' ? s : s.title, completed: false })),
        };
        await addTodoTask(newTask);
        const aiMsg: AiChatMessage = {
          id: `msg_${Date.now()}_a`, sender: 'ai',
          text: result.replyText || `Task **"${result.taskData.title}"** has been added to your To-Do list ✅`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'todo', data: result.taskData },
        };
        setMessages(prev => [...prev, aiMsg]);
        saveHistoryItem({ id: `hist_${Date.now()}`, title: `Task: ${result.taskData.title}`, actionType: 'add_task', summary: `Created with ${result.taskData.subtasks?.length || 0} subtasks`, createdAt: new Date().toISOString(), messages: [userMsg, aiMsg] });
      } else if (result.intent === 'BREAKDOWN_TASK') {
        const pending = todoTasks.filter(t => !t.completed && !t.deleted);
        if (!result.targetTaskTitle && pending.length > 0) {
          setMessages(prev => [...prev, {
            id: `msg_${Date.now()}_a`, sender: 'ai',
            text: 'Select the task to break down:',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resultCard: { type: 'task_select', tasks: pending },
          }]);
        } else if (result.taskData) {
          const bdTask = result.taskData;
          const subtasks = (bdTask.subtasks || []).map((s: any, i: number) => ({ id: `sub_${Date.now()}_${i}`, title: typeof s === 'string' ? s : s.title, completed: false }));
          const existing = todoTasks.find(t => t.title.toLowerCase() === (result.targetTaskTitle?.toLowerCase() || bdTask.title?.toLowerCase()));
          if (existing) await updateTodoTask(existing.id, { subtasks });
          else await addTodoTask({ id: `task_${Date.now()}`, projectId: null, title: bdTask.title, completed: false, priority: bdTask.priority || 'medium', tags: bdTask.tags || [], dueDate: null, createdAt: new Date().toISOString(), subtasks });
          setMessages(prev => [...prev, {
            id: `msg_${Date.now()}_a`, sender: 'ai',
            text: result.replyText || `Here's the breakdown for **"${bdTask.title}"** — saved to your tasks ⚡`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resultCard: { type: 'todo', data: bdTask },
          }]);
        }
      } else if (result.intent === 'CREATE_MARKDOWN_DOC' && result.markdownData) {
        const mdData = result.markdownData;
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_a`, sender: 'ai',
          text: result.replyText || `Markdown doc **"${mdData.title}"** is ready 📝`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'markdown', data: mdData },
        }]);
      } else if (result.intent === 'CREATE_HABIT_ROUTINE' && result.habitData) {
        const hData = result.habitData;
        const newHabit = {
          id: `habit_${Date.now()}`,
          name: hData.name,
          description: hData.description || '',
          frequencyType: hData.frequencyType || 'daily',
          frequencyDays: hData.frequencyDays || [1, 2, 3, 4, 5],
          frequencyCount: hData.frequencyCount || 3,
          completedDates: [],
          streak: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString()
        };
        await addHabit(newHabit);
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_a`, sender: 'ai',
          text: result.replyText || `Habit **"${hData.name}"** created successfully 📅`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'habit', data: hData },
        }]);
      } else if (result.intent === 'MULTI_STEP_GOAL' && result.multiStepPlan) {
        setMultiStepPlan(result.multiStepPlan);
        const planMsgId = `msg_${Date.now()}_a`;
        const aiMsg: AiChatMessage = {
          id: planMsgId, sender: 'ai',
          text: result.replyText || `Multi-step plan for **"${result.multiStepPlan.taskTitle}"** is ready 🎯`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resultCard: { type: 'multistep_plan', data: result.multiStepPlan },
        };
        setMessages(prev => [...prev, aiMsg]);
        saveHistoryItem({ id: `hist_${Date.now()}`, title: `Multi-Step: ${result.multiStepPlan.taskTitle}`, actionType: 'multistep', summary: 'Task + MD + Habit created', createdAt: new Date().toISOString(), messages: [userMsg, aiMsg] });
      } else {
        const resText = result.replyText || await generateAiGeneralResponse(apiKey, textToSubmit, model);
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_a`, sender: 'ai', text: resText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    } catch (err: any) {
      addToast('AI Error', err.message || 'Failed to generate response', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteInChatPlan = async (msgId: string) => {
    if (!multiStepPlan) return;
    setIsGenerating(true); setExecutionProgress(10);
    try {
      await new Promise(r => setTimeout(r, 400));
      await addTodoTask({ id: `task_${Date.now()}`, projectId: null, title: multiStepPlan.taskTitle, completed: false, priority: multiStepPlan.priority, tags: multiStepPlan.tags, dueDate: null, createdAt: new Date().toISOString(), subtasks: multiStepPlan.subtasks.map((s: { title: string }, i: number) => ({ id: `sub_${Date.now()}_${i}`, title: s.title, completed: false })) });
      setExecutionProgress(50);
      await new Promise(r => setTimeout(r, 400));
      await addNote({ id: `note_${Date.now()}`, title: multiStepPlan.markdownTitle, content: multiStepPlan.markdownContent, tags: ['ai-plan'], pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      setExecutionProgress(85);
      await new Promise(r => setTimeout(r, 400));
      const newHabit: Habit = { id: `habit_${Date.now()}`, name: multiStepPlan.habitName, description: `AI routine: ${multiStepPlan.targetDaysPerWeek} days/week`, frequencyType: 'daily', frequencyDays: [0,1,2,3,4,5,6], frequencyCount: multiStepPlan.targetDaysPerWeek, completedDates: [], streak: 0, bestStreak: 0, createdAt: new Date().toISOString() };
      await addHabit(newHabit);
      setExecutionProgress(100);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: `All done! Task, ${multiStepPlan.subtasks.length} subtasks, .md file & habit created 🎉`, resultCard: { type: 'multistep_completed', data: multiStepPlan } } : m));
      addToast('Success', 'Multi-step plan executed!', 'success');
    } catch (err: any) {
      addToast('Execution Failed', err.message || 'Could not complete plan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 select-none sm:items-center sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer bg-black/40"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          className="relative w-full max-w-4xl h-[90vh] sm:h-[600px] bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* ─── HEADER ─── */}
          <div className="z-10 flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 shadow-sm rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500">
                <IconSparkles size={16} className="text-white" stroke={2} />
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-tight text-text-primary">Antigravity AI</span>
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold align-middle">{model}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView(v => v === 'history' ? 'chat' : 'history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${activeView === 'history' ? 'bg-primary text-white border-primary' : 'bg-surface-alt text-text-secondary border-border hover:border-primary/40'}`}
              >
                <IconHistory size={14} />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                onClick={() => setShowKeyInput(v => !v)}
                className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${showKeyInput ? 'bg-primary text-white border-primary' : 'bg-surface-alt text-text-muted border-border hover:border-primary/40'}`}
                title="API Key"
              >
                <IconKey size={14} />
              </button>

              <button
                onClick={() => { setMessages([]); setMultiStepPlan(null); }}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold border border-primary cursor-pointer hover:opacity-90 transition-opacity hidden sm:flex items-center gap-1"
              >
                <IconPlus size={14} /> New Chat
              </button>

              <button onClick={onClose} className="p-2 transition-colors border rounded-lg cursor-pointer bg-surface-alt border-border text-text-muted hover:text-text-primary">
                <IconX size={15} />
              </button>
            </div>
          </div>

          {/* API Key input (collapsible) */}
          <AnimatePresence>
            {showKeyInput && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border bg-surface-alt/60">
                <div className="flex items-center gap-3 px-5 py-3">
                  <IconKey size={15} className="text-primary shrink-0" />
                  <input
                    type="password"
                    value={settings.geminiApiKey || ''}
                    onChange={e => useAppStore.getState().updateSettings({ geminiApiKey: e.target.value.trim() })}
                    placeholder="Paste your Gemini API key (AIzaSy...)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={() => setShowKeyInput(false)} className="text-xs cursor-pointer text-text-muted hover:text-text-primary">Done</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── MAIN BODY: Two columns ─── */}
          <div className="flex flex-1 overflow-hidden">

            {/* ══════ LEFT: Chat Feed ══════ */}
            <div className="flex flex-col flex-1 overflow-hidden border-r border-border">

              {/* Chat scroll area */}
              <div className="flex flex-col flex-1 gap-4 p-5 overflow-y-auto custom-scrollbar">

                {/* Empty state / Greeting */}
                {messages.length === 0 && (
  <div className="flex flex-col items-start gap-3.5 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
    {/* AI Greeting Card */}
    <div className="flex items-start max-w-2xl gap-3">
      {/* Subtle Avatar with Ring Accent */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/10 ring-2 ring-purple-500/20 shrink-0 mt-0.5">
        <IconSparkles size={15} className="text-white" stroke={2.2} />
      </div>

      {/* Main Card Bubble */}
      <div className="relative bg-surface-alt/80 backdrop-blur-md border border-border/80 rounded-2xl rounded-tl-sm p-4 shadow-sm space-y-2.5 max-w-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <span>Hi Rahul!</span>
            <span className="text-sm">{timeGreeting.emoji}</span>
          </p>
          <span className="text-[10px] font-medium text-text-muted/80 tracking-tight">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p className="text-xs font-normal leading-relaxed text-text-secondary">
          <strong className="block mb-1 font-semibold text-text-primary">
            {timeGreeting.text}, let's build your best day!
          </strong>
          What are you working on right now? Any game plans for today?
        </p>
      </div>
    </div>

    {/* Context Suggestion Chips/Strips */}
    <div className="flex flex-col max-w-2xl gap-2 pl-11">
      {contextSuggestions.map((sug) => (
        <button
          key={sug.id}
          onClick={() =>
            handleChatSubmit(
              sug.actionLabel === 'Break Down Task'
                ? 'Break down a task'
                : sug.title
            )
          }
          className="group relative flex items-center justify-between max-w-2xl px-3.5 py-2.5 rounded-md bg-surface border border-border/60 hover:border-primary/50 hover:bg-surface-hover hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden text-left"
        >
          {/* Subtle Accent Left Pillar */}
          <div className="absolute top-0 bottom-0 left-0 w-1 transition-colors bg-primary/40 group-hover:bg-primary" />

          <div className="flex flex-col gap-0.5 pl-1.5 pr-2 max-w-2xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
              {sug.contextTag}
            </span>
            <p className="text-xs font-medium transition-colors text-text-primary group-hover:text-primary line-clamp-1">
              {sug.title}
            </p>
          </div>

          <div className="flex items-center gap-1 max-w-2xl text-[11px] font-medium text-text-muted group-hover:text-primary transition-colors shrink-0">
            <span>{sug.actionLabel}</span>
            <IconChevronRight
              size={12}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </button>
      ))}
    </div>
  </div>
)}

                {/* History view inside chat panel */}
                {activeView === 'history' && (
                  <AiChatHistory 
                    selectedHistoryItem={selectedHistoryItem}
                    setSelectedHistoryItem={setSelectedHistoryItem}
                    historySearch={historySearch}
                    setHistorySearch={setHistorySearch}
                    filteredHistory={filteredHistory}
                    toggleStarHistory={toggleStarHistory}
                  />
                )}

                {/* Chat messages */}
                {activeView === 'chat' && messages.map((msg) => (
                  <AiMessageBubble 
                    key={msg.id}
                    msg={msg}
                    isGenerating={isGenerating}
                    executionProgress={executionProgress}
                    handleChatSubmit={handleChatSubmit}
                    handleExecuteInChatPlan={handleExecuteInChatPlan}
                    setActiveModule={setActiveModule}
                    onClose={onClose}
                    addNote={addNote}
                    addToast={addToast}
                  />
                ))}

                {/* Generating indicator */}
                {isGenerating && activeView === 'chat' && (
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-gradient-to-tr from-purple-600 to-indigo-500 shrink-0">
                      <IconSparkles size={14} className="text-white" stroke={2} />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 text-xs border rounded-tl-none rounded-2xl bg-surface-alt border-border text-text-muted">
                      <IconLoader2 size={13} className="animate-spin text-primary" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ── Bottom Input Bar ── */}
              <AiChatInput 
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                handleChatSubmit={handleChatSubmit}
              />
            </div>

            {/* ══════ RIGHT: Sidebar Panel ══════ */}
            <AiWorkspaceStats 
              workspaceStats={workspaceStats}
              historyItems={historyItems}
              setActiveView={setActiveView}
              setSelectedHistoryItem={setSelectedHistoryItem}
              handleChatSubmit={handleChatSubmit}
            />
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
