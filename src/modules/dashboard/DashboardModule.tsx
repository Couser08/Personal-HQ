import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconChecklist, IconClockPlay, IconSitemap, 
  IconPlus, IconPlayerPlay, IconPlayerPause, IconRefresh
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
    addMindmap
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
    addMindmap: state.addMindmap
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

  const handleCreateMindmap = () => {
    const newId = crypto.randomUUID();
    addMindmap({
      id: newId,
      title: 'New Workspace Map',
      nodes: [
        { id: 'root', text: 'Central Idea', x: 450, y: 250, color: 'blue', isRoot: true }
      ],
      links: [],
      createdAt: new Date().toISOString()
    });
    setActiveModule('mindmap');
  };

  const activeTasks = todoTasks.filter(t => !t.completed && !t.deleted).slice(0, 4);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 text-left">
      {/* Header Greeting Banner with transparent background */}
      <div className="relative overflow-hidden bg-transparent border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center h-auto md:h-[200px] gap-6">
        <div className="max-w-xl text-left">
          <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Welcome to Personal HQ</span>
          <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight mt-2 leading-tight">
            Focus on what matters.
          </h1>
          <p className="text-text-secondary text-xs mt-2 leading-relaxed">
            Your unified workspace for brainstorming, focusing on deep sessions, and managing tasks. No clutter, just utility.
          </p>
        </div>
        
        {/* Character Image - Transparent background */}
        <div className="w-[160px] h-[160px] md:w-[180px] md:h-[180px] select-none pointer-events-none shrink-0 flex items-center justify-center">
          <img 
            src="/study_illustration.png" 
            alt="Study 3D Illustration" 
            className="w-full h-full object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Mini Pomodoro Widget */}
        <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
          <div className="flex items-center justify-between pb-3 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <IconClockPlay className="w-4.5 h-4.5 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Focus Session</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {pomodoroSessionId === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <span className="text-5xl font-light tracking-tighter text-text-primary font-mono leading-none">
              {formatTime(pomodoroSecondsLeft)}
            </span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2">
              {pomodoroTimerState === 'running' ? 'Running' : pomodoroTimerState === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>

          <div className="flex gap-2 shrink-0">
            {pomodoroTimerState === 'running' ? (
              <button
                onClick={pauseGlobalPomodoro}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-text-secondary rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer border border-border/40"
              >
                <IconPlayerPause className="w-3.5 h-3.5" /> Pause
              </button>
            ) : (
              <button
                onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                <IconPlayerPlay className="w-3.5 h-3.5" /> {pomodoroTimerState === 'paused' ? 'Resume' : 'Start'}
              </button>
            )}

            <button
              onClick={stopGlobalPomodoro}
              disabled={pomodoroTimerState === 'idle'}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-text-muted rounded-xl transition-colors cursor-pointer border border-border/40 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reset Timer"
            >
              <IconRefresh className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Quick Task Viewer & Adder */}
        <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
          <div className="flex items-center justify-between pb-3 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <IconChecklist className="w-4.5 h-4.5 text-rose-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Quick Tasks</span>
            </div>
            <button 
              onClick={() => setActiveModule('todo')}
              className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest cursor-pointer"
            >
              All Tasks
            </button>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2 mt-3 shrink-0">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-surface-alt border border-border/50 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-rose-500/50 text-text-primary placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="w-8 h-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-sm shadow-rose-500/10 shrink-0"
            >
              <IconPlus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto my-3 pr-1">
            {activeTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted italic flex items-center justify-center h-full">
                No active tasks.
              </div>
            ) : (
              activeTasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-2.5 bg-surface-alt/40 border border-border/20 rounded-xl shadow-inner group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input 
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => updateTodoTask(task.id, { completed: !task.completed })}
                      className="w-4 h-4 rounded-full border-border bg-transparent text-rose-500 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {task.title}
                    </span>
                  </div>
                  {task.priority && task.priority !== 'none' && (
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                      task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Mini Mindmap Widget */}
        <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px] md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <IconSitemap className="w-4.5 h-4.5 text-purple-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Recent Mindmaps</span>
            </div>
            <button 
              onClick={handleCreateMindmap}
              className="text-[9px] font-black text-purple-500 hover:text-purple-600 uppercase tracking-widest cursor-pointer"
            >
              New Map
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto my-3 pr-1">
            {mindmaps.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted italic flex items-center justify-center h-full">
                No mindmaps saved yet.
              </div>
            ) : (
              mindmaps.slice(0, 3).map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setActiveModule('mindmap')}
                  className="flex items-center gap-3 p-3 bg-surface-alt/45 hover:bg-stone-50 dark:hover:bg-stone-850 border border-border/40 hover:border-purple-500/25 rounded-2xl shadow-sm cursor-pointer transition-all hover:scale-[1.01] hover:shadow group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/5 group-hover:bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/5 transition-colors">
                    <IconSitemap className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <h4 className="text-xs font-bold text-text-primary truncate">{m.title}</h4>
                    <span className="text-[9px] text-text-muted mt-0.5 block font-bold uppercase">{m.nodes.length} Nodes</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setActiveModule('mindmap')}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-text-secondary rounded-xl text-center text-[9px] font-black uppercase tracking-wider transition-colors border border-border/40 shrink-0 cursor-pointer"
          >
            Open Mindmap Canvas
          </button>
        </div>

      </div>
    </div>
  );
}
