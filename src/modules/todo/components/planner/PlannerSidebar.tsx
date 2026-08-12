import { useState, useEffect, useMemo } from 'react';
import { 
  IconClock, IconMapPin, IconBell, IconRepeat, 
  IconChevronLeft, IconChevronRight, IconCalendar 
} from '@tabler/icons-react';
import { type TodoTask } from '../../../../store/types';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { CustomSelect } from '../../../../components/ui/CustomSelect';

interface PlannerSidebarProps {
  selectedDate: Date | null;
  taskToEdit?: TodoTask | null;
  onAddPlan: (task: Partial<TodoTask>) => void;
  onUpdatePlan?: (id: string, updates: Partial<TodoTask>) => void;
  onDeletePlan?: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'Routine', label: 'Routine' },
  { value: 'Focus', label: 'Focus' },
  { value: 'Learning', label: 'Learning' },
  { value: 'Break', label: 'Break' },
  { value: 'Work', label: 'Work' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Review', label: 'Review' },
  { value: 'Personal', label: 'Personal' }
];

const REMINDER_OPTIONS = [
  { value: 'No reminder', label: 'No reminder' },
  { value: '5 mins before', label: '5 mins before' },
  { value: '15 mins before', label: '15 mins before' },
  { value: '30 mins before', label: '30 mins before' }
];

const REPEAT_OPTIONS = [
  { value: 'Does not repeat', label: 'Does not repeat' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Weekdays', label: 'Weekdays' }
];

const PRIORITY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

// Conversions between 12-hour AM/PM and 24-hour native inputs
function convert12to24(time12: string | null | undefined): string {
  if (!time12) return '09:00';
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '09:00';
  let h = parseInt(match[1]);
  const m = match[2].padStart(2, '0');
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

function convert24to12(time24: string | null | undefined): string {
  if (!time24) return '9:00 AM';
  const parts = time24.split(':');
  if (parts.length < 2) return '9:00 AM';
  let h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function PlannerSidebar({
  selectedDate,
  taskToEdit,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  isOpen,
  onClose
}: PlannerSidebarProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState('No reminder');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [priority, setPriority] = useState('medium');
  const [featured, setFeatured] = useState(false);
  
  // Custom Date Picker states
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());

  // Time Slot states
  const [hasTimeSlot, setHasTimeSlot] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setHasTimeSlot(false);
    setStartTime('09:00');
    setEndTime('10:00');
    setDescription('');
    setLocation('');
    setReminder('No reminder');
    setRepeat('Does not repeat');
    setPriority('medium');
    setFeatured(false);
    
    const initialDate = selectedDate ? selectedDate.toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA');
    setDueDate(initialDate);
    setPickerMonth(selectedDate || new Date());
  };

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setCategory(taskToEdit.category || '');
        setDescription(taskToEdit.description || '');
        setLocation(taskToEdit.location || '');
        setReminder(taskToEdit.reminder || 'No reminder');
        setRepeat(taskToEdit.repeat || 'Does not repeat');
        setPriority(taskToEdit.priority || 'medium');
        setFeatured(!!taskToEdit.featured);
        setDueDate(taskToEdit.dueDate || '');
        if (taskToEdit.dueDate) {
          setPickerMonth(new Date(taskToEdit.dueDate));
        }

        if (taskToEdit.startTime) {
          setHasTimeSlot(true);
          setStartTime(convert12to24(taskToEdit.startTime));
        } else {
          setHasTimeSlot(false);
          setStartTime('09:00');
        }

        if (taskToEdit.endTime) {
          setEndTime(convert12to24(taskToEdit.endTime));
        } else {
          setEndTime('10:00');
        }
      } else {
        resetForm();
      }
    }
  }, [taskToEdit, isOpen, selectedDate]);

  // Compute days for custom picker calendar
  const pickerDays = useMemo(() => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    return days;
  }, [pickerMonth]);

  const handlePrevPickerMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1));
  };

  const handleNextPickerMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1));
  };

  const formattedDateLabel = useMemo(() => {
    if (!dueDate) return 'Select Date';
    const d = new Date(dueDate + 'T12:00:00'); // Prevent timezone shift
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [dueDate]);

  const handleSave = () => {
    if (!title.trim()) return;

    const computedStartTime = hasTimeSlot ? convert24to12(startTime) : undefined;
    const computedEndTime = hasTimeSlot ? convert24to12(endTime) : undefined;

    const planData = {
      title: title.trim(),
      category: category || undefined,
      startTime: computedStartTime,
      endTime: computedEndTime,
      description: description || undefined,
      location: location || undefined,
      reminder: reminder !== 'No reminder' ? reminder : undefined,
      repeat: repeat !== 'Does not repeat' ? repeat : undefined,
      priority: priority as any,
      featured: featured || undefined,
      dueDate: dueDate || undefined,
    };

    if (taskToEdit) {
      onUpdatePlan?.(taskToEdit.id, planData);
    } else {
      onAddPlan(planData);
    }
    onClose();
    resetForm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={taskToEdit ? 'Edit Plan' : `Add Plan`}
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-5 pt-2 select-none font-sans text-left">
        
        {/* Title, Category, Priority */}
        <div className="flex flex-col gap-4">
          <Input 
            autoFocus
            placeholder="Plan Title (e.g., Deep Work Session)" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              placeholder="Select category"
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
            />
            <CustomSelect
              placeholder="Priority"
              value={priority}
              onChange={setPriority}
              options={PRIORITY_OPTIONS}
            />
          </div>

          {/* Premium Custom Date Selector */}
          <div className="flex flex-col gap-1.5 text-left relative">
            <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest">Plan Date</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full text-xs font-black py-3 px-4 rounded-xl border border-solid border-border bg-surface text-text-primary hover:border-indigo-650 transition-all flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <IconCalendar size={15} className="text-indigo-600" />
                {formattedDateLabel}
              </span>
              <IconChevronRight size={14} className={`text-text-muted transition-transform ${showDatePicker ? 'rotate-90' : ''}`} />
            </button>

            {/* Custom Calendar Dropdown Panel */}
            {showDatePicker && (
              <div className="absolute top-[65px] left-0 right-0 z-35 bg-white dark:bg-surface border border-solid border-border rounded-2xl shadow-xl p-4 flex flex-col gap-3.5 animate-fadeIn">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-text-primary">
                    {pickerMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={handlePrevPickerMonth} className="p-1 rounded-lg border-none bg-transparent hover:bg-slate-50 dark:hover:bg-surface-hover text-text-secondary cursor-pointer"><IconChevronLeft size={13} strokeWidth={2.5} /></button>
                    <button type="button" onClick={handleNextPickerMonth} className="p-1 rounded-lg border-none bg-transparent hover:bg-slate-50 dark:hover:bg-surface-hover text-text-secondary cursor-pointer"><IconChevronRight size={13} strokeWidth={2.5} /></button>
                  </div>
                </div>
                
                {/* Days tags row */}
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-text-muted uppercase">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                </div>

                {/* Days grid selection */}
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
                        className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-indigo-600 text-white font-black'
                            : isToday
                              ? 'border border-indigo-650 text-indigo-600 font-black'
                              : cell.isCurrentMonth
                                ? 'text-text-primary hover:bg-slate-50 dark:hover:bg-surface-hover'
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

          {/* Time Slot Toggle */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-surface-alt/25 p-3.5 rounded-2xl border border-solid border-border/40">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-primary">⏰ Set Specific Time Slot</span>
              <span className="text-[10px] text-text-muted mt-0.5 font-bold">Schedule this as an event with a time range</span>
            </div>
            <input 
              type="checkbox"
              checked={hasTimeSlot}
              onChange={e => setHasTimeSlot(e.target.checked)}
              className="w-4.5 h-4.5 rounded text-indigo-650 cursor-pointer"
            />
          </div>

          {/* Customized Browser-like Time Input selectors */}
          {hasTimeSlot && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <IconClock size={12} className="text-indigo-600" /> Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => {
                    const newStart = e.target.value;
                    setStartTime(newStart);
                    // Automatically shift end time by 1 hour as helper
                    const [h, m] = newStart.split(':').map(Number);
                    const newEndH = (h + 1) % 24;
                    setEndTime(`${String(newEndH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                  }}
                  className="w-full text-xs font-bold py-3 px-4 rounded-xl border border-solid border-border bg-surface text-text-primary focus:outline-none focus:border-indigo-650 transition-all cursor-pointer custom-time-input"
                />
              </div>
              
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9.5px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <IconClock size={12} className="text-indigo-600" /> End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full text-xs font-bold py-3 px-4 rounded-xl border border-solid border-border bg-surface text-text-primary focus:outline-none focus:border-indigo-650 transition-all cursor-pointer custom-time-input"
                />
              </div>
            </div>
          )}

          {/* Featured Task Toggle */}
          <div className="flex items-center justify-between bg-amber-500/5 p-3.5 rounded-2xl border border-solid border-amber-500/20">
            <div className="flex flex-col">
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                👑 Featured Focus Task
              </span>
              <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5 font-bold">Highlight as the core goal of the day</span>
            </div>
            <input 
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4.5 h-4.5 rounded text-amber-555 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="h-px bg-border/50 w-full" />

        {/* Optional details (Description & Location) */}
        <div className="flex flex-col gap-4 text-left">
          <textarea 
            placeholder="Description (optional)" 
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border/80 bg-surface text-text-primary text-[13px] placeholder:text-text-muted focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all min-h-[80px] resize-y"
          />

          <div className="relative text-left">
            <IconMapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <Input 
              placeholder="Location (e.g. Home Office)" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <IconBell size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10" />
              <CustomSelect
                value={reminder}
                onChange={setReminder}
                options={REMINDER_OPTIONS}
                className="[&>button]:pl-9"
              />
            </div>
            <div className="relative">
              <IconRepeat size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10" />
              <CustomSelect
                value={repeat}
                onChange={setRepeat}
                options={REPEAT_OPTIONS}
                className="[&>button]:pl-9"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4">
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
            <div />
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
