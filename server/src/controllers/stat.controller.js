import prisma from "../prisma/client.js"
import { errorResponse, successResponse } from "../utils/apiResponse.js"
import { ADMIN_WALLET_ID } from "../utils/constants.js"

export const getFinancialSummary = async (req, res, next) => {
  try {
    const now = new Date()

    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentPeriodEnd = now

    const previousPeriodStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    )
    const previousPeriodEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    )

    const currentAgg = await prisma.transactionLedger.aggregate({
      where: {
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: currentPeriodStart, lte: currentPeriodEnd },
      },
      _sum: { totalAmount: true, commission: true },
    })

    const totalRevenue = Number(currentAgg._sum.totalAmount ?? 0)
    const totalCommission = Number(currentAgg._sum.commission ?? 0)

    const previousAgg = await prisma.transactionLedger.aggregate({
      where: {
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: previousPeriodStart, lte: previousPeriodEnd },
      },
      _sum: { totalAmount: true },
    })

    const previousPeriodRevenue = Number(previousAgg._sum.totalAmount ?? 0)

    const revenueGrowth =
      previousPeriodRevenue > 0
        ? parseFloat(
            (
              ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) *
              100
            ).toFixed(1),
          )
        : 0

    const walletAgg = await prisma.transactionLedger.aggregate({
      where: { status: "COMPLETED", isSettled: true },
      _sum: { commission: true },
    })

    const adminWalletBalance = Number(walletAgg._sum.commission ?? 0)

    const activeProvidersResult = await prisma.transactionLedger.findMany({
      where: {
        providerId: { not: null },
        status: "COMPLETED",
        createdAt: { gte: currentPeriodStart, lte: currentPeriodEnd },
      },
      distinct: ["providerId"],
      select: { providerId: true },
    })

    const activeProviders = activeProvidersResult.length

    const response = successResponse("Financial summary fetched successfully", {
      totalRevenue,
      totalCommission,
      adminWalletBalance,
      previousPeriodRevenue,
      revenueGrowth,
      activeProviders,
    })

    return res.status(response.statusCode).json(response)
  } catch (error) {
    console.log(error)
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getProvidersPerformance = async (req, res) => {
  try {
    const now = new Date()

    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentPeriodEnd = now

    const previousPeriodStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    )
    const previousPeriodEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    )

    // ── 1. Current period: group by providerId ──────────────────────────────
    const currentPeriod = await prisma.transactionLedger.groupBy({
      by: ["providerId"],
      where: {
        providerId: { not: null },
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: currentPeriodStart, lte: currentPeriodEnd },
      },
      _sum: { totalAmount: true, commission: true },
      orderBy: { _sum: { totalAmount: "desc" } },
    })

    // ── 2. Previous period: group by providerId ─────────────────────────────
    const previousPeriod = await prisma.transactionLedger.groupBy({
      by: ["providerId"],
      where: {
        providerId: { not: null },
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: previousPeriodStart, lte: previousPeriodEnd },
      },
      _sum: { totalAmount: true },
    })

    // map previous period by providerId for quick lookup
    const previousMap = new Map(
      previousPeriod.map((p) => [
        p.providerId,
        Number(p._sum.totalAmount ?? 0),
      ]),
    )

    // ── 3. Fetch provider names ─────────────────────────────────────────────
    const providerIds = currentPeriod.map((p) => p.providerId)

    const providers = await prisma.user.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, name: true }, // adjust field name to match your User model
    })

    const providerNameMap = new Map(providers.map((p) => [p.id, p.name]))

    // ── 4. Build ranked response ────────────────────────────────────────────
    const data = currentPeriod.map((entry, index) => {
      const totalRevenue = Number(entry._sum.totalAmount ?? 0)
      const totalCommission = Number(entry._sum.commission ?? 0)
      const previousRevenue = previousMap.get(entry.providerId) ?? 0

      const growth =
        previousRevenue > 0
          ? parseFloat(
              (
                ((totalRevenue - previousRevenue) / previousRevenue) *
                100
              ).toFixed(1),
            )
          : 0

      return {
        providerId: entry.providerId,
        providerName: providerNameMap.get(entry.providerId) ?? "Unknown",
        totalRevenue,
        totalCommission,
        growth,
        rank: index + 1,
      }
    })

    const response = successResponse(
      "Providers performance fetched successfully",
      data,
    )
    return res.status(response.statusCode).json(response)
  } catch (error) {
    console.log(error)
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getRevenueTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7 // matches your 7, 14, 30, 60 filter

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const ledgerEntries = await prisma.transactionLedger.findMany({
      where: {
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Group by day
    const revenueByDay = new Map()

    ledgerEntries.forEach((entry) => {
      const date = entry.createdAt.toISOString().split("T")[0] // "2025-04-01"
      const current = revenueByDay.get(date) ?? 0
      revenueByDay.set(date, current + Number(entry.totalAmount))
    })

    // Fill in missing days with 0 so the chart has no gaps
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)

      const date = d.toISOString().split("T")[0]
      const formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) // "Apr 1"

      data.push({
        date,
        formattedDate,
        revenue: parseFloat((revenueByDay.get(date) ?? 0).toFixed(2)),
      })
    }

    const response = successResponse(
      "Revenue trends fetched successfully",
      data,
    )
    return res.status(response.statusCode).json(response)
  } catch (error) {
    console.log(error)
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getCommissionReport = async (req, res) => {
  try {
    const { groupBy = "day", from, to } = req.query

    const fromDate = from
      ? new Date(from)
      : new Date(new Date().setDate(new Date().getDate() - 30))
    const toDate = to ? new Date(to) : new Date()

    // set toDate to end of day
    toDate.setHours(23, 59, 59, 999)

    const entries = await prisma.transactionLedger.findMany({
      where: {
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        totalAmount: true,
        commission: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // ── Group entries ─────────────────────────────────────────────────────────
    const groupMap = new Map()

    entries.forEach((entry) => {
      const date = entry.createdAt
      let key = ""
      let label = ""

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0] // "2025-04-01"
        label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }) // "Apr 01"
      } else if (groupBy === "week") {
        // ISO week number
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        const weekNum = Math.ceil(
          ((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7,
        )
        key = `${date.getFullYear()}-W${weekNum}`
        label = `Week ${weekNum}`
      } else if (groupBy === "month") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
        label = date.toLocaleDateString("en-US", { month: "short" }) // "Apr"
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, { date: label, totalCommission: 0, transactions: 0 })
      }

      const group = groupMap.get(key)
      group.totalCommission += Number(entry.commission)
      group.transactions += 1
    })

    // ── Build final array ─────────────────────────────────────────────────────
    const data = Array.from(groupMap.values()).map((group) => ({
      date: group.date,
      totalCommission: parseFloat(group.totalCommission.toFixed(2)),
      transactions: group.transactions,
      averageCommission:
        group.transactions > 0
          ? parseFloat((group.totalCommission / group.transactions).toFixed(2))
          : 0,
    }))

    const response = successResponse(
      "Commission report fetched successfully",
      data,
    )
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getCommissionSummary = async (req, res) => {
  try {
    const { from, to } = req.query

    const fromDate = from
      ? new Date(from)
      : new Date(new Date().setDate(new Date().getDate() - 30))
    const toDate = to ? new Date(to) : new Date()
    toDate.setHours(23, 59, 59, 999)

    // ── Derive previous period (same duration, shifted back) ─────────────────
    const periodDuration = toDate.getTime() - fromDate.getTime()
    const previousFromDate = new Date(fromDate.getTime() - periodDuration)
    const previousToDate = new Date(fromDate.getTime() - 1)

    // ── Current period ────────────────────────────────────────────────────────
    const currentAgg = await prisma.transactionLedger.aggregate({
      where: {
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { commission: true },
      _count: { id: true },
    })

    // ── Previous period ───────────────────────────────────────────────────────
    const previousAgg = await prisma.transactionLedger.aggregate({
      where: {
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: previousFromDate, lte: previousToDate },
      },
      _sum: { commission: true },
      _count: { id: true },
    })

    const totalCommission = Number(currentAgg._sum.commission ?? 0)
    const totalTransactions = currentAgg._count.id ?? 0
    const previousPeriodCommission = Number(previousAgg._sum.commission ?? 0)
    const previousPeriodTransactions = previousAgg._count.id ?? 0

    const data = {
      totalCommission: parseFloat(totalCommission.toFixed(2)),
      totalTransactions,
      previousPeriodCommission: parseFloat(previousPeriodCommission.toFixed(2)),
      previousPeriodTransactions,
    }

    const response = successResponse(
      "Commission summary fetched successfully",
      data,
    )
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getWalletSummary = async (req, res) => {
  try {
    // 1. Get admin wallet balance
    const adminWallet = await prisma.wallet.findUnique({
      where: { id: ADMIN_WALLET_ID },
      select: { balance: true },
    })

    const availableBalance = Number(adminWallet?.balance ?? 0)

    // 2. Pending balance (sum of PENDING withdrawals)
    // mock for now
    const pendingBalance = 7500
    const pendingWithdrawalsCount = 2

    // 3. Total earned (sum of all settled commission)
    const totalEarnedAgg = await prisma.transactionLedger.aggregate({
      where: { status: "COMPLETED", isSettled: true },
      _sum: { commission: true },
    })

    const totalEarned = Number(totalEarnedAgg._sum.commission ?? 0)

    // 4. Total withdrawn (mock for now)
    const totalWithdrawn = 29600
    const lastWithdrawalDate = "2026-01-12"
    const successRate = 75

    const data = {
      availableBalance,
      pendingBalance,
      totalEarned,
      totalWithdrawn,
      lastWithdrawalDate,
      pendingWithdrawalsCount,
      successRate,
    }

    const response = successResponse(
      "Wallet summary fetched successfully",
      data,
    )
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getWalletEarnings = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const entries = await prisma.transactionLedger.findMany({
      where: {
        status: "COMPLETED",
        isSettled: true,
        createdAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Group by day
    const earningsMap = new Map()

    entries.forEach((entry) => {
      const dateKey = entry.createdAt.toISOString().split("T")[0]
      const current = earningsMap.get(dateKey) ?? 0
      earningsMap.set(dateKey, current + Number(entry.totalAmount))
    })

    // Fill missing days with 0
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)

      const dateKey = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }) // "Jan 01"

      data.push({
        date: label,
        earnings: parseFloat((earningsMap.get(dateKey) ?? 0).toFixed(2)),
      })
    }

    const response = successResponse(
      "Wallet earnings fetched successfully",
      data,
    )
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getWithdrawals = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 5 } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    // Mock withdrawal data
    const allWithdrawals = [
      {
        id: "WD-001",
        amount: 5000,
        status: "COMPLETED",
        date: "2026-01-10",
        method: "Bank Transfer",
        reference: "TRF-2026-001",
      },
      {
        id: "WD-002",
        amount: 3000,
        status: "PENDING",
        date: "2026-01-12",
        method: "Bank Transfer",
        reference: "TRF-2026-002",
      },
      {
        id: "WD-003",
        amount: 7500,
        status: "COMPLETED",
        date: "2026-01-05",
        method: "Bank Transfer",
        reference: "TRF-2026-003",
      },
      {
        id: "WD-004",
        amount: 2000,
        status: "FAILED",
        date: "2026-01-08",
        method: "Bank Transfer",
        reference: "TRF-2026-004",
      },
      {
        id: "WD-005",
        amount: 4500,
        status: "PENDING",
        date: "2026-01-11",
        method: "Bank Transfer",
        reference: "TRF-2026-005",
      },
      {
        id: "WD-006",
        amount: 6200,
        status: "COMPLETED",
        date: "2026-01-03",
        method: "Bank Transfer",
        reference: "TRF-2026-006",
      },
      {
        id: "WD-007",
        amount: 1800,
        status: "FAILED",
        date: "2026-01-09",
        method: "Bank Transfer",
        reference: "TRF-2026-007",
      },
      {
        id: "WD-008",
        amount: 8900,
        status: "COMPLETED",
        date: "2026-01-01",
        method: "Bank Transfer",
        reference: "TRF-2026-008",
      },
    ]

    // ── Filter by status ──────────────────────────────────────────────────────
    const filtered =
      status === "all"
        ? allWithdrawals
        : allWithdrawals.filter((w) => w.status === status.toUpperCase())

    // ── Sort by date descending ───────────────────────────────────────────────
    const sorted = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // ── Paginate ──────────────────────────────────────────────────────────────
    const total = sorted.length
    const totalPages = Math.ceil(total / limitNum)
    const paginated = sorted.slice((pageNum - 1) * limitNum, pageNum * limitNum)

    const data = {
      data: paginated,
      total,
      page: pageNum,
      totalPages,
    }

    const response = successResponse("Withdrawals fetched successfully", data)
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const getKpis = async (req, res) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // ── 1. Buses in Operation ─────────────────────────────────────────────────
    const [totalActiveBuses, yesterdayActiveBuses, onTimeBuses, delayedBuses] =
      await Promise.all([
        // active buses today
        prisma.bus.count({
          where: { status: "ACTIVE", isActive: true },
        }),
        // yesterday's active buses for growth %
        prisma.bus.count({
          where: {
            status: "ACTIVE",
            isActive: true,
            createdAt: { lte: todayStart },
          },
        }),
        // on-time buses (no delay)
        prisma.bus.count({
          where: { status: "ACTIVE", isActive: true, delayMinutes: 0 },
        }),
        // delayed buses
        prisma.bus.count({
          where: { status: "ACTIVE", isActive: true, delayMinutes: { gt: 0 } },
        }),
      ])

    const busGrowth =
      yesterdayActiveBuses > 0
        ? parseFloat(
            (
              ((totalActiveBuses - yesterdayActiveBuses) /
                yesterdayActiveBuses) *
              100
            ).toFixed(1),
          )
        : 0

    // ── 2. Parking Occupancy ──────────────────────────────────────────────────
    const [totalParkingSlots, occupiedParkingSlots, yesterdayOccupied] =
      await Promise.all([
        prisma.parkingSlot.count(),
        prisma.parkingSlot.count(),
        // yesterday snapshot — active reservations that started before today
        prisma.parkingSlot.count({
          where: {
            updatedAt: { lt: todayStart },
          },
        }),
      ])

    const occupancyPercent =
      totalParkingSlots > 0
        ? parseFloat(
            ((occupiedParkingSlots / totalParkingSlots) * 100).toFixed(1),
          )
        : 0

    const yesterdayOccupancyPercent =
      totalParkingSlots > 0
        ? parseFloat(((yesterdayOccupied / totalParkingSlots) * 100).toFixed(1))
        : 0

    const parkingGrowth =
      yesterdayOccupancyPercent > 0
        ? parseFloat(
            (
              ((occupancyPercent - yesterdayOccupancyPercent) /
                yesterdayOccupancyPercent) *
              100
            ).toFixed(1),
          )
        : 0

    // ── 3. EV Charging Usage ──────────────────────────────────────────────────
    const [
      activeChargingPoints,
      availableChargingPoints,
      yesterdayActivePoints,
    ] = await Promise.all([
      prisma.chargingPoint.count({
        where: { status: "OCCUPIED" },
      }),
      prisma.chargingPoint.count({
        where: { status: "AVAILABLE" },
      }),
      prisma.chargingPoint.count({
        where: {
          status: "OCCUPIED",
          updatedAt: { lt: todayStart },
        },
      }),
    ])

    const totalEvPoints = activeChargingPoints + availableChargingPoints
    const evGrowth =
      yesterdayActivePoints > 0
        ? parseFloat(
            (
              ((activeChargingPoints - yesterdayActivePoints) /
                yesterdayActivePoints) *
              100
            ).toFixed(1),
          )
        : 0

    // ── 4. Tickets Issued ─────────────────────────────────────────────────────
    const [todayTickets, yesterdayTickets, onlineTickets, physicalTickets] =
      await Promise.all([
        // total tickets created today
        prisma.ticket.count({
          where: {
            createdAt: { gte: todayStart, lte: todayEnd },
          },
        }),
        // yesterday's tickets for growth %
        prisma.ticket.count({
          where: {
            createdAt: {
              gte: new Date(todayStart.getTime() - 86400000),
              lt: todayStart,
            },
          },
        }),
        // online = paid via wallet/chapa/telebirr (not cash)
        prisma.ticket.count({
          where: {
            createdAt: { gte: todayStart, lte: todayEnd },
            booking: {
              payment: {
                method: { in: ["WALLET", "TELEBIRR", "CBE"] },
              },
            },
          },
        }),
        // physical = paid via cash
        prisma.ticket.count({
          where: {
            createdAt: { gte: todayStart, lte: todayEnd },
            booking: {
              payment: {
                method: "CASH",
              },
            },
          },
        }),
      ])

    const ticketGrowth =
      yesterdayTickets > 0
        ? parseFloat(
            (
              ((todayTickets - yesterdayTickets) / yesterdayTickets) *
              100
            ).toFixed(1),
          )
        : 0

    // ── Build response ────────────────────────────────────────────────────────
    const data = [
      {
        title: "Buses in Operation",
        value: totalActiveBuses.toString(),
        subtitle: "Active today",
        change: `${busGrowth >= 0 ? "+" : ""}${busGrowth}%`,
        trend: busGrowth >= 0 ? "up" : "down",
        details: `${onTimeBuses} on-time • ${delayedBuses} delayed`,
      },
      {
        title: "Parking Occupancy",
        value: `${occupancyPercent}%`,
        subtitle: "Spots occupied",
        change: `${parkingGrowth >= 0 ? "+" : ""}${parkingGrowth}%`,
        trend: parkingGrowth >= 0 ? "up" : "down",
        details: `${occupiedParkingSlots.toLocaleString()}/${totalParkingSlots.toLocaleString()} spots`,
      },
      {
        title: "EV Charging Usage",
        value: activeChargingPoints.toString(),
        subtitle: "Active stations",
        change: `${evGrowth >= 0 ? "+" : ""}${evGrowth}%`,
        trend: evGrowth >= 0 ? "up" : "down",
        details: `${activeChargingPoints} charging • ${availableChargingPoints} available`,
      },
      {
        title: "Tickets Issued",
        value: todayTickets.toLocaleString(),
        subtitle: "Today",
        change: `${ticketGrowth >= 0 ? "+" : ""}${ticketGrowth}%`,
        trend: ticketGrowth >= 0 ? "up" : "down",
        details: `Online: ${onlineTickets.toLocaleString()} • Physical: ${physicalTickets.toLocaleString()}`,
      },
    ]

    const response = successResponse("KPIs fetched successfully", data)
    return res.status(response.statusCode).json(response)
    
  } catch (error) {
    console.log(error)
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}
