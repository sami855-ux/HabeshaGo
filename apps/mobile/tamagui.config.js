const { defaultConfig } = require("@tamagui/config/v4")
const { createTamagui } = require("tamagui")

const tamaguiConfig = createTamagui(defaultConfig)

module.exports = tamaguiConfig
