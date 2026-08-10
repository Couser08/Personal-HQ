import { useState } from 'react';
import { IconClock, IconMapPin, IconBell, IconRepeat } from '@tabler/icons-react';
import { type TodoTask } from '../../../../store/types';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { CustomSelect } from '../../../../components/ui/CustomSelect';

interface PlannerAddModalProps {
  selectedDate: Date | null;
  onAddPlan: (task: Partial<TodoTask>) => void;
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

export function PlannerSidebar({ selectedDate, onAddPlan, isOpen, onClose }: PlannerAddModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState('No reminder');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [priority, setPriority] = useState('medium');

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setReminder('No reminder');
    setRepeat('Does not repeat');
    setPriority('medium');
  };

  const handleAddPlan = () => {
    if (!title.trim()) return;
    onAddPlan({
      title,
      category: category || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      description: description || undefined,
      location: location || undefined,
      reminder: reminder !== 'No reminder' ? reminder : undefined,
      repeat: repeat !== 'Does not repeat' ? repeat : undefined,
      priority: priority as any,
      completed: false,
    });
    onClose();
    resetForm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Add Plan for ${selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}`}
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-5 pt-2">
        
        {/* Required Details */}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <IconClock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <Input 
                placeholder="Start time (e.g. 9:00 AM)" 
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <IconClock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <Input 
                placeholder="End time (e.g. 11:00 AM)" 
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50 w-full" />

        {/* Optional Details */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <textarea 
              placeholder="Description (optional)" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border/80 bg-surface text-text-primary text-[13px] placeholder:text-text-muted focus:outline-none focus:border-color-primary focus:ring-1 focus:ring-color-primary transition-all min-h-[80px] resize-y"
            />
          </div>

          <div className="relative">
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleAddPlan} disabled={!title.trim()}>Add Plan</Button>
        </div>
      </div>
    </Modal>
  );
}
