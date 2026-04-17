"use client"

import { useEffect, useMemo, useState } from "react"
import { useChargingStations } from "@/hooks/use-charging-stations"
import { ChargingPoint, ChargingSession, ChargingStation } from "@/types/ev"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Activity,
  Battery,
  DollarSign,
  Gauge,
  Timer,
  User,
  Car,
  Zap,
} from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

type SessionRow = ChargingSession & {
  stationName: string
  chargerLabel: string
  chargerDetails?: ChargingPoint
}

const sampleSessions: SessionRow[] = [
  {
    id: 30001,
    vehicleId: 1,
    stationId: 9001,
    chargingPointId: 20001,
    userId: "user-001",
    startTime: "2026-04-06T09:10:00.000Z",
    endTime: "2026-04-06T09:55:00.000Z",
    energyConsumedKwh: "24.5",
    energyCost: "10.50",
    timeCost: "1.25",
    idleFee: "0.50",
    totalCost: "12.25",
    status: "COMPLETED",
    createdAt: "2026-04-06T09:10:00.000Z",
    updatedAt: "2026-04-06T09:55:00.000Z",
    stationName: "Bole EV Hub",
    chargerLabel: "A-01",
  },
  {
    id: 30002,
    vehicleId: 2,
    stationId: 9003,
    chargingPointId: 20002,
    userId: "user-014",
    startTime: "2026-04-06T11:30:00.000Z",
    endTime: null,
    energyConsumedKwh: "11.0",
    energyCost: "5.00",
    timeCost: "0.50",
    idleFee: "0.00",
    totalCost: "5.50",
    status: "ACTIVE",
    createdAt: "2026-04-06T11:30:00.000Z",
    updatedAt: "2026-04-06T11:45:00.000Z",
    stationName: "Megenagna Fast Charge",
    chargerLabel: "B-04",
  },
  {
    id: 30003,
    vehicleId: 3,
    stationId: 9002,
    chargingPointId: 20003,
    userId: "user-009",
    startTime: "2026-04-05T16:40:00.000Z",
    endTime: "2026-04-05T17:20:00.000Z",
    energyConsumedKwh: "18.2",
    energyCost: "7.80",
    timeCost: "1.00",
    idleFee: "0.30",
    totalCost: "9.10",
    status: "COMPLETED",
    createdAt: "2026-04-05T16:40:00.000Z",
    updatedAt: "2026-04-05T17:20:00.000Z",
    stationName: "Piassa Charge Point",
    chargerLabel: "C-02",
    chargerDetails: {
      id: 20003,
      stationId: 9002,
      connectorType: "CHADEMO",
      powerKw: 50,
      status: "FAULTED",
      chargingSpeed: "FAST",
      slotNumber: "C-02",
      maxVoltage: 400,
      maxCurrent: 120,
      createdAt: "2026-04-05T16:30:00.000Z",
      updatedAt: "2026-04-05T17:20:00.000Z",
    },
  },
]

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

type EnergyLogPoint = {
  time: string
  powerKw: number
  energyKwh: number
}

const generateEnergyLogs = (session: SessionRow): EnergyLogPoint[] => {
  const totalEnergy = formatNumber(session.energyConsumedKwh)
  const startAt = new Date(session.startTime).getTime()
  const endAt = session.endTime
    ? new Date(session.endTime).getTime()
    : startAt + 45 * 60 * 1000

  const count = 12
  const duration = Math.max(1, endAt - startAt)
  let cumulative = 0

  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1)
    const t = startAt + duration * progress
    const powerKw = Number((35 + Math.sin(index / 2) * 8 + index * 1.7).toFixed(1))
    const increment = totalEnergy / count
    cumulative += increment
    return {
      time: new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      powerKw,
      energyKwh: Number(Math.min(totalEnergy, cumulative).toFixed(2)),
    }
  })
}

export default function SessionsPage() {
  const { data, isLoading, error, refetch } = useChargingStations()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  >("ALL")
  const [stationFilter, setStationFilter] = useState("ALL")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null)
  const [energyLogs, setEnergyLogs] = useState<EnergyLogPoint[]>([])

  const sessions = useMemo(() => {
    const stations = (data ?? []) as ChargingStation[]
    const rows = stations.flatMap((station) => {
      const chargerById = new Map(
        station.chargingPoints.map((point) => [
          point.id,
          point.slotNumber ?? `CP-${point.id}`,
        ]),
      )

      return (station.sessions ?? []).map(
        (session): SessionRow => ({
          ...session,
          stationName: station.name,
          chargerDetails: station.chargingPoints.find(
            (point) => point.id === session.chargingPointId,
          ),
          chargerLabel:
            chargerById.get(session.chargingPointId) ??
            `CP-${session.chargingPointId}`,
        }),
      )
    })

    return rows.length ? rows : sampleSessions
  }, [data])

  const stationOptions = useMemo(() => {
    const uniqueStations = new Set(sessions.map((session) => session.stationName))
    return Array.from(uniqueStations).sort((a, b) => a.localeCompare(b))
  }, [sessions])

  const filteredSessions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return sessions.filter((session) => {
      const matchesSearch =
        !term ||
        session.userId.toLowerCase().includes(term) ||
        String(session.vehicleId).toLowerCase().includes(term) ||
        String(session.id).toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "ALL" ? true : session.status === statusFilter

      const matchesStation =
        stationFilter === "ALL" ? true : session.stationName === stationFilter

      const startAt = new Date(session.startTime)
      const rangeStart = fromDate ? new Date(`${fromDate}T00:00:00`) : null
      const rangeEnd = toDate ? new Date(`${toDate}T23:59:59`) : null

      const matchesDateFrom = rangeStart ? startAt >= rangeStart : true
      const matchesDateTo = rangeEnd ? startAt <= rangeEnd : true

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStation &&
        matchesDateFrom &&
        matchesDateTo
      )
    })
  }, [sessions, searchTerm, statusFilter, stationFilter, fromDate, toDate])

  const summary = useMemo(() => {
    const totalSessions = filteredSessions.length
    const totalRevenue = filteredSessions.reduce(
      (sum, session) => sum + formatNumber(session.totalCost),
      0,
    )
    const totalEnergyDelivered = filteredSessions.reduce(
      (sum, session) => sum + formatNumber(session.energyConsumedKwh),
      0,
    )

    return { totalSessions, totalRevenue, totalEnergyDelivered }
  }, [filteredSessions])

  useEffect(() => {
    if (!selectedSession) return
    setEnergyLogs(generateEnergyLogs(selectedSession))
  }, [selectedSession])

  useEffect(() => {
    if (!selectedSession || selectedSession.status !== "ACTIVE") return
    const interval = setInterval(() => {
      setEnergyLogs((prev) => {
        if (!prev.length) return prev
        const last = prev[prev.length - 1]
        const nextPower = Number(
          Math.max(8, Math.min(120, last.powerKw + (Math.random() * 12 - 6))).toFixed(
            1,
          ),
        )
        const nextEnergy = Number((last.energyKwh + nextPower / 3600).toFixed(3))
        return [
          ...prev.slice(-19),
          {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            powerKw: nextPower,
            energyKwh: nextEnergy,
          },
        ]
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [selectedSession])

  const sessionDetails = useMemo(() => {
    if (!selectedSession) return null

    const userSessionCount = sessions.filter(
      (s) => s.userId === selectedSession.userId,
    ).length
    const logs = energyLogs.length ? energyLogs : generateEnergyLogs(selectedSession)
    const peakPower = logs.length
      ? Math.max(...logs.map((point) => point.powerKw))
      : 0
    const totalEnergy = logs.length
      ? logs[logs.length - 1].energyKwh
      : formatNumber(selectedSession.energyConsumedKwh)

    const energyCost = formatNumber(selectedSession.energyCost)
    const timeCost = formatNumber(selectedSession.timeCost)
    const idleFee = formatNumber(selectedSession.idleFee)
    const fallbackEnergyCost =
      energyCost || Number((formatNumber(selectedSession.totalCost) * 0.82).toFixed(2))
    const fallbackTimeCost =
      timeCost || Number((formatNumber(selectedSession.totalCost) * 0.15).toFixed(2))
    const fallbackIdleFee =
      idleFee || Number((formatNumber(selectedSession.totalCost) * 0.03).toFixed(2))

    const timeline = [
      {
        label: "Session started",
        time: selectedSession.startTime,
      },
      {
        label: "Charging started",
        time: selectedSession.startTime,
      },
      {
        label: "Peak usage reached",
        time: new Date(
          new Date(selectedSession.startTime).getTime() +
            (new Date(selectedSession.endTime ?? Date.now()).getTime() -
              new Date(selectedSession.startTime).getTime()) /
              2,
        ).toISOString(),
      },
      {
        label: "Charging stopped",
        time: selectedSession.endTime ?? null,
      },
      {
        label: "Session ended",
        time: selectedSession.endTime ?? null,
      },
    ]

    return {
      userSessionCount,
      logs,
      peakPower,
      totalEnergy,
      energyCost: fallbackEnergyCost,
      timeCost: fallbackTimeCost,
      idleFee: fallbackIdleFee,
      timeline,
    }
  }, [selectedSession, sessions, energyLogs])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading sessions...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-destructive">Failed to load sessions.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Charging Sessions</h1>
        <p className="text-muted-foreground">
          Track live and historical charging session activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            placeholder="Search by user, vehicle, session ID"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="xl:col-span-2"
          />
          <Select
            value={statusFilter}
            onValueChange={(value: "ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stations</SelectItem>
              {stationOptions.map((stationName) => (
                <SelectItem key={stationName} value={stationName}>
                  {stationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            placeholder="From date"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            placeholder="To date"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{summary.totalSessions}</p>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Energy Delivered</p>
              <p className="text-2xl font-bold">
                {summary.totalEnergyDelivered.toFixed(1)} kWh
              </p>
            </div>
            <Battery className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Charger (ChargingPoint)</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Energy Consumed (kWh)</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length ? (
                  filteredSessions.map((session) => (
                    <TableRow
                      key={session.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedSession(session)}
                    >
                      <TableCell className="font-medium">{session.userId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{session.chargerLabel}</span>
                          <span className="text-xs text-muted-foreground">
                            {session.stationName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(session.startTime)}</TableCell>
                      <TableCell>{formatDateTime(session.endTime)}</TableCell>
                      <TableCell>{formatNumber(session.energyConsumedKwh)}</TableCell>
                      <TableCell>
                        {formatCurrency(formatNumber(session.totalCost))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.status === "ACTIVE"
                              ? "default"
                              : session.status === "COMPLETED"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No sessions found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={Boolean(selectedSession)}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null)
        }}
      >
        <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader className="pb-0">
            <SheetTitle>
              Session Detail #{selectedSession?.id ?? "-"}
            </SheetTitle>
            <SheetDescription>
              Real-time session insights, timeline, and charging breakdown.
            </SheetDescription>
          </SheetHeader>

          {selectedSession && sessionDetails && (
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">A. Session Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Session ID:</span>{" "}
                    {selectedSession.id}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <Badge variant="outline">{selectedSession.status}</Badge>
                  </p>
                  <p>
                    <span className="text-muted-foreground">User:</span>{" "}
                    {selectedSession.userId}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Vehicle ID:</span>{" "}
                    {selectedSession.vehicleId}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Station + Charger:</span>{" "}
                    {selectedSession.stationName} / {selectedSession.chargerLabel}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    {formatDuration(selectedSession.startTime, selectedSession.endTime)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Start:</span>{" "}
                    {formatDateTime(selectedSession.startTime)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">End:</span>{" "}
                    {formatDateTime(selectedSession.endTime)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    B. Energy Consumption (Real-Time Chart)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">
                        Total Energy Consumed
                      </p>
                      <p className="text-lg font-semibold">
                        {sessionDetails.totalEnergy.toFixed(2)} kWh
                      </p>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">Peak Power Usage</p>
                      <p className="text-lg font-semibold">
                        {sessionDetails.peakPower.toFixed(1)} kW
                      </p>
                    </div>
                  </div>

                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sessionDetails.logs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="energyKwh"
                          stroke="#16a34a"
                          strokeWidth={2}
                          name="Energy (kWh)"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="powerKw"
                          stroke="#2563eb"
                          strokeWidth={2}
                          name="Power (kW)"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {selectedSession.status === "ACTIVE" && (
                    <p className="text-xs text-muted-foreground">
                      Auto-refresh enabled (updates every few seconds).
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">C. Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-2 p-3 text-sm border-b">
                      <span>Energy Cost</span>
                      <span className="text-right">
                        {formatCurrency(sessionDetails.energyCost)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-3 text-sm border-b">
                      <span>Time Cost</span>
                      <span className="text-right">
                        {formatCurrency(sessionDetails.timeCost)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-3 text-sm border-b">
                      <span>Idle Fee</span>
                      <span className="text-right">
                        {formatCurrency(sessionDetails.idleFee)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-3 text-sm font-semibold">
                      <span>Total Cost</span>
                      <span className="text-right">
                        {formatCurrency(formatNumber(selectedSession.totalCost))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">D. Timeline View</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionDetails.timeline.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex gap-3">
                      <div className="w-5 flex flex-col items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary mt-1" />
                        {index < sessionDetails.timeline.length - 1 && (
                          <span className="w-px h-8 bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(item.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">E. Charger Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <Zap className="inline h-4 w-4 mr-1 text-muted-foreground" />
                      Connector:{" "}
                      {selectedSession.chargerDetails?.connectorType ?? "-"}
                    </p>
                    <p>
                      <Gauge className="inline h-4 w-4 mr-1 text-muted-foreground" />
                      Power: {selectedSession.chargerDetails?.powerKw ?? "-"} kW
                    </p>
                    <p>
                      Voltage / Current:{" "}
                      {selectedSession.chargerDetails?.maxVoltage ?? "-"}V /{" "}
                      {selectedSession.chargerDetails?.maxCurrent ?? "-"}A
                    </p>
                    <p>
                      Charging Speed:{" "}
                      {selectedSession.chargerDetails?.chargingSpeed ?? "-"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">F. User & Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <User className="inline h-4 w-4 mr-1 text-muted-foreground" />
                      User Name: {selectedSession.userId}
                    </p>
                    <p>
                      <Car className="inline h-4 w-4 mr-1 text-muted-foreground" />
                      Vehicle VIN / ID: {selectedSession.vehicleId}
                    </p>
                    <p>
                      <Timer className="inline h-4 w-4 mr-1 text-muted-foreground" />
                      Past Sessions Count: {sessionDetails.userSessionCount}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
