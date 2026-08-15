import { useState, useEffect } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { 
  IconCalendar, 
  IconChevronRight, 
  IconChevronLeft, 
  IconClock, 
  IconMapPin, 
  IconAdjustmentsHorizontal
} from '@tabler/icons-react';
import type { TodoTask } from '../../../../store/types';

interface PlannerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlan: (taskData: Partial<TodoTask>) => void;
  taskToEdit?: TodoTask | null;
  onUpdatePlan?: (id: string, data: Partial<TodoTask>) => void;
  onDeletePlan?: (id: string) => void;
  selectedDate?: string | Date | null;
}

const CATEGORY_OPTIONS = [
  { value: 'work', label: '💼 Work & Projects' },
  { value: 'study', label: '📚 Study & Exam' },
  { value: 'health', label: '💪 Health & Fitness' },
  { value: 'personal', label: '🏠 Personal Life' },
  { value: 'finance', label: '💰 Finance & Money' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '🔵 Low Priority' },
  { value: 'medium', label: '🟡 Medium Priority' },
  { value: 'high', label: '🔴 High Priority' },
];

const REMINDER_OPTIONS = [
  { value: 'none', label: 'No Reminder' },
  { value: 'at_time', label: 'At time of event' },
  { value: '5_min', label: '5 minutes before' },
  { value: '15_min', label: '15 minutes before' },
  { value: '1_hour', label: '1 hour before' },
];

const REPEAT_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
];

export function PlannerSidebar({
  isOpen,
  onClose,
  onAddPlan,
  taskToEdit,
  onUpdatePlan,
  onDeletePlan,
  selectedDate,
}: PlannerSidebarProps) {
  const getFormattedDateStr = (dateVal?: string | Date | null) => {
    if (!dateVal) return new Date().toLocaleDateString('en-CA');
    if (dateVal instanceof Date) return dateVal.toLocaleDateString('en-CA');
    return dateVal;
  };

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(getFormattedDateStr(selectedDate));
  const [hasTimeSlot, setHasTimeSlot] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState('none');
  const [repeat, setRepeat] = useState('none');

  // Progressive Disclosure State
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Date picker popover state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());

  // Populate form if editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setCategory(taskToEdit.category || 'work');
      setPriority(taskToEdit.priority === 'none' ? 'medium' : taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toLocaleDateString('en-CA') : getFormattedDateStr(selectedDate));
      setHasTimeSlot(Boolean(taskToEdit.startTime));
      setStartTime(taskToEdit.startTime || '09:00');
      setEndTime(taskToEdit.endTime || '10:00');
      setFeatured(Boolean(taskToEdit.featured));
      setDescription(taskToEdit.description || '');
      setLocation(taskToEdit.location || '');
      setReminder(taskToEdit.reminder || 'none');
      setRepeat(taskToEdit.repeat || 'none');
      setShowMoreOptions(true);
    } else {
      resetForm();
    }
  }, [taskToEdit, isOpen, selectedDate]);

  const resetForm = () => {
    setTitle('');
    setCategory('work');
    setPriority('medium');
    setDueDate(getFormattedDateStr(selectedDate));
    setHasTimeSlot(false);
    setStartTime('09:00');
    setEndTime('10:00');
    setFeatured(false);
    setDescription('');
    setLocation('');
    setReminder('none');
    setRepeat('none');
    setShowMoreOptions(false);
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const planData: Partial<TodoTask> = {
      title: trimmed,
      category,
      priority: priority as any,
      dueDate: dueDate || undefined,
      startTime: hasTimeSlot ? startTime : undefined,
      endTime: hasTimeSlot ? endTime : undefined,
      featured: featured || undefined,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      reminder: reminder !== 'none' ? reminder : undefined,
      repeat: repeat !== 'none' ? repeat : undefined,
    };

    if (taskToEdit) {
      onUpdatePlan?.(taskToEdit.id, planData);
    } else {
      onAddPlan(planData);
    }
    onClose();
    resetForm();
  };

  // Keyboard shortcut: Cmd/Ctrl+Enter to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  // Calendar Picker Helpers
  const handlePrevPickerMonth = () => {
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1));
  };
  const handleNextPickerMonth = () => {
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1));
  };

  const getPickerDays = () => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const startPadding = firstDay.getDay();

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const pickerDays = getPickerDays();
  const selectedDateObj = dueDate ? new Date(dueDate + 'T00:00:00') : new Date();
  const formattedDateLabel = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={taskToEdit ? 'Edit Plan' : 'Add Plan'}
      maxWidthClassName="max-w-xl"
    >
      <div 
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-5 pt-1 select-none font-sans text-left"
      >
        {/* Tier 1: Fast-Path Quick Add (Title + Date + Time) */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
              Plan Title <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              autoFocus
              placeholder="What do you plan to accomplish? (e.g. Deep Work Session)" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="input-field w-full text-sm font-semibold py-2.5 px-3.5 border-border focus:border-primary"
            />
          </div>

          {/* Date Selector */}
          <div className="flex flex-col gap-1.5 text-left relative">
            <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest">Plan Date</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-border bg-surface text-text-primary hover:border-primary/50 transition-all flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <IconCalendar size={15} className="text-primary" />
                {formattedDateLabel}
              </span>
              <IconChevronRight size={14} className={`text-text-muted transition-transform ${showDatePicker ? 'rotate-90' : ''}`} />
            </button>

            {/* Custom Calendar Dropdown Panel */}
            {showDatePicker && (
              <div className="absolute top-[65px] left-0 right-0 z-35 bg-surface border border-border rounded-2xl shadow-xl p-4 flex flex-col gap-3.5 animate-fadeIn">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-text-primary">
                    {pickerMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={handlePrevPickerMonth} className="p-1 rounded-lg hover:bg-surface-hover text-text-secondary cursor-pointer border-none bg-transparent"><IconChevronLeft size={13} /></button>
                    <button type="button" onClick={handleNextPickerMonth} className="p-1 rounded-lg hover:bg-surface-hover text-text-secondary cursor-pointer border-none bg-transparent"><IconChevronRight size={13} /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-text-muted uppercase">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold">
                  {pickerDays.map((cell, idx) => {
                    const cellDateStr = cell.date.toLocaleDateString('en-CA');
                    const isSelected = cellDateStr === dueDate;
                    const isToday = cell.date.toDateString() === new Date().toDateString();

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDueDate(cellDateStr);
                          setShowDatePicker(false);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-primary text-text-on-accent font-black'
                            : isToday
                              ? 'border border-primary text-primary font-black'
                              : cell.isCurrentMonth
                                ? 'text-text-primary hover:bg-surface-hover'
                                : 'text-text-muted/30'
                        }`}
                      >
                        {cell.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Time Slot Toggle (Clean Custom Switch) */}
          <div className="flex items-center justify-between bg-surface-alt/40 p-3.5 rounded-2xl border border-border/50">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <IconClock size={14} className="text-primary" /> Set Specific Time Slot
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 font-medium">Schedule with a start and end time</span>
            </div>
            
            <button
              type="button"
              onClick={() => setHasTimeSlot(!hasTimeSlot)}
              className={`w-10 h-6 rounded-full transition-colors p-0.5 cursor-pointer border-none ${
                hasTimeSlot ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${hasTimeSlot ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Time Range Pickers */}
          {hasTimeSlot && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => {
                    const newStart = e.target.value;
                    setStartTime(newStart);
                    const [h, m] = newStart.split(':').map(Number);
                    const newEndH = (h + 1) % 24;
                    setEndTime(`${String(newEndH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                  }}
                  className="input-field w-full text-xs font-mono font-bold py-2 px-3 border-border bg-surface cursor-pointer"
                />
              </div>
              
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="input-field w-full text-xs font-mono font-bold py-2 px-3 border-border bg-surface cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Progressive Disclosure Toggle Button */}
        <button
          type="button"
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="flex items-center justify-between py-2 text-xs font-bold text-primary hover:text-primary-hover cursor-pointer border-t border-border/40 pt-3"
        >
          <span className="flex items-center gap-1.5">
            <IconAdjustmentsHorizontal size={14} />
            {showMoreOptions ? 'Hide additional details' : 'More options (Category, Priority, Location...)'}
          </span>
          <IconChevronRight size={13} className={`transition-transform ${showMoreOptions ? 'rotate-90' : ''}`} />
        </button>

        {/* Tier 2: Progressive Disclosure Section */}
        {showMoreOptions && (
          <div className="flex flex-col gap-4 text-left animate-in fade-in duration-150">
            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest mb-1 block">Category</label>
                <CustomSelect
                  placeholder="Select category"
                  value={category}
                  onChange={setCategory}
                  options={CATEGORY_OPTIONS}
                />
              </div>
              <div>
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest mb-1 block">Priority</label>
                <CustomSelect
                  placeholder="Priority"
                  value={priority}
                  onChange={setPriority}
                  options={PRIORITY_OPTIONS}
                />
              </div>
            </div>

            {/* Featured Focus Task Toggle */}
            <div className="flex items-center justify-between bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30">
              <div className="flex flex-col">
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  👑 Featured Focus Goal
                </span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-medium">Highlight as today's core priority task</span>
              </div>
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`w-10 h-6 rounded-full transition-colors p-0.5 cursor-pointer border-none ${
                  featured ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${featured ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest mb-1 block">Description</label>
              <textarea 
                placeholder="Add notes, links, or context..." 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field w-full p-3 text-xs placeholder:text-text-muted min-h-[70px] resize-y"
              />
            </div>

            {/* Location (Fixed icon + input padding bug) */}
            <div>
              <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest mb-1 block">Location</label>
              <div className="relative flex items-center">
                <IconMapPin size={15} className="absolute left-3 text-text-muted pointer-events-none z-10" />
                <input 
                  type="text"
                  placeholder="e.g. Home Office, Meeting Room B" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="input-field w-full text-xs py-2 pl-9 pr-3"
                />
              </div>
            </div>

            {/* Reminder & Repeat */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest mb-1 block">Reminder</label>
                <CustomSelect
                  value={reminder}
                  onChange={setReminder}
                  options={REMINDER_OPTIONS}
                />
              </div>
              <div>
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest mb-1 block">Repeat</label>
                <CustomSelect
                  value={repeat}
                  onChange={setRepeat}
                  options={REPEAT_OPTIONS}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {taskToEdit ? (
            <Button 
              type="button"
              variant="danger" 
              onClick={() => {
                if (onDeletePlan) onDeletePlan(taskToEdit.id);
                onClose();
              }}
            >
              Delete Plan
            </Button>
          ) : (
            <span className="text-[11px] text-text-muted font-mono">Press Cmd+Enter to save</span>
          )}
          
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="primary" onClick={handleSave} disabled={!title.trim()}>
              {taskToEdit ? 'Save Changes' : 'Add Plan'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
