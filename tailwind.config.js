/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ationic: {
          yellow: {
            DEFAULT: '#FFE01B',
            soft: '#FFF59D',
            deep: '#E5C200',
          },
          ink: {
            DEFAULT: '#0A0A0A',
            soft: '#141414',
            gray: '#2A2A2E',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        lift: '0 4px 16px rgba(0,0,0,0.08)',
        modal: '0 24px 60px -12px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        card: '14px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 140ms ease-out',
        'slide-up': 'slide-up 160ms ease-out',
        'scale-in': 'scale-in 140ms ease-out',
      },
    },
  },
  plugins: [],
}