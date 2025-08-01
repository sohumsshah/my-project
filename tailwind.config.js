/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
        'secondary': '0 4px 14px 0 rgba(99, 102, 241, 0.25)',
        'accent': '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
      }
    },
  },
  plugins: [],
}