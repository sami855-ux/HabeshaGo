// app/admin/finance/revenue/page.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  Wallet,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  RefreshCw,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  PieChart,
  BarChart3,
  Crown,
  Star,
  Trophy,
  ChevronLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"

// --- TypeScript Interfaces ---
interface RevenueOverview {
  totalRevenue: number
  totalCommission: number
  adminWalletBalance: number
  previousPeriodRevenue?: number
  revenueGrowth?: number
  activeProviders?: number
}

interface DailyRevenue {
  date: string
  revenue: number
}

interface ProviderRevenue {
  providerId: string
  providerName: string
  totalRevenue: number
  totalCommission: number
  growth?: number
  rank?: number
}

// --- Mock API Functions ---
const getRevenueOverviewAPI = async (): Promise<RevenueOverview> => {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return {
    totalRevenue: 124560.75,
    totalCommission: 12456.07,
    adminWalletBalance: 24890.32,
    previousPeriodRevenue: 98750.25,
    revenueGrowth: 26.1,
    activeProviders: 5,
  }
}

const getDailyRevenueAPI = async (days: number): Promise<DailyRevenue[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  const data: DailyRevenue[] = []
  const today = new Date()
  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()
    let revenue = 3000 + Math.random() * 4000
    if (dayOfWeek === 0 || dayOfWeek === 6) revenue *= 1.3
    if (dayOfWeek === 2 || dayOfWeek === 3) revenue *= 0.9
    data.push({ date: dateStr, revenue: Math.round(revenue * 100) / 100 })
  }
  return data
}

const getProviderRevenueAPI = async (): Promise<ProviderRevenue[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return [
    {
      providerId: "1",
      providerName: "StreamMaster Pro",
      totalRevenue: 45230.5,
      totalCommission: 4523.05,
      growth: 15.2,
      rank: 1,
    },
    {
      providerId: "2",
      providerName: "MediaHub Plus",
      totalRevenue: 38760.25,
      totalCommission: 3876.02,
      growth: 8.7,
      rank: 2,
    },
    {
      providerId: "3",
      providerName: "GlobalStream Network",
      totalRevenue: 29540.8,
      totalCommission: 2954.08,
      growth: -2.3,
      rank: 3,
    },
    {
      providerId: "4",
      providerName: "FastCast Media",
      totalRevenue: 18730.45,
      totalCommission: 1873.04,
      growth: 22.5,
      rank: 4,
    },
    {
      providerId: "5",
      providerName: "Premium Content Co.",
      totalRevenue: 12340.6,
      totalCommission: 1234.06,
      growth: 5.1,
      rank: 5,
    },
  ]
}

// --- Helper Components ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Modern Stat Card
const StatCard = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  gradient = "from-emerald-50 via-white to-emerald-50/30",
  darkGradient = "from-emerald-950/20 via-background to-emerald-950/10",
  iconColor = "text-emerald-600 dark:text-emerald-400",
  iconBg = "bg-emerald-500/10",
  valueSize = "text-2xl",
  showAnimation = true,
}: any) => {
  const isPositive = trend && trend > 0
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="group relative overflow-hidden border shadow-none hover:shadow-2xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} dark:${darkGradient} transition-opacity duration-500 ${isHovered ? "opacity-80" : "opacity-100"}`}
      />

      {/* Content */}
      <div className="relative z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle className="text-sm font-medium text-muted-foreground ">
            {title}
          </CardTitle>
          <div
            className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center transition-all duration-500 ${isHovered ? "scale-110 rotate-6" : "scale-100 rotate-0"} shadow-md`}
          >
            <div
              className={`${iconColor} transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
            >
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className={`text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent`}
          >
            {formatCurrency(value)}
          </div>

          {trend !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span
                    className={`text-xs font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {isPositive ? "+" : ""}
                    {trend}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {subtitle || "vs last period"}
                </span>
              </div>

              {/* Progress Bar Animation */}
              {showAnimation && isHovered && (
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isPositive ? "bg-emerald-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(Math.abs(trend), 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Decorative Elements */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="text-[10px] text-muted-foreground/30 font-mono">
              {isPositive ? "↑" : "↓"} {Math.abs(trend || 0)}%
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Footer with Sparkle Effect */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
      />
    </Card>
  )
}

// Modern Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </CardContent>
    </Card>
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Modern Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label)
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    return (
      <div className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-800 rounded-xl shadow-xl p-4 animate-in fade-in-0 zoom-in-95">
        <p className="font-semibold text-sm mb-2">{formattedDate}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Revenue:</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

// Provider Table Row Component
const ProviderTableRow = ({
  provider,
  rank,
}: {
  provider: ProviderRevenue
  rank: number
}) => {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />
      case 3:
        return <Trophy className="h-4 w-4 text-amber-600" />
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <TableRow className="group hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-emerald-200 dark:border-emerald-800">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              {getInitials(provider.providerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{provider.providerName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {getRankIcon()}
              <span className="text-xs text-muted-foreground">
                Rank #{rank}
              </span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(provider.totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div>
          <p className="font-medium">
            {formatCurrency(provider.totalCommission)}
          </p>
          <p className="text-xs text-muted-foreground">Commission (10%)</p>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Badge
          variant={
            provider.growth && provider.growth > 0 ? "default" : "destructive"
          }
          className={`${
            provider.growth && provider.growth > 0
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200"
          } border-0 font-semibold`}
        >
          {provider.growth && provider.growth > 0 ? (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 mr-1" />
          )}
          {Math.abs(provider.growth || 0)}%
        </Badge>
      </TableCell>
    </TableRow>
  )
}

// --- Main Page Component ---
export default function RevenueOverviewPage() {
  const router = useRouter()

  const [overview, setOverview] = useState<RevenueOverview | null>(null)
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([])
  const [providers, setProviders] = useState<ProviderRevenue[]>([])
  const [daysFilter, setDaysFilter] = useState<string>("30")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProviderRevenue
    direction: "asc" | "desc"
  } | null>(null)
  const [chartType, setChartType] = useState<"line" | "area">("area")

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewData, dailyData, providerData] = await Promise.all([
        getRevenueOverviewAPI(),
        getDailyRevenueAPI(parseInt(daysFilter)),
        getProviderRevenueAPI(),
      ])
      setOverview(overviewData)
      setDailyRevenue(dailyData)
      setProviders(providerData)
    } catch (err) {
      setError("Failed to load revenue data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [daysFilter])

  const sortedProviders = useMemo(() => {
    if (!sortConfig) return providers
    return [...providers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [providers, sortConfig])

  const requestSort = (key: keyof ProviderRevenue) => {
    setSortConfig({
      key,
      direction:
        sortConfig?.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    })
  }

  const chartData = useMemo(() => {
    return dailyRevenue.map((item) => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
  }, [dailyRevenue])

  const totalRevenuePeriod = useMemo(() => {
    return dailyRevenue.reduce((sum, item) => sum + item.revenue, 0)
  }, [dailyRevenue])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-emerald-50/30 to-background">
        <Alert
          variant="destructive"
          className="max-w-md border-red-200 dark:border-red-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button className="mt-4" onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div className="flex items-start gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 h-9 w-9 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Financial Analytics
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Revenue Overview
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Track and analyze your platform's financial performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Stats Badge */}
            <Badge
              variant="secondary"
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex"
            >
              <BarChart3 className="h-3 w-3" />
              <span className="text-xs font-medium">Live Data</span>
            </Badge>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Revenue"
                value={overview?.totalRevenue || 0}
                icon={<TrendingUp className="h-5 w-5" />}
                trend={overview?.revenueGrowth}
                subtitle="vs last period"
              />
              <StatCard
                title="Total Commission"
                value={overview?.totalCommission || 0}
                icon={<PieChart className="h-5 w-5" />}
              />
              <StatCard
                title="Admin Wallet Balance"
                value={overview?.adminWalletBalance || 0}
                icon={<Wallet className="h-5 w-5" />}
              />
            </div>

            {/* Chart Section */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-emerald-100 dark:border-emerald-800/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Revenue Trends
                    </CardTitle>
                    <CardDescription>
                      Daily revenue performance over time
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={daysFilter} onValueChange={setDaysFilter}>
                      <SelectTrigger className="w-[180px] border-emerald-200 dark:border-emerald-800">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="14">Last 14 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="60">Last 60 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                      <Button
                        variant={chartType === "area" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setChartType("area")}
                        className={
                          chartType === "area"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : ""
                        }
                      >
                        Area
                      </Button>
                      <Button
                        variant={chartType === "line" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setChartType("line")}
                        className={
                          chartType === "line"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : ""
                        }
                      >
                        Line
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: "#10b981", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Provider Table */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-500" />
                      Provider Performance
                    </CardTitle>
                    <CardDescription>
                      Detailed revenue breakdown by provider
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-800/30">
                        <TableHead className="w-[300px] font-semibold">
                          Provider
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:text-emerald-600 transition-colors"
                          onClick={() => requestSort("totalRevenue")}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Total Revenue
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:text-emerald-600 transition-colors"
                          onClick={() => requestSort("totalCommission")}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Commission
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedProviders.map((provider, idx) => (
                        <ProviderTableRow
                          key={provider.providerId}
                          provider={provider}
                          rank={idx + 1}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
