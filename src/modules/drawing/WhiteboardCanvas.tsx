import React, { useState } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { IconMaximize, IconMinimize, IconChevronRight, IconChevronUp } from '@tabler/icons-react';

interface WhiteboardCanvasProps {
  activeSketchId: string;
  isFullScreen: boolean;
  setIsFullScreen: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  isoGrid: boolean;
  resolvedTheme: 'dark' | 'light';
  initialData: any;
  canvasBackground: string;
  setExcalidrawAPI: (api: any) => void;
  onChange: (elements: readonly any[], appState: any) => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  activeSketchId,
  isFullScreen,
  setIsFullScreen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isoGrid,
  resolvedTheme,
  initialData,
  canvasBackground,
  setExcalidrawAPI,
  onChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div 
      key={activeSketchId} 
      className={`relative bg-surface overflow-hidden ${
        isFullScreen 
          ? 'fixed inset-0 z-[500] w-screen h-screen rounded-none border-none shadow-none' 
          : 'flex-grow h-full rounded-[32px] border border-border/50 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]'
      } ${isoGrid ? 'iso-grid-active' : ''}`}
    >
      {/* Floating Canvas Controls vertical popover placed at bottom-right */}
      <div className="absolute bottom-20 md:bottom-6 right-4 z-[99999] flex flex-col items-center gap-2.5">
        
        {/* Expanded Popover Items */}
        {isMenuOpen && (
          <div className="flex flex-col gap-2 animate-fade-in-up">
            {/* Toggle Sidebar Button */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarCollapsed(!isSidebarCollapsed);
                setIsMenuOpen(false);
              }}
              className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              title={isSidebarCollapsed ? "Show Sketch Library" : "Hide Sketch Library"}
            >
              <IconChevronRight size={18} className={isSidebarCollapsed ? "" : "rotate-180"} />
            </button>

            {/* Toggle Full Screen Button */}
            <button
              type="button"
              onClick={() => {
                setIsFullScreen(!isFullScreen);
                setIsMenuOpen(false);
              }}
              className="w-10 h-10 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
            >
              {isFullScreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
            </button>
          </div>
        )}

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-10 h-10 rounded-2xl border border-border/80 text-text-primary flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
            isMenuOpen ? 'bg-primary text-white border-primary' : 'bg-surface hover:bg-surface-hover'
          }`}
          title="Canvas Options"
        >
          <IconChevronUp size={18} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <Excalidraw
        theme={resolvedTheme}
        initialData={{
          ...initialData,
          appState: {
            ...initialData.appState,
            viewBackgroundColor: isoGrid ? 'transparent' : canvasBackground,
            gridModeEnabled: isoGrid,
          }
        }}
        excalidrawAPI={setExcalidrawAPI}
        onChange={onChange}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Hints.HelpHint />
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Heading>
              Personal HQ Whiteboard
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemLoadScene />
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>
    </div>
  );
};
