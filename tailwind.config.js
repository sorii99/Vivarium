/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        botanica: {
          50:  '#f2f7f0',
          100: '#e0edda',
          200: '#c2dab8',
          300: '#97c188',
          400: '#6ba35a',
          500: '#4a8539',
          600: '#386a2b',
          700: '#2d5424',
          800: '#264520',
          900: '#1e3819',
          950: '#0f1f0d',
        },
        soil: {
          100: '#f5efe6',
          200: '#e8d9c4',
          300: '#d4b896',
          400: '#b8905e',
          500: '#9a6f3a',
          600: '#7d5628',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'leaf-sway': 'leafSway 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        leafSway: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
      }
    }
  },
  plugins: []
}
