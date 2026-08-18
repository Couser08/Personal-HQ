import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../../../store/useAppStore';
import { 
  IconChevronLeft, IconChevronRight, IconPlus, IconSearch, 
  IconCheck, IconMapPin, IconClock, IconChevronDown,
  IconPencil
} from '@tabler/icons-react';
import { PlannerSidebar } from './PlannerSidebar';
import { type TodoTask } from '../../../../store/types';
import { ProgressRing } from '../../../../components/ui/ProgressRing';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

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

  // Filter category
  const filterCategory = 'All';

  const selectedDateStr = useMemo(() => selectedDate.toLocaleDateString('en-CA'), [selectedDate]);

  // Navigate months, weeks, or days depending on activeViewTab
  const handlePrev = () => {
    if (activeViewTab === 'day') {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
      setCurrentMonth(prev);
    } else if (activeViewTab === 'week') {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 7);
      setSelectedDate(prev);
      setCurrentMonth(prev);
    } else {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (activeViewTab === 'day') {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
      setCurrentMonth(next);
    } else if (activeViewTab === 'week') {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 7);
      setSelectedDate(next);
      setCurrentMonth(next);
    } else {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    }
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

  // Match items for cell grids
  const getCellEvents = (dateStr: string) => {
    const dayTasks = todoTasks.filter(t => !t.deleted && t.dueDate?.startsWith(dateStr));
    const dayCountdowns = countdowns.filter(c => c.targetDate?.startsWith(dateStr));
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
    
    return tasks.filter(task => {
      const matchSearch = searchQuery.trim() === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = filterCategory === 'All' || task.category === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [todoTasks, selectedDateStr, searchQuery, filterCategory]);

  // Events: items with time slots
  const selectedDayEvents = useMemo(() => {
    return selectedDayItems.filter(item => item.startTime);
  }, [selectedDayItems]);

  // Tasks: simple checklist items with no time slot
  const selectedDayTasks = useMemo(() => {
    return selectedDayItems.filter(item => !item.startTime);
  }, [selectedDayItems]);

  const selectedDayCountdowns = useMemo(() => {
    return countdowns.filter(c => c.targetDate?.startsWith(selectedDateStr));
  }, [countdowns, selectedDateStr]);

  const selectedDayHabits = useMemo(() => {
    return habits.map(h => ({
      habit: h,
      completed: h.completedDates.includes(selectedDateStr),
    }));
  }, [habits, selectedDateStr]);

  const plansStats = useMemo(() => {
    const total = selectedDayItems.length;
    const completed = selectedDayItems.filter(t => t.completed).length;
    return {
      total,
      completed,
      ratio: total > 0 ? completed / total : 0,
    };
  }, [selectedDayItems]);

  const handleCreatePlan = (planData: Partial<TodoTask>) => {
    addTodoTask({
      id: crypto.randomUUID(),
      title: planData.title || 'Untitled Event',
      completed: false,
      priority: planData.priority || 'none',
      tags: [],
      category: planData.category,
      dueDate: selectedDateStr,
      startTime: planData.startTime || null,
      endTime: planData.endTime || null,
      description: planData.description,
      location: planData.location,
      reminder: planData.reminder,
      repeat: planData.repeat,
      featured: planData.featured,
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

  // Week days helper for Week View
  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        date: d,
        dateStr: d.toLocaleDateString('en-CA'),
        dayName: d.toLocaleDateString('default', { weekday: 'short' }),
        dayNum: d.getDate(),
      };
    });
  }, [selectedDate]);

  // Agenda items helper
  const sortedAgendaItems = useMemo(() => {
    const currentYear = currentMonth.getFullYear();
    const currentM = currentMonth.getMonth();
    return todoTasks
      .filter(t => !t.deleted && t.dueDate && new Date(t.dueDate).getFullYear() === currentYear && new Date(t.dueDate).getMonth() === currentM)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [todoTasks, currentMonth]);

  return (
    <div className="@container/calendar flex flex-col lg:flex-row min-h-[calc(100dvh-5rem)] w-full bg-[#f8fafc] dark:bg-bg-primary rounded-3xl sm:rounded-[28px] border border-slate-100 dark:border-border shadow-xs overflow-hidden select-none font-sans text-left">
      
      {/* ── CENTER PANEL: Main Interactive Work Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface/10">
        
        {/* Navigation Bar */}
        <div className="p-4.5 border-b border-slate-100 dark:border-border/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[19px] font-black text-text-primary tracking-tight flex items-center gap-1.5 cursor-pointer">
              <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <IconChevronDown size={14} className="text-text-muted" />
            </h2>
            
            <div className="flex items-center bg-slate-50 dark:bg-surface border border-slate-200/60 dark:border-border/50 rounded-xl p-0.5 shadow-sm">
              <button onClick={handlePrev} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white dark:hover:bg-surface-hover cursor-pointer border-none bg-transparent transition-all">
                <IconChevronLeft size={15} strokeWidth={2.5} />
              </button>
              <button onClick={handleToday} className="px-3.5 text-xs font-bold text-text-secondary hover:text-text-primary cursor-pointer border-none bg-transparent">
                Today
              </button>
              <button onClick={handleNext} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white dark:hover:bg-surface-hover cursor-pointer border-none bg-transparent transition-all">
                <IconChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Tab Options */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-surface border border-slate-200/50 dark:border-border/50 p-1 rounded-xl shadow-sm">
            {(['month', 'week', 'day', 'agenda'] as const).map((viewTab) => (
              <button
                key={viewTab}
                onClick={() => setActiveViewTab(viewTab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border-none cursor-pointer ${
                  activeViewTab === viewTab
                    ? 'bg-white dark:bg-surface-alt text-indigo-650 dark:text-indigo-400 shadow-sm font-black'
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

        {/* ── RENDERING TAB GRID ── */}
        
        {/* Tab 1: Month View Grid */}
        {activeViewTab === 'month' && (
          <div className="flex-grow grid grid-cols-7 grid-rows-[auto_repeat(6,_1fr)] min-h-[360px] sm:min-h-[550px] bg-white dark:bg-surface/20">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={i} className="border-b border-r border-slate-100 dark:border-border/50 py-3 text-center text-[10px] font-black text-text-muted uppercase tracking-widest bg-slate-50/50 dark:bg-surface-alt/20 last:border-r-0">
                {d}
              </div>
            ))}

            {calendarDays.map((cell, idx) => {
              const isSelected = cell.date.toDateString() === selectedDate.toDateString();
              const isToday = cell.date.toDateString() === new Date().toDateString();
              const cellEvents = getCellEvents(cell.dateStr);
              
              const totalCount = cellEvents.tasks.length + cellEvents.countdowns.length + cellEvents.habits.length;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`border-b border-r border-slate-100 dark:border-border/50 p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1 text-left relative transition-all min-h-[52px] sm:min-h-[90px] cursor-pointer hover:bg-slate-50/50 dark:hover:bg-surface-hover/20 ${
                    isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-2 border-indigo-600 -m-px z-10 rounded-xl shadow-sm' : ''
                  } ${!cell.isCurrentMonth ? 'opacity-30 bg-slate-50/10 dark:bg-surface-alt/10' : ''} last:border-r-0`}
                >
                  <div className="flex justify-between items-center pb-0.5 sm:pb-1">
                    {isToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    ) : <span />}
                    <span className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[10.5px] sm:text-[11.5px] font-extrabold ${
                      isSelected ? 'text-indigo-600 font-black' : isToday ? 'text-indigo-600 font-black bg-indigo-50 dark:bg-indigo-950/20' : 'text-text-primary'
                    }`}>
                      {cell.date.getDate()}
                    </span>
                  </div>

                  {/* Mobile Dot Indicators */}
                  <div className="flex items-center justify-center gap-1 sm:hidden mt-0.5 flex-wrap">
                    {cellEvents.countdowns.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                    {cellEvents.habits.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                    {cellEvents.tasks.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.completed ? 'bg-text-muted' : t.featured ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Desktop Full Chip Indicators */}
                  <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden">
                    {cellEvents.countdowns.slice(0, 1).map((c) => (
                      <div key={c.id} className="text-[9.5px] font-black px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 flex items-center truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mr-1.5" />
                        {c.label}
                      </div>
                    ))}

                    {cellEvents.habits.slice(0, 1).map((h) => (
                      <div key={h.id} className="text-[9.5px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mr-1.5" />
                        {h.name}
                      </div>
                    ))}

                    {cellEvents.tasks.slice(0, 2).map((t) => (
                      <div 
                        key={t.id} 
                        className={`text-[9.5px] font-black px-2 py-0.5 rounded-lg flex items-center truncate ${
                          t.completed 
                            ? 'bg-slate-100 dark:bg-surface-alt text-text-muted line-through border border-slate-200 dark:border-border'
                            : t.featured
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-400'
                              : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 ${t.completed ? 'bg-text-muted' : t.featured ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                        {t.title}
                      </div>
                    ))}

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
        )}

        {/* Tab 2: Week View Grid */}
        {activeViewTab === 'week' && (
          <div className="flex-grow grid grid-cols-7 min-h-[550px] bg-white dark:bg-surface/20">
            {weekDays.map((wd, i) => {
              const isSelected = wd.date.toDateString() === selectedDate.toDateString();
              const isToday = wd.date.toDateString() === new Date().toDateString();
              const cellEvents = getCellEvents(wd.dateStr);
              
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedDate(wd.date)}
                  className={`border-r border-slate-100 dark:border-border/50 p-3 flex flex-col gap-2 min-w-0 text-left cursor-pointer last:border-r-0 hover:bg-slate-50/50 dark:hover:bg-surface-hover/20 ${
                    isSelected ? 'bg-indigo-50/10 dark:bg-indigo-950/5 border-2 border-indigo-600 -m-px z-10 rounded-xl' : ''
                  }`}
                >
                  <div className="flex flex-col items-center pb-2 border-b border-slate-100 dark:border-border/40 mb-1.5 shrink-0">
                    <span className="text-[10px] font-black uppercase text-text-muted">{wd.dayName}</span>
                    <span className={`text-base font-black w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                      isToday ? 'bg-indigo-600 text-white animate-pulse' : isSelected ? 'text-indigo-600 font-bold' : 'text-text-primary'
                    }`}>{wd.dayNum}</span>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto flex flex-col gap-1.5 custom-scrollbar max-h-[460px] pr-0.5">
                    {/* Render countdowns */}
                    {cellEvents.countdowns.map(c => (
                      <div key={c.id} className="p-2 rounded-xl border border-solid border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-[10px] font-black flex items-center gap-1">
                        <span>{c.emoji}</span>
                        <span className="truncate">{c.label}</span>
                      </div>
                    ))}

                    {/* Render habits completed */}
                    {cellEvents.habits.map(h => (
                      <div key={h.id} className="p-2 rounded-xl border border-solid border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
                        <span className="truncate">{h.name}</span>
                      </div>
                    ))}

                    {/* Render scheduled plans */}
                    {cellEvents.tasks.map(t => (
                      <div 
                        key={t.id} 
                        className={`p-2 rounded-xl border border-solid text-[10px] font-black flex flex-col gap-0.5 select-none ${
                          t.completed 
                            ? 'bg-slate-100 dark:bg-surface-alt border-slate-200 dark:border-border text-text-muted line-through'
                            : t.featured
                              ? 'bg-amber-500/10 border-amber-400 text-amber-700 dark:text-amber-400'
                              : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400'
                        }`}
                      >
                        <span className="truncate">{t.title}</span>
                        {t.startTime && <span className="text-[8.5px] opacity-75">{t.startTime}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Day View Timeline */}
        {activeViewTab === 'day' && (
          <div className="flex-grow flex flex-col min-h-[550px] bg-white dark:bg-surface/20 p-5 overflow-y-auto custom-scrollbar max-h-[580px]">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3 mb-5 select-none">
              <span className="text-sm font-black text-text-primary">
                Daily Schedule: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <div className="flex flex-col gap-4">
              {['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'].map((hour) => {
                const matchEvents = selectedDayEvents.filter(t => {
                  if (!t.startTime) return false;
                  const tHour = t.startTime.split(':')[0];
                  const tAmpm = t.startTime.match(/AM|PM/i)?.[0].toUpperCase();
                  const hHour = hour.split(':')[0];
                  const hAmpm = hour.match(/AM|PM/i)?.[0].toUpperCase();
                  return parseInt(tHour) === parseInt(hHour) && tAmpm === hAmpm;
                });
                
                return (
                  <div key={hour} className="flex gap-4 items-start select-none">
                    <span className="text-[10px] font-black text-text-muted w-14 text-right pt-2.5 shrink-0 uppercase tracking-wider">{hour}</span>
                    <div className="flex-grow p-4.5 rounded-2xl border border-dashed border-border bg-slate-50/20 dark:bg-surface/10 flex flex-col gap-2 min-h-[64px]">
                      {matchEvents.length === 0 ? (
                        <span className="text-[10.5px] text-text-muted/40 italic font-medium my-auto pl-1">No events scheduled</span>
                      ) : (
                        matchEvents.map(e => (
                          <div 
                            key={e.id}
                            className={`p-3.5 rounded-xl border border-solid flex items-center justify-between gap-3 text-left transition-all ${
                              e.completed 
                                ? 'bg-slate-100 dark:bg-surface-alt border-slate-200 dark:border-border text-text-muted line-through'
                                : e.featured
                                  ? 'border-amber-400 dark:border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                  : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400'
                            }`}
                          >
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                              <span className="text-xs font-black truncate">{e.title}</span>
                              {e.description && <span className="text-[10px] opacity-85 truncate">{e.description}</span>}
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-lg">
                                {e.startTime} - {e.endTime}
                              </span>
                              <button
                                onClick={() => handleToggleComplete(e.id)}
                                className="px-2.5 py-1 text-[10px] font-black rounded-lg border border-solid hover:bg-white/10 cursor-pointer bg-transparent"
                              >
                                {e.completed ? 'Undo' : 'Done'}
                              </button>
                              <button 
                                onClick={() => { setEditingTask(e); setIsAddModalOpen(true); }}
                                className="p-1 rounded bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer active:scale-90"
                              >
                                <IconPencil size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Agenda View List */}
        {activeViewTab === 'agenda' && (
          <div className="flex-grow flex flex-col min-h-[550px] bg-white dark:bg-surface/20 p-6 overflow-y-auto custom-scrollbar max-h-[580px]">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Agenda List (Current Month)</span>
            {sortedAgendaItems.length === 0 ? (
              <p className="text-xs text-text-muted italic py-12 text-center">No upcoming agenda items scheduled.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {sortedAgendaItems.map((agenda) => (
                  <div key={agenda.id} className="flex gap-4 select-none">
                    <div className="w-20 shrink-0 text-right pt-1">
                      <span className="text-xs font-black text-text-primary block">
                        {new Date(agenda.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[9px] text-text-muted font-bold block uppercase mt-0.5">
                        {new Date(agenda.dueDate!).toLocaleDateString('default', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className={`flex-1 p-4 rounded-2xl border border-solid flex items-center justify-between gap-3 text-left ${
                      agenda.completed 
                        ? 'bg-slate-100 dark:bg-surface-alt border-slate-200 dark:border-border text-text-muted line-through'
                        : agenda.featured
                          ? 'border-amber-400 dark:border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                          : 'bg-white dark:bg-surface border-slate-100 dark:border-border text-text-primary shadow-subtle'
                    }`}>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black truncate block">{agenda.title}</span>
                        <div className="flex items-center gap-1.5 mt-1 text-[9.5px] text-text-muted font-bold">
                          {agenda.startTime && <span>⏰ {agenda.startTime} - {agenda.endTime}</span>}
                          {agenda.category && <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-surface-alt border border-solid border-border">{agenda.category}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleComplete(agenda.id)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border-none rounded-lg text-[10px] font-black cursor-pointer"
                        >
                          {agenda.completed ? 'Undo' : 'Done'}
                        </button>
                        <button
                          onClick={() => { setEditingTask(agenda); setIsAddModalOpen(true); }}
                          className="p-1 text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer"
                        >
                          <IconPencil size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN: Detailed Selected Date Overview Panel ── */}
      <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-border/85 bg-white dark:bg-surface/30 p-6 flex flex-col gap-6 shrink-0 text-left">
        
        {/* Selected date header */}
        <div className="flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-black text-text-primary tracking-tight">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>
          
          {/* Progress bar */}
          <div className="flex flex-col gap-1.5 mt-1 select-none">
            <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase">
              <span>Day Completion</span>
              <span>{Math.round(plansStats.ratio * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-border/60 rounded-full overflow-hidden w-full">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${plansStats.ratio * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-border/60 w-full" />

        {/* Timeline Events / Plans List */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Schedule</span>
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-0.5">
            {selectedDayEvents.length === 0 ? (
              <p className="text-xs text-text-muted italic py-4 text-center">No events scheduled today.</p>
            ) : (
              selectedDayEvents.map((item, index) => {
                const borderClass = index % 3 === 0 ? 'border-l-blue-500' :
                                    index % 3 === 1 ? 'border-l-orange-500' : 'border-l-indigo-500';
                return (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-xl border border-solid border-slate-100 dark:border-border bg-white dark:bg-surface border-l-4 ${borderClass} flex items-center justify-between gap-3 text-left select-none ${
                      item.featured ? 'border-solid border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)] bg-amber-500/5' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-[12.5px] font-extrabold truncate ${item.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          {item.title}
                        </p>
                        {item.featured && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-550 text-white text-[7px] font-black shrink-0">👑 Focus</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] text-text-muted font-bold mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <IconClock size={10} /> {item.startTime} - {item.endTime}
                        </span>
                        {item.location && (
                          <span className="flex items-center gap-0.5 text-indigo-650 dark:text-indigo-400">
                            <IconMapPin size={10} /> {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className="bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1.5 rounded-xl border-none cursor-pointer transition-colors active:scale-95"
                      >
                        {item.completed ? 'Undo' : 'Done'}
                      </button>
                      <button 
                        onClick={() => { setEditingTask(item); setIsAddModalOpen(true); }}
                        className="p-1 rounded bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer active:scale-90"
                      >
                        <IconPencil size={12} />
                      </button>
                    </div>
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
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-0.5">
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-text-muted italic py-1 text-center">No tasks for today.</p>
            ) : (
              selectedDayTasks.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-2.5 rounded-xl border border-solid border-slate-100 dark:border-border bg-white dark:bg-surface/40 flex items-center justify-between group transition-all select-none ${
                    item.featured ? 'border-amber-300 bg-amber-500/5' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all focus:outline-none bg-transparent cursor-pointer ${
                        item.completed 
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-350 dark:border-border hover:border-indigo-600'
                      }`}
                    >
                      {item.completed && <IconCheck size={11} strokeWidth={3} />}
                    </button>
                    <span className={`truncate text-xs font-bold ${item.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {item.title}
                    </span>
                    {item.featured && <span className="text-[7px] font-black text-amber-600 uppercase shrink-0">👑 Focus</span>}
                  </div>
                  
                  <button 
                    onClick={() => { setEditingTask(item); setIsAddModalOpen(true); }}
                    className="p-1 rounded bg-transparent border-none text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer active:scale-90"
                  >
                    <IconPencil size={12} />
                  </button>
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
                      progress={completed ? 1 : 0}
                      size={44}
                      strokeWidth={4.5}
                      color="#5850EC"
                      style="solid"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black">
                      {completed ? '1/1' : '0/1'}
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

        {/* Add Plan Button at bottom */}
        <Button 
          variant="primary"
          onClick={() => {
            setEditingTask(null);
            setIsAddModalOpen(true);
          }}
          className="w-full mt-auto flex items-center justify-center gap-1.5"
        >
          <IconPlus size={15} /> Add Plan
        </Button>
      </div>

      {/* Modal wrapper */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Plan' : 'Create Plan'}
      >
        <PlannerSidebar 
          selectedDate={selectedDate}
          taskToEdit={editingTask || undefined}
          onAddPlan={(taskData) => {
            if (editingTask) {
              handleUpdatePlan(editingTask.id, taskData);
            } else {
              handleCreatePlan(taskData);
            }
            setIsAddModalOpen(false);
            setEditingTask(null);
          }}
          onUpdatePlan={editingTask ? (id, updates) => handleUpdatePlan(id, updates) : undefined}
          onDeletePlan={editingTask ? () => {
            handleDeletePlan(editingTask.id);
            setIsAddModalOpen(false);
            setEditingTask(null);
          } : undefined}
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTask(null);
          }}
        />
      </Modal>

    </div>
  );
}
