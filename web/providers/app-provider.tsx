"use client"

import { ReactNode, FC } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "./theme-provider"
import { SessionProvider } from "./session-provider"
import { QueryProvider } from "./query-provider"

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster
          position="bottom-center"
          visibleToasts={3}
          duration={4000}
        />

        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
}

export default AppProvider
