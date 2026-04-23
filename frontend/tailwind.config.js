/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  lightMode: 'class', // <--- INI KUNCI UTAMANYA BRO! (Wajib ada)
  theme: {
    extend: {},
  },
  plugins: [],
}