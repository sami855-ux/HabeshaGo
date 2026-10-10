/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        inter: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        geist: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        sora: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        roboto: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        mozilla: ["Mozilla Headline", "sans-serif"],
        grotesk: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
}
