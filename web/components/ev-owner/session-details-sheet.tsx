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
  Mail,
  Phone,
  Hash,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react"
import { SessionRow, SessionStatus } from "../ev/sessions-table"

interface SessionDetailsSheetProps {
  session: SessionRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper functions
const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-"

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-"

const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString() : "-"

const formatNumber = (value?: number | null) => value ?? 0

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)

const formatDuration = (minutes: number) => {
  if (!minutes || minutes === 0) return "-"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const StatusBadge = ({ status }: { status: SessionStatus }) => {
  const variants = {
    ACTIVE: {
      variant: "default" as const,
      label: "Active",
      className: "bg-green-600",
    },
    IN_PROGRESS: {
      variant: "default" as const,
      label: "In Progress",
      className: "bg-blue-600",
    },
    COMPLETED: {
      variant: "outline" as const,
      label: "Completed",
      className: "border-blue-500 text-blue-600",
    },
    CANCELLED: {
      variant: "secondary" as const,
      label: "Cancelled",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    WAITING: {
      variant: "secondary" as const,
      label: "Waiting",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
  }

  const config = variants[status] || variants.COMPLETED

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

// Charger Speed Badge
const ChargerSpeedBadge = ({ speed }: { speed: string }) => {
  const speeds: Record<string, { label: string; className: string }> = {
    ULTRA_FAST: {
      label: "Ultra Fast",
      className: "bg-purple-100 text-purple-700",
    },
    SUPER_FAST: { label: "Super Fast", className: "bg-blue-100 text-blue-700" },
    FAST: { label: "Fast", className: "bg-green-100 text-green-700" },
    SLOW: { label: "Slow", className: "bg-gray-100 text-gray-700" },
  }

  const config = speeds[speed] || speeds.FAST

  return (
    <Badge variant="secondary" className={config.className}>
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

  const isActive =
    session.status === "ACTIVE" || session.status === "IN_PROGRESS"

  // Calculate efficiency (km per kWh - assuming average consumption of 5 km/kWh)
  const efficiency =
    session.energyConsumedKwh > 0
      ? (session.energyConsumedKwh * 5).toFixed(1)
      : "0"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl w-full overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Session Details
            {isActive && (
              <Badge className="bg-green-100 text-green-700 border-green-200 animate-pulse">
                Live
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Complete information about charging session #{session.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Session Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Session ID:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {session.id}
                  </p>
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
                    {session.userName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="h-2.5 w-2.5" />
                    {session.userEmail}
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
                    {session.stationAddress}, {session.stationCity}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Charger:</span>
                  <p className="font-medium">{session.slotNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.connectorType}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Charging Speed:</span>
                  <div className="mt-1">
                    <ChargerSpeedBadge
                      speed={session.chargingSpeed || "FAST"}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Power Output:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {session.powerKw} kW
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {formatDuration(session.durationMinutes)}
                  </p>
                </div>
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
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Energy Consumed
                  </p>
                  <p className="text-xl font-bold">
                    {formatNumber(session.energyConsumedKwh).toFixed(1)} kWh
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-xl font-bold">
                    {formatDuration(session.durationMinutes)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(session.totalCost)}
                  </p>
                </div>
              </div>

              {/* Estimated Range */}
              {session.energyConsumedKwh > 0 && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Estimated Range Added
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {efficiency} km
                    </span>
                  </div>
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium mb-2">Cost Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy Cost</span>
                    <span>{formatCurrency(session.energyCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Cost</span>
                    <span>{formatCurrency(session.timeCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Idle Fee</span>
                    <span>{formatCurrency(session.idleFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-medium">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      {formatCurrency(session.totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <span className="w-px h-12 bg-slate-300 dark:bg-slate-700 mt-1" />
                  </div>
                  <div className="pb-2 flex-1">
                    <p className="text-sm font-medium">Session Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(session.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1" />
                    <span className="w-px h-12 bg-slate-300 dark:bg-slate-700 mt-1" />
                  </div>
                  <div className="pb-2 flex-1">
                    <p className="text-sm font-medium">Charging Started</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(session.startTime)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Date: {formatDate(session.startTime)} at{" "}
                      {formatTime(session.startTime)}
                    </p>
                  </div>
                </div>
                {session.endTime ? (
                  <>
                    <div className="flex gap-3">
                      <div className="w-5 flex flex-col items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-orange-500 mt-1" />
                        <span className="w-px h-12 bg-slate-300 dark:bg-slate-700 mt-1" />
                      </div>
                      <div className="pb-2 flex-1">
                        <p className="text-sm font-medium">Charging Stopped</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(session.endTime)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Date: {formatDate(session.endTime)} at{" "}
                          {formatTime(session.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 flex flex-col items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 mt-1" />
                      </div>
                      <div className="pb-2 flex-1">
                        <p className="text-sm font-medium">Session Completed</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {session.status}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-5 flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse mt-1" />
                    </div>
                    <div className="pb-2 flex-1">
                      <p className="text-sm font-medium">Session In Progress</p>
                      <p className="text-xs text-muted-foreground">
                        Currently charging • Active since{" "}
                        {formatTime(session.startTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charging Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Charging Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Average Power</p>
                  <p className="text-lg font-bold">
                    {session.energyConsumedKwh > 0 &&
                    session.durationMinutes > 0
                      ? (
                          (session.energyConsumedKwh /
                            session.durationMinutes) *
                          60
                        ).toFixed(1)
                      : "0"}{" "}
                    kW
                  </p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Cost per kWh</p>
                  <p className="text-lg font-bold">
                    {session.energyConsumedKwh > 0
                      ? formatCurrency(
                          session.totalCost / session.energyConsumedKwh,
                        )
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Connector Type</span>
                  <span className="font-medium">{session.connectorType}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Charger ID</span>
                  <span className="font-medium">{session.chargingPointId}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Station ID</span>
                  <span className="font-medium">{session.stationId}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
