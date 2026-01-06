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
        {/* Glass Morphism Toaster */}
        <Toaster
          position="top-right"
          expand={false}
          visibleToasts={3}
          duration={4000}
          gap={10}
          theme="system"
          className="toaster-group"
          toastOptions={{
            className: "glass-toast group",
            descriptionClassName: "text-sm text-muted-foreground/90",
          }}
          icons={{
            success: (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
            ),
            error: (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              </div>
            ),
            warning: (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              </div>
            ),
            info: (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              </div>
            ),
          }}
          closeButton
          richColors
        />

        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
}

export default AppProvider
