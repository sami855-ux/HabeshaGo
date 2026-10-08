"use client"

import React, { useEffect } from "react"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import Sidebar from "@/components/user-dashboard/Sidebar"
import Header from "@/components/user-dashboard/Header"
import { useRequireRole } from "@/hooks/useRequireRole"
import IntroOverlay from "@/components/IntroOverlay"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useOAuthExchange } from "@/hooks/useOAuthExchange"
import { cn } from "@/lib/utils"
import { Ticket } from "lucide-react"

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  const dispatch = useAppDispatch()
  const { user, accessToken, isReady, isAuthenticated } = useAppSelector(
    (state) => state.user,
  )

  useEffect(() => {
    if (!isReady || !isAuthenticated || !accessToken) return

    dispatch(fetchUserWallet())
  }, [isReady, isAuthenticated, accessToken, dispatch])

  // ✅ Block render completely until authenticated passenger
  if (!isReady || !isAuthenticated || !user || user.role !== "PASSENGER") {
    return <AccountSetupLoader />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <IntroOverlay />
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto p-1 md:p-3 bg-background">
          <div className="bg-background p-2">{children}</div>
        </main>
      </div>
    </div>
  )
}

function UserLayout({ children }: { children: React.ReactNode }) {
  useRequireRole(["PASSENGER"])
  useOAuthExchange()

  return (
    <SidebarProvider>
      <UserLayoutContent>{children}</UserLayoutContent>
    </SidebarProvider>
  )
}

export function AccountSetupLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-3 font-inter select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing colored ring */}
        <div className="h-10 w-10 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
        {/* Inner colored brand icon */}
        <div className="absolute flex items-center justify-center text-orange-500">
          <Ticket className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
        <span className="text-xs font-medium text-muted-foreground">
          Loading travel portal...
        </span>
      </div>
    </div>
  )
}

export default UserLayout
