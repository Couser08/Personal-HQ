import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const PROJECT_COLORS = ['#f43f5e', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4'];

export function TodoProjectModal() {
  const { todoProjectModal, closeTodoProjectModal, addTodoProject } = useAppStore();
  const { isOpen } = todoProjectModal;

  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setColor(PROJECT_COLORS[0]);
    }
  }, [isOpen]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addTodoProject({ id: crypto.randomUUID(), name: trimmed, color });
    closeTodoProjectModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="project-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={closeTodoProjectModal}
        >
          <motion.div
            key="project-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-border)',
              borderRadius: '28px',
              padding: '32px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
              New Project
            </h3>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Project Name</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Design, Homework"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-border)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>Color Label</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: c, border: 'none', cursor: 'pointer',
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '3px',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px', borderTop: '1px solid var(--border-border)' }}>
              <button
                onClick={closeTodoProjectModal}
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
                onClick={handleCreate}
                disabled={!name.trim()}
                style={{
                  padding: '10px 20px', borderRadius: '999px', border: 'none',
                  background: name.trim() ? '#f43f5e' : 'var(--bg-surface-alt)',
                  color: name.trim() ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '14px',
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
