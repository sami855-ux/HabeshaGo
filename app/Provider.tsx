"use client"

import { ReactNode, FC } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ui/themeProvider"

interface AppProviderProps {
  children: ReactNode
}

const AppProvider: FC<AppProviderProps> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        {children}
      </ThemeProvider>
    </ReduxProvider>
  )
}

export default AppProvider
