"use client"

import { ReactNode, FC } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ui/themeProvider"
import SessionProvider from "@/lib/accessTokenProvider"
import { QueryProvider } from "@/lib/QueryProvider"
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"

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
        <Toaster
          position="top-center"
          visibleToasts={3}
          duration={4000}
          theme="system"
          toastOptions={{
            classNames: {
              toast:
                "flex items-start gap-4 py-4 px-6 w-[420px] rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 shadow-lg",
              title: "text-sm font-semibold ml-3 text-gray-900 dark:text-white",
              description: "text-sm ml-3 !text-gray-900 dark:!text-gray-300",
            },
          }}
          icons={{
            success: (
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            ),
            error: (
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            ),
            warning: (
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            ),
            info: (
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            ),
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
