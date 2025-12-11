module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // BetterAuth module resolver
      [
        "module-resolver",
        {
          alias: {
            "better-auth/react":
              "./node_modules/better-auth/dist/client/react/index.cjs",
            "better-auth/client/plugins":
              "./node_modules/better-auth/dist/client/plugins/index.cjs",
            "@better-auth/expo/client":
              "./node_modules/@better-auth/expo/dist/client.cjs",
          },
        },
      ],
      // Tamagui plugin
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === "development",
        },
      ],
      // Reanimated plugin
      "react-native-reanimated/plugin",
    ],
  }
}
