/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        field: '#1b4332',
        moss: '#2d6a4f',
        sage: '#52b788',
        dew: '#b7e4c7',
        amber: '#d4a017',
        rust: '#c1440e',
        ink: '#0a0f0b',
        paper: '#f4f1eb',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        mono: ['Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}