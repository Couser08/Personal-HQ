import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import {
  IconChecklist, IconClockPlay, IconSitemap,
  IconPlus, IconPlayerPlay, IconPlayerPause, IconRefresh,
  IconCheck, IconArrowRight, IconFlame,
  IconRocket, IconLayoutList, IconTarget,
  IconFileText, IconNotes, IconCode, IconStar
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';

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
    activeFocusItem,
    setActiveFocusItem,
    journals,
    notes,
    snippets,
    tilLogs,
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
    activeFocusItem: state.activeFocusItem,
    setActiveFocusItem: state.setActiveFocusItem,
    journals: state.journals,
    notes: state.notes,
    snippets: state.snippets,
    tilLogs: state.tilLogs,
  })));

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = today

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

  const recentActivity = useMemo(() => {
    const activities: { id: string; title: string; type: string; date: string; icon: any; module: string; color: string }[] = [];
    
    todoTasks.filter(t => t.completed).forEach(t => {
      activities.push({ id: t.id, title: t.title, type: 'Completed Task', date: t.createdAt || new Date().toISOString(), icon: IconChecklist, module: 'todo', color: 'text-accent-success' });
    });
    
    journals.forEach(j => {
      activities.push({ id: j.id, title: j.title || 'Journal Entry', type: 'Journal', date: j.date, icon: IconFileText, module: 'journal', color: 'text-text-primary' });
    });
    
    notes.forEach(n => {
      activities.push({ id: n.id, title: n.title || 'Note', type: 'Note', date: n.updatedAt || n.createdAt, icon: IconNotes, module: 'markdown', color: 'text-text-primary' });
    });

    snippets.forEach(s => {
      activities.push({ id: s.id, title: s.title || 'Snippet', type: 'Snippet', date: s.updatedAt || s.createdAt || new Date().toISOString(), icon: IconCode, module: 'snippets', color: 'text-text-primary' });
    });

    (tilLogs || []).forEach(t => {
      activities.push({ id: t.id, title: t.title || 'TIL', type: 'TIL', date: t.createdAt, icon: IconStar, module: 'til', color: 'text-accent-highlight' });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [todoTasks, journals, notes, snippets, tilLogs]);

  const timerRadius = 48;
  const timerCircumference = 2 * Math.PI * timerRadius;

  // 7-day Week Strip
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun
    const startOfWeek = new Date(today);
    // Start on Monday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + distanceToMonday);

    const days: { dayName: string; dateNum: number; fullDate: Date; isToday: boolean }[] = [];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dayName: labels[i],
        dateNum: d.getDate(),
        fullDate: d,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 26,
      }
    }
  };

  return (
    <motion.div
      data-component="DashboardModule"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col w-full max-w-5xl gap-8 pb-24 mx-auto antialiased text-left"
    >
      {/* ── 1. Hero Greeting Banner (Minimal-Premium Floating Card) ── */}
      <motion.div variants={itemVariants}>
        <Card padding="lg" className="relative flex flex-col items-start justify-between gap-6 overflow-hidden md:flex-row md:items-center">
          <div className="z-10 flex flex-col max-w-2xl gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">
              {greeting} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight text-text-primary leading-tight">
              Focus on what matters today.
            </h1>
            <p className="text-[14px] text-text-secondary leading-relaxed mt-1">
              Organise your thoughts, track daily habits, and lock in deep work sessions inside your personal headquarters.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-4">
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
                className="bg-primary text-surface px-6 py-2.5 rounded-full font-semibold text-[13px] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <IconRocket size={16} /> Start Focus Session
              </button>
              <button 
                onClick={() => setActiveModule('todo')}
                className="bg-surface-alt text-text-primary px-5 py-2.5 rounded-full font-semibold text-[13px] hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-2"
              >
                <IconLayoutList size={16} className="text-text-secondary" /> View Tasks
              </button>
            </div>
          </div>

          {/* Quick Schedule Preview Pill inside Hero */}
          <div className="z-10 flex flex-col gap-2 bg-surface-alt p-4 rounded-[18px] w-full md:w-auto min-w-[200px] shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">Daily Target</span>
              <span className="w-2 h-2 rounded-full bg-accent-success" />
            </div>
            <div className="text-[18px] font-semibold text-text-primary">
              {completedTasksCount} / {totalTasks} Done
            </div>
            <span className="text-[12px] text-text-secondary">
              {todayTasks.length} tasks remaining
            </span>
          </div>
        </Card>
      </motion.div>

      {/* ── 2. KPI Metrics Stats Grid (StatCard Primitives) ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Focus Time"
          value={focusTimeLabel}
          icon={<IconClockPlay size={20} />}
          trend={focusHours > 0 ? { value: `${focusHours}h logged`, isPositive: true } : undefined}
        />
        <StatCard
          label="Habit Progress"
          value={`${completedTodayCount}/${dueHabits.length}`}
          icon={<IconFlame size={20} />}
          trend={completedTodayCount === dueHabits.length && dueHabits.length > 0 ? { value: 'All done!', isPositive: true } : undefined}
        />
        <StatCard
          label="Active Tasks"
          value={todayTasks.length}
          icon={<IconChecklist size={20} />}
        />
        <StatCard
          label="Streak Record"
          value={`${pomodoroStreak} days`}
          icon={<IconStar size={20} />}
          trend={pomodoroStreak > 0 ? { value: 'On fire', isPositive: true } : undefined}
        />
      </motion.div>

      {/* ── 3. Day Planner Week Strip Card (Reference Pattern) ── */}
      <motion.div variants={itemVariants}>
        <Card padding="lg" className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[18px] font-semibold text-text-primary">Week Planner</h2>
              <p className="text-[13px] text-text-secondary">Select a day to view agenda and tasks</p>
            </div>
            <span className="text-[12px] font-medium text-text-tertiary">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* 7-Day Horizontal Strip */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d, index) => {
              const isSelected = selectedDayOffset === index;
              return (
                <button
                  key={d.dayName}
                  onClick={() => setSelectedDayOffset(index)}
                  className="flex flex-col items-center gap-2 p-2 rounded-[14px] hover:bg-surface-alt transition-colors cursor-pointer group"
                >
                  <span className={`text-[11px] font-semibold uppercase transition-colors ${
                    d.isToday ? 'text-accent-highlight' : 'text-text-secondary group-hover:text-text-primary'
                  }`}>
                    {d.dayName}
                  </span>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[14px] sm:text-[15px] font-semibold transition-all ${
                    d.isToday
                      ? 'bg-accent-highlight text-white shadow-sm'
                      : isSelected
                        ? 'bg-primary text-surface shadow-sm'
                        : 'text-text-primary group-hover:bg-surface-alt'
                  }`}>
                    {d.dateNum}
                  </div>
                  {d.isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-highlight mt-0.5" />
                  )}
                  {!d.isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-full h-px bg-border-hairline" />

          {/* Quick Task Entry inside Planner */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">
                Today's Action Items ({todayTasks.length})
              </span>
              <button
                onClick={() => setActiveModule('todo')}
                className="text-[12px] font-semibold text-text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                Open Planner <IconArrowRight size={14} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Add a new task for today..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-surface-alt border border-transparent rounded-[12px] px-4 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="bg-primary text-surface px-5 py-2.5 rounded-[12px] font-semibold text-[13px] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <IconPlus size={16} /> Add
              </button>
            </form>

            {/* Tasks List */}
            <div className="flex flex-col gap-2">
              {todayTasks.length === 0 ? (
                <div className="p-8 text-center bg-surface-alt rounded-[14px]">
                  <p className="text-[13px] font-medium text-text-secondary">🎉 All caught up! No pending tasks for today.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {visibleTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between p-3.5 rounded-[14px] bg-surface-alt hover:bg-surface-hover transition-colors group"
                    >
                      <button
                        onClick={() => updateTodoTask(task.id, { completed: !task.completed })}
                        className="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-accent-success border-accent-success text-white'
                            : 'border-border-alt group-hover:border-text-primary'
                        }`}>
                          {task.completed && <IconCheck size={12} stroke={3} />}
                        </div>
                        <span className={`text-[14px] truncate ${
                          task.completed ? 'line-through text-text-tertiary' : 'font-medium text-text-primary'
                        }`}>
                          {task.title}
                        </span>
                      </button>

                      {!task.completed && (
                        <button
                          onClick={() => {
                            const isActive = activeFocusItem?.id === task.id;
                            setActiveFocusItem(isActive ? null : { type: 'todo', id: task.id, title: task.title });
                          }}
                          title={activeFocusItem?.id === task.id ? "Active Focus" : "Focus on Task"}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            activeFocusItem?.id === task.id
                              ? 'bg-primary text-surface'
                              : 'text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <IconTarget size={15} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {todayTasks.length > 4 && (
                <button
                  onClick={() => setShowAllTasks(!showAllTasks)}
                  className="w-full py-2 text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-center"
                >
                  {showAllTasks ? 'Show fewer tasks' : `Show all ${todayTasks.length} tasks`}
                </button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── 4. Side-by-Side: Focus Timer Dock & Habits + Mindmaps ── */}
      <motion.div variants={itemVariants} className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Focus Timer Dock */}
        <Card padding="lg" className="flex flex-col gap-6 lg:col-span-1 min-h-[360px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-text-primary">
                <IconClockPlay size={17} />
              </div>
              <span className="text-[15px] font-semibold text-text-primary">Focus Timer</span>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              pomodoroTimerState === 'running'
                ? 'bg-accent-success/10 text-accent-success'
                : pomodoroTimerState === 'paused'
                  ? 'bg-accent-warning/10 text-accent-warning'
                  : 'bg-surface-alt text-text-tertiary'
            }`}>
              {pomodoroTimerState === 'running' ? 'Running' : pomodoroTimerState === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="4" className="text-border-hairline" />
                <circle
                  cx="60" cy="60" r={timerRadius} fill="none" stroke="currentColor" strokeWidth="4"
                  strokeLinecap="round"
                  className={pomodoroTimerState !== 'idle' ? 'text-primary' : 'text-text-tertiary/30'}
                  strokeDasharray={`${timerCircumference}`}
                  strokeDashoffset={`${timerCircumference * (1 - pomodoroProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="text-[32px] font-semibold text-text-primary font-mono tracking-tight z-10">
                {formatTime(pomodoroSecondsLeft)}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary mt-4 font-medium">
              {pomodoroTimerState === 'running' ? 'Deep work active' : 'Standard 25-min interval'}
            </p>
          </div>

          <div className="flex w-full gap-2 mt-auto">
            {pomodoroTimerState === 'running' ? (
              <button
                onClick={pauseGlobalPomodoro}
                className="flex-1 py-2.5 rounded-full bg-surface-alt hover:bg-surface-hover text-text-primary font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <IconPlayerPause size={16} /> Pause
              </button>
            ) : (
              <button
                onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
                className="flex-1 py-2.5 rounded-full bg-primary text-surface font-semibold text-[13px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                <IconPlayerPlay size={16} /> {pomodoroTimerState === 'paused' ? 'Resume' : 'Start Focus'}
              </button>
            )}
            <button
              onClick={stopGlobalPomodoro}
              disabled={pomodoroTimerState === 'idle'}
              title="Reset Timer"
              className="flex items-center justify-center w-10 h-10 transition-colors rounded-full cursor-pointer bg-surface-alt hover:bg-surface-hover text-text-secondary disabled:opacity-30 shrink-0"
            >
              <IconRefresh size={16} />
            </button>
          </div>
        </Card>

        {/* Daily Habits & Recent Workspaces */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Habits Card */}
          <Card padding="lg" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-accent-success">
                  <IconFlame size={17} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">Daily Habits</h3>
                  <span className="text-[12px] text-text-secondary">{completedTodayCount} of {dueHabits.length} completed</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModule('habits')}
                className="text-[12px] font-semibold text-text-primary hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {dueHabits.length === 0 ? (
                <p className="text-[13px] text-text-secondary italic py-2">No habits scheduled for today.</p>
              ) : (
                dueHabits.slice(0, 3).map(habit => {
                  const isCompleted = habit.completedDates.includes(todayStr);
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 rounded-[14px] bg-surface-alt hover:bg-surface-hover transition-colors"
                    >
                      <button
                        onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                        className="flex items-center flex-1 min-w-0 gap-3 text-left cursor-pointer"
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? 'bg-accent-success border-accent-success text-white'
                            : 'border-border-alt'
                        }`}>
                          {isCompleted && <IconCheck size={12} stroke={3} />}
                        </div>
                        <span className={`text-[14px] truncate ${
                          isCompleted ? 'line-through text-text-tertiary' : 'font-medium text-text-primary'
                        }`}>
                          {habit.name}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Quick Mindmaps Card */}
          <Card padding="lg" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-text-primary">
                  <IconSitemap size={17} />
                </div>
                <h3 className="text-[15px] font-semibold text-text-primary">Recent Mindmaps</h3>
              </div>
              <button
                onClick={handleCreateMindmap}
                className="text-[12px] font-semibold text-text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={14} /> New Mindmap
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {mindmaps.slice(0, 2).map(m => (
                <button
                  key={m.id}
                  onClick={() => handleOpenMindmap(m.id)}
                  className="flex items-center gap-3 p-3 rounded-[14px] bg-surface-alt hover:bg-surface-hover transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm bg-surface text-text-secondary shrink-0">
                    <IconSitemap size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary truncate">{m.title}</p>
                    <span className="text-[11px] text-text-secondary">{m.nodes.length} nodes</span>
                  </div>
                </button>
              ))}
              {mindmaps.length === 0 && (
                <p className="text-[13px] text-text-secondary italic col-span-2 py-2">No mindmaps created yet.</p>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* ── 5. Recent Activity Feed ── */}
      <motion.div variants={itemVariants}>
        <Card padding="lg" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text-primary">Recent Activity</h3>
            <span className="text-[12px] text-text-tertiary">Auto-synced</span>
          </div>

          <div className="flex flex-col divide-y divide-border-hairline">
            {recentActivity.length === 0 ? (
              <p className="text-[13px] text-text-secondary italic py-4">No recent activity logged.</p>
            ) : (
              recentActivity.map((activity, i) => (
                <button
                  key={`${activity.id}-${i}`}
                  onClick={() => setActiveModule(activity.module)}
                  className="flex items-center justify-between py-3.5 hover:bg-surface-alt/50 transition-colors text-left cursor-pointer px-2 rounded-[10px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-text-secondary shrink-0">
                      <activity.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-text-primary truncate max-w-sm">{activity.title}</p>
                      <span className="text-[11px] text-text-secondary">{activity.type}</span>
                    </div>
                  </div>
                  <span className="text-[12px] text-text-tertiary shrink-0">
                    {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}