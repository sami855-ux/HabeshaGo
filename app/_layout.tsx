import "../tamagui-web.css"

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { TamaguiProvider } from "tamagui"

import QueryProvider from "@/components/utils/queryProvider"
import { ThemeProviderCustom, useThemeContext } from "@/context/ThemeContext"
import { store } from "@/store"
import { Provider } from "react-redux"
import tamaguiConfig from "../tamagui.config"

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <AppWithTheme />
    </ThemeProviderCustom>
  )
}

function AppWithTheme() {
  const { actualTheme } = useThemeContext()

  const [fontsLoaded] = useFonts({
    Geist: require("../assets/fonts/Geist-VariableFont_wght.ttf"),
    grotesk: require("../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"),
    groteskBold: require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={actualTheme}>
      <ThemeProvider value={actualTheme === "dark" ? DarkTheme : DefaultTheme}>
        <QueryProvider>
          <Provider store={store}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="(auth)/email"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/phone"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="(passenger)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(driver)" options={{ headerShown: false }} />
            </Stack>
          </Provider>
        </QueryProvider>
      </ThemeProvider>
    </TamaguiProvider>
  )
}
