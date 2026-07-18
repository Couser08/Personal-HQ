import { lazy, Suspense, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';

const DashboardModule = lazy(() => import('./modules/dashboard/DashboardModule'));
const ProjectsModule = lazy(() => import('./modules/projects/ProjectsModule'));
const UtilitiesModule = lazy(() => import('./modules/utilities/UtilitiesModule'));
const BudgetModule = lazy(() => import('./modules/budget/BudgetModule'));
const StudyModule = lazy(() => import('./modules/study/StudyModule'));
const MediaModule = lazy(() => import('./modules/media/MediaModule'));
const CodeSnippetModule = lazy(() => import('./modules/snippets/CodeSnippetModule'));
const SettingsModule = lazy(() => import('./modules/settings/SettingsModule'));
const ProfileModule = lazy(() => import('./modules/profile/ProfileModule'));
const PomodoroModule = lazy(() => import('./modules/pomodoro/PomodoroModule'));
const TodoModule = lazy(() => import('./modules/todo/TodoModule'));
const HabitTrackerModule = lazy(() => import('./modules/habits/HabitTrackerModule'));
const MindmapModule = lazy(() => import('./modules/mindmap/MindmapModule'));
const JournalModule = lazy(() => import('./modules/journal/JournalModule'));
const DrawingModule = lazy(() => import('./modules/drawing/DrawingModule'));
const MarkdownModule = lazy(() => import('./modules/markdown/MarkdownModule'));
const ConditionModule = lazy(() => import('./modules/condition/ConditionModule'));
const AdminModule = lazy(() => import('./modules/admin/AdminModule'));
const TilModule = lazy(() => import('./modules/til/TilModule'));
const BooksModule = lazy(() => import('./modules/books/BooksModule'));
const DesignLabPage = lazy(() => import('./pages/design-lab/DesignLabPage'));

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
    <div className="w-full flex flex-col gap-6 animate-pulse p-4 text-left">
      {/* Premium Apple-style Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 shimmer-skeleton rounded-lg" />
          <div className="h-4 w-72 shimmer-skeleton rounded-md" />
        </div>
        <div className="h-10 w-36 shimmer-skeleton rounded-xl" />
      </div>

      {/* Grid Content Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Main Card Skeleton */}
          <div className="h-48 shimmer-skeleton rounded-[24px]" />
          
          {/* List Skeletons */}
          <div className="flex flex-col gap-3">
            <div className="h-5 w-32 shimmer-skeleton rounded-md" />
            <div className="h-14 shimmer-skeleton rounded-2xl" />
            <div className="h-14 shimmer-skeleton rounded-2xl" />
            <div className="h-14 shimmer-skeleton rounded-2xl" />
          </div>
        </div>

        {/* Sidebar Skeletons */}
        <div className="flex flex-col gap-5">
          <div className="h-40 shimmer-skeleton rounded-[24px]" />
          <div className="h-64 shimmer-skeleton rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}

function App() {
  const isDesignLab = typeof window !== 'undefined' && window.location.search.includes('design_lab=true');

  const { user, initialized, initialize } = useAuthStore();
  const { theme, settings, loadAllData, clearAllData, dataLoaded } = useAppStore(useShallow(state => ({
    theme: state.theme,
    settings: state.settings,
    loadAllData: state.loadAllData,
    clearAllData: state.clearAllData,
    dataLoaded: state.dataLoaded
  })));

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (settings?.reduceBlur) {
      document.documentElement.classList.add('reduce-blur');
    } else {
      document.documentElement.classList.remove('reduce-blur');
    }
  }, [settings?.reduceBlur]);

  useEffect(() => {
    const applyTheme = () => {
      // Clear previous classes
      document.documentElement.classList.remove('dark', 'cyberpunk', 'nordic', 'sakura', 'auraglass');
      
      const isSystemDark = theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDarkTheme = theme === 'dark' || theme === 'cyberpunk' || theme === 'nordic' || theme === 'auraglass';
      
      if (isDarkTheme || isSystemDark) {
        document.documentElement.classList.add('dark');
      }
      
      if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
        document.documentElement.classList.add(theme);
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

  if (isDesignLab) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Loading Design Lab...</div>}>
        <DesignLabPage />
      </Suspense>
    );
  }

  if (!initialized) {
    return <AnimatePresence><LoadingSplash key="splash" /></AnimatePresence>;
  }

  return (
    <MotionConfig reducedMotion={settings?.reduceAnimations ? "always" : "user"}>
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
    </MotionConfig>
  );
}

function AppContent() {
  const activeModule = useAppStore((state) => state.activeModule);

  const renderModule = () => {
    const { user } = useAuthStore.getState();
    const isAdmin = user?.email === 'tungariyarahul08@gmail.com';

    switch (activeModule) {
      case 'dashboard': return <DashboardModule />;
      case 'books': return <BooksModule />;
      case 'journal': return <JournalModule />;
      case 'projects': return <ProjectsModule />;
      case 'utilities': return <UtilitiesModule />;
      case 'budget': return <BudgetModule />;
      case 'study': return <StudyModule />;
      case 'media': return <MediaModule />;
      case 'snippets': return <CodeSnippetModule />;
      case 'til': return <TilModule />;
      case 'pomodoro': return <PomodoroModule />;
      case 'todo': return <TodoModule />;
      case 'habits': return <HabitTrackerModule />;
      case 'settings': return <SettingsModule />;
      case 'profile': return <ProfileModule />;
      case 'mindmap': return <MindmapModule />;
      case 'drawing': return <DrawingModule />;
      case 'markdown': return <MarkdownModule />;
      case 'condition': return <ConditionModule />;
      case 'admin': return isAdmin ? <AdminModule /> : <DashboardModule />;
      default: return <DashboardModule />;
    }
  };

  return (
    <>
      <Layout>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.985 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 30,
              mass: 0.8
            }}
            className="w-full"
            style={{ willChange: 'transform, opacity' }}
          >
            <Suspense fallback={<ModuleFallback />}>{renderModule()}</Suspense>
          </motion.div>
        </AnimatePresence>
      </Layout>
      <ConfirmDialog />
    </>
  );
}

export default App;
