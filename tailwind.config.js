/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'board-dark': '#1a1a1a',
        'cell-dark': '#2d2d2d',
        'cell-hover': '#3d3d3d',
        'stone-black': '#000000',
        'stone-white': '#ffffff',
        'keystone-black': '#000000',
        'keystone-white': '#e5e5e5',
        'resonance-blue': '#3b82f6',
        'resonance-glow': '#60a5fa'
      },
      gridTemplateColumns: {
        '17': 'repeat(17, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '17': 'repeat(17, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
} 