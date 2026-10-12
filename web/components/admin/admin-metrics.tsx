"use client"

import * as React from "react"
import {
  DollarSign,
  Car,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminMetrics() {
  const metrics = [
    {
      title: "Gross Revenue (24h)",
      value: "284,950 ETB",
      change: "+14.8%",
      isPositive: true,
      description: "Telebirr & Chapa settlements",
      icon: DollarSign,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Active Fleet Online",
      value: "168 / 180",
      change: "93.3% Active",
      isPositive: true,
      description: "112 Minibuses • 42 EVs • 14 Buses",
      icon: Car,
      color: "text-orange-500 bg-orange-50 dark:bg-orange-950/50",
    },
    {
      title: "Total Completed Trips",
      value: "3,420",
      change: "+8.2%",
      isPositive: true,
      description: "Across 12 Addis corridors",
      icon: Users,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Average Dispatch ETA",
      value: "3.4 mins",
      change: "-1.1 min faster",
      isPositive: true,
      description: "Corridor priority lane enabled",
      icon: Clock,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-inter">
      {metrics.map((m) => {
        const Icon = m.icon
        return (
          <Card key={m.title} className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {m.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${m.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {m.value}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {m.change}
                </span>
                <span className="text-slate-400 truncate">{m.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
