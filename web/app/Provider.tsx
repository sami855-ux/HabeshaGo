"use client"

import { ReactNode, FC, useEffect } from "react"
import { Provider as ReduxProvider, useDispatch } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ui/themeProvider"
import SessionProvider from "@/lib/accessTokenProvider"
import { QueryProvider } from "@/lib/QueryProvider"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

import { getSocket } from "@/services/socket"
import { initializeSocketListeners } from "@/services/socketListner"

interface AppProviderProps {
  children: ReactNode
}

const SocketInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = getSocket()

    if (!socket.connected) {
      socket.connect()
    }

    initializeSocketListeners(dispatch)

    return () => {
      socket.off()
      socket.disconnect()
    }
  }, [dispatch])

  return <>{children}</>
}

const AppProvider: FC<AppProviderProps> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <SocketInitializer>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            position="top-right"
            visibleToasts={3}
            duration={4000}
            icons={{
              success: (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 8px rgba(34,197,94,0.4)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ),
              error: (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 3l6 6M9 3l-6 6"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              ),
              warning: (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 8px rgba(245,158,11,0.4)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 2v5M6 9v1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              ),
              info: (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 8px rgba(59,130,246,0.4)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 5v4M6 3v1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              ),
            }}
            toastOptions={{
              style: {
                fontFamily: "'Geist', sans-serif",
                background: "rgba(10, 10, 15, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#fff",
                borderRadius: "5px",
                padding: "14px 18px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
                letterSpacing: "-0.01em",
                gap: "10px",
              },
              classNames: {
                success: "!border-emerald-500/20",
                error: "!border-red-500/20",
                warning: "!border-amber-500/20",
                info: "!border-blue-500/20",
                description: "!text-white !text-sm !opacity-100",
              },
            }}
          />

          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </SocketInitializer>
    </ReduxProvider>
  )
}

export default AppProvider
