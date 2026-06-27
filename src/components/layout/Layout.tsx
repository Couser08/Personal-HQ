import type { ReactNode } from 'react';
import { Sidebar, MobileBottomNav } from './Sidebar';
import { ToastContainer } from '../ui/Toast';

import { AppTour } from './AppTour';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-background overflow-hidden text-text-primary">
      {/* Desktop/Tablet sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        <div className="main-content-area p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />

      {/* Toast notifications */}
      <ToastContainer />

      {/* App Tour */}
      <AppTour />
    </div>
  );
};
