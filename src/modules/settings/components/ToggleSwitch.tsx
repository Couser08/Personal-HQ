import React from 'react';
import { motion } from 'framer-motion';

export const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-300 ease-in-out cursor-pointer flex items-center shrink-0 border border-transparent shadow-inner ${
      checked ? 'bg-[#34C759] justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
    }`}
  >
    <motion.div
      layout
      className="w-6 h-6 rounded-full bg-white shadow-sm border border-black/5 dark:border-white/5"
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);
