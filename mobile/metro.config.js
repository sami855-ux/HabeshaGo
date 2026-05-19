const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

let config = getDefaultConfig(__dirname)

config.resolver.alias = {
  ...config.resolver.alias,
}

config.resolver.unstable_enablePackageExports = true

// enable CSS for web + RN
config = withNativeWind(config, { input: "./global.css" })

module.exports = config
