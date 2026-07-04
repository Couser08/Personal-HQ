import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconChecklist, IconClockPlay, IconSitemap, 
  IconPlus, IconPlayerPlay, IconPlayerPause, IconRefresh,
  IconCheck, IconArrowRight
} from '@tabler/icons-react';

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
  })));

  const [newTaskTitle, setNewTaskTitle] = useState('');

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
    // Signal MindmapModule to open this specific map on mount
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

  const activeTasks = todoTasks.filter(t => !t.completed && !(t as any).deleted).slice(0, 5);
  const totalTasks = todoTasks.filter(t => !(t as any).deleted).length;
  const completedTasks = todoTasks.filter(t => t.completed && !(t as any).deleted).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const focusDuration = 1500;
  const breakDuration = 300;
  const pomodoroProgress = pomodoroSessionId === 'focus'
    ? ((focusDuration - pomodoroSecondsLeft) / focusDuration) * 100
    : ((breakDuration - pomodoroSecondsLeft) / breakDuration) * 100;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto pb-16 text-left">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-surface shadow-sm flex flex-col md:flex-row items-center justify-between px-8 py-7 gap-6 min-h-[148px]">
        <div className="flex flex-col gap-1 text-left z-10">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.18em]">
            {greeting}
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

      {/* ── Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Pomodoro */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 flex flex-col gap-4 shadow-sm h-[280px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <IconClockPlay className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">Focus</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              pomodoroTimerState === 'running'
                ? 'bg-green-500/8 text-green-500 border-green-500/20'
                : pomodoroTimerState === 'paused'
                  ? 'bg-amber-500/8 text-amber-500 border-amber-500/20'
                  : 'bg-stone-500/8 text-text-muted border-border/30'
            }`}>
              {pomodoroTimerState === 'running' ? 'Active' : pomodoroTimerState === 'paused' ? 'Paused' : pomodoroSessionId === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-[88px] h-[88px]">
              <svg className="w-[88px] h-[88px] -rotate-90" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="38" fill="none" stroke="currentColor" strokeWidth="5" className="text-border/20" />
                <circle
                  cx="44" cy="44" r="38" fill="none" stroke="currentColor" strokeWidth="5"
                  strokeLinecap="round"
                  className={pomodoroTimerState !== 'idle' ? 'text-amber-500' : 'text-border/30'}
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - pomodoroProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[15px] font-black text-text-primary font-mono tracking-tight">
                {formatTime(pomodoroSecondsLeft)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {pomodoroTimerState === 'running' ? (
              <button onClick={pauseGlobalPomodoro}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-text-secondary rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border border-border/30">
                <IconPlayerPause className="w-3.5 h-3.5" /> Pause
              </button>
            ) : (
              <button onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm shadow-amber-500/20">
                <IconPlayerPlay className="w-3.5 h-3.5" />
                {pomodoroTimerState === 'paused' ? 'Resume' : 'Start'}
              </button>
            )}
            <button onClick={stopGlobalPomodoro} disabled={pomodoroTimerState === 'idle'} title="Reset"
              className="w-9 h-9 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-text-muted flex items-center justify-center transition-colors border border-border/30 disabled:opacity-30 cursor-pointer shrink-0">
              <IconRefresh className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Tasks */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 flex flex-col gap-3 shadow-sm h-[280px]">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <IconChecklist className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">Tasks</span>
            </div>
            <button onClick={() => setActiveModule('todo')}
              className="flex items-center gap-1 text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest cursor-pointer transition-colors">
              All <IconArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {totalTasks > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex-1 h-1 bg-border/25 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-[9px] font-black text-text-muted tabular-nums">{progressPct}%</span>
            </div>
          )}

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
            {activeTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[11px] text-text-muted italic font-medium text-center">All tasks complete 🎉</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <button key={task.id} onClick={() => updateTodoTask(task.id, { completed: !task.completed })}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-surface-alt text-left transition-colors w-full group cursor-pointer">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.completed ? 'bg-rose-500 border-rose-500' : 'border-border/60 group-hover:border-rose-400'
                  }`}>
                    {task.completed && <IconCheck className="w-2 h-2 text-white" />}
                  </div>
                  <span className="text-[11px] font-medium text-text-primary truncate flex-1">{task.title}</span>
                  {task.priority !== 'none' && (
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'high' ? 'text-rose-500 bg-rose-500/10' :
                      task.priority === 'medium' ? 'text-amber-500 bg-amber-500/10' :
                      'text-blue-500 bg-blue-500/10'
                    }`}>{task.priority}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Mindmaps */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 flex flex-col gap-3 shadow-sm h-[280px]">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <IconSitemap className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">Mindmaps</span>
            </div>
            <button onClick={handleCreateMindmap}
              className="flex items-center gap-1 text-[9px] font-black text-purple-500 hover:text-purple-400 uppercase tracking-widest cursor-pointer transition-colors">
              New <IconPlus className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-none">
            {mindmaps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center">
                  <IconSitemap className="w-6 h-6 text-purple-400/40" />
                </div>
                <p className="text-[11px] text-text-muted italic font-medium text-center">No mindmaps yet.<br/>Create your first one!</p>
              </div>
            ) : (
              mindmaps.slice(0, 4).map(m => (
                <button key={m.id} onClick={() => handleOpenMindmap(m.id)}
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl hover:bg-purple-500/5 border border-transparent hover:border-purple-500/15 text-left transition-all w-full cursor-pointer group">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/8 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/10">
                    <IconSitemap className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[11px] font-bold text-text-primary truncate">{m.title}</p>
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{m.nodes.length} nodes</span>
                  </div>
                  <IconArrowRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                </button>
              ))
            )}
          </div>

          {mindmaps.length > 0 && (
            <button onClick={() => setActiveModule('mindmap')}
              className="w-full py-2 bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200 dark:hover:bg-stone-800 text-text-muted rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors border border-border/30 cursor-pointer shrink-0">
              Open Canvas
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
