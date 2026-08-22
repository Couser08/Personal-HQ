import React from 'react';
import { IconPencil } from '@tabler/icons-react';
import type { TodoTask } from '../../../../store/types';

interface AgendaListTabProps {
  sortedAgendaItems: TodoTask[];
  handleToggleComplete: (id: string) => void;
  setEditingTask: (task: TodoTask | null) => void;
  setIsAddModalOpen: (open: boolean) => void;
}

export const AgendaListTab: React.FC<AgendaListTabProps> = ({
  sortedAgendaItems,
  handleToggleComplete,
  setEditingTask,
  setIsAddModalOpen,
}) => {
  return (
    <div className="flex-grow flex flex-col min-h-[550px] bg-white dark:bg-surface/20 p-6 overflow-y-auto custom-scrollbar max-h-[580px]">
      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">
        Agenda List (Current Month)
      </span>
      {sortedAgendaItems.length === 0 ? (
        <p className="text-xs text-text-muted italic py-12 text-center">
          No upcoming agenda items scheduled.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedAgendaItems.map((agenda) => (
            <div key={agenda.id} className="flex gap-4 select-none">
              <div className="w-20 shrink-0 text-right pt-1">
                <span className="text-xs font-black text-text-primary block">
                  {new Date(agenda.dueDate!).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-[9px] text-text-muted font-bold block uppercase mt-0.5">
                  {new Date(agenda.dueDate!).toLocaleDateString('default', { weekday: 'short' })}
                </span>
              </div>
              <div
                className={`flex-1 p-4 rounded-2xl border border-solid flex items-center justify-between gap-3 text-left ${
                  agenda.completed
                    ? 'bg-slate-100 dark:bg-surface-alt border-slate-200 dark:border-border text-text-muted line-through'
                    : agenda.featured
                    ? 'border-amber-400 dark:border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                    : 'bg-white dark:bg-surface border-slate-100 dark:border-border text-text-primary shadow-subtle'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black truncate block">{agenda.title}</span>
                  <div className="flex items-center gap-1.5 mt-1 text-[9.5px] text-text-muted font-bold">
                    {agenda.startTime && <span>⏰ {agenda.startTime} - {agenda.endTime}</span>}
                    {agenda.category && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-surface-alt border border-solid border-border">
                        {agenda.category}
                      </span>
                    )}
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
                    onClick={() => {
                      setEditingTask(agenda);
                      setIsAddModalOpen(true);
                    }}
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
  );
};
