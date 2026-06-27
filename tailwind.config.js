/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4F8CFF',
        accent: '#7C5CFF',
        dark: { 900: '#0B1120', 800: '#151D31', 700: '#1E293B' },
        muted: '#94A3B8',
      },
      borderRadius: { 'xl': '18px', '2xl': '24px' },
      boxShadow: { 'glow': '0 0 20px rgba(79, 140, 255, 0.15)', 'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)' },
      backdropBlur: { 'glass': '12px' }
    },
  },
  plugins: [],
}
