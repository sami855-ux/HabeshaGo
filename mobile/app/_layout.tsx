import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";

import SafeScreen from "@/components/SafeScreen";
import { store } from "@/store/main";

// Prevent splash screen from auto-hiding before fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist: require("../assets/fonts/Geist-VariableFont_wght.ttf"),
    grotesk: require("../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"),
    groteskBold: require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  console.log("STACK TEST =", Stack);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <SafeScreen>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)/phone"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/email"
              options={{ headerShown: false }}
            />
          </Stack>
        </SafeScreen>

        {/* Status bar */}
        <StatusBar barStyle="dark-content" />
      </Provider>
    </SafeAreaProvider>
  );
}
