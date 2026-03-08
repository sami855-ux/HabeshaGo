import "../tamagui-web.css"

import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { TamaguiProvider } from "tamagui"

import QueryProvider from "@/components/utils/queryProvider"
import { ThemeProviderCustom, useThemeContext } from "@/context/ThemeContext"
import { UserProvider } from "@/context/user-context"
import { store, useAppDispatch, useAppSelector } from "@/store"
import { restoreSession } from "@/store/slices/userSlice"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Provider } from "react-redux"
import tamaguiConfig from "../tamagui.config"

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <Provider store={store}>
        <AppWithTheme />
      </Provider>
    </ThemeProviderCustom>
  )
}

function AppWithTheme() {
  const { actualTheme } = useThemeContext()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isBootstrapping } = useAppSelector(
    (state) => state.user,
  )
  const [fontsLoaded] = useFonts({
    Geist: require("../assets/fonts/Geist-VariableFont_wght.ttf"),
    grotesk: require("../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"),
    groteskBold: require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
  })

  // 👇 Restore session on startup
  useEffect(() => {
    dispatch(restoreSession())
  }, [])

  // 👇 Hide splash when fonts loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded || isBootstrapping) return null // or a <SplashScreen />

  return (
    <GestureHandlerRootView>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={actualTheme}>
        <UserProvider>
          <QueryProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor:
                    actualTheme === "dark" ? "#1A1A1A" : "#FFFFFF",
                },
              }}
            >
              {/* 👇 Auth-based routing */}
              {isAuthenticated ? (
                <>
                  <Stack.Screen
                    name="(passenger)"
                    options={{ headerShown: false, animation: "fade" }}
                  />
                  <Stack.Screen
                    name="(driver)"
                    options={{ headerShown: false }}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen
                    name="index"
                    options={{ headerShown: false, animation: "fade" }}
                  />
                  <Stack.Screen
                    name="(auth)/email"
                    options={{
                      headerShown: false,
                      animation: "slide_from_right",
                    }}
                  />
                  <Stack.Screen
                    name="(auth)/phone"
                    options={{
                      headerShown: false,
                      animation: "slide_from_right",
                    }}
                  />
                </>
              )}
            </Stack>
          </QueryProvider>
        </UserProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
