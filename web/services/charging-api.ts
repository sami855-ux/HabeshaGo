import {
  ChargingSession,
  ChartDataPoint,
  StationPerformance,
  KpiCardData,
} from "@/types/charging"
import { axiosInstance } from "./axiosInstance"

// Response wrapper type
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp?: string
}

// Error type
interface ApiError {
  message: string
  code?: string
  status?: number
}

// Helper function to handle response data extraction
const extractData = <T>(responseData: any, fallback: T): T => {
  // If response has data property
  if (responseData?.data) {
    return responseData.data
  }

  // If response is directly the array/object
  if (responseData && !responseData.success) {
    return responseData
  }

  // If response has success flag and data property
  if (responseData?.success && responseData?.data) {
    return responseData.data
  }

  return fallback
}

// Helper function to handle errors
const handleError = (error: any, defaultMessage: string): never => {
  const errorMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultMessage
  throw new Error(errorMessage)
}

// Dashboard KPI
export const getDashboardSummary = async (): Promise<KpiCardData[]> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<KpiCardData[]>>(
      "/analytics/ev/dashboard/summary",
    )
    return extractData(data, [])
  } catch (error: any) {
    return handleError(error, "Failed to fetch dashboard summary")
  }
}

// Recent Sessions
export const getRecentSessions = async (
  limit: number = 20,
): Promise<ChargingSession[]> => {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<{ sessions: ChargingSession[] }>
    >(`/analytics/ev/sessions/recent?limit=${limit}`)

    // Handle nested sessions array
    if (data.data?.sessions) {
      return data.data.sessions
    }

    return extractData(data, [])
  } catch (error: any) {
    return handleError(error, "Failed to fetch sessions")
  }
}

// Trend Data
export const getTrendData = async (
  days: number = 30,
): Promise<ChartDataPoint[]> => {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<{ trends: ChartDataPoint[] }>
    >(`/analytics/ev/trends?days=${days}`)

    // Handle nested trends array
    if (data.data?.trends) {
      return data.data.trends
    }

    return extractData(data, [])
  } catch (error: any) {
    return handleError(error, "Failed to fetch trend data")
  }
}

// Station Performance
export const getStationPerformance = async (): Promise<
  StationPerformance[]
> => {
  try {
    const { data } = await axiosInstance.get<
      ApiResponse<{ stations: StationPerformance[] }>
    >("/analytics/ev/stations/performance")

    // Handle nested stations array
    if (data.data?.stations) {
      return data.data.stations
    }

    return extractData(data, [])
  } catch (error: any) {
    return handleError(error, "Failed to fetch station performance")
  }
}

// Refresh Dashboard Data
export const refreshAllData = async (): Promise<{
  message: string
  refreshedAt: string
}> => {
  try {
    const { data } =
      await axiosInstance.post<
        ApiResponse<{ message: string; refreshedAt: string }>
      >("/dashboard/refresh")

    if (data.data) {
      return data.data
    }

    if (data.message) {
      return {
        message: data.message,
        refreshedAt: data.timestamp || new Date().toISOString(),
      }
    }

    return {
      message: "Data refreshed successfully",
      refreshedAt: new Date().toISOString(),
    }
  } catch (error: any) {
    return handleError(error, "Failed to refresh data")
  }
}

// Get single session details
export const getSessionDetails = async (
  sessionId: string,
): Promise<ChargingSession> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<ChargingSession>>(
      `/sessions/${sessionId}`,
    )

    const session = extractData(data, null)
    if (!session) {
      throw new Error("Session not found")
    }

    return session
  } catch (error: any) {
    return handleError(error, "Failed to fetch session details")
  }
}

// Export sessions data
export const exportSessions = async (params: {
  format?: "csv" | "json" | "excel"
  startDate?: string
  endDate?: string
  stationId?: string
}): Promise<Blob> => {
  try {
    const response = await axiosInstance.get("/export/sessions", {
      params,
      responseType: "blob",
    })
    return response.data
  } catch (error: any) {
    return handleError(error, "Failed to export sessions")
  }
}

// Get real-time stats
export const getRealtimeStats = async (): Promise<any> => {
  try {
    const { data } = await axiosInstance.get("/stats/realtime")
    return extractData(data, {})
  } catch (error: any) {
    return handleError(error, "Failed to fetch real-time stats")
  }
}

// Retry wrapper function
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
): Promise<T> => {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        break
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
      )
      console.log(`Retry attempt ${attempt + 1} for ${fn.name || "function"}`)
    }
  }

  throw lastError || new Error("Operation failed after retries")
}

// API object for convenient importing
export const chargingAPI = {
  getDashboardSummary,
  getRecentSessions,
  getTrendData,
  getStationPerformance,
  refreshAllData,
  getSessionDetails,
  exportSessions,
  getRealtimeStats,
}

// API with retry functionality
export const chargingAPIWithRetry = {
  getDashboardSummary: () => withRetry(getDashboardSummary),
  getRecentSessions: (limit?: number) =>
    withRetry(() => getRecentSessions(limit)),
  getTrendData: (days?: number) => withRetry(() => getTrendData(days)),
  getStationPerformance: () => withRetry(getStationPerformance),
  refreshAllData: () => withRetry(refreshAllData),
  getSessionDetails: (sessionId: string) =>
    withRetry(() => getSessionDetails(sessionId)),
  exportSessions: (params: any) => withRetry(() => exportSessions(params)),
  getRealtimeStats: () => withRetry(getRealtimeStats),
}
