import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMail, IconLock, IconEye, IconEyeOff,
  IconArrowRight, IconUserPlus, IconCheck,
  IconAlertCircle, IconInfoCircle, IconX,
  IconShieldCheck, IconDevices, IconBolt
} from '@tabler/icons-react';
import { useAuthStore } from '../store/useAuthStore';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
    <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
    <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
    <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
  </svg>
);

// ─── Spring configs ────────────────────────────────────────────────────────────

const spring = { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 };
const softSpring = { type: 'spring', stiffness: 200, damping: 28 };

// ─── Variants ─────────────────────────────────────────────────────────────────

const pageIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

const cardIn = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { ...spring, delay: 0.1 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.15 } },
};

const itemIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: softSpring },
};

// ─── Alert banner ──────────────────────────────────────────────────────────────

const alertConfig = {
  error:   { bg: '#fff1f2', border: '#f43f5e', text: '#be123c', Icon: IconAlertCircle },
  success: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', Icon: IconCheck },
  info:    { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', Icon: IconInfoCircle },
};

function Alert({
  message, type, onClose,
}: { message: string; type: 'error' | 'success' | 'info'; onClose: () => void }) {
  const c = alertConfig[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={spring}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px', borderRadius: 10, marginBottom: 16,
        background: c.bg, border: `1.5px solid ${c.border}`,
      }}
    >
      <c.Icon size={16} style={{ color: c.border, flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1, fontSize: 13, color: c.text, fontWeight: 500, lineHeight: 1.5 }}>
        {message}
      </span>
      <button type="button" onClick={onClose}
        style={{ color: c.text, opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
        <IconX size={14} />
      </button>
    </motion.div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function Field({
  id, label, type, value, onChange, placeholder, LeadIcon, hasError = false, hint,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  LeadIcon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  hasError?: boolean; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputType = type === 'password' ? (visible ? 'text' : 'password') : type;

  const borderColor = hasError ? '#f43f5e' : focused ? '#f43f5e' : '#e2e8f0';
  const shadow = focused ? (hasError ? '0 0 0 3px rgba(244,63,94,0.12)' : '0 0 0 3px rgba(244,63,94,0.1)') : 'none';

  return (
    <motion.div variants={itemIn} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <LeadIcon
          size={16}
          style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: hasError ? '#f43f5e' : focused ? '#f43f5e' : '#94a3b8',
            transition: 'color 0.18s', pointerEvents: 'none',
          }}
        />
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '11px 40px 11px 38px',
            borderRadius: 10, fontSize: 14, outline: 'none',
            background: hasError ? '#fff5f5' : focused ? '#fff' : '#f8fafc',
            border: `1.5px solid ${borderColor}`,
            color: '#0f172a',
            boxShadow: shadow,
            transition: 'all 0.18s',
          }}
        />
        {type === 'password' && (
          <button type="button" tabIndex={-1}
            onClick={() => setVisible(!visible)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', padding: 2,
            }}
          >
            {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        )}
      </div>
      {hint && !hasError && (
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{hint}</span>
      )}
    </motion.div>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────

function PrimaryBtn({ loading, label, Icon }: { loading: boolean; label: string; Icon: React.ComponentType<{size?: number}> }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      variants={itemIn}
      whileHover={!loading ? { scale: 1.015, boxShadow: '0 8px 24px rgba(244,63,94,0.35)' } : {}}
      whileTap={!loading ? { scale: 0.975 } : {}}
      style={{
        width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
        background: loading ? '#fda4af' : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        position: 'relative', overflow: 'hidden', letterSpacing: '0.2px',
        boxShadow: loading ? 'none' : '0 4px 14px rgba(244,63,94,0.25)',
        transition: 'background 0.2s',
      }}
    >
      {/* Shimmer sweep */}
      <motion.span
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
          x: '-100%',
        }}
        whileHover={{ x: '200%', transition: { duration: 0.55 } }}
      />
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', fontSize: 16 }}>⟳</motion.span>
            Processing…
          </motion.span>
        ) : (
          <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon size={16} />{label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Google Button ────────────────────────────────────────────────────────────

function GoogleBtn({ label }: { label: string }) {
  return (
    <motion.button type="button" whileHover={{ scale: 1.01, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%', padding: '11px 0', borderRadius: 10, border: '1.5px solid #e2e8f0',
        background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all 0.18s',
      }}
    >
      <GoogleIcon />{label}
    </motion.button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>or continue with</span>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    </div>
  );
}

// ─── Error mapper ─────────────────────────────────────────────────────────────

function mapError(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('invalid login credentials') || r.includes('invalid credentials'))
    return 'Incorrect email or password. Please try again.';
  if (r.includes('email not confirmed'))
    return 'Confirm your email first — check your inbox for the confirmation link.';
  if (r.includes('user already registered') || r.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (r.includes('password should be at least'))
    return 'Password must be at least 6 characters long.';
  if (r.includes('unable to validate email'))
    return 'Please enter a valid email address.';
  if (r.includes('rate limit') || r.includes('too many'))
    return 'Too many attempts. Wait a moment and try again.';
  if (r.includes('network') || r.includes('fetch'))
    return 'Network error — check your internet connection.';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
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

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
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
        <Divider />
        <GoogleBtn label="Continue with Google" />
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

// ─── Feature badges ───────────────────────────────────────────────────────────

const features = [
  { Icon: IconShieldCheck, text: 'Private & Secure' },
  { Icon: IconDevices,     text: 'Cross-Device Sync' },
  { Icon: IconBolt,        text: 'Fast & Lightweight' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export const LoginPage = ({ onLoginSuccess: _onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(150deg, #fdf2f8 0%, #f8f9ff 50%, #f0f9ff 100%)',
        padding: '24px 16px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Ambient glow blobs */}
      <motion.div animate={{ scale: [1,1.1,1], opacity:[0.4,0.6,0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position:'absolute', width:500, height:500, borderRadius:'50%', top:-150, left:-150,
          background:'radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)',
          filter:'blur(40px)', pointerEvents:'none' }} />
      <motion.div animate={{ scale: [1,1.08,1], opacity:[0.3,0.5,0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position:'absolute', width:400, height:400, borderRadius:'50%', bottom:-100, right:-100,
          background:'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
          filter:'blur(40px)', pointerEvents:'none' }} />

      {/* ── Outer card wrapper ── */}
      <motion.div variants={cardIn}
        style={{
          width: '100%', maxWidth: 980,
          background: '#fff', borderRadius: 24,
          boxShadow: '0 24px 64px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden', display: 'flex',
          flexDirection: 'row',
          minHeight: 600,
        }}
      >
        {/* ── LEFT COLUMN: Branding + Illustration ── */}
        <div style={{
          width: '38%', minWidth: 0, flexShrink: 0,
          background: 'linear-gradient(160deg, #fff5f7 0%, #fff0f5 50%, #fdf4ff 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: 32, position: 'relative', overflow: 'hidden',
        }}
          className="auth-left-panel"
        >
          {/* Decorative circle */}
          <div style={{
            position:'absolute', width:300, height:300, borderRadius:'50%',
            top:-80, right:-80,
            background:'radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)',
            pointerEvents:'none',
          }} />

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
            <div style={{
              width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg, #f43f5e, #e11d48)',
              boxShadow:'0 4px 12px rgba(244,63,94,0.3)', flexShrink:0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight:800, fontSize:16, color:'#0f172a', letterSpacing:'-0.3px' }}>Personal HQ</span>
          </div>

          {/* Illustration */}
          <motion.div
            animate={{ y:[0,-10,0] }}
            transition={{ duration:3.5, ease:'easeInOut', repeat:Infinity }}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, padding:'20px 0', position:'relative', zIndex:1 }}
          >
            <img src="/login-hero.png" alt="Personal HQ dashboard illustration"
              style={{ width:'100%', maxWidth:260, height:'auto', objectFit:'contain',
                filter:'drop-shadow(0 16px 32px rgba(244,63,94,0.15))' }}
              onError={(e) => { e.currentTarget.style.display='none'; }}
            />
          </motion.div>

          {/* Quote card */}
          <div style={{
            background:'#fff', borderRadius:14, padding:'16px 18px', position:'relative', zIndex:1,
            boxShadow:'0 4px 16px rgba(0,0,0,0.06)', border:'1px solid rgba(244,63,94,0.08)',
          }}>
            <div style={{ display:'flex', gap:2, marginBottom:8 }}>
              {[0,1,2,3,4].map((i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f43f5e" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p style={{ fontSize:13, color:'#475569', lineHeight:1.6, margin:0, fontStyle:'italic' }}>
              "Organize your life, stay productive, and achieve more every day."
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#f43f5e,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:11, color:'#fff', fontWeight:700 }}>P</span>
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8' }}>Personal HQ</span>
            </div>
          </div>

          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:16, position:'relative', zIndex:1 }}>
            {features.map(({ Icon, text }) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{
                  width:26, height:26, borderRadius:8, background:'rgba(244,63,94,0.08)',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  <Icon size={14} style={{ color:'#f43f5e' }} />
                </div>
                <span style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Forms ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', minHeight:600 }}>

          {/* ── UNIFIED FORM PANEL ── */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 36px', position:'relative' }}>
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div key="login"
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                  transition={softSpring}
                  style={{ width:'100%', maxWidth: 400, margin:'0 auto' }}
                >
                  <h1 style={{ fontSize:26, fontWeight:800, color:'#0f172a', marginBottom:4 }}>
                    Welcome back 👋
                  </h1>
                  <p style={{ fontSize:14, color:'#64748b', marginBottom:32 }}>
                    Log in to access your Personal HQ dashboard
                  </p>
                  <LoginForm onSwitchToRegister={() => setMode('register')} />
                </motion.div>
              ) : (
                <motion.div key="register"
                  initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                  transition={softSpring}
                  style={{ width:'100%', maxWidth: 400, margin:'0 auto' }}
                >
                  <h2 style={{ fontSize:26, fontWeight:800, color:'#0f172a', marginBottom:4 }}>
                    Create{' '}
                    <span style={{ background:'linear-gradient(135deg, #f43f5e, #a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      your account
                    </span>
                  </h2>
                  <p style={{ fontSize:14, color:'#64748b', marginBottom:32 }}>
                    Sign up to get started with Personal HQ
                  </p>
                  <RegisterForm onSwitchToLogin={() => setMode('login')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
