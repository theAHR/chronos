import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chronos: {
          bg: 'var(--chronos-bg)',
          surface: 'var(--chronos-surface)',
          elevated: 'var(--chronos-elevated)',
          border: 'var(--chronos-border)',
          muted: 'var(--chronos-muted)',
          text: 'var(--chronos-text)',
          accent: 'var(--chronos-accent)',
          accentSoft: 'var(--chronos-accent-soft)',
          warm: 'var(--chronos-warm)',
          ring: 'var(--chronos-ring)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px var(--chronos-ring)',
        soft: '0 18px 50px -28px rgba(0,0,0,0.55)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.04)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        breathe: 'breathe 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
