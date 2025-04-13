import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      include: [
        /keen-slider/,
        /react/,
        /react-dom/,
        /react-router-dom/,
        /@heroicons\/react/,
        /framer-motion/,
        /date-fns/,
        /axios/,
        /daisyui/,
        /react-icons/
      ],
      transformMixedEsModules: true
    },
  },
  optimizeDeps: {
    include: [
      'keen-slider',
      '@heroicons/react/24/outline',
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'date-fns',
      'axios',
      'daisyui',
      'react-icons'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    dedupe: [
      '@heroicons/react',
      'keen-slider',
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'date-fns',
      'axios',
      'daisyui',
      'react-icons'
    ],
    alias: {
      'react': 'react',
      'react-dom': 'react-dom',
      'react-router-dom': 'react-router-dom',
      'framer-motion': 'framer-motion',
      'date-fns': 'date-fns',
      'axios': 'axios',
      'daisyui': 'daisyui',
      'react-icons': 'react-icons'
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  }
})
