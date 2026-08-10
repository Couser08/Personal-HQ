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
        'surface-hover': 'var(--bg-surface-hover)',
        border: 'var(--border-border)',
        'border-alt': 'var(--border-border-alt)',
        primary: 'var(--accent-primary)',
        'primary-muted': 'var(--accent-primary-muted)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
