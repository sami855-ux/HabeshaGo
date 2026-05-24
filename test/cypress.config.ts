import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "https://habesha-go-v2.vercel.app",
    supportFile: "cypress/support/e2e.ts",
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    supportFile: "cypress/support/component.ts",
  },
})
