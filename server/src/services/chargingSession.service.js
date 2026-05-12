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

export const getChargingSessionViewService = async (sessionId) => {
  try {
    const session = await prisma.chargingSession.findUnique({
      where: { id: Number(sessionId) },
      include: {
        chargingPoint: {
          include: {
            station: {
              include: {
                tariffs: true,
              },
            },
          },
        },
        vehicle: true,
        meterLogs: {
          orderBy: {
            recordedAt: "asc",
          },
        },
      },
    })

    if (!session) {
      return errorResponse("Charging session not found", 404)
    }

    const station = session.chargingPoint.station
    const tariff = station?.tariffs?.find((t) => {
      const now = new Date()
      return (
        new Date(t.validFrom) <= now &&
        (!t.validTo || new Date(t.validTo) >= now)
      )
    })

    const energyDelivered =
      session.meterLogs?.length > 0
        ? session.meterLogs[session.meterLogs.length - 1].meterValue
        : 0

    const viewModel = {
      id: session.id,

      stationName: station?.name,
      address: station?.address,

      chargerId: `CH-${session.chargingPointId}`,
      connectorType: session.chargingPoint?.connectorType,

      startedAt: session.startTime,
      endTime: session.endTime,

      vehicleInfo: {
        model: session.vehicle?.model,
        batteryCapacity: session.vehicle?.batteryCapacity,
        currentBattery: session.vehicle?.currentBattery,
        estimatedRange: session.vehicle?.estimatedRange,
      },

      chargingStats: {
        currentPower: session.chargingPoint?.powerKw || 0,
        voltage: session.chargingPoint?.maxVoltage || 400,
        current: session.chargingPoint?.maxCurrent || 100,

        energyDelivered: Number(energyDelivered),

        sessionCost: Number(session.totalCost || 0),

        carbonSaved: Number((energyDelivered * 0.35).toFixed(2)),

        maxPower: session.chargingPoint?.powerKw || 0,
      },

      status: session.status.toLowerCase(),

      targetEnergy: session.energyConsumedKwh || 3,

      pricePerKwh: Number(tariff?.pricePerKwh || 0),
    }

    return successResponse(
      "Charging session retrieved successfully",
      viewModel,
      200,
    )
  } catch (error) {
    console.error("getChargingSessionViewService error:", error)
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

export const startChargingService = async (reservationId) => {
  // STEP 1: Fetch reservation
  const reservation = await prisma.eVReservation.findUnique({
    where: { id: reservationId },
    include: {
      chargingPoint: true,
      vehicle: true,
    },
  })

  if (!reservation) {
    throw new Error("Reservation not found")
  }

  if (new Date() > reservation.endTime) {
    throw new Error("Reservation expired")
  }

  return reservation
}

export const createChargingSession = async (reservation) => {
  const session = await prisma.chargingSession.create({
    data: {
      vehicleId: reservation.vehicleId,
      stationId: reservation.chargingPoint.stationId,
      chargingPointId: reservation.chargingPointId,
      startTime: new Date(),
      status: "ACTIVE",
      userId: reservation.userId,
    },
  })

  // update charging point
  await prisma.chargingPoint.update({
    where: { id: reservation.chargingPointId },
    data: { status: "OCCUPIED" },
  })

  // link reservation
  await prisma.eVReservation.update({
    where: { id: reservation.id },
    data: {
      chargingSessionId: session.id,
      isUsed: true,
    },
  })

  return session
}
