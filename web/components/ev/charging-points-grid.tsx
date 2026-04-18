"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Timer, CheckCircle, Flame, Clock } from "lucide-react"

interface ChargingPoint {
  id: number
  stationId: number
  connectorType: string
  powerKw: number
  status: string
  averageSessionDuration: number
  slotNumber: string
  chargingSpeed: string
  createdAt: string
  updatedAt: string
}

const getSpeedBadge = (speed: string) => {
  switch (speed) {
    case "ULTRA_FAST":
      return {
        label: "Ultra-Fast",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: Flame,
      }
    case "FAST":
      return {
        label: "Fast",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: Zap,
      }
    default:
      return {
        label: "Standard",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: Clock,
      }
  }
}

interface ChargingPointsGridProps {
  chargingPoints: ChargingPoint[]
  selectedPointId: number | null
  onSelectPoint: (pointId: number) => void
}

export function ChargingPointsGrid({
  chargingPoints,
  selectedPointId,
  onSelectPoint,
}: ChargingPointsGridProps) {
  const availablePoints = chargingPoints.filter((p) => p.status === "AVAILABLE")

  return (
    <Card className="border-0 shadow-none rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-50 rounded-full blur-2xl -mr-16 -mt-16"></div>
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
          Select Your Charging Point
        </CardTitle>
        <CardDescription className="text-gray-600">
          Choose from {availablePoints.length} available charging spots
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chargingPoints.map((point) => {
            const isSelected = selectedPointId === point.id
            const isOccupied = point.status === "OCCUPIED"
            const speedInfo = getSpeedBadge(point.chargingSpeed)
            const SpeedIcon = speedInfo.icon

            return (
              <div
                key={point.id}
                className={`relative rounded-lg border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-green-50/30"
                    : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
                } ${isOccupied ? "opacity-60 cursor-not-allowed bg-gray-50" : "bg-white"}`}
                onClick={() => !isOccupied && onSelectPoint(point.id)}
              >
                {isOccupied && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="destructive" className="bg-red-500">
                      Occupied
                    </Badge>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xl text-gray-800">
                          {point.slotNumber}
                        </span>
                        <Badge className={`${speedInfo.color} border-0`}>
                          <SpeedIcon className="h-3 w-3 mr-1" />
                          {speedInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        point.chargingSpeed === "ULTRA_FAST"
                          ? "bg-emerald-100"
                          : point.chargingSpeed === "FAST"
                            ? "bg-green-100"
                            : "bg-gray-100"
                      }`}
                    >
                      <Zap
                        className={`h-5 w-5 ${
                          point.chargingSpeed === "ULTRA_FAST"
                            ? "text-emerald-600"
                            : point.chargingSpeed === "FAST"
                              ? "text-green-600"
                              : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Connector</span>
                      <span className="font-semibold text-gray-700">
                        {point.connectorType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max Power</span>
                      <span className="font-semibold text-emerald-600">
                        {point.powerKw} kW
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Time (100%)</span>
                      <span className="flex items-center gap-1 text-gray-700">
                        <Timer className="h-3 w-3 text-emerald-500" />
                        {point.averageSessionDuration} min
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-emerald-200">
                      <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Ready for charging
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
