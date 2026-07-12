import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMail, IconLock, IconArrowRight } from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { Alert } from './Alert';
import { Field } from './InputField';
import { PrimaryBtn, GoogleBtn, Divider } from './Buttons';
import { mapError } from '../utils';

const softSpring = { type: 'spring' as const, stiffness: 200, damping: 28 };
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.15 } },
};
const itemIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: softSpring },
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
    setTimeout(() => setShaking(false), 550);
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
      transition={shaking ? { duration: 0.5 } : {}}
      noValidate
    >
      <AnimatePresence>
        {alert && <Alert key="al" message={alert.msg} type={alert.type} onClose={() => setAlert(null)} />}
      </AnimatePresence>
      <motion.div variants={stagger} initial="hidden" animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field id="login-email" label="Email" type="email" value={email}
          onChange={(v) => { setEmail(v); if (errs.email) setErrs((p) => ({ ...p, email: false })); }}
          placeholder="you@example.com" LeadIcon={IconMail} hasError={!!errs.email} />
        <Field id="login-password" label="Password" type="password" value={password}
          onChange={(v) => { setPassword(v); if (errs.password) setErrs((p) => ({ ...p, password: false })); }}
          placeholder="Enter your password" LeadIcon={IconLock} hasError={!!errs.password} />
        <motion.div variants={itemIn}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -2 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: '#f43f5e', width: 14, height: 14 }} />
            Remember me
          </label>
          <button type="button"
            style={{ fontSize: 13, fontWeight: 600, color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}>
            Forgot password?
          </button>
        </motion.div>
        <PrimaryBtn loading={loading} label="Log in" Icon={IconArrowRight} />
        <Divider />
        <GoogleBtn label="Continue with Google" />
        <motion.p variants={itemIn} style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: 0 }}>
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister}
            style={{ color: '#f43f5e', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign up
          </button>
        </motion.p>
      </motion.div>
    </motion.form>
  );
}
