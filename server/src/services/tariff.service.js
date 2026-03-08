import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * Create a new tariff with validation
 */
export const createTariffService = async (data) => {
  try {
    const { stationId, validFrom, validTo } = data;

    // Validate overlapping tariffs
    const overlappingTariff = await prisma.tariff.findFirst({
      where: {
        stationId,
        OR: [
          {
            validFrom: { lte: new Date(validTo || "9999-12-31") },
            validTo: { gte: new Date(validFrom) },
          },
          {
            validTo: null,
            validFrom: { lte: new Date(validTo || "9999-12-31") },
          },
        ],
      },
    });

    if (overlappingTariff) {
      return errorResponse(
        "Tariff period overlaps with an existing tariff",
        400
      );
    }

    const tariff = await prisma.tariff.create({
      data: {
        ...data,
        validFrom: new Date(validFrom),
        validTo: validTo ? new Date(validTo) : null,
      },
    });

    return successResponse("Tariff created successfully", tariff, 201);
  } catch (error) {
    console.error("Error creating tariff:", error);
    return errorResponse("Failed to create tariff", 500);
  }
};

/**
 * Get all tariffs
 */
export const getAllTariffsService = async () => {
  try {
    const tariffs = await prisma.tariff.findMany({ include: { station: true } });
    return successResponse("Tariffs retrieved successfully", tariffs, 200);
  } catch (error) {
    console.error("Error fetching tariffs:", error);
    return errorResponse("Failed to fetch tariffs", 500);
  }
};

/**
 * Get tariff by ID
 */
export const getTariffByIdService = async (id) => {
  try {
    const tariff = await prisma.tariff.findUnique({
      where: { id: Number(id) },
      include: { station: true },
    });

    if (!tariff) return errorResponse("Tariff not found", 404);
    return successResponse("Tariff retrieved successfully", tariff, 200);
  } catch (error) {
    console.error("Error fetching tariff:", error);
    return errorResponse("Failed to fetch tariff", 500);
  }
};

/**
 * Update a tariff with validation
 */
export const updateTariffService = async (id, data) => {
  try {
    const { stationId, validFrom, validTo } = data;

    // Check overlapping tariffs
    const overlappingTariff = await prisma.tariff.findFirst({
      where: {
        stationId,
        id: { not: Number(id) },
        OR: [
          {
            validFrom: { lte: new Date(validTo || "9999-12-31") },
            validTo: { gte: new Date(validFrom) },
          },
          {
            validTo: null,
            validFrom: { lte: new Date(validTo || "9999-12-31") },
          },
        ],
      },
    });

    if (overlappingTariff) {
      return errorResponse(
        "Updated tariff period overlaps with an existing tariff",
        400
      );
    }

    const tariff = await prisma.tariff.update({
      where: { id: Number(id) },
      data: {
        ...data,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validTo: validTo ? new Date(validTo) : undefined,
      },
    });

    return successResponse("Tariff updated successfully", tariff, 200);
  } catch (error) {
    console.error("Error updating tariff:", error);
    return errorResponse("Failed to update tariff", 500);
  }
};

/**
 * Delete a tariff
 */
export const deleteTariffService = async (id) => {
  try {
    const tariff = await prisma.tariff.delete({ where: { id: Number(id) } });
    return successResponse("Tariff deleted successfully", tariff, 200);
  } catch (error) {
    console.error("Error deleting tariff:", error);
    return errorResponse("Failed to delete tariff", 500);
  }
};

/**
 * Get tariffs by station
 */
export const getTariffsByStationService = async (stationId) => {
  try {
    const tariffs = await prisma.tariff.findMany({
      where: { stationId: Number(stationId) },
    });
    return successResponse("Tariffs retrieved successfully", tariffs, 200);
  } catch (error) {
    console.error("Error fetching tariffs by station:", error);
    return errorResponse("Failed to fetch tariffs", 500);
  }
};