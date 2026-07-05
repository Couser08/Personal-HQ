import { useState, useMemo, useCallback } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import "@excalidraw/excalidraw/index.css";

export default function DrawingModule() {
  const { theme, setDrawingData } = useAppStore(useShallow(state => ({
    theme: state.theme,
    setDrawingData: state.setDrawingData
  })));

  const [initialData] = useState(() => ({
    elements: useAppStore.getState().drawingElements || [],
    appState: useAppStore.getState().drawingAppState || {},
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-[calc(100vh-140px)] flex flex-col"
      style={{ background: 'var(--bg-background)' }}
    >
      <div className="flex-1 w-full h-full relative rounded-2xl overflow-hidden shadow-sm border border-border/40 bg-surface">
        <Excalidraw
          theme={theme === 'dark' ? 'dark' : 'light'}
          initialData={{
            elements: initialData.elements as any,
            appState: initialData.appState,
          }}
          onChange={useCallback((elements: readonly any[], appState: any) => {
            setDrawingData(elements, appState);
          }, [setDrawingData])}
          UIOptions={useMemo(() => ({
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              loadScene: true,
              saveToActiveFile: false,
              toggleTheme: false,
              saveAsImage: true,
            },
          }), [])}
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
                Personal HQ Canvas
              </WelcomeScreen.Center.Heading>
              <WelcomeScreen.Center.Menu>
                <WelcomeScreen.Center.MenuItemLoadScene />
                <WelcomeScreen.Center.MenuItemHelp />
              </WelcomeScreen.Center.Menu>
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
      </div>
    </motion.div>
  );
}
