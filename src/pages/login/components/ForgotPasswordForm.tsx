import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMail, IconArrowLeft, IconSend, IconLoader2, IconCircleCheck } from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthField } from './AuthField';
import { AuthAlert } from './AuthAlert';
import { mapError } from '../utils';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const { resetPassword } = useAuthStore();

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldError(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      setFieldError(true);
      shake();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      setFieldError(true);
      shake();
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(trimmedEmail);
    setLoading(false);

    if (error) {
      setErrorMsg(mapError(error));
      setFieldError(true);
      shake();
      return;
    }

    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors mb-4 cursor-pointer self-start p-1 -ml-1 rounded-lg hover:bg-surface-alt"
      >
        <IconArrowLeft size={16} />
        <span>Back to Sign In</span>
      </button>

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Reset password
        </h2>
        <p className="text-[13px] text-text-secondary mt-1">
          We'll send you secure instructions to recover your account.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4 py-2"
          >
            <div className="p-4 rounded-[var(--radius-card)] bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IconCircleCheck size={28} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  Recovery email dispatched
                </h3>
                <p className="text-[13px] text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                  If an account exists for <span className="font-semibold text-text-primary underline">{email}</span>, you will receive a reset link shortly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToLogin}
              className="btn btn-primary btn-md w-full mt-2"
            >
              Return to Login
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 0] } : { x: 0 }}
            transition={shaking ? { duration: 0.4 } : {}}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Info Banner */}
            <AuthAlert
              type="info"
              message="Enter your registered email address and we will email you a password reset link."
            />

            {/* Error Banner */}
            {errorMsg && (
              <AuthAlert
                type="error"
                message={errorMsg}
                onClose={() => setErrorMsg(null)}
              />
            )}

            <AuthField
              id="reset-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(val) => {
                setEmail(val);
                if (fieldError) setFieldError(false);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="you@example.com"
              LeadIcon={IconMail}
              hasError={fieldError}
              disabled={loading}
              autoFocus
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <IconSend size={18} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
