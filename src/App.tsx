import { lazy, Suspense, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const NotesModule = lazy(() => import('./modules/notes/NotesModule'));
const LinksModule = lazy(() => import('./modules/links/LinksModule'));
const BudgetModule = lazy(() => import('./modules/budget/BudgetModule'));
const StudyModule = lazy(() => import('./modules/study/StudyModule'));
const CalculatorModule = lazy(() => import('./modules/calculator/CalculatorModule'));
const MediaModule = lazy(() => import('./modules/media/MediaModule'));
const CountdownModule = lazy(() => import('./modules/countdowns/CountdownModule'));
const CodeSnippetModule = lazy(() => import('./modules/snippets/CodeSnippetModule'));
const SettingsModule = lazy(() => import('./modules/settings/SettingsModule'));
const ProfileModule = lazy(() => import('./modules/profile/ProfileModule'));
const PomodoroModule = lazy(() => import('./modules/pomodoro/PomodoroModule'));

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
        Loading Personal HQ...
      </motion.div>
    </motion.div>
  );
}

function ModuleFallback() {
  return <div className="min-h-[320px] flex items-center justify-center text-sm text-text-secondary">Loading module...</div>;
}

function App() {
  const { user, initialized, initialize } = useAuthStore();
  const { theme, loadAllData, clearAllData, dataLoaded } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (user && !dataLoaded) {
      loadAllData(user.id).catch((error) => console.error('Failed to load user data', error));
    }
    if (!user) clearAllData();
  }, [user, dataLoaded, loadAllData, clearAllData]);

  if (!initialized) {
    return <AnimatePresence><LoadingSplash key="splash" /></AnimatePresence>;
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }}>
          <LoginPage onLoginSuccess={() => {}} />
          <ConfirmDialog />
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <AppContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AppContent() {
  const activeModule = useAppStore((state) => state.activeModule);

  const renderModule = () => {
    switch (activeModule) {
      case 'notes': return <NotesModule />;
      case 'links': return <LinksModule />;
      case 'budget': return <BudgetModule />;
      case 'study': return <StudyModule />;
      case 'calculator': return <CalculatorModule />;
      case 'media': return <MediaModule />;
      case 'countdown': return <CountdownModule />;
      case 'snippets': return <CodeSnippetModule />;
      case 'pomodoro': return <PomodoroModule />;
      case 'settings': return <SettingsModule />;
      case 'profile': return <ProfileModule />;
      default: return <NotesModule />;
    }
  };

  return (
    <>
      <Layout>
        <Suspense fallback={<ModuleFallback />}>{renderModule()}</Suspense>
      </Layout>
      <ConfirmDialog />
    </>
  );
}

export default App;
