"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, DollarSign, Battery, TrendingUp, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface SessionsStatsProps {
  totalSessions: number
  totalRevenue: number
  totalEnergyDelivered: number
  activeSessions: number
  averageDuration?: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)

const formatDuration = (minutes: number) => {
  if (!minutes || minutes === 0) return "N/A"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function SessionsStats({
  totalSessions,
  totalRevenue,
  totalEnergyDelivered,
  activeSessions,
  averageDuration,
}: SessionsStatsProps) {
  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Activity,
      color: "slate",
      formatter: (v: number) => v.toLocaleString(),
    },
    {
      label: "Total Revenue",
      value: totalRevenue,
      icon: DollarSign,
      color: "emerald",
      formatter: formatCurrency,
    },
    {
      label: "Energy Delivered",
      value: totalEnergyDelivered,
      icon: Battery,
      color: "blue",
      formatter: (v: number) => `${v.toFixed(1)} kWh`,
    },
    {
      label: "Active Sessions",
      value: activeSessions,
      icon: TrendingUp,
      color: "green",
      formatter: (v: number) => v.toString(),
    },
  ]

  // Add average duration as a 5th stat if provided
  if (averageDuration !== undefined) {
    stats.push({
      label: "Avg. Duration",
      value: averageDuration,
      icon: Clock,
      color: "purple",
      formatter: formatDuration,
    })
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
      case "blue":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
      case "green":
        return "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
      case "purple":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400"
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.formatter(stat.value)}
                  </p>
                </div>
                <div
                  className={`rounded-full p-3 ${getColorClasses(stat.color)}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>

              {/* Optional trend indicator for active sessions */}
              {stat.label === "Active Sessions" && stat.value > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
                    Live now
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
