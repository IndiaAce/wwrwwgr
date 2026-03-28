import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0c0a09',
        surface: '#1a1612',
        card: '#252019',
        border: '#3a3028',
        accent: '#e8774a',
        'accent-dim': 'rgba(232,119,74,0.12)',
        gold: '#f5c518',
        masterpiece: '#c084fc',
        ink: {
          DEFAULT: '#f0ebe4',
          muted: '#8a7f75',
          faint: '#4a433c',
        },
        status: {
          tbr: '#6b7280',
          reading: '#3b82f6',
          watching: '#8b5cf6',
          dnf: '#ef4444',
          finished: '#10b981',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
