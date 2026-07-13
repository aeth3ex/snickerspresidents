/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#080b14',
          900: '#0d111c',
          850: '#11172a',
          800: '#16203a',
          700: '#1e2a47',
          600: '#2a3a5e',
          500: '#3a4a70',
        },
        teamred: {
          950: '#2a0808',
          900: '#3d0d0d',
          800: '#521515',
          700: '#6b1a1a',
          600: '#8a2424',
          400: '#c84545',
          300: '#ff7a7a',
          200: '#ff9a9a',
        },
        teamgold: {
          950: '#2a2008',
          900: '#3d2e0d',
          800: '#523c15',
          700: '#6b4f1a',
          600: '#8a671f',
          400: '#c89c2e',
          300: '#ffd24a',
          200: '#ffe07a',
        },
        accent: {
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#7dd3fc',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        'flash-red': {
          '0%': { backgroundColor: 'rgba(239,68,68,0.4)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
        'shake': 'shake 0.3s ease-in-out',
        'flash-red': 'flash-red 0.6s ease-out',
      },
    },
  },
  plugins: [],
};
