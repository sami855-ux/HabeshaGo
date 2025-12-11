const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")
const { withTamagui } = require("@tamagui/metro-plugin")

let config = getDefaultConfig(__dirname)

config.resolver.alias = {
  ...config.resolver.alias,
  "better-auth/client/plugins": "better-auth/dist/client/plugins/index.js", // Points to actual .js (not .cjs)
}

config.resolver.unstable_enablePackageExports = true

// enable CSS for web + RN
config = withNativeWind(config, { input: "./global.css" })

// add Tamagui support
config = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui-web.css",
  cssInterop: true,
})

module.exports = config
