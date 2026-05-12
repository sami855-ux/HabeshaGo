"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/utils";
import AdminSidebar from "@/components/parking-owner/AdminSidebar";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Content */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}