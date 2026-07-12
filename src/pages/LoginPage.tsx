import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconShieldCheck, IconDevices, IconBolt } from '@tabler/icons-react';
import { AppLogo } from '../components/ui/AppLogo';
import { LoginForm } from './login/components/LoginForm';
import { RegisterForm } from './login/components/RegisterForm';

const pageIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

// Apple-style snappy spring physics
const appleSpring = { type: 'spring' as const, stiffness: 350, damping: 32, mass: 0.8 };
const softSpring = { type: 'spring' as const, stiffness: 200, damping: 28 };

const cardIn = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { ...appleSpring, delay: 0.1 } },
};

const features = [
  { Icon: IconShieldCheck, text: 'Private & Secure' },
  { Icon: IconDevices,     text: 'Cross-Device Sync' },
  { Icon: IconBolt,        text: 'Fast & Lightweight' },
];

export const LoginPage = ({ onLoginSuccess: _onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <motion.div 
      variants={pageIn} 
      initial="hidden" 
      animate="visible"
      className="min-h-dvh flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200"
    >
      {/* Ambient glow blobs - Apple style subtle blurs */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full -top-[150px] -left-[150px] bg-pink-500/10 blur-[80px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute w-[400px] h-[400px] rounded-full -bottom-[100px] -right-[100px] bg-purple-500/10 blur-[80px] pointer-events-none" 
      />

      {/* ── Outer card wrapper ── */}
      <motion.div 
        variants={cardIn}
        className="w-full max-w-[980px] min-h-[600px] flex flex-col md:flex-row bg-white/70 backdrop-blur-2xl rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        {/* ── LEFT COLUMN: Branding + Illustration ── */}
        <div className="hidden md:flex flex-col justify-between w-[38%] shrink-0 p-8 relative overflow-hidden bg-gradient-to-br from-slate-50/50 to-slate-100/50 border-r border-slate-200/50">
          
          {/* Decorative circle */}
          <div className="absolute w-[300px] h-[300px] rounded-full -top-[80px] -right-[80px] bg-pink-500/5 blur-[40px] pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <AppLogo className="w-9 h-9 shrink-0" />
            <span className="font-extrabold text-[16px] text-slate-900 tracking-tight">Personal HQ</span>
          </div>

          {/* Illustration */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            className="flex items-center justify-center flex-1 py-5 relative z-10"
          >
            <img 
              src="/login-hero.png" 
              alt="Personal HQ dashboard illustration"
              className="w-full max-w-[260px] h-auto object-contain drop-shadow-xl"
              onError={(e) => { e.currentTarget.style.display='none'; }}
            />
          </motion.div>

          {/* Quote card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 relative z-10 shadow-sm border border-slate-100">
            <div className="flex gap-0.5 mb-2">
              {[0,1,2,3,4].map((i) => (
                <svg key={i} className="w-3 h-3 text-pink-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed italic m-0">
              "Organize your life, stay productive, and achieve more every day."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-sm">
                <span className="text-[11px] text-white font-bold">P</span>
              </div>
              <span className="text-[12px] font-semibold text-slate-400">Personal HQ</span>
            </div>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-2 mt-5 relative z-10">
            {features.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <div className="w-[26px] h-[26px] rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-pink-500" />
                </div>
                <span className="text-[12px] text-slate-500 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Forms ── */}
        <div className="flex-1 flex flex-col relative min-h-[600px] bg-white/40">
          <div className="flex-1 flex flex-col justify-center p-8 sm:p-10 relative">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: -15 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 15 }}
                  transition={softSpring}
                  className="w-full max-w-[400px] mx-auto"
                >
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
                    Welcome back 👋
                  </h1>
                  <p className="text-[15px] text-slate-500 mb-8">
                    Log in to access your Personal HQ dashboard
                  </p>
                  <LoginForm onSwitchToRegister={() => setMode('register')} />
                </motion.div>
              ) : (
                <motion.div 
                  key="register"
                  initial={{ opacity: 0, x: 15 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -15 }}
                  transition={softSpring}
                  className="w-full max-w-[400px] mx-auto"
                >
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
                    Create{' '}
                    <span className="bg-gradient-to-br from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      your account
                    </span>
                  </h2>
                  <p className="text-[15px] text-slate-500 mb-8">
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