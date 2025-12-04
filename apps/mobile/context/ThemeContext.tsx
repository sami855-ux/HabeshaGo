import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme } from "react-native"

type ThemeMode = "light" | "dark" | "system"
type ActualTheme = "light" | "dark"

interface ThemeContextType {
  theme: ThemeMode
  actualTheme: ActualTheme
  setTheme: (t: ThemeMode) => void
  colors: ThemeColors
}

interface ThemeColors {
  background: string
  card: string
  primary: string
  text: string
  mutedText: string
  border: string
  success: string
  error: string
  icon: string
}

const lightColors: ThemeColors = {
  background: "#FFFFFF",
  card: "#F8F9FB",
  primary: "#0A84FF",
  text: "#111111",
  mutedText: "#6B7280",
  border: "#E5E7EB",
  success: "#34C759",
  error: "#FF3B30",
  icon: "#3A3A3C",
}

const darkColors: ThemeColors = {
  background: "#000000",
  card: "#1C1C1E",
  primary: "#0A84FF",
  text: "#F2F2F7",
  mutedText: "#8E8E93",
  border: "#2C2C2E",
  success: "#30D158",
  error: "#FF453A",
  icon: "#D1D1D6",
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProviderCustom({
  children,
}: {
  children: React.ReactNode
}) {
  const systemTheme = useColorScheme() ?? "light"

  const [theme, setThemeState] = useState<ThemeMode>("system")

  const actualTheme: ActualTheme = theme === "system" ? systemTheme : theme

  const colors = actualTheme === "dark" ? darkColors : lightColors

  const setTheme = async (t: ThemeMode) => {
    setThemeState(t)
    await AsyncStorage.setItem("appTheme", t)
  }

  useEffect(() => {
    ;(async () => {
      const saved = await AsyncStorage.getItem("appTheme")
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeState(saved)
      }
    })()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useThemeContext used outside provider")
  return ctx
}
