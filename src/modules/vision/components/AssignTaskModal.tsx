import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  IconSearch,
  IconCheck,
  IconPlus,
  IconCalendar,
  IconFlag,
} from '@tabler/icons-react';
import { Modal } from '../../../components/ui/Modal';
import { useAppStore } from '../../../store/useAppStore';
import type { TodoTask, Vision } from '../../../store/types';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  vision: Vision | null;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  onClose,
  vision,
}) => {
  const todoTasks = useAppStore((s) => s.todoTasks);
  const assignTaskToVision = useAppStore((s) => s.assignTaskToVision);
  const unassignTaskFromVision = useAppStore((s) => s.unassignTaskFromVision);
  const addTodoTask = useAppStore((s) => s.addTodoTask);

  const [searchQuery, setSearchQuery] = useState('');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickPriority] = useState<
    'none' | 'low' | 'medium' | 'high' | 'urgent'
  >('medium');

  const linkedTaskIds = useMemo(() => {
    return new Set(vision?.linkedTaskIds || []);
  }, [vision?.linkedTaskIds]);

  const activeTodoTasks = useMemo(() => {
    return todoTasks.filter((t) => !t.deleted);
  }, [todoTasks]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return activeTodoTasks;
    const q = searchQuery.toLowerCase();
    return activeTodoTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }, [activeTodoTasks, searchQuery]);

  if (!vision) return null;

  const handleToggleAssign = async (taskId: string) => {
    if (linkedTaskIds.has(taskId)) {
      await unassignTaskFromVision(vision.id, taskId);
    } else {
      await assignTaskToVision(vision.id, taskId);
    }
  };

  const handleCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const newTaskId = crypto.randomUUID();
    const newTask: TodoTask = {
      id: newTaskId,
      title: quickTaskTitle.trim(),
      completed: false,
      priority: quickPriority,
      dueDate: vision.targetDate ? `${vision.targetDate}-01` : null,
      projectId: null,
      tags: ['vision', vision.category.toLowerCase()],
      createdAt: new Date().toISOString(),
      description: `Linked to Vision: ${vision.title}`,
    };

    await addTodoTask(newTask);
    await assignTaskToVision(vision.id, newTaskId);
    setQuickTaskTitle('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Tasks · ${vision.title}`}
      maxWidthClassName="max-w-xl"
    >
      <div className="flex flex-col gap-5 pt-2">
        {/* Quick Add Section */}
        <form
          onSubmit={handleCreateAndAssign}
          className="p-3.5 rounded-[var(--radius-input)] bg-surface-alt border border-border flex flex-col gap-2.5"
        >
          <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">
            Create & Link New Task
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              placeholder="e.g. Complete chapter 1 & practice mock..."
              className="flex-1 px-3 py-2 text-[14px] font-semibold bg-surface border border-border-alt rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!quickTaskTitle.trim()}
              className="btn btn-primary btn-sm px-4 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <IconPlus size={16} />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Search Existing Tasks */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">
              Link Existing Tasks from Todo ({linkedTaskIds.size} linked)
            </span>
          </div>

          <div className="relative">
            <IconSearch
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or tag..."
              className="w-full pl-9.5 pr-4 py-2 text-[13px] bg-surface-alt border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-medium"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2 custom-scrollbar pr-1">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-text-tertiary text-[13px] border border-dashed border-border rounded-xl">
              No matching tasks found in your Todo list.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isLinked = linkedTaskIds.has(task.id);
              return (
                <motion.div
                  key={task.id}
                  layout
                  onClick={() => handleToggleAssign(task.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isLinked
                      ? 'bg-primary/10 border-primary/40 text-text-primary shadow-sm'
                      : 'bg-surface border-border-hairline hover:border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                        isLinked
                          ? 'bg-primary border-primary text-text-on-accent'
                          : 'border-border-alt bg-surface-alt'
                      }`}
                    >
                      {isLinked && <IconCheck size={13} strokeWidth={3} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-[13.5px] font-bold truncate ${
                          task.completed ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <IconCalendar size={12} />
                            {task.dueDate}
                          </span>
                        )}
                        {task.priority && task.priority !== 'none' && (
                          <span className="flex items-center gap-0.5 capitalize">
                            <IconFlag size={12} />
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isLinked
                        ? 'bg-primary text-text-on-accent'
                        : 'bg-surface-alt text-text-tertiary'
                    }`}
                  >
                    {isLinked ? 'Linked' : 'Attach'}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button onClick={onClose} className="btn btn-primary btn-md px-6">
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
