import "../tamagui-web.css"

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
      {/* REMOVED: ThemeProvider from @react-navigation/native */}
      <QueryProvider>
        <Provider store={store}>
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: actualTheme === "dark" ? "#1A1A1A" : "#FFFFFF",
              },
            }}
          >
            <Stack.Screen
              name="index"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen
              name="(auth)/email"
              options={{ headerShown: false, animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="(auth)/phone"
              options={{ headerShown: false, animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="(passenger)"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen name="(driver)" options={{ headerShown: false }} />
          </Stack>
        </Provider>
      </QueryProvider>
    </TamaguiProvider>
  )
}
