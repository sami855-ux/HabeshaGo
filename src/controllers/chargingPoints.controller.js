import {
  createPointService,
  getAllPointsService,
  getPointByIdService,
  updatePointService,
  deletePointService,
  getSessionPointsService,
  getReservationPointsService
} from "../services/chargingPoints.service.js";

// Create charging point
export const createPoint = async (req, res) => {
  try {
    const result = await createPointService(req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Create point controller error:", error);
    return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error", data: null });
  }
};

// Get all charging points
export const getAllPoints = async (req, res) => {
  try {
    const result = await getAllPointsService(req.query);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Get all points controller error:", error);
    return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error", data: null });
  }
};

// Get point by ID
export const getPointById = async (req, res) => {
  try {
    const result = await getPointByIdService(req.params.id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Get point by ID controller error:", error);
    return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error", data: null });
  }
};

// Update point
export const updatePoint = async (req, res) => {
  try {
    const result = await updatePointService(req.params.id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Update point controller error:", error);
    return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error", data: null });
  }
};

// Delete point
export const deletePoint = async (req, res) => {
  try {
    const result = await deletePointService(req.params.id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Delete point controller error:", error);
    return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error", data: null });
  }
};

// Get points for a session
export const getSessionPoints = async (req, res) => {
  try {
    const result = await getSessionPointsService(req.params.id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Get session points controller error:", error);
    return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error", data: null });
  }
};

// Get points for a reservation
export const getReservationPoints = async (req, res) => {
  try {
    const result = await getReservationPointsService(req.params.id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Get reservation points controller error:", error);
    return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error", data: null });
  }
};