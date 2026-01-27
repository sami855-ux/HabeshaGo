"use client"

import React, { useEffect } from "react"
import Sidebar from "@/components/user-dashboard/Sidebar"
import Header from "@/components/user-dashboard/Header"
import { useRequireRole } from "@/hooks/useRequireRole"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { fetchUserWallet } from "@/store/slices/walletSlice"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
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

        <main className="flex-1 overflow-auto p-1 md:p-3 bg-card">
          <div className="bg-card p-2">{children}</div>
        </main>
      </div>
    </div>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  // useRequireRole(["ADMIN"])

  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}

export default AdminLayout
