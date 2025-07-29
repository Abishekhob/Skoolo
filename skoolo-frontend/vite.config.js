import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Keep this for polyfill
  },
  resolve: {
    dedupe: ['swiper'], // This is good
  },
  base: '/', // ✅ Use absolute base path for Vercel
});
