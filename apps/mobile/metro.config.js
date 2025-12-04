const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")
const { withTamagui } = require("@tamagui/metro-plugin")

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..") // <-- IMPORTANT!!!

let config = getDefaultConfig(projectRoot)

/**
 * --- FIX 1: Include root node_modules (monorepo fix) ---
 */
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]

/**
 * --- FIX 2: Follow symlinks used in monorepos ---
 */
config.resolver.disableHierarchicalLookup = true

/**
 * --- FIX 3: Watch workspace root so monorepo packages refresh ---
 */
config.watchFolders = [workspaceRoot]

/**
 * Expo plugin resolution fix
 */
config.resolver.unstable_enablePackageExports = true

/**
 * Enable NativeWind (CSS support)
 */
config = withNativeWind(config, {
  input: "./global.css",
})

/**
 * Enable Tamagui
 */
config = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui-web.css",
  cssInterop: true,
})

module.exports = config
