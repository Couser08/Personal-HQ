import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { supabase } from '../../lib/supabase';
import { compressAndConvertToWebP } from '../../utils/imageOptimizer';
import type { Vision, Habit } from '../../store/types';
import {
  IconTarget,
  IconPlus,
  IconX,
  IconPhoto,
  IconTrash,
  IconCalendar,
  IconChevronLeft,
  IconLoader2,
  IconLayoutGrid,
  IconSparkles,
  IconLink,
  IconListCheck,
} from '@tabler/icons-react';
import { Modal } from '../../components/ui/Modal';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { VisionCanvas } from './components/VisionCanvas';
import { AssignTaskModal } from './components/AssignTaskModal';

const DEFAULT_CATEGORIES = [
  'Career',
  'Health',
  'Finance',
  'Travel',
  'Growth',
  'Relationships',
  'Other',
];

export default function VisionModule() {
  const visions = useAppStore((s) => s.visions);
  const habits = useAppStore((s) => s.habits);
  const todoTasks = useAppStore((s) => s.todoTasks);
  const { addVision, updateVision, deleteVision, showConfirm } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const [viewMode, setViewMode] = useState<'canvas' | 'grid'>('canvas');
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVision, setSelectedVision] = useState<Vision | null>(null);
  const [assignModalVision, setAssignModalVision] = useState<Vision | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Categories
  const categories = useMemo(() => {
    const cats = new Set(DEFAULT_CATEGORIES);
    visions.forEach((v) => cats.add(v.category));
    return ['All', ...Array.from(cats)];
  }, [visions]);

  // Filtered visions
  const filteredVisions = useMemo(() => {
    return visions.filter((v) => {
      const isCompleted = v.status === 'Achieved';
      if (activeTab === 'Active' && isCompleted) return false;
      if (activeTab === 'Completed' && !isCompleted) return false;
      if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
      return true;
    });
  }, [visions, activeTab, selectedCategory]);

  // Quick stats
  const achievedCount = visions.filter((v) => v.status === 'Achieved').length;
  const totalTasksAssigned = visions.reduce(
    (acc, v) => acc + (v.tasks?.length || 0) + (v.linkedTaskIds?.length || 0),
    0
  );

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-background text-text-primary">
      {/* ── TOP HEADER & FILTER BAR ── */}
      <div className="shrink-0 p-4 sm:p-6 pb-2 border-b border-border bg-surface/50 backdrop-blur-md z-20 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <IconTarget size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none flex items-center gap-2">
                <span>Vision Board</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Infinite Canvas
                </span>
              </h1>
              <p className="mt-1 text-[13px] text-text-secondary">
                {visions.length} Goals · {achievedCount} Achieved · {totalTasksAssigned} Tasks Assigned
              </p>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-surface-alt border border-border">
              <button
                type="button"
                onClick={() => setViewMode('canvas')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  viewMode === 'canvas'
                    ? 'bg-surface shadow-sm text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Infinite Rope Canvas view"
              >
                <IconSparkles size={14} className={viewMode === 'canvas' ? 'text-primary' : ''} />
                <span>Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-surface shadow-sm text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Structured Grid view"
              >
                <IconLayoutGrid size={14} />
                <span>Grid</span>
              </button>
            </div>

            {/* Active / Completed Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-surface-alt border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('Active')}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  activeTab === 'Active'
                    ? 'bg-surface shadow-sm text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Completed')}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  activeTab === 'Completed'
                    ? 'bg-surface shadow-sm text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Add Vision Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn btn-primary btn-sm px-4 flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <IconPlus size={16} />
              <span className="hidden sm:inline">Plant Vision</span>
            </button>
          </div>
        </div>

        {/* Categories Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-text-primary text-text-on-accent shadow-xs'
                  : 'bg-surface-alt text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT: CANVAS vs GRID vs DETAIL ── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedVision ? (
            <div className="h-full overflow-y-auto p-4 sm:p-8 custom-scrollbar">
              <VisionDetail
                vision={selectedVision}
                habits={habits}
                todoTasks={todoTasks}
                onBack={() => setSelectedVision(null)}
                onOpenAssign={() => setAssignModalVision(selectedVision)}
                onUpdate={(updates) => {
                  updateVision(selectedVision.id, updates);
                  setSelectedVision((prev) => (prev ? { ...prev, ...updates } : null));
                }}
                onDelete={() => {
                  showConfirm(
                    'Delete Vision',
                    'Are you sure you want to delete this vision?',
                    () => {
                      deleteVision(selectedVision.id);
                      setSelectedVision(null);
                    }
                  );
                }}
              />
            </div>
          ) : viewMode === 'canvas' ? (
            <VisionCanvas
              visions={filteredVisions}
              habits={habits}
              onOpenDetail={(v) => setSelectedVision(v)}
              onOpenAssignTasks={(v) => setAssignModalVision(v)}
              onDeleteVision={(id) => {
                showConfirm('Delete Vision', 'Delete this vision from your board?', () => {
                  deleteVision(id);
                });
              }}
              onOpenCreate={() => setIsCreateOpen(true)}
            />
          ) : (
            /* ── CLASSIC GRID VIEW ── */
            <div className="h-full overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="max-w-6xl mx-auto">
                {filteredVisions.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-surface/30">
                    <IconTarget className="mx-auto mb-3 text-text-secondary/50" size={48} />
                    <h3 className="mb-1 text-xl font-bold text-text-primary">No Visions Found</h3>
                    <p className="max-w-md mx-auto mb-6 text-sm text-text-secondary">
                      {activeTab === 'Completed'
                        ? "You haven't achieved any visions in this filter yet."
                        : 'Your vision board is waiting for your dreams.'}
                    </p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="btn btn-primary btn-md"
                    >
                      Plant a Vision
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
                    {filteredVisions.map((vision) => (
                      <div
                        key={vision.id}
                        onClick={() => setSelectedVision(vision)}
                        className="bg-surface rounded-2xl border border-border overflow-hidden cursor-pointer shadow-subtle hover:shadow-lg transition-all flex flex-col group"
                      >
                        <div className="relative h-44 bg-surface-alt overflow-hidden">
                          {vision.imageUrl ? (
                            <img
                              src={vision.imageUrl}
                              alt={vision.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                              <IconPhoto size={36} />
                            </div>
                          )}
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-black uppercase text-text-primary">
                            {vision.category}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          <h3 className="font-extrabold text-[15px] text-text-primary line-clamp-2">
                            {vision.title}
                          </h3>
                          <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary mt-2">
                            <span>{vision.progress}%</span>
                            <span>{vision.status}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-surface-alt overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${vision.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CREATE VISION MODAL ── */}
      <CreateVisionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={async (v) => {
          await addVision(v);
          setIsCreateOpen(false);
          addToast('Created', 'Vision planted on your board.', 'success');
        }}
        userId={user?.id}
      />

      {/* ── ASSIGN TASKS MODAL ── */}
      <AssignTaskModal
        isOpen={!!assignModalVision}
        onClose={() => setAssignModalVision(null)}
        vision={assignModalVision}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vision Detail View Component
// ─────────────────────────────────────────────────────────────────────────────
function VisionDetail({
  vision,
  habits,
  todoTasks,
  onBack,
  onOpenAssign,
  onUpdate,
  onDelete,
}: {
  vision: Vision;
  habits: Habit[];
  todoTasks: any[];
  onBack: () => void;
  onOpenAssign: () => void;
  onUpdate: (u: Partial<Vision>) => void;
  onDelete: () => void;
}) {
  const [isLinkingHabit, setIsLinkingHabit] = useState(false);
  const [newDetailTask, setNewDetailTask] = useState('');
  const addVisionTask = useAppStore((s) => s.addVisionTask);
  const toggleVisionTask = useAppStore((s) => s.toggleVisionTask);
  const deleteVisionTask = useAppStore((s) => s.deleteVisionTask);
  const updateTodoTask = useAppStore((s) => s.updateTodoTask);

  const linkedHabits = habits.filter((h) => vision.linkedHabitIds?.includes(h.id));
  const unlinkedHabits = habits.filter((h) => !vision.linkedHabitIds?.includes(h.id));

  // Global linked tasks
  const linkedGlobalTasks = useMemo(() => {
    const set = new Set(vision.linkedTaskIds || []);
    return todoTasks.filter((t) => set.has(t.id) && !t.deleted);
  }, [vision.linkedTaskIds, todoTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetailTask.trim()) return;
    await addVisionTask(vision.id, newDetailTask.trim());
    setNewDetailTask('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl pb-20 mx-auto space-y-6"
    >
      {/* Header bar */}
      <div className="sticky top-14 md:top-0 z-10 flex items-center justify-between py-3 mb-2 border-b bg-background/80 backdrop-blur-md border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
        >
          <IconChevronLeft size={18} />
          <span>Back to Board</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdate({
                status: vision.status === 'Achieved' ? 'In Progress' : 'Achieved',
                progress: vision.status === 'Achieved' ? 50 : 100,
              })
            }
            className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors cursor-pointer ${
              vision.status === 'Achieved'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-surface hover:bg-surface-hover border-border text-text-primary'
            }`}
          >
            {vision.status === 'Achieved' ? 'Achieved 🎉' : 'Mark Achieved'}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <IconTrash size={18} />
          </button>
        </div>
      </div>

      {/* Visual Banner */}
      <div className="bg-surface border border-border rounded-[28px] overflow-hidden shadow-sm relative isolate">
        <div className="relative w-full h-64 md:h-72">
          {vision.imageUrl ? (
            <>
              <img
                src={vision.imageUrl}
                alt={vision.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 via-surface to-background">
              <IconPhoto size={64} className="text-primary/30" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider mb-3 inline-block">
              {vision.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-md">
              {vision.title}
            </h1>
            {vision.targetDate && (
              <p className="text-[13px] font-semibold text-white/90 mt-2 flex items-center gap-1.5">
                <IconCalendar size={15} />
                <span>
                  Target:{' '}
                  {new Date(vision.targetDate).toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Why Matters + Assigned Tasks */}
        <div className="space-y-6 md:col-span-2">
          {/* Motivation / Why */}
          <section className="bg-surface p-6 rounded-[24px] border border-border">
            <h3 className="text-xs font-black tracking-widest uppercase text-text-secondary mb-3">
              Why This Matters
            </h3>
            {vision.whyText ? (
              <p className="text-text-primary text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                {vision.whyText}
              </p>
            ) : (
              <p className="text-text-tertiary text-[14px] italic">No deeper reason defined yet.</p>
            )}
          </section>

          {/* Assigned Tasks Section */}
          <section className="bg-surface p-6 rounded-[24px] border border-border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconListCheck size={18} className="text-primary" />
                <h3 className="text-xs font-black tracking-widest uppercase text-text-secondary">
                  Assigned Action Tasks
                </h3>
              </div>
              <button
                onClick={onOpenAssign}
                className="btn btn-primary btn-sm flex items-center gap-1 cursor-pointer"
              >
                <IconLink size={14} />
                <span>Link from Todo</span>
              </button>
            </div>

            {/* Quick Add Task */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newDetailTask}
                onChange={(e) => setNewDetailTask(e.target.value)}
                placeholder="Add an actionable step for this vision..."
                className="flex-1 px-3.5 py-2 text-[13.5px] font-semibold bg-surface-alt border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!newDetailTask.trim()}
                className="btn btn-primary btn-sm px-4 cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* Task list */}
            <div className="flex flex-col gap-2 pt-1">
              {(vision.tasks || []).length === 0 && linkedGlobalTasks.length === 0 ? (
                <div className="py-6 text-center text-text-tertiary text-[13px] border border-dashed border-border rounded-xl">
                  No tasks assigned. Create or link tasks above to automatically advance progress!
                </div>
              ) : (
                <>
                  {/* Local tasks */}
                  {(vision.tasks || []).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-border text-[13px]"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleVisionTask(vision.id, t.id)}
                          className="w-4 h-4 rounded border border-border accent-primary cursor-pointer shrink-0"
                        />
                        <span
                          className={`font-semibold ${
                            t.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                          }`}
                        >
                          {t.title}
                        </span>
                      </label>
                      <button
                        onClick={() => deleteVisionTask(vision.id, t.id)}
                        className="text-text-tertiary hover:text-red-500 p-1 cursor-pointer"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  ))}

                  {/* Global tasks */}
                  {linkedGlobalTasks.map((gt) => (
                    <div
                      key={gt.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-[13px]"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={gt.completed}
                          onChange={() =>
                            updateTodoTask(gt.id, { completed: !gt.completed })
                          }
                          className="w-4 h-4 rounded border border-border accent-primary cursor-pointer shrink-0"
                        />
                        <span
                          className={`font-semibold ${
                            gt.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                          }`}
                        >
                          {gt.title}
                        </span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        Linked Todo
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Linked Habits */}
          <section className="bg-surface p-6 rounded-[24px] border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black tracking-widest uppercase text-text-secondary">
                Linked Habits ({linkedHabits.length})
              </h3>
              <button
                onClick={() => setIsLinkingHabit(!isLinkingHabit)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={14} /> Link Habit
              </button>
            </div>

            {isLinkingHabit && (
              <div className="p-4 mb-4 border bg-surface-alt border-border rounded-xl">
                <p className="text-xs font-bold text-text-secondary mb-2">
                  Select a habit to link:
                </p>
                <div className="flex flex-wrap gap-2">
                  {unlinkedHabits.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        onUpdate({
                          linkedHabitIds: [...(vision.linkedHabitIds || []), h.id],
                        });
                        setIsLinkingHabit(false);
                      }}
                      className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[13px] font-semibold hover:border-primary transition-colors cursor-pointer"
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {linkedHabits.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 border bg-surface-alt border-border rounded-xl"
                >
                  <div>
                    <p className="font-bold text-[14px] text-text-primary">{h.name}</p>
                    <p className="text-[11px] font-medium text-primary mt-0.5">
                      {h.streak || 0} Day Streak (Best: {h.bestStreak || 0})
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onUpdate({
                        linkedHabitIds: vision.linkedHabitIds.filter((id) => id !== h.id),
                      })
                    }
                    className="p-1.5 text-text-tertiary hover:text-red-500 rounded-md cursor-pointer"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col: Progress & Status */}
        <div className="space-y-6">
          <section className="bg-surface p-6 rounded-[24px] border border-border flex flex-col items-center text-center">
            <h3 className="text-xs font-black tracking-widest uppercase text-text-secondary mb-4 self-start">
              Progress
            </h3>
            <div className="text-5xl font-black text-text-primary tracking-tight">
              {vision.progress}%
            </div>
            <p className="text-[13px] font-bold text-text-secondary mt-1">{vision.status}</p>

            <div className="w-full mt-6 pt-4 border-t border-border">
              <input
                type="range"
                min="0"
                max="100"
                value={vision.progress}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdate({
                    progress: val,
                    status: val === 100 ? 'Achieved' : val > 0 ? 'In Progress' : 'Not Started',
                  });
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </section>

          <section className="bg-surface p-6 rounded-[24px] border border-border">
            <h3 className="text-xs font-black tracking-widest uppercase text-text-secondary mb-3">
              Status
            </h3>
            <select
              value={vision.status}
              onChange={(e) => onUpdate({ status: e.target.value as Vision['status'] })}
              className="select-field"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Paused">Paused</option>
              <option value="Achieved">Achieved</option>
            </select>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Create Vision Modal
// ─────────────────────────────────────────────────────────────────────────────
function CreateVisionModal({
  isOpen,
  onClose,
  onSave,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (v: Vision) => void;
  userId?: string;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCat, setCustomCat] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [whyText, setWhyText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Invalid File', 'Must be an image.', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      addToast('Error', 'Vision title is required.', 'error');
      return;
    }

    const finalCategory = category === 'Other' && customCat.trim() ? customCat.trim() : category;

    setIsUploading(true);
    let publicUrl = undefined;

    if (imageFile && userId) {
      try {
        const optimizedFile = await compressAndConvertToWebP(imageFile, 1200, 0.85);
        const fileName = `${userId}/${Date.now()}-vision.webp`;

        const { error: uploadError } = await supabase.storage
          .from('visions')
          .upload(fileName, optimizedFile, { upsert: true, contentType: 'image/webp' });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('visions').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      } catch (err: any) {
        console.error('Image upload failed', err);
        addToast('Upload Error', 'Failed to upload image. Vision created without image.', 'warning');
      }
    }

    const newVision: Vision = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category: finalCategory,
      targetDate: targetDate || undefined,
      whyText: whyText.trim() || undefined,
      imageUrl: publicUrl,
      status: 'Not Started',
      progress: 0,
      linkedHabitIds: [],
      linkedTaskIds: [],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(newVision);
    } catch (err: any) {
      console.error('Failed to create vision:', err);
      addToast('Error', 'Failed to save vision: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsUploading(false);
    }

    setTitle('');
    setCategory(DEFAULT_CATEGORIES[0]);
    setCustomCat('');
    setTargetDate('');
    setWhyText('');
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plant a New Vision" maxWidthClassName="max-w-xl">
      <div className="flex flex-col gap-5 pt-2">
        <div>
          <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
            What is your vision?
          </label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Build an AI-driven Startup, Run a Marathon..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-[15px] font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
              Category
            </label>
            <CustomSelect
              options={DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={category}
              onChange={setCategory}
            />
            {category === 'Other' && (
              <input
                type="text"
                placeholder="Custom category..."
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value)}
                className="input-field mt-2 text-sm"
              />
            )}
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
              Target Date <span className="font-normal text-text-tertiary">(Optional)</span>
            </label>
            <input
              type="month"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input-field text-[14px] font-bold"
            />
          </div>
        </div>

        <div className="overflow-hidden border border-border rounded-xl bg-surface-alt">
          {imagePreview ? (
            <div className="relative h-40 group">
              <img src={imagePreview} className="object-cover w-full h-full" alt="Preview" />
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <IconTrash size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-24 gap-1 transition-colors cursor-pointer text-text-tertiary hover:bg-surface"
            >
              <IconPhoto size={24} />
              <span className="text-xs font-bold">Add Cover Image (Optional)</span>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div>
          <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary block mb-1.5">
            Why this matters <span className="font-normal text-text-tertiary">(Optional)</span>
          </label>
          <textarea
            placeholder="Connect with the deeper reason behind this aspiration..."
            value={whyText}
            onChange={(e) => setWhyText(e.target.value)}
            className="textarea-field min-h-[80px] text-[14px]"
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="btn btn-primary btn-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <IconLoader2 size={16} className="animate-spin" />
            ) : (
              <IconTarget size={16} />
            )}
            <span>{isUploading ? 'Planting…' : 'Plant Vision'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
