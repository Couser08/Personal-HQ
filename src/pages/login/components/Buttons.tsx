import { motion, AnimatePresence } from 'framer-motion';

const softSpring = { type: 'spring' as const, stiffness: 200, damping: 28 };
const itemIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: softSpring },
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
    <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
    <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
    <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
  </svg>
);

export function PrimaryBtn({ loading, label, Icon }: { loading: boolean; label: string; Icon: React.ComponentType<{size?: number}> }) {
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

export function GoogleBtn({ label }: { label: string }) {
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

export function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>or continue with</span>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    </div>
  );
}
