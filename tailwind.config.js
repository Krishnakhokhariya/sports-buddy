/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007BFF",
        accent: "#00C4CC",
        surface: "#F4F7FA",
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Poppins", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
