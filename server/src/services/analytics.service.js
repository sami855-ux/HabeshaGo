import prisma from "../prisma/client.js"
import { errorResponse, successResponse } from "../utils/apiResponse.js"

export const getManagerStationsService = async (managerId) => {
  try {
    const stations = await prisma.chargingStation.findMany({
      where: {
        managerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return successResponse("Stations retrieved successfully", stations, 200)
  } catch (error) {
    console.error("Error fetching stations:", error)
    return errorResponse("Failed to fetch stations", 500)
  }
}

export const getManagerChargingPointsService = async (managerId) => {
  try {
    const chargingPoints = await prisma.chargingPoint.findMany({
      where: {
        station: {
          managerId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return successResponse(
      "Charging points retrieved successfully",
      chargingPoints,
      200,
    )
  } catch (error) {
    console.error("Error fetching charging points:", error)
    return errorResponse("Failed to fetch charging points", 500)
  }
}

export const getManagerSessionsService = async (managerId) => {
  try {
    const sessions = await prisma.chargingSession.findMany({
      where: {
        station: {
          managerId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return successResponse("Sessions retrieved successfully", sessions, 200)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}

export const getManagerPaymentsService = async (managerId) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        evReservation: {
          chargingPoint: {
            station: {
              managerId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = payments.map((payment) => ({
      id: payment.id,
      userId: payment.userId,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      gateway: payment.gateway,
      flow: payment.flow,

      pointsUsed: payment.pointsUsed,
      pointsValue: payment.pointsValue,

      status: payment.status,
      gatewayRef: payment.gatewayRef,
      reference: payment.reference,

      metadata: payment.metadata,

      evReservationId: payment.evReservationId,

      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }))

    return successResponse("Payments retrieved successfully", formatted, 200)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return errorResponse("Failed to fetch payments", 500)
  }
}

export const getManagerReservationsService = async (managerId) => {
  try {
    const reservations = await prisma.eVReservation.findMany({
      where: {
        chargingPoint: {
          station: {
            managerId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = reservations.map((r) => ({
      id: r.id,
      vehicleId: r.vehicleId,
      chargingPointId: r.chargingPointId,
      startTime: r.startTime,
      endTime: r.endTime,
      reservationCode: r.reservationCode,
      status: r.status,
      targetBatteryPercentage: r.targetBatteryPercentage,
      targetKwh: r.targetKwh,
      calculatedAmount: r.calculatedAmount ? Number(r.calculatedAmount) : null,
      paymentStatus: r.paymentStatus,
      preAuthorizedAmount: r.preAuthorizedAmount
        ? Number(r.preAuthorizedAmount)
        : null,
      userId: r.userId,
      chargingSessionId: r.chargingSessionId,
      createdAt: r.createdAt,
    }))

    return successResponse(
      "Reservations retrieved successfully",
      formatted,
      200,
    )
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return errorResponse("Failed to fetch reservations", 500)
  }
}

export const getDashboardAnalyticsService = async (managerId) => {
  try {
    // 1. Stations
    const stations = await prisma.chargingStation.findMany({
      where: { managerId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        status: true,
        isVerified: true,
      },
    })

    // 2. Charging Points
    const chargingPoints = await prisma.chargingPoint.findMany({
      where: {
        station: { managerId },
      },
      select: {
        id: true,
        stationId: true,
        connectorType: true,
        powerKw: true,
        status: true,
        chargingSpeed: true,
      },
    })

    // 3. Sessions
    const sessions = await prisma.chargingSession.findMany({
      where: {
        station: { managerId },
      },
      select: {
        id: true,
        stationId: true,
        energyConsumedKwh: true,
        totalCost: true,
        status: true,
        startTime: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // 4. Payments
    const payments = await prisma.payment.findMany({
      where: {
        evReservation: {
          chargingPoint: {
            station: { managerId },
          },
        },
      },
      select: {
        id: true,
        amount: true,
        method: true,
        gateway: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // 5. Reservations
    const reservations = await prisma.eVReservation.findMany({
      where: {
        chargingPoint: {
          station: { managerId },
        },
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        calculatedAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // 6. Summary (aggregations)
    const totalSessions = await prisma.chargingSession.count({
      where: { station: { managerId } },
    })

    const totalReservations = await prisma.eVReservation.count({
      where: {
        chargingPoint: {
          station: { managerId },
        },
      },
    })

    const activeSessions = await prisma.chargingSession.count({
      where: {
        status: "ACTIVE",
        station: { managerId },
      },
    })

    const revenueAgg = await prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        evReservation: {
          chargingPoint: {
            station: { managerId },
          },
        },
      },
      _sum: { amount: true },
      _avg: { amount: true },
    })

    const successPayments = await prisma.payment.count({
      where: {
        status: "COMPLETED",
        evReservation: {
          chargingPoint: {
            station: { managerId },
          },
        },
      },
    })

    const allPayments = await prisma.payment.count({
      where: {
        evReservation: {
          chargingPoint: {
            station: { managerId },
          },
        },
      },
    })

    const successRate =
      allPayments > 0 ? (successPayments / allPayments) * 100 : 0

    const summary = {
      totalRevenue: Number(revenueAgg._sum.amount || 0),
      totalSessions,
      totalReservations,
      activeSessions,
      successRate: Number(successRate.toFixed(2)),
      avgTransactionValue: Number(revenueAgg._avg.amount || 0),
    }

    return successResponse(
      "Dashboard analytics retrieved successfully",
      {
        stations,
        chargingPoints,
        sessions,
        payments,
        reservations,
        summary,
      },
      200,
    )
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    return errorResponse("Failed to fetch dashboard analytics", 500)
  }
}

export const getPaymentStatsService = async (managerId) => {
  try {
    // Base filter (all payments belonging to manager's stations)
    const baseFilter = {
      evReservation: {
        chargingPoint: {
          station: { managerId },
        },
      },
    }

    // 1. Totals
    const totalTransactions = await prisma.payment.count({
      where: baseFilter,
    })

    const completedTransactions = await prisma.payment.count({
      where: { ...baseFilter, status: "COMPLETED" },
    })

    const pendingTransactions = await prisma.payment.count({
      where: { ...baseFilter, status: "PENDING" },
    })

    const failedTransactions = await prisma.payment.count({
      where: { ...baseFilter, status: "FAILED" },
    })

    const refundedTransactions = await prisma.payment.count({
      where: { ...baseFilter, status: "REFUNDED" },
    })

    // 2. Revenue + avg
    const revenueAgg = await prisma.payment.aggregate({
      where: {
        ...baseFilter,
        status: "COMPLETED",
      },
      _sum: { amount: true },
      _avg: { amount: true },
    })

    // 3. Revenue by method
    const byMethod = await prisma.payment.groupBy({
      by: ["method"],
      where: {
        ...baseFilter,
        status: "COMPLETED",
      },
      _sum: { amount: true },
    })

    const revenueByMethod = {}
    byMethod.forEach((item) => {
      revenueByMethod[item.method] = Number(item._sum.amount || 0)
    })

    // 4. Revenue by gateway
    const byGateway = await prisma.payment.groupBy({
      by: ["gateway"],
      where: {
        ...baseFilter,
        status: "COMPLETED",
      },
      _sum: { amount: true },
    })

    const revenueByGateway = {}
    byGateway.forEach((item) => {
      revenueByGateway[item.gateway] = Number(item._sum.amount || 0)
    })

    // 5. Daily revenue (last 7 days)
    const daily = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        SUM("amount") as revenue,
        COUNT(*) as count
      FROM "payments"
      WHERE "status" = 'COMPLETED'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 7
    `

    const dailyRevenue = daily.map((d) => ({
      date: d.date,
      revenue: Number(d.revenue),
      count: Number(d.count),
    }))

    // 6. Points usage stats
    const pointsAgg = await prisma.payment.aggregate({
      where: {
        ...baseFilter,
        pointsUsed: { not: null },
      },
      _sum: {
        pointsUsed: true,
        pointsValue: true,
      },
      _count: true,
    })

    const pointsUsage = {
      totalPointsUsed: pointsAgg._sum.pointsUsed || 0,
      totalPointsValue: Number(pointsAgg._sum.pointsValue || 0),
      pointsTransactions: pointsAgg._count || 0,
      averagePointsPerTransaction:
        pointsAgg._count > 0
          ? (pointsAgg._sum.pointsUsed || 0) / pointsAgg._count
          : 0,
    }

    // 7. Derived stats
    const totalRevenue = Number(revenueAgg._sum.amount || 0)
    const avgTransactionValue = Number(revenueAgg._avg.amount || 0)

    const successRate =
      totalTransactions > 0
        ? (completedTransactions / totalTransactions) * 100
        : 0

    return successResponse(
      "Payment statistics retrieved successfully",
      {
        totalRevenue,
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        refundedTransactions,
        successRate: Number(successRate.toFixed(2)),
        avgTransactionValue,

        revenueByMethod,
        revenueByGateway,
        dailyRevenue,

        pointsUsage,
      },
      200,
    )
  } catch (error) {
    console.error("Payment stats error:", error)
    return errorResponse("Failed to fetch payment stats", 500)
  }
}

export const getReservationFunnelService = async (managerId) => {
  try {
    const baseFilter = {
      chargingPoint: {
        station: {
          managerId,
        },
      },
    }

    // 1. Counts per stage
    const totalReservations = await prisma.eVReservation.count({
      where: baseFilter,
    })

    const confirmedReservations = await prisma.eVReservation.count({
      where: {
        ...baseFilter,
        status: "CONFIRMED",
      },
    })

    const paidReservations = await prisma.eVReservation.count({
      where: {
        ...baseFilter,
        paymentStatus: "COMPLETED",
      },
    })

    const completedSessions = await prisma.eVReservation.count({
      where: {
        ...baseFilter,
        status: "COMPLETED",
      },
    })

    const cancelledReservations = await prisma.eVReservation.count({
      where: {
        ...baseFilter,
        status: "CANCELLED",
      },
    })

    // 2. Conversion rates
    const toConfirmed =
      totalReservations > 0
        ? (confirmedReservations / totalReservations) * 100
        : 0

    const toPaid =
      totalReservations > 0 ? (paidReservations / totalReservations) * 100 : 0

    const toCompleted =
      totalReservations > 0 ? (completedSessions / totalReservations) * 100 : 0

    // 3. Funnel structure
    const funnelData = [
      {
        stage: "Created",
        count: totalReservations,
        percentage: 100,
      },
      {
        stage: "Confirmed",
        count: confirmedReservations,
        percentage: Number(toConfirmed.toFixed(2)),
      },
      {
        stage: "Paid",
        count: paidReservations,
        percentage: Number(
          ((paidReservations / totalReservations) * 100).toFixed(2),
        ),
      },
      {
        stage: "Completed",
        count: completedSessions,
        percentage: Number(toCompleted.toFixed(2)),
      },
    ]

    return successResponse(
      "Reservation funnel retrieved successfully",
      {
        totalReservations,
        confirmedReservations,
        paidReservations,
        completedSessions,
        cancelledReservations,

        conversionRates: {
          toConfirmed: Number(toConfirmed.toFixed(2)),
          toPaid: Number(toPaid.toFixed(2)),
          toCompleted: Number(toCompleted.toFixed(2)),
        },

        funnelData,
      },
      200,
    )
  } catch (error) {
    console.error("Funnel analytics error:", error)
    return errorResponse("Failed to fetch reservation funnel", 500)
  }
}

export const getDashboardSummaryService = async (managerId) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(todayStart.getDate() - 1)

    // 1. Stations
    const totalStations = await prisma.chargingStation.count({
      where: { managerId },
    })

    // 2. Chargers
    const totalChargers = await prisma.chargingPoint.count({
      where: {
        station: { managerId },
      },
    })

    const activeChargers = await prisma.chargingPoint.count({
      where: {
        station: { managerId },
        status: "AVAILABLE",
      },
    })

    // 3. Sessions
    const todaySessions = await prisma.chargingSession.count({
      where: {
        station: { managerId },
        startTime: { gte: todayStart },
      },
    })

    const yesterdaySessions = await prisma.chargingSession.count({
      where: {
        station: { managerId },
        startTime: {
          gte: yesterdayStart,
          lt: todayStart,
        },
      },
    })

    // 4. Revenue
    const todayRevenueAgg = await prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: { gte: todayStart },
        evReservation: {
          chargingPoint: {
            station: { managerId },
          },
        },
      },
      _sum: { amount: true },
    })

    const todayRevenue = Number(todayRevenueAgg._sum.amount || 0)

    // 5. Energy Delivered
    const energyAgg = await prisma.chargingSession.aggregate({
      where: {
        station: { managerId },
        startTime: { gte: todayStart },
      },
      _sum: {
        energyConsumedKwh: true,
      },
    })

    const energyDelivered = Number(energyAgg._sum.energyConsumedKwh || 0)

    // 6. Changes
    const sessionChange =
      yesterdaySessions > 0
        ? ((todaySessions - yesterdaySessions) / yesterdaySessions) * 100
        : 0

    const avgPerSession = todaySessions > 0 ? todayRevenue / todaySessions : 0

    const formatCurrency = (val) => `$${val.toFixed(2)}`

    const data = [
      {
        title: "Total Stations",
        value: String(totalStations),
        change: 0,
        icon: "MapPin",
        description: "Active locations across the city",
        trend: "up",
      },
      {
        title: "Total Chargers",
        value: String(totalChargers),
        change: 0,
        icon: "Zap",
        description: "Installed charging units",
        trend: "up",
      },
      {
        title: "Active Chargers",
        value: String(activeChargers),
        change: 0,
        icon: "Activity",
        description: "Currently online and available",
        trend: activeChargers < totalChargers ? "down" : "up",
      },
      {
        title: "Today's Sessions",
        value: String(todaySessions),
        change: Number(sessionChange.toFixed(2)),
        icon: "Calendar",
        description: `+${todaySessions - yesterdaySessions} vs yesterday`,
        trend: sessionChange >= 0 ? "up" : "down",
      },
      {
        title: "Revenue (Today)",
        value: formatCurrency(todayRevenue),
        change: 0,
        icon: "DollarSign",
        description: `Avg ${formatCurrency(avgPerSession)}/session`,
        trend: "up",
      },
      {
        title: "Energy Delivered",
        value: String(Math.round(energyDelivered)),
        unit: "kWh",
        change: 0,
        icon: "Battery",
        description: "Total energy today",
        trend: "up",
      },
    ]

    return successResponse(
      "Dashboard summary retrieved successfully",
      data,
      200,
    )
  } catch (error) {
    console.error("Dashboard summary error:", error)
    return errorResponse("Failed to fetch dashboard summary", 500)
  }
}

export const getRecentSessionsService = async (managerId, query) => {
  try {
    const limit = Number(query.limit) || 20
    const offset = Number(query.offset) || 0
    const status = query.status

    // Map frontend status → DB status
    const statusMap = {
      completed: "COMPLETED",
      in_progress: "ACTIVE",
      failed: "FAILED",
    }

    const where = {
      station: { managerId },
    }

    if (status && statusMap[status]) {
      where.status = statusMap[status]
    }

    // Total count (for pagination)
    const total = await prisma.chargingSession.count({ where })

    // Fetch sessions
    const sessions = await prisma.chargingSession.findMany({
      where,
      include: {
        station: true,
        chargingPoint: true,
        vehicle: true,
        user: true,
      },
      orderBy: { startTime: "desc" },
      skip: offset,
      take: limit,
    })

    // Helper: duration formatting
    const formatDuration = (minutes) => {
      if (!minutes) return "0 min"
      if (minutes >= 60) return `${(minutes / 60).toFixed(1)} hrs`
      return `${minutes} min`
    }

    // Format response
    const formattedSessions = sessions.map((s) => ({
      id: `session-${s.id}`,
      sessionId: `SESS-${s.id}`,

      stationName: s.station?.name || "Unknown",
      chargerId: s.chargingPoint?.slotNumber || `CP-${s.chargingPointId}`,

      userName: `${s.user?.name || "User"} - ${s.vehicle?.model || "Vehicle"}`,
      vehicleModel: s.vehicle?.model || "Unknown",

      startTime: s.startTime,
      endTime: s.status === "ACTIVE" ? "In Progress" : s.endTime,

      duration: formatDuration(s.durationMinutes),
      durationMinutes: s.durationMinutes || 0,

      energyDelivered: Number(s.energyConsumedKwh || 0),
      energyUnit: "kWh",

      revenue: Number(s.totalCost || 0),
      currency: "USD",

      status:
        s.status === "COMPLETED"
          ? "completed"
          : s.status === "ACTIVE"
            ? "in_progress"
            : "failed",

      costPerKwh:
        s.energyConsumedKwh > 0
          ? Number(s.totalCost || 0) / Number(s.energyConsumedKwh || 1)
          : 0,

      chargingSpeed: `${s.chargingPoint?.powerKw || 0} kW`,

      paymentMethod: s.status === "COMPLETED" ? "card" : null,

      ...(s.status === "FAILED" && {
        failureReason: "Session interrupted",
      }),
    }))

    // 🔥 SUMMARY
    const summaryAgg = await prisma.chargingSession.aggregate({
      where: {
        station: { managerId },
      },
      _sum: {
        totalCost: true,
        energyConsumedKwh: true,
        durationMinutes: true,
      },
      _count: true,
    })

    const completedCount = await prisma.chargingSession.count({
      where: {
        ...where,
        status: "COMPLETED",
      },
    })

    const summary = {
      totalRevenue: Number(summaryAgg._sum.totalCost || 0),
      totalEnergy: Number(summaryAgg._sum.energyConsumedKwh || 0),
      averageSessionDuration:
        summaryAgg._count > 0
          ? Math.round(
              (summaryAgg._sum.durationMinutes || 0) / summaryAgg._count,
            )
          : 0,
      completionRate:
        total > 0 ? Number(((completedCount / total) * 100).toFixed(2)) : 0,
    }

    return successResponse(
      "Recent sessions retrieved successfully",
      {
        sessions: formattedSessions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        summary,
      },
      200,
    )
  } catch (error) {
    console.error("Recent sessions error:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}

export const getTrendsService = async (managerId, query) => {
  try {
    const days = Number(query.days) || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 🔥 DAILY AGGREGATION (SQL for performance)
    const trendsRaw = await prisma.$queryRaw`
      SELECT 
        DATE(cs."startTime") as date,
        SUM(cs."totalCost") as revenue,
        SUM(cs."energyConsumedKwh") as energy,
        COUNT(*) as sessions,
        COUNT(DISTINCT cs."userId") as "uniqueUsers",
        AVG(cs."durationMinutes") as "avgSessionDuration"
      FROM "charging_sessions" cs
      JOIN "charging_stations" s ON cs."stationId" = s.id
      WHERE s."managerId" = ${managerId}
      AND cs."startTime" >= ${startDate}
      GROUP BY DATE(cs."startTime")
      ORDER BY date DESC
    `

    // Helper: format date like "Jan 15"
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }

    const trends = trendsRaw.map((d) => {
      const revenue = Number(d.revenue || 0)
      const energy = Number(d.energy || 0)

      return {
        date: formatDate(d.date),
        isoDate: d.date,

        revenue,
        energy,
        sessions: Number(d.sessions),

        peakDemand: Math.round(Number(d.sessions) / 12), // approximation
        avgCostPerKwh: energy > 0 ? revenue / energy : 0,

        uniqueUsers: Number(d.uniqueUsers),
        avgSessionDuration: Math.round(d.avgSessionDuration || 0),

        utilizationRate: Math.min(
          100,
          Math.round((Number(d.sessions) / 200) * 100), // approximation
        ),
      }
    })

    // 🔥 SUMMARY
    const summaryAgg = await prisma.chargingSession.aggregate({
      where: {
        station: { managerId },
        startTime: { gte: startDate },
      },
      _sum: {
        totalCost: true,
        energyConsumedKwh: true,
      },
      _count: true,
    })

    const totalRevenue = Number(summaryAgg._sum.totalCost || 0)
    const totalEnergy = Number(summaryAgg._sum.energyConsumedKwh || 0)
    const totalSessions = summaryAgg._count

    const averageDailyRevenue = totalRevenue / days
    const averageDailyEnergy = totalEnergy / days

    // Growth rate (last day vs previous)
    const growthRate =
      trends.length >= 2
        ? ((trends[0].revenue - trends[1].revenue) / (trends[1].revenue || 1)) *
          100
        : 0

    // Best day
    const bestDay =
      trends.length > 0
        ? new Date(trends[0].isoDate).toLocaleDateString("en-US", {
            weekday: "long",
          })
        : "N/A"

    const summary = {
      totalRevenue,
      totalEnergy,
      totalSessions,
      averageDailyRevenue: Number(averageDailyRevenue.toFixed(2)),
      averageDailyEnergy: Number(averageDailyEnergy.toFixed(2)),
      growthRate: Number(growthRate.toFixed(2)),
      bestDay,
      peakHour: "18:00", // placeholder (needs hourly data)
    }

    return successResponse(
      "Trends retrieved successfully",
      { trends, summary },
      200,
    )
  } catch (error) {
    console.error("Trends error:", error)
    return errorResponse("Failed to fetch trends", 500)
  }
}

export const getStationPerformanceService = async (managerId) => {
  try {
    // 1. Get all stations for this manager
    const stations = await prisma.chargingStation.findMany({
      where: { managerId },
      include: {
        chargingPoints: true,
        sessions: true,
        ratings: true,
      },
    })

    const formatted = stations.map((station) => {
      const sessions = station.sessions || []

      const totalSessions = sessions.length

      const revenue = sessions.reduce(
        (sum, s) => sum + Number(s.totalCost || 0),
        0,
      )

      const energy = sessions.reduce(
        (sum, s) => sum + Number(s.energyConsumedKwh || 0),
        0,
      )

      const avgDuration =
        totalSessions > 0
          ? Math.round(
              sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) /
                totalSessions,
            )
          : 0

      const totalChargers = station.chargingPoints.length

      const activeChargers = station.chargingPoints.filter(
        (cp) => cp.status === "AVAILABLE",
      ).length

      const utilization =
        totalChargers > 0
          ? Number(((totalSessions / (totalChargers * 10)) * 100).toFixed(2)) // approximation
          : 0

      const avgRating =
        station.ratings.length > 0
          ? station.ratings.reduce((a, r) => a + r.value, 0) /
            station.ratings.length
          : 0

      // Fake peak hours (you can improve later)
      const peakHours = ["08:00", "18:00"]

      return {
        stationId: `STN-${station.id}`,
        stationName: station.name,

        location: {
          address: station.address || "",
          latitude: station.lat,
          longitude: station.lng,
          city: station.city || "",
          state: "",
          zipCode: "",
        },

        sessions: totalSessions,
        revenue: Number(revenue.toFixed(2)),
        energy: Number(energy.toFixed(2)),
        utilization,

        totalChargers,
        activeChargers,
        averageSessionDuration: avgDuration,

        customerRating: Number(avgRating.toFixed(1)),

        peakHours,

        trend: "up", // placeholder
        changePercent: 0, // placeholder
      }
    })

    // 🔥 SUMMARY
    const totalStations = formatted.length

    const totalSessions = formatted.reduce((sum, s) => sum + s.sessions, 0)

    const totalRevenue = formatted.reduce((sum, s) => sum + s.revenue, 0)

    const totalEnergy = formatted.reduce((sum, s) => sum + s.energy, 0)

    const averageUtilization =
      totalStations > 0
        ? formatted.reduce((sum, s) => sum + s.utilization, 0) / totalStations
        : 0

    // Top & bottom stations
    const sortedByRevenue = [...formatted].sort((a, b) => b.revenue - a.revenue)

    const topPerformingStation = sortedByRevenue[0]?.stationName || null

    const bottomPerformingStation =
      sortedByRevenue[sortedByRevenue.length - 1]?.stationName || null

    return successResponse(
      "Station performance retrieved successfully",
      {
        stations: formatted,
        summary: {
          totalStations,
          totalSessions,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalEnergy: Number(totalEnergy.toFixed(2)),
          averageUtilization: Number(averageUtilization.toFixed(2)),
          topPerformingStation,
          bottomPerformingStation,
        },
      },
      200,
    )
  } catch (error) {
    console.error("Station performance error:", error)
    return errorResponse("Failed to fetch station performance", 500)
  }
}
