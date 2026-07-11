import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import type { SprintTask, Sprint, DsaProblem, ResourceBookmark, DevGoal } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconTerminal, IconCalendar, IconChartBar, 
  IconBook, IconPlus, IconCheck, IconTrash, 
  IconExternalLink, IconFlame, IconTarget, IconSend, 
  IconBrackets, IconEye, IconRocket, IconGlobe,
  IconChevronDown, IconChevronUp, IconPlayerPlay, IconLock
} from '@tabler/icons-react';
import { triggerDynamicIsland } from '../../components/ui/DynamicIsland';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';

type SubTab = 'board' | 'analytics' | 'learning' | 'utilities';

const ROADMAP_TEMPLATES = {
  custom: {
    title: '',
    description: '',
    nodesText: ''
  },
  rust: {
    title: 'Rust Systems Developer',
    description: 'Learn systems programming with Rust: safety, memory management, and concurrency.',
    nodesText: 'Rust Syntax, Ownership & Borrowing, Structs & Enums, Error Handling, Smart Pointers, Concurrency'
  },
  python: {
    title: 'Python AI/ML Engineer',
    description: 'Master Python for artificial intelligence, machine learning, and deep neural networks.',
    nodesText: 'Python Basics, NumPy, Pandas, Data Visualization, Scikit-Learn, Deep Learning'
  },
  sql: {
    title: 'SQL & Databases',
    description: 'Relational database design, query optimization, indexing, and transactions.',
    nodesText: 'SQL Queries, Aggregations & Joins, Subqueries & CTEs, Indexing, Normalization, Transactions'
  },
  js_ts: {
    title: 'JavaScript/TypeScript Developer',
    description: 'Modern web development with JavaScript and TypeScript: fundamentals, async programming, and testing.',
    nodesText: 'JS Fundamentals, Async JS, DOM & Event Loop, TypeScript Interfaces, Node.js, Jest Testing'
  }
} as const;

export default function ProjectsModule() {
  const {
    sprints, dsaProblems, roadmaps, resources, devGoals,
    pomodoroStats,
    addSprint,
    addSprintTask, updateSprintTask, deleteSprintTask,
    updateRoadmapNode,
    addRoadmap, deleteRoadmap,
    addResource, deleteResource,
    addDevGoal, updateDevGoal, deleteDevGoal,
    showConfirm
  } = useAppStore(useShallow(state => ({
    sprints: state.sprints,
    dsaProblems: state.dsaProblems,
    roadmaps: state.roadmaps,
    resources: state.resources,
    devGoals: state.devGoals,
    pomodoroStats: state.pomodoroStats,
    addSprint: state.addSprint,
    addSprintTask: state.addSprintTask,
    updateSprintTask: state.updateSprintTask,
    deleteSprintTask: state.deleteSprintTask,
    updateRoadmapNode: state.updateRoadmapNode,
    addRoadmap: state.addRoadmap,
    deleteRoadmap: state.deleteRoadmap,
    addResource: state.addResource,
    deleteResource: state.deleteResource,
    addDevGoal: state.addDevGoal,
    updateDevGoal: state.updateDevGoal,
    deleteDevGoal: state.deleteDevGoal,
    showConfirm: state.showConfirm
  })));

  const [activeTab, setActiveTab] = useState<SubTab>('board');
  const [isFocusMode, setIsFocusMode] = useState(() => localStorage.getItem('phq_focus_mode') === 'true');

  // Modals Visibility
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);

  // Sprint / Task inputs
  const [selectedSprintId, setSelectedSprintId] = useState<string>(sprints[0]?.id || '');
  const activeSprint = sprints.find(s => s.id === selectedSprintId) || sprints[0];
  const [newSprintTitle, setNewSprintTitle] = useState('');

  useEffect(() => {
    if (sprints.length > 0 && (!selectedSprintId || !sprints.some(s => s.id === selectedSprintId))) {
      setSelectedSprintId(sprints[0].id);
    }
  }, [sprints, selectedSprintId]);

  const handleSeedDemoSprint = async () => {
    const demoSprint: Sprint = {
      id: `sprint-demo-${Date.now()}`,
      title: 'Sprint 1: Bootstrap Core App',
      startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      endDate: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString(),
      status: 'active',
      tasks: [
        { id: `task-d1-${Date.now()}`, title: 'Setup Supabase schemas & migrations', storyPoints: 3, priority: 'high', status: 'done', tags: ['database', 'backend'] },
        { id: `task-d2-${Date.now()}`, title: 'Build Apple Wallet-style dashboard UI', storyPoints: 5, priority: 'high', status: 'in_progress', tags: ['frontend', 'design'] },
        { id: `task-d3-${Date.now()}`, title: 'Implement custom checkbox check animations', storyPoints: 2, priority: 'medium', status: 'todo', tags: ['frontend', 'animation'] },
        { id: `task-d4-${Date.now()}`, title: 'Write unit tests for authentication store', storyPoints: 1, priority: 'low', status: 'backlog', tags: ['testing'] },
        { id: `task-d5-${Date.now()}`, title: 'Fix mobile layout responsiveness bugs', storyPoints: 3, priority: 'high', status: 'review', tags: ['frontend', 'responsive'] }
      ]
    };
    await addSprint(demoSprint);
    setSelectedSprintId(demoSprint.id);
    triggerDynamicIsland('Demo Sprint Seeded', 'Sprint 1 successfully initialized!', 'success', 'confetti');
  };
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(1);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Roadmap inputs
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('roadmap-frontend');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<keyof typeof ROADMAP_TEMPLATES>('custom');
  const [newRoadmapTitle, setNewRoadmapTitle] = useState('');
  const [newRoadmapDescription, setNewRoadmapDescription] = useState('');
  const [newRoadmapNodesText, setNewRoadmapNodesText] = useState('');

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

  const handleTemplateChange = (key: keyof typeof ROADMAP_TEMPLATES) => {
    setSelectedTemplateKey(key);
    const template = ROADMAP_TEMPLATES[key];
    setNewRoadmapTitle(template.title);
    setNewRoadmapDescription(template.description);
    setNewRoadmapNodesText(template.nodesText);
  };

  const handleCreateRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoadmapTitle.trim()) return;

    const parsedNodes = newRoadmapNodesText
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .map((label, idx) => ({
        id: `node-${Date.now()}-${idx}`,
        label,
        completed: false
      }));

    const newRoadmap = {
      id: `roadmap-${Date.now()}`,
      title: newRoadmapTitle.trim(),
      description: newRoadmapDescription.trim(),
      nodes: parsedNodes
    };

    addRoadmap(newRoadmap);
    setSelectedRoadmapId(newRoadmap.id);
    
    // reset form
    setNewRoadmapTitle('');
    setNewRoadmapDescription('');
    setNewRoadmapNodesText('');
    setSelectedTemplateKey('custom');
    setIsCreatingRoadmap(false);
    triggerDynamicIsland('Roadmap Created', newRoadmap.title, 'success', 'confetti');
  };

  const handleCancelCreateRoadmap = () => {
    setNewRoadmapTitle('');
    setNewRoadmapDescription('');
    setNewRoadmapNodesText('');
    setSelectedTemplateKey('custom');
    setIsCreatingRoadmap(false);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-16 mx-auto text-left max-w-7xl">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col justify-between gap-4 pb-2 border-b md:flex-row md:items-center border-border/40">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary">
            Developer Workspace
          </h1>
          <p className="mt-1 text-xs text-text-secondary">Manage sprints, track DSA learning stats, and test regex or APIs.</p>
        </div>

        {/* Action pills */}
        <div className="flex items-center gap-2">
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
      <div className="flex gap-4 border-b border-border/40">
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
                selectedSprintId={selectedSprintId}
                setSelectedSprintId={setSelectedSprintId}
                setIsCreatingSprint={setIsCreatingSprint}
                setIsAddingTask={setIsAddingTask}
                updateSprintTask={updateSprintTask}
                deleteSprintTask={deleteSprintTask}
                onSeedDemo={handleSeedDemoSprint}
              />
            )}
            {activeTab === 'analytics' && (
              <DeveloperAnalyticsView 
                dsaProblems={dsaProblems}
                devGoals={devGoals}
                pomodoroStats={pomodoroStats}
                addDevGoal={addDevGoal}
                updateDevGoal={updateDevGoal}
                deleteDevGoal={deleteDevGoal}
              />
            )}
            {activeTab === 'learning' && (
              <LearningCenterView 
                roadmaps={roadmaps}
                resources={resources}
                updateRoadmapNode={updateRoadmapNode}
                addResource={addResource}
                deleteResource={deleteResource}
                selectedRoadmapId={selectedRoadmapId}
                setSelectedRoadmapId={setSelectedRoadmapId}
                setIsCreatingRoadmap={setIsCreatingRoadmap}
                deleteRoadmap={deleteRoadmap}
                showConfirm={showConfirm}
                isFocusMode={isFocusMode}
                toggleFocusMode={toggleFocusMode}
                pomodoroStats={pomodoroStats}
              />
            )}
            {activeTab === 'utilities' && <DeveloperUtilitiesView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Create Sprint Modal */}
      <Modal
        isOpen={isCreatingSprint}
        onClose={() => setIsCreatingSprint(false)}
        title="Create New Sprint"
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleCreateSprint} className="flex flex-col w-full gap-4">
          <input
            type="text"
            required
            placeholder="Sprint Title (e.g. Sprint 2: UI Overhaul)"
            value={newSprintTitle}
            onChange={e => setNewSprintTitle(e.target.value)}
            className="input-field"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingSprint(false)}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddingTask}
        onClose={() => setIsAddingTask(false)}
        title="Add Task to Sprint"
        maxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleAddTask} className="flex flex-col w-full gap-4">
          <input
            type="text"
            required
            placeholder="Task Description"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="input-field"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col min-w-0 gap-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Story Points</span>
              <select
                value={newTaskPoints}
                onChange={e => setNewTaskPoints(Number(e.target.value))}
                className="select-field"
              >
                <option value={1}>1 SP (Easy)</option>
                <option value={2}>2 SP</option>
                <option value={3}>3 SP (Medium)</option>
                <option value={5}>5 SP (Hard)</option>
                <option value={8}>8 SP (Complex)</option>
              </select>
            </label>

            <label className="flex flex-col min-w-0 gap-1">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Priority</span>
              <select
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value as any)}
                className="select-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Custom Roadmap Modal */}
      <Modal
        isOpen={isCreatingRoadmap}
        onClose={handleCancelCreateRoadmap}
        title="Create Custom Roadmap"
        maxWidthClassName="max-w-3xl"
      >
        <form onSubmit={handleCreateRoadmap} className="flex flex-col w-full gap-4">
          <label className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Choose Template</span>
            <select
              value={selectedTemplateKey}
              onChange={e => handleTemplateChange(e.target.value as keyof typeof ROADMAP_TEMPLATES)}
              className="select-field"
            >
              <option value="custom">Custom (Blank)</option>
              <option value="rust">Rust Systems Developer</option>
              <option value="python">Python AI/ML Engineer</option>
              <option value="sql">SQL & Databases</option>
              <option value="js_ts">JavaScript/TypeScript Developer</option>
            </select>
          </label>

          <label className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Path Title</span>
            <input
              type="text"
              required
              placeholder="e.g. Web3 Systems Architect"
              value={newRoadmapTitle}
              onChange={e => setNewRoadmapTitle(e.target.value)}
              className="input-field"
            />
          </label>

          <label className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Description</span>
            <textarea
              rows={2}
              required
              placeholder="Describe this learning path..."
              value={newRoadmapDescription}
              onChange={e => setNewRoadmapDescription(e.target.value)}
              className="textarea-field min-h-[92px] resize-none"
            />
          </label>

          <label className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Nodes (comma-separated)</span>
            <textarea
              rows={3}
              required
              placeholder="e.g. Basic Syntax, Advanced Types, Project Building"
              value={newRoadmapNodesText}
              onChange={e => setNewRoadmapNodesText(e.target.value)}
              className="resize-none textarea-field"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelCreateRoadmap}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Save Path
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

function SprintBoardView({
  sprints,
  selectedSprintId,
  setSelectedSprintId,
  setIsCreatingSprint,
  setIsAddingTask,
  updateSprintTask,
  deleteSprintTask,
  onSeedDemo
}: {
  sprints: Sprint[];
  selectedSprintId: string;
  setSelectedSprintId: (id: string) => void;
  setIsCreatingSprint: (v: boolean) => void;
  setIsAddingTask: (v: boolean) => void;
  updateSprintTask: (sprintId: string, taskId: string, data: Partial<SprintTask>) => void;
  deleteSprintTask: (sprintId: string, taskId: string) => void;
  onSeedDemo: () => void;
}) {
  if (sprints.length === 0) {
    return (
      <div className="bg-surface border border-border/40 rounded-[32px] p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 max-w-[20rem] m-auto shadow-sm my-8 text-left">
        <div className="flex items-center justify-center w-16 h-16 shadow-inner rounded-2xl bg-rose-500/10 text-rose-500">
          <IconTerminal className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h3 className="text-lg font-black tracking-tight text-text-primary">Setup Your First Agile Sprint</h3>
          <p className="max-w-full text-xs leading-normal text-text-secondary">
            Create custom sprints, track story points velocity, manage Kanban issue pipelines, and visualize timeline progress.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-3 select-none">
          <button 
            onClick={() => setIsCreatingSprint(true)}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-rose-500/10"
          >
            Create New Sprint
          </button>
          <button 
            onClick={onSeedDemo}
            className="px-5 py-2.5 bg-surface-alt hover:bg-surface-hover border border-border rounded-2xl text-xs font-bold text-text-primary transition-all cursor-pointer"
          >
            ⚡ Initialize Demo Sprint
          </button>
        </div>
      </div>
    );
  }

  const activeSprint = sprints.find(s => s.id === selectedSprintId) || sprints[0];

  const moveTask = (taskId: string, targetStatus: SprintTask['status']) => {
    if (!activeSprint) return;
    updateSprintTask(activeSprint.id, taskId, { status: targetStatus });
  };

  const totalPoints = activeSprint?.tasks.reduce((sum, t) => sum + t.storyPoints, 0) || 0;
  const completedPoints = activeSprint?.tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.storyPoints, 0) || 0;
  const progressPct = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Earliest sprint date for Gantt scaling
  const earliestDate = useMemo(() => {
    if (sprints.length === 0) return Date.now();
    return Math.min(...sprints.map(s => new Date(s.startDate).getTime()));
  }, [sprints]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Sprint Header Panel */}
      <div className="flex flex-col justify-between gap-4 p-5 text-left border shadow-sm select-none bg-surface border-border/40 rounded-3xl md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <select 
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            className="bg-surface-alt border border-border/40 text-text-primary rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
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
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="leading-tight">
              <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">Velocity</span>
              <span className="font-bold text-text-primary">{completedPoints} / {totalPoints} story points ({progressPct}%)</span>
            </div>
            <div className="w-32 h-1.5 bg-border/20 rounded-full overflow-hidden shrink-0">
              <div className="h-full transition-all duration-300 rounded-full bg-rose-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board Grid */}
      {activeSprint && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {(['backlog', 'in_progress', 'review', 'done'] as SprintTask['status'][]).map(status => {
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
                <div className="flex items-center justify-between pb-1 border-b select-none border-border/30">
                  <span className="text-[10px] font-black uppercase text-text-primary tracking-wider">{statusLabel}</span>
                  <span className="text-[9px] font-black text-text-muted bg-surface-alt px-1.5 py-0.5 rounded-full border border-border/30">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[400px]">
                  {statusTasks.map(task => (
                    <div 
                      key={task.id}
                      className="bg-surface border border-border/40 p-2.5 rounded-xl flex flex-col gap-2 group hover:shadow-sm transition-all relative pr-8 text-left"
                    >
                      {/* Line 1 (Top): Priority dot and Task title */}
                      <div className="flex items-start min-w-0 gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`} />
                        <span className="text-xs font-bold leading-tight text-text-primary" title={task.title}>
                          {task.title}
                        </span>
                      </div>

                      {/* Line 2 (Bottom): Separator, SP badge left, select dropdown right */}
                      <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t select-none border-border/20">
                        <span className="text-[9px] font-black text-text-muted bg-surface-alt px-1.5 py-0.5 rounded-lg border border-border/30 shrink-0">
                          {task.storyPoints} SP
                        </span>
                        <select
                          value={task.status}
                          onChange={e => moveTask(task.id, e.target.value as SprintTask['status'])}
                          className="bg-surface-alt border border-border/45 text-[9px] font-bold text-text-secondary rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer hover:bg-surface-alt/80"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in_progress">Active</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      <button
                        onClick={() => deleteSprintTask(activeSprint.id, task.id)}
                        className="opacity-0 group-hover:opacity-100 absolute right-2.5 top-2.5 text-text-muted hover:text-red-500 transition-opacity cursor-pointer p-0.5 select-none"
                        title="Delete Task"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {status === 'backlog' && (
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="w-full py-2 bg-surface-alt hover:bg-stone-100 dark:hover:bg-stone-850 border border-dashed border-border/40 text-text-muted hover:text-text-secondary rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1 select-none"
                  >
                    <IconPlus className="w-3.5 h-3.5" /> Add Issue
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Gantt Timeline/Milestones Widget */}
      <div className="p-5 text-left border shadow-sm bg-surface border-border/40 rounded-3xl">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b select-none border-border/30">
          <IconCalendar className="w-4.5 h-4.5 text-rose-500" />
          <span className="text-xs font-black tracking-wider uppercase text-text-primary">Sprint Timeline (Gantt)</span>
        </div>

        {/* Timeline Weekly Header Grid */}
        <div className="hidden lg:grid grid-cols-12 gap-1 text-center text-[9px] font-black uppercase text-text-muted mb-2 border-b border-border/20 pb-2 select-none">
          <div className="col-span-4 pl-2 text-left">Sprints & Dates</div>
          <div className="grid grid-cols-6 col-span-8 gap-1">
            <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 5</span><span>Week 6</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {sprints.map((s) => {
            const progress = s.tasks.length > 0 
              ? Math.round((s.tasks.filter(t => t.status === 'done').length / s.tasks.length) * 100) 
              : 0;

            // Plot relative Gantt Bar positions on a 42-day timeline
            const totalTimelineDays = 42;
            const startOffsetMs = new Date(s.startDate).getTime() - earliestDate;
            const startOffsetDays = Math.max(0, startOffsetMs / (24 * 3600 * 1000));
            const durationMs = new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
            const durationDays = Math.max(3, durationMs / (24 * 3600 * 1000));

            const leftPct = Math.min(80, (startOffsetDays / totalTimelineDays) * 100);
            const widthPct = Math.min(100 - leftPct, (durationDays / totalTimelineDays) * 100);

            return (
              <div key={s.id} className="grid items-center grid-cols-1 gap-4 pb-3 border-b lg:grid-cols-12 border-border/20 last:border-0 last:pb-0">
                <div className="min-w-0 lg:col-span-4">
                  <h4 className="text-xs font-bold truncate text-text-primary">{s.title}</h4>
                  <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider mt-0.5">
                    {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center w-full gap-3 lg:col-span-8">
                  {/* Dynamic Gantt visual bar */}
                  <div className="relative flex-grow hidden h-8 overflow-hidden border select-none bg-surface-alt border-border/30 rounded-xl lg:block">
                    <div 
                      className={`absolute h-full border-l-2 flex items-center px-3 transition-all ${
                        s.id === selectedSprintId 
                          ? 'bg-rose-500/10 border-rose-500' 
                          : 'bg-stone-500/10 border-stone-400'
                      }`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      <div 
                        className={`absolute inset-y-0 left-0 transition-all ${
                          s.id === selectedSprintId ? 'bg-rose-500/15' : 'bg-stone-500/15'
                        }`} 
                        style={{ width: `${progress}%` }} 
                      />
                      <span className={`text-[10px] font-black truncate relative z-10 ${
                        s.id === selectedSprintId ? 'text-rose-500' : 'text-text-secondary'
                      }`}>
                        {progress}% Done ({s.tasks.length} issues)
                      </span>
                    </div>
                  </div>

                  {/* Fallback progress bar for Mobile viewports */}
                  <div className="flex items-center flex-1 max-w-xs gap-3 select-none lg:hidden">
                    <div className="relative flex-1 h-3 overflow-hidden rounded-full bg-border/20">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          s.id === selectedSprintId ? 'bg-rose-500' : 'bg-stone-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-text-primary">{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function DeveloperAnalyticsView({
  dsaProblems, devGoals, pomodoroStats,
  addDevGoal, updateDevGoal, deleteDevGoal
}: {
  dsaProblems: DsaProblem[];
  devGoals: DevGoal[];
  pomodoroStats: any;
  addDevGoal: (goal: DevGoal) => void;
  updateDevGoal: (id: string, data: Partial<DevGoal>) => void;
  deleteDevGoal: (id: string) => void;
}) {
  const snippets = useAppStore(state => state.snippets);
  const tilLogs = useAppStore(state => state.tilLogs);

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(5);
  const [newGoalMetric, setNewGoalMetric] = useState('commits');

  // Compute contribution heatmap grid using real DSA, Snippet, and TIL dates
  const heatmapData = useMemo(() => {
    // Generate dates for the past 53 weeks (371 days)
    // Ending on the upcoming Saturday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek));

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 371 + 1);

    const activityMap: Record<string, number> = {};
    let totalCommits = 0;

    // 1. Count solved DSA problems
    dsaProblems.forEach(p => {
      if (p.status === 'solved' && p.solvedAt) {
        const dStr = p.solvedAt.split('T')[0];
        activityMap[dStr] = (activityMap[dStr] || 0) + 1;
        totalCommits++;
      }
    });

    // 2. Count code snippets created
    snippets.forEach(s => {
      if (s.createdAt) {
        const dStr = s.createdAt.split('T')[0];
        activityMap[dStr] = (activityMap[dStr] || 0) + 1;
        totalCommits++;
      }
    });

    // 3. Count TIL logs created
    tilLogs.forEach(t => {
      if (t.createdAt) {
        const dStr = t.createdAt.split('T')[0];
        activityMap[dStr] = (activityMap[dStr] || 0) + 1;
        totalCommits++;
      }
    });

    const grid: { date: string; intensity: number; count: number }[][] = [];
    const currentDate = new Date(startDate);

    for (let c = 0; c < 53; c++) {
      const col: { date: string; intensity: number; count: number }[] = [];
      for (let r = 0; r < 7; r++) {
        const dStr = currentDate.toISOString().split('T')[0];
        const realCount = activityMap[dStr] || 0;

        // Base background pattern to ensure design aesthetics look GitHub-profile active
        const seedValue = Math.sin(c * 0.15) * Math.cos(r * 0.25);
        const baseIntensity = seedValue > 0.65 ? 2 : seedValue > 0.45 ? 1 : 0;

        let intensity = baseIntensity;
        if (realCount > 0) {
          intensity = realCount >= 3 ? 4 : realCount === 2 ? 2 : 1;
        }

        col.push({
          date: dStr,
          intensity,
          count: realCount
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      grid.push(col);
    }
    return { grid, totalCommits };
  }, [dsaProblems, snippets, tilLogs]);

  // Compute language distribution dynamically based on code snippets languages
  const languageDistribution = useMemo(() => {
    if (!snippets || snippets.length === 0) {
      return [
        { name: 'TypeScript / React', pct: 60, color: 'bg-blue-500' },
        { name: 'Python / ML', pct: 25, color: 'bg-emerald-500' },
        { name: 'Go / Backend', pct: 15, color: 'bg-teal-500' }
      ];
    }

    const counts: Record<string, number> = {};
    snippets.forEach(s => {
      const lang = s.language || 'Other';
      let name = lang;
      if (lang.toLowerCase() === 'typescript' || lang.toLowerCase() === 'ts' || lang.toLowerCase() === 'tsx') name = 'TypeScript / React';
      else if (lang.toLowerCase() === 'javascript' || lang.toLowerCase() === 'js' || lang.toLowerCase() === 'jsx') name = 'JavaScript';
      else if (lang.toLowerCase() === 'python' || lang.toLowerCase() === 'py') name = 'Python / ML';
      else if (lang.toLowerCase() === 'go' || lang.toLowerCase() === 'golang') name = 'Go / Backend';
      else if (lang.toLowerCase() === 'rust') name = 'Rust / Systems';
      else if (lang.toLowerCase() === 'html' || lang.toLowerCase() === 'css') name = 'HTML/CSS';
      else name = lang.charAt(0).toUpperCase() + lang.slice(1);

      counts[name] = (counts[name] || 0) + 1;
    });

    const total = snippets.length;
    return Object.entries(counts)
      .map(([name, count]) => {
        const pct = Math.round((count / total) * 100);
        let color = 'bg-stone-500';
        if (name.includes('TypeScript')) color = 'bg-blue-500';
        else if (name.includes('JavaScript')) color = 'bg-amber-500';
        else if (name.includes('Python')) color = 'bg-emerald-500';
        else if (name.includes('Go')) color = 'bg-teal-500';
        else if (name.includes('Rust')) color = 'bg-orange-500';
        else if (name.includes('HTML')) color = 'bg-rose-500';

        return { name, pct, color };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
  }, [snippets]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    
    // Fix: ID must be a valid UUID to prevent Supabase foreign key/insert error
    const newGoal: DevGoal = {
      id: crypto.randomUUID(),
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

  const productivityScore = useMemo(() => {
    const solvedDsa = dsaProblems.filter(p => p.status === 'solved').length;
    const focusHours = pomodoroStats?.totalMinutes ? (pomodoroStats.totalMinutes / 60) : 0;
    
    const score = Math.min(Math.round(75 + (solvedDsa * 2) + (focusHours * 1.5)), 100);
    return score;
  }, [dsaProblems, pomodoroStats]);

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Coding Contributions Heatmap */}
      <div className="p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <IconTerminal className="w-4.5 h-4.5 text-green-500" />
            <span className="text-xs font-black tracking-wider uppercase text-text-primary">Coding Contributions</span>
          </div>
          <span className="text-[10px] text-text-muted font-bold">{heatmapData.totalCommits} Contributions registered</span>
        </div>

        <div className="py-1 overflow-x-auto scrollbar-none">
          <div className="flex gap-[3px] min-w-[500px]">
            {heatmapData.grid.map((col, cIdx) => (
              <div key={cIdx} className="flex flex-col gap-[3px]">
                {col.map((cell, rIdx) => (
                  <div 
                    key={rIdx}
                    className={`w-[9px] h-[9px] rounded-[1.5px] transition-colors ${
                      cell.intensity === 4 ? 'bg-green-500' :
                      cell.intensity === 2 ? 'bg-green-400/60' :
                      cell.intensity === 1 ? 'bg-green-400/20' : 'bg-stone-100 dark:bg-stone-850'
                    }`}
                    title={`${cell.date}: ${cell.count} real events (Intensity: ${cell.intensity})`}
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

      {/* Language Breakdown & Productivity scorecard */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        
        {/* Languages progress bar stack */}
        <div className="flex flex-col justify-between p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
          <div>
            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-border/30">
              <IconChartBar className="w-4.5 h-4.5 text-blue-500" />
              <span className="text-xs font-black tracking-wider uppercase text-text-primary">Language Distribution</span>
            </div>

            <div className="flex flex-col gap-3">
              {languageDistribution.map(lang => (
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
        <div className="flex flex-col justify-between p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-border/30">
            <IconTarget className="w-4.5 h-4.5 text-amber-500" />
            <span className="text-xs font-black tracking-wider uppercase text-text-primary">Weekly Productivity Score</span>
          </div>

          <div className="flex items-center justify-between gap-6 py-2">
            <div className="leading-tight">
              <span className="text-4xl font-black text-text-primary">{productivityScore}%</span>
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider mt-1">Consistency rating: Excellent</span>
            </div>
            
            <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
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

      {/* Goal Tracker */}
      <div className="flex flex-col gap-4 p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <IconFlame className="w-4.5 h-4.5 text-rose-500" />
          <span className="text-xs font-black tracking-wider uppercase text-text-primary">Active Goals</span>
        </div>

        <form onSubmit={handleCreateGoal} className="flex flex-col gap-3 sm:flex-row items-end sm:items-center justify-between shrink-0">
          <input 
            type="text"
            required
            placeholder="New Goal Title (e.g. Solve 5 Hard DSA)"
            value={newGoalTitle}
            onChange={e => setNewGoalTitle(e.target.value)}
            className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none w-full"
          />
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <input 
              type="number"
              required
              min={1}
              value={newGoalTarget}
              onChange={e => setNewGoalTarget(Number(e.target.value))}
              className="w-16 bg-surface-alt border border-border/40 rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none"
            />
            
            <CustomSelect
              value={newGoalMetric}
              onChange={setNewGoalMetric}
              options={[
                { value: 'commits', label: 'Commits' },
                { value: 'dsa problems', label: 'DSA Problems' },
                { value: 'hours', label: 'Hours' },
                { value: 'tasks', label: 'Tasks' },
              ]}
              placeholder="Metric"
              className="w-32"
            />

            <button 
              type="submit"
              className="px-4 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer active:scale-[0.98]"
            >
              Add Goal
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-3">
          {devGoals.map(goal => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <div key={goal.id} className="flex flex-col justify-between gap-2 pb-3 border-b sm:flex-row sm:items-center border-border/20 last:border-0 last:pb-0">
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
                    className="transition-colors cursor-pointer text-text-muted hover:text-red-500"
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

function LearningCenterView({
  roadmaps,
  resources,
  updateRoadmapNode,
  addResource,
  deleteResource,
  selectedRoadmapId,
  setSelectedRoadmapId,
  setIsCreatingRoadmap,
  deleteRoadmap,
  showConfirm,
  isFocusMode,
  toggleFocusMode,
  pomodoroStats
}: {
  roadmaps: any[];
  resources: ResourceBookmark[];
  updateRoadmapNode: (roadmapId: string, nodeId: string, completed: boolean) => void;
  addResource: (res: ResourceBookmark) => void;
  deleteResource: (id: string) => void;
  selectedRoadmapId: string;
  setSelectedRoadmapId: (id: string) => void;
  setIsCreatingRoadmap: (v: boolean) => void;
  deleteRoadmap: (id: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  pomodoroStats: any;
}) {
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');

  // Streak Days State: S M T W T F S
  const [streakDays, setStreakDays] = useState<boolean[]>(() => {
    const today = new Date().getDay();
    // Default: check off days before today to simulate a streak, leave today/future unchecked
    return Array.from({ length: 7 }, (_, i) => i < today);
  });

  const todayIdx = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.

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
  const activeNodes = activeRoadmap?.nodes || [];
  const totalNodes = activeNodes.length;
  const completedNodesCount = activeNodes.filter((n: any) => n.completed).length;
  
  const roadmapProgress = totalNodes > 0 
    ? Math.round((completedNodesCount / totalNodes) * 100)
    : 0;

  // Distribute active roadmap's nodes dynamically among the 4 phases
  const getPhaseNodes = (nodes: any[]) => {
    const total = nodes.length;
    if (total === 0) return [[], [], [], []];
    
    if (total < 4) {
      const result: any[][] = [[], [], [], []];
      nodes.forEach((node, i) => {
        result[i % 4].push(node);
      });
      return result;
    }
    
    // Phase 1 gets first 25% of nodes, Phase 2 gets next 35% of nodes, Phase 3 gets next 20%, Phase 4 gets the rest.
    const p1Count = Math.max(1, Math.floor(total * 0.25)) || 1;
    const p2Count = Math.max(1, Math.floor(total * 0.35)) || 1;
    const p3Count = Math.max(1, Math.floor(total * 0.20)) || 1;
    
    const p1 = nodes.slice(0, p1Count);
    const p2 = nodes.slice(p1Count, p1Count + p2Count);
    const p3 = nodes.slice(p1Count + p2Count, p1Count + p2Count + p3Count);
    const p4 = nodes.slice(p1Count + p2Count + p3Count);
    
    return [p1, p2, p3, p4];
  };

  const [phase1Nodes, phase2Nodes, phase3Nodes, phase4Nodes] = getPhaseNodes(activeNodes);

  const firstUncompletedNode = activeNodes.find((n: any) => !n.completed);

  const getMockDuration = (nodeId: string) => {
    const hash = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const options = ['15 min', '30 min', '45 min', '60 min'];
    return options[hash % options.length];
  };

  const getPhaseProgress = (phaseNodes: any[]) => {
    if (phaseNodes.length === 0) return 0;
    const completed = phaseNodes.filter(n => n.completed).length;
    return Math.round((completed / phaseNodes.length) * 100);
  };

  const phasesConfig = [
    {
      index: 0,
      title: 'Foundations',
      description: 'Start your journey with the basics.',
      icon: IconRocket,
      nodes: phase1Nodes,
    },
    {
      index: 1,
      title: 'Build & Practice',
      description: 'Learn by doing and building.',
      icon: IconBook,
      nodes: phase2Nodes,
    },
    {
      index: 2,
      title: 'Advanced Topics',
      description: 'Deep dive into advanced concepts.',
      icon: IconFlame,
      nodes: phase3Nodes,
    },
    {
      index: 3,
      title: 'Mastery & Real World',
      description: 'Apply your skills in real world scenarios.',
      icon: IconGlobe,
      nodes: phase4Nodes,
    },
  ];

  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true
  });

  const togglePhase = (index: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Stats computation for Right Column
  const pomodoroMinutes = pomodoroStats?.totalMinutes || 0;
  const focusHours = pomodoroMinutes > 0 
    ? `${Math.floor(pomodoroMinutes / 60)}h ${pomodoroMinutes % 60}m` 
    : '8h 30m';

  const completedRoadmapsCount = roadmaps.filter(
    r => r.nodes && r.nodes.length > 0 && r.nodes.every((n: any) => n.completed)
  ).length;

  return (
    <div className="grid grid-cols-1 gap-6 text-left lg:grid-cols-10">
      
      {/* ── Left Column (70% width) ── */}
      <div className="flex flex-col gap-6 lg:col-span-7">
        
        {/* Header Section */}
        <div>
          <h2 className="text-xl font-black tracking-tight uppercase text-text-primary">Learning Path</h2>
          <p className="mt-1 text-xs text-text-secondary">Your personalized journey to grow every day.</p>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col justify-between gap-3 p-4 border shadow-sm sm:flex-row sm:items-center bg-surface border-border/40 rounded-3xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary">Current Path:</span>
            <select
              value={selectedRoadmapId}
              onChange={e => setSelectedRoadmapId(e.target.value)}
              className="bg-surface-alt border border-border/40 text-xs font-bold text-text-primary rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {roadmaps.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingRoadmap(true)}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <IconPlus className="w-3.5 h-3.5" /> New Path
            </button>

            {selectedRoadmapId !== 'roadmap-frontend' && selectedRoadmapId !== 'roadmap-backend' && (
              <button
                type="button"
                onClick={() => {
                  showConfirm(
                    'Delete Roadmap',
                    'Are you sure you want to delete this custom roadmap? This action cannot be undone.',
                    () => {
                      deleteRoadmap(selectedRoadmapId);
                      setSelectedRoadmapId('roadmap-frontend');
                    }
                  );
                }}
                className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                title="Delete Custom Roadmap"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Timeline Track with Phase Cards */}
        <div className="relative flex flex-col gap-6 pl-8 ml-4 border-l-2 border-dashed border-border/30">
          {phasesConfig.map((phase) => {
            const phaseProgress = getPhaseProgress(phase.nodes);
            const isExpanded = expandedPhases[phase.index];
            const Icon = phase.icon;

            return (
              <div key={phase.index} className="relative">
                
                {/* Floating circle with step number */}
                <div className="absolute -left-[46px] top-5 w-7 h-7 rounded-full bg-surface border-2 border-border/40 flex items-center justify-center text-xs font-black text-text-primary z-10 shadow-sm">
                  {phase.index + 1}
                </div>

                {/* Expandable Phase Card */}
                <div className="p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
                  
                  {/* Header */}
                  <div 
                    onClick={() => togglePhase(phase.index)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 text-purple-500 bg-purple-500/10 rounded-xl">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black tracking-wider uppercase text-text-primary">{phase.title}</h4>
                        <p className="text-text-secondary text-[11px] mt-0.5 font-medium">{phase.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-surface-alt border border-border/40 rounded-full text-text-secondary">
                        {phaseProgress}%
                      </span>
                      {isExpanded ? (
                        <IconChevronUp className="w-4 h-4 text-text-muted" />
                      ) : (
                        <IconChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Step Rows */}
                  {isExpanded && (
                    <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-border/20">
                      {phase.nodes.length === 0 ? (
                        <p className="text-[11px] text-text-muted italic py-1">No lessons in this phase.</p>
                      ) : (
                        phase.nodes.map((node: any) => {
                          const isCompleted = node.completed;
                          const isFirstUncompleted = firstUncompletedNode && node.id === firstUncompletedNode.id;
                          const isLocked = !isCompleted && !isFirstUncompleted;
                          const duration = getMockDuration(node.id);

                          return (
                            <div 
                              key={node.id}
                              className="flex items-center justify-between p-2 transition-colors hover:bg-surface-alt rounded-xl group"
                            >
                              <div className="flex items-center min-w-0 gap-3">
                                <button
                                  type="button"
                                  onClick={() => updateRoadmapNode(activeRoadmap.id, node.id, !node.completed)}
                                  className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                                    isCompleted 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'border-border/60 hover:border-emerald-400 bg-surface'
                                  }`}
                                >
                                  {isCompleted && <IconCheck className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-xs font-bold text-text-primary truncate ${isCompleted ? 'line-through text-text-muted' : ''}`}>
                                    {node.label}
                                  </span>
                                  <span className="text-[9px] text-text-muted font-semibold mt-0.5">{duration}</span>
                                </div>
                              </div>

                              <div className="ml-3 shrink-0">
                                {isCompleted && (
                                  <IconCheck className="w-4 h-4 text-emerald-500 stroke-[3]" />
                                )}
                                {isFirstUncompleted && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!isFocusMode) {
                                        toggleFocusMode();
                                      } else {
                                        triggerDynamicIsland('Already in Focus Mode', 'Your timer is running', 'success', 'award');
                                      }
                                    }}
                                    className="p-1 transition-colors rounded-lg cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                    title="Start Focus Mode (Up Next)"
                                  >
                                    <IconPlayerPlay className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                )}
                                {isLocked && (
                                  <IconLock className="w-4 h-4 text-text-muted/65" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Column (30% width) ── */}
      <div className="flex flex-col gap-6 lg:col-span-3">
        
        {/* Your Progress Card */}
        <div className="flex flex-col gap-4 p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
          <h3 className="text-xs font-black tracking-wider uppercase text-text-primary">Your Progress</h3>
          
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="var(--border-border)" strokeWidth="4.5" fill="transparent" className="opacity-20" />
                <circle 
                  cx="32" cy="32" r="26" 
                  stroke="#a855f7" 
                  strokeWidth="4.5" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - roadmapProgress / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-xs font-black text-text-primary">{roadmapProgress}%</span>
            </div>
            
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-bold truncate text-text-primary">{completedNodesCount} / {totalNodes} Lessons</span>
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Completed</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-3 text-xs font-bold border-t border-border/20 text-text-secondary">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text-muted">Time Spent:</span>
              <span>{focusHours}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text-muted">Paths Finished:</span>
              <span>{completedRoadmapsCount}</span>
            </div>
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="flex flex-col gap-3 p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wider uppercase text-text-primary">Current Streak</h3>
            <div className="flex items-center gap-1 text-xs font-black tracking-wider uppercase text-rose-500">
              <IconFlame className="w-4 h-4 fill-current" />
              <span>7 days</span>
            </div>
          </div>
          
          <p className="text-[10px] text-text-secondary font-semibold">Keep the momentum going by completing a step today!</p>
          
          <div className="flex items-center justify-between mt-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
              const isToday = idx === todayIdx;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[10px] font-black ${isToday ? 'text-rose-500' : 'text-text-muted'}`}>
                    {day}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...streakDays];
                      next[idx] = !next[idx];
                      setStreakDays(next);
                    }}
                    className={`w-6.5 h-6.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      streakDays[idx]
                        ? 'bg-rose-500 border-rose-500 text-white' 
                        : isToday
                          ? 'border-rose-500 bg-rose-500/10 hover:border-rose-600'
                          : 'border-border/60 hover:border-rose-400 bg-surface-alt'
                    }`}
                  >
                    {streakDays[idx] && <IconCheck className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Up Next Card */}
        <div className="flex flex-col gap-3 p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
          <h3 className="text-xs font-black tracking-wider uppercase text-text-primary">Up Next</h3>
          
          {firstUncompletedNode ? (
            <div className="flex items-center justify-between gap-3 p-3 border bg-surface-alt/55 border-border/20 rounded-2xl">
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-xs font-bold truncate text-text-primary" title={firstUncompletedNode.label}>
                  {firstUncompletedNode.label}
                </h4>
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block mt-0.5">
                  Ready to focus
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isFocusMode) {
                    toggleFocusMode();
                  } else {
                    triggerDynamicIsland('Already in Focus Mode', 'Your timer is running', 'success', 'award');
                  }
                }}
                className="flex items-center justify-center w-8 h-8 text-white transition-colors shadow-sm cursor-pointer rounded-xl bg-rose-500 hover:bg-rose-600 shrink-0"
                title="Start Focus Session"
              >
                <IconPlayerPlay className="w-4 h-4 fill-current" />
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
              <span className="block text-xs font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">All caught up! 🎉</span>
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-semibold block mt-1">You've completed this roadmap!</span>
            </div>
          )}
        </div>

        {/* Saved Resources Card */}
        <div className="flex flex-col gap-4 p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
          <div className="flex items-center justify-between pb-2 border-b border-border/30">
            <h3 className="text-xs font-black tracking-wider uppercase text-text-primary">Saved Resources</h3>
            <IconExternalLink className="w-4 h-4 text-purple-500" />
          </div>

          <form onSubmit={handleAddResource} className="flex flex-col gap-2">
            <input 
              type="text"
              required
              placeholder="Resource Name"
              value={resTitle}
              onChange={e => setResTitle(e.target.value)}
              className="w-full bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
            />
            <div className="flex gap-2">
              <input 
                type="url"
                required
                placeholder="https://..."
                value={resUrl}
                onChange={e => setResUrl(e.target.value)}
                className="flex-1 bg-surface-alt border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary focus:outline-none"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {resources.length === 0 ? (
              <p className="text-[11px] text-text-muted italic text-center py-4">No saved resources.</p>
            ) : (
              resources.map(res => (
                <div key={res.id} className="flex items-center justify-between p-2 border bg-surface-alt/40 border-border/20 rounded-xl">
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-xs font-semibold text-left truncate text-text-primary hover:text-purple-500 hover:underline"
                  >
                    {res.title}
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteResource(res.id)}
                    className="text-text-muted hover:text-red-500 transition-colors ml-2 cursor-pointer p-0.5"
                    title="Delete Resource"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

function DeveloperUtilitiesView() {
  const [apiUrl, setApiUrl] = useState('https://api.github.com/users/octocat');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexText, setRegexText] = useState('My email is test@example.com and alert@domain.co.in');
  const [isRegexModalOpen, setIsRegexModalOpen] = useState(false);

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

  const regexMatches = useMemo(() => {
    if (!regexPattern.trim() || !regexText.trim()) return [];
    try {
      let pattern = regexPattern.trim();
      let flags = 'g';
      
      // Parse slash-wrapped regexes like /^(?=.*[A-Z]).{8,}$/i
      if (pattern.startsWith('/') && pattern.includes('/', 1)) {
        const lastSlash = pattern.lastIndexOf('/');
        const rawFlags = pattern.slice(lastSlash + 1);
        pattern = pattern.slice(1, lastSlash);
        // Merge flags, ensuring global flag 'g' is active for matchAll
        flags = Array.from(new Set(['g', ...rawFlags])).join('');
      }

      const regex = new RegExp(pattern, flags);
      const matches = [...regexText.matchAll(regex)];
      return matches.map(m => m[0]);
    } catch {
      return ['Invalid Regex Pattern'];
    }
  }, [regexPattern, regexText]);

  const REGEX_PRESETS = [
    {
      name: 'Strong Password Verification',
      desc: 'At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character',
      pattern: '/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/'
    },
    {
      name: 'Email Address Validator',
      desc: 'Standard RFC-5322 matching for email addresses',
      pattern: '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/'
    },
    {
      name: 'Indian Phone Number',
      desc: '10 digits mobile number with optional +91/91 prefix',
      pattern: '/^(?:\\+91|91)?[6-9]\\d{9}$/'
    },
    {
      name: 'HTTP/HTTPS URL Link',
      desc: 'Standard web link pattern with optional subdomains/query strings',
      pattern: '/^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$/'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2">
      
      {/* REST API client */}
      <div className="flex flex-col gap-4 p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <IconSend className="w-4.5 h-4.5 text-rose-500" />
          <span className="text-xs font-black tracking-wider uppercase text-text-primary">REST API Client</span>
        </div>

        <form onSubmit={handleSendRequest} className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            <select
              value={apiMethod}
              onChange={e => setApiMethod(e.target.value as any)}
              className="bg-surface-alt border border-border/40 text-xs font-bold text-text-secondary rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer"
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
      <div className="flex flex-col gap-4 p-5 border shadow-sm bg-surface border-border/40 rounded-3xl">
        <div className="flex items-center justify-between pb-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <IconBrackets className="w-4.5 h-4.5 text-blue-500" />
            <span className="text-xs font-black tracking-wider uppercase text-text-primary">Regex Playground</span>
          </div>
          <button
            type="button"
            onClick={() => setIsRegexModalOpen(true)}
            className="px-2.5 py-1 text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-350 rounded-lg transition-colors cursor-pointer border border-border/10"
          >
            Guide & Presets
          </button>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">Regex Pattern</span>
            <input 
              type="text"
              required
              placeholder="e.g. /^[a-z]+$/i"
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

      {/* Regex Presets & Guide Modal */}
      <Modal
        isOpen={isRegexModalOpen}
        onClose={() => setIsRegexModalOpen(false)}
        title="Regex Presets & Guide"
      >
        <div className="flex flex-col gap-5 text-left max-h-[70vh] overflow-y-auto pr-1">
          {/* Presets List */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Preset Pattern</span>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {REGEX_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setRegexPattern(preset.pattern);
                    setIsRegexModalOpen(false);
                  }}
                  className="flex flex-col w-full gap-1 p-3 text-left transition-colors border cursor-pointer rounded-2xl border-border/50 bg-surface-alt hover:bg-neutral-100 dark:hover:bg-neutral-800/40 group"
                >
                  <span className="text-xs font-bold transition-colors text-text-primary group-hover:text-primary">{preset.name}</span>
                  <span className="text-[10px] text-text-secondary">{preset.desc}</span>
                  <code className="text-[9px] font-mono text-primary bg-surface/50 border border-border/20 px-1.5 py-0.5 rounded mt-1.5 self-start">{preset.pattern}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Simple Cheat Sheet */}
          <div className="flex flex-col gap-2.5 border-t border-border/40 pt-4">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Regex Cheat Sheet</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-text-secondary leading-relaxed bg-surface-alt/60 p-3.5 rounded-2xl border border-border/45 mt-1 font-medium">
              <div><code className="font-mono font-bold text-primary">^</code> / <code className="font-mono font-bold text-primary">$</code> : Start / End of string</div>
              <div><code className="font-mono font-bold text-primary">\d</code> / <code className="font-mono font-bold text-primary">\D</code> : Digit / Non-digit</div>
              <div><code className="font-mono font-bold text-primary">(?=...)</code> : Positive Lookahead</div>
              <div><code className="font-mono font-bold text-primary">\w</code> / <code className="font-mono font-bold text-primary">\W</code> : Alphanumeric / Special</div>
              <div><code className="font-mono font-bold text-primary">.</code> : Any character except newline</div>
              <div><code className="font-mono font-bold text-primary">?</code> / <code className="font-mono font-bold text-primary">*</code> / <code className="font-mono font-bold text-primary">+</code> : 0 or 1 / 0+ / 1+ repetitions</div>
              <div><code className="font-mono font-bold text-primary">[a-zA-Z]</code> : Match range of letters</div>
              <div><code className="font-mono font-bold text-primary">{"{n,m}"}</code> : Between n and m repetitions</div>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
