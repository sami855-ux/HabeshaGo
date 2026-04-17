"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Gauge,
  Timer,
  MapPin,
  Battery,
  DollarSign,
  Clock,
  User,
  Car,
} from "lucide-react"
import type { SessionRow } from "./sessions-table"

interface SessionDetailsSheetProps {
  session: SessionRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper functions
const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-"

const formatNumber = (value?: string | null) => Number(value ?? 0)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)

const formatDuration = (start: string, end?: string | null) => {
  const startAt = new Date(start).getTime()
  const endAt = end ? new Date(end).getTime() : Date.now()
  const diffMs = Math.max(0, endAt - startAt)
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    ACTIVE: {
      variant: "default" as const,
      label: "Active",
      className: "bg-green-600",
    },
    COMPLETED: {
      variant: "outline" as const,
      label: "Completed",
      className: "border-blue-500 text-blue-600",
    },
    CANCELLED: {
      variant: "secondary" as const,
      label: "Cancelled",
      className: "",
    },
  }

  const config = variants[status as keyof typeof variants] || variants.COMPLETED

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

export function SessionDetailsSheet({
  session,
  open,
  onOpenChange,
}: SessionDetailsSheetProps) {
  if (!session) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl w-full overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Session Details</SheetTitle>
          <SheetDescription>
            Complete information about charging session #{session.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Session ID:</span>
                  <p className="font-medium">{session.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    <StatusBadge status={session.status} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">User:</span>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {session.userId}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vehicle ID:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    {session.vehicleId}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Station:</span>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {session.stationName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.stationLocation}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Charger:</span>
                  <p className="font-medium">{session.chargerLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.chargerDetails?.connectorType}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">
                    {formatDuration(session.startTime, session.endTime)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Started:</span>
                  <p className="font-medium text-sm">
                    {formatDateTime(session.startTime)}
                  </p>
                </div>
                {session.endTime && (
                  <div>
                    <span className="text-muted-foreground">Ended:</span>
                    <p className="font-medium text-sm">
                      {formatDateTime(session.endTime)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Energy & Cost Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Battery className="h-4 w-4" />
                Energy & Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Energy Consumed
                  </p>
                  <p className="text-xl font-bold">
                    {formatNumber(session.energyConsumedKwh)} kWh
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(formatNumber(session.totalCost))}
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium mb-2">Cost Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy Cost</span>
                    <span>
                      {formatCurrency(formatNumber(session.energyCost))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Cost</span>
                    <span>
                      {formatCurrency(formatNumber(session.timeCost))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Idle Fee</span>
                    <span>{formatCurrency(formatNumber(session.idleFee))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charger Specifications Card */}
          {session.chargerDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Charger Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Power</p>
                      <p className="font-medium">
                        {session.chargerDetails.powerKw} kW
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Speed</p>
                      <p className="font-medium">
                        {session.chargerDetails.chargingSpeed}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Voltage / Current
                      </p>
                      <p className="font-medium">
                        {session.chargerDetails.maxVoltage || "-"}V /{" "}
                        {session.chargerDetails.maxCurrent || "-"}A
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Connector Type
                      </p>
                      <p className="font-medium">
                        {session.chargerDetails.connectorType}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 mt-1" />
                    <span className="w-px h-8 bg-slate-300 dark:bg-slate-700 mt-1" />
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium">Session Started</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(session.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1" />
                    <span className="w-px h-8 bg-slate-300 dark:bg-slate-700 mt-1" />
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium">Charging Started</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(session.startTime)}
                    </p>
                  </div>
                </div>
                {session.endTime && (
                  <>
                    <div className="flex gap-3">
                      <div className="w-5 flex flex-col items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-orange-500 mt-1" />
                        <span className="w-px h-8 bg-slate-300 dark:bg-slate-700 mt-1" />
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-medium">Charging Stopped</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(session.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 flex flex-col items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 mt-1" />
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-medium">Session Ended</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(session.endTime)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
