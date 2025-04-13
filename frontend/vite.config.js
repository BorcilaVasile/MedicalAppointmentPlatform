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
        /react-icons/,
        /scheduler/
      ],
      transformMixedEsModules: true,
      dynamicRequireTargets: [
        'node_modules/scheduler/index.js',
        'node_modules/scheduler/cjs/*.js'
      ]
    },
    sourcemap: true,
    minify: false
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
      'react-icons',
      'scheduler'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      'scheduler': 'scheduler/cjs/scheduler.production.min.js'
    },
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
      'react-icons',
      'scheduler'
    ]
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    },
    global: 'globalThis'
  }
})
