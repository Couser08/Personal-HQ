import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { 
  IconCheck, IconPlus, IconTrash, IconCalendar, 
  IconFlag, IconTag, IconSearch,
  IconSun, IconCalendarEvent, IconLayoutList,
  IconChevronLeft, IconChevronRight, IconClock, IconEdit
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import type { TodoTask, TodoProject } from '../../store/useAppStore';

export default function TodoModule() {
  const { 
    todoTasks, todoProjects, 
    addTodoTask, updateTodoTask, deleteTodoTask, restoreTodoTask, emptyTodoTrash,
    deleteTodoProject, openTodoProjectModal, openTodoTaskModal
  } = useAppStore(useShallow(state => ({
    todoTasks: state.todoTasks,
    todoProjects: state.todoProjects,
    addTodoTask: state.addTodoTask,
    updateTodoTask: state.updateTodoTask,
    deleteTodoTask: state.deleteTodoTask,
    restoreTodoTask: state.restoreTodoTask,
    emptyTodoTrash: state.emptyTodoTrash,
    deleteTodoProject: state.deleteTodoProject,
    openTodoProjectModal: state.openTodoProjectModal,
    openTodoTaskModal: state.openTodoTaskModal,
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
  
  // New State variables for calendar, tags, priority select, custom project creation modal, and views
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [newTaskTagInput, setNewTaskTagInput] = useState('');
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [completingIds, setCompletingIds] = useState<string[]>([]);

  // Time range picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState('');
  const [taskEndTime, setTaskEndTime] = useState('');
  const [fromHour, setFromHour] = useState('10');
  const [fromMin, setFromMin] = useState('00');
  const [fromAmPm, setFromAmPm] = useState('AM');
  const [toHour, setToHour] = useState('10');
  const [toMin, setToMin] = useState('30');
  const [toAmPm, setToAmPm] = useState('AM');
  
  const [todoView, setTodoView] = useState<'list' | 'calendar' | 'board'>('list');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTodoTask({
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      projectId: newTaskProject,
      priority: newTaskPriority,
      tags: newTaskTags,
      completed: false,
      dueDate: selectedDate ? selectedDate.toISOString() : null,
      startTime: taskStartTime || null,
      endTime: taskEndTime || null,
      createdAt: new Date().toISOString(),
    });
    setNewTaskTitle('');
    setNewTaskPriority('none');
    setSelectedDate(new Date());
    setNewTaskTags([]);
    setTaskStartTime('');
    setTaskEndTime('');
  };

  const handleToggleTask = (id: string) => {
    const t = todoTasks.find(x => x.id === id);
    if (!t) return;
    if (!t.completed) {
      setCompletingIds(prev => [...prev, id]);
      setTimeout(() => {
        updateTodoTask(id, { completed: true });
        setCompletingIds(prev => prev.filter(x => x !== id));
      }, 600);
    } else {
      updateTodoTask(id, { completed: false });
    }
  };

  // Date picker helpers & navigation
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
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
    if (activeList === 'trash') {
      list = list.filter(t => t.deleted);
    } else {
      list = list.filter(t => !t.deleted);
    }

    if (search) {
      list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (priorityFilter !== 'all') {
      list = list.filter(t => t.priority === priorityFilter);
    }
    
    switch (activeList) {
      case 'today':
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
        // already filtered above
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
              onClick={() => openTodoProjectModal()}
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

        {/* Mobile Horizontal Lists Selector */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto px-6 py-3 border-b border-border bg-surface/30 scrollbar-hide shrink-0">
          {[
            { id: 'all', label: 'All Tasks', color: '#f43f5e' },
            { id: 'today', label: 'Today', color: '#f97316' },
            { id: 'upcoming', label: 'Upcoming', color: '#a855f7' },
            { id: 'completed', label: 'Completed', color: '#10b981' },
            { id: 'trash', label: 'Trash', color: '#6b7280' },
            ...todoProjects.map(p => ({ id: p.id, label: p.name, color: p.color }))
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveList(item.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                activeList === item.id
                  ? 'bg-primary/10 text-primary border-primary/20 shadow-inner'
                  : 'bg-surface border-border hover:bg-surface-hover text-text-secondary'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Task Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full relative z-0">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPriorityFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${priorityFilter === 'all' ? 'bg-gray-200 dark:bg-gray-800 text-text-primary shadow-inner' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
              >
                All
              </button>
              <button 
                onClick={() => setPriorityFilter('high')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${priorityFilter === 'high' ? 'bg-rose-500/10 text-rose-500 shadow-sm border border-rose-500/20' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
              >
                <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-rose-500" /> High</span>
              </button>
              <button 
                onClick={() => setPriorityFilter('medium')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${priorityFilter === 'medium' ? 'bg-orange-500/10 text-orange-500 shadow-sm border border-orange-500/20' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
              >
                <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-orange-500" /> Medium</span>
              </button>
              <button 
                onClick={() => setPriorityFilter('low')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${priorityFilter === 'low' ? 'bg-blue-500/10 text-blue-500 shadow-sm border border-blue-500/20' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
              >
                <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-blue-500" /> Low</span>
              </button>
            </div>
            <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-xl border border-border">
              <button 
                onClick={() => setTodoView('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${todoView === 'list' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                List
              </button>
              <button 
                onClick={() => setTodoView('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${todoView === 'calendar' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                Calendar
              </button>
              <button 
                onClick={() => setTodoView('board')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${todoView === 'board' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                Board
              </button>
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
                        <span className="font-bold text-sm text-text-primary">
                          {monthNames[calendarMonth]} {calendarYear}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            type="button" 
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-surface-hover rounded text-text-muted transition-colors"
                          >
                            <IconChevronLeft className="w-4 h-4"/>
                          </button>
                          <button 
                            type="button" 
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-surface-hover rounded text-text-muted transition-colors"
                          >
                            <IconChevronRight className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-muted mb-2 uppercase">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {/* Empty offsets for day index */}
                        {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {/* Actual Days */}
                        {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                          const dayNum = i + 1;
                          const isCurrentSelection = selectedDate && 
                            selectedDate.getDate() === dayNum && 
                            selectedDate.getMonth() === calendarMonth && 
                            selectedDate.getFullYear() === calendarYear;
                          return (
                            <button 
                              key={`day-${dayNum}`} 
                              type="button"
                              onClick={() => {
                                setSelectedDate(new Date(calendarYear, calendarMonth, dayNum));
                                setShowDatePicker(false);
                              }}
                              className={`p-1.5 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-colors font-medium ${
                                isCurrentSelection 
                                  ? 'bg-rose-500 text-white font-bold hover:bg-rose-600 hover:text-white' 
                                  : 'text-text-primary'
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Range Selector */}
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowTimePicker(!showTimePicker);
                      setShowDatePicker(false);
                      setShowPriorityDropdown(false);
                      setShowTagsDropdown(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors"
                  >
                    <IconClock className="w-4 h-4 text-rose-500" />
                    {taskStartTime && taskEndTime ? `${taskStartTime} - ${taskEndTime}` : 'Add Time'}
                  </button>
                  <AnimatePresence>
                    {showTimePicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-4 z-50 flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-text-primary">Time Range</span>
                          {(taskStartTime || taskEndTime) && (
                            <button
                              type="button"
                              onClick={() => {
                                setTaskStartTime('');
                                setTaskEndTime('');
                                setShowTimePicker(false);
                              }}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold transition-colors"
                            >
                              Clear Time
                            </button>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          {/* From Time */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">From</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={2}
                                placeholder="10"
                                value={fromHour}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  if (parseInt(val) <= 12 || val === '') setFromHour(val);
                                }}
                                className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all"
                              />
                              <span className="font-bold text-text-muted">:</span>
                              <input
                                type="text"
                                maxLength={2}
                                placeholder="00"
                                value={fromMin}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  if (parseInt(val) <= 59 || val === '') setFromMin(val);
                                }}
                                className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all"
                              />
                              <div className="flex rounded-xl bg-surface-alt p-0.5 border border-border overflow-hidden ml-auto">
                                <button
                                  type="button"
                                  onClick={() => setFromAmPm('AM')}
                                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                                    fromAmPm === 'AM' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                                  }`}
                                >
                                  AM
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFromAmPm('PM')}
                                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                                    fromAmPm === 'PM' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                                  }`}
                                >
                                  PM
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* To Time */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">To</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={2}
                                placeholder="10"
                                value={toHour}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  if (parseInt(val) <= 12 || val === '') setToHour(val);
                                }}
                                className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all"
                              />
                              <span className="font-bold text-text-muted">:</span>
                              <input
                                type="text"
                                maxLength={2}
                                placeholder="30"
                                value={toMin}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  if (parseInt(val) <= 59 || val === '') setToMin(val);
                                }}
                                className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all"
                              />
                              <div className="flex rounded-xl bg-surface-alt p-0.5 border border-border overflow-hidden ml-auto">
                                <button
                                  type="button"
                                  onClick={() => setToAmPm('AM')}
                                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                                    toAmPm === 'AM' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                                  }`}
                                >
                                  AM
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setToAmPm('PM')}
                                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                                    toAmPm === 'PM' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                                  }`}
                                >
                                  PM
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Set Button */}
                        <button
                          type="button"
                          onClick={() => {
                            let fh = parseInt(fromHour) || 12;
                            let fm = parseInt(fromMin) || 0;
                            let th = parseInt(toHour) || 12;
                            let tm = parseInt(toMin) || 0;

                            const formattedFrom = `${fh}:${fm.toString().padStart(2, '0')} ${fromAmPm}`;
                            const formattedTo = `${th}:${tm.toString().padStart(2, '0')} ${toAmPm}`;

                            setTaskStartTime(formattedFrom);
                            setTaskEndTime(formattedTo);
                            setShowTimePicker(false);
                          }}
                          className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all active:scale-95 mt-2"
                        >
                          Set Range
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors"
                  >
                    <IconFlag className="w-4 h-4" fill={newTaskPriority !== 'none' ? getPriorityIconColor(newTaskPriority) : 'none'} color={newTaskPriority !== 'none' ? getPriorityIconColor(newTaskPriority) : 'currentColor'} />
                    {newTaskPriority !== 'none' ? newTaskPriority.charAt(0).toUpperCase() + newTaskPriority.slice(1) : 'Priority'}
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-40 bg-surface border border-border rounded-xl shadow-lg p-2 z-50 animate-fade-in flex flex-col gap-1">
                      {[
                        { value: 'none', label: 'No Priority', color: '#71717a' },
                        { value: 'low', label: 'Low', color: '#3b82f6' },
                        { value: 'medium', label: 'Medium', color: '#f97316' },
                        { value: 'high', label: 'High', color: '#f43f5e' }
                      ].map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => {
                            setNewTaskPriority(p.value as any);
                            setShowPriorityDropdown(false);
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-surface-hover rounded-lg text-xs font-bold text-text-primary transition-colors"
                        >
                          <IconFlag className="w-3.5 h-3.5" fill={p.value !== 'none' ? p.color : 'none'} color={p.color} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors"
                  >
                    <IconTag className="w-4 h-4 text-purple-500" /> 
                    {newTaskTags.length > 0 ? `${newTaskTags.length} Tag(s)` : 'Tags'}
                  </button>
                  {showTagsDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-surface border border-border rounded-xl shadow-lg p-3 z-50 animate-fade-in flex flex-col gap-2">
                      {newTaskTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto mb-1">
                          {newTaskTags.map(t => (
                            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                              {t}
                              <button type="button" onClick={() => setNewTaskTags(prev => prev.filter(x => x !== t))} className="hover:text-purple-800 dark:hover:text-purple-200">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <input 
                          type="text" 
                          placeholder="Add new tag..."
                          value={newTaskTagInput}
                          onChange={e => setNewTaskTagInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = newTaskTagInput.trim();
                              if (trimmed && !newTaskTags.includes(trimmed)) {
                                setNewTaskTags(prev => [...prev, trimmed]);
                                setNewTaskTagInput('');
                              }
                            }
                          }}
                          className="flex-1 bg-surface-alt border-none text-xs p-1.5 rounded-lg outline-none text-text-primary"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const trimmed = newTaskTagInput.trim();
                            if (trimmed && !newTaskTags.includes(trimmed)) {
                              setNewTaskTags(prev => [...prev, trimmed]);
                              setNewTaskTagInput('');
                            }
                          }}
                          className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Main Views */}
          <AnimatePresence mode="wait">
            {todoView === 'list' && (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-8"
              >
                {activeList === 'trash' && filteredTasks.length > 0 && (
                  <div className="flex justify-between items-center bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 mb-2">
                    <span className="text-xs text-rose-500 font-bold">Trash tasks are permanently deleted after clicking delete icon.</span>
                    <button 
                      onClick={() => emptyTodoTrash()}
                      className="btn btn-danger btn-sm rounded-full text-xs"
                    >
                      Empty Trash
                    </button>
                  </div>
                )}
                {activeList === 'trash' ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-sm">
                      <h3 className="font-bold text-text-primary">Deleted Tasks</h3>
                      <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs font-bold">{filteredTasks.length}</span>
                    </div>
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-10 text-text-muted text-sm font-medium">Trash is empty</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {filteredTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                            <span className="text-sm font-medium text-text-primary line-through">{task.title}</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => restoreTodoTask(task.id)}
                                className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg text-xs font-bold transition-all"
                              >
                                Restore
                              </button>
                              <button 
                                onClick={() => deleteTodoTask(task.id)}
                                className="p-1 hover:bg-rose-500/10 text-text-muted hover:text-rose-500 rounded transition-all"
                              >
                                <IconTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <TaskGroup 
                    title="Tasks" 
                    count={filteredTasks.length} 
                    tasks={filteredTasks} 
                    onToggle={handleToggleTask}
                    onDelete={id => deleteTodoTask(id)}
                    tickStyle={tickStyle}
                    strikeStyle={strikeStyle}
                    projects={todoProjects}
                    completingIds={completingIds}
                    openTodoTaskModal={openTodoTaskModal}
                  />
                )}
              </motion.div>
            )}

            {todoView === 'calendar' && (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-surface rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
              >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg text-text-primary">
                    {monthNames[calendarMonth]} {calendarYear}
                  </h3>
                  <div className="flex gap-1">
                    <button type="button" onClick={handlePrevMonth} className="btn btn-secondary btn-sm btn-square"><IconChevronLeft className="w-4 h-4"/></button>
                    <button type="button" onClick={handleNextMonth} className="btn btn-secondary btn-sm btn-square"><IconChevronRight className="w-4 h-4"/></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] font-bold text-text-muted mb-2 sm:mb-4 uppercase">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                
                <div className="grid grid-cols-7 gap-1 sm:gap-2 min-h-[220px] sm:min-h-[300px]">
                  {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                    <div key={`offset-${i}`} className="bg-surface-alt/20 rounded-lg sm:rounded-2xl border border-transparent" />
                  ))}
                  {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateObj = new Date(calendarYear, calendarMonth, dayNum);
                    const dayTasks = todoTasks.filter(t => !t.deleted && t.dueDate && new Date(t.dueDate).toDateString() === dateObj.toDateString());
                    
                    return (
                      <div 
                        key={`cal-${dayNum}`}
                        onClick={() => {
                          setSelectedDate(dateObj);
                          setShowDatePicker(false);
                        }}
                        className={`p-1 sm:p-3 rounded-lg sm:rounded-2xl border border-border/40 hover:border-primary/50 transition-all flex flex-col justify-between items-start cursor-pointer min-h-[45px] sm:min-h-[70px] ${
                          dateObj.toDateString() === new Date().toDateString() ? 'bg-rose-500/5 ring-1 ring-rose-500' : 'bg-surface-alt/40'
                        }`}
                      >
                        <span className={`text-xs font-bold ${dateObj.toDateString() === new Date().toDateString() ? 'text-rose-500' : 'text-text-secondary'}`}>
                          {dayNum}
                        </span>
                        {dayTasks.length > 0 && (
                          <div className="flex flex-col gap-1 w-full mt-2">
                            {dayTasks.slice(0, 2).map(t => (
                              <div key={t.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate max-w-full">
                                {t.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-[8px] font-semibold text-text-muted text-center">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {todoView === 'board' && (
              <motion.div
                key="board-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-10"
              >
                {([
                  { id: 'none', title: 'No Priority', color: 'border-t-gray-400 bg-gray-400/5 text-gray-500' },
                  { id: 'low', title: 'Low', color: 'border-t-blue-500 bg-blue-500/5 text-blue-500' },
                  { id: 'medium', title: 'Medium', color: 'border-t-orange-500 bg-orange-500/5 text-orange-500' },
                  { id: 'high', title: 'High', color: 'border-t-rose-500 bg-rose-500/5 text-rose-500' }
                ] as const).map(col => {
                  const colTasks = filteredTasks.filter(t => t.priority === col.id);
                  return (
                    <div key={col.id} className={`flex flex-col rounded-3xl p-4 border-t-4 shadow-sm ring-1 ring-black/5 dark:ring-white/5 ${col.color} min-h-[400px]`}>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/50">
                        <span className="font-bold text-sm text-text-primary">{col.title}</span>
                        <span className="text-[10px] font-extrabold bg-surface px-2 py-0.5 rounded-full border shadow-sm text-text-secondary">{colTasks.length}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2 overflow-y-auto flex-1 max-h-[350px] pr-1">
                        {colTasks.length === 0 ? (
                          <div className="text-center py-10 text-[10px] text-text-muted font-medium">No tasks</div>
                        ) : (
                          colTasks.map(task => (
                            <div 
                              key={task.id}
                              className="bg-surface p-3 rounded-2xl border border-border shadow-sm flex flex-col gap-2 hover:shadow transition-shadow group cursor-pointer"
                              onClick={() => handleToggleTask(task.id)}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className={`text-xs font-semibold text-text-primary line-clamp-2 ${task.completed ? 'line-through text-text-muted' : ''}`}>
                                  {task.title}
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteTodoTask(task.id); }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/10 hover:text-rose-500 rounded transition-all text-text-muted"
                                >
                                  <IconTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-text-muted">
                                  <IconCalendar className="w-3 h-3" />
                                  {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

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
  tickStyle, strikeStyle, projects, completingIds = [], openTodoTaskModal
}: { 
  title: string, count: number, tasks: TodoTask[], 
  onToggle: (id: string) => void, onDelete: (id: string) => void,
  tickStyle: string, strikeStyle: string, projects: TodoProject[],
  completingIds?: string[],
  openTodoTaskModal: (task?: TodoTask | null) => void
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
          {tasks.map(task => {
            const isCompleted = task.completed || completingIds.includes(task.id);
            return (
              <TaskItem
                key={task.id}
                task={task}
                isCompleted={isCompleted}
                onToggle={onToggle}
                onDelete={onDelete}
                tickStyle={tickStyle}
                strikeStyle={strikeStyle}
                projects={projects}
                openTodoTaskModal={openTodoTaskModal}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TaskItem({
  task, isCompleted, onToggle, onDelete,
  tickStyle, strikeStyle, projects, openTodoTaskModal
}: {
  task: TodoTask;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  tickStyle: string;
  strikeStyle: string;
  projects: TodoProject[];
  openTodoTaskModal: (task?: TodoTask | null) => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`group flex items-center gap-4 p-3 rounded-xl hover:bg-surface border transition-colors relative overflow-hidden ${
        isCompleted 
          ? 'border-transparent' 
          : 'border-dashed border-border-alt hover:border-border'
      }`}
    >
      <button 
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors relative z-10 ${
          isCompleted 
            ? 'border-rose-500 bg-rose-500' 
            : 'border-text-muted hover:border-rose-400'
        }`}
      >
        <AnimatePresence>
          {isCompleted && (
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
        <div className="flex flex-col gap-0.5">
          <span 
            onDoubleClick={() => {
              if (!isCompleted) openTodoTaskModal(task);
            }}
            className={`block truncate text-sm font-medium transition-all ${isCompleted ? 'text-text-muted' : 'text-text-primary'} cursor-pointer`}
            style={isCompleted ? { 
              textDecorationLine: 'line-through',
              textDecorationStyle: strikeStyle as any,
              textDecorationThickness: strikeStyle === 'double' ? '3px' : '2px',
              textDecorationColor: 'currentColor'
            } : undefined}
            title="Double click to edit task details"
          >
            {task.title}
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {(task.startTime || task.endTime) && (
              <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-bold text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10">
                <IconClock className="w-2.5 h-2.5" />
                {task.startTime || '??'} - {task.endTime || '??'}
              </span>
            )}
            {task.pomodoroCount !== undefined && task.pomodoroCount > 0 && (
              <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-bold text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-full border border-orange-500/10" title={`${task.pomodoroCount} focus sessions completed`}>
                <span>🍅</span> {task.pomodoroCount}
              </span>
            )}
          </div>
        </div>
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
      
      {task.dueDate && (
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-text-muted w-24 justify-end">
          <IconCalendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2">
        {!isCompleted && (
          <button 
            onClick={() => openTodoTaskModal(task)} 
            className="p-1.5 text-text-muted hover:text-rose-500 transition-colors"
            title="Edit task details"
          >
            <IconEdit className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={() => onDelete(task.id)} 
          className="p-1.5 text-text-muted hover:text-rose-500 transition-colors"
          title="Delete task"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
