import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react-slick',
        'slick-carousel'
      ],
    },
  },
  optimizeDeps: {
    include: [
      'react-slick',
      'slick-carousel'
    ],
  },
  resolve: {
    alias: {
      'framer-motion': 'framer-motion',
      '@heroicons/react/24/outline': '@heroicons/react/24/outline'
    }
  }
})
