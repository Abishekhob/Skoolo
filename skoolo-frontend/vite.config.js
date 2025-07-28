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
        'swiper/react',
        'swiper/modules',
        'swiper/css', // ADD THIS LINE for core Swiper CSS
        // If you are using other Swiper CSS modules, add them here too:
        // 'swiper/css/navigation',
        // 'swiper/css/pagination',
        // 'swiper/css/bundle', // This imports all Swiper CSS styles
      ],
    },
  },
})