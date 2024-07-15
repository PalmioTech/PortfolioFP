/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      lightBlack: "#010103",
      orange: "#ea580c",
      whiteText: "#f5f6f5",
    },
  },
  plugins: [require("tailwind-scrollbar"), require("tailwindcss-animated")],
};
