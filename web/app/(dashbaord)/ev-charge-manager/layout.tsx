"use client"

import React from "react"

import { SidebarProvider, useSidebar } from "@/context/sidebar-context"
import { useRequireRole } from "@/hooks/useRequireRole"
import { cn } from "@/lib/utils"
import Sidebar from "@/components/ev-owner/Sidebar"
import EvOwnerHeader from "@/components/ev-owner/Header"

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

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
        <EvOwnerHeader />

        <main className="flex-1 overflow-auto p-1 md:p-3 bg-background">
          <div className="bg-background p-2">{children}</div>
        </main>
      </div>
    </div>
  )
}

function UserLayout({ children }: { children: React.ReactNode }) {
  //   useRequireRole(["PASSENGER"])

  return (
    <SidebarProvider>
      <UserLayoutContent>{children}</UserLayoutContent>
    </SidebarProvider>
  )
}

export default UserLayout
