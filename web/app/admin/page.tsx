"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminMetrics } from "@/components/admin/admin-metrics"
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart"
import { AdminBookingsTable } from "@/components/admin/admin-bookings-table"
import { AdminFleetTracker } from "@/components/admin/admin-fleet-tracker"
import { AdminDriverApprovals } from "@/components/admin/admin-driver-approvals"
import { AdminSystemHealth } from "@/components/admin/admin-system-health"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<string>("overview")
  const [pendingDriverCount, setPendingDriverCount] = React.useState<number>(3)

  const tabLabels: Record<string, string> = {
    overview: "Operations Overview",
    fleet: "Live Fleet Tracking",
    bookings: "Dispatches & Trips",
    drivers: "Driver Approvals",
    vehicles: "Vehicles & Assets",
    "ev-charging": "EV Hubs & Parking",
    finance: "Revenue & Settlements",
    payouts: "Gateway Payouts",
    "system-health": "Microservices Blueprint Status",
    settings: "System Configuration",
  }

  return (
    <SidebarProvider defaultOpen={true} className="font-inter">
      {/* Shadcn Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingDriverCount={pendingDriverCount}
      />

      {/* Shadcn Sidebar Inset Main Layout */}
      <SidebarInset className="bg-slate-50/50 dark:bg-slate-950 min-h-screen flex flex-col font-inter">
        {/* Shadcn Admin Header */}
        <AdminHeader currentTabName={tabLabels[activeTab] || activeTab} />

        {/* Dashboard Content Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Quick Tab Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="orange" className="text-xs font-semibold">
                  Admin Command
                </Badge>
                <span className="text-xs text-slate-400">Addis Ababa Metropolitan Fleet</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-inter">
                {tabLabels[activeTab] || "Operations Dashboard"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time multi-modal monitoring, Telebirr settlement flows, and driver dispatches.
              </p>
            </div>
          </div>

          {/* Conditional View Rendering Based on Active Sidebar Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <AdminMetrics />
              <AdminRevenueChart />
              <AdminBookingsTable />
              <AdminSystemHealth />
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="space-y-6">
              <AdminMetrics />
              <AdminFleetTracker />
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-6">
              <AdminBookingsTable />
            </div>
          )}

          {activeTab === "drivers" && (
            <div className="space-y-6">
              <AdminDriverApprovals onCountChange={setPendingDriverCount} />
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="space-y-6">
              <AdminFleetTracker />
            </div>
          )}

          {activeTab === "ev-charging" && (
            <div className="space-y-6">
              <AdminFleetTracker />
              <AdminSystemHealth />
            </div>
          )}

          {(activeTab === "finance" || activeTab === "payouts") && (
            <div className="space-y-6">
              <AdminMetrics />
              <AdminRevenueChart />
              <AdminBookingsTable />
            </div>
          )}

          {activeTab === "system-health" && (
            <div className="space-y-6">
              <AdminSystemHealth />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <AdminSystemHealth />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
