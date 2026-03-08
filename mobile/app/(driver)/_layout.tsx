import { Stack } from "expo-router"

export default function DriverRootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="qrScanner" options={{ headerShown: false }} />
      <Stack.Screen name="finicialSetting" options={{ headerShown: false }} /> */}
    </Stack>
  )
}
