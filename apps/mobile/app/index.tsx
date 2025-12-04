import Welcome from "@/components/welcome"
import { StatusBar, useColorScheme } from "react-native"
import "../global.css"

export default function App() {
  const colorScheme = useColorScheme()

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Welcome />
    </>
  )
}
