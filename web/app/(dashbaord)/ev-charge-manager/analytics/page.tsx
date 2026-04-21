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
  RadialBarChart,
  RadialBar,
  ComposedChart,
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
  CreditCard,
  Wallet,
  Smartphone,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Receipt,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/services/axiosInstance"
import { cn } from "@/lib/utils"

// Types based on your Prisma models
type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "PROCESSING"
type PaymentMethod = "CARD" | "WALLET" | "MOBILE_MONEY" | "BANK_TRANSFER"
type PaymentGateway = "STRIPE" | "PAYPAL" | "CHAPA" | "FLUTTERWAVE" | "M_PESA"
type PaymentFlow = "INFLOW" | "OUTFLOW"

type Payment = {
  id: number
  userId: string
  amount: number
  currency: string
  method: PaymentMethod
  gateway: PaymentGateway
  flow: PaymentFlow
  pointsUsed: number | null
  pointsValue: number | null
  status: PaymentStatus
  gatewayRef: string | null
  reference: string
  metadata: any
  evReservationId: number | null
  createdAt: string
  updatedAt: string
}

type Reservation = {
  id: number
  vehicleId: number
  chargingPointId: number
  startTime: string
  endTime: string
  reservationCode: string | null
  status: string
  targetBatteryPercentage: number | null
  targetKwh: number | null
  calculatedAmount: number | null
  paymentStatus: PaymentStatus
  preAuthorizedAmount: number | null
  userId: string
  chargingSessionId: number | null
  createdAt: string
}

type ChargingStation = {
  id: number
  name: string
  address: string | null
  city: string | null
  lat: number
  lng: number
  status: string
  isVerified: boolean
  managerId: string
  createdAt: string
  updatedAt: string
}

type ChargingPoint = {
  id: number
  stationId: number
  connectorType: string
  powerKw: number
  status: string
  chargingSpeed: string
  slotNumber: string | null
  maxVoltage: number | null
  maxCurrent: number | null
  averageSessionDuration: number | null
  createdAt: string
  updatedAt: string
}

type ChargingSession = {
  id: number
  vehicleId: number
  stationId: number
  chargingPointId: number
  startTime: string
  endTime: string | null
  meterStart: number | null
  meterEnd: number | null
  energyConsumedKwh: number | null
  durationMinutes: number | null
  energyCost: number | null
  timeCost: number | null
  idleFee: number | null
  totalCost: number | null
  status: string
  userId: string
  createdAt: string
  updatedAt: string
}

type AnalyticsData = {
  stations: ChargingStation[]
  chargingPoints: ChargingPoint[]
  sessions: ChargingSession[]
  payments: Payment[]
  reservations: Reservation[]
}

// API Service
const analyticsAPI = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      const [
        stationsRes,
        pointsRes,
        sessionsRes,
        paymentsRes,
        reservationsRes,
      ] = await Promise.all([
        axiosInstance.get("/analytics/ev/stations"),
        axiosInstance.get("/analytics/ev/charging-points"),
        axiosInstance.get("/analytics/ev/sessions"),
        axiosInstance.get("/analytics/ev/payments"),
        axiosInstance.get("/analytics/ev/reservations"),
      ])

      return {
        stations: stationsRes.data?.data || [],
        chargingPoints: pointsRes.data?.data || [],
        sessions: sessionsRes.data?.data || [],
        payments: paymentsRes.data?.data || [],
        reservations: reservationsRes.data?.data || [],
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error)
      throw new Error(
        error?.response?.data?.message || "Failed to fetch analytics data",
      )
    }
  },
}

// Custom hook
const useAnalyticsQuery = () => {
  return useQuery({
    queryKey: ["analytics-data"],
    queryFn: analyticsAPI.getAnalytics,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

// Helper functions
const formatCurrency = (value: number, currency: string = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value || 0)

const formatNumber = (value?: number | null) => value ?? 0
const formatPercentage = (value: number) => `${value.toFixed(1)}%`

const COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4897", // Pink
  "#84cc16", // Lime
  "#6b7280", // Gray
  "#14b8a6", // Teal
]

type DatePreset = "TODAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR" | "CUSTOM"

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: any) {
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
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : trend < 0 ? (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  ) : (
                    <Minus className="h-3 w-3 text-gray-500" />
                  )}
                  <span
                    className={`text-xs ${
                      trend > 0
                        ? "text-green-600"
                        : trend < 0
                          ? "text-red-600"
                          : "text-gray-500"
                    }`}
                  >
                    {Math.abs(trend)}% {trendValue}
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

// Payment Method Pie Chart
const PaymentMethodChart = ({ payments }: { payments: Payment[] }) => {
  const data = useMemo(() => {
    const methodMap = new Map<string, number>()
    payments.forEach((payment) => {
      if (payment.status === "COMPLETED") {
        methodMap.set(
          payment.method,
          (methodMap.get(payment.method) || 0) + payment.amount,
        )
      }
    })
    return Array.from(methodMap.entries()).map(([method, amount]) => ({
      name: method.replace("_", " "),
      value: amount,
    }))
  }, [payments])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          formatter={(value: number) => formatCurrency(value, "USD")}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Revenue Trend Chart
const RevenueTrendChart = ({ payments }: { payments: Payment[] }) => {
  const data = useMemo(() => {
    const dailyMap = new Map<string, { revenue: number; count: number }>()
    payments
      .filter((p) => p.status === "COMPLETED")
      .forEach((payment) => {
        const date = new Date(payment.createdAt).toLocaleDateString()
        const existing = dailyMap.get(date) || { revenue: 0, count: 0 }
        dailyMap.set(date, {
          revenue: existing.revenue + payment.amount,
          count: existing.count + 1,
        })
      })
    return Array.from(dailyMap.entries())
      .map(([date, { revenue, count }]) => ({ date, revenue, count }))
      .slice(-30)
  }, [payments])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" fontSize={12} interval={6} />
        <YAxis yAxisId="left" fontSize={12} tickFormatter={(v) => `$${v}`} />
        <YAxis yAxisId="right" orientation="right" fontSize={12} />
        <RechartsTooltip
          formatter={(value: number, name: string) => {
            if (name === "revenue") return formatCurrency(value, "USD")
            return value
          }}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="revenue"
          fill="#10b981"
          name="Revenue"
          radius={[8, 8, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          name="Transactions"
          strokeWidth={2}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// Payment Status Distribution
const PaymentStatusChart = ({ payments }: { payments: Payment[] }) => {
  const data = useMemo(() => {
    const statusMap = new Map<string, number>()
    payments.forEach((payment) => {
      statusMap.set(payment.status, (statusMap.get(payment.status) || 0) + 1)
    })
    return Array.from(statusMap.entries()).map(([status, count]) => ({
      name: status,
      value: count,
    }))
  }, [payments])

  const statusColors: Record<string, string> = {
    COMPLETED: "#10b981",
    PENDING: "#f59e0b",
    PROCESSING: "#3b82f6",
    FAILED: "#ef4444",
    REFUNDED: "#6b7280",
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={statusColors[entry.name] || "#6b7280"}
            />
          ))}
        </Pie>
        <RechartsTooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Revenue by Payment Gateway
const GatewayRevenueChart = ({ payments }: { payments: Payment[] }) => {
  const data = useMemo(() => {
    const gatewayMap = new Map<string, number>()
    payments
      .filter((p) => p.status === "COMPLETED")
      .forEach((payment) => {
        gatewayMap.set(
          payment.gateway,
          (gatewayMap.get(payment.gateway) || 0) + payment.amount,
        )
      })
    return Array.from(gatewayMap.entries())
      .map(([gateway, amount]) => ({
        name: gateway.replace("_", " "),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [payments])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => formatCurrency(v, "USD")} />
        <YAxis type="category" dataKey="name" fontSize={12} width={100} />
        <RechartsTooltip
          formatter={(value: number) => formatCurrency(value, "USD")}
        />
        <Bar
          dataKey="amount"
          fill="#8b5cf6"
          name="Revenue"
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Reservation Conversion Funnel
const ReservationFunnel = ({
  reservations,
  sessions,
}: {
  reservations: Reservation[]
  sessions: ChargingSession[]
}) => {
  const data = useMemo(() => {
    const totalReservations = reservations.length
    const confirmedReservations = reservations.filter(
      (r) => r.status === "CONFIRMED",
    ).length
    const completedSessions = sessions.filter(
      (s) => s.status === "COMPLETED",
    ).length
    const paidReservations = reservations.filter(
      (r) => r.paymentStatus === "COMPLETED",
    ).length

    return [
      {
        name: "Reservations Created",
        value: totalReservations,
        fill: "#3b82f6",
      },
      { name: "Confirmed", value: confirmedReservations, fill: "#8b5cf6" },
      { name: "Paid", value: paidReservations, fill: "#10b981" },
      { name: "Sessions Completed", value: completedSessions, fill: "#f59e0b" },
    ]
  }, [reservations, sessions])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" fontSize={12} width={120} />
        <RechartsTooltip />
        <Bar dataKey="value" name="Count" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Daily Payment Volume
const DailyPaymentVolume = ({ payments }: { payments: Payment[] }) => {
  const data = useMemo(() => {
    const volumeMap = new Map<string, { amount: number; count: number }>()
    payments
      .filter((p) => p.status === "COMPLETED")
      .forEach((payment) => {
        const date = new Date(payment.createdAt).toLocaleDateString()
        const existing = volumeMap.get(date) || { amount: 0, count: 0 }
        volumeMap.set(date, {
          amount: existing.amount + payment.amount,
          count: existing.count + 1,
        })
      })
    return Array.from(volumeMap.entries())
      .map(([date, { amount, count }]) => ({ date, amount, count }))
      .slice(-30)
  }, [payments])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} interval={6} />
        <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} />
        <YAxis yAxisId="right" orientation="right" />
        <RechartsTooltip
          formatter={(value: number, name: string) => {
            if (name === "amount") return formatCurrency(value, "USD")
            return value
          }}
        />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.2}
          name="Volume"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          name="Transactions"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Average Transaction Value Trend
const AvgTransactionValue = ({ payments }: { payments: Payment[] }) => {
  const data = useMemo(() => {
    const dailyMap = new Map<string, { total: number; count: number }>()
    payments
      .filter((p) => p.status === "COMPLETED")
      .forEach((payment) => {
        const date = new Date(payment.createdAt).toLocaleDateString()
        const existing = dailyMap.get(date) || { total: 0, count: 0 }
        dailyMap.set(date, {
          total: existing.total + payment.amount,
          count: existing.count + 1,
        })
      })
    return Array.from(dailyMap.entries())
      .map(([date, { total, count }]) => ({
        date,
        avgValue: count > 0 ? total / count : 0,
      }))
      .slice(-30)
  }, [payments])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} interval={6} />
        <YAxis tickFormatter={(v) => formatCurrency(v, "USD")} />
        <RechartsTooltip
          formatter={(value: number) => formatCurrency(value, "USD")}
        />
        <Line
          type="monotone"
          dataKey="avgValue"
          stroke="#8b5cf6"
          name="Avg Transaction Value"
          strokeWidth={2}
          dot={{ fill: "#8b5cf6", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Points Usage Analytics
const PointsUsageChart = ({ payments }: { payments: Payment[] }) => {
  const data = useMemo(() => {
    const pointsPayments = payments.filter(
      (p) => p.pointsUsed && p.pointsUsed > 0,
    )
    const totalPointsUsed = pointsPayments.reduce(
      (sum, p) => sum + (p.pointsUsed || 0),
      0,
    )
    const totalPointsValue = pointsPayments.reduce(
      (sum, p) => sum + (p.pointsValue || 0),
      0,
    )
    const regularPayments = payments.filter(
      (p) => !p.pointsUsed || p.pointsUsed === 0,
    )
    const regularTotal = regularPayments.reduce((sum, p) => sum + p.amount, 0)

    return [
      {
        name: "Points Payments",
        value: totalPointsValue,
        count: pointsPayments.length,
      },
      {
        name: "Regular Payments",
        value: regularTotal,
        count: regularPayments.length,
      },
    ]
  }, [payments])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          <Cell fill="#10b981" />
          <Cell fill="#6b7280" />
        </Pie>
        <RechartsTooltip
          formatter={(value: number) => formatCurrency(value, "USD")}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Loading Skeleton
const AnalyticsSkeleton = () => (
  <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  </div>
)

// Main Component
export default function EVAnalyticsPage() {
  const router = useRouter()
  const [datePreset, setDatePreset] = useState<DatePreset>("WEEK")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAnalyticsQuery()

  // Filter data by date range
  const filteredData = useMemo(() => {
    if (!analytics) return { payments: [], reservations: [], sessions: [] }

    const now = new Date()
    let startBoundary: Date | null = null
    let endBoundary: Date | null = null

    if (datePreset === "TODAY") {
      startBoundary = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (datePreset === "WEEK") {
      startBoundary = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (datePreset === "MONTH") {
      startBoundary = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (datePreset === "QUARTER") {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3
      startBoundary = new Date(now.getFullYear(), quarterMonth, 1)
    } else if (datePreset === "YEAR") {
      startBoundary = new Date(now.getFullYear(), 0, 1)
    } else if (datePreset === "CUSTOM" && fromDate) {
      startBoundary = new Date(`${fromDate}T00:00:00`)
      if (toDate) endBoundary = new Date(`${toDate}T23:59:59`)
    }

    const filterByDate = (dateStr: string) => {
      const date = new Date(dateStr)
      if (startBoundary && date < startBoundary) return false
      if (endBoundary && date > endBoundary) return false
      return true
    }

    return {
      payments: analytics.payments.filter((p) => filterByDate(p.createdAt)),
      reservations: analytics.reservations.filter((r) =>
        filterByDate(r.createdAt),
      ),
      sessions: analytics.sessions.filter((s) => filterByDate(s.createdAt)),
    }
  }, [analytics, datePreset, fromDate, toDate])

  // Payment Statistics
  const paymentStats = useMemo(() => {
    const completed = filteredData.payments.filter(
      (p) => p.status === "COMPLETED",
    )
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0)
    const totalTransactions = filteredData.payments.length
    const successRate =
      totalTransactions > 0 ? (completed.length / totalTransactions) * 100 : 0
    const avgTransaction =
      completed.length > 0 ? totalRevenue / completed.length : 0
    const refundedAmount = filteredData.payments
      .filter((p) => p.status === "REFUNDED")
      .reduce((sum, p) => sum + p.amount, 0)

    return {
      totalRevenue,
      totalTransactions,
      successRate,
      avgTransaction,
      refundedAmount,
      completedCount: completed.length,
    }
  }, [filteredData.payments])

  // Reservation Statistics
  const reservationStats = useMemo(() => {
    const totalReservations = filteredData.reservations.length
    const confirmed = filteredData.reservations.filter(
      (r) => r.status === "CONFIRMED",
    ).length
    const completedSessions = filteredData.sessions.filter(
      (s) => s.status === "COMPLETED",
    ).length
    const conversionRate =
      totalReservations > 0 ? (completedSessions / totalReservations) * 100 : 0

    return {
      totalReservations,
      confirmed,
      completedSessions,
      conversionRate,
    }
  }, [filteredData.reservations, filteredData.sessions])

  if (isLoading) return <AnalyticsSkeleton />

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-7xl px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
            <span>
              {error instanceof Error
                ? error.message
                : "Failed to load analytics data"}
            </span>
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
    <div className="min-h-screen">
      <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
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
                    Real-time insights, payment analytics, and performance
                    metrics
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                <Activity className="h-3 w-3" />
                <span className="text-xs font-medium">Live Analytics</span>
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-emerald-200 bg-white shadow-sm hover:bg-emerald-50"
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

        {/* Date Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-linear-to-br from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Select Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["TODAY", "WEEK", "MONTH", "QUARTER", "YEAR", "CUSTOM"].map(
                  (preset) => (
                    <button
                      key={preset}
                      onClick={() => setDatePreset(preset as DatePreset)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                        datePreset === preset
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                      )}
                    >
                      {preset === "TODAY" && "Today"}
                      {preset === "WEEK" && "Last 7 Days"}
                      {preset === "MONTH" && "This Month"}
                      {preset === "QUARTER" && "This Quarter"}
                      {preset === "YEAR" && "This Year"}
                      {preset === "CUSTOM" && "Custom Range"}
                    </button>
                  ),
                )}
              </div>

              {datePreset === "CUSTOM" && (
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <div>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      placeholder="From Date"
                      className="border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      placeholder="To Date"
                      className="border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(paymentStats.totalRevenue, "ETB")}
            icon={DollarSign}
            trend={12}
            trendValue="vs last period"
            color="emerald"
          />
          <StatsCard
            title="Transactions"
            value={paymentStats.totalTransactions.toLocaleString()}
            icon={CreditCard}
            trend={8}
            trendValue="vs last period"
            color="blue"
          />
          <StatsCard
            title="Success Rate"
            value={formatPercentage(paymentStats.successRate)}
            icon={CheckCircle}
            trend={5}
            trendValue="vs last period"
            color="green"
          />
          <StatsCard
            title="Avg Transaction"
            value={formatCurrency(paymentStats.avgTransaction, "ETB")}
            icon={TrendingUp}
            trend={-2}
            trendValue="vs last period"
            color="purple"
          />
        </motion.div>

        {/* Tabs for different analytics views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="reservations"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Reservations
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Points Usage
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <RevenueTrendChart payments={filteredData.payments} />
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <PaymentMethodChart payments={filteredData.payments} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Daily Payment Volume
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <DailyPaymentVolume payments={filteredData.payments} />
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Average Transaction Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <AvgTransactionValue payments={filteredData.payments} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Payment Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <PaymentStatusChart payments={filteredData.payments} />
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Revenue by Gateway
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <GatewayRevenueChart payments={filteredData.payments} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <PaymentMethodChart payments={filteredData.payments} />
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend (30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <RevenueTrendChart payments={filteredData.payments} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-emerald-200 shadow-sm">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-blue-100 p-3 w-fit mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">
                    {reservationStats.totalReservations}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Reservations
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 shadow-sm">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-purple-100 p-3 w-fit mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">
                    {reservationStats.confirmed}
                  </p>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 shadow-sm">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-emerald-100 p-3 w-fit mx-auto mb-3">
                    <Zap className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold">
                    {reservationStats.completedSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed Sessions
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-emerald-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Reservation Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ReservationFunnel
                  reservations={filteredData.reservations}
                  sessions={filteredData.sessions}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points Usage Tab */}
          <TabsContent value="points" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Points vs Regular Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <PointsUsageChart payments={filteredData.payments} />
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Points Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const pointsPayments = filteredData.payments.filter(
                      (p) => p.pointsUsed && p.pointsUsed > 0,
                    )
                    const totalPointsUsed = pointsPayments.reduce(
                      (sum, p) => sum + (p.pointsUsed || 0),
                      0,
                    )
                    const totalPointsValue = pointsPayments.reduce(
                      (sum, p) => sum + (p.pointsValue || 0),
                      0,
                    )
                    const pointsTransactions = pointsPayments.length
                    return (
                      <>
                        <div className="rounded-lg bg-purple-50 dark:bg-purple-950/20 p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Total Points Used
                          </p>
                          <p className="text-3xl font-bold text-purple-600">
                            {totalPointsUsed.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Points Value Redeemed
                          </p>
                          <p className="text-3xl font-bold text-emerald-600">
                            {formatCurrency(totalPointsValue, "USD")}
                          </p>
                        </div>
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Points Transactions
                          </p>
                          <p className="text-3xl font-bold text-blue-600">
                            {pointsTransactions}
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
