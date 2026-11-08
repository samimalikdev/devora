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
        ink: {
          DEFAULT: '#0b1f24',
          2: '#1c3238',
        },
        muted: {
          DEFAULT: '#5b6b70',
          2: '#8a989c',
        },
        line: {
          DEFAULT: '#e3ebe8',
          2: '#d2e1dc',
        },
        bg: {
          DEFAULT: '#fbfaf6',
          2: '#f3f7f4',
        },
        tint: {
          DEFAULT: '#e6f4f0',
          2: '#d4ece5',
        },
        teal: {
          900: '#0b4f4a',
          800: '#0f766e',
          700: '#0d9488',
          500: '#14b8a6',
          300: '#5eead4',
          100: '#ccfbf1',
        },
        amber: {
          500: '#f59e0b',
          400: '#fbbf24',
          100: '#fde7c2',
        },
        coral: '#fb7185',
        brand: {
          surface: '#ffffff',
          navy: '#111536',
          text: '#5e6076',
          indigo: '#4338ca',
          electric: '#4f46ef',
          lavender: '#f5f4ff',
          border: '#e9e8f2',
          dark: '#1c174d',
        },
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ["'Instrument Serif'", 'Georgia', 'serif'],
        hand: ['var(--font-caveat)', 'cursive'],
        handwriting: ['var(--font-caveat)', 'cursive'],
      },
      boxShadow: {
        xs: '0 1px 3px rgba(11, 31, 36, 0.04)',
        'teal-sm': '0 2px 6px rgba(11, 31, 36, 0.04), 0 10px 26px -16px rgba(11, 79, 74, 0.18)',
        'teal-md': '0 6px 16px -6px rgba(11, 31, 36, 0.08), 0 24px 48px -24px rgba(11, 79, 74, 0.22)',
        'teal-lg': '0 30px 80px -30px rgba(11, 79, 74, 0.38)',
      },
      borderRadius: {
        'r-sm': '12px',
        'r-md': '18px',
        'r-lg': '26px',
        'r-pill': '999px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        orb: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(-30px, 30px) scale(1.08)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(-15deg)' },
          '100%': { transform: 'rotate(345deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'hero-up': {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'hero-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(16px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'underline-in': {
          '0%': { transform: 'scaleX(0) rotate(-2deg)' },
          '100%': { transform: 'scaleX(1) rotate(-2deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-b': 'float 7s ease-in-out -2s infinite',
        'float-c': 'float 8s ease-in-out -4s infinite',
        orb: 'orb 14s ease-in-out infinite alternate',
        'spin-slow': 'spin-slow 40s linear infinite',
        marquee: 'marquee 34s linear infinite',
        'hero-up': 'hero-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-scale': 'hero-scale 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
        'underline-in': 'underline-in 1s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both',
        drift: 'drift 7s ease-in-out infinite',
        'drift-delay-2': 'drift 7s ease-in-out -2s infinite',
        'drift-delay-4': 'drift 7s ease-in-out -4s infinite',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

export default config;
