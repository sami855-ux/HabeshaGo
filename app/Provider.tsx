"use client"

import { ReactNode, FC } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ui/themeProvider"
import SessionProvider from "@/lib/accessTokenProvider"
import { QueryProvider } from "@/lib/QueryProvider"

interface AppProviderProps {
  children: ReactNode
}

const ToastIcon = ({ color }: { color: string }) => (
  <div
    className={`flex h-5 w-5 items-center justify-center rounded-full bg-[${color}]/10`}
  >
    <div className={`h-2.5 w-2.5 rounded-full bg-[${color}]`} />
  </div>
)

const AppProvider: FC<AppProviderProps> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster
          position="top-right"
          expand={false}
          visibleToasts={3}
          duration={4000}
          gap={10}
          theme="system"
          className="toaster-group"
          closeButton
          richColors
          toastOptions={{
            className: "glass-toast group",
            descriptionClassName: "text-sm text-muted-foreground/90",
          }}
          icons={{
            success: <ToastIcon color="green-500" />,
            error: <ToastIcon color="destructive" />,
            warning: <ToastIcon color="amber-500" />,
            info: <ToastIcon color="blue-500" />,
          }}
        />

        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
}

export default AppProvider
