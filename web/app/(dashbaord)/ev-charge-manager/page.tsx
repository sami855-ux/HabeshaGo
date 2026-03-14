"use client"

import React, { useState, useEffect } from "react"
import { KPICards } from "@/components/ev-owner/dashboard/KPICards"
import { RevenueChart } from "@/components/ev-owner/dashboard/RevenueChart"
import { EnergyChart } from "@/components/ev-owner/dashboard/EnergyChart"
import { SessionsTable } from "@/components/ev-owner/dashboard/SessionTable"
import { QuickActions } from "@/components/ev-owner/dashboard/QuickActions"
import {
  generateMockSessions,
  generateTrendData,
  generateStationPerformance,
} from "@/data/mock-audit-logs"
import { KpiCardData, ChargingSession, ChartDataPoint } from "@/types/charging"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Zap,
  Activity,
  Calendar,
  DollarSign,
  Battery,
  Bell,
  RefreshCw,
  Menu,
  Sun,
  Moon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

export default function EVChargingDashboard() {
  const [sessions, setSessions] = useState<ChargingSession[]>([])
  const [trendData, setTrendData] = useState<ChartDataPoint[]>([])
  const [stationPerformance, setStationPerformance] = useState([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { theme, setTheme } = useTheme()

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setSessions(generateMockSessions())
    setTrendData(generateTrendData())
    setStationPerformance(generateStationPerformance())
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadData()
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  // KPI Data
  const kpis: KpiCardData[] = [
    {
      title: "Total Stations",
      value: "12",
      change: 2,
      icon: <MapPin className="h-5 w-5" />,
      description: "Active locations across the city",
      trend: "up",
    },
    {
      title: "Total Chargers",
      value: "48",
      change: 5,
      icon: <Zap className="h-5 w-5" />,
      description: "Installed charging units",
      trend: "up",
    },
    {
      title: "Active Chargers",
      value: "42",
      change: -1,
      icon: <Activity className="h-5 w-5" />,
      description: "Currently online and available",
      trend: "down",
    },
    {
      title: "Today's Sessions",
      value: "156",
      change: 12,
      icon: <Calendar className="h-5 w-5" />,
      description: "+23 vs yesterday",
      trend: "up",
    },
    {
      title: "Revenue (Today)",
      value: "$3,245",
      change: 8.5,
      icon: <DollarSign className="h-5 w-5" />,
      description: "Avg $20.80/session",
      trend: "up",
    },
    {
      title: "Energy Delivered",
      value: "1,892 kWh",
      change: 15,
      icon: <Battery className="h-5 w-5" />,
      description: "Total energy today",
      trend: "up",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-md pt-3">
        <div className="container mx-auto ">
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
                onClick={handleRefresh}
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
      <main className="container mx-auto space-y-6">
        {/* Last Updated */}
        <div className="flex justify-end">
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
        <div className="grid grid-cols-5 gap-3">
          {stationPerformance.map((station: any, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950/30 rounded-lg p-3  hover:shadow-md transition-all cursor-pointer"
            >
              <p className="text-xs font-medium text-muted-foreground">
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
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${station.utilization}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sessions Table and Quick Actions */}
        <div className="">
          <div className="">
            <div className="backdrop-blur-sm rounded-xl  p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Recent Charging Sessions
              </h2>
              <SessionsTable data={sessions.slice(0, 20)} />
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <footer className="text-xs text-muted-foreground text-center py-4 border-t border-green-100 dark:border-green-900">
          <div className="flex items-center justify-between">
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
  )
}
