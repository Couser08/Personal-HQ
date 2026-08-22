import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../../../store/useAppStore';
import { PlannerSidebar } from './PlannerSidebar';
import { type TodoTask } from '../../../../store/types';
import { Modal } from '../../../../components/ui/Modal';
import { CalendarNavBar } from './CalendarNavBar';
import { MonthGridTab } from './MonthGridTab';
import { WeekGridTab } from './WeekGridTab';
import { DayTimelineTab } from './DayTimelineTab';
import { AgendaListTab } from './AgendaListTab';
import { SelectedDatePanel } from './SelectedDatePanel';

export function MonthlyCalendarView() {
  const {
    todoTasks,
    habits,
    countdowns,
    addTodoTask,
    updateTodoTask,
    deleteTodoTask,
  } = useAppStore(
    useShallow((state) => ({
      todoTasks: state.todoTasks,
      habits: state.habits,
      countdowns: state.countdowns || [],
      addTodoTask: state.addTodoTask,
      updateTodoTask: state.updateTodoTask,
      deleteTodoTask: state.deleteTodoTask,
    })),
  );

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewTab, setActiveViewTab] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);

  const filterCategory = 'All';
  const selectedDateStr = useMemo(() => selectedDate.toLocaleDateString('en-CA'), [selectedDate]);

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

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toLocaleDateString('en-CA'),
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateStr: d.toLocaleDateString('en-CA'),
      });
    }

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

  const getCellEvents = (dateStr: string) => {
    const dayTasks = todoTasks.filter((t) => !t.deleted && t.dueDate?.startsWith(dateStr));
    const dayCountdowns = countdowns.filter((c) => c.targetDate?.startsWith(dateStr));
    const dayHabits = habits.filter((h) => h.completedDates.includes(dateStr));

    return {
      tasks: dayTasks,
      countdowns: dayCountdowns,
      habits: dayHabits,
    };
  };

  const selectedDayItems = useMemo(() => {
    const tasks = todoTasks.filter((t) => !t.deleted && t.dueDate?.startsWith(selectedDateStr));

    return tasks.filter((task) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = filterCategory === 'All' || task.category === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [todoTasks, selectedDateStr, searchQuery, filterCategory]);

  const selectedDayEvents = useMemo(() => {
    return selectedDayItems.filter((item) => item.startTime);
  }, [selectedDayItems]);

  const selectedDayTasks = useMemo(() => {
    return selectedDayItems.filter((item) => !item.startTime);
  }, [selectedDayItems]);

  const selectedDayCountdowns = useMemo(() => {
    return countdowns.filter((c) => c.targetDate?.startsWith(selectedDateStr));
  }, [countdowns, selectedDateStr]);

  const selectedDayHabits = useMemo(() => {
    return habits.map((h) => ({
      habit: h,
      completed: h.completedDates.includes(selectedDateStr),
    }));
  }, [habits, selectedDateStr]);

  const plansStats = useMemo(() => {
    const total = selectedDayItems.length;
    const completed = selectedDayItems.filter((t) => t.completed).length;
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
    const task = todoTasks.find((t) => t.id === id);
    if (task) {
      updateTodoTask(id, { completed: !task.completed });
    }
  };

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

  const sortedAgendaItems = useMemo(() => {
    const currentYear = currentMonth.getFullYear();
    const currentM = currentMonth.getMonth();
    return todoTasks
      .filter(
        (t) =>
          !t.deleted &&
          t.dueDate &&
          new Date(t.dueDate).getFullYear() === currentYear &&
          new Date(t.dueDate).getMonth() === currentM,
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [todoTasks, currentMonth]);

  return (
    <div className="@container/calendar flex flex-col lg:flex-row min-h-[calc(100dvh-5rem)] w-full bg-[#f8fafc] dark:bg-bg-primary rounded-3xl sm:rounded-[28px] border border-slate-100 dark:border-border shadow-xs overflow-hidden select-none font-sans text-left">
      {/* Main Interactive Work Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface/10">
        <CalendarNavBar
          currentMonth={currentMonth}
          activeViewTab={activeViewTab}
          setActiveViewTab={setActiveViewTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handlePrev={handlePrev}
          handleToday={handleToday}
          handleNext={handleNext}
        />

        {activeViewTab === 'month' && (
          <MonthGridTab
            calendarDays={calendarDays}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            getCellEvents={getCellEvents}
          />
        )}

        {activeViewTab === 'week' && (
          <WeekGridTab
            weekDays={weekDays}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            getCellEvents={getCellEvents}
          />
        )}

        {activeViewTab === 'day' && (
          <DayTimelineTab
            selectedDate={selectedDate}
            selectedDayEvents={selectedDayEvents}
            handleToggleComplete={handleToggleComplete}
            setEditingTask={setEditingTask}
            setIsAddModalOpen={setIsAddModalOpen}
          />
        )}

        {activeViewTab === 'agenda' && (
          <AgendaListTab
            sortedAgendaItems={sortedAgendaItems}
            handleToggleComplete={handleToggleComplete}
            setEditingTask={setEditingTask}
            setIsAddModalOpen={setIsAddModalOpen}
          />
        )}
      </div>

      {/* Detailed Selected Date Overview Panel */}
      <SelectedDatePanel
        selectedDate={selectedDate}
        plansStats={plansStats}
        selectedDayEvents={selectedDayEvents}
        selectedDayTasks={selectedDayTasks}
        selectedDayCountdowns={selectedDayCountdowns}
        selectedDayHabits={selectedDayHabits}
        handleToggleComplete={handleToggleComplete}
        setEditingTask={setEditingTask}
        setIsAddModalOpen={setIsAddModalOpen}
      />

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
          onDeletePlan={
            editingTask
              ? () => {
                  handleDeletePlan(editingTask.id);
                  setIsAddModalOpen(false);
                  setEditingTask(null);
                }
              : undefined
          }
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
