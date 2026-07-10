import React from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { IconMaximize, IconMinimize, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

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
  return (
    <div 
      key={activeSketchId} 
      className={`relative bg-surface overflow-hidden ${
        isFullScreen 
          ? 'fixed inset-0 z-[500] w-screen h-screen rounded-none border-none shadow-none' 
          : 'flex-grow h-full rounded-[32px] border border-border/50 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]'
      } ${isoGrid ? 'iso-grid-active' : ''}`}
    >
      {/* Floating Sidebar toggle button */}
      <button
        type="button"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute top-3.5 left-4 z-[99999] p-2.5 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        title={isSidebarCollapsed ? "Show Sketch Library" : "Hide Sketch Library"}
      >
        {isSidebarCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
      </button>

      {/* Floating Fullscreen toggle button */}
      <button
        type="button"
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="absolute top-3.5 right-16 z-[99999] p-2.5 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
      >
        {isFullScreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
      </button>

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
