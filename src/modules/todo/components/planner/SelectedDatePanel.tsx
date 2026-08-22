import React from 'react';
import {
  IconPlus,
  IconCheck,
  IconMapPin,
  IconClock,
  IconPencil,
} from '@tabler/icons-react';
import { ProgressRing } from '../../../../components/ui/ProgressRing';
import { Button } from '../../../../components/ui/Button';
import type { TodoTask, Habit, Countdown } from '../../../../store/types';

interface SelectedDatePanelProps {
  selectedDate: Date;
  plansStats: { total: number; completed: number; ratio: number };
  selectedDayEvents: TodoTask[];
  selectedDayTasks: TodoTask[];
  selectedDayCountdowns: Countdown[];
  selectedDayHabits: { habit: Habit; completed: boolean }[];
  handleToggleComplete: (id: string) => void;
  setEditingTask: (task: TodoTask | null) => void;
  setIsAddModalOpen: (open: boolean) => void;
}

export const SelectedDatePanel: React.FC<SelectedDatePanelProps> = ({
  selectedDate,
  plansStats,
  selectedDayEvents,
  selectedDayTasks,
  selectedDayCountdowns,
  selectedDayHabits,
  handleToggleComplete,
  setEditingTask,
  setIsAddModalOpen,
}) => {
  return (
    <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-border/85 bg-white dark:bg-surface/30 p-6 flex flex-col gap-6 shrink-0 text-left">
      {/* Selected date header */}
      <div className="flex flex-col gap-2 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-black text-text-primary tracking-tight">
            {selectedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5 mt-1 select-none">
          <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase">
            <span>Day Completion</span>
            <span>{Math.round(plansStats.ratio * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-border/60 rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${plansStats.ratio * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-border/60 w-full" />

      {/* Timeline Events / Plans List */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Schedule</span>
        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-0.5">
          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-text-muted italic py-4 text-center">No events scheduled today.</p>
          ) : (
            selectedDayEvents.map((item, index) => {
              const borderClass =
                index % 3 === 0
                  ? 'border-l-blue-500'
                  : index % 3 === 1
                  ? 'border-l-orange-500'
                  : 'border-l-indigo-500';
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border border-solid border-slate-100 dark:border-border bg-white dark:bg-surface border-l-4 ${borderClass} flex items-center justify-between gap-3 text-left select-none ${
                    item.featured
                      ? 'border-solid border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)] bg-amber-500/5'
                      : ''
                  }`}
                >
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-[12.5px] font-extrabold truncate ${
                          item.completed ? 'line-through text-text-muted' : 'text-text-primary'
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.featured && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-550 text-white text-[7px] font-black shrink-0">
                          👑 Focus
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-text-muted font-bold mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <IconClock size={10} /> {item.startTime} - {item.endTime}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-0.5 text-indigo-650 dark:text-indigo-400">
                          <IconMapPin size={10} /> {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className="bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1.5 rounded-xl border-none cursor-pointer transition-colors active:scale-95"
                    >
                      {item.completed ? 'Undo' : 'Done'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(item);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 rounded bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer active:scale-90"
                    >
                      <IconPencil size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tasks list checklist section */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tasks</span>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsAddModalOpen(true);
            }}
            className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 border-none bg-transparent hover:underline cursor-pointer"
          >
            + Add Task
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-0.5">
          {selectedDayTasks.length === 0 ? (
            <p className="text-xs text-text-muted italic py-1 text-center">No tasks for today.</p>
          ) : (
            selectedDayTasks.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border border-solid border-slate-100 dark:border-border bg-white dark:bg-surface/40 flex items-center justify-between group transition-all select-none ${
                  item.featured ? 'border-amber-300 bg-amber-500/5' : ''
                }`}
              >
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleComplete(item.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all focus:outline-none bg-transparent cursor-pointer ${
                      item.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-350 dark:border-border hover:border-indigo-600'
                    }`}
                  >
                    {item.completed && <IconCheck size={11} strokeWidth={3} />}
                  </button>
                  <span
                    className={`truncate text-xs font-bold ${
                      item.completed ? 'line-through text-text-muted' : 'text-text-primary'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.featured && (
                    <span className="text-[7px] font-black text-amber-600 uppercase shrink-0">👑 Focus</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setEditingTask(item);
                    setIsAddModalOpen(true);
                  }}
                  className="p-1 rounded bg-transparent border-none text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer active:scale-90"
                >
                  <IconPencil size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Countdowns list display */}
      {selectedDayCountdowns.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Countdowns &amp; Events
          </span>
          <div className="flex flex-col gap-2">
            {selectedDayCountdowns.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center gap-2.5 text-left text-xs font-bold text-rose-600 dark:text-rose-450"
              >
                <span className="text-sm">{c.emoji}</span>
                <span>{c.label} Target Date!</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit tracker circle dials */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Habit Tracker
          </span>
          <button
            onClick={() => {
              const store = (window as any).useAppStore || null;
              if (store) store.getState().setActiveModule('habits');
            }}
            className="text-[10.5px] font-black text-indigo-600 dark:text-indigo-400 border-none bg-transparent hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {selectedDayHabits.length === 0 ? (
            <p className="col-span-4 text-xs text-text-muted italic py-1 text-center">No habits found.</p>
          ) : (
            selectedDayHabits.slice(0, 4).map(({ habit, completed }) => (
              <div key={habit.id} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <ProgressRing
                    progress={completed ? 1 : 0}
                    size={44}
                    strokeWidth={4.5}
                    color="#5850EC"
                    style="solid"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black">
                    {completed ? '1/1' : '0/1'}
                  </div>
                </div>
                <span
                  className="text-[9px] font-black text-text-muted truncate max-w-full text-center"
                  title={habit.name}
                >
                  {habit.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Plan Button at bottom */}
      <Button
        variant="primary"
        onClick={() => {
          setEditingTask(null);
          setIsAddModalOpen(true);
        }}
        className="w-full mt-auto flex items-center justify-center gap-1.5"
      >
        <IconPlus size={15} /> Add Plan
      </Button>
    </div>
  );
};
