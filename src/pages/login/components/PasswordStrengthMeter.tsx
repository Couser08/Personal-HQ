import React from 'react';
import { motion } from 'framer-motion';
import { IconCheck, IconCircleDot } from '@tabler/icons-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const hasMinLength = password.length >= 6;
  const hasEightChars = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpperAndLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasEightChars) score += 1;
  if (hasNumber) score += 1;
  if (hasUpperAndLower || hasSpecial) score += 1;

  const getLabel = () => {
    switch (score) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'text-red-500', barBg: 'bg-red-500' };
      case 2:
        return { text: 'Fair', color: 'text-amber-500', barBg: 'bg-amber-500' };
      case 3:
        return { text: 'Good', color: 'text-sky-500', barBg: 'bg-sky-500' };
      case 4:
        return { text: 'Strong', color: 'text-emerald-500', barBg: 'bg-emerald-500' };
      default:
        return { text: '', color: '', barBg: '' };
    }
  };

  const status = getLabel();

  const criteria = [
    { label: '6+ chars', met: hasMinLength },
    { label: 'Number', met: hasNumber },
    { label: 'Mixed case/Symbol', met: hasUpperAndLower || hasSpecial },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-col gap-2 pt-1 pb-0.5 overflow-hidden"
    >
      {/* Segmented Progress Bars */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 grid grid-cols-4 gap-1.5 h-1.5 bg-surface-alt rounded-full overflow-hidden p-0.5">
          {[1, 2, 3, 4].map((step) => {
            const isActive = score >= step;
            return (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  isActive ? status.barBg : 'bg-border-alt/50'
                }`}
              />
            );
          })}
        </div>
        <span className={`text-[11px] font-bold tracking-tight uppercase ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Requirement Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              item.met
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-surface-alt text-text-tertiary border border-border-hairline'
            }`}
          >
            {item.met ? (
              <IconCheck size={12} strokeWidth={2.5} />
            ) : (
              <IconCircleDot size={10} className="opacity-40" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
