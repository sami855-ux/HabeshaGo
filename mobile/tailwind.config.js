/** @type {import('tailwindcss').Config} */
module.exports = {
  // 👇 Include *all* files where you might use Tailwind classes
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        geist: ["Geist"],
        jakarta: ["jakarta"],
        grotesk: ["grotesk"],
      },
    },
  },
  plugins: [],
};