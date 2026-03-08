"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChargingPoint, ChargingPointStatus } from "@/types/ev"
import { Zap, Clock, AlertCircle, Power } from "lucide-react"

interface ChargingPointsGridProps {
  points: ChargingPoint[]
  onSelectPoint: (point: ChargingPoint) => void
}

const statusColors: Record<ChargingPointStatus, { bg: string; text: string }> =
  {
    AVAILABLE: { bg: "bg-green-100", text: "text-green-700" },
    OCCUPIED: { bg: "bg-blue-100", text: "text-blue-700" },
    FAULTED: { bg: "bg-red-100", text: "text-red-700" },
    OFFLINE: { bg: "bg-gray-100", text: "text-gray-700" },
  }

export function ChargingPointsGrid({
  points,
  onSelectPoint,
}: ChargingPointsGridProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Available Charging Points</h3>
      <div className="grid grid-cols-2 gap-3">
        {points.map((point) => (
          <Card
            key={point.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md rounded-2xl ${
              point.status === "AVAILABLE"
                ? "border-green-200 hover:border-green-300"
                : ""
            }`}
            onClick={() => onSelectPoint(point)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  className={`${statusColors[point.status].bg} ${statusColors[point.status].text} border-0 rounded-full`}
                >
                  {point.status}
                </Badge>
                <span className="text-sm font-medium">{point.slotNumber}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{point.powerKw} kW</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Power className="w-4 h-4 text-gray-500" />
                  <span>{point.connectorType}</span>
                </div>

                {point.averageSessionDuration && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Avg {point.averageSessionDuration} min</span>
                  </div>
                )}
              </div>

              {point.status === "AVAILABLE" && (
                <Badge className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full">
                  Available Now
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
