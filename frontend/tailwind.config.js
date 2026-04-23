/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  light : 'class', // <--- INI KUNCI UTAMANYA BRO! (Wajib ada)
  theme: {
    extend: {},
  },
  plugins: [],
}