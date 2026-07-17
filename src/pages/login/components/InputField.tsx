import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

// Slightly tighter spring to mimic iOS/macOS physics
const appleSpring = { type: 'spring' as const, stiffness: 350, damping: 32 };
const itemIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: appleSpring },
};

export function Field({
  id, label, type, value, onChange, placeholder, LeadIcon, hasError = false, hint,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  LeadIcon: React.ComponentType<{ size?: number; className?: string }>;
  hasError?: boolean; hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const inputType = type === 'password' ? (visible ? 'text' : 'password') : type;

  return (
    <motion.div variants={itemIn} className="flex flex-col w-full gap-1.5">
      {label && (
        <label htmlFor={id} className="ml-1 text-[13px] font-medium text-gray-600">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {/* Lead Icon */}
        <LeadIcon 
          size={18} 
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
            hasError 
              ? 'text-red-500' 
              : 'text-gray-400 group-focus-within:text-primary'
          }`} 
        />
        
        {/* Input */}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
          aria-invalid={hasError ? "true" : "false"}
          className={`
            w-full box-border px-10 py-2.5 text-[15px] rounded-[12px] 
            transition-all duration-200 ease-out outline-none border
            ${hasError 
              ? 'bg-red-50 border-red-500 text-red-900 focus:ring-4 focus:ring-red-500/20' 
              : 'bg-gray-50/80 border-gray-200 text-gray-900 shadow-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/15'
            }
          `}
        />
        
        {/* Password Toggle */}
        {type === 'password' && (
          <button 
            type="button" 
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none rounded-md focus-visible:ring-2 focus-visible:ring-primary/45"
          >
            {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        )}
      </div>
      
      {/* Hint Text */}
      {hint && !hasError && (
        <span className="ml-1 text-[12px] text-gray-500">{hint}</span>
      )}
    </motion.div>
  );
}