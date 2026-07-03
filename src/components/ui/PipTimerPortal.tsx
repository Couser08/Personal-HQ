import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../store/useAppStore';

export function PipTimerPortal() {
  const {
    pomodoroPipWindow,
    pomodoroSecondsLeft,
    pomodoroTimerState,
    pomodoroSessionId,
    pomodoroStreak,
    setPomodoroPipWindow,
    pauseGlobalPomodoro,
    resumeGlobalPomodoro,
    stopGlobalPomodoro
  } = useAppStore();

  const isRunning = pomodoroTimerState === 'running';

  // Toggle state
  const togglePlayPause = () => {
    if (isRunning) {
      pauseGlobalPomodoro();
    } else {
      resumeGlobalPomodoro();
    }
  };

  // Keep page title synced globally on all tabs
  useEffect(() => {
    if (pomodoroTimerState === 'running') {
      const mins = Math.floor(pomodoroSecondsLeft / 60);
      const secs = pomodoroSecondsLeft % 60;
      const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const label = pomodoroSessionId === 'focus' ? 'Focus' : 'Break';
      document.title = `${display} · ${label} — Personal HQ`;
    } else {
      document.title = 'Personal HQ';
    }
    return () => {
      document.title = 'Personal HQ';
    };
  }, [pomodoroSecondsLeft, pomodoroTimerState, pomodoroSessionId]);

  // Handle window close event listeners
  useEffect(() => {
    if (!pomodoroPipWindow) return;

    const handleBeforeUnload = () => {
      setPomodoroPipWindow(null);
    };

    pomodoroPipWindow.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      pomodoroPipWindow.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [pomodoroPipWindow, setPomodoroPipWindow]);

  if (!pomodoroPipWindow) return null;

  const mins = Math.floor(pomodoroSecondsLeft / 60);
  const secs = pomodoroSecondsLeft % 60;
  const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const sessionLabel = pomodoroSessionId === 'focus' ? `Focus Session ${pomodoroStreak + 1}` : 'Break Time';

  // Inline CSS elements designed to mimic the Apple Watch / Focus widget UI image exactly
  return createPortal(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#18181a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* Header Bar */}
      <div style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxSizing: 'border-box'
      }}>
        {/* Red status dot + Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#e11d48',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e7eb' }}>
            {sessionLabel}
          </span>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => {
              pomodoroPipWindow.focus();
              // Focus target window back
              window.focus();
            }} 
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#a0a0a0', display: 'flex'
            }}
            title="Restore Window"
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button 
            onClick={() => pomodoroPipWindow.close()} 
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#a0a0a0', display: 'flex'
            }}
            title="Close PiP"
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main clock time display */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          fontSize: '52px',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          color: '#ffffff',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        }}>
          {timeDisplay}
        </div>
      </div>

      {/* Controls Container separated by border */}
      <div style={{
        height: '68px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        boxSizing: 'border-box'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#e11d48',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
            outline: 'none'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? (
            <svg style={{ width: '20px', height: '20px', color: '#ffffff' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg style={{ width: '20px', height: '20px', color: '#ffffff', transform: 'translateX(1.5px)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Stop Button */}
        <button
          onClick={stopGlobalPomodoro}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#2e2e30',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
            outline: 'none'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          title="Stop Session"
        >
          <svg style={{ width: '18px', height: '18px', color: '#ffffff' }} fill="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" />
          </svg>
        </button>
      </div>
    </div>,
    pomodoroPipWindow.document.body
  );
}
