import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px rgba(249,115,22,0.15)'
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at top, rgba(249,115,22,0.18), transparent 55%)'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.02)' }
        },
        pulseBig: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' }
        }
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        pulseBig: 'pulseBig 2.5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
