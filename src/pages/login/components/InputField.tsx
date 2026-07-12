import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

const softSpring = { type: 'spring' as const, stiffness: 200, damping: 28 };
const itemIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: softSpring },
};

export function Field({
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
