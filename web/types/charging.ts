export interface ChargingSession {
  id: string
  sessionId: string
  stationName: string
  chargerId: string
  userName: string
  vehicleModel: string
  startTime: string
  endTime: string
  duration: string
  energyDelivered: number
  revenue: number
  status: "completed" | "in_progress" | "failed"
}

export interface KpiCardData {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  description: string
  trend: "up" | "down" | "neutral"
}

export interface ChartDataPoint {
  date: string
  revenue: number
  energy: number
  sessions: number
  peakDemand: number
  avgCostPerKwh: number
}

export interface StationPerformance {
  stationName: string
  sessions: number
  revenue: number
  energy: number
  utilization: number
}
