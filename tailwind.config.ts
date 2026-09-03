import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        capaciti: {
          blue: '#0B5FFF',
          'blue-dark': '#0A4ACC',
          navy: '#0B1F3A',
          grey: '#6B7280',
          'grey-light': '#F3F4F6',
        },
        border: '#E5E7EB',
        background: '#FFFFFF',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
