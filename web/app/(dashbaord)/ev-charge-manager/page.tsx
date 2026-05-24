"use client"

import React from "react"
import { KPICards } from "@/components/ev-owner/dashboard/KPICards"
import { RevenueChart } from "@/components/ev-owner/dashboard/RevenueChart"
import { EnergyChart } from "@/components/ev-owner/dashboard/EnergyChart"
import { SessionsTable } from "@/components/ev-owner/dashboard/SessionTable"
import { useDashboardData } from "@/hooks/useEvDashboardData"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MapPin,
  Zap,
  Activity,
  Calendar,
  DollarSign,
  Battery,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppSelector } from "@/store/store"

export default function EVChargingDashboard() {
  const { isReady, loading } = useAppSelector((state) => state.user)
  const {
    sessions,
    trendData,
    stationPerformance,
    kpis,
    isLoading,
    isFetching,
    error,
    lastUpdated,
    refreshData,
    isRefreshing,
    refetch,
  } = useDashboardData()

  const dashboardLoading = isLoading || isFetching

  // Show loading state
  if (dashboardLoading) {
    return <DashboardSkeleton />
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard: {error.message}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 backdrop-blur-md pt-3 bg-background/95 z-10">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      Overview
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Dashboard / Analytics
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="gap-2 px-3 py-1 bg-green-50 dark:bg-green-950"
                >
                  <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse" />
                  <span className="text-xs font-medium">Live</span>
                </Badge>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="relative"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto space-y-6 pb-6">
          {/* Last Updated with refetch indicator */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isFetching && !isRefreshing && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          {/* KPI Cards */}
          <KPICards kpis={kpis} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={trendData} />
            <EnergyChart data={trendData} />
          </div>

          {/* Station Performance Mini Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stationPerformance.map((station, index) => (
              <div
                key={station.stationId || index}
                className="bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950/30 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer border border-green-100 dark:border-green-900"
              >
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {station.stationName}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    {station.utilization}%
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {station.sessions} sessions
                  </Badge>
                </div>
                <div className="h-1 bg-green-100 dark:bg-green-900 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${station.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sessions Table */}
          <div className="backdrop-blur-sm rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Recent Charging Sessions
              {isFetching && (
                <Badge variant="outline" className="ml-2">
                  Refreshing...
                </Badge>
              )}
            </h2>
            <SessionsTable data={sessions} />
          </div>

          {/* Footer Stats */}
          <footer className="text-xs text-muted-foreground text-center py-4 border-t border-green-100 dark:border-green-900">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p>© 2024 EV Charge Pro. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span>
                  System Status:{" "}
                  <Badge variant="success" className="ml-1">
                    Operational
                  </Badge>
                </span>
                <span>API: 45ms</span>
                <span>v2.1.0</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen container mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
