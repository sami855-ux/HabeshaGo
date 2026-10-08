"use client"

import { useState } from "react"
import { fetchKpis } from "@/services/admin-stats"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bus,
  Car,
  Zap,
  Ticket,
  Users,
  MapPin,
  Route,
  Battery,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  LineChart as LineChartIcon,
  BarChart3,
  Map,
  Wrench,
  AlertTriangle,
  Activity,
  Tag,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

// Chart data
const ticketSalesData = [
  { day: "Mon", tickets: 1850, revenue: 12500 },
  { day: "Tue", tickets: 2150, revenue: 14500 },
  { day: "Wed", tickets: 2800, revenue: 18500 },
  { day: "Thu", tickets: 2540, revenue: 16500 },
  { day: "Fri", tickets: 3200, revenue: 21000 },
  { day: "Sat", tickets: 3847, revenue: 24500 },
  { day: "Sun", tickets: 2940, revenue: 19500 },
]

const parkingRevenueData = [
  { month: "Jan", revenue: 65000, occupancy: 65 },
  { month: "Feb", revenue: 72000, occupancy: 68 },
  { month: "Mar", revenue: 81000, occupancy: 72 },
  { month: "Apr", revenue: 89000, occupancy: 75 },
  { month: "May", revenue: 92000, occupancy: 78 },
  { month: "Jun", revenue: 98000, occupancy: 82 },
]

// Activity feed data
const activityData = [
  {
    id: 1,
    type: "ticket",
    description: "Ticket #HG-8821 booked - Addis to Hawassa",
    user: "Abebe Kebede",
    time: "2 mins ago",
    status: "completed",
  },
  {
    id: 2,
    type: "driver",
    description: "Driver check-in verified - Bus #B-142",
    user: "Dawit Tadesse",
    time: "15 mins ago",
    status: "active",
  },
  {
    id: 3,
    type: "maintenance",
    description: "Bole Station #EV-04 inspection finished",
    user: "Tech Team",
    time: "42 mins ago",
    status: "completed",
  },
  {
    id: 4,
    type: "dispute",
    description: "Refund approved - Seat rebooked #T-1987",
    user: "Sara Hailu",
    time: "1 hour ago",
    status: "pending",
  },
  {
    id: 5,
    type: "ticket",
    description: "QR Pass scanned at Stadium Terminal",
    user: "Yohannes M.",
    time: "2 hours ago",
    status: "completed",
  },
]

const evChargingData = [
  { station: "Meskel Square Station", usage: 85, status: "active" },
  { station: "Bole Medhanialem EV-1", usage: 92, status: "active" },
  { station: "Megenagna Transit Hub", usage: 45, status: "active" },
  { station: "Sarbet Terminal EV-2", usage: 78, status: "maintenance" },
  { station: "Piassa City Lot", usage: 60, status: "active" },
]

// Quick access panels
const quickAccessPanels = [
  {
    title: "Manage Buses",
    icon: Bus,
    description: "Fleet & scheduling",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/60",
    count: 142,
    path: "/admin/manage-bus",
  },
  {
    title: "Manage Routes",
    icon: Route,
    description: "Intercity routes",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60",
    count: 28,
    path: "/admin/manage-route",
  },
  {
    title: "Parking Stations",
    icon: MapPin,
    description: "City parking hubs",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/60",
    count: 18,
    path: "/admin/manage-parking",
  },
  {
    title: "EV Stations",
    icon: Battery,
    description: "Charging points",
    color: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200/60",
    count: 45,
    path: "/admin/infrastructure/ev-stations",
  },
  {
    title: "Drivers & Staff",
    icon: Users,
    description: "Personnel records",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60",
    count: 89,
    path: "/admin/manage-staff",
  },
  {
    title: "Promo Codes",
    icon: Tag,
    description: "Discounts & loyalty",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60",
    count: 12,
    path: "/admin/add-promo-code",
  },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d">("7d")
  const [selectedFleetTab, setSelectedFleetTab] = useState<"all" | "bus" | "parking" | "ev">("all")

  const {
    data: kpis = [],
    isLoading: kpisLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async () => {
      const result = await fetchKpis()
      if (!result.success) {
        throw new Error(result.message)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  // Default fallback KPIs for clean preview when backend is not connected
  const fallbackKpis = [
    {
      title: "Total Booked Tickets",
      value: "18,492",
      subtitle: "ETB 2,410,500 total revenue",
      change: "+12.4%",
      trend: "up" as const,
      details: "420 trips operated this week",
    },
    {
      title: "Active Fleet Vehicles",
      value: "142 Buses",
      subtitle: "94.2% on-time dispatch rate",
      change: "+3.1%",
      trend: "up" as const,
      details: "8 buses undergoing scheduled service",
    },
    {
      title: "EV Charging Sessions",
      value: "1,280 kWh",
      subtitle: "45 stations online",
      change: "+8.6%",
      trend: "up" as const,
      details: "Peak usage 7:00 AM - 10:00 AM",
    },
    {
      title: "Parking Occupancy",
      value: "78%",
      subtitle: "18 city terminals active",
      change: "-1.2%",
      trend: "down" as const,
      details: "340 vacant bays available",
    },
  ]

  const displayKpis = kpis && kpis.length > 0 ? kpis : fallbackKpis

  const KPI_ICONS = [Ticket, Bus, Zap, Car]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400">
            Completed
          </span>
        )
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400">
            Active
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400">
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        )
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <Ticket className="h-3.5 w-3.5 text-emerald-600" />
      case "driver":
        return <Users className="h-3.5 w-3.5 text-blue-600" />
      case "maintenance":
        return <Wrench className="h-3.5 w-3.5 text-amber-600" />
      case "dispute":
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-600" />
    }
  }

  return (
    <div
      style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
      className="w-full max-w-[1600px] mx-auto p-4 sm:p-5 lg:p-6 space-y-4 font-inter text-slate-900 dark:text-foreground"
    >
      {/* Page Header with Time Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-foreground leading-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
            Real-time fleet operations, ticket booking metrics, and transit performance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Time Filter Pills */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-muted rounded-lg border border-slate-200/70 dark:border-border text-xs">
            <button
              onClick={() => setTimeRange("today")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                timeRange === "today"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                timeRange === "7d"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50 dark:border-border"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 text-slate-500 ${
                isRefetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error alert if fetch failed */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading live metrics: {(error as Error).message}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpisLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-card border-slate-200/80 dark:border-border shadow-xs p-4 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-7 w-28 mb-3" />
                <Skeleton className="h-3 w-36 pt-2" />
              </Card>
            ))
          : displayKpis.slice(0, 4).map((kpi, index) => {
              const Icon = KPI_ICONS[index] || Bus
              const isUp = kpi.trend === "up"

              return (
                <Card
                  key={index}
                  className="bg-white dark:bg-card border-slate-200/80 dark:border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all rounded-xl"
                >
                  <CardContent className="p-3.5 sm:p-4">
                    {/* Header Row: Icon + Trend Badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isUp
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-400"
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{kpi.change}</span>
                      </div>
                    </div>

                    {/* Title + Value */}
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
                        {kpi.title}
                      </p>
                      <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground tabular-nums">
                        {kpi.value}
                      </p>
                    </div>

                    {/* Subtitle / Details */}
                    {(kpi.subtitle || kpi.details) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-border/60 text-[11px] text-slate-500 dark:text-muted-foreground flex items-center justify-between">
                        <span className="truncate">{kpi.subtitle || kpi.details}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">vs prev</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Quick Access Modules */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            Quick Operations
          </h2>
          <span className="text-[11px] text-slate-400">6 Primary Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickAccessPanels.map((panel, index) => (
            <div
              key={index}
              onClick={() => panel.path && router.push(panel.path)}
              className="bg-white dark:bg-card border border-slate-200/80 dark:border-border hover:border-emerald-300 dark:hover:border-emerald-700/60 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-lg border ${panel.color}`}
                >
                  <panel.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {panel.count}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {panel.title}
                  </h3>
                  <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate mt-0.5">
                  {panel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Primary Trends & Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Ticket Sales Trend */}
        <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border shadow-xs rounded-xl">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-slate-900 dark:text-foreground">
                <LineChartIcon className="h-4 w-4 text-emerald-600" />
                Ticket Sales & Revenue
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Weekly intercity bookings across Ethiopia
              </CardDescription>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              +12.5% this week
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ticketSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tickets"
                    name="Tickets"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#ticketGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (ETB)"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#6366F1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Parking Revenue & Occupancy */}
        <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border shadow-xs rounded-xl">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-slate-900 dark:text-foreground">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Parking Revenue & Occupancy
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Monthly bay utilization and earnings
              </CardDescription>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              +8.3% vs target
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parkingRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue (ETB)"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="occupancy"
                    name="Occupancy %"
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Live Activity Feed & EV Charging Station Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Recent Operational Activity */}
        <Card className="lg:col-span-2 bg-white dark:bg-card border-slate-200/80 dark:border-border shadow-xs rounded-xl">
          <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-slate-900 dark:text-foreground">
                <Activity className="h-4 w-4 text-emerald-600" />
                Live System Activity
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Latest transactions, driver check-ins, and refunds
              </CardDescription>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time feed
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold text-slate-400 h-8">Action</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-400 h-8">Details</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-400 h-8">User</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-400 h-8">Time</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-400 h-8 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityData.map((activity) => (
                    <TableRow key={activity.id} className="border-slate-100 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          {getActivityIcon(activity.type)}
                          <span className="text-xs font-medium capitalize text-slate-700 dark:text-slate-200">
                            {activity.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-medium text-slate-900 dark:text-foreground">
                        {activity.description}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-slate-500 dark:text-slate-400">
                        {activity.user}
                      </TableCell>
                      <TableCell className="py-2.5 text-[11px] text-slate-400">
                        {activity.time}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        {getStatusBadge(activity.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* EV Station Snapshot */}
        <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border shadow-xs rounded-xl">
          <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-slate-900 dark:text-foreground">
                <Battery className="h-4 w-4 text-teal-600" />
                EV Charging Stations
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Hub capacity & live utilization
              </CardDescription>
            </div>
            <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/50">
              38/45 Active
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            {evChargingData.map((station, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                    {station.station}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {station.usage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={station.usage}
                    className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 flex-1"
                  />
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                      station.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {station.status === "active" ? "Online" : "Service"}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-100 dark:border-border flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 98.4% uptime
              </span>
              <button
                onClick={() => router.push("/admin/infrastructure/ev-stations")}
                className="text-emerald-700 font-medium hover:underline text-[11px]"
              >
                View all stations →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Live Transit Map & Fleet Operations Summary */}
      <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="p-4 pb-2.5 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-slate-900 dark:text-foreground">
              <Map className="h-4 w-4 text-emerald-600" />
              Live Transit & Station Map
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500">
              Active buses on transit corridors, charging hubs, and terminal bays
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-muted rounded-md text-[11px]">
              <button
                onClick={() => setSelectedFleetTab("all")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  selectedFleetTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFleetTab("bus")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  selectedFleetTab === "bus" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                Buses
              </button>
              <button
                onClick={() => setSelectedFleetTab("parking")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  selectedFleetTab === "parking" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                Parking
              </button>
              <button
                onClick={() => setSelectedFleetTab("ev")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  selectedFleetTab === "ev" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                EV
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1">
          {/* Simulated Transit Map Visual */}
          <div className="relative h-56 rounded-lg bg-slate-900 text-white overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Grid background effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Simulated route lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
              <path
                d="M 50 160 Q 200 40 400 110 T 750 80"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M 120 40 Q 320 180 580 90 T 900 170"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
              />
            </svg>

            {/* Map nodes */}
            <div className="absolute left-[15%] top-[30%] flex items-center gap-1.5 bg-slate-800/90 border border-emerald-500/50 px-2 py-1 rounded-md text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Bus #HG-101 (Hawassa Express)</span>
            </div>

            <div className="absolute left-[52%] top-[45%] flex items-center gap-1.5 bg-slate-800/90 border border-blue-500/50 px-2 py-1 rounded-md text-[11px]">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span>Stadium Terminal (84% Full)</span>
            </div>

            <div className="absolute right-[18%] top-[25%] flex items-center gap-1.5 bg-slate-800/90 border border-teal-500/50 px-2 py-1 rounded-md text-[11px]">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span>Bole Hub EV Charger #02</span>
            </div>

            {/* Map corner legend */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-md px-2.5 py-1.5 flex items-center gap-3 text-[10px] text-slate-300">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active Bus
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Parking Bay
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-teal-500" /> EV Station
              </span>
            </div>
          </div>

          {/* 4 Bottom Highlights */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-border">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-muted/40 text-center">
              <p className="text-base font-bold text-slate-900 dark:text-foreground">142</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Active Buses</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-muted/40 text-center">
              <p className="text-base font-bold text-slate-900 dark:text-foreground">18</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Parking Lots</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-muted/40 text-center">
              <p className="text-base font-bold text-slate-900 dark:text-foreground">45</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">EV Chargers</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-muted/40 text-center">
              <p className="text-base font-bold text-emerald-600">94.8%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">On-Time Performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
