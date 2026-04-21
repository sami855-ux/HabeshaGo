import { Prisma } from "@prisma/client"
import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

export const createStationService = async (data) => {
  try {
    const {
      name,
      lat,
      lng,
      address,
      city,
      managerId,
      status = "ACTIVE",
      isVerified = false,
      images = [],
      documents = [],
      chargingPoints = [],
      tariffs = [],
    } = data

    // Basic Validation
    if (!name || lat == null || lng == null) {
      return errorResponse("Name, latitude and longitude are required", 400)
    }

    // Prevent Duplicate Nearby Station (~1km radius)
    const existingStation = await prisma.chargingStation.findFirst({
      where: {
        name,
        lat: { gte: lat - 0.01, lte: lat + 0.01 },
        lng: { gte: lng - 0.01, lte: lng + 0.01 },
      },
    })

    if (existingStation) {
      return errorResponse(
        "Station with the same name and nearby location already exists",
        400,
      )
    }

    // Create Station
    const station = await prisma.chargingStation.create({
      data: {
        name: name.trim(),
        lat: Number(lat),
        lng: Number(lng),
        address: address?.trim() || null,
        city: city?.trim() || null,
        status,
        isVerified: Boolean(isVerified),
        managerId: managerId,

        // Charging Points
        chargingPoints:
          chargingPoints.length > 0
            ? {
                create: chargingPoints.map((point) => ({
                  connectorType: point.connectorType || "TYPE2",
                  powerKw: Number(point.powerKw),
                  status: point.status || "AVAILABLE",
                  slotNumber: point.slotNumber || null,
                  maxVoltage: point.maxVoltage
                    ? Number(point.maxVoltage)
                    : null,
                  maxCurrent: point.maxCurrent
                    ? Number(point.maxCurrent)
                    : null,
                  chargingSpeed: point.chargingSpeed || "SLOW",
                })),
              }
            : undefined,

        // Tariffs
        tariffs:
          tariffs.length > 0
            ? {
                create: tariffs.map((tariff) => ({
                  pricePerKwh: new Prisma.Decimal(tariff.pricePerKwh),
                  pricePerMinute: tariff.pricePerMinute || null,
                  idleFeePerMinute: tariff.idleFeePerMinute || null,
                  currency: tariff.currency || "ETB",
                  validFrom: new Date(tariff.validFrom) || new Date(),
                  validTo: tariff.validTo ? new Date(tariff.validTo) : null,
                })),
              }
            : undefined,

        // Images
        images:
          images.length > 0
            ? {
                create: images.map((img) => ({
                  url: img.url,
                  caption: img.caption || "Station Image",
                })),
              }
            : undefined,

        // Documents
        documents:
          documents.length > 0
            ? {
                create: documents.map((doc) => ({
                  url: doc.url,
                  type: doc.type || "LICENSE",
                  verified: false,
                })),
              }
            : undefined,
      },

      include: {
        images: true,
        documents: true,
        chargingPoints: true,
        tariffs: true,
      },
    })

    return successResponse("Station created successfully", station, 201)
  } catch (error) {
    console.error("Error creating station:", error)
    return errorResponse("Failed to create station", 500)
  }
}

export const getAllStationsService = async (filters = {}) => {
  try {
    const {
      city,
      status,
      search,
      verifiedOnly,
      availableOnly,
      connectorTypes,
      minPower,
      lat,
      lng,
      radius = 50,
    } = filters

    const where = {}

    if (city) {
      where.city = city
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    if (verifiedOnly === true || verifiedOnly === "true") {
      where.isVerified = true
    }

    if (connectorTypes || minPower || availableOnly) {
      where.chargingPoints = {
        some: {
          ...(connectorTypes?.length && {
            connectorType: {
              in: connectorTypes,
            },
          }),

          ...(minPower && {
            powerKw: {
              gte: Number(minPower),
            },
          }),

          ...(availableOnly === true || availableOnly === "true"
            ? {
                status: "AVAILABLE",
              }
            : {}),
        },
      }
    }

    let stations = await prisma.chargingStation.findMany({
      where,
      include: {
        chargingPoints: true,
        ratings: true,
        tariffs: true,
        sessions: true,
        images: true,
        documents: true,
      },
    })

    if (lat && lng) {
      const userLat = Number(lat)
      const userLng = Number(lng)

      stations = stations
        .map((station) => {
          const distance =
            Math.sqrt(
              Math.pow(station.lat - userLat, 2) +
                Math.pow(station.lng - userLng, 2),
            ) * 111 // approx km conversion

          return {
            ...station,
            distance,
          }
        })
        .filter((s) => s.distance <= Number(radius))
        .sort((a, b) => a.distance - b.distance)
    }

    return successResponse("Stations retrieved successfully", stations, 200)
  } catch (error) {
    console.error("Error fetching stations:", error)
    return errorResponse("Failed to fetch stations", 500)
  }
}

export const getStationByIdService = async (id) => {
  try {
    const station = await prisma.chargingStation.findUnique({
      where: { id: Number(id) },
      include: {
        chargingPoints: true,
        ratings: true,
        tariffs: true,
        sessions: true,
        images: true,
        documents: true,
      },
    })
    if (!station) return errorResponse("Station not found", 404)
    return successResponse("Station retrieved successfully", station, 200)
  } catch (error) {
    console.error("Error fetching station:", error)
    return errorResponse("Failed to fetch station", 500)
  }
}

export const getStationsByManagerService = async (managerId) => {
  try {
    const stations = await prisma.chargingStation.findMany({
      where: { managerId },
      include: {
        chargingPoints: true,
        ratings: true,
        tariffs: true,
        images: true,
        documents: true,
        sessions: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return successResponse("Stations retrieved successfully", stations, 200)
  } catch (error) {
    console.error("Error fetching manager stations:", error)
    return errorResponse("Failed to fetch stations", 500)
  }
}
export const updateStationService = async (id, data) => {
  try {
    const stationId = Number(id)

    // Check if station exists
    const existingStation = await prisma.chargingStation.findUnique({
      where: { id: stationId },
    })

    if (!existingStation) {
      return errorResponse("Station not found", 404)
    }

    // Optional: Prevent duplicate station name + nearby lat/lng
    if (data.name || data.lat || data.lng) {
      const duplicateStation = await prisma.chargingStation.findFirst({
        where: {
          id: { not: stationId },
          name: data.name ?? existingStation.name,
          lat: {
            gte: (data.lat ?? existingStation.lat) - 0.01,
            lte: (data.lat ?? existingStation.lat) + 0.01,
          },
          lng: {
            gte: (data.lng ?? existingStation.lng) - 0.01,
            lte: (data.lng ?? existingStation.lng) + 0.01,
          },
        },
      })
      if (duplicateStation) {
        return errorResponse(
          "Another station with the same name and nearby location already exists",
          400,
        )
      }
    }

    // Handle nested updates for images and documents if provided
    const updateData = { ...data }
    if (data.images) {
      updateData.images = {
        deleteMany: {}, // remove old images
        create: data.images.map((img) => ({
          url: img.url,
          caption: img.caption,
        })),
      }
    }
    if (data.documents) {
      updateData.documents = {
        deleteMany: {}, // remove old docs
        create: data.documents.map((doc) => ({
          url: doc.url,
          type: doc.type,
          description: doc.description,
        })),
      }
    }

    const updatedStation = await prisma.chargingStation.update({
      where: { id: stationId },
      data: updateData,
      include: {
        images: true,
        documents: true,
        chargingPoints: true,
        ratings: true,
        tariffs: true,
        sessions: true,
      },
    })

    return successResponse("Station updated successfully", updatedStation, 200)
  } catch (error) {
    console.error("Error updating station:", error)
    return errorResponse("Failed to update station", 500)
  }
}

export const deleteStationService = async (id) => {
  try {
    await prisma.chargingStation.delete({
      where: { id: Number(id) },
    })
    return successResponse("Station deleted successfully", null, 200)
  } catch (error) {
    console.error("Error deleting station:", error)
    return errorResponse("Failed to delete station", 500)
  }
}

export const getStationPointsService = async (managerId) => {
  try {
    const stations = await prisma.chargingStation.findMany({
      where: { managerId },
      include: {
        chargingPoints: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const formatted = stations.flatMap((station) =>
      station.chargingPoints.map((point) => ({
        // 🔌 Charging Point
        id: point.id,
        stationId: point.stationId,
        connectorType: point.connectorType,
        powerKw: point.powerKw,
        status: point.status,
        slotNumber: point.slotNumber,
        chargingSpeed: point.chargingSpeed,
        averageSessionDuration: point.averageSessionDuration,
        maxVoltage: point.maxVoltage,
        maxCurrent: point.maxCurrent,
        createdAt: point.createdAt,

        // ⚡ computed fields
        isAvailable: point.status === "AVAILABLE",
        isFastCharger: point.powerKw >= 50,

        // 🏢 Station (flattened)
        stationName: station.name,
        stationAddress: station.address,
        stationCity: station.city,
        stationLat: station.lat,
        stationLng: station.lng,
        stationStatus: station.status,
        stationVerified: station.isVerified,
      })),
    )

    return successResponse(
      "Stations with charging points retrieved",
      formatted,
      200,
    )
  } catch (error) {
    console.error("Error fetching stations with points:", error)
    return errorResponse("Failed to fetch stations", 500)
  }
}

export const getStationSessionsService = async (stationId) => {
  try {
    const sessions = await prisma.chargingSession.findMany({
      where: { stationId: Number(stationId) },
    })
    return successResponse("Sessions retrieved successfully", sessions, 200)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return errorResponse("Failed to fetch sessions", 500)
  }
}

export const getStationRatingsService = async (stationId) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { stationId: Number(stationId) },
    })
    return successResponse("Ratings retrieved successfully", ratings, 200)
  } catch (error) {
    console.error("Error fetching ratings:", error)
    return errorResponse("Failed to fetch ratings", 500)
  }
}

export const getStationTariffsService = async (stationId) => {
  try {
    const tariffs = await prisma.tariff.findMany({
      where: { stationId: Number(stationId) },
    })
    return successResponse("Tariffs retrieved successfully", tariffs, 200)
  } catch (error) {
    console.error("Error fetching tariffs:", error)
    return errorResponse("Failed to fetch tariffs", 500)
  }
}

export const bulkCreateChargingPointsService = async (data) => {
  try {
    const { stationId, chargingPoints } = data

    if (!stationId || isNaN(Number(stationId))) {
      return errorResponse("Valid stationId is required", 400)
    }

    if (!Array.isArray(chargingPoints) || chargingPoints.length === 0) {
      return errorResponse("chargingPoints must be a non-empty array", 400)
    }

    const station = await prisma.chargingStation.findUnique({
      where: { id: Number(stationId) },
    })

    if (!station) {
      return errorResponse("Charging station not found", 404)
    }

    const preparedData = chargingPoints.map((point, index) => {
      if (!point.connectorType) {
        throw new Error(`connectorType is required at index ${index}`)
      }

      if (!point.powerKw || isNaN(Number(point.powerKw))) {
        throw new Error(`Valid powerKw is required at index ${index}`)
      }

      return {
        stationId: Number(stationId),
        connectorType: point.connectorType,
        powerKw: Number(point.powerKw),
        status: point.status || "AVAILABLE",
        chargingSpeed: point.chargingSpeed || "SLOW",
        slotNumber: point.slotNumber || null,
        maxVoltage: point.maxVoltage ? Number(point.maxVoltage) : null,
        maxCurrent: point.maxCurrent ? Number(point.maxCurrent) : null,
        averageSessionDuration: point.averageSessionDuration
          ? Number(point.averageSessionDuration)
          : null,
      }
    })

    const result = await prisma.chargingPoint.createMany({
      data: preparedData,
      skipDuplicates: true,
    })

    return successResponse(
      "Charging points created successfully",
      { createdCount: result.count },
      201,
    )
  } catch (error) {
    console.error("Error creating charging points:", error)

    return errorResponse(
      error.message || "Failed to create charging points",
      500,
    )
  }
}
