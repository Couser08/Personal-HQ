import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { useBugReportStore } from '../store/useBugReportStore';

interface MobileLifecycleOptions {
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isQuickCreateOpen?: boolean;
  setIsQuickCreateOpen?: (open: boolean) => void;
}

/**
 * useMobileAppLifecycle
 * Native mobile back-gesture & app close behavior.
 * 
 * Hierarchy on back-press:
 * 1. Close topmost open modal, drawer, or inspector (Bug Inspector, AI Modal, Mobile Drawer, Quick Create).
 * 2. If inside a nested module (not dashboard), navigate back to 'dashboard'.
 * 3. If on 'dashboard', trigger a gentle toast "Tap back again to exit Personal HQ". A 2nd tap within 2s permits native exit.
 */
export function useMobileAppLifecycle({
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  isAiModalOpen,
  setIsAiModalOpen,
  isQuickCreateOpen,
  setIsQuickCreateOpen,
}: MobileLifecycleOptions) {
  const activeModule = useAppStore((s) => s.activeModule);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const addToast = useToastStore((s) => s.addToast);
  const isInspecting = useBugReportStore((s) => s.isInspecting);

  const lastBackPressTimeRef = useRef<number>(0);

  // Push an initial history state on mount so back gestures can be intercepted
  useEffect(() => {
    // Push dummy state to create a history buffer
    window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);

    const handlePopState = () => {
      // 1. Topmost overlay: Bug report inspector or modal
      const bugStore = useBugReportStore.getState();
      if (bugStore.isInspecting) {
        bugStore.cancelInspection();
        window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);
        return;
      }
      if (bugStore.isModalOpen) {
        bugStore.closeModal();
        window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);
        return;
      }

      // 2. Mobile navigation drawer
      if (isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
        window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);
        return;
      }

      // 3. AI Assistant modal
      if (isAiModalOpen) {
        setIsAiModalOpen(false);
        window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);
        return;
      }

      // 4. Quick create dock modal
      if (isQuickCreateOpen && setIsQuickCreateOpen) {
        setIsQuickCreateOpen(false);
        window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);
        return;
      }

      // 5. If on a sub-module, navigate back to dashboard
      const currentModule = useAppStore.getState().activeModule;
      if (currentModule !== 'dashboard') {
        setActiveModule('dashboard');
        window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);
        return;
      }

      // 6. If on dashboard, handle double-tap exit
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2000) {
        // Allow default browser exit / history traversal
        return;
      }

      // First back tap on root: push state back and show friendly prompt
      lastBackPressTimeRef.current = now;
      window.history.pushState({ app: 'personal-hq', step: 1 }, '', window.location.href);
      addToast('Tap back again to exit Personal HQ', 'info');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isInspecting,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    isAiModalOpen,
    setIsAiModalOpen,
    isQuickCreateOpen,
    setIsQuickCreateOpen,
    setActiveModule,
    addToast,
  ]);

  // Keep state pushed when activeModule changes
  useEffect(() => {
    window.history.replaceState({ app: 'personal-hq', module: activeModule }, '', window.location.href);
  }, [activeModule]);
}
