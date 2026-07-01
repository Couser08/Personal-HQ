import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconCheck, IconPlus, IconTrash, IconCalendar, 
  IconFlag, IconTag, IconSearch,
  IconSun, IconCalendarEvent, IconLayoutList,
  IconChevronLeft, IconChevronRight
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import type { TodoTask, TodoProject } from '../../store/useAppStore';

export default function TodoModule() {
  const { 
    todoTasks, todoProjects, 
    addTodoTask, updateTodoTask, deleteTodoTask, 
    addTodoProject, deleteTodoProject
  } = useAppStore(useShallow(state => ({
    todoTasks: state.todoTasks,
    todoProjects: state.todoProjects,
    addTodoTask: state.addTodoTask,
    updateTodoTask: state.updateTodoTask,
    deleteTodoTask: state.deleteTodoTask,
    addTodoProject: state.addTodoProject,
    deleteTodoProject: state.deleteTodoProject,
  })));

  const [search, setSearch] = useState('');
  const [activeList, setActiveList] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'trash' | string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Customization states
  const [strikeStyle, setStrikeStyle] = useState<'solid' | 'dashed' | 'dotted' | 'double' | 'wavy'>('solid');
  const [tickStyle, setTickStyle] = useState<'default' | 'bounce' | 'minimal'>('bounce');

  // Input properties
  const [newTaskPriority, setNewTaskPriority] = useState<TodoTask['priority']>('none');
  const [newTaskProject] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTodoTask({
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      projectId: newTaskProject,
      priority: newTaskPriority,
      tags: [],
      completed: false,
      dueDate: selectedDate ? selectedDate.toISOString() : null,
      createdAt: new Date().toISOString(),
    });
    setNewTaskTitle('');
    setNewTaskPriority('none');
    setSelectedDate(new Date());
  };

  const getPriorityIconColor = (priority: TodoTask['priority']) => {
    switch (priority) {
      case 'high': return '#f43f5e';
      case 'medium': return '#f97316';
      case 'low': return '#3b82f6';
      default: return 'var(--text-muted)';
    }
  };

  const filteredTasks = useMemo(() => {
    let list = todoTasks;
    if (search) {
      list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    }
    
    switch (activeList) {
      case 'today':
        // Simplified today logic (just checking if it has a due date roughly)
        list = list.filter(t => !t.completed && t.dueDate);
        break;
      case 'upcoming':
        list = list.filter(t => !t.completed && t.dueDate);
        break;
      case 'completed':
        list = list.filter(t => t.completed);
        break;
      case 'all':
        list = list.filter(t => !t.completed);
        break;
      case 'trash':
        list = []; // not implemented yet
        break;
      default:
        // Project filter
        list = list.filter(t => t.projectId === activeList && !t.completed);
    }
    return list;
  }, [todoTasks, activeList, search]);

  return (
    <div className="flex h-full bg-bg-primary text-text-primary rounded-xl overflow-hidden shadow-sm border border-border">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-surface/50 p-4 flex flex-col gap-6 overflow-y-auto hidden md:flex">
        
        {/* Lists */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">My Lists</h3>
            <button className="text-text-muted hover:text-text-primary"><IconPlus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-col gap-1">
            <NavItem 
              icon={<IconLayoutList className="w-4 h-4 text-rose-500" />} 
              label="All Tasks" count={todoTasks.filter(t => !t.completed).length} 
              active={activeList === 'all'} onClick={() => setActiveList('all')} 
            />
            <NavItem 
              icon={<IconSun className="w-4 h-4 text-orange-500" />} 
              label="Today" count={0} 
              active={activeList === 'today'} onClick={() => setActiveList('today')} 
            />
            <NavItem 
              icon={<IconCalendarEvent className="w-4 h-4 text-text-secondary" />} 
              label="Upcoming" count={0} 
              active={activeList === 'upcoming'} onClick={() => setActiveList('upcoming')} 
            />
            <NavItem 
              icon={<IconCheck className="w-4 h-4 text-text-secondary" />} 
              label="Completed" count={todoTasks.filter(t => t.completed).length} 
              active={activeList === 'completed'} onClick={() => setActiveList('completed')} 
            />
            <NavItem 
              icon={<IconTrash className="w-4 h-4 text-text-secondary" />} 
              label="Trash" 
              active={activeList === 'trash'} onClick={() => setActiveList('trash')} 
            />
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Projects</h3>
            <button 
              className="text-text-muted hover:text-text-primary"
              onClick={() => {
                const name = prompt('Project Name:');
                if (name) {
                  addTodoProject({ id: crypto.randomUUID(), name, color: '#3b82f6' });
                }
              }}
            >
              <IconPlus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {todoProjects.map(p => (
              <div key={p.id} className="group relative">
                <NavItem 
                  icon={<div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />} 
                  label={p.name} 
                  count={todoTasks.filter(t => t.projectId === p.id && !t.completed).length} 
                  active={activeList === p.id} onClick={() => setActiveList(p.id)} 
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTodoProject(p.id); if (activeList === p.id) setActiveList('all'); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-rose-500 transition-colors"
                  title="Delete Project"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Settings Area (For requirements) */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tick Style</h3>
          <div className="flex gap-2">
            <button onClick={() => setTickStyle('default')} className={`px-2 py-1 text-xs rounded ${tickStyle === 'default' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Default</button>
            <button onClick={() => setTickStyle('bounce')} className={`px-2 py-1 text-xs rounded ${tickStyle === 'bounce' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Bounce</button>
            <button onClick={() => setTickStyle('minimal')} className={`px-2 py-1 text-xs rounded ${tickStyle === 'minimal' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Minimal</button>
          </div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mt-3 mb-2">Strike Style</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStrikeStyle('solid')} className={`px-2 py-1 text-xs rounded ${strikeStyle === 'solid' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Solid</button>
            <button onClick={() => setStrikeStyle('dashed')} className={`px-2 py-1 text-xs rounded ${strikeStyle === 'dashed' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Dashed</button>
            <button onClick={() => setStrikeStyle('dotted')} className={`px-2 py-1 text-xs rounded ${strikeStyle === 'dotted' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Dotted</button>
            <button onClick={() => setStrikeStyle('double')} className={`px-2 py-1 text-xs rounded ${strikeStyle === 'double' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Double</button>
            <button onClick={() => setStrikeStyle('wavy')} className={`px-2 py-1 text-xs rounded ${strikeStyle === 'wavy' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border'}`}>Wavy</button>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-primary relative overflow-hidden">
        
        {/* Top Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 relative z-10 bg-bg-primary/80 backdrop-blur-md">
          <div className="relative w-64 hidden sm:block">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search tasks... ⌘K" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary placeholder:text-text-muted transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <IconPlus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full relative z-0">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-text-primary shadow-inner">All</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-text-secondary hover:bg-surface border border-transparent">
                <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-rose-500" /> High</span>
              </button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-text-secondary hover:bg-surface border border-transparent">
                <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-orange-500" /> Medium</span>
              </button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-text-secondary hover:bg-surface border border-transparent">
                <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-blue-500" /> Low</span>
              </button>
            </div>
            <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-xl border border-border">
              <button className="px-3 py-1.5 rounded-lg bg-surface text-text-primary shadow-sm text-xs font-bold transition-all">List</button>
              <button className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface/50 text-xs font-bold transition-all">Calendar</button>
              <button className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface/50 text-xs font-bold transition-all">Board</button>
            </div>
          </div>

          {/* Quick Add */}
          <form onSubmit={handleAddTask} className="bg-surface border-none rounded-3xl p-6 mb-8 shadow-sm ring-1 ring-black/5 dark:ring-white/5 focus-within:ring-primary/30 transition-all relative">
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted text-xl font-medium mb-6"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors"
                  >
                    <IconCalendar className="w-4 h-4 text-rose-500" />
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', Today' : 'Add Date'}
                  </button>
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg p-4 z-50 animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-sm">October 2026</span>
                        <div className="flex gap-1">
                          <button type="button" className="p-1 hover:bg-surface-hover rounded text-text-muted"><IconChevronLeft className="w-4 h-4"/></button>
                          <button type="button" className="p-1 hover:bg-surface-hover rounded text-text-muted"><IconChevronRight className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-text-muted mb-2">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {Array.from({length: 31}).map((_, i) => (
                          <button 
                            key={i} 
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(i + 1);
                              setSelectedDate(d);
                              setShowDatePicker(false);
                            }}
                            className={`p-1.5 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-colors ${i === 19 ? 'bg-rose-500 text-white font-bold hover:bg-rose-600 hover:text-white' : 'text-text-primary'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    const next = newTaskPriority === 'none' ? 'high' : newTaskPriority === 'high' ? 'medium' : newTaskPriority === 'medium' ? 'low' : 'none';
                    setNewTaskPriority(next);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors"
                >
                  <IconFlag className="w-4 h-4" fill={newTaskPriority !== 'none' ? getPriorityIconColor(newTaskPriority) : 'none'} color={newTaskPriority !== 'none' ? getPriorityIconColor(newTaskPriority) : 'currentColor'} />
                  {newTaskPriority !== 'none' ? newTaskPriority.charAt(0).toUpperCase() + newTaskPriority.slice(1) : 'Priority'}
                </button>
                <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors">
                  <IconTag className="w-4 h-4 text-purple-500" /> Tags
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!newTaskTitle.trim()}
                className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors shadow-sm shadow-rose-500/20"
              >
                <IconPlus className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* Grouped Lists (Mock logic for today/upcoming) */}
          <div className="flex flex-col gap-8">
            <TaskGroup 
              title="Tasks" 
              count={filteredTasks.length} 
              tasks={filteredTasks} 
              onToggle={id => {
                const t = todoTasks.find(x => x.id === id);
                if (t) updateTodoTask(id, { completed: !t.completed });
              }}
              onDelete={id => deleteTodoTask(id)}
              tickStyle={tickStyle}
              strikeStyle={strikeStyle}
              projects={todoProjects}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function NavItem({ icon, label, count, active, onClick }: { icon: React.ReactNode, label: string, count?: number, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
        active 
          ? 'bg-rose-500/10 text-rose-500 font-medium' 
          : 'text-text-secondary hover:text-text-primary hover:bg-surface'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-rose-500/20 text-rose-600' : 'bg-surface border border-border-alt'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function TaskGroup({ 
  title, count, tasks, onToggle, onDelete, 
  tickStyle, strikeStyle, projects 
}: { 
  title: string, count: number, tasks: TodoTask[], 
  onToggle: (id: string) => void, onDelete: (id: string) => void,
  tickStyle: string, strikeStyle: string, projects: TodoProject[]
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-4 text-sm">
        <h3 className="font-bold text-text-primary">{title}</h3>
        <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs font-bold">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-colors relative overflow-hidden"
            >
              <button 
                onClick={() => onToggle(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors relative z-10 ${
                  task.completed 
                    ? 'border-rose-500 bg-rose-500' 
                    : 'border-text-muted hover:border-rose-400'
                }`}
              >
                <AnimatePresence>
                  {task.completed && (
                    <motion.svg 
                      initial={tickStyle === 'bounce' ? { scale: 0, rotate: -45 } : { pathLength: 0, opacity: 0 }}
                      animate={tickStyle === 'bounce' ? { scale: 1, rotate: 0 } : { pathLength: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-3.5 h-3.5 text-white" 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                    >
                      <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </button>
              
              <div className="flex-1 min-w-0 relative">
                <span className={`block truncate text-sm font-medium transition-colors ${task.completed ? 'text-text-muted' : 'text-text-primary'}`}>
                  {task.title}
                </span>
                {/* Strike-through animation */}
                {task.completed && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ borderBottom: `${strikeStyle === 'double' ? '3px' : '2px'} ${strikeStyle} var(--text-muted)` }}
                  />
                )}
              </div>
              
              {task.projectId && projects.find(p => p.id === task.projectId) && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase shrink-0">
                  {projects.find(p => p.id === task.projectId)?.name}
                </span>
              )}
              
              {task.priority !== 'none' && (
                <div className="flex items-center gap-1.5 shrink-0 text-xs text-text-muted">
                  <IconFlag className={`w-3.5 h-3.5 ${task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'}`} fill="currentColor" />
                  <span className="hidden sm:inline capitalize">{task.priority}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 shrink-0 text-xs text-text-muted w-24 justify-end">
                <IconCalendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Today</span>
              </div>
              
              <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-rose-500 transition-all shrink-0">
                <IconTrash className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
