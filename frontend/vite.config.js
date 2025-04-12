import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      include: [/react-slick/, /slick-carousel/],
    },
  },
  optimizeDeps: {
    include: [
      'react-slick',
      'slick-carousel',
      '@heroicons/react/24/outline'
    ],
  },
  resolve: {
    dedupe: ['@heroicons/react', 'react-slick']
  }
})
