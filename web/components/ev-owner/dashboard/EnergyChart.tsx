// src/components/dashboard/EnergyChart.tsx
import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Battery,
  Zap,
  Gauge,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Cell,
  ReferenceArea,
} from "recharts"
import { ChartDataPoint } from "@/types/charging"

interface EnergyChartProps {
  data: ChartDataPoint[]
}

const EnergyTooltip = ({ active, payload, label }: any) => {
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
            <span className="font-medium">{p.value.toLocaleString()} kWh</span>
          </div>
        ))}
        {payload[0] && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Peak Demand:</span>
              <span className="font-medium text-emerald-600">
                {payload[0].payload.peakDemand} kW
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Efficiency:</span>
              <span className="font-medium text-emerald-600">
                {(
                  (payload[0].payload.energy / payload[0].payload.peakDemand) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

export const EnergyChart: React.FC<EnergyChartProps> = ({ data }) => {
  const [focusBar, setFocusBar] = useState<number | null>(null)
  const [chartView, setChartView] = useState<"overview" | "detailed">(
    "detailed",
  )

  const maxEnergy = Math.max(...data.map((d) => d.energy))
  const avgEnergy = data.reduce((sum, d) => sum + d.energy, 0) / data.length

  return (
    <Card className="backdrop-blur-sm shadow-none border-none transition-all duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 rounded-lg">
                <Battery className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Energy Consumption Analytics
            </CardTitle>
            <CardDescription>
              Track energy usage patterns and efficiency
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-lg p-2 text-center">
            <Zap className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="text-sm font-bold text-emerald-700">
              {Math.max(...data.map((d) => d.peakDemand))} kW
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-lg p-2 text-center">
            <Gauge className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-sm font-bold text-emerald-700">
              {avgEnergy.toFixed(0)} kWh
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-lg p-2 text-center">
            <TrendingUp className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-bold text-emerald-700">
              {data.reduce((sum, d) => sum + d.energy, 0).toLocaleString()} kWh
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-lg p-2 text-center">
            <Battery className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Efficiency</p>
            <p className="text-sm font-bold text-emerald-700">94.2%</p>
          </div>
        </div>

        {/* Main Chart */}
        <div className="h-[350px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              onMouseMove={(e: any) => {
                if (e.activeTooltipIndex !== undefined) {
                  setFocusBar(e.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setFocusBar(null)}
            >
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
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
              />
              <YAxis
                yAxisId="left"
                fontSize={12}
                tick={{ fill: "currentColor" }}
                tickFormatter={(value) => `${value} kWh`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={12}
                tick={{ fill: "currentColor" }}
                tickFormatter={(value) => `${value} kW`}
              />

              <Tooltip content={<EnergyTooltip />} />

              {/* Reference area for average */}
              <ReferenceArea
                yAxisId="left"
                y1={avgEnergy - 200}
                y2={avgEnergy + 200}
                fill="#f0fdf4"
                fillOpacity={0.3}
                ifOverflow="extendDomain"
              />

              {/* Energy bars with gradient */}
              <Bar
                yAxisId="left"
                dataKey="energy"
                fill="#059669"
                name="Energy Usage"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                onMouseEnter={(_, index) => setFocusBar(index)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === focusBar ? "#10b981" : "#059669"}
                    opacity={index === focusBar ? 1 : 0.8}
                  />
                ))}
              </Bar>

              {/* Peak demand line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="peakDemand"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Peak Demand"
                dot={{ fill: "#f59e0b", r: 3 }}
                activeDot={{ r: 5, fill: "#f59e0b", stroke: "white" }}
              />

              {/* Area for energy trend */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="energy"
                stroke="none"
                fill="url(#energyGradient)"
                name="Energy Trend"
              />

              {/* Moving average line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="energy"
                stroke="#047857"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="7-day Average"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-7 gap-1 mt-4">
          {data.slice(-7).map((day, index) => (
            <div
              key={index}
              className="text-center p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
            >
              <p className="text-xs text-muted-foreground">{day.date}</p>
              <div className="h-1 bg-emerald-100 dark:bg-emerald-900 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                  style={{ width: `${(day.energy / maxEnergy) * 100}%` }}
                />
              </div>
              <p className="text-xs font-medium mt-1">{day.energy} kWh</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
