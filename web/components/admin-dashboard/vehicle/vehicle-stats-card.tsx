// app/vehicles/components/vehicle-stats-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gauge, Calendar, Users, TrendingUp } from "lucide-react"
import { Vehicle } from "@/types/vehicle"
import { formatDistanceToNow } from "date-fns"

interface VehicleStatsCardProps {
  vehicle: Vehicle
}

export default function VehicleStatsCard({ vehicle }: VehicleStatsCardProps) {
  const getVehicleAge = () => {
    const currentYear = new Date().getFullYear()
    return currentYear - (vehicle.year || currentYear)
  }

  const getMileageStatus = (mileage: number) => {
    if (mileage > 200000) return { label: "High", color: "bg-red-500" }
    if (mileage > 100000) return { label: "Medium", color: "bg-amber-500" }
    return { label: "Low", color: "bg-green-500" }
  }

  const mileageStatus = getMileageStatus(vehicle.mileage)
  const vehicleAge = getVehicleAge()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Vehicle Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              <span>Mileage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {(vehicle.mileage / 1000).toFixed(1)}k
              </span>
              <Badge variant="outline" className="text-xs">
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${mileageStatus.color}`}
                  />
                  {mileageStatus.label}
                </div>
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Age</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{vehicleAge} years</span>
              <Badge variant="outline" className="text-xs">
                {vehicle.year}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Capacity</span>
            </div>
            <div className="text-lg font-semibold">
              {vehicle.capacity} seats
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Last Updated</span>
            </div>
            <div className="text-sm font-medium">
              {formatDistanceToNow(new Date(vehicle.updatedAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
