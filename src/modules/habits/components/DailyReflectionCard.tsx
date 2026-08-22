import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import type { DailyReflection } from '../../../store/types';

interface DailyReflectionCardProps {
  isVisible: boolean;
  isReflecting: boolean;
  setIsReflecting: (v: boolean) => void;
  todayReflection?: DailyReflection;
  score: number;
  setScore: (v: number) => void;
  whatWentWell: string;
  setWhatWentWell: (v: string) => void;
  blockers: string;
  setBlockers: (v: string) => void;
  tomorrowPlan: string;
  setTomorrowPlan: (v: string) => void;
  handleSaveReflection: () => void;
}

export const DailyReflectionCard: React.FC<DailyReflectionCardProps> = ({
  isVisible,
  isReflecting,
  setIsReflecting,
  todayReflection,
  score,
  setScore,
  whatWentWell,
  setWhatWentWell,
  blockers,
  setBlockers,
  tomorrowPlan,
  setTomorrowPlan,
  handleSaveReflection,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -8 }}
        >
          <Card padding="lg" className="flex flex-col gap-4 text-left">
            {!todayReflection ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-border-hairline">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#22C55E] flex items-center gap-2">
                      Day Complete! 🎉
                    </h3>
                    <p className="text-[12px] text-text-secondary">
                      All targets completed for today. Log your daily reflection.
                    </p>
                  </div>
                  {isReflecting && (
                    <button
                      onClick={() => setIsReflecting(false)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-alt border-none bg-transparent cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Score slider */}
                  <div className="flex flex-col gap-1.5 bg-surface-alt p-4 rounded-[var(--radius-row)]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                        Daily Score
                      </span>
                      <span className="text-[12px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded-full">
                        {score} / 10
                      </span>
                    </div>
                    <input
                      id="reflection-score"
                      name="reflectionScore"
                      type="range"
                      min={1}
                      max={10}
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value))}
                      className="w-full accent-[#22C55E] cursor-pointer"
                    />
                  </div>

                  {/* What went well */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reflection-went-well"
                      className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary"
                    >
                      What went well today?
                    </label>
                    <input
                      id="reflection-went-well"
                      type="text"
                      placeholder="e.g., Finished morning workout, read 15 pages"
                      value={whatWentWell}
                      onChange={(e) => setWhatWentWell(e.target.value)}
                      className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
                    />
                  </div>

                  {/* Blockers */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reflection-blockers"
                      className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary"
                    >
                      Blockers / Challenges
                    </label>
                    <input
                      id="reflection-blockers"
                      type="text"
                      placeholder="e.g., Afternoon fatigue, distraction"
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
                    />
                  </div>

                  {/* Tomorrow plan */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reflection-tomorrow"
                      className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary"
                    >
                      Tomorrow's Focus
                    </label>
                    <input
                      id="reflection-tomorrow"
                      type="text"
                      placeholder="e.g., Start focus session at 9 AM"
                      value={tomorrowPlan}
                      onChange={(e) => setTomorrowPlan(e.target.value)}
                      className="w-full bg-surface-alt rounded-[var(--radius-input)] px-4 py-3 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-all border-none font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveReflection}
                  className="px-6 py-2.5 rounded-full text-[13px] font-semibold bg-text-primary text-background hover:opacity-90 transition-all flex items-center justify-center gap-2 border-none shadow-sm cursor-pointer mt-1"
                >
                  <IconCheck size={16} /> Save Daily Reflection
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-border-hairline">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#22C55E]">
                      Daily Reflection
                    </span>
                    <h4 className="text-[15px] font-semibold text-text-primary mt-0.5">
                      Today's Reflection Logged
                    </h4>
                  </div>
                  <span className="text-[12px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full">
                    Score: {todayReflection.score} / 10
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px] font-medium pt-1">
                  <div className="p-3.5 bg-surface-alt rounded-[var(--radius-row)] text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                      What went well
                    </span>
                    <p className="text-text-primary mt-1">
                      {todayReflection.whatWentWell || '—'}
                    </p>
                  </div>
                  <div className="p-3.5 bg-surface-alt rounded-[var(--radius-row)] text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                      Blockers
                    </span>
                    <p className="text-text-primary mt-1">{todayReflection.blockers || 'None'}</p>
                  </div>
                  <div className="p-3.5 bg-surface-alt rounded-[var(--radius-row)] text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                      Tomorrow's plan
                    </span>
                    <p className="text-text-primary mt-1">
                      {todayReflection.tomorrowPlan || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
