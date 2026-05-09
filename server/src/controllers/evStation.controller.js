import prisma from "../prisma/client.js"
import { uploadToCloudinary } from "../services/cloudinary.service.js"
import * as stationService from "../services/evStation.service.js"
import { errorResponse, successResponse } from "../utils/apiResponse.js"

export const createStation = async (req, res) => {
  const managerId = req.user?.id
  try {
    const uploadedImages = []
    const uploadedDocuments = []

    // Upload Images
    if (req.files?.images) {
      for (const file of req.files.images) {
        const imageUrl = await uploadToCloudinary(
          file.buffer,
          "HabeshaGo/stations/images",
        )

        uploadedImages.push({
          url: imageUrl,
          caption: file.originalname,
        })
      }
    }
    // Upload Documents
    if (req.files?.documents) {
      const documentTypes = JSON.parse(req.body.documentTypes || "[]")

      if (documentTypes.length !== req.files.documents.length) {
        return res.status(400).json({
          success: false,
          message: "Each document must have a corresponding type",
        })
      }

      for (let i = 0; i < req.files.documents.length; i++) {
        const file = req.files.documents[i]

        const documentUrl = await uploadToCloudinary(
          file.buffer,
          "HabeshaGo/stations/documents",
          "auto",
        )

        uploadedDocuments.push({
          url: documentUrl,
          type: documentTypes[i],
          verified: false,
        })
      }
    }

    //  Build Payload
    const payload = {
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      description: req.body.description,
      status: req.body.status,
      isVerified: req.body.isVerified === "true",

      lat: parseFloat(req.body.lat),
      lng: parseFloat(req.body.lng),

      // parse arrays safely
      chargingPoints: JSON.parse(req.body.chargingPoints || "[]"),
      tariffs: JSON.parse(req.body.tariffs || "[]"),

      images: uploadedImages,
      documents: uploadedDocuments,
      managerId: managerId,
    }

    const result = await stationService.createStationService(payload)

    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Create station controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating station",
    })
  }
}

export const getAllStations = async (req, res) => {
  try {
    const result = await stationService.getAllStationsService(req.query)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get stations controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching stations",
      data: null,
    })
  }
}

export const getMyStations = async (req, res) => {
  try {
    const result = await stationService.getStationsByManagerService(req.user.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get my stations controller error:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching stations",
      data: null,
    })
  }
}

export const getStationById = async (req, res) => {
  try {
    const result = await stationService.getStationByIdService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get station by ID controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching station",
      data: null,
    })
  }
}

export const updateStation = async (req, res) => {
  try {
    const result = await stationService.updateStationService(
      req.params.id,
      req.body,
    )
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Update station controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while updating station",
      data: null,
    })
  }
}

export const deleteStation = async (req, res) => {
  try {
    const result = await stationService.deleteStationService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Delete station controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while deleting station",
      data: null,
    })
  }
}

// Nested controllers
export const getStationPoints = async (req, res) => {
  const managerId = req.user.id
  try {
    const result = await stationService.getStationPointsService(managerId)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get station points controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Error fetching points",
      data: null,
    })
  }
}

export const getStationSessions = async (req, res) => {
  try {
    const result = await stationService.getStationSessionsService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get station sessions controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Error fetching sessions",
      data: null,
    })
  }
}

export const getStationRatings = async (req, res) => {
  try {
    const result = await stationService.getStationRatingsService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get station ratings controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Error fetching ratings",
      data: null,
    })
  }
}

export const bulkCreatePoints = async (req, res) => {
  try {
    const result = await stationService.bulkCreateChargingPointsService(
      req.body,
    )

    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Bulk create controller error:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while creating charging points",
      data: null,
    })
  }
}

export const getNearbyStations = async (req, res) => {
  try {
    const { lat, lng } = req.query

    if (!lat || !lng) {
      return res
        .status(400)
        .json(errorResponse("lat and lng are required", 400))
    }

    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)

    const stations = await prisma.chargingStation.findMany({
      where: { status: "ACTIVE" },
      include: {
        chargingPoints: {
          select: {
            status: true,
            connectorType: true,
            powerKw: true,
            chargingSpeed: true,
          },
        },
        tariffs: {
          where: {
            validFrom: { lte: new Date() },
            OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
          },
          select: { pricePerKwh: true, currency: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        images: {
          select: { url: true },
          take: 1,
        },
        _count: {
          select: { ratings: true },
        },
      },
    })

    const toRad = (deg) => (deg * Math.PI) / 180
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371
      const dLat = toRad(lat2 - lat1)
      const dLng = toRad(lng2 - lng1)
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

    const result = stations
      .map((station) => {
        const distanceKm = haversine(userLat, userLng, station.lat, station.lng)
        const availablePoints = station.chargingPoints.filter(
          (p) => p.status === "AVAILABLE",
        ).length

        return {
          id: station.id,
          name: station.name,
          address: station.address,
          city: station.city,
          lat: station.lat,
          lng: station.lng,
          status: station.status,
          isVerified: station.isVerified,
          distanceKm: parseFloat(distanceKm.toFixed(2)),
          totalPoints: station.chargingPoints.length,
          availablePoints,
          activeTariff: station.tariffs[0] ?? null,
          thumbnail: station.images[0]?.url ?? null,
          totalRatings: station._count.ratings,
        }
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)

    return res
      .status(200)
      .json(successResponse("Nearby stations fetched", result, 200))
  } catch (error) {
    console.error("Failed to fetch nearby stations", error)
    return res
      .status(500)
      .json(errorResponse("Failed to fetch nearby stations", 500))
  }
}
