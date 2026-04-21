import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

// Start a new charging session
export const startSessionService = async (data) => {
  try {
    const session = await prisma.chargingSession.create({
      data: {
        ...data,
        status: "ACTIVE",
      },
      include: {
        vehicle: true,
        station: true,
        chargingPoint: true,
        // walletTransaction: true,
      },
    })
    return successResponse("Session started successfully", session, 201)
  } catch (error) {
    console.error("Error starting session:", error)
    return errorResponse("Failed to start session", 500)
  }
}

export const getAllSessionsService = async () => {
  try {
    const sessions = await prisma.chargingSession.findMany({
      include: { vehicle: true, station: true, chargingPoint: true },
    })
    return successResponse("Sessions retrieved successfully", sessions, 200)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}

export const getSessionByIdService = async (id) => {
  try {
    const session = await prisma.chargingSession.findUnique({
      where: { id: Number(id) },
      include: { vehicle: true, station: true, chargingPoint: true },
    })
    if (!session) return errorResponse("Session not found", 404)
    return successResponse("Session retrieved successfully", session, 200)
  } catch (error) {
    console.error("Error fetching session:", error)
    return errorResponse("Failed to fetch session", 500)
  }
}

export const updateSessionService = async (id, data) => {
  try {
    // Ensure ID is a number
    const sessionId = Number(id)
    if (isNaN(sessionId)) {
      return errorResponse("Invalid session ID", 400)
    }

    // Optionally validate status field
    if (
      data.status &&
      !["ACTIVE", "COMPLETED", "CANCELLED"].includes(data.status)
    ) {
      return errorResponse("Invalid session status", 400)
    }

    // Update session in database
    const session = await prisma.chargingSession.update({
      where: { id: sessionId },
      data,
      include: {
        vehicle: true,
        station: true,
        chargingPoint: true,
        // walletTransaction: true, // include transaction if linked
        meterLogs: true, // include meter logs for full session info
      },
    })

    return successResponse("Session updated successfully", session, 200)
  } catch (error) {
    console.error("Error updating session:", error)

    // Prisma-specific error handling
    if (error.code === "P2025") {
      // Record not found
      return errorResponse("Session not found", 404)
    }

    return errorResponse("Failed to update session", 500)
  }
}

export const deleteSessionService = async (id) => {
  try {
    await prisma.chargingSession.delete({ where: { id: Number(id) } })
    return successResponse("Session deleted successfully", null, 200)
  } catch (error) {
    console.error("Error deleting session:", error)
    return errorResponse("Failed to delete session", 500)
  }
}

export const getSessionsByVehicleService = async (vehicleId) => {
  try {
    const sessions = await prisma.chargingSession.findMany({
      where: { vehicleId: Number(vehicleId) },
      include: {
        vehicle: true, // must match the relation field
        station: true,
        chargingPoint: true,
        meterLogs: true,
      },
      orderBy: { startTime: "desc" },
    })

    return successResponse("Sessions retrieved successfully", sessions, 200)
  } catch (error) {
    console.error("Error fetching sessions by vehicle:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}

export const getSessionsByStationService = async (stationId) => {
  try {
    const sessions = await prisma.chargingSession.findMany({
      where: { stationId: Number(stationId) },
      include: { vehicle: true, chargingPoint: true },
    })
    return successResponse("Sessions retrieved successfully", sessions, 200)
  } catch (error) {
    console.error("Error fetching sessions by station:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}

export const getSessionsByUserService = async (userId) => {
  try {
    const sessions = await prisma.chargingSession.findMany({
      where: { userId },
      include: { vehicle: true, station: true, chargingPoint: true },
    })
    return successResponse("Sessions retrieved successfully", sessions, 200)
  } catch (error) {
    console.error("Error fetching sessions by user:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}

export const getManagerStationsSessionsService = async (managerId) => {
  try {
    if (!managerId) {
      return errorResponse("managerId is required", 400)
    }

    const sessions = await prisma.chargingSession.findMany({
      where: {
        station: {
          managerId: managerId,
        },
      },
      include: {
        station: {
          select: {
            name: true,
            address: true,
            city: true,
          },
        },
        chargingPoint: {
          select: {
            connectorType: true,
            powerKw: true,
            slotNumber: true,
            chargingSpeed: true,
          },
        },
        vehicle: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = sessions.map((s) => ({
      id: s.id,
      stationId: s.stationId,
      chargingPointId: s.chargingPointId,
      vehicleId: s.vehicleId,
      userId: s.userId,

      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,

      energyConsumedKwh: s.energyConsumedKwh,
      durationMinutes: s.durationMinutes,

      energyCost: s.energyCost,
      timeCost: s.timeCost,
      idleFee: s.idleFee,
      totalCost: s.totalCost,

      stationName: s.station?.name,
      stationAddress: s.station?.address,
      stationCity: s.station?.city,

      connectorType: s.chargingPoint?.connectorType,
      powerKw: s.chargingPoint?.powerKw,
      slotNumber: s.chargingPoint?.slotNumber,
      chargingSpeed: s.chargingPoint?.chargingSpeed,

      userName: s.user?.name,
      userEmail: s.user?.email,

      createdAt: s.createdAt,
    }))

    return successResponse(
      "Manager sessions retrieved successfully",
      formatted,
      200,
    )
  } catch (error) {
    console.error("Error fetching manager sessions:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}
