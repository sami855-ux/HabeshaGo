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
  background: "#FFFFFF", // Light background
  card: "#F8F9FB", // Card background
  primary: "#EA580C", // Primary orange
  text: "#111111", // Main text
  mutedText: "#6B7280", // Muted text
  border: "#E5E7EB", // Borders
  success: "#34C759", // Success
  error: "#FF3B30", // Error
  icon: "#3A3A3C", // Default icons
}

const darkColors: ThemeColors = {
  background: "#1A1A1A", // Softer dark background
  card: "#1C1C1E", // Card background
  primary: "#EA580C", // Primary orange
  text: "#F2F2F7", // Main text
  mutedText: "#8E8E93", // Muted text
  border: "#2C2C2E", // Borders
  success: "#30D158", // Success
  error: "#FF453A", // Error
  icon: "#D1D1D6", // Default icons
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
