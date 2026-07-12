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

const spring = { type: 'spring' as const, stiffness: 350, damping: 30, mass: 0.8 };
const softSpring = { type: 'spring' as const, stiffness: 200, damping: 28 };

const cardIn = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { ...spring, delay: 0.1 } },
};

const features = [
  { Icon: IconShieldCheck, text: 'Private & Secure' },
  { Icon: IconDevices,     text: 'Cross-Device Sync' },
  { Icon: IconBolt,        text: 'Fast & Lightweight' },
];

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
            <AppLogo className="w-9 h-9 flex-shrink-0" />
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
