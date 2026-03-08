import { uploadToCloudinary } from "../services/cloudinary.service.js"
import * as stationService from "../services/evStation.service.js"

export const createStation = async (req, res) => {
  try {
    const uploadedImages = []
    const uploadedDocuments = []

    // Upload Images
    if (req.files?.images) {
      for (const file of req.files.images) {
        const imageUrl = await uploadToCloudinary(
          file.buffer,
          "HabeshaGo/stations/images"
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
          "auto"
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
      ...req.body,
      lat: parseFloat(req.body.lat),
      lng: parseFloat(req.body.lng),
      images: uploadedImages,
      documents: uploadedDocuments,
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
      req.body
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
  try {
    const result = await stationService.getStationPointsService(
      req.params.id,
      req.query
    )
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
