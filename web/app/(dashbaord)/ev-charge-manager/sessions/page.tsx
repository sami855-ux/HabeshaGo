"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { SessionRow } from "@/components/ev-owner/sessions-table"
import { SessionsStats } from "@/components/ev-owner/sessions-stats"
import { SessionsTable } from "@/components/ev/sessions-table"
import { SessionDetailsSheet } from "@/components/ev-owner/session-details-sheet"
import { SessionsFilters } from "@/components/ev-owner/sessions-filters"

// Types
type ChargingPoint = {
  id: number
  connectorType: string
  powerKw: number
  status: string
  chargingSpeed: string
  slotNumber?: string
  maxVoltage?: number
  maxCurrent?: number
}

type ChargingSession = {
  id: number
  vehicleId: number
  stationId: number
  chargingPointId: number
  userId: string
  startTime: string
  endTime: string | null
  energyConsumedKwh: string
  energyCost: string
  timeCost: string
  idleFee: string
  totalCost: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
}

type ChargingStation = {
  id: number
  name: string
  location: string
  operator: string
  chargingPoints: ChargingPoint[]
  sessions: ChargingSession[]
}

// Mock Data
const MOCK_STATIONS: ChargingStation[] = [
  {
    id: 1,
    name: "Green Valley EV Hub",
    location: "123 Green Street, Downtown",
    operator: "EcoCharge",
    chargingPoints: [
      {
        id: 101,
        connectorType: "CCS",
        powerKw: 150,
        status: "AVAILABLE",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "A-01",
        maxVoltage: 800,
        maxCurrent: 375,
      },
      {
        id: 102,
        connectorType: "CCS",
        powerKw: 150,
        status: "OCCUPIED",
        chargingSpeed: "ULTRA_FAST",
        slotNumber: "A-02",
        maxVoltage: 800,
        maxCurrent: 375,
      },
    ],
    sessions: [
      {
        id: 30001,
        vehicleId: 1,
        stationId: 1,
        chargingPointId: 101,
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
      },
      {
        id: 30002,
        vehicleId: 2,
        stationId: 1,
        chargingPointId: 102,
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
      },
    ],
  },
  {
    id: 2,
    name: "Emerald Charge Point",
    location: "456 Park Avenue",
    operator: "GreenEnergy",
    chargingPoints: [
      {
        id: 201,
        connectorType: "CHADEMO",
        powerKw: 50,
        status: "FAULTED",
        chargingSpeed: "FAST",
        slotNumber: "B-01",
        maxVoltage: 400,
        maxCurrent: 125,
      },
    ],
    sessions: [
      {
        id: 30003,
        vehicleId: 3,
        stationId: 2,
        chargingPointId: 201,
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
      },
    ],
  },
]

// API Service
const sessionsAPI = {
  getSessions: async (): Promise<SessionRow[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const stations = MOCK_STATIONS
    const rows = stations.flatMap((station) => {
      const chargerById = new Map(
        station.chargingPoints.map((point) => [
          point.id,
          { label: point.slotNumber ?? `CP-${point.id}`, details: point },
        ]),
      )

      return (station.sessions ?? []).map(
        (session): SessionRow => ({
          ...session,
          stationName: station.name,
          stationLocation: station.location,
          chargerDetails: chargerById.get(session.chargingPointId)?.details,
          chargerLabel:
            chargerById.get(session.chargingPointId)?.label ??
            `CP-${session.chargingPointId}`,
        }),
      )
    })

    return rows
  },
}

// Custom hook for sessions query
const useSessionsQuery = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsAPI.getSessions,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

// Loading Skeleton
const TableSkeleton = () => (
  <div className="rounded-md border">
    <div className="border-b p-4">
      <Skeleton className="h-4 w-full" />
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="border-b p-4">
        <Skeleton className="h-12 w-full" />
      </div>
    ))}
  </div>
)

export default function SessionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(
    null,
  )
  const [showFilters, setShowFilters] = useState(true)

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useSessionsQuery()

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions

    const term = searchTerm.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter(
        (session) =>
          session.userId.toLowerCase().includes(term) ||
          String(session.vehicleId).toLowerCase().includes(term) ||
          String(session.id).toLowerCase().includes(term) ||
          session.stationName.toLowerCase().includes(term),
      )
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((session) => session.status === statusFilter)
    }

    return filtered
  }, [sessions, searchTerm, statusFilter])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalSessions = filteredSessions.length
    const totalRevenue = filteredSessions.reduce(
      (sum, session) => sum + Number(session.totalCost),
      0,
    )
    const totalEnergyDelivered = filteredSessions.reduce(
      (sum, session) => sum + Number(session.energyConsumedKwh),
      0,
    )
    const activeSessions = filteredSessions.filter(
      (s) => s.status === "ACTIVE",
    ).length

    return { totalSessions, totalRevenue, totalEnergyDelivered, activeSessions }
  }, [filteredSessions])

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 h-10 w-10 cursor-pointer rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  EV Infrastructure
                </p>
                <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:to-slate-400 md:text-3xl">
                  Charging Sessions
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track live and historical charging session activity
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw
                className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="text-xs font-medium">
                Active: {summary.activeSessions}
              </span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full border-slate-200 bg-white shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load sessions. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <SessionsStats {...summary} />

        {/* Filters and Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-none">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Sessions
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-500"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <SessionsFilters
                show={showFilters}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />

              <SessionsTable
                data={filteredSessions}
                onRowClick={setSelectedSession}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Details Sheet */}
        <SessionDetailsSheet
          session={selectedSession}
          open={!!selectedSession}
          onOpenChange={(open) => !open && setSelectedSession(null)}
        />
      </div>
    </div>
  )
}
