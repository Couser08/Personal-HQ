import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMail, IconLock, IconArrowRight, IconSparkles } from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { Alert } from './Alert';
import { Field } from './InputField';
import { PrimaryBtn } from './Buttons';
import { mapError } from '../utils';

// Snappier spring animations for that premium feel
const softSpring = { type: 'spring' as const, stiffness: 400, damping: 30 };
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const itemIn = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: softSpring },
};

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shaking, setShaking] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const { signIn, loading } = useAuthStore();

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }, []);

  const err = useCallback((msg: string, fields: string[] = []) => {
    setAlert({ msg, type: 'error' });
    const e: Record<string, boolean> = {};
    fields.forEach((f) => { e[f] = true; });
    setErrs(e);
    shake();
  }, [shake]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!email.trim()) { err('Please enter your email address.', ['email']); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { err('Please enter a valid email address.', ['email']); return; }
    if (!password) { err('Please enter your password.', ['password']); return; }

    setAlert({ msg: 'Signing you in…', type: 'info' });
    const { error } = await signIn(email.trim(), password);
    if (error) { err(mapError(error), ['email', 'password']); return; }
    setAlert({ msg: 'Welcome back! 🎉', type: 'success' });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shaking ? { x: [0, -8, 8, -8, 6, -4, 0] } : { x: 0 }}
      transition={shaking ? { duration: 0.4 } : {}}
      noValidate
      className="relative w-full mx-auto"
    >
      {/* Background glow effect behind the form */}
      <div className="absolute -top-24 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-primary-muted/5 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {alert && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            className="mb-4 relative z-20"
          >
            <Alert message={alert.msg} type={alert.type} onClose={() => setAlert(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={stagger} 
        initial="hidden" 
        animate="visible"
        className="relative z-10 flex flex-col gap-6 bg-white/60 dark:bg-[#111113]/60 backdrop-blur-2xl p-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-zinc-200/40 dark:shadow-black/60"
      >
        <motion.div variants={itemIn} className="text-center mb-2">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            Welcome Back <IconSparkles className="w-6 h-6 text-primary" />
          </h2>
          <p className="text-[14px] text-zinc-500 font-medium mt-1">Enter your details to sign in.</p>
        </motion.div>

        <motion.div variants={itemIn} className="flex flex-col gap-4">
          <Field 
            id="login-email" 
            label="Email" 
            type="email" 
            value={email}
            onChange={(v) => { setEmail(v); if (errs.email) setErrs((p) => ({ ...p, email: false })); }}
            placeholder="you@example.com" 
            LeadIcon={IconMail} 
            hasError={!!errs.email} 
          />
          <Field 
            id="login-password" 
            label="Password" 
            type="password" 
            value={password}
            onChange={(v) => { setPassword(v); if (errs.password) setErrs((p) => ({ ...p, password: false })); }}
            placeholder="Enter your password" 
            LeadIcon={IconLock} 
            hasError={!!errs.password} 
          />
        </motion.div>

        <motion.div variants={itemIn} className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2.5 text-[13px] font-bold text-zinc-500 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="peer appearance-none w-4 h-4 rounded border-2 border-zinc-300 dark:border-zinc-700 checked:bg-primary checked:border-primary bg-transparent transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:outline-none" 
              />
              <IconLock className="w-2.5 h-2.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">Remember me</span>
          </label>
          <button 
            type="button"
            className="text-[13px] font-bold text-primary hover:text-primary-muted transition-colors bg-transparent border-none cursor-pointer"
          >
            Forgot password?
          </button>
        </motion.div>

        <motion.div variants={itemIn} className="flex flex-col gap-4 mt-2">
          <PrimaryBtn loading={loading} label="Log in" Icon={IconArrowRight} />
          
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800/80"></div>
            <span className="shrink-0 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Or</span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800/80"></div>
          </div>
        </motion.div>

        <motion.p variants={itemIn} className="text-center text-[13px] font-medium text-zinc-500 mt-2">
          Don't have an account?{' '}
          <button 
            type="button" 
            onClick={onSwitchToRegister}
            className="text-rose-500 font-bold hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-transparent border-none cursor-pointer"
          >
            Sign up
          </button>
        </motion.p>
      </motion.div>
    </motion.form>
  );
}