import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      include: [/react-slick/, /slick-carousel/, /react/, /react-dom/],
      transformMixedEsModules: true
    },
  },
  optimizeDeps: {
    include: [
      'react-slick',
      'slick-carousel',
      '@heroicons/react/24/outline',
      'react',
      'react-dom'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    dedupe: ['@heroicons/react', 'react-slick', 'react', 'react-dom']
  }
})
