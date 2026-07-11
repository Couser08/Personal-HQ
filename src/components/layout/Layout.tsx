import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Sidebar, MobileBottomNav } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { AppTour } from './AppTour';
import { UpdatePopup } from '../ui/UpdatePopup';
import { MediaEntryModal } from '../ui/MediaEntryModal';
import { TodoProjectModal } from '../ui/TodoProjectModal';
import { TodoTaskModal } from '../ui/TodoTaskModal';
import { JournalNoticeModal } from '../ui/JournalNoticeModal';
import { DynamicIsland, triggerDynamicIsland } from '../ui/DynamicIsland';
import { CommandPalette } from '../ui/CommandPalette';
import { TaskFocusIsland } from '../ui/TaskFocusIsland';
import { WavyEffectOverlay } from '../ui/WavyEffectOverlay';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isFocusMode, setIsFocusMode] = useState(() => localStorage.getItem('phq_focus_mode') === 'true');

  useEffect(() => {
    const checkFocusMode = () => {
      setIsFocusMode(localStorage.getItem('phq_focus_mode') === 'true');
    };
    window.addEventListener('phq-focus-mode-change', checkFocusMode);
    return () => window.removeEventListener('phq-focus-mode-change', checkFocusMode);
  }, []);

  return (
    <div className={`flex h-screen bg-background overflow-hidden text-text-primary ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* Desktop/Tablet sidebar */}
      {!isFocusMode && <Sidebar />}

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Toggle focus mode banner if active so user can exit */}
        {isFocusMode && (
          <div className="fixed bottom-4 right-4 z-9997">
            <button
              onClick={() => {
                localStorage.setItem('phq_focus_mode', 'false');
                window.dispatchEvent(new Event('phq-focus-mode-change'));
                triggerDynamicIsland('Focus Mode Off', 'Sidebar visible', 'success', 'award');
              }}
              className="px-3.5 py-1.5 bg-black hover:bg-stone-900 border border-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 cursor-pointer"
            >
              Exit Focus Mode
            </button>
          </div>
        )}
        <div className={`main-content-area p-6 lg:p-8 max-w-7xl mx-auto min-h-full transition-all duration-300 ${isFocusMode ? 'opacity-95 max-w-4xl py-12' : ''}`}>
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      {!isFocusMode && <MobileBottomNav />}

      {/* Dynamic notifications & overlay widgets */}
      <DynamicIsland />
      <TaskFocusIsland />
      <CommandPalette />

      {/* Toast notifications */}
      <ToastContainer />
      <AppTour />
      <UpdatePopup />
      <MediaEntryModal />
      <TodoProjectModal />
      <TodoTaskModal />
      <JournalNoticeModal />
      <WavyEffectOverlay />
    </div>
  );
};
