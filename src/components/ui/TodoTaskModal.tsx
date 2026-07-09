import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { CustomSelect } from './CustomSelect';
import { TagInput } from './TagInput';
import { IconX, IconTrash } from '@tabler/icons-react';
import type { SubTask } from '../../store/useAppStore';

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--bg-surface-alt)',
  border: '1px solid var(--border-border)',
  borderRadius: '14px',
  padding: '12px 16px',
  fontSize: '15px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-secondary)',
  display: 'block',
  marginBottom: '8px',
};

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
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}
          onClick={closeTodoTaskModal}
        >
          <motion.div
            key="task-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-border)',
              borderRadius: '32px',
              padding: '32px',
              boxShadow: '0 32px 96px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
                Edit Task
              </h3>
              <button
                onClick={closeTodoTaskModal}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-border)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Task Name */}
            <div>
              <label style={labelStyle}>Task Title</label>
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={inputStyle}
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
            <div>
              <label style={labelStyle}>Tags (Press Enter)</label>
              <TagInput tags={tags} onChange={setTags} placeholder="Add labels..." />
            </div>

            {/* Subtasks Editor */}
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>Subtasks</label>
              
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
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, title: e.target.value } : s));
                        }}
                        className="flex-1 bg-transparent border-none text-xs text-text-primary outline-none focus:underline"
                        placeholder="Subtask name..."
                      />
                      <button
                        type="button"
                        onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                        className="p-1 hover:bg-rose-500/10 text-text-muted hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
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
                  className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Due Date & Times */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-[1.2]">
                <label style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="flex-1">
                <label style={labelStyle}>Start Time</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="flex-1">
                <label style={labelStyle}>End Time</label>
                <input
                  type="text"
                  placeholder="e.g. 11:30 AM"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-border)' }}>
              <button
                onClick={closeTodoTaskModal}
                style={{
                  padding: '10px 20px', borderRadius: '999px', border: 'none',
                  background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className={`btn btn-md rounded-full px-6 font-bold transition-all duration-200 ${
                  title.trim()
                    ? 'btn-primary cursor-pointer hover:brightness-105 active:scale-98'
                    : 'bg-zinc-200/70 dark:bg-zinc-800/70 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-50'
                }`}
                style={{ fontFamily: 'inherit' }}
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
