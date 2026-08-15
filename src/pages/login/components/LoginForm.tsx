import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMail,
  IconLock,
  IconArrowRight,
  IconLoader2,
  IconCheck,
} from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthField } from './AuthField';
import { AuthAlert, type AlertType } from './AuthAlert';
import { mapError } from '../utils';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onAuthSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onForgotPassword,
  onAuthSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [shaking, setShaking] = useState(false);
  const [alert, setAlert] = useState<{
    msg: string;
    type: AlertType;
    title?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const { signIn, loading } = useAuthStore();

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  }, []);

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string | null> = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) {
      shake();
      return;
    }

    setAlert({ msg: 'Verifying credentials…', type: 'info' });

    const { error } = await signIn(email.trim(), password);

    if (error) {
      const friendlyMsg = mapError(error);
      setAlert({
        msg: friendlyMsg,
        type: 'error',
        title: 'Sign In Failed',
      });
      setErrors({
        email: friendlyMsg.toLowerCase().includes('email') ? friendlyMsg : null,
        password: friendlyMsg.toLowerCase().includes('password') ? 'Check password' : null,
      });
      shake();
      return;
    }

    setAlert({
      msg: 'Welcome back! Loading your workspace…',
      type: 'success',
      title: 'Success',
    });

    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 0] } : { x: 0 }}
      transition={shaking ? { duration: 0.4 } : {}}
      noValidate
      className="flex flex-col gap-4 w-full"
    >
      {/* Alert Banner for States: error / success / info */}
      <AnimatePresence mode="wait">
        {alert && (
          <AuthAlert
            key="login-alert"
            type={alert.type}
            title={alert.title}
            message={alert.msg}
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>

      {/* Input Fields */}
      <div className="flex flex-col gap-3.5">
        <AuthField
          id="login-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(val) => {
            setEmail(val);
            if (errors.email) clearFieldError('email');
            if (alert) setAlert(null);
          }}
          placeholder="name@example.com"
          LeadIcon={IconMail}
          hasError={!!errors.email}
          errorMessage={errors.email || undefined}
          isValid={isEmailValid}
          disabled={loading}
          autoComplete="email"
          autoFocus
          required
        />

        <AuthField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(val) => {
            setPassword(val);
            if (errors.password) clearFieldError('password');
            if (alert) setAlert(null);
          }}
          placeholder="••••••••"
          LeadIcon={IconLock}
          hasError={!!errors.password}
          errorMessage={errors.password || undefined}
          disabled={loading}
          autoComplete="current-password"
          required
        />
      </div>

      {/* Utilities Row: Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-[13px] pt-0.5">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-text-secondary hover:text-text-primary transition-colors group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="peer appearance-none w-4 h-4 rounded-[4px] border border-border-alt bg-surface-alt checked:bg-primary checked:border-primary transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/30 outline-none"
            />
            <IconCheck
              size={12}
              className="text-text-on-accent absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
            />
          </div>
          <span className="font-medium">Remember me</span>
        </label>

        <button
          type="button"
          onClick={onForgotPassword}
          disabled={loading}
          className="text-text-secondary hover:text-text-primary font-semibold transition-colors cursor-pointer p-0 bg-transparent border-none focus-visible:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-md w-full flex items-center justify-center gap-2 font-bold tracking-tight shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <IconLoader2 size={18} className="animate-spin text-text-on-accent" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <IconArrowRight size={17} />
            </>
          )}
        </button>
      </div>

      {/* Footer Switcher */}
      <div className="flex items-center justify-center gap-1.5 text-[13px] text-text-secondary pt-2">
        <span>Don't have an account yet?</span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          disabled={loading}
          className="font-bold text-text-primary hover:underline transition-all cursor-pointer bg-transparent border-none p-0"
        >
          Create account
        </button>
      </div>
    </motion.form>
  );
};