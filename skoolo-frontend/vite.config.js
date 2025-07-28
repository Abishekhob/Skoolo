import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Polyfill `global` to `window` for browser compatibility
  },
  resolve: {
    dedupe: ['swiper'], // Keep this, it often helps with resolution
  },
  // ADD THIS `build` BLOCK
  build: {
    rollupOptions: {
      external: [
        'swiper/react', // Explicitly externalize swiper/react
        'swiper/modules', // And its modules, if they are separate imports
      ],
    },
  },
})