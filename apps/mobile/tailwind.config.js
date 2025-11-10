module.exports = {
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
        jakarta: ["jakarta"],
        geist: ["Geist"],
        grotesk: ["grotesk"],
        groteskBold: ["groteskBold"],
      },
      colors: {
        // Light Mode Colors
        light: {
          bg: {
            primary: "#f9fafb",
            secondary: "#ffffff",
            tertiary: "#f3f4f6",
          },
          button: {
            primary: {
              bg: "#2563eb",
              text: "#ffffff",
              hover: "#1d4ed8",
            },
            secondary: {
              bg: "#06b6d4",
              text: "#ffffff",
              hover: "#0891b2",
            },
            ghost: {
              bg: "transparent",
              text: "#374151",
              hover: "#f3f4f6",
            },
          },
          text: {
            primary: "#1f2937",
            secondary: "#6b7280",
            inverse: "#ffffff",
          },
          border: "#e5e7eb",
        },

        // Dark Mode Colors
        dark: {
          bg: {
            primary: "#111827",
            secondary: "#1f2937",
            tertiary: "#374151",
          },
          button: {
            primary: {
              bg: "#3b82f6",
              text: "#ffffff",
              hover: "#2563eb",
            },
            secondary: {
              bg: "#06b6d4",
              text: "#ffffff",
              hover: "#0891b2",
            },
            ghost: {
              bg: "transparent",
              text: "#d1d5db",
              hover: "#374151",
            },
          },
          text: {
            primary: "#f9fafb",
            secondary: "#d1d5db",
            inverse: "#1f2937",
          },
          border: "#374151",
        },
      },
    },
  },
  plugins: [],
};
