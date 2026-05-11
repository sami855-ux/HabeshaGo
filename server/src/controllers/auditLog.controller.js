import prisma from "../prisma/client.js"
import {
  getAuditLogsService,
  getAuditLogsByEntityService,
} from "../services/auditLog.service.js"
import { errorResponse, successResponse } from "../utils/apiResponse.js"

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit } = req.query
    const result = await getAuditLogsService({ page, limit })
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get audit logs controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch audit logs",
      data: null,
    })
  }
}

export const getAuditLogsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params
    const result = await getAuditLogsByEntityService(entityType, entityId)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get audit logs by entity controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch entity audit logs",
      data: null,
    })
  }
}

export const getParkingLotsForMap = async (req, res) => {
  try {
    const { lat, lng, radius = 15 } = req.query

    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)
    const radiusKm = parseFloat(radius)

    const parkingLots = await prisma.parkingLot.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        availableSlots: true,
        totalSlots: true,
        pricePerMinute: true,
        hasSecurity: true,
        hasCCTV: true,
        status: true,
      },
    })

    const formattedLots = parkingLots
      .map((lot) => {
        // Haversine distance calculation (km)
        let distance = null
        if (!isNaN(userLat) && !isNaN(userLng)) {
          const R = 6371
          const dLat = ((lot.latitude - userLat) * Math.PI) / 180
          const dLng = ((lot.longitude - userLng) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((lot.latitude * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2)
          distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        }

        return {
          id: lot.id,
          name: lot.name,
          location: {
            lat: lot.latitude,
            lng: lot.longitude,
          },
          address: lot.address,
          city: lot.city,
          availableSlots: lot.availableSlots,
          totalSlots: lot.totalSlots,
          occupiedSlots: lot.totalSlots - lot.availableSlots,
          occupancyPercentage:
            lot.totalSlots > 0
              ? Math.round(
                  ((lot.totalSlots - lot.availableSlots) / lot.totalSlots) *
                    100,
                )
              : 0,
          pricePerMinute: lot.pricePerMinute,
          features: {
            hasSecurity: lot.hasSecurity,
            hasCCTV: lot.hasCCTV,
          },
          status: lot.status,
          distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
        }
      })
      // Filter by radius only when lat/lng are provided
      .filter((lot) => {
        if (!isNaN(userLat) && !isNaN(userLng)) {
          return lot.distance <= radiusKm
        }
        return true
      })
      // Sort nearest first
      .sort((a, b) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })

    return res
      .status(200)
      .json(
        successResponse(
          "Parking lots fetched successfully",
          formattedLots,
          200,
        ),
      )
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(errorResponse("Failed to fetch parking lots", 500, error.message))
  }
}
