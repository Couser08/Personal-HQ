import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { CustomSelect } from './CustomSelect';
import { TagInput } from './TagInput';
import { IconX } from '@tabler/icons-react';

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
  } = useAppStore();
  
  const { isOpen, task } = todoTaskModal;

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string>('none');
  const [priority, setPriority] = useState<string>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

            {/* Due Date & Times */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1.2 }}>
                <label style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start Time</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
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
                style={{
                  padding: '10px 20px', borderRadius: '999px', border: 'none',
                  background: title.trim() ? 'var(--primary)' : 'var(--bg-surface-alt)',
                  color: title.trim() ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '14px',
                  cursor: title.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
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
