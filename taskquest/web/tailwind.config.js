/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Baloo 2'", "system-ui", "sans-serif"],
        body: ["'Nunito'", "system-ui", "sans-serif"],
      },
      colors: {
        urgent: "#ff5d73",
        important: "#8b5cf6",
        someday: "#22c1a4",
        brand: {
          50: "#f2f0ff",
          100: "#e6e1ff",
          200: "#c9bdff",
          300: "#a996ff",
          400: "#8b6bff",
          500: "#7c4dff",
          600: "#6a2ff0",
          700: "#5722c4",
          800: "#421a97",
          900: "#2e1270",
        },
      },
      boxShadow: {
        pop: "0 8px 0 0 rgba(0,0,0,0.12)",
        "pop-sm": "0 4px 0 0 rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
