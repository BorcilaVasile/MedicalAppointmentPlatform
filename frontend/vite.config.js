import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react-slick',
        'slick-carousel',
        '@heroicons/react',
        '@heroicons/react/24/outline'
      ],
    },
  },
  optimizeDeps: {
    include: [
      'react-slick',
      'slick-carousel',
      '@heroicons/react',
      '@heroicons/react/24/outline'
    ],
  },
  resolve: {
    alias: {
      'framer-motion': 'framer-motion'
    }
  }
})
