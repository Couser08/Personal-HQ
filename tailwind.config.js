/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#111111',
        border: '#1f1f1f',
        primary: '#f43f5e',
        'primary-muted': '#be123c',
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
        'text-muted': '#52525b',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
