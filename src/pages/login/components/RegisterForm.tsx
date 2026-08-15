import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMail,
  IconLock,
  IconUserPlus,
  IconLoader2,
  IconCheck,
} from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthField } from './AuthField';
import { AuthAlert, type AlertType } from './AuthAlert';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { mapError } from '../utils';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onAuthSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onAuthSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [shaking, setShaking] = useState(false);
  const [alert, setAlert] = useState<{
    msg: string;
    type: AlertType;
    title?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const { signUp, loading } = useAuthStore();

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
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!agreeTerms) {
      setAlert({
        type: 'warning',
        title: 'Agreement Required',
        msg: 'Please accept the Terms of Service to create your workspace.',
      });
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

    setAlert({ msg: 'Creating your Personal HQ account…', type: 'info' });

    const { error } = await signUp(email.trim(), password);

    if (error) {
      const friendlyMsg = mapError(error);
      setAlert({
        msg: friendlyMsg,
        type: 'error',
        title: 'Registration Error',
      });
      setErrors({
        email: friendlyMsg.toLowerCase().includes('email') || friendlyMsg.toLowerCase().includes('exists') ? friendlyMsg : null,
        password: friendlyMsg.toLowerCase().includes('password') ? friendlyMsg : null,
      });
      shake();
      return;
    }

    setAlert({
      msg: '🎉 Account created! Initializing your workspace…',
      type: 'success',
      title: 'Workspace Ready',
    });

    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 0] } : { x: 0 }}
      transition={shaking ? { duration: 0.4 } : {}}
      noValidate
      className="flex flex-col gap-3.5 w-full"
    >
      {/* Alert Banner for States */}
      <AnimatePresence mode="wait">
        {alert && (
          <AuthAlert
            key="register-alert"
            type={alert.type}
            title={alert.title}
            message={alert.msg}
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>

      {/* Input Fields */}
      <div className="flex flex-col gap-3">
        <AuthField
          id="reg-email"
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

        <div className="flex flex-col gap-1.5">
          <AuthField
            id="reg-password"
            label="Password"
            type="password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              if (errors.password) clearFieldError('password');
              if (errors.confirmPassword && val === confirmPassword) clearFieldError('confirmPassword');
              if (alert) setAlert(null);
            }}
            placeholder="Min. 6 characters"
            LeadIcon={IconLock}
            hasError={!!errors.password}
            errorMessage={errors.password || undefined}
            disabled={loading}
            autoComplete="new-password"
            required
          />
          {/* Real-time Password Strength Meter */}
          <PasswordStrengthMeter password={password} />
        </div>

        <AuthField
          id="reg-confirm-password"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val);
            if (errors.confirmPassword) clearFieldError('confirmPassword');
            if (alert) setAlert(null);
          }}
          placeholder="Repeat your password"
          LeadIcon={IconLock}
          hasError={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword || undefined}
          isValid={doPasswordsMatch}
          disabled={loading}
          autoComplete="new-password"
          required
        />
      </div>

      {/* Terms of Service Checkbox */}
      <div className="pt-1">
        <label className="inline-flex items-start gap-2.5 cursor-pointer select-none text-[12px] text-text-secondary hover:text-text-primary transition-colors group">
          <div className="relative flex items-center justify-center mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={loading}
              className="peer appearance-none w-4 h-4 rounded-[4px] border border-border-alt bg-surface-alt checked:bg-primary checked:border-primary transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/30 outline-none"
            />
            <IconCheck
              size={12}
              className="text-text-on-accent absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
            />
          </div>
          <span className="leading-snug">
            I agree to the{' '}
            <span className="font-semibold text-text-primary hover:underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="font-semibold text-text-primary hover:underline">
              Privacy Policy
            </span>
          </span>
        </label>
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
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <IconUserPlus size={17} />
            </>
          )}
        </button>
      </div>

      {/* Switch to Login */}
      <div className="flex items-center justify-center gap-1.5 text-[13px] text-text-secondary pt-2">
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={loading}
          className="font-bold text-text-primary hover:underline transition-all cursor-pointer bg-transparent border-none p-0"
        >
          Sign in
        </button>
      </div>
    </motion.form>
  );
};
