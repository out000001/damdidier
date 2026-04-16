/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A1628',
          blue: '#0D2347',
          mid: '#163A6B',
          light: '#1E4D8C',
          yellow: '#F5C518',
          'yellow-dark': '#D4A800',
          'yellow-light': '#FFF0A0',
          gray: '#6B7280',
          'gray-light': '#F3F4F6',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(145deg, #0A1628 0%, #0D2347 40%, #163A6B 100%)',
        'card-gradient': 'linear-gradient(180deg, #163A6B 0%, #0A1628 100%)',
        'yellow-gradient': 'linear-gradient(135deg, #F5C518 0%, #D4A800 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 25px 60px rgba(0,0,0,0.4)',
        'yellow': '0 8px 24px rgba(245,197,24,0.35)',
        'card': '0 4px 20px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-yellow': 'pulseYellow 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseYellow: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,197,24,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(245,197,24,0)' } },
      },
    },
  },
  plugins: [],
}
