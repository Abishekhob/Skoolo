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
  build: {
    rollupOptions: {
      external: [
        // ONLY externalize CSS imports.
        // Vite's default CSS handling should take care of them, but this prevents Rollup from treating them as JS modules.
        'swiper/css',
        'swiper/css/pagination',
        'swiper/css/navigation',
        'swiper/css/effect-cards',
      ],
    },
  },
})