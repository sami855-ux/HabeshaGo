"use client"

import React, { useEffect } from "react"

import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import Sidebar from "@/components/user-dashboard/Sidebar"
import Header from "@/components/user-dashboard/Header"
import { useRequireRole } from "@/hooks/useRequireRole"
import IntroOverlay from "@/components/IntroOverlay"
import { useAppDispatch } from "@/store/store"
import { cn } from "@/lib/utils"

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Fetch wallet once when user area loads
    dispatch(fetchUserWallet())
  }, [dispatch])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Dynamic margin based on sidebar state */}
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

  return (
    <SidebarProvider>
      <IntroOverlay />
      <UserLayoutContent>{children}</UserLayoutContent>
    </SidebarProvider>
  )
}

export default UserLayout
