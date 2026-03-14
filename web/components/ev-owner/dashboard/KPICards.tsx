import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, MoreVertical } from "lucide-react"
import { KpiCardData } from "@/types/charging"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface KPICardsProps {
  kpis: KpiCardData[]
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className="group relative overflow-hidden backdrop-blur-sm shadow-none hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:via-green-500/5 group-hover:to-emerald-500/5 transition-all duration-500" />

          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                      {kpi.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{kpi.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-900 to-emerald-900 dark:from-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
              {kpi.value}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  kpi.change > 0
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {kpi.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(kpi.change)}%</span>
              </div>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
            <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  kpi.change > 0
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-red-400 to-rose-500"
                }`}
                style={{ width: `${Math.min(Math.abs(kpi.change) * 2, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
