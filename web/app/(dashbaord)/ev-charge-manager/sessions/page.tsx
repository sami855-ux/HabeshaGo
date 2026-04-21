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
import { SessionsStats } from "@/components/ev-owner/sessions-stats"
import { SessionsTable } from "@/components/ev/sessions-table"
import { SessionDetailsSheet } from "@/components/ev-owner/session-details-sheet"
import { SessionsFilters } from "@/components/ev-owner/sessions-filters"
import { axiosInstance } from "@/services/axiosInstance"

// Types based on the actual API response
export type SessionStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "WAITING"
  | "IN_PROGRESS"

export type ChargingSession = {
  id: number
  stationId: number
  chargingPointId: number
  vehicleId: number
  userId: string

  startTime: string
  endTime: string | null
  status: SessionStatus

  energyConsumedKwh: number
  durationMinutes: number

  energyCost: number
  timeCost: number
  idleFee: number
  totalCost: number

  stationName: string
  stationAddress: string
  stationCity: string

  connectorType: string
  powerKw: number
  slotNumber: string
  chargingSpeed: string

  userName: string
  userEmail: string

  createdAt: string
}

export type SessionRow = ChargingSession

// API Service
const sessionsAPI = {
  getSessions: async (): Promise<SessionRow[]> => {
    try {
      const response = await axiosInstance.get("/ev/session/manager")

      // Handle the response structure: { success, message, statusCode, data }
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data.map((session: any) => ({
          id: session.id,
          stationId: session.stationId,
          chargingPointId: session.chargingPointId,
          vehicleId: session.vehicleId,
          userId: session.userId,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          energyConsumedKwh: Number(session.energyConsumedKwh),
          durationMinutes: session.durationMinutes,
          energyCost: Number(session.energyCost),
          timeCost: Number(session.timeCost),
          idleFee: Number(session.idleFee),
          totalCost: Number(session.totalCost),
          stationName: session.stationName,
          stationAddress: session.stationAddress,
          stationCity: session.stationCity,
          connectorType: session.connectorType,
          powerKw: session.powerKw,
          slotNumber: session.slotNumber,
          userName: session.userName,
          userEmail: session.userEmail,
          createdAt: session.createdAt,
        }))
      }

      return []
    } catch (error: any) {
      console.error("Error fetching sessions:", error)
      throw new Error(
        error?.response?.data?.message || "Failed to fetch sessions",
      )
    }
  },

  getSessionById: async (id: number): Promise<SessionRow> => {
    try {
      const response = await axiosInstance.get(`/ev/sessions/${id}`)

      if (response.data?.success && response.data.data) {
        const session = response.data.data
        return {
          id: session.id,
          stationId: session.stationId,
          chargingPointId: session.chargingPointId,
          vehicleId: session.vehicleId,
          userId: session.userId,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          energyConsumedKwh: Number(session.energyConsumedKwh),
          durationMinutes: session.durationMinutes,
          energyCost: Number(session.energyCost),
          timeCost: Number(session.timeCost),
          idleFee: Number(session.idleFee),
          totalCost: Number(session.totalCost),
          stationName: session.stationName,
          stationAddress: session.stationAddress,
          stationCity: session.stationCity,
          connectorType: session.connectorType,
          chargingSpeed: session.chargingSpeed,
          powerKw: session.powerKw,
          slotNumber: session.slotNumber,
          userName: session.userName,
          userEmail: session.userEmail,
          createdAt: session.createdAt,
        }
      }

      throw new Error("Session not found")
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to fetch session details",
      )
    }
  },

  cancelSession: async (id: number): Promise<void> => {
    try {
      await axiosInstance.post(`/ev/sessions/${id}/cancel`)
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to cancel session",
      )
    }
  },
}

// Custom hook for sessions query
const useSessionsQuery = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsAPI.getSessions,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchInterval: (data) => {
      const sessions = data?.data || []

      const hasActiveSessions = sessions.some(
        (session) => session.status === "ACTIVE",
      )

      return hasActiveSessions ? 10000 : false
    },
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
          session.userName.toLowerCase().includes(term) ||
          session.userEmail.toLowerCase().includes(term) ||
          String(session.vehicleId).toLowerCase().includes(term) ||
          String(session.id).toLowerCase().includes(term) ||
          session.stationName.toLowerCase().includes(term) ||
          session.stationAddress.toLowerCase().includes(term) ||
          session.connectorType.toLowerCase().includes(term) ||
          session.slotNumber.toLowerCase().includes(term),
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
      (sum, session) => sum + session.totalCost,
      0,
    )
    const totalEnergyDelivered = filteredSessions.reduce(
      (sum, session) => sum + session.energyConsumedKwh,
      0,
    )
    const activeSessions = filteredSessions.filter(
      (s) => s.status === "ACTIVE" || s.status === "IN_PROGRESS",
    ).length
    const averageDuration =
      filteredSessions.length > 0
        ? filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0) /
          filteredSessions.length
        : 0

    return {
      totalSessions,
      totalRevenue,
      totalEnergyDelivered,
      activeSessions,
      averageDuration: Math.round(averageDuration),
    }
  }, [filteredSessions])

  const handleRefresh = () => {
    refetch()
  }

  const handleViewDetails = (session: SessionRow) => {
    setSelectedSession(session)
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <TableSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load sessions. Please try again."}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => refetch()}
          className="mt-4 bg-slate-900 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
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

        {/* Stats Cards */}
        <SessionsStats
          totalSessions={summary.totalSessions}
          totalRevenue={summary.totalRevenue}
          totalEnergyDelivered={summary.totalEnergyDelivered}
          activeSessions={summary.activeSessions}
          averageDuration={summary.averageDuration}
        />

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
                onRowClick={handleViewDetails}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Details Sheet */}
        <SessionDetailsSheet
          session={selectedSession}
          open={!!selectedSession}
          onOpenChange={(open) => !open && setSelectedSession(null)}
          onCancel={async (sessionId: number) => {
            try {
              await sessionsAPI.cancelSession(sessionId)
              await refetch()
              setSelectedSession(null)
            } catch (error) {
              console.error("Failed to cancel session:", error)
            }
          }}
        />
      </div>
    </div>
  )
}
