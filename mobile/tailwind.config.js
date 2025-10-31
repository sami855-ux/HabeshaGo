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
      colors: {
        // Primary Colors
        deepTeal: "#00897B",
        tealShadow: "#00695C",

        // Accent Colors
        limeGreen: "#C0CA33",
        softEmerald: "#66BB6A",

        // Background Colors
        mistGray: "#F5F5F5",
        warmWhite: "#FAFAFA",

        // Text Colors
        charcoal: "#212121",
        slateGray: "#616161",

        // Status Colors
        coralRed: "#E53935",
        leafGreen: "#43A047",

        // Dark Mode Colors
        deepBlueGray: "#263238",
        offWhite: "#ECEFF1",
      },
    },
  },
  plugins: [],
};
