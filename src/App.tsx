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
const JournalModule = lazy(() => import('./modules/journal/JournalModule'));
const TodoModule = lazy(() => import('./modules/todo/TodoModule'));

function LoadingSplash() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--bg-background)' }}
    >
      {/* Premium Circular Dash Progress Loader */}
      <div className="relative w-20 h-20">
        <svg className="w-full h-full animate-spin" style={{ animationDuration: '1.2s' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="var(--border-border-alt)" strokeWidth="6" fill="none" opacity="0.3" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="var(--text-primary)"
            strokeWidth="6"
            strokeDasharray="60 200"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Spaced "Loading" Text */}
      <div className="text-xs uppercase tracking-[0.4em] font-semibold text-text-secondary select-none">
        Loading
      </div>

      {/* 3 dots loading animation */}
      <div className="flex justify-center items-center gap-1.5 mt-1">
        {[0, 1, 2].map((idx) => (
          <motion.span
            key={idx}
            animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-text-secondary"
          />
        ))}
      </div>
    </motion.div>
  );
}

function ModuleFallback() {
  return (
    <div className="min-h-[320px] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <svg className="w-full h-full animate-spin" style={{ animationDuration: '1.2s' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="var(--border-border-alt)" strokeWidth="6" fill="none" opacity="0.3" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="var(--text-primary)"
            strokeWidth="6"
            strokeDasharray="60 200"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-text-muted">Loading module</div>
    </div>
  );
}

function App() {
  const { user, initialized, initialize } = useAuthStore();
  const { theme, loadAllData, clearAllData, dataLoaded } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    applyTheme();
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', applyTheme);
      return () => media.removeEventListener('change', applyTheme);
    }
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
      case 'journal': return <JournalModule />;
      case 'calculator': return <CalculatorModule />;
      case 'media': return <MediaModule />;
      case 'countdown': return <CountdownModule />;
      case 'snippets': return <CodeSnippetModule />;
      case 'pomodoro': return <PomodoroModule />;
      case 'todo': return <TodoModule />;
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
