import {
  createDriverService,
  getAllDriversService,
  getDriverByIdService,
  updateDriverService,
  verifyDriverDocumentsService,
  assignVehicleToDriverService,
  toggleDriverDutyService,
  blockDriverService,
  getFormattedDriversService,
  getCurrentTripService,
  updateLocationService,
  endTripService,
  startTripService,
  checkInPassengerService,
  getDriverTripHistoryService,
  getDriverBusWithSchedulesService,
} from "../services/driver.service.js"

import { uploadToCloudinary } from "../services/cloudinary.service.js"

export const createDriver = async (req, res) => {
  try {
    const { userId, licenseNo, experience, idType } = req.body

    // Validate files existence early
    if (
      !req.files?.driverLicense ||
      !req.files?.idFront ||
      !req.files?.idBack
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Driver license, ID front, and ID back are required",
        data: null,
      })
    }

    // Upload files to Cloudinary
    const driverLicenseUrl = await uploadToCloudinary(
      req.files.driverLicense[0].buffer,
      "HabeshaGo/Drivers/License",
    )

    const idFrontUrl = await uploadToCloudinary(
      req.files.idFront[0].buffer,
      "HabeshaGo/Drivers/ID",
    )

    const idBackUrl = await uploadToCloudinary(
      req.files.idBack[0].buffer,
      "HabeshaGo/Drivers/ID",
    )

    // Prepare clean payload for service
    const payload = {
      userId,
      licenseNo,
      experience: experience ? Number(experience) : 0,
      idType,
      driverLicenseUrl,
      idFrontUrl,
      idBackUrl,
    }

    const result = await createDriverService(payload)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Create driver controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while creating driver",
      data: null,
    })
  }
}

// GET ALL DRIVERS
export const getAllDrivers = async (_req, res) => {
  try {
    const result = await getAllDriversService()
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get all drivers controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching drivers",
      data: null,
    })
  }
}

// GET Formatted DRIVERS
export const getFormattedDrivers = async (req, res) => {
  try {
    const result = await getFormattedDriversService(req.query)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get all drivers controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching drivers",
      data: null,
    })
  }
}

// GET DRIVER BY ID
export const getDriverById = async (req, res) => {
  try {
    const result = await getDriverByIdService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get driver by id controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching driver",
      data: null,
    })
  }
}

// UPDATE DRIVER
export const updateDriver = async (req, res) => {
  try {
    const result = await updateDriverService(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Update driver controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while updating driver",
      data: null,
    })
  }
}

// VERIFY / REJECT DOCUMENTS
export const verifyDriverDocuments = async (req, res) => {
  try {
    const { licenseStatus, idStatus, rejectionReason } = req.body

    const result = await verifyDriverDocumentsService(
      req.params.id,
      req.user.id,
      licenseStatus,
      idStatus,
      rejectionReason,
    )

    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Verify driver documents controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while verifying driver documents",
      data: null,
    })
  }
}

// ASSIGN VEHICLE
export const assignVehicleToDriver = async (req, res) => {
  try {
    const result = await assignVehicleToDriverService(
      req.params.id,
      req.body.vehicleId,
    )

    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Assign vehicle controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while assigning vehicle",
      data: null,
    })
  }
}

// TOGGLE DUTY STATUS (DRIVER)
export const toggleDriverDuty = async (req, res) => {
  try {
    const result = await toggleDriverDutyService(req.user.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Toggle driver duty controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while updating duty status",
      data: null,
    })
  }
}

// BLOCK / UNBLOCK DRIVER (ADMIN)
export const blockDriver = async (req, res) => {
  try {
    const result = await blockDriverService(req.params.id, req.body.block)

    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Block driver controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while updating driver status",
      data: null,
    })
  }
}

export const toggleDutyStatus = async (req, res) => {
  try {
    const result = await toggleDriverDutyService(req.user.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Toggle duty status controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while toggling duty status",
      data: null,
    })
  }
}

// START TRIP
export const startTrip = async (req, res) => {
  try {
    const { busId, scheduleId } = req.body

    if (!busId || typeof busId !== "number") {
      return res.status(400).json({
        success: false,
        message: "busId (number) is required",
      })
    }

    const result = await startTripService("cmobrm47f0004py85qscobcww", {
      busId,
      scheduleId,
    })
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Start trip controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while starting trip",
    })
  }
}

// END TRIP
export const endTrip = async (req, res) => {
  try {
    const { busId } = req.body

    if (!busId || typeof busId !== "number") {
      return res.status(400).json({
        success: false,
        message: "busId (number) is required",
      })
    }

    const result = await endTripService("cmobrm47f0004py85qscobcww", busId)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("End trip controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while ending trip",
    })
  }
}

// UPDATE LOCATION
export const updateLocation = async (req, res) => {
  try {
    const busId = parseInt(req.params.busId, 10)

    if (isNaN(busId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid busId in URL",
      })
    }

    const { latitude, longitude, speed, heading, accuracy } = req.body

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude (-90 to 90) and longitude (-180 to 180) are required",
      })
    }

    const result = await updateLocationService(
      "cmobrm47f0004py85qscobcww",
      busId,
      {
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
      },
    )
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Update location controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating location",
    })
  }
}

// GET CURRENT TRIP
export const getCurrentTrip = async (req, res) => {
  try {
    const result = await getCurrentTripService("cmobrm47f0004py85qscobcww")
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get current trip controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching current trip",
    })
  }
}

export const checkInPassenger = async (req, res) => {
  try {
    const { qrCode } = req.body

    if (!qrCode || typeof qrCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "qrCode is required",
      })
    }

    const result = await checkInPassengerService("cmobrm47f0004py85qscobcww", {
      qrCode,
    })
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Check-in controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while checking in passenger",
    })
  }
}

export const getDriverTripHistory = async (req, res) => {
  try {
    const result = await getDriverTripHistoryService(
      "cmobrm47f0004py85qscobcww",
    )
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get driver trip history controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching trip history",
    })
  }
}

export const getDriverBusWithSchedules = async (req, res) => {
  try {
    const { driverUserId } = req.query

    if (!driverUserId || typeof driverUserId !== "string") {
      return res.status(400).json({
        success: false,
        message: "driverUserId (string) is required",
      })
    }

    const result = await getDriverBusWithSchedulesService(driverUserId)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get driver bus with schedules controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching driver bus and schedules",
    })
  }
}
