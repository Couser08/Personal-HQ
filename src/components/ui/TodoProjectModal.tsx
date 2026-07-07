import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';

// Apple System Dynamic Palette Colors
const PROJECT_COLORS = ['#FF453A', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5AC8FA'];

export function TodoProjectModal() {
  const { todoProjectModal, closeTodoProjectModal, addTodoProject } = useAppStore(useShallow(state => ({
    todoProjectModal: state.todoProjectModal,
    closeTodoProjectModal: state.closeTodoProjectModal,
    addTodoProject: state.addTodoProject,
  })));
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

  const isFormValid = name.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
          {/* System Dimmer Overlay (Apple avoids heavy blurs inside explicit form interactions) */}
          <motion.div
            key="project-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={closeTodoProjectModal}
          />

          {/* Modal Container Sheet */}
          <motion.div
            key="project-modal-card"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[340px] bg-white dark:bg-zinc-900 
                       border border-zinc-200/60 dark:border-zinc-800
                       rounded-xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.15)] 
                       flex flex-col gap-5 z-10"
          >
            {/* Header: Crisp typography and sub-spacing */}
            <div className="flex flex-col">
              <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                New Project
              </h3>
            </div>

            {/* Input Row */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-tight pl-0.5">
                Project Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g., Design, Homework"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full bg-zinc-50 dark:bg-zinc-800/60 
                           border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg 
                           px-3 py-2 text-[13px] text-zinc-900 dark:text-zinc-100 
                           placeholder:text-zinc-400/80 focus:outline-none 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 
                           transition-all duration-150 font-normal"
              />
            </div>

            {/* Custom Color Matrix Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-tight pl-0.5">
                Color Label
              </label>
              <div className="flex items-center gap-2.5 py-1 pl-0.5">
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-all duration-200 ease-out relative cursor-pointer
                               ${color === c 
                                 ? 'scale-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_rgba(0,122,255,0.8)] dark:shadow-[0_0_0_2px_#18181b,0_0_0_4px_rgba(0,122,255,0.8)]' 
                                 : 'hover:scale-105 opacity-90'
                               }`}
                  />
                ))}
              </div>
            </div>

            {/* Apple Standardised Segmented Horizontal Buttons */}
            <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2">
              <button
                type="button"
                onClick={closeTodoProjectModal}
                className="w-full py-1.5 px-3 rounded-md text-[13px] font-medium 
                           bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 
                           dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/80 
                           transition-all active:scale-[0.98] cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleCreate}
                disabled={!isFormValid}
                style={{ backgroundColor: isFormValid ? color : undefined }}
                className={`w-full py-1.5 px-3 rounded-md text-[13px] font-semibold transition-all duration-200
                           ${isFormValid 
                             ? 'text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] active:scale-[0.98] cursor-pointer' 
                             : 'bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
                           }`}
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}