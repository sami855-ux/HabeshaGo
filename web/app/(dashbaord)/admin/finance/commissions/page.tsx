"use client"

import { useState, useEffect } from "react"
import {
  CalendarIcon,
  TrendingUp,
  CreditCard,
  Wallet,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  RefreshCw,
  Settings2,
  Zap,
  ChevronLeft,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Legend,
} from "recharts"
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

// shadcn/ui components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

// --- Enhanced Mock Data Generation ---
const generateDetailedMockData = (
  groupBy: "day" | "week" | "month",
  dateRange: { from: Date; to: Date },
) => {
  // Generate realistic commission data with trends
  const data: {
    date: string
    totalCommission: number
    transactions: number
    averageCommission: number
  }[] = []

  if (groupBy === "day") {
    const daysDiff = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24),
    )
    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const currentDate = new Date(dateRange.from)
      currentDate.setDate(dateRange.from.getDate() + i)

      // Create realistic fluctuations with weekly patterns
      const dayOfWeek = currentDate.getDay()
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 1
      const baseCommission = 1200 + Math.random() * 800
      const commission = Math.floor(baseCommission * weekendMultiplier)
      const transactions = Math.floor(commission / (85 + Math.random() * 30))

      data.push({
        date: format(currentDate, "MMM dd"),
        totalCommission: commission,
        transactions: transactions,
        averageCommission: Math.floor(commission / transactions),
      })
    }
  } else if (groupBy === "week") {
    for (let i = 0; i < 12; i++) {
      const commission = 5000 + Math.random() * 4000 + i * 300
      const transactions = Math.floor(commission / 90)
      data.push({
        date: `Week ${i + 1}`,
        totalCommission: Math.floor(commission),
        transactions: transactions,
        averageCommission: Math.floor(commission / transactions),
      })
    }
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    for (let i = 0; i < 6; i++) {
      const commission = 15000 + Math.random() * 10000 + i * 1200
      const transactions = Math.floor(commission / 95)
      data.push({
        date: months[i % 12],
        totalCommission: Math.floor(commission),
        transactions: transactions,
        averageCommission: Math.floor(commission / transactions),
      })
    }
  }

  return data
}

// --- Enhanced Custom Tooltip ---
const EnhancedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95"
      >
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500">Commission</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ${data.totalCommission.toLocaleString()}
            </span>
          </div>
          {data.transactions && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Transactions</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {data.transactions.toLocaleString()}
              </span>
            </div>
          )}
          {data.averageCommission && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Avg. per booking</span>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                ${data.averageCommission.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }
  return null
}

// --- Enhanced Summary Card Component with Animation ---
const EnhancedSummaryCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
}: {
  title: string
  value: string
  icon: any
  trend?: "up" | "down"
  trendValue?: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              <p className="text-3xl font-bold tracking-normal text-gray-900 dark:text-white font-grotesk">
                {value}
              </p>
              {trend && trendValue && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={`rounded-full p-0.5 ${
                      trend === "up"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {trendValue}
                  </p>
                </div>
              )}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 p-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const MiniTrendChart = ({ data }: { data: any[] }) => {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.slice(-7)}>
          <Area
            type="monotone"
            dataKey="totalCommission"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#miniGradient)"
            dot={false}
          />
          <defs>
            <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function CommissionReportDashboard() {
  const router = useRouter()

  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day")
  const [showAreaFill, setShowAreaFill] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [activeMetric, setActiveMetric] = useState<
    "commission" | "transactions"
  >("commission")
  const [chartData, setChartData] = useState(
    generateDetailedMockData("day", dateRange),
  )

  // Simulate data refresh
  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setChartData(generateDetailedMockData(groupBy, dateRange))
      setIsLoading(false)
    }, 800)
  }

  useEffect(() => {
    refreshData()
  }, [groupBy, dateRange])

  // Calculate summary statistics
  const totalCommission = chartData.reduce(
    (sum, item) => sum + item.totalCommission,
    0,
  )
  const totalTransactions = chartData.reduce(
    (sum, item) => sum + (item.transactions || 0),
    0,
  )
  const avgCommission =
    totalTransactions > 0 ? totalCommission / totalTransactions : 0
  const previousPeriodTotal = totalCommission * 0.88 // Simulated previous period
  const growth = (
    ((totalCommission - previousPeriodTotal) / previousPeriodTotal) *
    100
  ).toFixed(1)

  const summaryCards = [
    {
      title: "Total Commission",
      value: `ETB ${totalCommission.toLocaleString()}`,
      icon: Wallet,
      trend: parseFloat(growth) > 0 ? "up" : ("down" as "up" | "down"),
      trendValue: `${growth}% from previous period`,
      gradient:
        "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700",
    },
    {
      title: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      icon: CreditCard,
      trend: "up" as "up" | "down",
      trendValue: "+8.2% from last period",
      gradient: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700",
    },
    {
      title: "Average Commission",
      value: `ETB ${Math.round(avgCommission).toLocaleString()}`,
      icon: TrendingUp,
      trend: "up" as "up" | "down",
      trendValue: "per booking",
      gradient: "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700",
    },
  ]

  // Quick date range presets
  const datePresets = [
    {
      label: "Last 7 days",
      value: () => ({ from: subDays(new Date(), 7), to: new Date() }),
    },
    {
      label: "Last 30 days",
      value: () => ({ from: subDays(new Date(), 30), to: new Date() }),
    },
    {
      label: "This month",
      value: () => ({ from: startOfMonth(new Date()), to: new Date() }),
    },
    {
      label: "Last month",
      value: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
  ]

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Header Section with Enhanced Styling */}
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
                Analytics
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Commission Report
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Visual overview of commission earnings & performance metrics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Stats Badge */}
            <Badge
              variant="secondary"
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 lg:flex"
            >
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {format(dateRange.from, "MMM dd")} -{" "}
                  {format(dateRange.to, "MMM dd")}
                </span>
              </div>
            </Badge>

            {/* Date Range Picker with Presets */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 gap-2 rounded-full border-gray-200 bg-white px-4 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex border-b border-gray-100 p-2 dark:border-gray-800">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setDateRange(preset.value())}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range: any) =>
                    range && setDateRange({ from: range.from, to: range.to })
                  }
                  numberOfMonths={2}
                  className="rounded-xl border-0"
                />
              </PopoverContent>
            </Popover>

            {/* Group By Select */}
            <Select
              value={groupBy}
              onValueChange={(val: any) => setGroupBy(val)}
            >
              <SelectTrigger className="h-9 w-[110px] gap-2 rounded-full border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              variant="default"
              size="sm"
              className="h-9 gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 shadow-md transition-all hover:scale-105 hover:shadow-lg"
              onClick={() => console.log("Export clicked")}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </header>

        {/* Summary Cards Grid with Enhanced Animation */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map((card, idx) => (
            <EnhancedSummaryCard key={card.title} {...card} delay={idx * 0.1} />
          ))}
        </div>

        {/* Chart Controls & Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full px-3 py-1">
              <BarChart3 className="mr-1 h-3 w-3" />
              Interactive Chart
            </Badge>
            <div className="flex items-center gap-2">
              <Switch
                id="area-fill"
                checked={showAreaFill}
                onCheckedChange={setShowAreaFill}
              />
              <Label htmlFor="area-fill" className="text-xs text-gray-500">
                Show area fill
              </Label>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="rounded-xl"
          >
            <RefreshCw
              className={`mr-2 h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </motion.div>

        {/* Main Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden rounded-2xl border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                    Commission Trend
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {groupBy === "day"
                      ? "Daily"
                      : groupBy === "week"
                        ? "Weekly"
                        : "Monthly"}{" "}
                    earnings overview with performance insights
                  </CardDescription>
                </div>
                <Tabs
                  value={activeMetric}
                  onValueChange={(v: any) => setActiveMetric(v)}
                  className="w-auto"
                >
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="commission">Commission</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex h-[420px] items-center justify-center">
                  <div className="space-y-3 text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-sm text-gray-400">
                      Loading chart data...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="commissionGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="transactionsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        className="dark:stroke-gray-800"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickFormatter={(value) =>
                          activeMetric === "commission" ? `$${value}` : value
                        }
                        dx={-10}
                      />
                      <Tooltip content={<EnhancedTooltip />} cursor={false} />
                      <ReferenceLine
                        y={
                          activeMetric === "commission"
                            ? chartData[Math.floor(chartData.length / 2)]
                                ?.totalCommission
                            : undefined
                        }
                        stroke="#9ca3af"
                        strokeDasharray="3 3"
                        label={{
                          value: "Avg",
                          position: "right",
                          fill: "#9ca3af",
                          fontSize: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={
                          activeMetric === "commission"
                            ? "totalCommission"
                            : "transactions"
                        }
                        stroke={
                          activeMetric === "commission" ? "#10b981" : "#3b82f6"
                        }
                        strokeWidth={3}
                        fill={
                          showAreaFill
                            ? activeMetric === "commission"
                              ? "url(#commissionGradient)"
                              : "url(#transactionsGradient)"
                            : "none"
                        }
                        activeDot={{
                          r: 6,
                          strokeWidth: 0,
                          fill:
                            activeMetric === "commission"
                              ? "#10b981"
                              : "#3b82f6",
                          stroke: "#ffffff",
                        }}
                      />
                      {activeMetric === "commission" && (
                        <Legend
                          verticalAlign="top"
                          height={36}
                          content={() => (
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-4 rounded-full bg-emerald-500" />
                                <span>Commission ($)</span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Insights Section (Optional Enhancement) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <Card className="rounded-xl border-0 bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Peak commission day
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    $
                    {Math.max(
                      ...chartData.map((d) => d.totalCommission),
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Average daily growth
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    +5.2%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Projected this period
                  </span>
                  <span className="text-sm font-semibold text-amber-600">
                    ${(totalCommission * 1.12).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                <Settings2 className="mr-2 h-3 w-3" />
                Configure Alerts
              </Button>
              <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                <TrendingUp className="mr-2 h-3 w-3" />
                Detailed Analysis
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
          <p>
            Data refreshes every 5 minutes • Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}
