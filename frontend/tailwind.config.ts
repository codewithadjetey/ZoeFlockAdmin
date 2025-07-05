import type { Config } from 'tailwindcss';

export default {
  content: [
		"./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: 'var(--theme-color, #3b82f6)',
          600: 'var(--theme-color, #3b82f6)',
          700: 'var(--theme-color, #3b82f6)',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        dark: {
          50: '#0f172a',
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
          500: '#94a3b8',
          600: '#cbd5e1',
          700: '#e2e8f0',
          800: '#f1f5f9',
          900: '#f8fafc',
        },
      },
      backgroundColor: {
        'dark-primary': '#0f172a',
        'dark-secondary': '#1e293b',
        'dark-tertiary': '#334155',
      },
      textColor: {
        'dark-primary': '#f8fafc',
        'dark-secondary': '#e2e8f0',
        'dark-tertiary': '#cbd5e1',
      },
      borderColor: {
        'dark-primary': '#334155',
        'dark-secondary': '#475569',
      },
    },
  },
  plugins: [],
} satisfies Config;
