import {
  startSessionService,
  getAllSessionsService,
  updateSessionService,
  deleteSessionService,
  getSessionsByVehicleService,
  getSessionsByStationService,
  getSessionsByUserService,
  getManagerStationsSessionsService,
  getChargingSessionViewService,
} from "../services/chargingSession.service.js"

// Start a session
export const startSession = async (req, res) => {
  try {
    const result = await startSessionService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Start session error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while starting session",
      data: null,
    })
  }
}

export const getAllSessions = async (req, res) => {
  try {
    const result = await getAllSessionsService()
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get all sessions error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getSessionById = async (req, res) => {
  try {
    const result = await getChargingSessionViewService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get session by ID error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const updateSession = async (req, res) => {
  try {
    const result = await updateSessionService(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Update session error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const deleteSession = async (req, res) => {
  try {
    const result = await deleteSessionService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Delete session error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getSessionsByVehicle = async (req, res) => {
  try {
    const result = await getSessionsByVehicleService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Sessions by vehicle error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getSessionsByStation = async (req, res) => {
  try {
    const result = await getSessionsByStationService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Sessions by station error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getSessionsByUser = async (req, res) => {
  try {
    const result = await getSessionsByUserService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Sessions by user error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getManagerStationsSessions = async (req, res) => {
  try {
    const managerId = req.user?.id

    const result = await getManagerStationsSessionsService(managerId)

    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get manager sessions controller error:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching sessions",
      data: null,
    })
  }
}
