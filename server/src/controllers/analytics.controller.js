import {
  getDashboardAnalyticsService,
  getDashboardSummaryService,
  getManagerChargingPointsService,
  getManagerPaymentsService,
  getManagerReservationsService,
  getManagerSessionsService,
  getManagerStationsService,
  getPaymentStatsService,
  getRecentSessionsService,
  getReservationFunnelService,
  getStationPerformanceService,
  getTrendsService,
} from "../services/analytics.service.js"

export const getManagerStations = async (req, res) => {
  const result = await getManagerStationsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getManagerChargingPoints = async (req, res) => {
  const result = await getManagerChargingPointsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getManagerSessions = async (req, res) => {
  const result = await getManagerSessionsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getManagerPayments = async (req, res) => {
  const result = await getManagerPaymentsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getManagerReservations = async (req, res) => {
  const result = await getManagerReservationsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getDashboardAnalytics = async (req, res) => {
  const result = await getDashboardAnalyticsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getPaymentStats = async (req, res) => {
  const result = await getPaymentStatsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getReservationFunnel = async (req, res) => {
  const result = await getReservationFunnelService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const getDashboardSummary = async (req, res) => {
  const result = await getDashboardSummaryService(req.user.id)
  return res.status(result.statusCode).json(result)
}

export const getRecentSessions = async (req, res) => {
  const result = await getRecentSessionsService(req.user.id, req.query)

  return res.status(result.statusCode).json(result)
}

export const getTrends = async (req, res) => {
  const result = await getTrendsService(req.user.id, req.query)
  return res.status(result.statusCode).json(result)
}

export const getStationPerformance = async (req, res) => {
  const result = await getStationPerformanceService(req.user.id)
  return res.status(result.statusCode).json(result)
}
