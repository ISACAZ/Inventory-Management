/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lab: {
          cream:  '#F0EFEB',
          mauve:  '#B294A0',
          slate:  '#C2CCD6',
          sage:   '#7C8D7D',
          amber:  '#D9966E',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
