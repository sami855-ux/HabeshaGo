import { BusIcon, Check, Wrench, X, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useMemo } from "react"
import type { Bus } from "@/types/bus"

interface BusStatsProps {
  buses: Bus[]
}

export default function BusStats({ buses }: BusStatsProps) {
  const stats = useMemo(() => {
    const total = buses.length
    const active = buses.filter((b) => b.status === "ACTIVE").length
    const maintenance = buses.filter(
      (b) => b.status === "UNDER_MAINTENANCE"
    ).length
    const outOfService = buses.filter(
      (b) => b.status === "OUT_OF_SERVICE"
    ).length
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0
    const withDrivers = buses.filter((b) => b.driverName).length

    return {
      total,
      active,
      maintenance,
      outOfService,
      activePercentage,
      withDrivers,
    }
  }, [buses])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Buses
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">
                {stats.withDrivers} with drivers
              </p>
            </div>
            <BusIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active
              </p>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">
                {stats.activePercentage}% of total
              </p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Maintenance
              </p>
              <p className="text-2xl font-bold">{stats.maintenance}</p>
            </div>
            <Wrench className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Out of Service
              </p>
              <p className="text-2xl font-bold">{stats.outOfService}</p>
            </div>
            <X className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
