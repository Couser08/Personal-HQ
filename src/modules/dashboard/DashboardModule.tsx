import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../../lib/supabase';
import {
  IconChecklist, IconClockPlay, IconSitemap,
  IconPlus, IconPlayerPlay, IconPlayerPause, IconRefresh,
  IconCheck, IconArrowRight, IconFlame, IconCalendar,
  IconChevronDown, IconRocket, IconLayoutList
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
    pomodoroStats,
    pomodoroStreak,
    habits,
    toggleHabitCompletion,
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
    habits: state.habits,
    toggleHabitCompletion: state.toggleHabitCompletion,
  })));

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [illustrationUrl, setIllustrationUrl] = useState('');

  const loadIllustration = () => {
    const publicUrl = supabase.storage.from('avatars').getPublicUrl('global/dashboard_illustration.png').data.publicUrl;
    setIllustrationUrl(`${publicUrl}?t=${Date.now()}`);
  };

  useEffect(() => {
    loadIllustration();
    const handleUpdate = () => {
      loadIllustration();
    };
    window.addEventListener('dashboard-illustration-updated', handleUpdate);
    return () => {
      window.removeEventListener('dashboard-illustration-updated', handleUpdate);
    };
  }, []);

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
  const visibleTasks = showAllTasks ? todayTasks : todayTasks.slice(0, 4);

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

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayDayOfWeek = useMemo(() => new Date().getDay(), []);

  const isHabitDueToday = (habit: any) => {
    if (habit.frequencyType === 'daily') return true;
    if (habit.frequencyType === 'weekly_days') {
      return habit.frequencyDays.includes(todayDayOfWeek);
    }
    if (habit.frequencyType === 'weekly_count') {
      const now = new Date();
      const currentDay = now.getDay();
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + distanceToMon);
      monday.setHours(0, 0, 0, 0);

      const completionsThisWeek = habit.completedDates.filter((dateStr: string) => {
        const d = new Date(dateStr);
        return d >= monday;
      }).length;

      return completionsThisWeek < habit.frequencyCount;
    }
    return true;
  };

  const dueHabits = useMemo(() => {
    return habits.filter(isHabitDueToday);
  }, [habits, todayDayOfWeek]);

  const completedTodayCount = useMemo(() => {
    return dueHabits.filter(h => h.completedDates.includes(todayStr)).length;
  }, [dueHabits, todayStr]);



  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col w-full max-w-6xl gap-6 px-4 pb-24 mx-auto antialiased text-left md:px-8">
      
      {/* Redesigned Minimal & Premium Header */}
      <div className="flex flex-col justify-between gap-4 mt-2 md:flex-row md:items-center">
        <div>
          <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none">{greeting} 👋</span>
          <h1 className="text-2xl font-black text-text-primary tracking-tight mt-1.5">Welcome to command center</h1>
        </div>
        
        {/* Micro Calendar Widget nested in header */}
        <div className="bg-surface border border-border/50 rounded-2xl p-3 flex items-center gap-4 shadow-sm max-w-[280px]">
          <div className="flex items-center min-w-0 gap-2">
            <IconCalendar className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider truncate">{currentMonthYear}</span>
          </div>
          <div className="grid flex-1 grid-cols-7 gap-1">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-extrabold text-text-muted uppercase leading-none">{day.label}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono transition-all ${
                  day.isToday ? 'bg-rose-500 text-white shadow-sm' : 'text-text-secondary'
                }`}>
                  {day.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redesigned Premium Glassmorphic Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] border border-border/50 bg-surface/30 backdrop-blur-md shadow-sm grid grid-cols-12 items-center p-8 md:p-10 lg:p-12 gap-6 min-h-[340px]">
        <div className="z-10 flex flex-col w-full col-span-12 gap-2 text-left lg:col-span-7 animate-fade-in">
          <h2 className="text-3xl font-black leading-tight tracking-tight md:text-4xl text-text-primary">
            Focus on<br />what matters<span className="text-rose-500">.</span>
          </h2>
          <p className="w-full mt-3 text-xs font-medium leading-relaxed text-text-secondary">
            Brainstorm structural concepts, lock deep sessions, and tracking goals smoothly — all inside your unified developer command center.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-5">
            <button 
              onClick={() => {
                if (pomodoroTimerState !== 'running') {
                  if (pomodoroTimerState === 'paused') {
                    resumeGlobalPomodoro();
                  } else {
                    startGlobalPomodoro();
                  }
                }
                setActiveModule('pomodoro');
              }}
              className="flex items-center h-10 gap-2 px-5 text-xs font-bold text-white transition-all shadow-sm cursor-pointer bg-rose-500 hover:bg-rose-600 rounded-xl active:scale-95"
            >
              <IconRocket className="w-4 h-4" /> Start Focus Session
            </button>
            <button 
              onClick={() => setActiveModule('todo')}
              className="flex items-center h-10 gap-2 px-5 text-xs font-bold transition-all border cursor-pointer bg-surface border-border hover:bg-surface-hover text-text-primary rounded-xl active:scale-95"
            >
              <IconLayoutList className="w-4 h-4 text-text-secondary" /> View My Tasks
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-1.5 text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Today's Plan</span>
            <div className="flex items-center justify-between px-4 py-2.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 rounded-xl w-60">
              <span className="text-xs font-bold text-text-primary">{todayTasks.length} tasks scheduled</span>
              <div className="w-4.5 h-4.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                <IconCheck className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 flex justify-center w-full col-span-12 mt-6 pointer-events-none select-none lg:col-span-5 lg:justify-end lg:mt-0 shrink-0">
          <img
            src={illustrationUrl || '/study_illustration.png'}
            alt="Hero Illustration"
            className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-none lg:h-64 object-contain filter drop-shadow-xl"
            onError={(e) => {
              if (illustrationUrl && illustrationUrl !== '/study_illustration.png') {
                setIllustrationUrl('/study_illustration.png');
              } else {
                e.currentTarget.style.display = 'none';
              }
            }}
          />
        </div>

        {/* Premium ambient glows */}
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-rose-500/[0.04] blur-[100px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-16 w-56 h-56 rounded-full bg-blue-500/[0.03] blur-[80px] pointer-events-none" />
      </div>

      {/* Redesigned KPI metrics summary bar */}
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="bg-surface border border-border/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="flex items-center justify-center border w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border-emerald-500/10 shrink-0">
            <IconClockPlay className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-text-muted">Focus Time</p>
            <p className="text-lg font-black text-text-primary font-mono tracking-tight mt-0.5">{focusTimeLabel}</p>
          </div>
        </div>

        <div className="bg-surface border border-border/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="flex items-center justify-center border w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border-rose-500/10 shrink-0">
            <IconCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-text-muted">Tasks Ratio</p>
            <p className="text-lg font-black text-text-primary font-mono tracking-tight mt-0.5">{completedTasksCount}/{totalTasks}</p>
          </div>
        </div>

        <div className="bg-surface border border-border/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="flex items-center justify-center text-orange-500 border w-9 h-9 rounded-xl bg-orange-500/10 border-orange-500/10 shrink-0">
            <IconFlame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-text-muted">Consistency</p>
            <p className="text-lg font-black text-text-primary font-mono tracking-tight mt-0.5">{completedTodayCount}/{dueHabits.length} habits</p>
          </div>
        </div>

        <div className="bg-surface border border-border/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="flex items-center justify-center text-purple-500 border w-9 h-9 rounded-xl bg-purple-500/10 border-purple-500/10 shrink-0">
            <IconSitemap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-text-muted">Focus Streak</p>
            <p className="text-lg font-black text-text-primary font-mono tracking-tight mt-0.5">{pomodoroStreak} days</p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid items-start w-full grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Column 1: Focus Control Dock */}
        <div className="bg-surface border border-border/50 rounded-3xl p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden h-full min-h-[380px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-emerald-500/10 text-emerald-500 border-emerald-500/10">
                <IconClockPlay className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase text-text-primary">Focus Session</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border transition-all ${
              pomodoroTimerState === 'running'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : pomodoroTimerState === 'paused'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-surface-alt text-text-muted border-border/50'
            }`}>
              {pomodoroTimerState === 'running' ? 'Active' : pomodoroTimerState === 'paused' ? 'Paused' : 'Idle'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 py-4">
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="4.5" className="text-border/40" />
                <circle
                  cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="4.5"
                  strokeLinecap="round"
                  className={pomodoroTimerState !== 'idle' ? 'text-emerald-500' : 'text-text-muted/40'}
                  strokeDasharray={`${timerCircumference}`}
                  strokeDashoffset={`${timerCircumference * (1 - pomodoroProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="text-[28px] font-black text-text-primary font-mono tracking-tight leading-none z-10">
                {formatTime(pomodoroSecondsLeft)}
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase mt-4">Deep focus active</p>
          </div>

          <div className="flex w-full gap-2 mt-auto">
            {pomodoroTimerState === 'running' ? (
              <button onClick={pauseGlobalPomodoro}
                className="flex-grow h-10 flex items-center justify-center gap-1.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm">
                <IconPlayerPause className="w-3.5 h-3.5 fill-white" /> Pause
              </button>
            ) : (
              <button onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                className="flex-grow h-10 flex items-center justify-center gap-1.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm">
                <IconPlayerPlay className="w-3.5 h-3.5 fill-white" />
                {pomodoroTimerState === 'paused' ? 'Resume' : 'Start Focus'}
              </button>
            )}
            <button onClick={stopGlobalPomodoro} disabled={pomodoroTimerState === 'idle'} title="Reset Timer"
              className="flex items-center justify-center w-10 h-10 transition-all border cursor-pointer rounded-xl bg-surface-alt hover:bg-surface-hover border-border text-text-secondary disabled:opacity-30 shrink-0 active:scale-95">
              <IconRefresh className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 2: Today's Tasks */}
        <div className="bg-surface border border-border/50 rounded-3xl p-6 flex flex-col gap-4 shadow-sm h-full min-h-[380px]">
          <div className="flex items-center justify-between w-full shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-rose-500/10 text-rose-500 border-rose-500/10">
                <IconChecklist className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase text-text-primary">Today's Tasks</span>
            </div>
            <button onClick={() => setActiveModule('todo')}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer transition-colors">
              View all <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          <form onSubmit={handleAddTask} className="flex w-full gap-2 shrink-0">
            <input
              type="text"
              placeholder="Add a fast task…"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-0 bg-surface-alt border border-border/80 rounded-xl px-3.5 h-9 text-xs font-medium focus:outline-none focus:border-rose-500/50 text-text-primary placeholder:text-text-muted transition-all"
            />
            <button type="submit" disabled={!newTaskTitle.trim()}
              className="flex items-center justify-center text-white transition-all cursor-pointer w-9 h-9 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-30 shrink-0 active:scale-95">
              <IconPlus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-none w-full max-h-[220px]">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-1.5 py-6">
                <span className="text-lg">🎉</span>
                <p className="text-[11px] text-text-muted font-bold tracking-tight italic text-center">All clear for today!</p>
              </div>
            ) : (
              visibleTasks.map(task => (
                <button key={task.id} onClick={() => updateTodoTask(task.id, { completed: !task.completed })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-alt/45 hover:bg-surface-alt border border-border/20 text-left transition-all w-full group cursor-pointer">
                  <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                    task.completed ? 'bg-rose-500 border-rose-500 scale-90' : 'border-border group-hover:border-rose-500'
                  }`}>
                    {task.completed && <IconCheck className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-semibold truncate flex-1 ${
                    task.completed ? 'line-through text-text-muted font-normal' : 'text-text-primary'
                  }`}>{task.title}</span>
                </button>
              ))
            )}
          </div>

          {todayTasks.length > 4 && (
            <button onClick={() => setShowAllTasks(!showAllTasks)}
              className="flex items-center justify-center gap-1 h-8 text-[11px] font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer shrink-0 bg-surface-alt/50 rounded-xl w-full border border-border/40">
              {showAllTasks ? 'Show less' : 'Show more'} <IconChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllTasks ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Column 3: Habits & Mindmaps */}
        <div className="flex flex-col w-full h-full gap-6">
          
          {/* Habits Mini widget */}
          <div className="flex flex-col w-full gap-4 p-5 border shadow-sm bg-surface border-border/50 rounded-3xl">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center text-orange-500 border rounded-lg w-7 h-7 bg-orange-500/10 border-orange-500/10">
                  <IconFlame className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-text-primary">Daily Habits</span>
              </div>
              <button onClick={() => setActiveModule('habits')}
                className="text-[11px] font-bold text-orange-500 hover:text-orange-600 cursor-pointer">
                Manage
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {dueHabits.slice(0, 2).map(habit => {
                const isCompleted = habit.completedDates.includes(todayStr);
                return (
                  <button key={habit.id} onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                    className="flex items-center w-full gap-3 px-3 py-2 text-left transition-all border cursor-pointer rounded-xl bg-surface-alt/45 hover:bg-surface-alt border-border/20 group">
                    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                      isCompleted ? 'bg-orange-500 border-orange-500 scale-90' : 'border-border group-hover:border-orange-500'
                    }`}>
                      {isCompleted && <IconCheck className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                    <span className={`text-xs font-semibold truncate flex-1 ${
                      isCompleted ? 'line-through text-text-muted font-normal' : 'text-text-primary'
                    }`}>{habit.name}</span>
                  </button>
                );
              })}
              {dueHabits.length === 0 && (
                <p className="text-[11px] text-text-muted italic py-1">No habits due today.</p>
              )}
            </div>
          </div>

          {/* Mindmaps Mini widget */}
          <div className="flex flex-col flex-grow w-full gap-4 p-5 border shadow-sm bg-surface border-border/50 rounded-3xl">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center text-purple-500 border rounded-lg w-7 h-7 bg-purple-500/10 border-purple-500/10">
                  <IconSitemap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-text-primary">Mindmaps</span>
              </div>
              <button onClick={handleCreateMindmap}
                className="text-[11px] font-bold text-purple-500 hover:text-purple-600 flex items-center gap-0.5 cursor-pointer">
                <IconPlus size={10} /> Create
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] pr-1">
              {mindmaps.slice(0, 2).map(m => (
                <button key={m.id} onClick={() => handleOpenMindmap(m.id)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-alt/45 hover:bg-surface-alt border border-border/20 text-left transition-all w-full cursor-pointer">
                  <div className="flex items-center justify-center text-purple-500 border rounded-lg w-7 h-7 bg-purple-500/5 shrink-0 border-purple-500/10">
                    <IconSitemap className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold leading-none truncate text-text-primary">{m.title}</p>
                    <span className="text-[9px] text-text-muted font-bold block mt-1">
                      {m.nodes.length} nodes
                    </span>
                  </div>
                </button>
              ))}
              {mindmaps.length === 0 && (
                <p className="text-[11px] text-text-muted italic py-1">No mindmaps yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}