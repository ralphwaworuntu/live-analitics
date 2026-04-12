import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maritime: {
          DEFAULT: '#0a1628',
          50: '#e6ebf2',
          100: '#ccd7e5',
          200: '#99afcb',
          300: '#6687b1',
          400: '#336097',
          500: '#0a1628',
          600: '#081420',
          700: '#060f18',
          800: '#040910',
          900: '#020408',
        },
        'navy': {
          DEFAULT: '#0a1628',
          50: '#e6ebf2',
          100: '#ccd7e5',
          200: '#99afcb',
          300: '#6687b1',
          400: '#336097',
          500: '#0a1628',
          600: '#081420',
          700: '#060f18',
          800: '#040910',
          900: '#020408',
        },
        'gold': {
          DEFAULT: '#d4af37',
          50: '#fdf8e8',
          100: '#fbf0d1',
          200: '#f7e1a3',
          300: '#f3d275',
          400: '#efc347',
          500: '#d4af37',
          600: '#a8892c',
          700: '#7c6321',
          800: '#503e16',
          900: '#24190b',
        },
        'gold-bright': '#ffd700',
        'police-blue': '#1e3a5f',
        'alert-red': '#dc2626',
        'alert-green': '#16a34a',
        'status-online': '#00ff88',
        'status-offline': '#ff4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;