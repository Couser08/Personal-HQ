import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import {
  IconChecklist, IconClockPlay, IconSitemap,
  IconPlus, IconPlayerPlay, IconPlayerPause, IconRefresh,
  IconCheck, IconArrowRight, IconFlame, IconCalendar,
  IconDots, IconExternalLink, IconChevronDown,
  IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react';

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardModule() {
  const {
    todoTasks,
    mindmaps,
    setActiveModule,
    addTodoTask,
    updateTodoTask,
    pomodoroSecondsLeft,
    pomodoroTimerState,
    pomodoroSessionId,
    startGlobalPomodoro,
    pauseGlobalPomodoro,
    resumeGlobalPomodoro,
    stopGlobalPomodoro,
    addMindmap,
    pomodoroStats,
    pomodoroStreak,
  } = useAppStore(useShallow(state => ({
    todoTasks: state.todoTasks,
    mindmaps: state.mindmaps,
    setActiveModule: state.setActiveModule,
    addTodoTask: state.addTodoTask,
    updateTodoTask: state.updateTodoTask,
    pomodoroSecondsLeft: state.pomodoroSecondsLeft,
    pomodoroTimerState: state.pomodoroTimerState,
    pomodoroSessionId: state.pomodoroSessionId,
    startGlobalPomodoro: state.startGlobalPomodoro,
    pauseGlobalPomodoro: state.pauseGlobalPomodoro,
    resumeGlobalPomodoro: state.resumeGlobalPomodoro,
    stopGlobalPomodoro: state.stopGlobalPomodoro,
    addMindmap: state.addMindmap,
    pomodoroStats: state.pomodoroStats,
    pomodoroStreak: state.pomodoroStreak,
  })));

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAllTasks, setShowAllTasks] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTodoTask({
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      projectId: null,
      priority: 'none',
      tags: [],
      completed: false,
      dueDate: new Date().toISOString(),
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString(),
    });
    setNewTaskTitle('');
  };

  const handleOpenMindmap = (id: string) => {
    localStorage.setItem('pendingMindmapId', id);
    setActiveModule('mindmap');
  };

  const handleCreateMindmap = () => {
    const newId = crypto.randomUUID();
    addMindmap({
      id: newId,
      title: 'New Mindmap',
      nodes: [
        { id: 'root', text: 'Central Idea', x: 450, y: 250, color: 'blue', isRoot: true }
      ],
      links: [],
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('pendingMindmapId', newId);
    setActiveModule('mindmap');
  };

  const allTasks = todoTasks.filter(t => !(t as any).deleted);
  const totalTasks = allTasks.length;
  const completedTasksCount = allTasks.filter(t => t.completed).length;
  const todayTasks = allTasks.filter(t => !t.completed);
  const visibleTasks = showAllTasks ? todayTasks : todayTasks.slice(0, 3);

  const focusDuration = 1500;
  const breakDuration = 300;
  const pomodoroProgress = pomodoroSessionId === 'focus'
    ? ((focusDuration - pomodoroSecondsLeft) / focusDuration) * 100
    : ((breakDuration - pomodoroSecondsLeft) / breakDuration) * 100;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const focusHours = Math.floor(pomodoroStats.totalMinutes / 60);
  const focusMins = pomodoroStats.totalMinutes % 60;
  const focusTimeLabel = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  const progressPct = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const timerRadius = 52;
  const timerCircumference = 2 * Math.PI * timerRadius;

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const days: { label: string; date: number; isToday: boolean }[] = [];
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        label: labels[i],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      });
    }
    return days;
  }, []);

  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-24 px-4 md:px-8 text-left antialiased bg-neutral-50/30 dark:bg-transparent">

      {/* Hero Banner - Explicit Asymmetric 12-Column Grid Overhaul */}
      <div className="relative overflow-hidden rounded-[32px] border border-neutral-200/60 dark:border-neutral-800/50 bg-white dark:bg-neutral-900 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.03)] dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.35)] grid grid-cols-12 items-center p-8 md:p-10 gap-6 min-h-[160px]">
        
        {/* Enforced wide desktop boundaries */}
        <div className="col-span-12 md:col-span-8 flex flex-col gap-2 text-left z-10 w-full">
          <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-[0.2em] leading-none">
            {greeting} 👋
          </span>
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 mt-1">
            Focus on what matters<span className="text-rose-500">.</span>
          </h1>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium mt-1 w-full block">
            Brainstorm structural concepts, lock deep sessions, and tracking goals smoothly — all inside your unified developer command center.
          </p>
        </div>

        {/* Floating Right-Aligned Graphic Wrapper */}
        <div className="col-span-12 md:col-span-4 flex justify-end items-center select-none pointer-events-none z-10 hidden md:flex shrink-0">
          <img
            src="/study_illustration.png"
            alt="Study illustration"
            className="w-36 h-36 md:w-40 md:h-40 object-contain filter drop-shadow-2xl"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        </div>

        {/* Ambient Overlays */}
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-rose-500/[0.04] dark:bg-rose-500/[0.015] blur-[100px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-16 w-56 h-56 rounded-full bg-blue-500/[0.03] dark:bg-blue-500/[0.01] blur-[80px] pointer-events-none" />
      </div>

      {/* Main Container Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full">

        {/* Card Module: Focus Session */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[30px] p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner">
                <IconClockPlay className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 dark:text-neutral-200">Focus Session</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all ${
              pomodoroTimerState === 'running'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : pomodoroTimerState === 'paused'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 border-transparent'
            }`}>
              {pomodoroTimerState === 'running' ? 'Active' : pomodoroTimerState === 'paused' ? 'Paused' : 'Idle'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6 w-full">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 absolute top-0 left-0" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="5" className="text-neutral-100 dark:text-neutral-800/50" />
                <circle
                  cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="5"
                  strokeLinecap="round"
                  className={pomodoroTimerState !== 'idle' ? 'text-emerald-500' : 'text-neutral-300 dark:text-neutral-700'}
                  strokeDasharray={`${timerCircumference}`}
                  strokeDashoffset={`${timerCircumference * (1 - pomodoroProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="text-[32px] font-bold text-neutral-900 dark:text-neutral-50 font-mono tracking-tight leading-none z-10">
                {formatTime(pomodoroSecondsLeft)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium mt-4 tracking-wide">Deep Focus Mode Active</p>
          </div>

          <div className="flex gap-2.5 w-full mt-auto">
            {pomodoroTimerState === 'running' ? (
              <button onClick={pauseGlobalPomodoro}
                className="flex-1 h-11 flex items-center justify-center gap-2 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm">
                <IconPlayerPause className="w-4 h-4 fill-white stroke-[1.5]" /> Pause
              </button>
            ) : (
              <button onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                className="flex-1 h-11 flex items-center justify-center gap-2 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm">
                <IconPlayerPlay className="w-4 h-4 fill-white stroke-[1.5]" />
                {pomodoroTimerState === 'paused' ? 'Resume' : 'Start Focus'}
              </button>
            )}
            <button onClick={stopGlobalPomodoro} disabled={pomodoroTimerState === 'idle'} title="Reset Timer"
              className="w-11 h-11 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/40 text-neutral-500 dark:text-neutral-400 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shrink-0 active:scale-[0.95]">
              <IconRefresh className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Card Module: Today's Tasks */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[30px] p-6 flex flex-col gap-4 shadow-sm w-full">
          <div className="flex items-center justify-between w-full shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/10 shadow-inner">
                <IconChecklist className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 dark:text-neutral-200">Today's Tasks</span>
            </div>
            <button onClick={() => setActiveModule('todo')}
              className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer transition-colors">
              View all <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col gap-2 w-full shrink-0 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-200/30 dark:border-neutral-800/40 rounded-2xl p-3">
            <div className="flex justify-between items-center text-xs mb-0.5">
              <span className="font-bold text-neutral-800 dark:text-neutral-200">Daily Progress</span>
              <span className="font-bold text-neutral-400 font-mono text-[11px]">{completedTasksCount}/{totalTasks} done</span>
            </div>
            <div className="w-full h-2 bg-neutral-200/50 dark:bg-neutral-800/60 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2 w-full shrink-0">
            <input
              type="text"
              placeholder="Add a fast task…"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-0 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl px-4 h-10 text-xs font-medium focus:outline-none focus:border-rose-500/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 transition-all"
            />
            <button type="submit" disabled={!newTaskTitle.trim()}
              className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shrink-0 active:scale-95">
              <IconPlus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-none w-full min-h-[160px]">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
                <span className="text-xl">🎉</span>
                <p className="text-xs text-neutral-400 font-bold tracking-tight italic text-center">All clear for today!</p>
              </div>
            ) : (
              visibleTasks.map(task => (
                <button key={task.id} onClick={() => updateTodoTask(task.id, { completed: !task.completed })}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/10 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 border border-neutral-200/20 dark:border-neutral-800/10 text-left transition-all w-full group cursor-pointer">
                  <div className={`w-4.5 h-4.5 rounded-full border-[2px] flex items-center justify-center shrink-0 transition-all ${
                    task.completed ? 'bg-rose-500 border-rose-500 scale-95' : 'border-neutral-300 dark:border-neutral-700 group-hover:border-rose-500'
                  }`}>
                    {task.completed && <IconCheck className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-semibold truncate flex-1 ${
                    task.completed ? 'line-through text-neutral-400 dark:text-neutral-500 font-normal' : 'text-neutral-800 dark:text-neutral-200'
                  }`}>{task.title}</span>
                  <span className="text-[10px] font-bold text-neutral-400 bg-neutral-200/40 dark:bg-neutral-800/40 px-2 py-0.5 rounded-md shrink-0 tracking-tight">Today</span>
                </button>
              ))
            )}
          </div>

          {todayTasks.length > 3 && (
            <button onClick={() => setShowAllTasks(!showAllTasks)}
              className="flex items-center justify-center gap-1 h-9 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all cursor-pointer shrink-0 bg-neutral-50 dark:bg-neutral-950/30 rounded-xl w-full border border-neutral-200/40 dark:border-neutral-800/30">
              {showAllTasks ? 'Show less' : 'Show more'} <IconChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAllTasks ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Card Module: Mindmaps */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[30px] p-6 flex flex-col gap-4 shadow-sm w-full">
          <div className="flex items-center justify-between w-full shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10 shadow-inner">
                <IconSitemap className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 dark:text-neutral-200">Mindmaps</span>
            </div>
            <button onClick={handleCreateMindmap}
              className="flex items-center gap-1 h-7 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400 tracking-tight cursor-pointer transition-all active:scale-95">
              <IconPlus className="w-3 h-3 stroke-[2.5]" /> Create
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-none w-full min-h-[160px]">
            {mindmaps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400/40">
                  <IconSitemap className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="text-xs text-neutral-400 font-medium text-center leading-normal italic">No nodes configured yet.</p>
              </div>
            ) : (
              mindmaps.slice(0, 4).map(m => (
                <div key={m.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-50/30 dark:bg-neutral-950/10 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 border border-transparent hover:border-neutral-200/20 dark:hover:border-neutral-700/20 transition-all w-full group">
                  <button onClick={() => handleOpenMindmap(m.id)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/5 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/10">
                      <IconSitemap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200 truncate">{m.title}</p>
                      <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
                        {m.nodes.length} nodes • {relativeTime(m.updatedAt || m.createdAt)}
                      </span>
                    </div>
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0">
                    <IconDots className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
              ))
            )}
          </div>

          {mindmaps.length > 0 && (
            <button onClick={() => setActiveModule('mindmap')}
              className="w-full h-11 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/50 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 active:scale-[0.98]">
              Manage Mindmaps <IconExternalLink className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}
        </div>

      </div>

      {/* Analytics Insights Dashboard Row */}
      <div className="flex flex-col gap-4 w-full mt-4">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Your Insights</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {/* Insight 1: Focus Hours */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] p-5 flex flex-col gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
              <IconClockPlay className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono tracking-tight leading-none">{focusTimeLabel}</p>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block mt-2">Focus Time</span>
            </div>
          </div>

          {/* Insight 2: Tasks Done */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] p-5 flex flex-col gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/10">
              <IconCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono tracking-tight leading-none">{completedTasksCount}</p>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block mt-2">Completed Tasks</span>
            </div>
          </div>

          {/* Insight 3: Mindmaps Total */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] p-5 flex flex-col gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
              <IconSitemap className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono tracking-tight leading-none">{mindmaps.length}</p>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block mt-2">Mindmaps Built</span>
            </div>
          </div>

          {/* Insight 4: Focus Streak */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] p-5 flex flex-col gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
              <IconFlame className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono tracking-tight leading-none">{pomodoroStreak} d</p>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block mt-2">Focus Streak</span>
            </div>
          </div>

          {/* Insight 5: Translucent Micro Calendar Panel */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/50 rounded-[24px] p-4.5 flex flex-col gap-3 shadow-sm col-span-2 md:col-span-4 lg:col-span-1 w-full justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <IconCalendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-[10px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide truncate">{currentMonthYear}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button className="w-5 h-5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center cursor-pointer text-neutral-400 hover:text-neutral-900 transition-colors">
                  <IconChevronLeft className="w-3 h-3" />
                </button>
                <button className="w-5 h-5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center cursor-pointer text-neutral-400 hover:text-neutral-900 transition-colors">
                  <IconChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 w-full text-center mt-1">
              {weekDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-extrabold text-neutral-400 uppercase">{day.label}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                    day.isToday
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}>
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}