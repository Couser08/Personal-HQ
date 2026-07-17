import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { CustomSelect } from './CustomSelect';
import { TagInput } from './TagInput';
import { IconX, IconTrash } from '@tabler/icons-react';
import type { SubTask } from '../../store/useAppStore';

export function TodoTaskModal() {
  const { 
    todoTaskModal, 
    closeTodoTaskModal, 
    updateTodoTask, 
    todoProjects 
  } = useAppStore(useShallow(state => ({
    todoTaskModal: state.todoTaskModal,
    closeTodoTaskModal: state.closeTodoTaskModal,
    updateTodoTask: state.updateTodoTask,
    todoProjects: state.todoProjects,
  })));
  
  const { isOpen, task } = todoTaskModal;

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string>('none');
  const [priority, setPriority] = useState<string>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setProjectId(task.projectId || 'none');
      setPriority(task.priority || 'none');
      setTags(task.tags || []);
      
      // format due date to YYYY-MM-DD for input
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }

      setStartTime(task.startTime || '');
      setEndTime(task.endTime || '');
      setSubtasks(task.subtasks || []);
    }
  }, [isOpen, task]);

  const handleSave = () => {
    if (!task) return;
    const trimmed = title.trim();
    if (!trimmed) return;

    updateTodoTask(task.id, {
      title: trimmed,
      projectId: projectId === 'none' ? null : projectId,
      priority: priority as any,
      tags,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      startTime: startTime || null,
      endTime: endTime || null,
      subtasks,
    });
    
    closeTodoTaskModal();
  };

  const projectOptions = [
    { value: 'none', label: 'No Project' },
    ...todoProjects.map(p => ({ value: p.id, label: p.name }))
  ];

  const priorityOptions = [
    { value: 'none', label: 'No Priority' },
    { value: 'low', label: '🔵 Low' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'high', label: '🔴 High' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="task-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
          onClick={closeTodoTaskModal}
        >
          <motion.div
            key="task-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-xl p-8 shadow-high flex flex-col gap-5 custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] font-black text-text-primary tracking-tight m-0">
                Edit Task
              </h3>
              <button
                onClick={closeTodoTaskModal}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-surface-alt border border-border-alt flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Task Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-title" className="text-xs font-semibold uppercase tracking-wider text-text-secondary pl-0.5">Task Title</label>
              <input
                id="task-title"
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-surface-alt border border-border-alt rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[42px]"
              />
            </div>

            {/* Project (CustomSelect) */}
            <CustomSelect
              label="Associated Project"
              value={projectId}
              onChange={setProjectId}
              options={projectOptions}
            />

            {/* Priority (CustomSelect) */}
            <CustomSelect
              label="Priority Level"
              value={priority}
              onChange={setPriority}
              options={priorityOptions}
            />

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary pl-0.5">Tags (Press Enter)</label>
              <TagInput tags={tags} onChange={setTags} placeholder="Add labels..." />
            </div>

            {/* Subtasks Editor */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary pl-0.5">Subtasks</label>
              
              {subtasks.length > 0 && (
                <div className="flex flex-col gap-2.5 bg-surface-alt/40 p-4 rounded-[20px] border border-border/40 max-h-48 overflow-y-auto custom-scrollbar">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={(e) => {
                          setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: e.target.checked } : s));
                        }}
                        aria-label="Mark subtask as completed"
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-primary/45"
                      />
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, title: e.target.value } : s));
                        }}
                        aria-label="Subtask title"
                        className="flex-1 bg-transparent border-none text-xs text-text-primary outline-none focus:underline"
                        placeholder="Subtask name..."
                      />
                      <button
                        type="button"
                        onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                        aria-label={`Delete subtask: ${st.title || 'unnamed'}`}
                        className="p-1 hover:bg-rose-500/10 text-text-muted hover:text-rose-500 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500/40"
                      >
                        <IconTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  id="new-subtask-input"
                  placeholder="Add new subtask..."
                  aria-label="Add new subtask name"
                  className="flex-1 bg-surface border border-border/30 text-xs px-3 py-1.5 rounded-xl outline-none focus:border-primary/50 text-text-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setSubtasks([...subtasks, { id: crypto.randomUUID(), title: val, completed: false }]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('new-subtask-input') as HTMLInputElement;
                    if (input) {
                      const val = input.value.trim();
                      if (val) {
                        setSubtasks([...subtasks, { id: crypto.randomUUID(), title: val, completed: false }]);
                        input.value = '';
                      }
                    }
                  }}
                  className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/45"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Due Date & Times */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-[1.2] flex flex-col gap-1.5">
                <label htmlFor="task-due-date" className="text-xs font-semibold uppercase tracking-wider text-text-secondary pl-0.5">Due Date</label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-surface-alt border border-border-alt rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[42px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label htmlFor="task-start-time" className="text-xs font-semibold uppercase tracking-wider text-text-secondary pl-0.5">Start Time</label>
                <input
                  id="task-start-time"
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-surface-alt border border-border-alt rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[42px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label htmlFor="task-end-time" className="text-xs font-semibold uppercase tracking-wider text-text-secondary pl-0.5">End Time</label>
                <input
                  id="task-end-time"
                  type="text"
                  placeholder="e.g. 11:30 AM"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-surface-alt border border-border-alt rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[42px]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-2.5 border-t border-border">
              <button
                type="button"
                onClick={closeTodoTaskModal}
                className="px-5 py-2.5 rounded-full border-none bg-surface-alt text-text-secondary font-bold text-sm cursor-pointer hover:bg-surface-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className={`px-5 py-2.5 rounded-full border-none font-bold text-sm flex items-center justify-center transition-all duration-200 ${
                  title.trim()
                    ? 'bg-primary hover:bg-primary-muted text-white cursor-pointer hover:brightness-105 active:scale-98 shadow-sm shadow-primary/15'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-50'
                }`}
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
