module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          900: '#312e81',
        },
        purple: {
          900: '#581c87',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          400: '#c084fc',
          300: '#d8b4fe',
        },
        pink: {
          900: '#831843',
          500: '#ec4899',
          600: '#db2777',
        },
        gray: {
          300: '#d1d5db',
          400: '#9ca3af',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
        },
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
      },
      backdropBlur: {
        xl: '24px',
      },
    },
  },
  plugins: [],
};
