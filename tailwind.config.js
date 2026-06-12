/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Marcellus', 'serif'],
      },
      colors: {
        barber: {
          bg:       '#0B2422',
          sidebar:  '#0A1F1E',
          card:     '#11332F',
          muted:    '#0E2A27',
          border:   'rgba(255,255,255,0.07)',
          gold:     '#C9A45C',
          'gold-2': '#D8BC82',
          'gold-3': '#E6C988',
          text:     '#F4EFE3',
          'text-2': '#E8DDC4',
          sub:      '#A9BDB6',
          mute:     '#8FA69F',
          dim:      '#5E776F',
          green:    '#7FBFA0',
          red:      '#C98A7E',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      keyframes: {
        'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
