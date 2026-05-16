import "../tamagui-web.css"

import { useFonts } from "expo-font"
import { Redirect, Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { TamaguiProvider } from "tamagui"
import QueryProvider from "@/components/utils/queryProvider"
import { ThemeProviderCustom, useThemeContext } from "@/context/ThemeContext"
import { UserProvider } from "@/context/user-context"
import { store, useAppDispatch, useAppSelector } from "@/store"
import { fetchCurrentUser, restoreSession } from "@/store/slices/userSlice"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Provider } from "react-redux"
import tamaguiConfig from "../tamagui.config"
// import notifee from "@notifee/react-native"

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
  const { isAuthenticated, isBootstrapping, user } = useAppSelector(
    (state) => state.user,
  )

  const [fontsLoaded] = useFonts({
    Geist: require("../assets/fonts/Geist-VariableFont_wght.ttf"),
    grotesk: require("../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"),
    groteskBold: require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
  })

  useEffect(() => {
    const bootstrap = async () => {
      const result = await dispatch(restoreSession()).unwrap()
      if (result.success) {
        // Token valid → fetch fresh user so role/profile is up to date
        await dispatch(fetchCurrentUser())
      }
    }
    bootstrap()
  }, [])

  useEffect(() => {
    if (fontsLoaded && !isBootstrapping) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isBootstrapping])

  // useEffect(() => {
  //   notifee.requestPermission()
  // }, [])

  // Hold splash until both fonts and session check are done
  if (!fontsLoaded || isBootstrapping) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              {/* All screens declared always — Redirect handles navigation */}
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

            {isAuthenticated && user?.role === "PASSENGER" && (
              <Redirect href="/(passenger)/(tabs)" />
            )}
            {isAuthenticated && user?.role === "DRIVER" && (
              <Redirect href="/(driver)/tabs" />
            )}
            {!isAuthenticated && <Redirect href="/" />}
          </QueryProvider>
        </UserProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
