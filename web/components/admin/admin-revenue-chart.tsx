"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const HOURLY_REVENUE = [
  { time: "06:00", revenue: 12400, trips: 210 },
  { time: "08:00", revenue: 48900, trips: 620 },
  { time: "10:00", revenue: 31200, trips: 410 },
  { time: "12:00", revenue: 38400, trips: 490 },
  { time: "14:00", revenue: 26500, trips: 350 },
  { time: "16:00", revenue: 44200, trips: 580 },
  { time: "18:00", revenue: 56800, trips: 720 },
  { time: "20:00", revenue: 26550, trips: 340 },
]

const FLEET_BREAKDOWN = [
  { category: "Minibus Shuttles", share: 58, revenue: 165270 },
  { category: "City Comfort Taxis", share: 24, revenue: 68388 },
  { category: "Green Electric EVs", share: 12, revenue: 34194 },
  { category: "Intercity Coaches", share: 6, revenue: 17098 },
]

export function AdminRevenueChart() {
  const [metricView, setMetricView] = React.useState<"revenue" | "trips">("revenue")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-inter">
      {/* 2 Cols: Main Hourly Area Chart */}
      <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Hourly Revenue & Demand Surge
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Peak commute volume recorded across Bole, Megenagna, and Piassa corridors
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMetricView("revenue")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                metricView === "revenue"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              Revenue (ETB)
            </button>
            <button
              onClick={() => setMetricView("trips")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                metricView === "trips"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              Trip Count
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_REVENUE} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tripsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    metricView === "revenue" ? `${val / 1000}k` : `${val}`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                          <div className="font-bold text-orange-400">{data.time} Peak</div>
                          <div className="mt-1 font-semibold">
                            Revenue: {data.revenue.toLocaleString()} ETB
                          </div>
                          <div className="text-slate-300">
                            Completed Trips: {data.trips}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metricView === "revenue" ? "revenue" : "trips"}
                  stroke={metricView === "revenue" ? "#f97316" : "#0ea5e9"}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={metricView === "revenue" ? "url(#revenueGrad)" : "url(#tripsGrad)"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 1 Col: Fleet Category Revenue Share */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Category Share
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Revenue distribution across vehicle fleets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {FLEET_BREAKDOWN.map((item) => (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.category}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {item.share}% ({item.revenue.toLocaleString()} ETB)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${item.share}%` }}
                />
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Telebirr Instant Payout Ratio</span>
            <span className="font-bold text-emerald-600">99.4% Automated</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
