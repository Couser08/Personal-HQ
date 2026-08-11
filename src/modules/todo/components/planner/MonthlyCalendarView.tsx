import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../../../store/useAppStore';
import { 
  IconChevronLeft, IconChevronRight, IconPlus, IconSearch, 
  IconCheck, IconMapPin, IconClock, IconSun, IconChevronDown 
} from '@tabler/icons-react';
import { PlannerSidebar } from './PlannerSidebar';
import { type TodoTask } from '../../../../store/types';
import { ProgressRing } from '../../../../components/ui/ProgressRing';

export function MonthlyCalendarView() {
  const { 
    todoTasks, habits, countdowns, 
    addTodoTask, updateTodoTask, deleteTodoTask 
  } = useAppStore(useShallow(state => ({
    todoTasks: state.todoTasks,
    habits: state.habits,
    countdowns: state.countdowns || [],
    addTodoTask: state.addTodoTask,
    updateTodoTask: state.updateTodoTask,
    deleteTodoTask: state.deleteTodoTask,
  })));

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewTab, setActiveViewTab] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);

  // Calendar type filtering states
  const [calendars, setCalendars] = useState({
    personal: true,
    work: true,
    study: true,
    health: true,
    holidays: true,
  });

  // Filter category state
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const selectedDateStr = useMemo(() => selectedDate.toLocaleDateString('en-CA'), [selectedDate]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Build grid calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toLocaleDateString('en-CA'),
      });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateStr: d.toLocaleDateString('en-CA'),
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toLocaleDateString('en-CA'),
      });
    }

    return days;
  }, [currentMonth]);

  // Mini Calendar helper
  const miniCalendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthTotalDays - i),
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [currentMonth]);

  // Match items for cell grids
  const getCellEvents = (dateStr: string) => {
    // 1. Planner Tasks / Events
    const dayTasks = todoTasks.filter(t => !t.deleted && t.dueDate?.startsWith(dateStr));
    
    // 2. Countdowns
    const dayCountdowns = countdowns.filter(c => c.targetDate?.startsWith(dateStr));

    // 3. Habits completed on this date
    const dayHabits = habits.filter(h => h.completedDates.includes(dateStr));

    return {
      tasks: dayTasks,
      countdowns: dayCountdowns,
      habits: dayHabits,
    };
  };

  // Filtered lists for the right side details
  const selectedDayItems = useMemo(() => {
    const tasks = todoTasks.filter(t => !t.deleted && t.dueDate?.startsWith(selectedDateStr));
    
    // Apply categories and search query filtering
    return tasks.filter(task => {
      const matchSearch = searchQuery.trim() === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = filterCategory === 'All' || task.category === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [todoTasks, selectedDateStr, searchQuery, filterCategory]);

  const selectedDayCountdowns = useMemo(() => {
    return countdowns.filter(c => c.targetDate?.startsWith(selectedDateStr));
  }, [countdowns, selectedDateStr]);

  const selectedDayHabits = useMemo(() => {
    // Get habits checkoff list for selected date
    return habits.map(h => ({
      habit: h,
      completed: h.completedDates.includes(selectedDateStr),
    }));
  }, [habits, selectedDateStr]);

  // Stats completed ratio for right pane
  const plansStats = useMemo(() => {
    const total = selectedDayItems.length;
    const completed = selectedDayItems.filter(t => t.completed).length;
    const ratio = total > 0 ? completed / total : 0;
    return { total, completed, ratio };
  }, [selectedDayItems]);

  // CRUD actions proxy
  const handleAddPlan = (planData: Partial<TodoTask>) => {
    addTodoTask({
      id: crypto.randomUUID(),
      title: planData.title || 'Untitled Plan',
      completed: false,
      priority: planData.priority || 'none',
      tags: [],
      category: planData.category,
      dueDate: selectedDateStr,
      startTime: planData.startTime,
      endTime: planData.endTime,
      description: planData.description,
      location: planData.location,
      reminder: planData.reminder,
      repeat: planData.repeat,
      createdAt: new Date().toISOString(),
      projectId: null,
    });
  };

  const handleUpdatePlan = (id: string, updates: Partial<TodoTask>) => {
    updateTodoTask(id, updates);
  };

  const handleDeletePlan = (id: string) => {
    deleteTodoTask(id);
  };

  const handleToggleComplete = (id: string) => {
    const task = todoTasks.find(t => t.id === id);
    if (task) {
      updateTodoTask(id, { completed: !task.completed });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] w-full bg-[#f8fafc] dark:bg-bg-primary rounded-[28px] border border-slate-100 dark:border-border shadow-sm overflow-hidden select-none font-sans text-left">
      
      {/* ── LEFT COLUMN: Mini Calendar & Custom Categories ── */}
      <div className="w-full lg:w-64 border-r border-slate-100 dark:border-border/80 bg-white dark:bg-surface/30 p-5 flex flex-col gap-6 shrink-0">
        
        {/* Mini Calendar */}
        <div className="flex flex-col gap-3">
          <div className="bg-white dark:bg-surface border border-slate-100 dark:border-border/50 rounded-[24px] p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            {/* Calendar Mini Header */}
            <div className="flex items-center justify-between text-xs font-black text-text-primary mb-3 px-1">
              <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-hover text-text-secondary cursor-pointer border-none bg-transparent"><IconChevronLeft size={13} strokeWidth={2.5} /></button>
                <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-hover text-text-secondary cursor-pointer border-none bg-transparent"><IconChevronRight size={13} strokeWidth={2.5} /></button>
              </div>
            </div>
            {/* Days grid labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-text-muted uppercase mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            {/* Small dates list */}
            <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-bold">
              {miniCalendarDays.map((c, i) => {
                const isSelected = c.date.toDateString() === selectedDate.toDateString();
                const isToday = c.date.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(c.date)}
                    className={`w-6.5 h-6.5 rounded-full flex items-center justify-center cursor-pointer border-none bg-transparent transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white font-black'
                        : isToday
                          ? 'border border-indigo-600 text-indigo-600 font-black'
                          : c.isCurrentMonth
                            ? 'text-text-primary hover:bg-slate-50 dark:hover:bg-surface-hover'
                            : 'text-text-muted/30'
                    }`}
                  >
                    {c.day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Source Categories Filters */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Calendars</span>
          <div className="flex flex-col gap-2.5">
            {Object.keys(calendars).map((calKey) => {
              const label = calKey.charAt(0).toUpperCase() + calKey.slice(1);
              const colorBall = calKey === 'personal' ? 'bg-indigo-550' :
                                calKey === 'work' ? 'bg-blue-500' :
                                calKey === 'study' ? 'bg-emerald-500' :
                                calKey === 'health' ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <label key={calKey} className="flex items-center justify-between text-xs font-bold text-text-secondary cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={(calendars as any)[calKey]}
                      onChange={(e) => setCalendars({ ...calendars, [calKey]: e.target.checked })}
                      className="w-4 h-4 rounded-md border-slate-200 dark:border-border text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{label}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${colorBall}`} />
                </label>
              );
            })}
          </div>
        </div>

        {/* Type selector */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
            <span>Filters</span>
            <button onClick={() => setFilterCategory('All')} className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 border-none bg-transparent hover:underline cursor-pointer uppercase">Clear all</button>
          </div>
          <div className="flex flex-col gap-1.5">
            {['All', 'Routine', 'Focus', 'Learning', 'Work', 'Personal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-2.5 rounded-[14px] text-left text-xs font-black border-none transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                    : 'bg-transparent text-text-secondary hover:bg-slate-50 dark:hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                {cat === 'All' ? 'All Events' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CENTER PANEL: Large Monthly Calendar Grid ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface/10">
        
        {/* Calendar Nav Header */}
        <div className="p-4.5 border-b border-slate-100 dark:border-border/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[19px] font-black text-text-primary tracking-tight flex items-center gap-1.5 cursor-pointer">
              <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <IconChevronDown size={14} className="text-text-muted" />
            </h2>
            
            <div className="flex items-center bg-slate-50 dark:bg-surface border border-slate-200/60 dark:border-border/50 rounded-xl p-0.5 shadow-sm">
              <button onClick={handlePrevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white dark:hover:bg-surface-hover cursor-pointer border-none bg-transparent transition-all">
                <IconChevronLeft size={15} strokeWidth={2.5} />
              </button>
              <button onClick={handleToday} className="px-3.5 text-xs font-bold text-text-secondary hover:text-text-primary cursor-pointer border-none bg-transparent">
                Today
              </button>
              <button onClick={handleNextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white dark:hover:bg-surface-hover cursor-pointer border-none bg-transparent transition-all">
                <IconChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Toggle view options: Month, Week, Day, Agenda */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-surface border border-slate-200/50 dark:border-border/50 p-1 rounded-xl shadow-sm">
            {(['month', 'week', 'day', 'agenda'] as const).map((viewTab) => (
              <button
                key={viewTab}
                onClick={() => setActiveViewTab(viewTab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border-none cursor-pointer ${
                  activeViewTab === viewTab
                    ? 'bg-white dark:bg-surface-alt text-indigo-600 dark:text-indigo-400 shadow-sm font-black'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {viewTab}
              </button>
            ))}
          </div>

          {/* Search Events bar */}
          <div className="relative w-full sm:w-60">
            <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-surface border border-slate-200/60 dark:border-border/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Large monthly dates grid container */}
        <div className="flex-grow grid grid-cols-7 grid-rows-[auto_repeat(6,_1fr)] min-h-[550px] bg-white dark:bg-surface/20">
          
          {/* Weekday Labels Header Row */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={i} className="border-b border-r border-slate-100 dark:border-border/50 py-3 text-center text-[10px] font-black text-text-muted uppercase tracking-widest bg-slate-50/50 dark:bg-surface-alt/20 last:border-r-0">
              {d}
            </div>
          ))}

          {/* Date Grid Cells */}
          {calendarDays.map((cell, idx) => {
            const isSelected = cell.date.toDateString() === selectedDate.toDateString();
            const isToday = cell.date.toDateString() === new Date().toDateString();
            const cellEvents = getCellEvents(cell.dateStr);
            
            // Total tasks, countdowns, habits counts
            const totalCount = cellEvents.tasks.length + cellEvents.countdowns.length + cellEvents.habits.length;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(cell.date)}
                className={`border-b border-r border-slate-100 dark:border-border/50 p-2 flex flex-col gap-1 text-left relative transition-all min-h-[90px] cursor-pointer hover:bg-slate-50/50 dark:hover:bg-surface-hover/20 ${
                  isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-2 border-indigo-600 -m-px z-10 rounded-xl shadow-sm' : ''
                } ${!cell.isCurrentMonth ? 'opacity-30 bg-slate-50/10 dark:bg-surface-alt/10' : ''} last:border-r-0`}
              >
                {/* Date digit */}
                <div className="flex justify-between items-center pb-1">
                  {isToday ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  ) : <span />}
                  <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[11.5px] font-extrabold ${
                    isSelected ? 'text-indigo-600 font-black' : isToday ? 'text-indigo-600 font-black bg-indigo-50 dark:bg-indigo-950/20' : 'text-text-primary'
                  }`}>
                    {cell.date.getDate()}
                  </span>
                </div>

                {/* Day check-in bullet events list styled as badges matching image */}
                <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                  
                  {/* Render countdowns (Rose) */}
                  {cellEvents.countdowns.slice(0, 1).map((c) => (
                    <div key={c.id} className="text-[9.5px] font-black px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 flex items-center truncate">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0 mr-1.5" />
                      {c.label}
                    </div>
                  ))}

                  {/* Render habits completed (Green) */}
                  {cellEvents.habits.slice(0, 1).map((h) => (
                    <div key={h.id} className="text-[9.5px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center truncate">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0 mr-1.5" />
                      {h.name}
                    </div>
                  ))}

                  {/* Render scheduled plans (Indigo / Blue) */}
                  {cellEvents.tasks.slice(0, 2).map((t) => (
                    <div 
                      key={t.id} 
                      className={`text-[9.5px] font-black px-2 py-0.5 rounded-lg flex items-center truncate ${
                        t.completed 
                          ? 'bg-slate-100 dark:bg-surface-alt text-text-muted line-through border border-slate-200 dark:border-border'
                          : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full shrink-0 mr-1.5 ${t.completed ? 'bg-text-muted' : 'bg-indigo-500'}`} />
                      {t.title}
                    </div>
                  ))}

                  {/* More indicator */}
                  {totalCount > 3 && (
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-wider pl-1.5 mt-0.5 block">
                      +{totalCount - 3} more items
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT COLUMN: Detailed Selected Date Overview Panel ── */}
      <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-border/85 bg-white dark:bg-surface/30 p-6 flex flex-col gap-6 shrink-0 text-left">
        
        {/* Selected date header */}
        <div className="flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Selected Overview</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <IconSun size={15} />
              <span>26°C</span>
            </div>
          </div>
          <h3 className="text-[18px] font-black text-text-primary tracking-tight mt-0.5 flex items-center gap-1">
            <span>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <IconChevronDown size={14} className="text-text-muted" />
          </h3>
          
          {/* Progress bar info */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between items-center text-[10.5px] font-bold text-text-secondary">
              <span>You have {selectedDayItems.length} events today</span>
              <span>{Math.round(plansStats.ratio * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-surface-alt rounded-full overflow-hidden border border-slate-200/50 dark:border-border/60">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${plansStats.ratio * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-border/60 w-full" />

        {/* Timeline Events / Plans List (styled exactly like image layout) */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Schedule</span>
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto custom-scrollbar">
            {selectedDayItems.length === 0 ? (
              <p className="text-xs text-text-muted italic py-4 text-center">No events or plans today.</p>
            ) : (
              selectedDayItems.map((item, index) => {
                const borderClass = index % 3 === 0 ? 'border-l-blue-500' :
                                    index % 3 === 1 ? 'border-l-orange-500' : 'border-l-indigo-500';
                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setEditingTask(item);
                      setIsAddModalOpen(true);
                    }}
                    className={`p-3 rounded-xl border border-slate-100 dark:border-border bg-white dark:bg-surface border-l-4 ${borderClass} flex items-center justify-between gap-3 text-left cursor-pointer transition-all hover:translate-x-0.5 hover:shadow-subtle`}
                  >
                    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                      <p className="text-[12.5px] font-extrabold text-text-primary truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[9.5px] text-text-muted font-bold mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <IconClock size={10} /> {item.startTime || '10:00 AM'} - {item.endTime || '11:30 AM'}
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
                            <IconMapPin size={10} /> {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open meeting URL or copy
                        if (item.location && item.location.startsWith('http')) {
                          window.open(item.location, '_blank');
                        } else {
                          handleToggleComplete(item.id);
                        }
                      }}
                      className="shrink-0 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 text-[10.5px] font-extrabold px-3 py-1.5 rounded-xl border-none cursor-pointer transition-colors"
                    >
                      {item.location && item.location.startsWith('http') ? 'Join' : item.completed ? 'Undo' : 'Done'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tasks list checklist section */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tasks</span>
            <button 
              onClick={() => {
                setEditingTask(null);
                setIsAddModalOpen(true);
              }}
              className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 border-none bg-transparent hover:underline cursor-pointer"
            >
              + Add Task
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto custom-scrollbar">
            {selectedDayItems.length === 0 ? (
              <p className="text-xs text-text-muted italic py-1 text-center">No tasks for today.</p>
            ) : (
              selectedDayItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    setEditingTask(item);
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center justify-between text-xs font-bold text-text-secondary cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(item.id);
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all focus:outline-none bg-transparent cursor-pointer ${
                        item.completed 
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-border hover:border-indigo-600'
                      }`}
                    >
                      {item.completed && <IconCheck size={11} strokeWidth={3} />}
                    </button>
                    <span className={`truncate ${item.completed ? 'line-through text-text-muted' : ''}`}>
                      {item.title}
                    </span>
                  </div>
                  <IconChevronRight size={12} className="text-text-muted/40 shrink-0 ml-2" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Countdowns list display */}
        {selectedDayCountdowns.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Countdowns & Events</span>
            <div className="flex flex-col gap-2">
              {selectedDayCountdowns.map(c => (
                <div key={c.id} className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center gap-2.5 text-left text-xs font-bold text-rose-600 dark:text-rose-450">
                  <span className="text-sm">{c.emoji}</span>
                  <span>{c.label} Target Date!</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habit tracker circle dials */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Habit Tracker</span>
            <button 
              onClick={() => {
                const store = (window as any).useAppStore || null;
                if (store) store.getState().setActiveModule('habits');
              }}
              className="text-[10.5px] font-black text-indigo-600 dark:text-indigo-400 border-none bg-transparent hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {selectedDayHabits.length === 0 ? (
              <p className="col-span-4 text-xs text-text-muted italic py-1 text-center">No habits found.</p>
            ) : (
              selectedDayHabits.slice(0, 4).map(({ habit, completed }) => (
                <div key={habit.id} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <ProgressRing
                      progress={completed ? 1 : 0.6}
                      size={44}
                      strokeWidth={4.5}
                      color="#5850EC"
                      style="solid"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold">
                      {completed ? '5/5' : '3/5'}
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-text-muted truncate max-w-full text-center" title={habit.name}>
                    {habit.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Event Button at bottom */}
        <button 
          onClick={() => {
            setEditingTask(null);
            setIsAddModalOpen(true);
          }}
          className="w-full bg-[#5850EC] hover:bg-[#4b43d3] text-white py-2.5 px-4 rounded-[18px] text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border-none shadow-md cursor-pointer transition-colors mt-auto"
        >
          <IconPlus size={14} strokeWidth={3} /> Create New Event
        </button>
      </div>

      {/* Embedded form scheduler sidebar */}
      <PlannerSidebar 
        selectedDate={selectedDate} 
        taskToEdit={editingTask}
        onAddPlan={handleAddPlan}
        onUpdatePlan={handleUpdatePlan}
        onDeletePlan={handleDeletePlan}
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}
