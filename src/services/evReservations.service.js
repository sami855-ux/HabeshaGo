import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * Create a new reservation
 */
export const createReservationService = async (data) => {
  try {
    const { vehicleId, chargingPointId, startTime, endTime, userId, isPrepaid, prepaidAmount } = data;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Check for overlapping reservations at the same charging point
    const overlappingReservation = await prisma.eVReservation.findFirst({
      where: {
        chargingPointId,
        status: { not: "CANCELLED" }, // only consider active/pending reservations
        OR: [
          {
            startTime: { lte: end },
            endTime: { gte: start }
          }
        ]
      }
    });

    if (overlappingReservation) {
      return errorResponse("This charging point is already reserved during the selected time", 400);
    }

    // 2. Optional: Check if the vehicle already has a reservation at the same time
    const vehicleOverlap = await prisma.eVReservation.findFirst({
      where: {
        vehicleId,
        status: { not: "CANCELLED" },
        OR: [
          {
            startTime: { lte: end },
            endTime: { gte: start }
          }
        ]
      }
    });

    if (vehicleOverlap) {
      return errorResponse("This vehicle already has a reservation during the selected time", 400);
    }

    // 3. Generate unique reservation code
    const reservationCode = `RES-${Date.now()}`;

    // 4. Create reservation
    const reservation = await prisma.eVReservation.create({
      data: {
        vehicleId,
        chargingPointId,
        startTime: start,
        endTime: end,
        userId,
        isPrepaid: isPrepaid ?? false,
        prepaidAmount: prepaidAmount ?? null,
        reservationCode,
      },
      include: {
        vehicle: true,
        user: true,
        chargingPoint: true,
      },
    });

    return successResponse("Reservation created successfully", reservation, 201);
  } catch (error) {
    console.error("Error creating reservation:", error);
    return errorResponse("Failed to create reservation", 500);
  }
};

/**
 * Get all reservations
 */
export const getAllReservationsService = async (filters) => {
  try {
    const { status, userId } = filters || {};
    const reservations = await prisma.eVReservation.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
      },
      include: {
        vehicle: true,
        user: true,
        chargingPoint: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return successResponse("Reservations retrieved successfully", reservations, 200);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return errorResponse("Failed to fetch reservations", 500);
  }
};

/**
 * Get reservation by id
 */
export const getReservationByIdService = async (id) => {
  try {
    const reservation = await prisma.eVReservation.findUnique({
      where: { id: Number(id) },
      include: {
        vehicle: true,
        user: true,
        chargingPoint: true,
      },
    });

    if (!reservation) return errorResponse("Reservation not found", 404);

    return successResponse("Reservation retrieved successfully", reservation, 200);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return errorResponse("Failed to fetch reservation", 500);
  }
};

/**
 * Update a reservation
 */
export const updateReservationService = async (id, data) => {
  try {
    const reservationId = Number(id);
    const existingReservation = await prisma.eVReservation.findUnique({
      where: { id: reservationId },
    });

    if (!existingReservation) {
      return errorResponse("Reservation not found", 404);
    }

    if (existingReservation.status === "CANCELLED") {
      return errorResponse("Cannot update a cancelled reservation", 400);
    }

    const { startTime, endTime, vehicleId, chargingPointId } = data;

    // Validate time range if updating
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (start >= end) {
        return errorResponse("startTime must be before endTime", 400);
      }

      // Check overlapping reservations for the same charging point
      const overlapPoint = await prisma.eVReservation.findFirst({
        where: {
          id: { not: reservationId },
          chargingPointId: chargingPointId ?? existingReservation.chargingPointId,
          status: { not: "CANCELLED" },
          OR: [
            {
              startTime: { lte: end },
              endTime: { gte: start },
            },
          ],
        },
      });

      if (overlapPoint) {
        return errorResponse(
          "This charging point is already reserved during the selected time",
          400
        );
      }

      // Check overlapping reservations for the same vehicle
      const overlapVehicle = await prisma.eVReservation.findFirst({
        where: {
          id: { not: reservationId },
          vehicleId: vehicleId ?? existingReservation.vehicleId,
          status: { not: "CANCELLED" },
          OR: [
            {
              startTime: { lte: end },
              endTime: { gte: start },
            },
          ],
        },
      });

      if (overlapVehicle) {
        return errorResponse(
          "This vehicle already has a reservation during the selected time",
          400
        );
      }
    }

    // Proceed to update
    const updatedReservation = await prisma.eVReservation.update({
      where: { id: reservationId },
      data,
      include: {
        vehicle: true,
        user: true,
        chargingPoint: true,
      },
    });

    return successResponse(
      "Reservation updated successfully",
      updatedReservation,
      200
    );
  } catch (error) {
    console.error("Error updating reservation:", error);
    return errorResponse("Failed to update reservation", 500);
  }
};

/**
 * Delete a reservation
 */
export const deleteReservationService = async (id) => {
  try {
    await prisma.eVReservation.delete({ where: { id: Number(id) } });
    return successResponse("Reservation deleted successfully", null, 200);
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return errorResponse("Failed to delete reservation", 500);
  }
};

/**
 * Get reservations by vehicle
 */
export const getReservationsByVehicleService = async (vehicleId) => {
  try {
    const reservations = await prisma.eVReservation.findMany({
      where: { vehicleId: Number(vehicleId) },
      include: { vehicle: true, user: true, chargingPoint: true },
      orderBy: { startTime: "desc" },
    });
    return successResponse("Reservations retrieved successfully", reservations, 200);
  } catch (error) {
    console.error("Error fetching reservations by vehicle:", error);
    return errorResponse("Failed to fetch reservations", 500);
  }
};

/**
 * Get reservations by charging point
 */
export const getReservationsByPointService = async (pointId) => {
  try {
    const reservations = await prisma.eVReservation.findMany({
      where: { chargingPointId: Number(pointId) },
      include: { vehicle: true, user: true, chargingPoint: true },
      orderBy: { startTime: "desc" },
    });
    return successResponse("Reservations retrieved successfully", reservations, 200);
  } catch (error) {
    console.error("Error fetching reservations by point:", error);
    return errorResponse("Failed to fetch reservations", 500);
  }
};

/**
 * Get reservations by user
 */
export const getReservationsByUserService = async (userId) => {
  try {
    const reservations = await prisma.eVReservation.findMany({
      where: { userId },
      include: { vehicle: true, user: true, chargingPoint: true },
      orderBy: { startTime: "desc" },
    });
    return successResponse("Reservations retrieved successfully", reservations, 200);
  } catch (error) {
    console.error("Error fetching reservations by user:", error);
    return errorResponse("Failed to fetch reservations", 500);
  }
};