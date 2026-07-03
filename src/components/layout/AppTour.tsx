import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const AppTour = () => {
  useEffect(() => {
    const handleStartTour = () => {
      const tour = driver({
        showProgress: true,
        animate: true,
        steps: [
          {
            element: '#tour-todos',
            popover: {
              title: 'Supercharged Todos',
              description: 'Manage your tasks with precision. Add start and end times, and track your daily progress seamlessly.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-mindmap',
            popover: {
              title: 'Interactive Mind Mapping',
              description: 'Brainstorm ideas on a beautiful canvas. Collapse branches, add notes, and watch colors auto-assign hierarchically.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-pomodoro',
            popover: {
              title: 'Focus Engine & PiP',
              description: 'Stay on track with the Pomodoro timer. It runs in the background and supports an immersive Picture-in-Picture window.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-study',
            popover: {
              title: 'Study & Snippets',
              description: 'Master any topic using minimal vertical flashcards, and organize your code snippets beautifully.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-calculator',
            popover: {
              title: 'All-in-One Calculator',
              description: 'Switch between a standard arithmetic calculator and an advanced interest calculator with history tracking.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-journal',
            popover: {
              title: 'Rich-Text Journal',
              description: 'Reflect daily using a premium Apple-style minimal journal editor featuring rich-text styling and mood tracking.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-settings',
            popover: {
              title: 'Customization',
              description: 'Tweak themes, preview notifications, and manage system preferences to make the workspace yours.',
              side: 'right',
              align: 'start'
            }
          },
          {
            popover: {
              title: 'Ready for v0.9.9!',
              description: 'Enjoy exploring the ultimate Personal HQ. You can restart this tour anytime from the Settings page.',
              align: 'center'
            }
          }
        ]
      });
      
      tour.drive();
    };

    window.addEventListener('start-app-tour', handleStartTour);
    return () => window.removeEventListener('start-app-tour', handleStartTour);
  }, []);

  return null;
};
