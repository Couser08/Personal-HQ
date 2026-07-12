import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMail, IconLock, IconUserPlus } from '@tabler/icons-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { Alert } from './Alert';
import { Field } from './InputField';
import { PrimaryBtn } from './Buttons';
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

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const { signUp, loading } = useAuthStore();

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { err('Enter a valid email address.', ['email']); return; }
    if (!password) { err('Please create a password.', ['password']); return; }
    if (password.length < 6) { err('Password must be at least 6 characters.', ['password']); return; }
    if (password !== confirm) { err('Passwords do not match.', ['password', 'confirm']); return; }
    if (!agreed) { err('Please agree to the Terms of Service to continue.'); return; }

    setAlert({ msg: 'Creating your account…', type: 'info' });
    const { error } = await signUp(email.trim(), password);
    if (error) { err(mapError(error)); return; }
    setAlert({ msg: '🎉 Account created! Check your inbox to confirm your email, then sign in.', type: 'success' });
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
        style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <Field id="reg-email" label="Email" type="email" value={email}
          onChange={(v) => { setEmail(v); if (errs.email) setErrs((p) => ({ ...p, email: false })); }}
          placeholder="you@example.com" LeadIcon={IconMail} hasError={!!errs.email} />
        <Field id="reg-password" label="Password" type="password" value={password}
          onChange={(v) => { setPassword(v); if (errs.password) setErrs((p) => ({ ...p, password: false })); }}
          placeholder="Create a password (min. 6 chars)" LeadIcon={IconLock} hasError={!!errs.password} />
        <Field id="reg-confirm" label="Confirm Password" type="password" value={confirm}
          onChange={(v) => { setConfirm(v); if (errs.confirm) setErrs((p) => ({ ...p, confirm: false })); }}
          placeholder="Re-enter your password" LeadIcon={IconLock} hasError={!!errs.confirm} />
        <motion.div variants={itemIn}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#64748b', cursor: 'pointer', lineHeight: 1.5 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              style={{ accentColor: '#f43f5e', width: 14, height: 14, marginTop: 1, flexShrink: 0 }} />
            I agree to the{' '}
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>Privacy Policy</span>
          </label>
        </motion.div>
        <PrimaryBtn loading={loading} label="Create account" Icon={IconUserPlus} />
        <motion.p variants={itemIn} style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: 0 }}>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin}
            style={{ color: '#f43f5e', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            Log in
          </button>
        </motion.p>
      </motion.div>
    </motion.form>
  );
}
