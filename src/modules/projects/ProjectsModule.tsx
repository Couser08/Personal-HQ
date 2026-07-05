import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, SprintTask, Sprint, DsaProblem, TilLog, ResourceBookmark, DevGoal } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconTerminal, IconChecklist, IconCalendar, IconChartBar, 
  IconBook, IconTools, IconPlus, IconCheck, IconTrash, 
  IconExternalLink, IconFlame, IconTarget, IconSend, 
  IconBrackets, IconSearch, IconEye, IconRefresh
} from '@tabler/icons-react';
import { triggerDynamicIsland } from '../../components/ui/DynamicIsland';

type SubTab = 'board' | 'analytics' | 'learning' | 'utilities';

export default function ProjectsModule() {
  const {
    sprints, dsaProblems, tilLogs, roadmaps, resources, devGoals,
    pomodoroStats, pomodoroStreak,
    addSprint, updateSprint, deleteSprint,
    addSprintTask, updateSprintTask, deleteSprintTask,
    addDsaProblem, updateDsaProblem, deleteDsaProblem,
    addTilLog, deleteTilLog, updateRoadmapNode,
    addResource, updateResource, deleteResource,
    addDevGoal, updateDevGoal, deleteDevGoal
  } = useAppStore(useShallow(state => ({
    sprints: state.sprints,
    dsaProblems: state.dsaProblems,
    tilLogs: state.tilLogs,
    roadmaps: state.roadmaps,
    resources: state.resources,
    devGoals: state.devGoals,
    pomodoroStats: state.pomodoroStats,
    pomodoroStreak: state.pomodoroStreak,
    addSprint: state.addSprint,
    updateSprint: state.updateSprint,
    deleteSprint: state.deleteSprint,
    addSprintTask: state.addSprintTask,
    updateSprintTask: state.updateSprintTask,
    deleteSprintTask: state.deleteSprintTask,
    addDsaProblem: state.addDsaProblem,
    updateDsaProblem: state.updateDsaProblem,
    deleteDsaProblem: state.deleteDsaProblem,
    addTilLog: state.addTilLog,
    deleteTilLog: state.deleteTilLog,
    updateRoadmapNode: state.updateRoadmapNode,
    addResource: state.addResource,
    updateResource: state.updateResource,
    deleteResource: state.deleteResource,
    addDevGoal: state.addDevGoal,
    updateDevGoal: state.updateDevGoal,
    deleteDevGoal: state.deleteDevGoal,
  })));

  const [activeTab, setActiveTab] = useState<SubTab>('board');

  // Focus Mode local toggler
  const [isFocusMode, setIsFocusMode] = useState(() => localStorage.getItem('phq_focus_mode') === 'true');
  
  const toggleFocusMode = () => {
    const nextVal = !isFocusMode;
    localStorage.setItem('phq_focus_mode', String(nextVal));
    setIsFocusMode(nextVal);
    window.dispatchEvent(new Event('phq-focus-mode-change'));
    triggerDynamicIsland(
      nextVal ? 'Focus Mode Enabled' : 'Focus Mode Disabled',
      nextVal ? 'Distractions dimmed' : 'Layout expanded',
      'success',
      nextVal ? 'award' : 'confetti'
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-16 text-left">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Developer Workspace
          </h1>
          <p className="text-text-secondary text-xs mt-1">Manage sprints, track DSA learning stats, and test regex or APIs.</p>
        </div>

        {/* Action pills */}
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleFocusMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              isFocusMode 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                : 'bg-surface border-border/60 text-text-secondary hover:bg-surface-alt'
            }`}
          >
            <IconEye className="w-3.5 h-3.5" /> {isFocusMode ? 'Focus On' : 'Focus Mode'}
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex border-b border-border/40 gap-4">
        {(['board', 'analytics', 'learning', 'utilities'] as SubTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Main Tab Content Viewport ── */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'board' && (
              <SprintBoardView 
                sprints={sprints}
                addSprint={addSprint}
                updateSprint={updateSprint}
                deleteSprint={deleteSprint}
                addSprintTask={addSprintTask}
                updateSprintTask={updateSprintTask}
                deleteSprintTask={deleteSprintTask}
              />
            )}
            {activeTab === 'analytics' && (
              <DeveloperAnalyticsView 
                dsaProblems={dsaProblems}
                devGoals={devGoals}
                pomodoroStats={pomodoroStats}
                pomodoroStreak={pomodoroStreak}
                addDevGoal={addDevGoal}
                updateDevGoal={updateDevGoal}
                deleteDevGoal={deleteDevGoal}
              />
            )}
            {activeTab === 'learning' && (
              <LearningCenterView 
                dsaProblems={dsaProblems}
                tilLogs={tilLogs}
                roadmaps={roadmaps}
                resources={resources}
                addDsaProblem={addDsaProblem}
                updateDsaProblem={updateDsaProblem}
                deleteDsaProblem={deleteDsaProblem}
                addTilLog={addTilLog}
                deleteTilLog={deleteTilLog}
                updateRoadmapNode={updateRoadmapNode}
                addResource={addResource}
                updateResource={updateResource}
                deleteResource={deleteResource}
              />
            )}
            {activeTab === 'utilities' && <DeveloperUtilitiesView />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

// ── SUB-COMPONENT 1: Sprint Kanban Board & Gantt Timeline ──
function SprintBoardView({
  sprints, addSprint, updateSprint, deleteSprint,
  addSprintTask, updateSprintTask, deleteSprintTask
}: {
  sprints: Sprint[];
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, data: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  addSprintTask: (sprintId: string, task: SprintTask) => void;
  updateSprintTask: (sprintId: string, taskId: string, data: Partial<SprintTask>) => void;
  deleteSprintTask: (sprintId: string, taskId: string) => void;
}) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>(sprints[0]?.id || '');
  const activeSprint = sprints.find(s => s.id === selectedSprintId) || sprints[0];
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(1);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintTitle, setNewSprintTitle] = useState('');

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintTitle.trim()) return;
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      title: newSprintTitle.trim(),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      status: 'planned',
      tasks: []
    };
    addSprint(newSprint);
    setSelectedSprintId(newSprint.id);
    setNewSprintTitle('');
    setIsCreatingSprint(false);
    triggerDynamicIsland('Sprint Created', newSprint.title, 'success', 'confetti');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeSprint) return;
    const newTask: SprintTask = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      storyPoints: newTaskPoints,
      priority: newTaskPriority,
      status: 'backlog',
      tags: ['issue']
    };
    addSprintTask(activeSprint.id, newTask);
    setNewTaskTitle('');
    setIsAddingTask(false);
    triggerDynamicIsland('Task Added', newTask.title, 'success', 'confetti');
  };

  const moveTask = (taskId: string, targetStatus: SprintTask['status']) => {
    if (!activeSprint) return;
    updateSprintTask(activeSprint.id, taskId, { status: targetStatus });
  };

  const totalPoints = activeSprint?.tasks.reduce((sum, t) => sum + t.storyPoints, 0) || 0;
  const completedPoints = activeSprint?.tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.storyPoints, 0) || 0;
  const progressPct = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sprint Header Panel */}
      <div className="bg-surface border border-border/40 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <select 
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            className="bg-surface-alt border border-border/40 text-text-primary rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
          >
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <button 
            onClick={() => setIsCreatingSprint(true)}
            className="flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider cursor-pointer"
          >
            <IconPlus className="w-3.5 h-3.5" /> New Sprint
          </button>
        </div>

        {activeSprint && (
          <div className="flex items-center gap-4 text-xs">
            <div className="leading-tight">
              <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">Velocity</span>
              <span className="font-bold text-text-primary">{completedPoints} / {totalPoints} story points ({progressPct}%)</span>
            </div>
            <div className="w-32 h-1.5 bg-border/20 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Create Sprint Modal */}
      {isCreatingSprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="bg-surface border border-border/40 rounded-3xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Create New Sprint</h3>
            <form onSubmit={handleCreateSprint} className="flex flex-col gap-3 mt-4">
              <input 
                type="text"
                required
                placeholder="Sprint Title (e.g. Sprint 2: UI Overhaul)"
                value={newSprintTitle}
                onChange={e => setNewSprintTitle(e.target.value)}
                className="bg-surface-alt border border-border/45 rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreatingSprint(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted hover:bg-surface-alt cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board Grid */}
      {activeSprint && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['backlog', 'todo', 'in_progress', 'review', 'done'] as SprintTask['status'][]).filter(s => s !== 'todo').map(status => {
            const statusTasks = activeSprint.tasks.filter(t => t.status === status);
            const statusLabel = 
              status === 'backlog' ? 'Sprint Backlog' :
              status === 'in_progress' ? 'In Progress' :
              status === 'review' ? 'Code Review' : 'Completed';
            const statusColor = 
              status === 'backlog' ? 'border-t-stone-400' :
              status === 'in_progress' ? 'border-t-amber-400' :
              status === 'review' ? 'border-t-indigo-400' : 'border-t-green-400';

            return (
              <div key={status} className={`bg-surface/50 border border-border/45 border-t-[3px] ${statusColor} rounded-2xl p-3 flex flex-col gap-3 min-h-[300px]`}>
                <div className="flex justify-between items-center pb-1 border-b border-border/30">
                  <span className="text-[10px] font-black uppercase text-text-primary tracking-wider">{statusLabel}</span>
                  <span className="text-[9px] font-black text-text-muted bg-surface-alt px-1.5 py-0.5 rounded-full border border-border/30">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[400px]">
                  {statusTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-surface border border-border/40 p-3 rounded-xl shadow-sm flex flex-col gap-2 group hover:shadow-md transition-shadow relative"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-text-primary leading-tight">{task.title}</h4>
                        <button
                          onClick={() => deleteSprintTask(activeSprint.id, task.id)}
                          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-text-muted hover:text-red-500 transition-opacity cursor-pointer"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-text-muted">{task.storyPoints} SP</span>
                          <select
                            value={task.status}
                            onChange={e => moveTask(task.id, e.target.value as SprintTask['status'])}
                            className="bg-surface-alt border border-border/40 text-[9px] font-bold text-text-secondary rounded-lg px-1 focus:outline-none"
                          >
                            <option value="backlog">Backlog</option>
                            <option value="in_progress">Active</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {status === 'backlog' && (
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="w-full py-2 bg-surface-alt hover:bg-stone-100 dark:hover:bg-stone-850 border border-dashed border-border/40 text-text-muted hover:text-text-secondary rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <IconPlus className="w-3.5 h-3.5" /> Add Issue
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="bg-surface border border-border/40 rounded-3xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Add Task to Sprint</h3>
            <form onSubmit={handleAddTask} className="flex flex-col gap-3 mt-4">
              <input 
                type="text"
                required
                placeholder="Task Description"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="bg-surface-alt border border-border/45 rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none"
              />

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">Story Points</span>
                  <select 
                    value={newTaskPoints} 
                    onChange={e => setNewTaskPoints(Number(e.target.value))}
                    className="bg-surface-alt border border-border/45 rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none"
                  >
                    <option value={1}>1 SP (Easy)</option>
                    <option value={2}>2 SP</option>
                    <option value={3}>3 SP (Medium)</option>
                    <option value={5}>5 SP (Hard)</option>
                    <option value={8}>8 SP (Complex)</option>
                  </select>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">Priority</span>
                  <select 
                    value={newTaskPriority} 
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="bg-surface-alt border border-border/45 rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted hover:bg-surface-alt cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gantt Timeline/Milestones Widget */}
      <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-border/30 mb-4">
          <IconCalendar className="w-4.5 h-4.5 text-rose-500" />
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">Sprint Timeline (Gantt)</span>
        </div>

        <div className="flex flex-col gap-4">
          {sprints.map((s, idx) => {
            const hasStarted = new Date(s.startDate) <= new Date();
            const progress = s.tasks.length > 0 
              ? Math.round((s.tasks.filter(t => t.status === 'done').length / s.tasks.length) * 100) 
              : 0;

            return (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/20 pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text-primary truncate">{s.title}</h4>
                  <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider mt-0.5">
                    {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex-1 max-w-xs flex items-center gap-3">
                  {/* Timeline representation bar */}
                  <div className="flex-1 h-3 bg-border/20 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        s.status === 'active' ? 'bg-rose-500' : 'bg-stone-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-text-primary">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ── SUB-COMPONENT 2: Developer Analytics & Heatmap ──
function DeveloperAnalyticsView({
  dsaProblems, devGoals, pomodoroStats, pomodoroStreak,
  addDevGoal, updateDevGoal, deleteDevGoal
}: {
  dsaProblems: DsaProblem[];
  devGoals: DevGoal[];
  pomodoroStats: any;
  pomodoroStreak: number;
  addDevGoal: (goal: DevGoal) => void;
  updateDevGoal: (id: string, data: Partial<DevGoal>) => void;
  deleteDevGoal: (id: string) => void;
}) {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(5);
  const [newGoalMetric, setNewGoalMetric] = useState('commits');

  // Compute mock git contributions heatmap (53 columns x 7 days)
  const heatmapGrid = useMemo(() => {
    const grid: number[][] = [];
    for (let c = 0; c < 53; c++) {
      const col: number[] = [];
      for (let r = 0; r < 7; r++) {
        // Generate pseudo-random contribution levels
        const rand = Math.sin(c * 0.15) * Math.cos(r * 0.25);
        const intensity = rand > 0.4 ? 4 : rand > 0.1 ? 2 : rand > -0.2 ? 1 : 0;
        col.push(intensity);
      }
      grid.push(col);
    }
    return grid;
  }, []);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const newGoal: DevGoal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle.trim(),
      target: newGoalTarget,
      current: 0,
      metric: newGoalMetric,
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      completed: false
    };
    addDevGoal(newGoal);
    setNewGoalTitle('');
    triggerDynamicIsland('Goal Tracked', newGoal.title, 'success', 'award');
  };

  const handleIncrementGoal = (id: string) => {
    const goal = devGoals.find(g => g.id === id);
    if (!goal) return;
    const nextCurrent = Math.min(goal.current + 1, goal.target);
    updateDevGoal(id, { 
      current: nextCurrent,
      completed: nextCurrent >= goal.target 
    });
    if (nextCurrent >= goal.target) {
      triggerDynamicIsland('Goal Achieved 🎉', goal.title, 'achievement', 'award');
    }
  };

  // Weekly Report Score Calculation
  const productivityScore = useMemo(() => {
    const solvedDsa = dsaProblems.filter(p => p.status === 'solved').length;
    const focusHours = pomodoroStats?.totalMinutes ? (pomodoroStats.totalMinutes / 60) : 0;
    
    // baseline 75% + adjustments
    const score = Math.min(Math.round(75 + (solvedDsa * 2) + (focusHours * 1.5)), 100);
    return score;
  }, [dsaProblems, pomodoroStats]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Contribution Heatmap */}
      <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-4">
          <div className="flex items-center gap-2">
            <IconTerminal className="w-4.5 h-4.5 text-green-500" />
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Coding Contributions</span>
          </div>
          <span className="text-[10px] text-text-muted font-bold">142 Commits this month</span>
        </div>

        {/* Heatmap grid */}
        <div className="overflow-x-auto scrollbar-none py-1">
          <div className="flex gap-[3px] min-w-[500px]">
            {heatmapGrid.map((col, cIdx) => (
              <div key={cIdx} className="flex flex-col gap-[3px]">
                {col.map((cell, rIdx) => (
                  <div 
                    key={rIdx}
                    className={`w-[9px] h-[9px] rounded-[1.5px] transition-colors ${
                      cell === 4 ? 'bg-green-500' :
                      cell === 2 ? 'bg-green-400/60' :
                      cell === 1 ? 'bg-green-400/20' : 'bg-stone-100 dark:bg-stone-850'
                    }`}
                    title={`Intensity: ${cell}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[8px] font-black uppercase text-text-muted tracking-wider">
          <span>Less</span>
          <div className="w-[9px] h-[9px] rounded-[1.5px] bg-stone-100 dark:bg-stone-850" />
          <div className="w-[9px] h-[9px] rounded-[1.5px] bg-green-400/20" />
          <div className="w-[9px] h-[9px] rounded-[1.5px] bg-green-400/60" />
          <div className="w-[9px] h-[9px] rounded-[1.5px] bg-green-500" />
          <span>More</span>
        </div>
      </div>

      {/* 2. Language Breakdown & Productivity scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Languages progress bar stack */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-border/30 mb-4">
              <IconChartBar className="w-4.5 h-4.5 text-blue-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Language Distribution</span>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { name: 'TypeScript / React', pct: 60, color: 'bg-blue-500' },
                { name: 'Python / ML', pct: 25, color: 'bg-emerald-500' },
                { name: 'Go / Backend', pct: 15, color: 'bg-teal-500' }
              ].map(lang => (
                <div key={lang.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-bold text-text-muted">
                    <span>{lang.name}</span>
                    <span>{lang.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden">
                    <div className={`h-full ${lang.color} rounded-full`} style={{ width: `${lang.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Productivity scorecard */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30 mb-4">
            <IconTarget className="w-4.5 h-4.5 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Weekly Productivity Score</span>
          </div>

          <div className="flex items-center justify-between gap-6 py-2">
            <div className="leading-tight">
              <span className="text-4xl font-black text-text-primary">{productivityScore}%</span>
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider mt-1">Consistency rating: Excellent</span>
            </div>
            
            <div className="w-20 h-20 shrink-0 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="var(--border-border)" strokeWidth="6" fill="transparent" className="opacity-20" />
                <circle 
                  cx="40" cy="40" r="32" 
                  stroke="var(--color-primary, #f43f5e)" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - productivityScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Goal Tracker */}
      <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <IconFlame className="w-4.5 h-4.5 text-rose-500" />
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">Active Goals</span>
        </div>

        <form onSubmit={handleCreateGoal} className="flex flex-col sm:flex-row gap-2 shrink-0">
          <input 
            type="text"
            required
            placeholder="New Goal Title (e.g. Solve 5 Hard DSA)"
            value={newGoalTitle}
            onChange={e => setNewGoalTitle(e.target.value)}
            className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
          />
          <div className="flex gap-2">
            <input 
              type="number"
              required
              min={1}
              value={newGoalTarget}
              onChange={e => setNewGoalTarget(Number(e.target.value))}
              className="w-16 bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
            />
            <input 
              type="text"
              required
              placeholder="metric"
              value={newGoalMetric}
              onChange={e => setNewGoalMetric(e.target.value)}
              className="w-20 bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
            />
            <button 
              type="submit"
              className="px-4 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
            >
              Add Goal
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-3">
          {devGoals.map(goal => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <div key={goal.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/20 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleIncrementGoal(goal.id)}
                    disabled={goal.completed}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      goal.completed ? 'bg-green-500 border-green-500 text-white' : 'border-border/60 hover:border-rose-400'
                    }`}
                  >
                    {goal.completed && <IconCheck className="w-3.5 h-3.5" />}
                  </button>
                  <span className={`text-xs font-bold text-text-primary ${goal.completed ? 'line-through text-text-muted' : ''}`}>
                    {goal.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-text-muted font-bold uppercase">{goal.current} / {goal.target} {goal.metric} ({pct}%)</span>
                  <button 
                    onClick={() => deleteDevGoal(goal.id)}
                    className="text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ── SUB-COMPONENT 3: Learning Center ──
function LearningCenterView({
  dsaProblems, tilLogs, roadmaps, resources,
  addDsaProblem, updateDsaProblem, deleteDsaProblem,
  addTilLog, deleteTilLog, updateRoadmapNode,
  addResource, updateResource, deleteResource
}: {
  dsaProblems: DsaProblem[];
  tilLogs: TilLog[];
  roadmaps: any[];
  resources: ResourceBookmark[];
  addDsaProblem: (prob: DsaProblem) => void;
  updateDsaProblem: (id: string, data: Partial<DsaProblem>) => void;
  deleteDsaProblem: (id: string) => void;
  addTilLog: (log: TilLog) => void;
  deleteTilLog: (id: string) => void;
  updateRoadmapNode: (roadmapId: string, nodeId: string, completed: boolean) => void;
  addResource: (res: ResourceBookmark) => void;
  updateResource: (id: string, data: Partial<ResourceBookmark>) => void;
  deleteResource: (id: string) => void;
}) {
  const [dsaTitle, setDsaTitle] = useState('');
  const [dsaDifficulty, setDsaDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [dsaTopic, setDsaTopic] = useState('Arrays');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('roadmap-frontend');

  const [tilTitle, setTilTitle] = useState('');
  const [tilContent, setTilContent] = useState('');

  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');

  const handleAddDsa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dsaTitle.trim()) return;
    const newProb: DsaProblem = {
      id: `dsa-${Date.now()}`,
      title: dsaTitle.trim(),
      platform: 'LeetCode',
      difficulty: dsaDifficulty,
      topic: dsaTopic,
      status: 'solved',
      solvedAt: new Date().toISOString()
    };
    addDsaProblem(newProb);
    setDsaTitle('');
    triggerDynamicIsland('DSA Problem Logged', newProb.title, 'success', 'confetti');
  };

  const handleAddTil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tilTitle.trim() || !tilContent.trim()) return;
    const newTil: TilLog = {
      id: `til-${Date.now()}`,
      title: tilTitle.trim(),
      content: tilContent.trim(),
      tags: ['TypeScript'],
      createdAt: new Date().toISOString()
    };
    addTilLog(newTil);
    setTilTitle('');
    setTilContent('');
    triggerDynamicIsland('TIL Logged 🎉', newTil.title, 'achievement', 'award');
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    const newRes: ResourceBookmark = {
      id: `res-${Date.now()}`,
      title: resTitle.trim(),
      url: resUrl.trim(),
      tags: ['tutorial'],
      status: 'to_read',
      savedAt: new Date().toISOString()
    };
    addResource(newRes);
    setResTitle('');
    setResUrl('');
    triggerDynamicIsland('Resource Saved', newRes.title, 'success', 'confetti');
  };

  const activeRoadmap = roadmaps.find(r => r.id === selectedRoadmapId) || roadmaps[0];
  const roadmapProgress = activeRoadmap 
    ? Math.round((activeRoadmap.nodes.filter((n: any) => n.completed).length / activeRoadmap.nodes.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── Resource Library & Roadmaps ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Roadmaps builder */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <IconBook className="w-4.5 h-4.5 text-purple-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Interactive Roadmaps</span>
            </div>
            <select
              value={selectedRoadmapId}
              onChange={e => setSelectedRoadmapId(e.target.value)}
              className="bg-surface-alt border border-border/40 text-[10px] font-bold text-text-secondary rounded-lg px-2 py-0.5 focus:outline-none"
            >
              <option value="roadmap-frontend">Frontend Developer</option>
              <option value="roadmap-backend">Backend Systems</option>
            </select>
          </div>

          {activeRoadmap && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-text-muted">
                <span>ROADMAP PROGRESS</span>
                <span>{roadmapProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${roadmapProgress}%` }} />
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                {activeRoadmap.nodes.map((node: any) => (
                  <div key={node.id} className="flex items-center gap-3">
                    <button
                      onClick={() => updateRoadmapNode(activeRoadmap.id, node.id, !node.completed)}
                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                        node.completed ? 'bg-purple-500 border-purple-500 text-white' : 'border-border/60 hover:border-purple-400'
                      }`}
                    >
                      {node.completed && <IconCheck className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`text-xs font-medium text-text-primary ${node.completed ? 'line-through text-text-muted' : ''}`}>
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resources bookmarks */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <IconExternalLink className="w-4.5 h-4.5 text-blue-500" />
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Resource Library</span>
          </div>

          <form onSubmit={handleAddResource} className="flex gap-2">
            <input 
              type="text"
              required
              placeholder="Resource Name"
              value={resTitle}
              onChange={e => setResTitle(e.target.value)}
              className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-text-primary focus:outline-none"
            />
            <input 
              type="url"
              required
              placeholder="https://..."
              value={resUrl}
              onChange={e => setResUrl(e.target.value)}
              className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-text-primary focus:outline-none"
            />
            <button 
              type="submit"
              className="px-3 bg-blue-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer shrink-0"
            >
              Add
            </button>
          </form>

          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
            {resources.map(res => (
              <div key={res.id} className="flex items-center justify-between p-2.5 bg-surface-alt/40 border border-border/20 rounded-xl">
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-text-primary hover:text-blue-500 truncate flex-1 hover:underline"
                >
                  {res.title}
                </a>
                <button
                  onClick={() => deleteResource(res.id)}
                  className="text-text-muted hover:text-red-500 transition-colors ml-2 cursor-pointer"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── DSA prep & TIL journal logs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* DSA solver board */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <IconTerminal className="w-4.5 h-4.5 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Spaced Repetition DSA Board</span>
          </div>

          <form onSubmit={handleAddDsa} className="flex flex-col gap-2 shrink-0">
            <input 
              type="text"
              required
              placeholder="DSA Problem Title (e.g. Graph Cycle Detection)"
              value={dsaTitle}
              onChange={e => setDsaTitle(e.target.value)}
              className="bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={dsaDifficulty}
                onChange={e => setDsaDifficulty(e.target.value as any)}
                className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-2 py-1.5 text-xs font-bold text-text-secondary focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input 
                type="text"
                required
                placeholder="Topic (e.g. Graphs)"
                value={dsaTopic}
                onChange={e => setDsaTopic(e.target.value)}
                className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
              />
              <button 
                type="submit"
                className="px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
              >
                Log Solved
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
            {dsaProblems.map(prob => (
              <div key={prob.id} className="flex items-center justify-between p-2.5 bg-surface-alt/40 border border-border/20 rounded-xl">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text-primary truncate">{prob.title}</h4>
                  <span className="text-[9px] text-text-muted font-bold block uppercase mt-0.5">{prob.topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    prob.difficulty === 'hard' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    prob.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-green-500/10 text-green-500 border-green-500/20'
                  }`}>
                    {prob.difficulty}
                  </span>
                  <button 
                    onClick={() => deleteDsaProblem(prob.id)}
                    className="text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TIL Log journal */}
        <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <IconChecklist className="w-4.5 h-4.5 text-rose-500" />
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Today I Learned (TIL) Log</span>
          </div>

          <form onSubmit={handleAddTil} className="flex flex-col gap-2 shrink-0">
            <input 
              type="text"
              required
              placeholder="What did you learn today?"
              value={tilTitle}
              onChange={e => setTilTitle(e.target.value)}
              className="bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
            />
            <textarea 
              required
              placeholder="Describe what you learned in a few sentences..."
              rows={2}
              value={tilContent}
              onChange={e => setTilContent(e.target.value)}
              className="bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none resize-none"
            />
            <button 
              type="submit"
              className="w-full py-2 bg-rose-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
            >
              Add TIL Log
            </button>
          </form>

          <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
            {tilLogs.map(log => (
              <div key={log.id} className="flex flex-col gap-1 p-2.5 bg-surface-alt/45 border border-border/20 rounded-xl group relative">
                <button
                  onClick={() => deleteTilLog(log.id)}
                  className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-text-muted hover:text-red-500 transition-opacity cursor-pointer"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
                <h4 className="text-xs font-bold text-text-primary leading-tight">{log.title}</h4>
                <p className="text-[10px] text-text-secondary leading-relaxed">{log.content}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

// ── SUB-COMPONENT 4: REST API Client & Regex Matcher ──
function DeveloperUtilitiesView() {
  const [apiUrl, setApiUrl] = useState('https://api.github.com/users/octocat');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexText, setRegexText] = useState('My email is test@example.com and alert@domain.co.in');

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl.trim()) return;
    setIsSending(true);
    setApiResponse('');
    setApiStatus(null);
    try {
      const res = await fetch(apiUrl, { method: apiMethod });
      setApiStatus(res.status);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
      triggerDynamicIsland('API Request Done', `Status: ${res.status}`, 'success', 'confetti');
    } catch (err: any) {
      setApiResponse(`Error: ${err.message}`);
      setApiStatus(500);
      triggerDynamicIsland('API Request Failed', err.message, 'alert', 'alert');
    } finally {
      setIsSending(false);
    }
  };

  // Compute Regex Highlights
  const regexMatches = useMemo(() => {
    if (!regexPattern.trim() || !regexText.trim()) return [];
    try {
      const regex = new RegExp(regexPattern, 'g');
      const matches = [...regexText.matchAll(regex)];
      return matches.map(m => m[0]);
    } catch {
      return ['Invalid Regex Pattern'];
    }
  }, [regexPattern, regexText]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* REST API client */}
      <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <IconSend className="w-4.5 h-4.5 text-rose-500" />
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">REST API Client</span>
        </div>

        <form onSubmit={handleSendRequest} className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            <select
              value={apiMethod}
              onChange={e => setApiMethod(e.target.value as any)}
              className="bg-surface-alt border border-border/40 text-xs font-bold text-text-secondary rounded-xl px-2 py-1.5 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>

            <input 
              type="url"
              required
              placeholder="API Request URL"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-2 bg-rose-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
          >
            {isSending ? 'Sending...' : 'Send Request'}
          </button>
        </form>

        {/* Response Viewer */}
        <div className="flex-1 flex flex-col gap-1.5 min-h-[220px]">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-text-muted">
            <span>Response Body</span>
            {apiStatus && (
              <span className={`px-2 py-0.5 rounded border ${
                apiStatus < 400 ? 'bg-green-500/15 border-green-500/30 text-green-500' : 'bg-red-500/15 border-red-500/30 text-red-500'
              }`}>
                {apiStatus}
              </span>
            )}
          </div>
          <textarea 
            readOnly
            placeholder="JSON Response output"
            value={apiResponse}
            className="flex-1 w-full bg-surface-alt border border-border/40 rounded-xl p-3 text-[10px] font-mono text-text-secondary focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Regex Matcher */}
      <div className="bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <IconBrackets className="w-4.5 h-4.5 text-blue-500" />
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">Regex Playground</span>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">Regex Pattern</span>
            <input 
              type="text"
              required
              placeholder="e.g. [a-z]+"
              value={regexPattern}
              onChange={e => setRegexPattern(e.target.value)}
              className="bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">Test String</span>
            <textarea 
              rows={2}
              required
              placeholder="Input test string"
              value={regexText}
              onChange={e => setRegexText(e.target.value)}
              className="bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Match Output */}
        <div className="flex-1 flex flex-col gap-2 min-h-[160px]">
          <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">Matches Found ({regexMatches.length})</span>
          <div className="flex-1 bg-surface-alt border border-border/40 rounded-xl p-3 overflow-y-auto flex flex-wrap gap-1.5 content-start">
            {regexMatches.length === 0 ? (
              <span className="text-[10px] text-text-muted italic">No matches.</span>
            ) : (
              regexMatches.map((m, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-[9px] font-mono font-bold"
                >
                  {m}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
