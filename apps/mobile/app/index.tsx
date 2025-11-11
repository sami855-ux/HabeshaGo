import Welcome from "@/components/welcome"
import { StatusBar } from "react-native"
import "../global.css"

export default function App() {
  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={"dark-content"}
      />
      <Welcome />
    </>
  )
}
