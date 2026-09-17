/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nike: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: '#0a0a0a',
        surface: {
          canvas: '#f9f9fa',
          card: '#ffffff',
          dim: '#f4f4f5',
          dark: '#0a0a0a',
          border: '#e4e4e7',
          borderDark: '#27272a',
        },
        brand: {
          black: '#000000',
          white: '#ffffff',
          grey: '#71717a',
          lightGrey: '#a1a1aa',
          border: '#e5e7eb',
        }
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      letterSpacing: {
        'tightest': '-0.05em',
        'widest-xl': '0.2em',
      }
    },
  },
  plugins: [],
}
