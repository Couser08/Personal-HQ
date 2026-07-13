import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { TodoSidebar } from './TodoSidebar';
import { TaskList } from './TaskList';

export default function TodoModule() {
  const addToast = useToastStore(s => s.addToast);
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
  const [newTaskPriority, setNewTaskPriority] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [newTaskProject] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [newTaskTagInput, setNewTaskTagInput] = useState('');
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [showSubtasksDropdown, setShowSubtasksDropdown] = useState(false);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      addToast('Required Field Missing', 'Please enter a task title.', 'warning');
      return;
    }

    let finalStartTime = taskStartTime;
    let finalEndTime = taskEndTime;

    // Auto-parse time fields if submit is fired while time picker is still open
    if (showTimePicker) {
      const fh = parseInt(fromHour) || 10;
      const fm = parseInt(fromMin) || 0;
      const th = parseInt(toHour) || 10;
      const tm = parseInt(toMin) || 30;
      finalStartTime = `${fh}:${fm.toString().padStart(2, '0')} ${fromAmPm}`;
      finalEndTime = `${th}:${tm.toString().padStart(2, '0')} ${toAmPm}`;
    }

    if (!selectedDate) {
      addToast('Required Field Missing', 'Please select a due date for the task.', 'warning');
      return;
    }

    if (!finalStartTime || !finalEndTime) {
      addToast('Required Field Missing', 'Please select both start and end times for the task.', 'warning');
      return;
    }

    if (newTaskPriority === 'none') {
      addToast('Required Field Missing', 'Please select a priority (Low, Medium, or High).', 'warning');
      return;
    }

    addTodoTask({
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      projectId: newTaskProject,
      priority: newTaskPriority,
      tags: newTaskTags,
      subtasks: newTaskSubtasks,
      completed: false,
      dueDate: selectedDate ? selectedDate.toISOString() : null,
      startTime: finalStartTime || null,
      endTime: finalEndTime || null,
      createdAt: new Date().toISOString(),
    });

    setNewTaskTitle('');
    setNewTaskPriority('none');
    setSelectedDate(new Date());
    setNewTaskTags([]);
    setNewTaskSubtasks([]);
    setTaskStartTime('');
    setTaskEndTime('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowPriorityDropdown(false);
    setShowTagsDropdown(false);
    setShowSubtasksDropdown(false);
  };

  const isToday = (dateStr: string | null) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const handleToggleTask = (id: string) => {
    const t = todoTasks.find(x => x.id === id);
    if (!t) return;
    if (!t.completed) {
      setCompletingIds(prev => [...prev, id]);
      setTimeout(() => {
        updateTodoTask(id, { completed: true });
        setCompletingIds(prev => prev.filter(x => x !== id));
        
        // Check if all today's tasks are completed
        const todayTasks = todoTasks.filter(task => !task.deleted && isToday(task.dueDate));
        const uncompletedTodayTasks = todayTasks.filter(task => !task.completed && task.id !== id);

        if (todayTasks.length > 0 && uncompletedTodayTasks.length === 0) {
          // Trigger premium wavy effect only on full daily completion
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { detail: { type: 'todo' } }));
          }
        }
      }, 600);
    } else {
      updateTodoTask(id, { completed: false });
    }
  };

  return (
    <div className="flex h-full bg-bg-primary text-text-primary rounded-xl overflow-hidden shadow-sm border border-border relative">
      <TodoSidebar
        activeList={activeList}
        setActiveList={setActiveList}
        todoTasks={todoTasks}
        todoProjects={todoProjects}
        deleteTodoProject={deleteTodoProject}
        openTodoProjectModal={openTodoProjectModal}
        tickStyle={tickStyle}
        setTickStyle={setTickStyle}
        strikeStyle={strikeStyle}
        setStrikeStyle={setStrikeStyle}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <TaskList
        todoTasks={todoTasks}
        todoProjects={todoProjects}
        activeList={activeList}
        setActiveList={setActiveList}
        search={search}
        setSearch={setSearch}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        newTaskPriority={newTaskPriority}
        setNewTaskPriority={setNewTaskPriority}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        calendarMonth={calendarMonth}
        setCalendarMonth={setCalendarMonth}
        calendarYear={calendarYear}
        setCalendarYear={setCalendarYear}
        showPriorityDropdown={showPriorityDropdown}
        setShowPriorityDropdown={setShowPriorityDropdown}
        showTagsDropdown={showTagsDropdown}
        setShowTagsDropdown={setShowTagsDropdown}
        newTaskTagInput={newTaskTagInput}
        setNewTaskTagInput={setNewTaskTagInput}
        newTaskTags={newTaskTags}
        setNewTaskTags={setNewTaskTags}
        newTaskSubtasks={newTaskSubtasks}
        setNewTaskSubtasks={setNewTaskSubtasks}
        showSubtasksDropdown={showSubtasksDropdown}
        setShowSubtasksDropdown={setShowSubtasksDropdown}
        completingIds={completingIds}
        setCompletingIds={setCompletingIds}
        showTimePicker={showTimePicker}
        setShowTimePicker={setShowTimePicker}
        taskStartTime={taskStartTime}
        setTaskStartTime={setTaskStartTime}
        taskEndTime={taskEndTime}
        setTaskEndTime={setTaskEndTime}
        fromHour={fromHour}
        setFromHour={setFromHour}
        fromMin={fromMin}
        setFromMin={setFromMin}
        fromAmPm={fromAmPm}
        setFromAmPm={setFromAmPm}
        toHour={toHour}
        setToHour={setToHour}
        toMin={toMin}
        setToMin={setToMin}
        toAmPm={toAmPm}
        setToAmPm={setToAmPm}
        todoView={todoView}
        setTodoView={setTodoView}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        handleAddTask={handleAddTask}
        handleToggleTask={handleToggleTask}
        restoreTodoTask={restoreTodoTask}
        deleteTodoTask={deleteTodoTask}
        emptyTodoTrash={emptyTodoTrash}
        openTodoTaskModal={openTodoTaskModal}
        tickStyle={tickStyle}
        strikeStyle={strikeStyle}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </div>
  );
}
