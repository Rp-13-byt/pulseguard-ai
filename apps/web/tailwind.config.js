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
          dark: '#090D16',
          card: '#111827',
          cardBorder: '#1F2937',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          indigo: '#6366F1',
        },
      },
    },
  },
  plugins: [],
}
