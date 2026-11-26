/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      colors: {
        cream: "#FFFBEB",
        forest: { 900: "#052e16", 800: "#064e2b", 700: "#065f46" },
      },
    },
  },
  plugins: [],
};
