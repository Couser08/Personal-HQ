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
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto pb-16 text-left">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-surface shadow-sm flex flex-col md:flex-row items-center justify-between px-8 py-7 gap-6 min-h-[148px]">
        <div className="flex flex-col gap-1 text-left z-10">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.18em]">
            {greeting} 👋
          </span>
          <h1 className="text-[28px] md:text-[32px] font-black leading-none tracking-tight text-text-primary mt-1">
            Focus on what matters<span className="text-rose-500">.</span>
          </h1>
          <p className="text-[12px] text-text-muted mt-2 leading-relaxed font-medium">
            Brainstorm, focus, and execute — all in one place.
          </p>
        </div>
        <div className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] shrink-0 select-none pointer-events-none z-10">
          <img
            src="/study_illustration.png"
            alt="Study illustration"
            className="w-full h-full object-contain"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        </div>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Focus Session */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <IconClockPlay className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">Focus Session</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              pomodoroTimerState === 'running'
                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                : pomodoroTimerState === 'paused'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-stone-500/8 text-text-muted border-border/30'
            }`}>
              {pomodoroTimerState === 'running' ? 'In Progress' : pomodoroTimerState === 'paused' ? 'Paused' : 'Idle'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-3">
            <div className="relative w-[120px] h-[120px]">
              <svg className="w-[120px] h-[120px] -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="8" className="text-border/20" />
                <circle
                  cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="8"
                  strokeLinecap="round"
                  className={pomodoroTimerState !== 'idle' ? 'text-emerald-500' : 'text-border/30'}
                  strokeDasharray={`${timerCircumference}`}
                  strokeDashoffset={`${timerCircumference * (1 - pomodoroProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[20px] font-black text-text-primary font-mono tracking-tight">
                {formatTime(pomodoroSecondsLeft)}
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-medium mt-2 tracking-wide">Deep Focus • No Distractions</p>
          </div>

          <div className="flex gap-2 shrink-0">
            {pomodoroTimerState === 'running' ? (
              <button onClick={pauseGlobalPomodoro}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm shadow-rose-500/20">
                <IconPlayerPause className="w-3.5 h-3.5" /> Pause
              </button>
            ) : (
              <button onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm shadow-rose-500/20">
                <IconPlayerPlay className="w-3.5 h-3.5" />
                {pomodoroTimerState === 'paused' ? 'Resume Session' : 'Start Session'}
              </button>
            )}
            <button onClick={stopGlobalPomodoro} disabled={pomodoroTimerState === 'idle'} title="Reset"
              className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-text-muted flex items-center justify-center transition-colors border border-border/30 disabled:opacity-30 cursor-pointer shrink-0">
              <IconRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <IconChecklist className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">Today's Tasks</span>
            </div>
            <button onClick={() => setActiveModule('todo')}
              className="flex items-center gap-1 text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest cursor-pointer transition-colors">
              View all <IconArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-bold text-text-secondary">{completedTasksCount} of {totalTasks} tasks</span>
            <div className="flex-1 h-1.5 bg-border/25 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-1.5 shrink-0">
            <input
              type="text"
              placeholder="Add a task…"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-0 bg-surface-alt border border-border/40 rounded-2xl px-3 py-1.5 text-[11px] font-medium focus:outline-none focus:border-rose-500/50 text-text-primary placeholder:text-text-muted"
            />
            <button type="submit" disabled={!newTaskTitle.trim()}
              className="w-8 h-8 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer shrink-0">
              <IconPlus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
            {todayTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[11px] text-text-muted italic font-medium text-center">All tasks complete 🎉</p>
              </div>
            ) : (
              visibleTasks.map(task => (
                <button key={task.id} onClick={() => updateTodoTask(task.id, { completed: !task.completed })}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-surface-alt text-left transition-colors w-full group cursor-pointer">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.completed ? 'bg-rose-500 border-rose-500' : 'border-border/60 group-hover:border-rose-400'
                  }`}>
                    {task.completed && <IconCheck className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-[11px] font-medium truncate flex-1 ${
                    task.completed ? 'line-through text-text-muted' : 'text-text-primary'
                  }`}>{task.title}</span>
                  <span className="text-[9px] font-bold text-text-muted bg-surface-alt px-1.5 py-0.5 rounded-md shrink-0">Today</span>
                </button>
              ))
            )}
          </div>

          {todayTasks.length > 3 && (
            <button onClick={() => setShowAllTasks(!showAllTasks)}
              className="flex items-center justify-center gap-1 text-[10px] font-bold text-text-muted hover:text-text-secondary transition-colors cursor-pointer shrink-0 py-1">
              {showAllTasks ? 'Show less' : 'Show more'} <IconChevronDown className={`w-3 h-3 transition-transform ${showAllTasks ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Mindmaps */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <IconSitemap className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">Mindmaps</span>
            </div>
            <button onClick={handleCreateMindmap}
              className="flex items-center gap-1 text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest cursor-pointer transition-colors">
              New <IconPlus className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-none">
            {mindmaps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center">
                  <IconSitemap className="w-6 h-6 text-purple-400/40" />
                </div>
                <p className="text-[11px] text-text-muted italic font-medium text-center">No mindmaps yet.<br/>Create your first one!</p>
              </div>
            ) : (
              mindmaps.slice(0, 4).map(m => (
                <div key={m.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-2xl hover:bg-surface-alt text-left transition-all w-full group">
                  <button onClick={() => handleOpenMindmap(m.id)} className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/8 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/10">
                      <IconSitemap className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[11px] font-bold text-text-primary truncate">{m.title}</p>
                      <span className="text-[9px] text-text-muted font-medium">
                        {m.nodes.length} nodes • Edited {relativeTime(m.updatedAt || m.createdAt)}
                      </span>
                    </div>
                  </button>
                  <button className="w-6 h-6 rounded-lg hover:bg-surface-alt flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity cursor-pointer shrink-0">
                    <IconDots className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </div>
              ))
            )}
          </div>

          {mindmaps.length > 0 && (
            <button onClick={() => setActiveModule('mindmap')}
              className="w-full py-2.5 bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200 dark:hover:bg-stone-800 text-text-secondary rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors border border-border/30 cursor-pointer shrink-0 flex items-center justify-center gap-1.5">
              Open Mindmaps <IconExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>

      {/* Your Progress */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[13px] font-black uppercase tracking-widest text-text-primary">Your Progress</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Focus Time */}
          <div className="bg-surface border border-border/40 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <IconClockPlay className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[18px] font-black text-text-primary leading-tight">{focusTimeLabel}</p>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">This week</span>
          </div>

          {/* Tasks Completed */}
          <div className="bg-surface border border-border/40 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <IconCheck className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-[18px] font-black text-text-primary leading-tight">{completedTasksCount}</p>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">This week</span>
          </div>

          {/* Mindmaps Created */}
          <div className="bg-surface border border-border/40 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <IconSitemap className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-[18px] font-black text-text-primary leading-tight">{mindmaps.length}</p>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">This week</span>
          </div>

          {/* Current Streak */}
          <div className="bg-surface border border-border/40 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <IconFlame className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-[18px] font-black text-text-primary leading-tight">{pomodoroStreak} days</p>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Keep it up!</span>
          </div>

          {/* Mini Calendar */}
          <div className="bg-surface border border-border/40 rounded-3xl p-4 flex flex-col gap-2 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconCalendar className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{currentMonthYear}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button className="w-5 h-5 rounded-md hover:bg-surface-alt flex items-center justify-center cursor-pointer">
                  <IconChevronLeft className="w-3 h-3 text-text-muted" />
                </button>
                <button className="w-5 h-5 rounded-md hover:bg-surface-alt flex items-center justify-center cursor-pointer">
                  <IconChevronRight className="w-3 h-3 text-text-muted" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] font-bold text-text-muted uppercase">{day.label}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    day.isToday
                      ? 'bg-rose-500 text-white'
                      : 'text-text-secondary'
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
