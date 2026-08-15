import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconShieldCheck,
  IconBolt,
  IconSparkles,
  IconDeviceLaptop,
} from '@tabler/icons-react';
import { AppLogo } from '../components/ui/AppLogo';
import { LoginForm } from './login/components/LoginForm';
import { RegisterForm } from './login/components/RegisterForm';
import { ForgotPasswordForm } from './login/components/ForgotPasswordForm';
import { AuthLoadingOverlay } from './login/components/AuthLoadingOverlay';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const valueProps = [
  {
    Icon: IconShieldCheck,
    title: 'Private & Secure',
    desc: 'Local-first cache + cloud encrypted sync',
  },
  {
    Icon: IconDeviceLaptop,
    title: 'Cross-Device Hub',
    desc: 'Instant real-time sync across your devices',
  },
  {
    Icon: IconBolt,
    title: 'Lightning Fast',
    desc: 'Keyboard-first workflow & optimistic updates',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background text-text-primary relative overflow-hidden selection:bg-primary/20">
      {/* Ambient background glows */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full -top-32 -left-32 bg-primary/10 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute w-[450px] h-[450px] rounded-full -bottom-32 -right-32 bg-accent-identity/10 blur-[120px] pointer-events-none"
      />

      {/* Main Split Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-[1020px] min-h-[620px] flex flex-col md:flex-row bg-surface rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-float)] overflow-hidden relative z-10"
      >
        {/* ── LEFT SHOWCASE PANEL (Desktop only) ── */}
        <div className="hidden md:flex flex-col justify-between w-[44%] shrink-0 p-8 lg:p-10 bg-surface-alt/70 border-r border-border relative overflow-hidden">
          {/* Subtle inner decorative glow */}
          <div className="absolute w-[280px] h-[280px] rounded-full -top-12 -right-12 bg-primary/5 blur-[60px] pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-[14px] overflow-hidden shadow-sm flex items-center justify-center">
              <AppLogo className="w-full h-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] tracking-tight text-text-primary leading-none">
                Personal HQ
              </span>
              <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mt-1">
                Workspace
              </span>
            </div>
          </div>

          {/* Center Brand Pitch & Value Props */}
          <div className="flex flex-col gap-6 my-auto py-6 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 mb-3">
                <IconSparkles size={13} />
                <span>Unified Productivity OS</span>
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-text-primary leading-tight">
                Organize your mind, elevate your daily flow.
              </h2>
              <p className="text-[13px] text-text-secondary leading-relaxed mt-2.5 font-medium">
                One unified space for your markdown notes, daily journals, habit loops, focus timers, link vault, and exams.
              </p>
            </div>

            {/* Value propositions */}
            <div className="flex flex-col gap-3 pt-1">
              {valueProps.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 p-2.5 rounded-[var(--radius-input)] bg-surface/80 border border-border-hairline shadow-subtle"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center shrink-0 mt-0.5 text-text-primary">
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-text-primary">
                      {title}
                    </span>
                    <span className="text-[11px] text-text-secondary leading-snug">
                      {desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Quote Badge */}
          <div className="relative z-10 pt-2 border-t border-border-hairline">
            <p className="text-[12px] text-text-tertiary italic leading-relaxed">
              "Focus is a muscle. Build the environment where deep work is effortless."
            </p>
          </div>
        </div>

        {/* ── RIGHT FORM CONTAINER ── */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-12 relative bg-surface">
          {/* Mobile Top Brand Header */}
          <div className="flex md:hidden items-center gap-2.5 mb-6 pb-4 border-b border-border">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
              <AppLogo className="w-full h-full" />
            </div>
            <span className="font-black text-lg tracking-tight text-text-primary">
              Personal HQ
            </span>
          </div>

          <div className="w-full max-w-[400px] mx-auto flex flex-col">
            {/* Segmented Tab Switcher (Visible in login & register modes) */}
            {authMode !== 'forgot' && (
              <div className="grid grid-cols-2 p-1 mb-6 rounded-full bg-surface-alt border border-border-alt relative">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`relative py-1.5 px-4 text-[13px] font-bold rounded-full transition-colors z-10 cursor-pointer ${
                    authMode === 'login'
                      ? 'text-text-on-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {authMode === 'login' && (
                    <motion.div
                      layoutId="activeAuthTab"
                      className="absolute inset-0 bg-primary rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`relative py-1.5 px-4 text-[13px] font-bold rounded-full transition-colors z-10 cursor-pointer ${
                    authMode === 'register'
                      ? 'text-text-on-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {authMode === 'register' && (
                    <motion.div
                      layoutId="activeAuthTab"
                      className="absolute inset-0 bg-primary rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">Create Account</span>
                </button>
              </div>
            )}

            {/* Dynamic Form Header */}
            {authMode !== 'forgot' && (
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                  {authMode === 'login' ? 'Welcome back' : 'Create workspace'}
                </h1>
                <p className="text-[13px] text-text-secondary mt-1 font-medium">
                  {authMode === 'login'
                    ? 'Enter your credentials to access your Personal HQ.'
                    : 'Set up your free, private productivity hub in seconds.'}
                </p>
              </div>
            )}

            {/* Form Views with Smooth Spring Transitions */}
            <AnimatePresence mode="wait">
              {authMode === 'login' && (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                >
                  <LoginForm
                    onSwitchToRegister={() => setAuthMode('register')}
                    onForgotPassword={() => setAuthMode('forgot')}
                    onAuthSuccess={handleAuthSuccess}
                  />
                </motion.div>
              )}

              {authMode === 'register' && (
                <motion.div
                  key="register-view"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                >
                  <RegisterForm
                    onSwitchToLogin={() => setAuthMode('login')}
                    onAuthSuccess={handleAuthSuccess}
                  />
                </motion.div>
              )}

              {authMode === 'forgot' && (
                <motion.div
                  key="forgot-view"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                >
                  <ForgotPasswordForm
                    onBackToLogin={() => setAuthMode('login')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Post-Auth Loading Overlay with App Logo */}
      <AnimatePresence>
        {isAuthenticating && (
          <AuthLoadingOverlay
            customMessage={
              authMode === 'register'
                ? 'Setting up your workspace…'
                : 'Signing in to Personal HQ…'
            }
            subMessage="Preparing your notes, tasks and habits…"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;