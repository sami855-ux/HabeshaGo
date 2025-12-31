"use client"

import { ReactNode, FC } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ui/themeProvider"
import SessionProvider from "@/lib/accessTokenProvider"

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
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
}

export default AppProvider
