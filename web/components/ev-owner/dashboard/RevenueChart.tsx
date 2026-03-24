// src/components/dashboard/RevenueChart.tsx
import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Download,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Legend,
  ReferenceLine,
} from "recharts"
import { ChartDataPoint } from "@/types/charging"

interface RevenueChartProps {
  data: ChartDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-4 min-w-[200px]">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((p: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-muted-foreground">{p.name}:</span>
            </div>
            <span className="font-medium">
              {p.name === "Revenue" ? "$" : ""}
              {p.value.toLocaleString()} {p.name === "Revenue" ? "" : "kWh"}
            </span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Cost/kWh:</span>
            <span className="font-medium text-green-600">
              ${(payload[0]?.payload.avgCostPerKwh || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<"line" | "bar" | "composed">(
    "composed",
  )
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const filteredData = data.slice(
    -timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90,
  )

  return (
    <Card className="backdrop-blur-sm shadow-none border-none transition-all duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              Track revenue trends and performance metrics
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              defaultValue="30d"
              className="hidden md:block"
              onValueChange={(v: any) => setTimeRange(v)}
            >
              <TabsList className="bg-green-50 dark:bg-green-950">
                <TabsTrigger
                  value="7d"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  7d
                </TabsTrigger>
                <TabsTrigger
                  value="30d"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  30d
                </TabsTrigger>
                <TabsTrigger
                  value="90d"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  90d
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-1">
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="icon"
                onClick={() => setChartType("line")}
                className={
                  chartType === "line" ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="icon"
                onClick={() => setChartType("bar")}
                className={
                  chartType === "bar" ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "composed" ? "default" : "outline"}
                size="icon"
                onClick={() => setChartType("composed")}
                className={
                  chartType === "composed"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="icon" className="ml-2">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              $
              {filteredData
                .reduce((sum, d) => sum + d.revenue, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-green-600">+12.5% vs last period</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Avg Daily</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              $
              {(
                filteredData.reduce((sum, d) => sum + d.revenue, 0) /
                filteredData.length
              ).toFixed(0)}
            </p>
            <p className="text-xs text-blue-600">Per day average</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Peak Day</p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              $
              {Math.max(...filteredData.map((d) => d.revenue)).toLocaleString()}
            </p>
            <p className="text-xs text-purple-600">Highest revenue day</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[350px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={filteredData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tick={{ fill: "currentColor" }}
                  tickLine={{ stroke: "currentColor" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "currentColor" }}
                  tickLine={{ stroke: "currentColor" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                  dot={false}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "white" }}
                />
                <ReferenceLine
                  y={
                    filteredData.reduce((sum, d) => sum + d.revenue, 0) /
                    filteredData.length
                  }
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  label={{ value: "Avg", position: "right", fill: "#94a3b8" }}
                />
              </LineChart>
            ) : chartType === "bar" ? (
              <BarChart data={filteredData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  opacity={0.3}
                />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {filteredData.map((entry, index) => (
                    <defs key={index}>
                      <linearGradient
                        id={`barGradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#059669"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <ComposedChart data={filteredData}>
                <defs>
                  <linearGradient
                    id="composedRevenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  opacity={0.3}
                />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis
                  yAxisId="left"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="right"
                  dataKey="sessions"
                  fill="#d1fae5"
                  name="Sessions"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Revenue"
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "white" }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="none"
                  fill="url(#composedRevenueGradient)"
                  name="Revenue Area"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
