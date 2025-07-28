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
        'swiper/css',
        'swiper/css/pagination', // ADD THIS LINE for pagination styles
        // You also have `swiper/css/navigation` and `swiper/css/effect-cards` in your Welcome.jsx
        // Let's proactively add them as well to avoid another build failure.
        'swiper/css/navigation', // ADD THIS LINE for navigation styles
        'swiper/css/effect-cards', // ADD THIS LINE for effect-cards styles
      ],
    },
  },
})