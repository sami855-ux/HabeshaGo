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
        inter: ["Inter_400Regular"],
        interBold: ["Inter_700Bold"],
        jakarta: ["PlusJakartaSans_400Regular"],
        jakartaSemi: ["PlusJakartaSans_600SemiBold"],
        alata: ["Alata_400Regular"],
      },
    },
  },
  plugins: [],
};
