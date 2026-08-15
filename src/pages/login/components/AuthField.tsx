import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconEye, IconEyeOff, IconCheck, IconAlertCircle } from '@tabler/icons-react';

export interface AuthFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  LeadIcon?: React.ComponentType<{ size?: number; className?: string }>;
  hasError?: boolean;
  errorMessage?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  isValid?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const AuthField: React.FC<AuthFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  LeadIcon,
  hasError = false,
  errorMessage,
  hint,
  required = false,
  disabled = false,
  autoComplete,
  isValid = false,
  autoFocus = false,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      {/* Label Row */}
      <div className="flex items-center justify-between px-0.5">
        <label
          htmlFor={id}
          className={`text-[13px] font-semibold tracking-tight transition-colors duration-150 ${
            hasError
              ? 'text-red-500 dark:text-red-400'
              : isFocused
              ? 'text-text-primary'
              : 'text-text-secondary'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && !hasError && (
          <span className="text-[11px] text-text-tertiary font-medium">
            {hint}
          </span>
        )}
      </div>

      {/* Input Outer Wrapper */}
      <div
        className={`relative flex items-center w-full rounded-[var(--radius-input)] border transition-all duration-200 ease-out bg-surface-alt ${
          hasError
            ? 'border-red-500/60 bg-red-500/5 focus-within:ring-2 focus-within:ring-red-500/20'
            : isFocused
            ? 'border-border-focus bg-surface ring-2 ring-primary/10 shadow-sm'
            : 'border-border-alt hover:border-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-sunken' : ''}`}
      >
        {/* Leading Icon */}
        {LeadIcon && (
          <div className="pl-3.5 pr-1 flex items-center justify-center pointer-events-none">
            <LeadIcon
              size={18}
              className={`transition-colors duration-200 ${
                hasError
                  ? 'text-red-500'
                  : isFocused
                  ? 'text-text-primary'
                  : 'text-text-tertiary'
              }`}
            />
          </div>
        )}

        {/* Real Native Input */}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError && errorMessage ? `${id}-error` : undefined}
          className={`w-full py-2.5 px-3 bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none font-medium ${
            !LeadIcon ? 'pl-3.5' : 'pl-2'
          }`}
        />

        {/* Trailing Controls */}
        <div className="flex items-center gap-1.5 pr-3">
          {/* Validated indicator (non-password) */}
          {isValid && !hasError && type !== 'password' && value.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-emerald-500"
            >
              <IconCheck size={16} strokeWidth={2.5} />
            </motion.div>
          )}

          {/* Password Reveal Toggle */}
          {type === 'password' && (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          )}

          {/* Error icon */}
          {hasError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-red-500 pointer-events-none"
            >
              <IconAlertCircle size={18} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Inline Error Message */}
      <AnimatePresence>
        {hasError && errorMessage && (
          <motion.div
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 px-1 overflow-hidden"
          >
            <span className="text-[12px] font-semibold text-red-500 dark:text-red-400">
              {errorMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
