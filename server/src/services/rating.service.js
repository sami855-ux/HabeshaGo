import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * Create Rating
 */
export const createRatingService = async (data) => {
  try {
    const { userId, stationId, score, comment } = data;

    // 1️⃣ Validate score
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return errorResponse("Rating score must be between 1 and 5", 400);
    }

    // 2️⃣ Prevent duplicate rating
    const existing = await prisma.rating.findUnique({
      where: {
        userId_stationId: {
          userId,
          stationId,
        },
      },
    });

    if (existing) {
      return errorResponse("You have already rated this station", 409);
    }

    // 3️⃣ Create rating
    const rating = await prisma.rating.create({
      data: {
        userId,
        stationId,
        score,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
        station: { select: { id: true, name: true } },
      },
    });

    return successResponse("Rating added successfully", rating, 201);
  } catch (error) {
    console.error("Create rating error:", error);
    return errorResponse("Failed to create rating", 500);
  }
};

/**
 * Update Rating
 */
export const updateRatingService = async (id, data, currentUserId) => {
  try {
    const ratingId = Number(id);

    const existing = await prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!existing) {
      return errorResponse("Rating not found", 404);
    }

    // 1️⃣ Ownership check
    if (existing.userId !== currentUserId) {
      return errorResponse("Unauthorized to update this rating", 403);
    }

    // 2️⃣ Validate score if provided
    if (data.score !== undefined) {
      if (!Number.isInteger(data.score) || data.score < 1 || data.score > 5) {
        return errorResponse("Rating score must be between 1 and 5", 400);
      }
    }

    const updated = await prisma.rating.update({
      where: { id: ratingId },
      data: {
        score: data.score ?? existing.score,
        comment: data.comment ?? existing.comment,
      },
    });

    return successResponse("Rating updated successfully", updated, 200);
  } catch (error) {
    console.error("Update rating error:", error);
    return errorResponse("Failed to update rating", 500);
  }
};

/**
 * Delete Rating
 */
export const deleteRatingService = async (id, currentUserId) => {
  try {
    const ratingId = Number(id);

    const existing = await prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!existing) {
      return errorResponse("Rating not found", 404);
    }

    // Ownership check
    if (existing.userId !== currentUserId) {
      return errorResponse("Unauthorized to delete this rating", 403);
    }

    await prisma.rating.delete({
      where: { id: ratingId },
    });

    return successResponse("Rating deleted successfully", null, 200);
  } catch (error) {
    console.error("Delete rating error:", error);
    return errorResponse("Failed to delete rating", 500);
  }
};

/**
 * Get Ratings by Station
 */
export const getRatingsByStationService = async (stationId) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { stationId: Number(stationId) },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Efficient average calculation
    const aggregate = await prisma.rating.aggregate({
      where: { stationId: Number(stationId) },
      _avg: { score: true },
      _count: true,
    });

    return successResponse("Station ratings retrieved", {
      ratings,
      averageRating: aggregate._avg.score || 0,
      totalRatings: aggregate._count,
    }, 200);
  } catch (error) {
    console.error("Fetch station ratings error:", error);
    return errorResponse("Failed to fetch ratings", 500);
  }
};

/**
 * Get Ratings by User
 */
export const getRatingsByUserService = async (userId) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: {
        station: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse("User ratings retrieved", ratings, 200);
  } catch (error) {
    console.error("Fetch user ratings error:", error);
    return errorResponse("Failed to fetch ratings", 500);
  }
};