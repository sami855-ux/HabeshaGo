"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChargingPoint, ChargingPointStatus } from "@/types/ev"
import {
  Zap,
  Clock,
  AlertCircle,
  Power,
  CheckCircle2,
  XCircle,
  Wrench,
  Gauge,
  Plug,
  Battery,
  ArrowRight,
} from "lucide-react"

interface ChargingPointsGridProps {
  points: ChargingPoint[]
  onSelectPoint: (point: ChargingPoint) => void
  selectedPointId?: number
}

const statusConfig: Record<
  ChargingPointStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  AVAILABLE: {
    label: "Available",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  OCCUPIED: {
    label: "Occupied",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: XCircle,
  },
  FAULTED: {
    label: "Faulted",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
    icon: AlertCircle,
  },
  OFFLINE: {
    label: "Offline",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    icon: Wrench,
  },
}

const getSpeedInfo = (powerKw: number) => {
  if (powerKw >= 150)
    return {
      label: "Ultra Fast",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
      icon: "⚡",
    }
  if (powerKw >= 50)
    return {
      label: "Fast",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
      icon: "🔋",
    }
  return {
    label: "Standard",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    icon: "🔌",
  }
}

export function ChargingPointsGrid({
  points,
  onSelectPoint,
  selectedPointId,
}: ChargingPointsGridProps) {
  const availableCount = points.filter((p) => p.status === "AVAILABLE").length
  const totalCount = points.length

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Charging Ports
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {availableCount} of {totalCount} ports available
          </p>
        </div>
        <Badge
          variant="outline"
          className={`gap-1.5 px-3 py-1 ${
            availableCount > 0
              ? "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
              : "border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              availableCount > 0
                ? "bg-emerald-500 animate-pulse"
                : "bg-rose-500"
            }`}
          />
          {availableCount > 0 ? "Ready to Charge" : "Fully Occupied"}
        </Badge>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {points.map((point) => {
          const config = statusConfig[point.status]
          const StatusIcon = config.icon
          const speedInfo = getSpeedInfo(point.powerKw)
          const isSelected = selectedPointId === point.id
          const isAvailable = point.status === "AVAILABLE"

          return (
            <Card
              key={point.id}
              className={`
                relative overflow-hidden transition-all duration-200 rounded-none
                ${isAvailable ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : "cursor-not-allowed opacity-75"}
              `}
              onClick={() => isAvailable && onSelectPoint(point)}
            >
              {/* Status Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  point.status === "AVAILABLE"
                    ? "bg-emerald-500"
                    : point.status === "OCCUPIED"
                      ? "bg-amber-500"
                      : point.status === "FAULTED"
                        ? "bg-rose-500"
                        : "bg-slate-500"
                }`}
              />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      ${config.bg} border ${config.border}
                    `}
                    >
                      <StatusIcon className={`h-5 w-5 ${config.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Port {point.slotNumber || point.id}
                        </h4>
                        <Badge className={speedInfo.color} variant="secondary">
                          {speedInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-xs font-medium ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border-0">
                      Selected
                    </Badge>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Gauge className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Power
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {point.powerKw}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          kW
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Plug className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Connector
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {point.connectorType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(point.maxVoltage ||
                  point.maxCurrent ||
                  point.averageSessionDuration) && (
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {point.maxVoltage && (
                      <>
                        <span>⚡ {point.maxVoltage}V</span>
                      </>
                    )}
                    {point.maxCurrent && (
                      <>
                        {point.maxVoltage && <span>•</span>}
                        <span>🔌 {point.maxCurrent}A</span>
                      </>
                    )}
                    {point.averageSessionDuration && (
                      <>
                        {(point.maxVoltage || point.maxCurrent) && (
                          <span>•</span>
                        )}
                        <span>⏱️ {point.averageSessionDuration} min avg</span>
                      </>
                    )}
                  </div>
                )}

                {/* Status Messages for non-available ports */}
                {point.status === "OCCUPIED" && (
                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                      Currently in use
                    </p>
                  </div>
                )}

                {point.status === "FAULTED" && (
                  <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
                    <p className="text-xs text-rose-700 dark:text-rose-400 text-center">
                      Temporarily unavailable
                    </p>
                  </div>
                )}

                {point.status === "OFFLINE" && (
                  <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                      Offline - Check back later
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
