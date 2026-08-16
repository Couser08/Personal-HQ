import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { createPortal } from 'react-dom';
import { 
  IconSparkles, IconX, IconPlus, IconKey, 
  IconHistory, IconChevronRight, IconLoader2, IconAlertCircle 
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import { useToastStore } from '../../../store/useToastStore';
import { type AiHistoryItem, type AiChatMessage } from '../../../store/types';
import { 
  generateRealAppContextSuggestions, 
  runAgentTurn,
  checkRateLimit,
  type AgentStepUpdate,
  type AgentMessageHistory
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
  const { settings, addNote, setActiveModule, todoTasks, habits, journals, activeModule } = useAppStore(
    useShallow((state) => ({
      settings: state.settings,
      addNote: state.addNote,
      setActiveModule: state.setActiveModule,
      todoTasks: state.todoTasks,
      habits: state.habits,
      journals: state.journals,
      activeModule: state.activeModule,
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
  const [currentToolSteps, setCurrentToolSteps] = useState<AgentStepUpdate[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [historyItems, setHistoryItems] = useState<AiHistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('phq_ai_history') || '[]'); } catch { return []; }
  });
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AiHistoryItem | null>(null);
  const [historySearch, setHistorySearch] = useState('');

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, currentToolSteps]);

  // Handle Initial Quick Action from FAB
  useEffect(() => {
    if (!isOpen) return;
    if (initialAction === 'add_task') setPrompt('Add task: ');
    else if (initialAction === 'breakdown') handleChatSubmit('Break down a task');
    else if (initialAction === 'goal') setPrompt('Help me create a realistic 6-month goal plan');
    else if (initialAction === 'suggest') setPrompt('What should I focus on today based on my current workload?');
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

  const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleChatSubmit = async (customPrompt?: string) => {
    const textToSubmit = (customPrompt ?? prompt).trim();
    if (!textToSubmit) return;
    if (!apiKey) {
      addToast('Key Required', 'Set your Gemini API Key in Settings.', 'warning');
      setShowKeyInput(true);
      return;
    }

    // Active Pre-flight Rate Limiter Check
    const rateStatus = checkRateLimit();
    if (!rateStatus.allowed) {
      addToast('Rate Limit Reached', rateStatus.warningMessage || 'Please wait a moment before sending another request.', 'warning');
      return;
    }

    // Breakdown edge case: if user says "break down a task" without specifying which one
    if (['break down a task', 'breakdown task', 'break it down'].includes(textToSubmit.toLowerCase())) {
      const pending = todoTasks.filter((t) => !t.completed && !t.deleted);
      if (pending.length > 0) {
        const userMsg: AiChatMessage = {
          id: `msg_${Date.now()}_u`,
          sender: 'user',
          text: textToSubmit,
          timestamp: stamp(),
        };
        const aiMsg: AiChatMessage = {
          id: `msg_${Date.now()}_a`,
          sender: 'ai',
          text: 'Which task would you like to break down into subtasks?',
          timestamp: stamp(),
          resultCard: { type: 'task_select', tasks: pending },
        };
        setMessages((prev) => [...prev, userMsg, aiMsg]);
        if (!customPrompt) setPrompt('');
        return;
      }
    }

    const userMsg: AiChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: textToSubmit,
      timestamp: stamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setPrompt('');
    setIsGenerating(true);
    setCurrentToolSteps([]);

    // Format conversation history for multi-turn Gemini calling
    const conversationHistory: AgentMessageHistory[] = messages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    try {
      const turnResult = await runAgentTurn(apiKey, textToSubmit, conversationHistory, {
        model,
        activeModule,
        onStepUpdate: (stepUpdate) => {
          setCurrentToolSteps((prev) => {
            const index = prev.findIndex((s) => s.stepId === stepUpdate.stepId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = stepUpdate;
              return updated;
            }
            return [...prev, stepUpdate];
          });
        },
      });

      const aiMsg: AiChatMessage = {
        id: `msg_${Date.now()}_a`,
        sender: 'ai',
        text: turnResult.replyText,
        timestamp: stamp(),
        executedTools: turnResult.executedTools,
        confirmedEntities: turnResult.confirmedEntities,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save History
      saveHistoryItem({
        id: `hist_${Date.now()}`,
        title: textToSubmit.slice(0, 40),
        actionType: 'add_task',
        summary: turnResult.executedTools.map((t) => t.label).join(' · ') || 'Chat response',
        createdAt: new Date().toISOString(),
        messages: [userMsg, aiMsg],
      });
    } catch (err: any) {
      addToast('AI Agent Error', err.message || 'Failed to complete AI action', 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_err`,
          sender: 'ai',
          text: `Action failed: ${err.message || 'Could not reach Gemini service.'}`,
          timestamp: stamp(),
        },
      ]);
    } finally {
      setIsGenerating(false);
      setCurrentToolSteps([]);
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
          className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          className="relative w-full max-w-4xl h-[90vh] sm:h-[620px] bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* ─── HEADER ─── */}
          <div className="z-10 flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 shadow-sm rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500">
                <IconSparkles size={16} className="text-white" stroke={2} />
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-tight text-text-primary">Personal HQ Agent</span>
                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold align-middle">{model}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView(v => v === 'history' ? 'chat' : 'history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${activeView === 'history' ? 'bg-primary text-text-on-accent border-primary' : 'bg-surface-alt text-text-secondary border-border hover:border-primary/40'}`}
              >
                <IconHistory size={14} />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                onClick={() => setShowKeyInput(v => !v)}
                className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${showKeyInput ? 'bg-primary text-text-on-accent border-primary' : 'bg-surface-alt text-text-muted border-border hover:border-primary/40'}`}
                title="API Key"
              >
                <IconKey size={14} />
              </button>

              <button
                onClick={() => { setMessages([]); setCurrentToolSteps([]); }}
                className="px-3 py-1.5 rounded-lg bg-primary text-text-on-accent text-xs font-bold border border-primary cursor-pointer hover:opacity-90 transition-opacity hidden sm:flex items-center gap-1"
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
                    <div className="flex items-start max-w-2xl gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/10 ring-2 ring-purple-500/20 shrink-0 mt-0.5">
                        <IconSparkles size={15} className="text-white" stroke={2.2} />
                      </div>

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
                            {timeGreeting.text}, how can I help you today?
                          </strong>
                          I can manage your tasks, habits, notes, journals, links, and study exams across Personal HQ.
                        </p>
                      </div>
                    </div>

                    {/* Context Suggestion Chips */}
                    <div className="flex flex-col max-w-2xl gap-2 pl-11 w-full">
                      {contextSuggestions.map((sug) => (
                        <button
                          key={sug.id}
                          onClick={() =>
                            handleChatSubmit(
                              sug.actionLabel === 'Break into subtasks'
                                ? `Break down task "${(sug.targetData as any)?.title || 'my task'}"`
                                : sug.title
                            )
                          }
                          className="group relative flex items-center justify-between max-w-2xl px-3.5 py-2.5 rounded-lg bg-surface border border-border/60 hover:border-primary/50 hover:bg-surface-hover hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden text-left"
                        >
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
                    executionProgress={100}
                    handleChatSubmit={handleChatSubmit}
                    setActiveModule={setActiveModule}
                    onClose={onClose}
                    addNote={addNote}
                    addToast={addToast}
                  />
                ))}

                {/* Live Tool Execution & Generating indicator */}
                {isGenerating && activeView === 'chat' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded-xl w-7 h-7 bg-gradient-to-tr from-purple-600 to-indigo-500 shrink-0">
                        <IconSparkles size={14} className="text-white" stroke={2} />
                      </div>
                      <div className="flex flex-col gap-2 px-4 py-3 text-xs border rounded-tl-none rounded-2xl bg-surface-alt border-border text-text-muted">
                        <div className="flex items-center gap-2">
                          <IconLoader2 size={13} className="animate-spin text-primary" />
                          <span className="font-medium text-text-primary">Executing agent loop...</span>
                        </div>

                        {/* Live Step Pills */}
                        {currentToolSteps.length > 0 && (
                          <div className="flex flex-col gap-1.5 pt-1">
                            {currentToolSteps.map((step) => (
                              <div key={step.stepId} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                                {step.status === 'running' && <IconLoader2 size={11} className="animate-spin text-primary shrink-0" />}
                                {step.status === 'success' && <span className="text-emerald-500">✓</span>}
                                {step.status === 'error' && <IconAlertCircle size={11} className="text-rose-500 shrink-0" />}
                                <span>{step.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
