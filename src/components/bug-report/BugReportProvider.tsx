import { useEffect } from 'react';
import { useBugReportStore } from '../../store/useBugReportStore';
import { BugReportInspector } from './BugReportInspector';
import { BugReportModal } from './BugReportModal';
import { ToastContainer } from '../ui/Toast';

export function BugReportProvider({ children }: { children?: React.ReactNode }) {
  const { isInspecting, startInspection, cancelInspection } = useBugReportStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Ctrl+Shift+B or Cmd+Shift+B
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (isInspecting) {
          cancelInspection();
        } else {
          startInspection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInspecting, startInspection, cancelInspection]);

  return (
    <>
      {children}
      <ToastContainer />
      <BugReportInspector />
      <BugReportModal />
    </>
  );
}
