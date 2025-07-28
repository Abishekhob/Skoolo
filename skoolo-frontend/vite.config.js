import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Polyfill `global` to `window` for browser compatibility
  },
  // ADD THIS `resolve` BLOCK
  resolve: {
    dedupe: ['swiper'], // This tells Vite/Rollup to ensure 'swiper' is resolved uniquely
  },
})