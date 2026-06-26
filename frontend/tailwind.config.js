/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0c',       // Premium deep space dark background
          card: '#121216',     // Card/Container dark background
          border: '#1f1f2e',   // Modern card border color
          accent: '#6366f1',   // Indigo accent color
        }
      }
    },
  },
  plugins: [],
}
