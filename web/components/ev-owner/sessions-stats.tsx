"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, DollarSign, Battery, TrendingUp } from "lucide-react"

interface SessionsStatsProps {
  totalSessions: number
  totalRevenue: number
  totalEnergyDelivered: number
  activeSessions: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)

export function SessionsStats({
  totalSessions,
  totalRevenue,
  totalEnergyDelivered,
  activeSessions,
}: SessionsStatsProps) {
  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Activity,
      color: "slate",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Energy Delivered",
      value: `${totalEnergyDelivered.toFixed(1)} kWh`,
      icon: Battery,
      color: "blue",
    },
    {
      label: "Active Sessions",
      value: activeSessions,
      icon: TrendingUp,
      color: "green",
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
      case "blue":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/20"
      case "green":
        return "bg-green-50 text-green-600 dark:bg-green-950/20"
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.value}
                </p>
              </div>
              <div
                className={`rounded-full p-3 ${getColorClasses(stat.color)}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
