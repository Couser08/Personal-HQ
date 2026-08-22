import React from 'react';
import { IconPencil } from '@tabler/icons-react';
import type { TodoTask } from '../../../../store/types';

interface DayTimelineTabProps {
  selectedDate: Date;
  selectedDayEvents: TodoTask[];
  handleToggleComplete: (id: string) => void;
  setEditingTask: (task: TodoTask | null) => void;
  setIsAddModalOpen: (open: boolean) => void;
}

export const DayTimelineTab: React.FC<DayTimelineTabProps> = ({
  selectedDate,
  selectedDayEvents,
  handleToggleComplete,
  setEditingTask,
  setIsAddModalOpen,
}) => {
  return (
    <div className="flex-grow flex flex-col min-h-[550px] bg-white dark:bg-surface/20 p-5 overflow-y-auto custom-scrollbar max-h-[580px]">
      <div className="flex items-center gap-3 border-b border-border/40 pb-3 mb-5 select-none">
        <span className="text-sm font-black text-text-primary">
          Daily Schedule:{' '}
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {[
          '8:00 AM',
          '9:00 AM',
          '10:00 AM',
          '11:00 AM',
          '12:00 PM',
          '1:00 PM',
          '2:00 PM',
          '3:00 PM',
          '4:00 PM',
          '5:00 PM',
          '6:00 PM',
          '7:00 PM',
          '8:00 PM',
          '9:00 PM',
        ].map((hour) => {
          const matchEvents = selectedDayEvents.filter((t) => {
            if (!t.startTime) return false;
            const tHour = t.startTime.split(':')[0];
            const tAmpm = t.startTime.match(/AM|PM/i)?.[0].toUpperCase();
            const hHour = hour.split(':')[0];
            const hAmpm = hour.match(/AM|PM/i)?.[0].toUpperCase();
            return parseInt(tHour) === parseInt(hHour) && tAmpm === hAmpm;
          });

          return (
            <div key={hour} className="flex gap-4 items-start select-none">
              <span className="text-[10px] font-black text-text-muted w-14 text-right pt-2.5 shrink-0 uppercase tracking-wider">
                {hour}
              </span>
              <div className="flex-grow p-4.5 rounded-2xl border border-dashed border-border bg-slate-50/20 dark:bg-surface/10 flex flex-col gap-2 min-h-[64px]">
                {matchEvents.length === 0 ? (
                  <span className="text-[10.5px] text-text-muted/40 italic font-medium my-auto pl-1">
                    No events scheduled
                  </span>
                ) : (
                  matchEvents.map((e) => (
                    <div
                      key={e.id}
                      className={`p-3.5 rounded-xl border border-solid flex items-center justify-between gap-3 text-left transition-all ${
                        e.completed
                          ? 'bg-slate-100 dark:bg-surface-alt border-slate-200 dark:border-border text-text-muted line-through'
                          : e.featured
                          ? 'border-amber-400 dark:border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400'
                      }`}
                    >
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <span className="text-xs font-black truncate">{e.title}</span>
                        {e.description && (
                          <span className="text-[10px] opacity-85 truncate">{e.description}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-lg">
                          {e.startTime} - {e.endTime}
                        </span>
                        <button
                          onClick={() => handleToggleComplete(e.id)}
                          className="px-2.5 py-1 text-[10px] font-black rounded-lg border border-solid hover:bg-white/10 cursor-pointer bg-transparent"
                        >
                          {e.completed ? 'Undo' : 'Done'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingTask(e);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1 rounded bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer active:scale-90"
                        >
                          <IconPencil size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
