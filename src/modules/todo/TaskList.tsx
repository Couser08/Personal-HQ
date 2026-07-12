import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconCheck, IconPlus, IconTrash, IconCalendar, 
  IconFlag, IconTag, IconSearch,
  IconLayoutList,
  IconChevronLeft, IconChevronRight, IconClock, IconEdit,
  IconList, IconTarget, IconSun
} from '@tabler/icons-react';
import type { TodoTask, TodoProject } from '../../store/useAppStore';
import { useAppStore } from '../../store/useAppStore';

const isToday = (dateStr: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

const isUpcoming = (dateStr: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return d.getTime() > today.getTime();
};

interface TaskListProps {
  todoTasks: TodoTask[];
  todoProjects: TodoProject[];
  activeList: 'all' | 'today' | 'upcoming' | 'completed' | 'trash' | string;
  setActiveList: (list: 'all' | 'today' | 'upcoming' | 'completed' | 'trash' | string) => void;
  search: string;
  setSearch: (search: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  newTaskPriority: TodoTask['priority'];
  setNewTaskPriority: (val: TodoTask['priority']) => void;
  showDatePicker: boolean;
  setShowDatePicker: (val: boolean) => void;
  selectedDate: Date | null;
  setSelectedDate: (val: Date | null) => void;
  calendarMonth: number;
  setCalendarMonth: (val: number) => void;
  calendarYear: number;
  setCalendarYear: (val: number) => void;
  showPriorityDropdown: boolean;
  setShowPriorityDropdown: (val: boolean) => void;
  showTagsDropdown: boolean;
  setShowTagsDropdown: (val: boolean) => void;
  newTaskTagInput: string;
  setNewTaskTagInput: (val: string) => void;
  newTaskTags: string[];
  setNewTaskTags: (val: string[]) => void;
  newTaskSubtasks: { id: string; title: string; completed: boolean }[];
  setNewTaskSubtasks: React.Dispatch<React.SetStateAction<{ id: string; title: string; completed: boolean }[]>>;
  showSubtasksDropdown: boolean;
  setShowSubtasksDropdown: (val: boolean) => void;
  completingIds: string[];
  setCompletingIds: (val: string[]) => void;
  showTimePicker: boolean;
  setShowTimePicker: (val: boolean) => void;
  taskStartTime: string;
  setTaskStartTime: (val: string) => void;
  taskEndTime: string;
  setTaskEndTime: (val: string) => void;
  fromHour: string;
  setFromHour: (val: string) => void;
  fromMin: string;
  setFromMin: (val: string) => void;
  fromAmPm: string;
  setFromAmPm: (val: string) => void;
  toHour: string;
  setToHour: (val: string) => void;
  toMin: string;
  setToMin: (val: string) => void;
  toAmPm: string;
  setToAmPm: (val: string) => void;
  todoView: 'list' | 'calendar' | 'board';
  setTodoView: (val: 'list' | 'calendar' | 'board') => void;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  setPriorityFilter: (val: 'all' | 'high' | 'medium' | 'low') => void;
  handleAddTask: (e: React.FormEvent) => void;
  handleToggleTask: (id: string) => void;
  restoreTodoTask: (id: string) => void;
  deleteTodoTask: (id: string) => void;
  emptyTodoTrash: () => void;
  openTodoTaskModal: (task?: TodoTask | null) => void;
  tickStyle: 'default' | 'bounce' | 'minimal';
  strikeStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  todoTasks,
  todoProjects,
  activeList,
  setActiveList,
  search,
  setSearch,
  newTaskTitle,
  setNewTaskTitle,
  newTaskPriority,
  setNewTaskPriority,
  showDatePicker,
  setShowDatePicker,
  selectedDate,
  setSelectedDate,
  calendarMonth,
  setCalendarMonth,
  calendarYear,
  setCalendarYear,
  showPriorityDropdown,
  setShowPriorityDropdown,
  showTagsDropdown,
  setShowTagsDropdown,
  newTaskTagInput,
  setNewTaskTagInput,
  newTaskTags,
  setNewTaskTags,
  newTaskSubtasks,
  setNewTaskSubtasks,
  showSubtasksDropdown,
  setShowSubtasksDropdown,
  completingIds,
  showTimePicker,
  setShowTimePicker,
  taskStartTime,
  setTaskStartTime,
  taskEndTime,
  setTaskEndTime,
  fromHour,
  setFromHour,
  fromMin,
  setFromMin,
  fromAmPm,
  setFromAmPm,
  toHour,
  setToHour,
  toMin,
  setToMin,
  toAmPm,
  setToAmPm,
  todoView,
  setTodoView,
  priorityFilter,
  setPriorityFilter,
  handleAddTask,
  handleToggleTask,
  restoreTodoTask,
  deleteTodoTask,
  emptyTodoTrash,
  openTodoTaskModal,
  tickStyle,
  strikeStyle,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
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
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
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
        list = list.filter(t => !t.completed && isToday(t.dueDate));
        break;
      case 'upcoming':
        list = list.filter(t => !t.completed && isUpcoming(t.dueDate));
        break;
      case 'completed':
        list = list.filter(t => t.completed);
        break;
      case 'all':
        list = list.filter(t => !t.completed);
        break;
      case 'trash':
        break;
      default:
        list = list.filter(t => t.projectId === activeList && !t.completed);
    }
    return list;
  }, [todoTasks, activeList, search, priorityFilter]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg-primary relative overflow-hidden text-left">
      
      {/* Top Header */}
      <div className="h-16 border-b border-border hidden md:flex items-center justify-between px-6 shrink-0 relative z-10 bg-bg-primary/80 backdrop-blur-md select-none">
        <div className="flex items-center gap-2 relative w-full sm:w-64">
          {setIsSidebarOpen && (
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-xl transition-colors cursor-pointer mr-1"
              title="Open Menu"
            >
              <IconList className="w-5 h-5" />
            </button>
          )}
          <div className="relative w-full">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search tasks... ⌘K" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-text-primary placeholder:text-text-muted transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
            <IconPlus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Removed Horizontal Selector for Mockup Vertical Lists Card */}

      {/* Task Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full relative z-0 custom-scrollbar">
        
        {/* Mobile Only: My Lists Card */}
        <div className="flex md:hidden flex-col bg-surface border border-border/70 rounded-3xl p-5 mb-5 shadow-sm select-none text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 pl-0.5">My Lists</span>
          <div className="flex flex-col gap-1.5">
            {[
              { id: 'all', label: 'All Tasks', icon: <IconLayoutList className="w-4 h-4 text-rose-500" />, count: todoTasks.filter(t => !t.completed && !t.deleted).length },
              { id: 'today', label: 'Today', icon: <IconSun className="w-4 h-4 text-orange-500" />, count: todoTasks.filter(t => !t.completed && !t.deleted && isToday(t.dueDate)).length },
              { id: 'upcoming', label: 'Upcoming', icon: <IconCalendar className="w-4 h-4 text-purple-500" />, count: todoTasks.filter(t => !t.completed && !t.deleted && isUpcoming(t.dueDate)).length },
              { id: 'completed', label: 'Completed', icon: <IconCheck className="w-4 h-4 text-emerald-500" />, count: todoTasks.filter(t => t.completed && !t.deleted).length },
              { id: 'trash', label: 'Trash', icon: <IconTrash className="w-4 h-4 text-stone-500" />, count: todoTasks.filter(t => t.deleted).length },
              ...todoProjects.map(p => ({
                id: p.id,
                label: p.name,
                icon: <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />,
                count: todoTasks.filter(t => t.projectId === p.id && !t.completed && !t.deleted).length
              }))
            ].map(item => {
              const isActive = activeList === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveList(item.id);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all w-full border-none cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-500 font-bold'
                      : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-rose-500/20 text-rose-600' : 'bg-surface-alt border border-border/50 text-text-muted'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Only: Search & Add Task Row */}
        <div className="flex md:hidden items-center gap-3 mb-6 select-none w-full">
          <div className="relative flex-1">
            <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search tasks... ⌘K"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border/60 rounded-full pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-primary/50 text-text-primary placeholder:text-text-muted transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('quick-add-task-input');
              if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (input as HTMLInputElement).focus();
              }
            }}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-subtle border-none shrink-0"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 select-none bg-surface md:bg-transparent border border-border/70 md:border-none p-4.5 md:p-0 rounded-3xl md:rounded-none shadow-subtle md:shadow-none">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPriorityFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${priorityFilter === 'all' ? 'bg-gray-200 dark:bg-gray-800 text-text-primary shadow-inner' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
            >
              All
            </button>
            <button 
              onClick={() => setPriorityFilter('high')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${priorityFilter === 'high' ? 'bg-rose-500/10 text-rose-500 shadow-sm border border-rose-500/20' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
            >
              <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-rose-500" /> High</span>
            </button>
            <button 
              onClick={() => setPriorityFilter('medium')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${priorityFilter === 'medium' ? 'bg-orange-500/10 text-orange-500 shadow-sm border border-orange-500/20' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
            >
              <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-orange-500" /> Medium</span>
            </button>
            <button 
              onClick={() => setPriorityFilter('low')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${priorityFilter === 'low' ? 'bg-blue-500/10 text-blue-500 shadow-sm border border-blue-500/20' : 'text-text-secondary hover:bg-surface border border-transparent'}`}
            >
              <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5 text-blue-500" /> Low</span>
            </button>
          </div>
          <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-xl border border-border">
            <button 
              onClick={() => setTodoView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${todoView === 'list' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              List
            </button>
            <button 
              onClick={() => setTodoView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${todoView === 'calendar' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              Calendar
            </button>
            <button 
              onClick={() => setTodoView('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${todoView === 'board' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              Board
            </button>
          </div>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddTask} className="bg-surface border-none rounded-3xl p-6 mb-8 shadow-sm ring-1 ring-black/5 dark:ring-white/5 focus-within:ring-primary/30 transition-all relative">
          <input 
            id="quick-add-task-input"
            type="text" 
            placeholder="What needs to be done?" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted text-xl font-medium mb-6"
          />
          
          {/* Live Preview Badge Bar */}
          {(selectedDate || taskStartTime || newTaskPriority !== 'none' || newTaskTags.length > 0 || newTaskSubtasks.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-6 p-3 bg-surface-alt/55 rounded-2xl border border-border/40 text-[11px] font-semibold text-text-secondary items-center animate-fade-in select-none">
              <span className="text-[10px] uppercase font-bold text-text-muted">Task Preview:</span>
              {selectedDate && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  📅 {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {taskStartTime && taskEndTime && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  ⏰ {taskStartTime} - {taskEndTime}
                </span>
              )}
              {newTaskPriority !== 'none' && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize font-bold">
                  🚩 {newTaskPriority} Priority
                </span>
              )}
              {newTaskTags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  🏷️ {tag}
                </span>
              ))}
              {newTaskSubtasks.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  📋 {newTaskSubtasks.length} Subtask(s)
                </span>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowTimePicker(false);
                    setShowPriorityDropdown(false);
                    setShowTagsDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
                >
                  <IconCalendar className="w-4 h-4 text-rose-500" />
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', Today' : 'Add Date'}
                </button>
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-2 w-64 max-w-[calc(100vw-3rem)] bg-surface border border-border rounded-xl shadow-lg p-4 z-50 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-sm text-text-primary">
                        {monthNames[calendarMonth]} {calendarYear}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          type="button" 
                          onClick={handlePrevMonth}
                          className="p-1 hover:bg-surface-hover rounded text-text-muted transition-colors cursor-pointer"
                        >
                          <IconChevronLeft className="w-4 h-4"/>
                        </button>
                        <button 
                          type="button" 
                          onClick={handleNextMonth}
                          className="p-1 hover:bg-surface-hover rounded text-text-muted transition-colors cursor-pointer"
                        >
                          <IconChevronRight className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-muted mb-2 uppercase">
                      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
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
                            className={`p-1.5 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-colors font-medium cursor-pointer ${
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
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
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
                      className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-3rem)] bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-4 z-50 flex flex-col gap-4"
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
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                          >
                            Clear Time
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-4 text-left">
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
                              className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all text-text-primary"
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
                              className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all text-text-primary"
                            />
                            <div className="flex rounded-xl bg-surface-alt p-0.5 border border-border overflow-hidden ml-auto">
                              <button
                                type="button"
                                onClick={() => setFromAmPm('AM')}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                  fromAmPm === 'AM' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                                }`}
                              >
                                AM
                              </button>
                              <button
                                type="button"
                                onClick={() => setFromAmPm('PM')}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
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
                              className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all text-text-primary"
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
                              className="w-12 h-9 text-center bg-surface-alt border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all text-text-primary"
                            />
                            <div className="flex rounded-xl bg-surface-alt p-0.5 border border-border overflow-hidden ml-auto">
                              <button
                                type="button"
                                onClick={() => setToAmPm('AM')}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                  toAmPm === 'AM' ? 'bg-rose-500 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                                }`}
                              >
                                AM
                              </button>
                              <button
                                type="button"
                                onClick={() => setToAmPm('PM')}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
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
                        className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all active:scale-95 mt-2 cursor-pointer"
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
                  onClick={() => {
                    setShowPriorityDropdown(!showPriorityDropdown);
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                    setShowTagsDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
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
                        className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-surface-hover rounded-lg text-xs font-bold text-text-primary transition-colors cursor-pointer"
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
                  onClick={() => {
                    setShowTagsDropdown(!showTagsDropdown);
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                    setShowPriorityDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
                >
                  <IconTag className="w-4 h-4 text-purple-500" /> 
                  {newTaskTags.length > 0 ? `${newTaskTags.length} Tag(s)` : 'Tags'}
                </button>
                {showTagsDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 max-w-[calc(100vw-3rem)] bg-surface border border-border rounded-xl shadow-lg p-3 z-50 animate-fade-in flex flex-col gap-2">
                    {newTaskTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto mb-1">
                        {newTaskTags.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                            {t}
                            <button type="button" onClick={() => setNewTaskTags(newTaskTags.filter(x => x !== t))} className="hover:text-purple-855 cursor-pointer">×</button>
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
                              setNewTaskTags([...newTaskTags, trimmed]);
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
                            setNewTaskTags([...newTaskTags, trimmed]);
                            setNewTaskTagInput('');
                          }
                        }}
                        className="px-2 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Subtasks Dropdown */}
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowSubtasksDropdown(!showSubtasksDropdown);
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                    setShowPriorityDropdown(false);
                    setShowTagsDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-lg border border-border text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
                >
                  <IconList className="w-4 h-4 text-orange-500" /> 
                  {newTaskSubtasks.length > 0 ? `${newTaskSubtasks.length} Subtask(s)` : 'Subtasks'}
                </button>
                {showSubtasksDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 max-w-[calc(100vw-3rem)] bg-surface border border-border rounded-xl shadow-lg p-3 z-50 animate-fade-in flex flex-col gap-2">
                    <span className="font-bold text-xs text-text-primary block mb-1">Add Subtasks</span>
                    {newTaskSubtasks.length > 0 && (
                      <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto mb-1 custom-scrollbar">
                        {newTaskSubtasks.map(st => (
                          <div key={st.id} className="flex items-center justify-between gap-2 text-xs py-1 px-2 bg-surface-alt rounded-lg">
                            <span className="truncate text-text-secondary flex-1">{st.title}</span>
                            <button 
                              type="button" 
                              onClick={() => setNewTaskSubtasks(prev => prev.filter(x => x.id !== st.id))}
                              className="text-rose-500 hover:text-rose-600 font-bold px-1 cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        id="quick-subtask-input"
                        placeholder="Subtask name..."
                        className="flex-1 bg-surface-alt border-none text-xs p-1.5 rounded-lg outline-none text-text-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              setNewTaskSubtasks(prev => [...prev, { id: crypto.randomUUID(), title: val, completed: false }]);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('quick-subtask-input') as HTMLInputElement;
                          if (input) {
                            const val = input.value.trim();
                            if (val) {
                              setNewTaskSubtasks(prev => [...prev, { id: crypto.randomUUID(), title: val, completed: false }]);
                              input.value = '';
                            }
                          }
                        }}
                        className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-655 transition-colors cursor-pointer"
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
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#007AFF] hover:bg-[#0066CC] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-[#007AFF]/20 shrink-0 self-end sm:self-auto cursor-pointer"
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
                    className="btn btn-danger btn-sm rounded-full text-xs cursor-pointer"
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
                              className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Restore
                            </button>
                            <button 
                              onClick={() => deleteTodoTask(task.id)}
                              className="p-1 hover:bg-rose-500/10 text-text-muted hover:text-rose-500 rounded transition-all cursor-pointer"
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
              className="bg-surface rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5 text-left"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="font-bold text-base sm:text-lg text-text-primary">
                  {monthNames[calendarMonth]} {calendarYear}
                </h3>
                <div className="flex gap-1">
                  <button type="button" onClick={handlePrevMonth} className="btn btn-secondary btn-sm btn-square cursor-pointer"><IconChevronLeft className="w-4 h-4"/></button>
                  <button type="button" onClick={handleNextMonth} className="btn btn-secondary btn-sm btn-square cursor-pointer"><IconChevronRight className="w-4 h-4"/></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] font-bold text-text-muted mb-2 sm:mb-4 uppercase select-none">
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-5 pb-10"
            >
              {([
                { id: 'none', title: 'No Priority', dotColor: 'bg-stone-400 dark:bg-stone-500' },
                { id: 'low', title: 'Low', dotColor: 'bg-blue-500' },
                { id: 'medium', title: 'Medium', dotColor: 'bg-amber-500' },
                { id: 'high', title: 'High', dotColor: 'bg-rose-500' }
              ] as const).map(col => {
                const colTasks = filteredTasks.filter(t => t.priority === col.id);
                return (
                  <div 
                    key={col.id} 
                    className="flex flex-col rounded-3xl p-4 bg-stone-50 dark:bg-stone-900/40 border border-border/40 min-h-[500px] flex-1 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-border/30 select-none">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                        <span className="font-extrabold text-xs uppercase tracking-wider text-text-primary">{col.title}</span>
                      </div>
                      <span className="text-[10px] font-black bg-surface text-text-secondary px-2 py-0.5 rounded-full border shadow-sm shrink-0">
                        {colTasks.length}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 overflow-y-auto flex-1 max-h-[420px] pr-1 scrollbar-thin">
                      {colTasks.length === 0 ? (
                        <div className="text-center py-16 text-[10px] text-text-muted font-bold uppercase tracking-wider italic select-none">
                          No tasks
                        </div>
                      ) : (
                        colTasks.map(task => (
                          <div 
                            key={task.id}
                            className={`p-2.5 rounded-2xl border transition-all duration-200 group cursor-pointer flex flex-col gap-1.5 bg-surface ${
                              task.priority === 'high' ? 'border-rose-500/30 hover:border-rose-500/45 bg-rose-500/[0.01]' :
                              task.priority === 'medium' ? 'border-amber-500/30 hover:border-amber-500/45 bg-amber-500/[0.01]' :
                              task.priority === 'low' ? 'border-blue-500/30 hover:border-blue-500/45 bg-blue-500/[0.01]' :
                              'border-border/60 hover:border-border bg-surface'
                            } hover:shadow-sm`}
                            onClick={() => handleToggleTask(task.id)}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id); }}
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                                    task.completed 
                                      ? 'bg-rose-500 border-rose-500 text-white' 
                                      : 'border-border/80 hover:border-rose-400 text-transparent'
                                  }`}
                                >
                                  <IconCheck className="w-2.5 h-2.5" />
                                </button>
                                <span className={`text-xs leading-tight font-bold select-none truncate ${task.completed ? 'line-through text-text-muted font-semibold' : 'text-text-primary'}`} title={task.title}>
                                  {task.title}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteTodoTask(task.id); }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-500/10 hover:text-rose-500 rounded transition-all text-text-muted cursor-pointer shrink-0"
                                title="Delete Task"
                              >
                                <IconTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {(task.dueDate || task.projectId) && (
                              <div className="flex items-center gap-2 pl-6.5">
                                {task.dueDate && (
                                  <span className="text-[8px] font-black uppercase text-text-muted tracking-wider">
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                                {task.projectId && (() => {
                                  const proj = todoProjects.find(p => p.id === task.projectId);
                                  if (!proj) return null;
                                  return (
                                    <span 
                                      className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-stone-50 dark:bg-stone-900 border shrink-0"
                                      style={{ borderColor: proj.color + '30', color: proj.color }}
                                    >
                                      {proj.name}
                                    </span>
                                  );
                                })()}
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
  );
};

// Internal Helpers
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
      <div className="flex items-center gap-3 mb-4 text-sm select-none text-left">
        <h3 className="font-bold text-text-primary">{title}</h3>
        <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs font-bold">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {tasks.map(task => {
            const isCompleted = task.completed || completingIds.includes(task.id);
            const isCompleting = completingIds.includes(task.id);
            return (
              <TaskItem
                key={task.id}
                task={task}
                isCompleted={isCompleted}
                isCompleting={isCompleting}
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
  task, isCompleted, isCompleting = false, onToggle, onDelete,
  tickStyle, strikeStyle, projects, openTodoTaskModal
}: {
  task: TodoTask;
  isCompleted: boolean;
  isCompleting?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  tickStyle: string;
  strikeStyle: string;
  projects: TodoProject[];
  openTodoTaskModal: (task?: TodoTask | null) => void;
}) {
  const updateTodoTask = useAppStore(state => state.updateTodoTask);
  const settings = useAppStore(state => state.settings);
  const activeFocusItem = useAppStore(state => state.activeFocusItem);
  const setActiveFocusItem = useAppStore(state => state.setActiveFocusItem);
  const todoCompletionAnimation = settings.todoCompletionAnimation || 'circle-fill-confetti';

  // Pre-generate particle positions for explosions
  const particles = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const angle = (i / 22) * 360 * (Math.PI / 180);
      const speed = 40 + Math.random() * 70;
      const size = 4 + Math.random() * 5;
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f97316', '#a855f7', '#eab308'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = Math.random() > 0.5 ? 'circle' : 'square';
      return {
        id: i,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        size,
        color,
        shape,
        rotation: Math.random() * 360,
      };
    });
  }, []);

  const emojis = ['🎉', '✨', '🥳', '🌟', '👏', '💖'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`group flex flex-col p-4 rounded-2xl hover:bg-surface/85 border transition-all relative overflow-hidden text-left ${
        isCompleted 
          ? 'border-transparent bg-surface/30' 
          : 'border-dashed border-border-alt hover:border-border bg-surface/60 shadow-sm'
      }`}
    >
      {/* ── Ripple + Particles Background Wave ── */}
      {isCompleting && todoCompletionAnimation === 'ripple-particles' && (
        <motion.div
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ scale: 22, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute bg-purple-500/20 w-8 h-8 rounded-full pointer-events-none z-0"
          style={{ left: '22px', top: '22px', transform: 'translate(-50%, -50%)' }}
        />
      )}

      {/* ── Ripple Rising Dust ── */}
      {isCompleting && todoCompletionAnimation === 'ripple-particles' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {Array.from({ length: 12 }).map((_, i) => {
            const startX = 30 + Math.random() * 200;
            const startY = 15 + Math.random() * 30;
            return (
              <motion.div
                key={i}
                initial={{ x: startX, y: startY, opacity: 1, scale: 0.8 }}
                animate={{ y: startY - 35, x: startX + (Math.random() - 0.5) * 20, opacity: 0, scale: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: Math.random() * 0.12 }}
                className="absolute w-1.5 h-1.5 rounded-full bg-purple-400/50"
              />
            );
          })}
        </div>
      )}

      {/* ── Bounce Circle Pulse Ring ── */}
      {isCompleting && todoCompletionAnimation === 'bounce-circle' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2.3, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute w-8 h-8 rounded-full border border-rose-500/40 pointer-events-none z-0"
          style={{ left: '22px', top: '22px', transform: 'translate(-50%, -50%)' }}
        />
      )}

      {/* ── Sweep Line + Fill ── */}
      {isCompleting && todoCompletionAnimation === 'sweep-fill' && (
        <>
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-r from-green-400 to-transparent shadow-[0_0_8px_rgba(74,222,128,0.8)] pointer-events-none z-30"
          />
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="absolute left-0 top-0 bottom-0 bg-green-500/5 pointer-events-none z-0"
          />
        </>
      )}

      <div className="flex items-start gap-3 w-full relative z-10">
        
        {/* Checkbox Button */}
        <button 
          onClick={() => onToggle(task.id)}
          className="w-5.5 h-5.5 rounded-full border-2 border-text-muted hover:border-rose-400 bg-transparent flex items-center justify-center shrink-0 relative overflow-hidden z-10 mt-0.5 cursor-pointer"
        >
          {/* Custom Circle Fill Animation */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={isCompleted ? { scale: 1 } : { scale: 0 }}
            transition={todoCompletionAnimation === 'bounce-circle' 
              ? { type: 'spring', stiffness: 350, damping: 12 }
              : { duration: 0.22, ease: 'easeOut' }
            }
            className={`absolute inset-0 rounded-full ${
              todoCompletionAnimation === 'sweep-fill' ? 'bg-green-500' :
              todoCompletionAnimation === 'ripple-particles' ? 'bg-purple-500' : 'bg-rose-500'
            }`}
          />

          <AnimatePresence>
            {isCompleted && (
              <motion.svg 
                initial={tickStyle === 'bounce' || todoCompletionAnimation === 'bounce-circle' ? { scale: 0, rotate: -45 } : { pathLength: 0, opacity: 0 }}
                animate={tickStyle === 'bounce' || todoCompletionAnimation === 'bounce-circle' ? { scale: 1, rotate: 0 } : { pathLength: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-3.5 h-3.5 text-white relative z-10" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
              >
                <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* ── Particle Emitter Overlay (Circle/Pop Confetti) ── */}
        {isCompleting && (todoCompletionAnimation === 'circle-fill-confetti' || todoCompletionAnimation === 'pop-confetti') && (
          <div className="absolute top-3 left-3 pointer-events-none z-50">
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
                animate={{ 
                  x: p.x, 
                  y: p.y, 
                  scale: 0, 
                  opacity: 0,
                  rotate: p.rotation + 180 
                }}
                transition={{ duration: todoCompletionAnimation === 'pop-confetti' ? 0.5 : 0.6, ease: [0.1, 0.8, 0.3, 1] }}
                className={`absolute ${p.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Emoji Pop Emitter Overlay ── */}
        {isCompleting && todoCompletionAnimation === 'emoji-pop' && (
          <div className="absolute top-3 left-3 pointer-events-none z-50">
            {Array.from({ length: 8 }).map((_, i) => {
              const emoji = emojis[i % emojis.length];
              const angle = (i / 8) * 360 * (Math.PI / 180) + (Math.random() - 0.5) * 0.4;
              const dist = 35 + Math.random() * 45;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                  animate={{ 
                    x: Math.cos(angle) * dist, 
                    y: Math.sin(angle) * dist - 25, 
                    scale: [0, 1.35, 0], 
                    opacity: [1, 1, 0],
                    rotate: (Math.random() - 0.5) * 60 
                  }}
                  transition={{ duration: 0.58, ease: 'easeOut', delay: Math.random() * 0.05 }}
                  className="absolute text-xs"
                  style={{ marginLeft: '-8px', marginTop: '-8px' }}
                >
                  {emoji}
                </motion.span>
              );
            })}
          </div>
        )}

        {/* ── Star Burst Emitter Overlay ── */}
        {isCompleting && todoCompletionAnimation === 'star-burst' && (
          <div className="absolute top-3 left-3 pointer-events-none z-50">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * 360 * (Math.PI / 180);
              const dist = 45 + Math.random() * 35;
              return (
                <motion.svg
                  key={i}
                  viewBox="0 0 24 24"
                  fill="gold"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                  animate={{ 
                    x: Math.cos(angle) * dist, 
                    y: Math.sin(angle) * dist, 
                    scale: [0, 1.25, 0], 
                    opacity: [1, 1, 0],
                    rotate: 270 
                  }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute w-3.5 h-3.5 text-yellow-400"
                  style={{ marginLeft: '-7px', marginTop: '-7px' }}
                >
                  <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.858 1.4-8.168L.134 10.41l8.2-1.192L12 .587z" />
                </motion.svg>
              );
            })}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <span 
            onDoubleClick={() => {
              if (!isCompleted) openTodoTaskModal(task);
            }}
            className={`block text-sm font-semibold leading-snug transition-all ${
              isCompleted ? 'text-text-muted line-through' : 'text-text-primary'
            } cursor-pointer break-words`}
            style={isCompleted ? { 
              textDecorationStyle: strikeStyle as any,
              textDecorationThickness: strikeStyle === 'double' ? '3px' : '2px',
              textDecorationColor: 'currentColor'
            } : undefined}
            title="Double click to edit task details"
          >
            {task.title}
          </span>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2.5 pl-2 flex flex-col gap-1.5 border-l-2 border-border/80 text-xs text-left">
              {task.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 py-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = (task.subtasks || []).map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                      updateTodoTask(task.id, { subtasks: updated });
                    }}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      st.completed 
                        ? 'border-rose-500 bg-rose-500 text-white' 
                        : 'border-text-muted/65 hover:border-rose-400 bg-transparent'
                    }`}
                  >
                    {st.completed && <IconCheck size={9} strokeWidth={4} />}
                  </button>
                  <span className={`flex-1 break-all select-none leading-tight ${st.completed ? 'text-text-muted line-through' : 'text-text-secondary'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 ml-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {!isCompleted && (
            <button 
              onClick={() => {
                const isActive = activeFocusItem?.id === task.id;
                setActiveFocusItem(isActive ? null : { type: 'todo', id: task.id, title: task.title });
              }} 
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFocusItem?.id === task.id
                  ? 'text-blue-500 bg-blue-500/10'
                  : 'text-text-muted hover:text-blue-500 hover:bg-blue-500/10'
              }`}
              title={activeFocusItem?.id === task.id ? "Deactivate focus" : "Focus on this task"}
            >
              <IconTarget className="w-4 h-4" />
            </button>
          )}
          {!isCompleted && (
            <button 
              onClick={() => openTodoTaskModal(task)} 
              className="p-1.5 text-text-muted hover:text-[#007AFF] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Edit task details"
            >
              <IconEdit className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => onDelete(task.id)} 
            className="p-1.5 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete task"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(task.projectId || task.priority !== 'none' || task.dueDate || task.startTime || task.endTime || (task.tags && task.tags.length > 0) || (task.pomodoroCount !== undefined && task.pomodoroCount > 0) || (task.subtasks && task.subtasks.length > 0)) && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-border/30 w-full text-[11px] text-text-secondary select-none relative z-10">
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/5 text-rose-500 border border-rose-500/10 font-semibold">
              <IconLayoutList className="w-3 h-3 text-text-muted" />
              <span>
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
              </span>
            </span>
          )}

          {task.projectId && projects.find(p => p.id === task.projectId) && (
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] shrink-0"
              style={{
                backgroundColor: `${projects.find(p => p.id === task.projectId)?.color}15`,
                color: projects.find(p => p.id === task.projectId)?.color,
                border: `1px solid ${projects.find(p => p.id === task.projectId)?.color}30`
              }}
            >
              {projects.find(p => p.id === task.projectId)?.name}
            </span>
          )}

          {task.priority !== 'none' && (
            <span 
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${
                task.priority === 'high' 
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                  : task.priority === 'medium'
                  ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}
            >
              <IconFlag className="w-3 h-3" fill="currentColor" />
              <span className="capitalize">{task.priority} Priority</span>
            </span>
          )}

          {task.dueDate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-alt border border-border">
              <IconCalendar className="w-3 h-3 text-text-muted" />
              <span>Due {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
            </span>
          )}

          {(task.startTime || task.endTime) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/5 text-rose-500 border border-rose-500/10">
              <IconClock className="w-3 h-3" />
              <span>{task.startTime || '??'} - {task.endTime || '??'}</span>
            </span>
          )}

          {task.pomodoroCount !== undefined && task.pomodoroCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/5 text-orange-500 border border-orange-500/10" title={`${task.pomodoroCount} focus sessions completed`}>
              <span>🍅</span>
              <span>{task.pomodoroCount} Focus Session{task.pomodoroCount > 1 ? 's' : ''}</span>
            </span>
          )}

          {task.tags && task.tags.map(t => (
            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium">
              #{t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
