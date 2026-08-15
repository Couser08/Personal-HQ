import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPhoto,
  IconCalendar,
  IconPlus,
  IconCheck,
  IconTrash,
  IconExternalLink,
  IconDotsVertical,
  IconSparkles,
  IconGripVertical,
  IconLink,
} from '@tabler/icons-react';
import type { Vision, Habit, TodoTask } from '../../../store/types';
import { useAppStore } from '../../../store/useAppStore';

interface VisionCardWidgetProps {
  vision: Vision;
  habits?: Habit[];
  onOpenDetail: () => void;
  onOpenAssignTasks: () => void;
  onDelete: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const VisionCardWidget: React.FC<VisionCardWidgetProps> = ({
  vision,
  habits = [],
  onOpenDetail,
  onOpenAssignTasks,
  onDelete,
  isDragging = false,
  onDragStart,
}) => {
  const {
    updateVision,
    addVisionTask,
    toggleVisionTask,
    deleteVisionTask,
    todoTasks,
    updateTodoTask,
  } = useAppStore();

  const [newTaskInput, setNewTaskInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Linked Global Todo Tasks
  const linkedGlobalTasks = useMemo(() => {
    const linkedIds = new Set(vision.linkedTaskIds || []);
    return todoTasks.filter((t) => linkedIds.has(t.id) && !t.deleted);
  }, [vision.linkedTaskIds, todoTasks]);

  // Direct Vision Tasks
  const localTasks = vision.tasks || [];

  // Combined Task Metrics
  const totalTasksCount = localTasks.length + linkedGlobalTasks.length;
  const completedTasksCount =
    localTasks.filter((t) => t.completed).length +
    linkedGlobalTasks.filter((t) => t.completed).length;

  const taskProgressPercent =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : vision.progress;

  // Linked Habits
  const linkedHabits = habits.filter((h) =>
    vision.linkedHabitIds?.includes(h.id)
  );

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    await addVisionTask(vision.id, newTaskInput.trim());
    setNewTaskInput('');
    setIsAddingTask(false);
  };

  const handleToggleGlobalTask = async (task: TodoTask) => {
    await updateTodoTask(task.id, { completed: !task.completed });
  };

  // Status color mapping
  const statusColors = {
    'Not Started': 'bg-surface-alt text-text-tertiary border-border',
    'In Progress': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    'Achieved': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    'Paused': 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  }[vision.status] || 'bg-surface-alt text-text-secondary border-border';

  return (
    <div
      className={`relative w-[300px] xs:w-[330px] sm:w-[360px] rounded-[24px] bg-surface border border-border shadow-[var(--shadow-float)] transition-shadow duration-200 select-none group flex flex-col ${
        isDragging ? 'shadow-2xl ring-2 ring-primary/40 cursor-grabbing' : 'hover:shadow-[var(--shadow-float-hover)]'
      }`}
      style={{
        transform: `rotate(${vision.rotation || 0}deg)`,
      }}
    >
      {/* ── Realistic Wooden Clothespin / Metal Clip at top center ── */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
        {/* Wooden Clothespin Visual */}
        <div className="w-5 h-8 bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800 rounded-sm shadow-md flex flex-col items-center justify-between border border-amber-900/40 relative">
          {/* Metal Spring Wire in middle */}
          <div className="w-6 h-1.5 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 rounded-full shadow-inner -my-0.5 border border-zinc-500/50" />
          {/* Wood grain highlight */}
          <div className="w-0.5 h-full bg-amber-500/20 absolute left-1" />
        </div>
      </div>

      {/* ── Card Header: Drag Handle & Quick Actions ── */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-md"
          title="Drag to reposition card on canvas"
        >
          <IconGripVertical size={16} />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-tertiary">
            {vision.category}
          </span>
        </div>

        {/* Quick Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <IconDotsVertical size={16} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-7 z-40 w-44 p-1 rounded-xl bg-surface border border-border shadow-xl flex flex-col gap-0.5 text-[12px] font-semibold text-text-primary"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenDetail();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors text-left cursor-pointer"
                >
                  <IconExternalLink size={14} /> Full Details
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenAssignTasks();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors text-left cursor-pointer"
                >
                  <IconLink size={14} /> Assign Tasks
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    updateVision(vision.id, {
                      status: vision.status === 'Achieved' ? 'In Progress' : 'Achieved',
                      progress: vision.status === 'Achieved' ? 50 : 100,
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors text-left cursor-pointer text-emerald-600 dark:text-emerald-400"
                >
                  <IconCheck size={14} />{' '}
                  {vision.status === 'Achieved' ? 'Mark In Progress' : 'Mark Achieved'}
                </button>
                <div className="h-px bg-border my-0.5" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-left cursor-pointer"
                >
                  <IconTrash size={14} /> Delete Vision
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Image Cover / Polaroid Frame ── */}
      <div className="relative mx-3.5 h-44 rounded-2xl overflow-hidden bg-surface-alt shrink-0 border border-border-hairline">
        {vision.imageUrl ? (
          <img
            src={vision.imageUrl}
            alt={vision.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-surface-alt to-surface gap-2 text-text-tertiary">
            <IconPhoto size={36} className="text-text-muted" />
            <span className="text-[11px] font-bold">Visual Anchor</span>
          </div>
        )}

        {/* Status Pill on top-right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {linkedHabits.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 shadow-sm backdrop-blur-md">
              ⚡ {linkedHabits.length} {linkedHabits.length === 1 ? 'Habit' : 'Habits'}
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm backdrop-blur-md ${statusColors}`}
          >
            {vision.status}
          </span>
        </div>

        {/* Target Date Pill on bottom-left */}
        {vision.targetDate && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md text-[11px] font-bold text-text-primary border border-border/50 flex items-center gap-1.5 shadow-sm">
            <IconCalendar size={13} className="text-primary" />
            <span>
              {new Date(vision.targetDate).toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body & Title ── */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3
            onClick={onOpenDetail}
            className="text-[16px] font-extrabold text-text-primary leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer"
          >
            {vision.title}
          </h3>
          {vision.whyText && (
            <p className="text-[12px] text-text-secondary mt-1 line-clamp-2 italic font-medium leading-relaxed">
              "{vision.whyText}"
            </p>
          )}
        </div>

        {/* Progress Bar Header */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-text-secondary">Progress</span>
            <span className="text-text-primary">
              {taskProgressPercent}% · {completedTasksCount}/{totalTasksCount} tasks
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-alt border border-border-hairline overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${taskProgressPercent}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        {/* ── IN-CARD TASK ASSIGNMENT WIDGET ── */}
        <div className="pt-2 border-t border-border-hairline flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              <IconSparkles size={13} className="text-primary" />
              <span>Assigned Tasks</span>
            </div>
            <button
              type="button"
              onClick={onOpenAssignTasks}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
            >
              <IconLink size={12} />
              <span>Manage</span>
            </button>
          </div>

          {/* Combined Task List (Local + Global linked) */}
          <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
            {totalTasksCount === 0 ? (
              <div className="py-2.5 text-center text-[12px] text-text-tertiary italic bg-surface-alt/50 rounded-xl border border-dashed border-border-hairline">
                No tasks assigned yet. Add one below!
              </div>
            ) : (
              <>
                {/* Local Tasks */}
                {localTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-surface-alt/60 hover:bg-surface-alt border border-border-hairline text-[12px] transition-colors group/item"
                  >
                    <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleVisionTask(vision.id, t.id)}
                        className="w-3.5 h-3.5 rounded border border-border accent-primary cursor-pointer shrink-0"
                      />
                      <span
                        className={`truncate font-medium ${
                          t.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                        }`}
                      >
                        {t.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteVisionTask(vision.id, t.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-text-tertiary hover:text-red-500 transition-opacity p-0.5 cursor-pointer"
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                ))}

                {/* Global Linked Tasks */}
                {linkedGlobalTasks.map((gt) => (
                  <div
                    key={gt.id}
                    className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 text-[12px] transition-colors"
                  >
                    <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gt.completed}
                        onChange={() => handleToggleGlobalTask(gt)}
                        className="w-3.5 h-3.5 rounded border border-border accent-primary cursor-pointer shrink-0"
                      />
                      <span
                        className={`truncate font-semibold ${
                          gt.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                        }`}
                      >
                        {gt.title}
                      </span>
                    </label>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary shrink-0">
                      Todo
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Quick-Add Task Input inside card */}
          {isAddingTask ? (
            <form onSubmit={handleCreateTask} className="flex gap-1.5 pt-1">
              <input
                autoFocus
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Task title..."
                className="flex-1 px-2.5 py-1 text-[12px] bg-surface-alt border border-border-focus rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newTaskInput.trim()}
                className="btn btn-primary btn-sm px-2.5 text-[11px] py-1 min-h-[28px] cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-2 py-1 text-[11px] text-text-tertiary hover:text-text-primary cursor-pointer"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingTask(true)}
              className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-dashed border-border text-[11px] font-bold text-text-secondary hover:text-text-primary hover:border-primary/50 hover:bg-surface-alt transition-all cursor-pointer"
            >
              <IconPlus size={13} />
              <span>Quick Add Task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
