import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Create charging point
export const createPointService = async (data) => {
  try {
    const point = await prisma.chargingPoint.create({ data });
    return successResponse("Charging point created successfully", point, 201);
  } catch (error) {
    console.error("Error creating charging point:", error);
    return errorResponse("Failed to create charging point", 500);
  }
};

// Get all charging points with optional filters
export const getAllPointsService = async (filters) => {
  try {
    const { connectorType, status } = filters || {};
    const points = await prisma.chargingPoint.findMany({
      where: {
        ...(connectorType && { connectorType }),
        ...(status && { status }),
      },
    });
    return successResponse("Charging points retrieved", points, 200);
  } catch (error) {
    console.error("Error fetching charging points:", error);
    return errorResponse("Failed to fetch charging points", 500);
  }
};

// Get point by ID
export const getPointByIdService = async (id) => {
  try {
    const point = await prisma.chargingPoint.findUnique({ where: { id: Number(id) } });
    if (!point) return errorResponse("Charging point not found", 404);
    return successResponse("Charging point retrieved", point, 200);
  } catch (error) {
    console.error("Error fetching charging point:", error);
    return errorResponse("Failed to fetch charging point", 500);
  }
};

export const updatePointService = async (id, data) => {
  try {
    // Check if the charging point exists
    const existingPoint = await prisma.chargingPoint.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPoint) {
      return errorResponse("Charging point not found", 404);
    }

    // Optional: filter allowed fields to prevent accidental updates
    const allowedFields = [
      "connectorType",
      "powerKw",
      "status",
      "averageSessionDuration",
      "slotNumber",
      "maxVoltage",
      "maxCurrent",
      "chargingSpeed"
    ];
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );

    const updatedPoint = await prisma.chargingPoint.update({
      where: { id: Number(id) },
      data: filteredData,
    });

    return successResponse("Charging point updated successfully", updatedPoint, 200);
  } catch (error) {
    console.error("Error updating charging point:", error);
    return errorResponse("Failed to update charging point", 500);
  }
};

// Delete charging point
export const deletePointService = async (id) => {
  try {
    await prisma.chargingPoint.delete({ where: { id: Number(id) } });
    return successResponse("Charging point deleted", null, 200);
  } catch (error) {
    console.error("Error deleting charging point:", error);
    return errorResponse("Failed to delete charging point", 500);
  }
};

// Get points used in a session
export const getSessionPointsService = async (sessionId) => {
  try {
    const session = await prisma.chargingSession.findUnique({
      where: { id: Number(sessionId) },
      include: { chargingPoint: true },
    });
    if (!session) return errorResponse("Session not found", 404);
    return successResponse("Session points retrieved", session.chargingPoint, 200);
  } catch (error) {
    console.error("Error fetching session points:", error);
    return errorResponse("Failed to fetch session points", 500);
  }
};

// Get points for a reservation
export const getReservationPointsService = async (reservationId) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(reservationId) },
      include: { chargingPoint: true },
    });
    if (!reservation) return errorResponse("Reservation not found", 404);
    return successResponse("Reservation points retrieved", reservation.chargingPoint, 200);
  } catch (error) {
    console.error("Error fetching reservation points:", error);
    return errorResponse("Failed to fetch reservation points", 500);
  }
};