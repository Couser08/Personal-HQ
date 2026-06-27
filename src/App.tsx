import { useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

import NotesModule from './modules/notes/NotesModule';
import LinksModule from './modules/links/LinksModule';
import StocksModule from './modules/stocks/StocksModule';
import StudyModule from './modules/study/StudyModule';
import CalculatorModule from './modules/calculator/CalculatorModule';
import MediaModule from './modules/media/MediaModule';
import CountdownModule from './modules/countdowns/CountdownModule';
import CodeSnippetModule from './modules/snippets/CodeSnippetModule';
import SettingsModule from './modules/settings/SettingsModule';
import ProfileModule from './modules/profile/ProfileModule';

// ─── Loading Splash ────────────────────────────────────────────────────────────

function LoadingSplash() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg-background)' }}
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white"
        style={{ background: '#f43f5e', boxShadow: '0 8px 32px rgba(244,63,94,0.4)' }}
      >
        P
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-sm font-medium"
        style={{ color: '#9ca3af' }}
      >
        Loading Personal HQ…
      </motion.div>
    </motion.div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const { user, initialized, initialize, loading: authLoading } = useAuthStore();
  const { theme, loadAllData, clearAllData, dataLoaded } = useAppStore();

  // Boot: resolve Supabase session once
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync theme to <html> class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load all user data when user signs in
  useEffect(() => {
    if (user && !dataLoaded) {
      loadAllData(user.id).catch(console.error);
    }
    if (!user) {
      clearAllData();
    }
  }, [user, dataLoaded, loadAllData, clearAllData]);

  // Show splash while resolving session
  if (!initialized) {
    return (
      <AnimatePresence>
        <LoadingSplash key="splash" />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3 }}
        >
          <LoginPage onLoginSuccess={() => {}} />
          <ConfirmDialog />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <AppContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Separate component so hooks run after user is confirmed
function AppContent() {
  const activeModule = useAppStore((state) => state.activeModule);

  const renderModule = () => {
    switch (activeModule) {
      case 'notes': return <NotesModule />;
      case 'links': return <LinksModule />;
      case 'stocks': return <StocksModule />;
      case 'study': return <StudyModule />;
      case 'calculator': return <CalculatorModule />;
      case 'media': return <MediaModule />;
      case 'countdown': return <CountdownModule />;
      case 'snippets': return <CodeSnippetModule />;
      case 'settings': return <SettingsModule />;
      case 'profile': return <ProfileModule />;
      default: return <NotesModule />;
    }
  };

  return (
    <>
      <Layout>{renderModule()}</Layout>
      <ConfirmDialog />
    </>
  );
}

export default App;
