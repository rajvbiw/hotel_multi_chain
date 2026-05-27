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
        brand: {
          bg: '#08070d',       // Hyper dark ambient backing
          card: '#111019',     // Glass-like dark panel backing
          border: '#1f1c2d',   // Subtly lit slate boundaries
          text: '#f3f4f6',     // Crisp primary text
          textMuted: '#9ca3af', // Gray details
          accent: '#7c3aed',   // High-fidelity purple
          accentGlow: '#a78bfa',
          success: '#10b981',  // Emerald greens
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      boxShadow: {
        accent: '0 0 20px rgba(124, 58, 237, 0.2)',
        success: '0 0 20px rgba(16, 185, 129, 0.2)',
        glow: '0 0 15px rgba(124, 58, 237, 0.1)',
      }
    },
  },
  plugins: [],
}
