/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e2255',
          light: '#2D3277',
        },
        accent: '#FFF159',
      }
    },
  },
  plugins: [],
}
