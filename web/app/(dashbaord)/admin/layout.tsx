"use client"

import React from "react"
import Sidebar from "@/components/admin-dashboard/Sidebar"
import Header from "@/components/admin-dashboard/Header"
import { useRequireRole } from "@/hooks/useRequireRole"
import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { useOAuthExchange } from "@/hooks/useOAuthExchange"
import { cn } from "@/lib/utils"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto p-1 md:p-3 bg-card">
          <div className="bg-card">{children}</div>
        </main>
      </div>
    </div>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  useRequireRole(["ADMIN"])
  useOAuthExchange()

  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}

export default AdminLayout
