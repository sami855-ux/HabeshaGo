"use client"

import React from "react"
import Sidebar from "@/components/admin-dashboard/Sidebar"
import Header from "@/components/admin-dashboard/Header"
import { useRequireRole } from "@/hooks/useRequireRole"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { useOAuthExchange } from "@/hooks/useOAuthExchange"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/store"
import { Bus } from "lucide-react"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()
  const { isReady, isAuthenticated, user } = useAppSelector((state) => state.user)

  // ✅ block render until auth is resolved and authenticated
  if (!isReady || !isAuthenticated || !user) {
    return <AccountSetupLoader />
  }

  return (
    <div
      style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
      className="flex min-h-screen bg-slate-50/70 dark:bg-background text-slate-900 dark:text-foreground font-inter antialiased"
    >
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-200",
          isCollapsed ? "lg:ml-[68px]" : "lg:ml-60",
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  useRequireRole([
    "ADMIN",
    "DRIVER",
    "EV_CHARGER_MANAGER",
    "PARKING_MANAGER",
  ])
  useOAuthExchange()

  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}

export function AccountSetupLoader() {
  return (
    <div
      style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
      className="flex min-h-screen flex-col items-center justify-center bg-slate-50/70 dark:bg-background gap-3 font-inter select-none"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing colored ring */}
        <div className="h-11 w-11 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        {/* Inner colored brand icon */}
        <div className="absolute flex items-center justify-center text-emerald-600">
          <Bus className="h-4.5 w-4.5" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Loading admin dashboard...
        </span>
      </div>
    </div>
  )
}

export default AdminLayout
