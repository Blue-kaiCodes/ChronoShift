import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    allowedHosts: 'all'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — smallest, cached longest
          'vendor-react': ['react', 'react-dom'],
          // Firebase — large SDK, rarely changes
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Animation library
          'vendor-framer': ['framer-motion'],
          // Charting
          'vendor-recharts': ['recharts'],
          // Icon library
          'vendor-lucide': ['lucide-react'],
          // Toast
          'vendor-toast': ['react-hot-toast'],
        }
      }
    },
    // Raise the warning threshold to 750kB to accommodate vendor-firebase
    chunkSizeWarningLimit: 750
  }
})
