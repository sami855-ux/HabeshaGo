import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";

import SafeScreen from "@/components/SafeScreen";
import { store } from "@/store/main";

export default function RootLayout() {
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
          </Stack>
        </SafeScreen>
        <StatusBar barStyle={"dark-content"} />
      </Provider>
    </SafeAreaProvider>
  );
}
