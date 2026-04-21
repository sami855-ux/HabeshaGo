import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chargingAPI } from "@/services/charging-api"
import {
  ChargingSession,
  ChartDataPoint,
  StationPerformance,
  KpiCardData,
} from "@/types/charging"
import { useEffect, useState } from "react"

// Query keys for cache management
export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  sessions: (limit?: number) =>
    [...dashboardKeys.all, "sessions", { limit }] as const,
  trends: (days?: number) =>
    [...dashboardKeys.all, "trends", { days }] as const,
  stations: () => [...dashboardKeys.all, "stations"] as const,
}

interface UseDashboardDataReturn {
  sessions: ChargingSession[]
  trendData: ChartDataPoint[]
  stationPerformance: StationPerformance[]
  kpis: KpiCardData[]
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  lastUpdated: Date
  refreshData: () => Promise<void>
  isRefreshing: boolean
  refetch: () => void
}

export function useDashboardData(): UseDashboardDataReturn {
  const queryClient = useQueryClient()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch KPIs
  const {
    data: kpis = [],
    isLoading: kpisLoading,
    error: kpisError,
    isFetching: kpisFetching,
    refetch: refetchKpis,
  } = useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: chargingAPI.getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto refetch every 5 minutes
  })

  // Fetch Sessions
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    error: sessionsError,
    isFetching: sessionsFetching,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: dashboardKeys.sessions(20),
    queryFn: () => chargingAPI.getRecentSessions(20),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch Trend Data
  const {
    data: trendData = [],
    isLoading: trendsLoading,
    error: trendsError,
    isFetching: trendsFetching,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: dashboardKeys.trends(30),
    queryFn: () => chargingAPI.getTrendData(30),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch Station Performance
  const {
    data: stationPerformance = [],
    isLoading: stationsLoading,
    error: stationsError,
    isFetching: stationsFetching,
    refetch: refetchStations,
  } = useQuery({
    queryKey: dashboardKeys.stations(),
    queryFn: chargingAPI.getStationPerformance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: chargingAPI.refreshAllData,
    onMutate: () => {
      setLastUpdated(new Date())
    },
    onSuccess: async () => {
      // Invalidate all dashboard queries
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    onError: (error) => {
      console.error("Refresh failed:", error)
    },
  })

  const isLoading =
    kpisLoading || sessionsLoading || trendsLoading || stationsLoading
  const isFetching =
    kpisFetching || sessionsFetching || trendsFetching || stationsFetching
  const error = kpisError || sessionsError || trendsError || stationsError

  const refreshData = async () => {
    await refreshMutation.mutateAsync()
  }

  const refetch = () => {
    refetchKpis()
    refetchSessions()
    refetchTrends()
    refetchStations()
    setLastUpdated(new Date())
  }

  useEffect(() => {
    if (!isLoading && !isFetching && sessions.length > 0) {
      setLastUpdated(new Date())
    }
  }, [sessions, trendData, stationPerformance, kpis])

  return {
    sessions,
    trendData,
    stationPerformance,
    kpis,
    isLoading,
    isFetching,
    error: error as Error | null,
    lastUpdated,
    refreshData,
    isRefreshing: refreshMutation.isPending,
    refetch,
  }
}
