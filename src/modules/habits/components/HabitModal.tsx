import { Modal } from '../../../components/ui/Modal';
import { type Habit } from '../../../store/types';
import { DAYS_OF_WEEK } from '../utils';

export function HabitModal({
  isOpen,
  onClose,
  selectedHabitToEdit,
  habitName,
  setHabitName,
  description,
  setDescription,
  frequencyType,
  setFrequencyType,
  frequencyDays,
  handleToggleDay,
  frequencyCount,
  setFrequencyCount,
  habitType,
  setHabitType,
  whyText,
  setWhyText,
  handleSaveHabit,
  deleteHabit,
  showConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedHabitToEdit: Habit | null;
  habitName: string;
  setHabitName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  frequencyType: 'daily' | 'weekly_days' | 'weekly_count';
  setFrequencyType: (val: 'daily' | 'weekly_days' | 'weekly_count') => void;
  frequencyDays: number[];
  handleToggleDay: (day: number) => void;
  frequencyCount: number;
  setFrequencyCount: (val: number) => void;
  habitType: 'generic' | 'reading' | 'coding' | 'meditation' | 'workout';
  setHabitType: (val: 'generic' | 'reading' | 'coding' | 'meditation' | 'workout') => void;
  whyText: string;
  setWhyText: (val: string) => void;
  targetTime?: string;
  setTargetTime?: (val: string) => void;
  handleSaveHabit: () => void;
  deleteHabit: (id: string) => Promise<void>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedHabitToEdit ? 'Edit Habit' : 'New Habit'}
      maxWidthClassName="max-w-lg"
    >
      <div className="flex flex-col gap-4 text-left font-sans select-none pt-1">
        
        {/* Habit Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Habit Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Morning Workout, Read 10 Pages"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Description (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., 20 mins right after coffee"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
          />
        </div>

        {/* Category / Goal Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Focus Category
          </label>
          <select
            value={habitType}
            onChange={(e) => setHabitType(e.target.value as any)}
            className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium cursor-pointer"
          >
            <option value="generic">Standard Check-in</option>
            <option value="coding">💻 Coding / Development</option>
            <option value="reading">📖 Reading / Knowledge</option>
            <option value="meditation">🧘 Mindfulness & Meditation</option>
            <option value="workout">🏋️ Fitness & Workout</option>
          </select>
        </div>

        {/* Frequency Type Selector */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-2 bg-surface-alt p-1 rounded-full">
            <button
              type="button"
              onClick={() => setFrequencyType('daily')}
              className={`py-2 text-[12px] font-semibold rounded-full transition-all cursor-pointer border-none ${
                frequencyType === 'daily'
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setFrequencyType('weekly_days')}
              className={`py-2 text-[12px] font-semibold rounded-full transition-all cursor-pointer border-none ${
                frequencyType === 'weekly_days'
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Specific Days
            </button>
            <button
              type="button"
              onClick={() => setFrequencyType('weekly_count')}
              className={`py-2 text-[12px] font-semibold rounded-full transition-all cursor-pointer border-none ${
                frequencyType === 'weekly_count'
                  ? 'bg-text-primary text-background shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Times / Week
            </button>
          </div>
        </div>

        {/* Specific Days Picker */}
        {frequencyType === 'weekly_days' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Select Active Days
            </label>
            <div className="flex items-center justify-between gap-1.5 pt-1">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = frequencyDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleToggleDay(day.value)}
                    className={`w-10 h-10 rounded-full text-[13px] font-semibold transition-all cursor-pointer border-none flex items-center justify-center ${
                      isSelected
                        ? 'bg-text-primary text-background shadow-sm'
                        : 'bg-surface-alt text-text-secondary hover:text-text-primary hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Count Picker */}
        {frequencyType === 'weekly_count' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Target Times per Week: {frequencyCount}
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={frequencyCount}
              onChange={(e) => setFrequencyCount(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-alt rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Purpose / Why */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Why are you building this habit? (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., To boost long-term energy and focus"
            value={whyText}
            onChange={(e) => setWhyText(e.target.value)}
            className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3">
          {selectedHabitToEdit ? (
            <button
              type="button"
              onClick={() => {
                showConfirm('Delete Habit', `Delete "${selectedHabitToEdit.name}"?`, async () => {
                  await deleteHabit(selectedHabitToEdit.id);
                  onClose();
                });
              }}
              className="px-4 py-2.5 rounded-full text-[13px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer"
            >
              Delete
            </button>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors border-none bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveHabit}
              className="px-6 py-2.5 rounded-full text-[13px] font-semibold bg-text-primary text-background hover:opacity-90 transition-all border-none shadow-sm cursor-pointer"
            >
              {selectedHabitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
