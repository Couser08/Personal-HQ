import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';

export function PipTimerPortal() {
  const {
    pomodoroPipWindow,
    pomodoroSecondsLeft,
    pomodoroTimerState,
    pomodoroSessionId,
    pomodoroStreak,
    setPomodoroPipWindow,
    pauseGlobalPomodoro,
    resumeGlobalPomodoro
  } = useAppStore(useShallow(state => ({
    pomodoroPipWindow: state.pomodoroPipWindow,
    pomodoroSecondsLeft: state.pomodoroSecondsLeft,
    pomodoroTimerState: state.pomodoroTimerState,
    pomodoroSessionId: state.pomodoroSessionId,
    pomodoroStreak: state.pomodoroStreak,
    setPomodoroPipWindow: state.setPomodoroPipWindow,
    pauseGlobalPomodoro: state.pauseGlobalPomodoro,
    resumeGlobalPomodoro: state.resumeGlobalPomodoro,
  })));

  const [isHovered, setIsHovered] = useState(false);
  const isRunning = pomodoroTimerState === 'running';
  const isFocus = pomodoroSessionId === 'focus';

  const totalSeconds = isFocus ? 25 * 60 : 5 * 60;
  const percentageLeft = (pomodoroSecondsLeft / totalSeconds) * 100;

  const togglePlayPause = (e: React.MouseEvent) => {
    // Tapping controls explicitly blocks text node targeting glitches
    e.preventDefault();
    if (isRunning) {
      pauseGlobalPomodoro();
    } else {
      resumeGlobalPomodoro();
    }
  };

  useEffect(() => {
    if (!pomodoroPipWindow) return;
    const handleBeforeUnload = () => setPomodoroPipWindow(null);
    pomodoroPipWindow.addEventListener('pagehide', handleBeforeUnload);
    return () => pomodoroPipWindow.removeEventListener('pagehide', handleBeforeUnload);
  }, [pomodoroPipWindow, setPomodoroPipWindow]);

  if (!pomodoroPipWindow) return null;

  const mins = Math.floor(pomodoroSecondsLeft / 60);
  const secs = pomodoroSecondsLeft % 60;
  const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const themeColor = isFocus ? '#FF453A' : '#30D158'; 

  return createPortal(
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={togglePlayPause}
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000', 
        color: '#FFFFFF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        overflow: 'hidden',
        boxSizing: 'border-box',
        cursor: 'pointer',
        position: 'relative',
        // Ultimate Selection Guard: Pure CSS properties directly injected to prevent any white/blue highlights
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Dynamic Ambient Glow Field */}
      <div
        style={{
          position: 'absolute',
          width: '130px',
          height: '130px',
          background: `radial-gradient(circle, ${themeColor}15 0%, transparent 70%)`,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          opacity: isRunning ? 1 : 0.5,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Hardware Outline Border */}
      <div 
        style={{
          position: 'absolute',
          inset: '10px',
          borderRadius: '20px',
          border: `1px solid ${themeColor}${isRunning ? '20' : '12'}`,
          transition: 'border-color 0.3s ease',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      {/* Main Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          pointerEvents: 'none' // Click updates cleanly fall straight to root layout
        }}
      >
        {/* Dynamic Status Badging */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: isRunning ? themeColor : 'rgba(255, 255, 255, 0.25)',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'color 0.3s ease'
          }}
        >
          {isFocus ? 'Focus' : 'Break'}
          <span style={{ opacity: 0.4 }}>• P{pomodoroStreak + 1}</span>
        </div>

        {/* Crisp Solid High-Contrast Typography (Fixed Selection Masking Flaw) */}
        <div
          style={{
            fontSize: '60px',
            fontWeight: 700,
            letterSpacing: '-2px',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 0.9,
            color: isRunning ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
            transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {timeDisplay}
        </div>
      </div>

      {/* Modern Dynamic Blur Action HUD Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 4,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            background: 'rgba(30, 30, 32, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 14px',
            borderRadius: '99px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.3px',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isRunning ? (
            <>
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm7.5 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              PAUSE
            </>
          ) : (
            <>
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
              RESUME
            </>
          )}
        </div>
      </div>
      
      {/* Micro Progress Tracking Edge */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        width: `${percentageLeft}%`,
        background: themeColor,
        opacity: isRunning ? 0.8 : 0.3,
        transition: 'width 1s linear, background-color 0.3s ease'
      }} />
    </div>,
    pomodoroPipWindow.document.body
  );
}