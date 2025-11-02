import {
  Alata_400Regular,
  useFonts as useAlata,
} from "@expo-google-fonts/alata";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts as useInter,
} from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  useFonts as useJakarta,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import SafeScreen from "@/components/SafeScreen";
import { store } from "@/store/main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useFonts } from "expo-font";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_700Bold });
  const [jakartaLoaded] = useJakarta({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
  });
  const [alataLoaded] = useAlata({ Alata_400Regular });

  const fontsLoaded = interLoaded && jakartaLoaded && alataLoaded;

  const [loaded] = useFonts({
    Geist: require("../assets/fonts/Geist-VariableFont_wght.ttf"),
    grotesk: require("../assets/fonts/SpaceGrotesk-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !loaded) return null;

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        {/* React Query Provider */}
        <QueryClientProvider client={queryClient}>
          <SafeScreen>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="auth/phone/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="auth/email/index"
                options={{ headerShown: false }}
              />
            </Stack>
          </SafeScreen>

          {/* Devtools (only visible in development) */}
          {__DEV__ && <ReactQueryDevtools initialIsOpen={false} />}

          <StatusBar barStyle={"dark-content"} />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
