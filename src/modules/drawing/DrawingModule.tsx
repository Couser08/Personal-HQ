import { useEffect, useState } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';

export default function DrawingModule() {
  const { theme, drawingElements, drawingAppState, setDrawingData } = useAppStore(useShallow(state => ({
    theme: state.theme,
    drawingElements: state.drawingElements,
    drawingAppState: state.drawingAppState,
    setDrawingData: state.setDrawingData
  })));

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({ appState: { theme: theme === 'dark' ? 'dark' : 'light' } });
    }
  }, [theme, excalidrawAPI]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-8"
      style={{ background: 'var(--bg-background)' }}
    >
      <div className="flex-1 w-full h-full relative rounded-2xl overflow-hidden shadow-sm border border-border/40 bg-surface">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          theme={theme === 'dark' ? 'dark' : 'light'}
          initialData={{
            elements: drawingElements as any,
            appState: drawingAppState || {},
          }}
          onChange={(elements, appState) => {
            setDrawingData(elements, appState);
          }}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              loadScene: true,
              saveToActiveFile: false,
              toggleTheme: false,
              saveAsImage: true,
            },
          }}
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
