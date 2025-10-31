import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  useFonts as useJakarta,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  useFonts as useAlata,
  Alata_400Regular,
} from "@expo-google-fonts/alata";
import * as SplashScreen from "expo-splash-screen";

import SafeScreen from "@/components/SafeScreen";
import { store } from "@/store/main";

export default function RootLayout() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_700Bold });
  const [jakartaLoaded] = useJakarta({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
  });
  const [alataLoaded] = useAlata({ Alata_400Regular });

  const fontsLoaded = interLoaded && jakartaLoaded && alataLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <SafeScreen>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/phone/index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/email/index"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </SafeScreen>
        <StatusBar barStyle={"dark-content"} />
      </Provider>
    </SafeAreaProvider>
  );
}
