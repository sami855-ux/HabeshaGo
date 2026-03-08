import { Stack } from "expo-router"
import { StatusBar, useColorScheme } from "react-native"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  )
}
