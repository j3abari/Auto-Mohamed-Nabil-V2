/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF4B16',
          hover: '#E03E0F',
          dark: '#C93308',
          subtle: 'rgba(255, 75, 22, 0.1)',
          border: 'rgba(255, 75, 22, 0.35)',
        },
        dark: {
          950: '#050505',
          900: '#0A0A0A',
          850: '#121212',
          800: '#161616',
          750: '#1C1C1C',
          700: '#222222',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 8px 30px rgba(255, 75, 22, 0.25)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 12px 35px rgba(255, 75, 22, 0.15)',
      }
    },
  },
  plugins: [],
}
