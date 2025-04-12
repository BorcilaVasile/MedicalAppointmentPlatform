import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['framer-motion', 'react-slick', 'slick-carousel'],
    },
  },
  optimizeDeps: {
    include: ['framer-motion', 'react-slick', 'slick-carousel'],
  },
})
