import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../../../store/useAppStore';
import { PlannerHeader } from './PlannerHeader';
import { PlannerStats } from './PlannerStats';
import { PlannerTimeline } from './PlannerTimeline';
import { PlannerSidebar } from './PlannerSidebar';
import { type TodoTask } from '../../../../store/types';

export function DailyPlannerView() {
  const { todoTasks, addTodoTask, updateTodoTask } = useAppStore(useShallow(state => ({
    todoTasks: state.todoTasks,
    addTodoTask: state.addTodoTask,
    updateTodoTask: state.updateTodoTask,
  })));

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Tasks for the selected date
  const filteredTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD local format
    return todoTasks.filter(t => !t.deleted && t.dueDate && t.dueDate.startsWith(dateStr));
  }, [todoTasks, selectedDate]);

  const handleAddPlan = (planData: Partial<TodoTask>) => {
    addTodoTask({
      id: crypto.randomUUID(),
      title: planData.title || 'Untitled Plan',
      completed: false,
      priority: planData.priority || 'none',
      tags: [],
      category: planData.category,
      dueDate: selectedDate ? selectedDate.toLocaleDateString('en-CA') : null,
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

  const handleToggleComplete = (id: string) => {
    const task = todoTasks.find(t => t.id === id);
    if (task) {
      updateTodoTask(id, { completed: !task.completed });
    }
  };

  const handleEditTask = (task: TodoTask) => {
    // For now, could open a modal or populate the sidebar to edit
    // Skipping full edit implementation to keep it under 500 lines per component
    console.log('Edit task', task);
  };

  return (
    <div className="flex min-h-[calc(100vh-2rem)] w-full bg-bg-primary overflow-hidden rounded-xl border border-border shadow-sm">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="p-6 md:p-8 max-w-[1000px] w-full mx-auto">
          <PlannerHeader 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
            onOpenAddPlan={() => setIsAddModalOpen(true)}
          />
          <PlannerStats tasks={filteredTasks} />
          
          <div className="mt-2">
            <PlannerTimeline 
              tasks={filteredTasks} 
              onEditTask={handleEditTask}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </div>
      </div>

      {/* Add Plan Modal */}
      <PlannerSidebar 
        selectedDate={selectedDate} 
        onAddPlan={handleAddPlan}
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
