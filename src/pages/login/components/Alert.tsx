import { motion } from 'framer-motion';
import { IconAlertCircle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';

const alertConfig = {
  error:   { bg: '#fff1f2', border: '#f43f5e', text: '#be123c', Icon: IconAlertCircle },
  success: { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', Icon: IconCheck },
  info:    { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', Icon: IconInfoCircle },
};

const spring = { type: 'spring' as const, stiffness: 350, damping: 30, mass: 0.8 };

export function Alert({
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
