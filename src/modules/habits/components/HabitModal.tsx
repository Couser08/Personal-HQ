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
  targetTime,
  setTargetTime,
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
  targetTime: string;
  setTargetTime: (val: string) => void;
  handleSaveHabit: () => void;
  deleteHabit: (id: string) => Promise<void>;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedHabitToEdit ? 'Edit Habit' : 'Create Habit'}
    >
      <div className="flex flex-col gap-4 text-left font-sans select-none">
        
        {/* Habit Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Habit Name</label>
          <input
            type="text"
            required
            placeholder="e.g., LeetCode Daily, Read Books"
            value={habitName}
            onChange={e => setHabitName(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description (Optional)</label>
          <input
            type="text"
            placeholder="e.g., 20 mins every morning"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Dynamic Habit Type Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Category / Goal Type</label>
          <select
            value={habitType}
            onChange={(e) => setHabitType(e.target.value as any)}
            className="input-field text-sm cursor-pointer"
          >
            <option value="generic">Generic Check-off</option>
            <option value="coding">💻 Coding Focus</option>
            <option value="reading">📖 Reading Focus</option>
            <option value="meditation">🧘 Meditation Focus</option>
            <option value="workout">🏋️ Workout Focus</option>
          </select>
        </div>

        {/* Why statement */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Why Statement (Internal Purpose)</label>
          <input
            type="text"
            placeholder="e.g. To build focus and clear my mind"
            value={whyText}
            onChange={e => setWhyText(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Target Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Reminder / Target Time</label>
          <input
            type="time"
            value={targetTime}
            onChange={e => setTargetTime(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Frequency */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Frequency</label>
          <div className="flex bg-surface-alt p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setFrequencyType('daily')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none bg-transparent ${
                frequencyType === 'daily' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Every Day
            </button>
            <button
              type="button"
              onClick={() => setFrequencyType('weekly_days')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none bg-transparent ${
                frequencyType === 'weekly_days' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Specific Days
            </button>
            <button
              type="button"
              onClick={() => setFrequencyType('weekly_count')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none bg-transparent ${
                frequencyType === 'weekly_count' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Times / Week
            </button>
          </div>
        </div>

        {frequencyType === 'weekly_days' && (
          <div className="flex flex-col gap-2 p-3 bg-surface-alt/50 rounded-2xl border border-border">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Select Days</label>
            <div className="flex justify-between gap-1 mt-1">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = frequencyDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleToggleDay(day.value)}
                    className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : 'bg-surface border-border text-text-secondary hover:border-primary/40'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {frequencyType === 'weekly_count' && (
          <div className="flex flex-col gap-2 p-3 bg-surface-alt/50 rounded-2xl border border-border">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Target Completions</label>
              <span className="text-xs font-bold text-text-primary">{frequencyCount}× per week</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={frequencyCount}
              onChange={e => setFrequencyCount(parseInt(e.target.value))}
              className="w-full accent-primary mt-2 cursor-pointer"
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
          {selectedHabitToEdit ? (
            <button
              type="button"
              onClick={() => {
                showConfirm('Delete Habit', `Delete "${selectedHabitToEdit.name}"?`, () => {
                  deleteHabit(selectedHabitToEdit.id);
                  onClose();
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 border-none"
            >
              Delete Habit
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm rounded-xl cursor-pointer">
              Cancel
            </button>
            <button type="button" onClick={handleSaveHabit} className="btn btn-primary btn-sm rounded-xl cursor-pointer">
              Save Habit
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
