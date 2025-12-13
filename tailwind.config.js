/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f0f0f',
          secondary: '#1a1a1a',
          tertiary: '#262626'
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#666666'
        },
        accent: {
          primary: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
