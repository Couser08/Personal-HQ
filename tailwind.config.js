/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        9997: '9997',
      },
      colors: {
        background: 'var(--bg-background)',
        surface: 'var(--bg-surface)',
        'surface-alt': 'var(--bg-surface-alt)',
        'surface-sunken': 'var(--bg-surface-sunken)',
        'surface-hover': 'var(--bg-surface-hover)',
        border: 'var(--border-border)',
        'border-alt': 'var(--border-border-alt)',
        'border-hairline': 'var(--border-hairline)',
        'border-focus': 'var(--border-focus)',
        primary: 'var(--accent-primary)',
        'primary-muted': 'var(--accent-primary-muted)',
        success: 'var(--accent-success)',
        warning: 'var(--accent-warning)',
        danger: 'var(--accent-danger)',
        highlight: 'var(--accent-highlight)',
        identity: 'var(--accent-identity)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-muted': 'var(--text-muted)',
        'text-on-accent': 'var(--text-on-accent)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
