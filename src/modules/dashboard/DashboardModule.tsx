import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import {
  IconChecklist,
  IconClockPlay,
  IconFlame,
  IconStar,
  IconFileText,
  IconNotes,
  IconCode,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { StatCard } from '../../components/ui/StatCard';
import { DashboardHeroBanner } from './components/DashboardHeroBanner';
import { DashboardWeekPlanner } from './components/DashboardWeekPlanner';
import { DashboardFocusTimer } from './components/DashboardFocusTimer';
import { DashboardHabitsAndMindmaps } from './components/DashboardHabitsAndMindmaps';
import { DashboardRecentActivity } from './components/DashboardRecentActivity';

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
  } = useAppStore(
    useShallow((state) => ({
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
    })),
  );

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

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
      nodes: [{ id: 'root', text: 'Central Idea', x: 450, y: 250, color: 'blue', isRoot: true }],
      links: [],
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('pendingMindmapId', newId);
    setActiveModule('mindmap');
  };

  const allTasks = todoTasks.filter((t) => !(t as any).deleted);
  const totalTasks = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.completed).length;
  const todayTasks = allTasks.filter((t) => !t.completed);
  const visibleTasks = showAllTasks ? todayTasks : todayTasks.slice(0, 4);

  const focusDuration = 1500;
  const breakDuration = 300;
  const pomodoroProgress =
    pomodoroSessionId === 'focus'
      ? ((focusDuration - pomodoroSecondsLeft) / focusDuration) * 100
      : ((breakDuration - pomodoroSecondsLeft) / breakDuration) * 100;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const focusHours = Math.floor(pomodoroStats.totalMinutes / 60);
  const focusMins = pomodoroStats.totalMinutes % 60;
  const focusTimeLabel = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  const recentActivity = useMemo(() => {
    const activities: {
      id: string;
      title: string;
      type: string;
      date: string;
      icon: any;
      module: string;
      color: string;
    }[] = [];

    todoTasks
      .filter((t) => t.completed)
      .forEach((t) => {
        activities.push({
          id: t.id,
          title: t.title,
          type: 'Completed Task',
          date: t.createdAt || new Date().toISOString(),
          icon: IconChecklist,
          module: 'todo',
          color: 'text-accent-success',
        });
      });

    journals.forEach((j) => {
      activities.push({
        id: j.id,
        title: j.title || 'Journal Entry',
        type: 'Journal',
        date: j.date,
        icon: IconFileText,
        module: 'journal',
        color: 'text-text-primary',
      });
    });

    notes.forEach((n) => {
      activities.push({
        id: n.id,
        title: n.title || 'Note',
        type: 'Note',
        date: n.updatedAt || n.createdAt,
        icon: IconNotes,
        module: 'markdown',
        color: 'text-text-primary',
      });
    });

    snippets.forEach((s) => {
      activities.push({
        id: s.id,
        title: s.title || 'Snippet',
        type: 'Snippet',
        date: s.updatedAt || s.createdAt || new Date().toISOString(),
        icon: IconCode,
        module: 'snippets',
        color: 'text-text-primary',
      });
    });

    (tilLogs || []).forEach((t) => {
      activities.push({
        id: t.id,
        title: t.title || 'TIL',
        type: 'TIL',
        date: t.createdAt,
        icon: IconStar,
        module: 'til',
        color: 'text-accent-highlight',
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [todoTasks, journals, notes, snippets, tilLogs]);

  // 7-day Week Strip
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
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
    return dueHabits.filter((h) => h.completedDates.includes(todayStr)).length;
  }, [dueHabits, todayStr]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02,
      },
    },
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
      },
    },
  };

  return (
    <motion.div
      data-component="DashboardModule"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col w-full max-w-5xl gap-8 pb-24 mx-auto antialiased text-left"
    >
      {/* 1. Hero Greeting Banner */}
      <motion.div variants={itemVariants}>
        <DashboardHeroBanner
          greeting={greeting}
          pomodoroTimerState={pomodoroTimerState}
          startGlobalPomodoro={startGlobalPomodoro}
          resumeGlobalPomodoro={resumeGlobalPomodoro}
          setActiveModule={setActiveModule}
          completedTasksCount={completedTasksCount}
          totalTasks={totalTasks}
          todayTasksCount={todayTasks.length}
        />
      </motion.div>

      {/* 2. KPI Metrics Stats Grid */}
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
          trend={
            completedTodayCount === dueHabits.length && dueHabits.length > 0
              ? { value: 'All done!', isPositive: true }
              : undefined
          }
        />
        <StatCard label="Active Tasks" value={todayTasks.length} icon={<IconChecklist size={20} />} />
        <StatCard
          label="Streak Record"
          value={`${pomodoroStreak} days`}
          icon={<IconStar size={20} />}
          trend={pomodoroStreak > 0 ? { value: 'On fire', isPositive: true } : undefined}
        />
      </motion.div>

      {/* 3. Day Planner Week Strip Card */}
      <motion.div variants={itemVariants}>
        <DashboardWeekPlanner
          weekDays={weekDays}
          selectedDayOffset={selectedDayOffset}
          setSelectedDayOffset={setSelectedDayOffset}
          setActiveModule={setActiveModule}
          todayTasks={todayTasks}
          visibleTasks={visibleTasks}
          showAllTasks={showAllTasks}
          setShowAllTasks={setShowAllTasks}
          updateTodoTask={updateTodoTask}
          activeFocusItem={activeFocusItem}
          setActiveFocusItem={setActiveFocusItem}
          handleAddTask={handleAddTask}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
        />
      </motion.div>

      {/* 4. Side-by-Side: Focus Timer Dock & Habits + Mindmaps */}
      <motion.div
        variants={itemVariants}
        className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <DashboardFocusTimer
          pomodoroTimerState={pomodoroTimerState}
          pomodoroSecondsLeft={pomodoroSecondsLeft}
          pauseGlobalPomodoro={pauseGlobalPomodoro}
          resumeGlobalPomodoro={resumeGlobalPomodoro}
          startGlobalPomodoro={startGlobalPomodoro}
          stopGlobalPomodoro={stopGlobalPomodoro}
          pomodoroProgress={pomodoroProgress}
          formatTime={formatTime}
        />

        <DashboardHabitsAndMindmaps
          dueHabits={dueHabits}
          completedTodayCount={completedTodayCount}
          todayStr={todayStr}
          toggleHabitCompletion={toggleHabitCompletion}
          setActiveModule={setActiveModule}
          mindmaps={mindmaps}
          handleOpenMindmap={handleOpenMindmap}
          handleCreateMindmap={handleCreateMindmap}
        />
      </motion.div>

      {/* 5. Recent Activity Feed */}
      <motion.div variants={itemVariants}>
        <DashboardRecentActivity
          recentActivity={recentActivity}
          setActiveModule={setActiveModule}
        />
      </motion.div>
    </motion.div>
  );
}