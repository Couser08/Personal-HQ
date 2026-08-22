import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconHourglassEmpty } from '@tabler/icons-react';
import { useAppStore, type CountdownTemplate } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '../../components/ui/EmptyState';
import { EMOJIS, COLORS } from './utils/countdownHelpers';
import { CountdownCard } from './components/CountdownCard';
import { AddCountdownModal } from './components/AddCountdownModal';

export default function CountdownModule() {
  const { countdowns, addCountdown, deleteCountdown, showConfirm, settings } = useAppStore(
    useShallow((state) => ({
      countdowns: state.countdowns,
      addCountdown: state.addCountdown,
      deleteCountdown: state.deleteCountdown,
      showConfirm: state.showConfirm,
      settings: state.settings,
    })),
  );
  const template: CountdownTemplate = settings.countdownTemplate ?? 'default';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('00:00');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState<(typeof COLORS)[number]>('rose');

  const handleOpenModal = () => {
    setLabel('');
    setDate('');
    setTime('00:00');
    setEmoji(EMOJIS[0]);
    setColor('rose');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!label.trim() || !date) return;
    addCountdown({
      id: crypto.randomUUID(),
      title: label,
      label,
      targetDate: new Date(`${date}T${time}`).toISOString(),
      emoji,
      color,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(false);
  };

  const sorted = useMemo(() => {
    const active = countdowns.filter((c) => Date.parse(c.targetDate) > Date.now());
    const done = countdowns.filter((c) => Date.parse(c.targetDate) <= Date.now());
    active.sort((a, b) => Date.parse(a.targetDate) - Date.parse(b.targetDate));
    done.sort((a, b) => Date.parse(b.targetDate) - Date.parse(a.targetDate));
    return [...active, ...done];
  }, [countdowns]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full gap-6 text-left"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Countdown <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          </h2>
          <p className="text-text-secondary text-sm">Track your upcoming events and deadlines</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary btn-md">
          <IconPlus className="w-4 h-4" /> Add Countdown
        </button>
      </div>

      {countdowns.length === 0 ? (
        <EmptyState
          icon={<IconHourglassEmpty className="w-9 h-9 text-text-muted" />}
          title="No countdowns yet"
          description="Create a countdown for exams, trips, launches, or any date you want to keep in view."
          action={
            <button onClick={handleOpenModal} className="btn btn-primary btn-md">
              <IconPlus className="w-4 h-4" /> Create First Countdown
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {sorted.map((c) => (
              <CountdownCard
                key={c.id}
                c={c}
                template={template}
                onDelete={() =>
                  showConfirm('Delete Countdown', `Delete "${c.label}"?`, () =>
                    deleteCountdown(c.id),
                  )
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddCountdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        label={label}
        setLabel={setLabel}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        emoji={emoji}
        setEmoji={setEmoji}
        color={color}
        setColor={setColor}
        handleSave={handleSave}
      />
    </motion.div>
  );
}
