/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kairos design tokens
        ink: {
          DEFAULT: '#1a1a2e',
          mid: '#2d2d4e',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8d5a3',
          muted: 'rgba(201,168,76,0.2)',
        },
        parchment: '#f7f3eb',
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
}
