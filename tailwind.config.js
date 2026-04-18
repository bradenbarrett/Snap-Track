/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf5',
          100: '#c5d0e6',
          200: '#9fb1d5',
          300: '#7892c4',
          400: '#587ab7',
          500: '#3762aa',
          600: '#2d549e',
          700: '#1e3a6e',
          800: '#162d57',
          900: '#0f2044',
          950: '#091528',
        },
        lemon: {
          50:  '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#ffeb3b',
          600: '#fdd835',
          700: '#f9a825',
          800: '#f57f17',
          900: '#e65100',
        },
      },
    },
  },
  plugins: [],
}
