/** @type {import('tailwindcss').Config} */
const daisyui = require('daisyui');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'primary': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Main brand color - Medical Blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'secondary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Healing Green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'accent': {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',  // Medical Red
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        'background': {
          50: '#fafafa',   // Light mode background
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',  // Dark mode background
          900: '#18181b',
        },
        'text': {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        'success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'error': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          'primary': '#0ea5e9',      // Medical Blue
          'primary-focus': '#0284c7',
          'primary-content': '#ffffff',
          
          'secondary': '#22c55e',    // Healing Green
          'secondary-focus': '#16a34a',
          'secondary-content': '#ffffff',
          
          'accent': '#f43f5e',       // Medical Red
          'accent-focus': '#e11d48',
          'accent-content': '#ffffff',
          
          'neutral': '#3f3f46',
          'neutral-focus': '#27272a',
          'neutral-content': '#ffffff',
          
          'base-100': '#fafafa',     // Light background
          'base-200': '#f4f4f5',
          'base-300': '#e4e4e7',
          'base-content': '#18181b',
          
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-text-case': 'uppercase',
          '--navbar-padding': '0.5rem',
          '--border-btn': '1px',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          'primary': '#0ea5e9',      // Medical Blue
          'primary-focus': '#0284c7',
          'primary-content': '#ffffff',
          
          'secondary': '#22c55e',    // Healing Green
          'secondary-focus': '#16a34a',
          'secondary-content': '#ffffff',
          
          'accent': '#f43f5e',       // Medical Red
          'accent-focus': '#e11d48',
          'accent-content': '#ffffff',
          
          'neutral': '#3f3f46',
          'neutral-focus': '#27272a',
          'neutral-content': '#ffffff',
          
          'base-100': '#18181b',     // Dark background
          'base-200': '#27272a',
          'base-300': '#3f3f46',
          'base-content': '#fafafa',
          
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-text-case': 'uppercase',
          '--navbar-padding': '0.5rem',
          '--border-btn': '1px',
        }
      }
    ],
  },
};
