"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import {
  Activity,
  Battery,
  DollarSign,
  Leaf,
  Users,
  Zap,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Types
type ChargingPoint = {
  id: number
  connectorType: string
  powerKw: number
  status: string
  chargingSpeed: string
  slotNumber?: string
}

type ChargingSession = {
  id: number
  vehicleId: number
  stationId: number
  chargingPointId: number
  userId: string
  startTime: string
  endTime: string | null
  energyConsumedKwh: string
  durationMinutes: number
  totalCost: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
}

type ChargingStation = {
  id: number
  name: string
  location: string
  operator: string
  chargingPoints: ChargingPoint[]
  sessions: ChargingSession[]
}

type SessionRow = ChargingSession & {
  stationName: string
  chargerSpeed: "SLOW" | "FAST" | "SUPER_FAST"
}

// Mock Data
const MOCK_STATIONS: ChargingStation[] = [
  {
    id: 1,
    name: "Green Valley EV Hub",
    location: "123 Green Street, Downtown",
    operator: "EcoCharge",
    chargingPoints: [
      {
        id: 101,
        connectorType: "CCS",
        powerKw: 150,
        status: "AVAILABLE",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "A-01",
      },
      {
        id: 102,
        connectorType: "CCS",
        powerKw: 150,
        status: "OCCUPIED",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "A-02",
      },
      {
        id: 103,
        connectorType: "TYPE2",
        powerKw: 22,
        status: "AVAILABLE",
        chargingSpeed: "FAST",
        slotNumber: "A-03",
      },
    ],
    sessions: [
      {
        id: 40001,
        vehicleId: 101,
        stationId: 1,
        chargingPointId: 101,
        userId: "user-001",
        startTime: "2026-04-06T08:10:00.000Z",
        endTime: "2026-04-06T09:00:00.000Z",
        energyConsumedKwh: "21.5",
        durationMinutes: 50,
        totalCost: "10.75",
        status: "COMPLETED",
        createdAt: "2026-04-06T08:10:00.000Z",
        updatedAt: "2026-04-06T09:00:00.000Z",
      },
      {
        id: 40002,
        vehicleId: 102,
        stationId: 1,
        chargingPointId: 102,
        userId: "user-015",
        startTime: "2026-04-06T11:20:00.000Z",
        endTime: null,
        energyConsumedKwh: "9.2",
        durationMinutes: 20,
        totalCost: "4.60",
        status: "ACTIVE",
        createdAt: "2026-04-06T11:20:00.000Z",
        updatedAt: "2026-04-06T11:40:00.000Z",
      },
    ],
  },
  {
    id: 2,
    name: "Emerald Charge Point",
    location: "456 Park Avenue",
    operator: "GreenEnergy",
    chargingPoints: [
      {
        id: 201,
        connectorType: "CHADEMO",
        powerKw: 50,
        status: "FAULTED",
        chargingSpeed: "FAST",
        slotNumber: "B-01",
      },
    ],
    sessions: [
      {
        id: 40003,
        vehicleId: 103,
        stationId: 2,
        chargingPointId: 201,
        userId: "user-002",
        startTime: "2026-04-05T14:05:00.000Z",
        endTime: "2026-04-05T14:55:00.000Z",
        energyConsumedKwh: "17.0",
        durationMinutes: 50,
        totalCost: "8.10",
        status: "COMPLETED",
        createdAt: "2026-04-05T14:05:00.000Z",
        updatedAt: "2026-04-05T14:55:00.000Z",
      },
    ],
  },
  {
    id: 3,
    name: "Sustainable Energy Station",
    location: "789 Eco Boulevard",
    operator: "EcoCharge",
    chargingPoints: [
      {
        id: 301,
        connectorType: "CCS",
        powerKw: 180,
        status: "AVAILABLE",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "C-01",
      },
      {
        id: 302,
        connectorType: "TYPE2",
        powerKw: 22,
        status: "OCCUPIED",
        chargingSpeed: "FAST",
        slotNumber: "C-02",
      },
    ],
    sessions: [
      {
        id: 40004,
        vehicleId: 104,
        stationId: 3,
        chargingPointId: 302,
        userId: "user-009",
        startTime: "2026-04-04T19:40:00.000Z",
        endTime: "2026-04-04T20:10:00.000Z",
        energyConsumedKwh: "7.3",
        durationMinutes: 30,
        totalCost: "3.10",
        status: "CANCELLED",
        createdAt: "2026-04-04T19:40:00.000Z",
        updatedAt: "2026-04-04T20:10:00.000Z",
      },
    ],
  },
]

// API Service
const analyticsAPI = {
  getStations: async (): Promise<ChargingStation[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return MOCK_STATIONS
  },
}

// Custom hook
const useAnalyticsQuery = () => {
  return useQuery({
    queryKey: ["analytics-stations"],
    queryFn: analyticsAPI.getStations,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

// Helper functions
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0)

const formatNumber = (value?: string | null) => Number(value ?? 0)

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
]

type DatePreset = "TODAY" | "WEEK" | "MONTH" | "CUSTOM"

// Station Performance Table
const columnHelper = createColumnHelper<{
  stationName: string
  sessions: number
  energy: number
  revenue: number
  status: string
}>()

const stationColumns = [
  columnHelper.accessor("stationName", {
    header: "Station Name",
    cell: (info) => (
      <span className="font-medium text-emerald-700 dark:text-emerald-400">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("sessions", {
    header: "Sessions",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("energy", {
    header: "Energy (kWh)",
    cell: (info) => info.getValue().toFixed(1),
  }),
  columnHelper.accessor("revenue", {
    header: "Revenue",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Badge
        variant={info.getValue() === "ACTIVE" ? "default" : "secondary"}
        className={info.getValue() === "ACTIVE" ? "bg-emerald-600" : ""}
      >
        {info.getValue()}
      </Badge>
    ),
  }),
]

// Custom Table Component
function CustomTable({ data, columns, onRowClick }: any) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-emerald-900 dark:text-emerald-300"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            data.length,
          )}{" "}
          of {data.length}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {value}
              </p>
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {Math.abs(trend)}%
                  </span>
                </div>
              )}
            </div>
            <div
              className={`rounded-full bg-${color}-100 p-3 dark:bg-${color}-950/20`}
            >
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Main Component
export default function EVAnalyticsPage() {
  const {
    data: stations = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAnalyticsQuery()
  const router = useRouter()
  const [datePreset, setDatePreset] = useState<DatePreset>("WEEK")
  const [stationFilter, setStationFilter] = useState("ALL")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Process sessions
  const allSessions = useMemo(() => {
    const rows = stations.flatMap((station) => {
      const speedByPointId = new Map(
        station.chargingPoints.map((point) => [
          point.id,
          point.chargingSpeed as "SLOW" | "FAST" | "SUPER_FAST",
        ]),
      )
      return (station.sessions ?? []).map((session) => ({
        ...session,
        stationName: station.name,
        chargerSpeed: speedByPointId.get(session.chargingPointId) ?? "FAST",
      }))
    })
    return rows
  }, [stations])

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const now = new Date()
    let startBoundary: Date | null = null
    if (datePreset === "TODAY") {
      startBoundary = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (datePreset === "WEEK") {
      startBoundary = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (datePreset === "MONTH") {
      startBoundary = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (datePreset === "CUSTOM" && fromDate) {
      startBoundary = new Date(`${fromDate}T00:00:00`)
    }
    const endBoundary =
      datePreset === "CUSTOM" && toDate ? new Date(`${toDate}T23:59:59`) : null

    return allSessions.filter((session) => {
      const startedAt = new Date(session.startTime)
      const matchesStation =
        stationFilter === "ALL" || session.stationName === stationFilter
      const matchesStart = startBoundary ? startedAt >= startBoundary : true
      const matchesEnd = endBoundary ? startedAt <= endBoundary : true
      return matchesStation && matchesStart && matchesEnd
    })
  }, [allSessions, datePreset, fromDate, toDate, stationFilter])

  // Charger stats
  const chargerStats = useMemo(() => {
    const allPoints = stations.flatMap(
      (station) => station.chargingPoints ?? [],
    )
    const available = allPoints.filter((p) => p.status === "AVAILABLE").length
    const occupied = allPoints.filter((p) => p.status === "OCCUPIED").length
    const offlineOrFault = allPoints.filter(
      (p) => p.status === "OFFLINE" || p.status === "FAULTED",
    ).length
    return { available, occupied, offlineOrFault, total: allPoints.length }
  }, [stations])

  // Overview stats
  const overview = useMemo(() => {
    const totalSessions = filteredSessions.length
    const totalEnergy = filteredSessions.reduce(
      (sum, session) => sum + formatNumber(session.energyConsumedKwh),
      0,
    )
    const totalRevenue = filteredSessions.reduce(
      (sum, session) => sum + formatNumber(session.totalCost),
      0,
    )
    const activeUsers = new Set(
      filteredSessions
        .filter((s) => s.status === "ACTIVE")
        .map((s) => s.userId),
    ).size
    const avgDuration =
      totalSessions > 0
        ? filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0) /
          totalSessions
        : 0
    return {
      totalSessions,
      totalEnergy,
      totalRevenue,
      activeUsers,
      avgDuration,
    }
  }, [filteredSessions])

  // Sessions over time
  const sessionsOverTime = useMemo(() => {
    const buckets = new Map<string, number>()
    filteredSessions.forEach((session) => {
      const key = new Date(session.startTime).toLocaleDateString()
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    })
    return Array.from(buckets.entries()).map(([date, sessions]) => ({
      date,
      sessions,
    }))
  }, [filteredSessions])

  // Usage by hour
  const usageByHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h.toString().padStart(2, "0")}:00`,
      sessions: 0,
    }))
    filteredSessions.forEach((session) => {
      const h = new Date(session.startTime).getHours()
      hours[h].sessions += 1
    })
    return hours
  }, [filteredSessions])

  // Charger type usage
  const chargerTypeUsage = useMemo(() => {
    const counts = { FAST: 0, SLOW: 0, SUPER_FAST: 0 }
    filteredSessions.forEach((session) => {
      counts[session.chargerSpeed] += 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
    }))
  }, [filteredSessions])

  // Station performance
  const stationPerformance = useMemo(() => {
    const map = new Map<
      string,
      { sessions: number; energy: number; revenue: number }
    >()
    filteredSessions.forEach((session) => {
      const current = map.get(session.stationName) ?? {
        sessions: 0,
        energy: 0,
        revenue: 0,
      }
      current.sessions += 1
      current.energy += formatNumber(session.energyConsumedKwh)
      current.revenue += formatNumber(session.totalCost)
      map.set(session.stationName, current)
    })
    return Array.from(map.entries())
      .map(([stationName, data]) => ({
        stationName,
        sessions: data.sessions,
        energy: data.energy,
        revenue: data.revenue,
        status: data.sessions > 0 ? "ACTIVE" : "INACTIVE",
      }))
      .sort((a, b) => b.sessions - a.sessions)
  }, [filteredSessions])

  // Environmental impact
  const environmental = useMemo(() => {
    const totalEnergy = filteredSessions.reduce(
      (sum, session) => sum + formatNumber(session.energyConsumedKwh),
      0,
    )
    return {
      totalEnergy,
      co2SavedKg: totalEnergy * 0.52,
      fuelSavedLiters: totalEnergy * 0.11,
    }
  }, [filteredSessions])

  // Real-time monitoring
  const realTimeMonitoring = useMemo(() => {
    const liveSessions = filteredSessions.filter((s) => s.status === "ACTIVE")
    return {
      liveSessions: liveSessions.length,
      liveUsers: new Set(liveSessions.map((s) => s.userId)).size,
    }
  }, [filteredSessions])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load analytics data.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    EV Infrastructure
                  </p>
                  <h1 className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                    Analytics Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Real-time insights and performance metrics
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Stats Badge */}
              <Badge
                variant="secondary"
                className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                <Activity className="h-3 w-3" />
                <span className="text-xs font-medium">Live Analytics</span>
              </Badge>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-emerald-200 bg-white shadow-sm hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-900/80"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-emerald-200 dark:border-emerald-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900 dark:text-emerald-100">
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Select
                value={datePreset}
                onValueChange={(v: DatePreset) => setDatePreset(v)}
              >
                <SelectTrigger className="border-emerald-200">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAY">Today</SelectItem>
                  <SelectItem value="WEEK">Last 7 Days</SelectItem>
                  <SelectItem value="MONTH">This Month</SelectItem>
                  <SelectItem value="CUSTOM">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue placeholder="Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stations</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.name}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {datePreset === "CUSTOM" && (
                <>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border-emerald-200"
                  />
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border-emerald-200"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatsCard
            title="Total Sessions"
            value={overview.totalSessions}
            icon={Activity}
            trend={12}
            color="emerald"
          />
          <StatsCard
            title="Energy Delivered"
            value={`${overview.totalEnergy.toFixed(1)} kWh`}
            icon={Battery}
            trend={8}
            color="blue"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(overview.totalRevenue)}
            icon={DollarSign}
            trend={15}
            color="green"
          />
          <StatsCard
            title="Active Users"
            value={overview.activeUsers}
            icon={Users}
            trend={5}
            color="purple"
          />
        </motion.div>

        {/* Charts Row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Sessions Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sessionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Charger Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chargerTypeUsage}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {chargerTypeUsage.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Usage by Hour (Peak Hours)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" fontSize={11} interval={3} />
                  <YAxis fontSize={12} />
                  <RechartsTooltip />
                  <Bar
                    dataKey="sessions"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Average session duration: {overview.avgDuration.toFixed(1)}{" "}
                minutes
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Station Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Station Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomTable
                data={stationPerformance}
                columns={stationColumns}
                onRowClick={(row: any) => console.log(row)}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Environmental & Monitoring Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                  <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {environmental.co2SavedKg.toFixed(0)} kg
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Fuel Saved</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {environmental.fuelSavedLiters.toFixed(1)} L
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 p-4 text-center text-white">
                <p className="text-sm opacity-90">Total Green Energy</p>
                <p className="text-2xl font-bold">
                  {environmental.totalEnergy.toFixed(1)} kWh
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                Real-Time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Live Sessions</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {realTimeMonitoring.liveSessions}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {realTimeMonitoring.liveUsers}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg p-2 bg-green-100 dark:bg-green-950/20">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="font-bold text-green-600">
                    {chargerStats.available}
                  </p>
                </div>
                <div className="rounded-lg p-2 bg-yellow-100 dark:bg-yellow-950/20">
                  <p className="text-xs text-muted-foreground">Occupied</p>
                  <p className="font-bold text-yellow-600">
                    {chargerStats.occupied}
                  </p>
                </div>
                <div className="rounded-lg p-2 bg-red-100 dark:bg-red-950/20">
                  <p className="text-xs text-muted-foreground">Offline/Fault</p>
                  <p className="font-bold text-red-600">
                    {chargerStats.offlineOrFault}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
