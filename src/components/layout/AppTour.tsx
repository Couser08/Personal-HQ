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
            element: '#tour-notes',
            popover: {
              title: 'Welcome to Personal HQ',
              description: 'This is the Notes module where you can write and organize your daily thoughts.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-snippets',
            popover: {
              title: 'Code Vault',
              description: 'A dedicated space to save, organize, and reuse your code snippets with beautiful syntax highlighting.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-profile',
            popover: {
              title: 'Your Profile',
              description: 'Manage your personal details, username, and secure your account here.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '#tour-settings',
            popover: {
              title: 'Settings & Theming',
              description: 'Customize your experience, toggle Dark/Light mode, and preview system notifications.',
              side: 'right',
              align: 'start'
            }
          },
          {
            popover: {
              title: 'You are all set!',
              description: 'Enjoy exploring Personal HQ. You can restart this tour anytime from the Settings page.',
              side: 'over',
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
