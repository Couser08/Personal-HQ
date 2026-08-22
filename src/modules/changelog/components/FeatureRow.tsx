import React from 'react';
import { motion } from 'framer-motion';
import type { Feature } from '../data/releases';

export const FeatureRow: React.FC<{ f: Feature; i: number }> = ({ f, i }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 bg-surface-alt text-text-secondary">
        <f.Icon size={20} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">
            {f.title}
          </span>
          {f.badge && (
            <span
              className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full ${
                f.badge === 'New'
                  ? 'bg-accent-success/10 text-accent-success'
                  : f.badge === 'Removed'
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-surface-alt text-text-secondary'
              }`}
            >
              {f.badge}
            </span>
          )}
        </div>
        <p className="text-[14px] leading-relaxed text-text-secondary">{f.desc}</p>
      </div>
    </motion.div>
  );
};
