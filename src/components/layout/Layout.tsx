import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileSlideDrawer } from './MobileSlideDrawer';
import { AppTour } from './AppTour';
import { UpdatePopup } from '../ui/UpdatePopup';
import { BugFixBanner } from '../ui/BugFixBanner';
import { MediaEntryModal } from '../ui/MediaEntryModal';
import { TodoProjectModal } from '../ui/TodoProjectModal';
import { TodoTaskModal } from '../ui/TodoTaskModal';
import { JournalNoticeModal } from '../ui/JournalNoticeModal';
import { DynamicIsland, triggerDynamicIsland } from '../ui/DynamicIsland';
import { CommandPalette } from '../ui/CommandPalette';
import { TaskFocusIsland } from '../ui/TaskFocusIsland';
import { WavyEffectOverlay } from '../ui/WavyEffectOverlay';
import { AiFloatingButton } from '../ui/AiFloatingButton';
import { AiAssistantModal } from '../ui/ai-assistant/AiAssistantModal';
import { useAppStore } from '../../store/useAppStore';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isFocusMode, setIsFocusMode] = useState(() => localStorage.getItem('phq_focus_mode') === 'true');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialAction, setAiInitialAction] = useState<string | undefined>(undefined);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const geminiApiKey = useAppStore(state => state.settings?.geminiApiKey);

  useEffect(() => {
    const checkFocusMode = () => {
      setIsFocusMode(localStorage.getItem('phq_focus_mode') === 'true');
    };
    window.addEventListener('phq-focus-mode-change', checkFocusMode);
    return () => window.removeEventListener('phq-focus-mode-change', checkFocusMode);
  }, []);

  const handleOpenAi = (actionType?: string) => {
    setAiInitialAction(actionType);
    setIsAiModalOpen(true);
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-background text-text-primary ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* Dedicated Mobile Header (sticky top bar on mobile, hidden on md+) */}
      {!isFocusMode && (
        <MobileHeader
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenAi={handleOpenAi}
        />
      )}

      {/* Desktop/Tablet Sidebar */}
      {!isFocusMode && <Sidebar />}

      {/* Mobile Slide-Out Navigation Drawer */}
      <MobileSlideDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onOpenAi={handleOpenAi}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 relative">
        {/* Focus Mode Exit Pill */}
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

        <div
          className={`main-content-area p-3 sm:p-6 lg:p-8 pt-3 sm:pt-4 md:pt-6 pb-8 max-w-7xl mx-auto min-h-full transition-all duration-300 ${
            isFocusMode ? 'opacity-95 max-w-4xl py-12' : ''
          }`}
        >
          {children}
        </div>
      </main>

      {/* Dynamic Notifications & Overlays */}
      <DynamicIsland />
      <TaskFocusIsland />
      <CommandPalette />

      {/* Desktop AI Floating Trigger & Assistant Modal */}
      <AiFloatingButton
        hasApiKey={!!geminiApiKey}
        onClick={handleOpenAi}
      />
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiInitialAction(undefined);
        }}
        initialAction={aiInitialAction}
      />

      {/* Auxiliary Modals */}
      <AppTour />
      <UpdatePopup />
      <BugFixBanner />
      <MediaEntryModal />
      <TodoProjectModal />
      <TodoTaskModal />
      <JournalNoticeModal />
      <WavyEffectOverlay />
    </div>
  );
};
