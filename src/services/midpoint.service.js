import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

export const updateMidPointService = async (id, data) => {
  try {
    if (!id) return errorResponse("MidPoint ID is required", 400)

    const midpointId = parseInt(id)
    if (isNaN(midpointId)) return errorResponse("Invalid MidPoint ID", 400)

    // Only allow these fields
    const allowedFields = ["name", "lat", "lng"]
    const updateData = {}

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        if (key === "name") {
          if (typeof data[key] !== "string" || !data[key].trim())
            return errorResponse("Invalid name", 400)
          updateData[key] = data[key].trim()
        } else {
          const value = parseFloat(data[key])
          if (isNaN(value))
            return errorResponse(`${key} must be a valid number`, 400)

          if (key === "lat" && (value < -90 || value > 90))
            return errorResponse("Latitude must be between -90 and 90", 400)
          if (key === "lng" && (value < -180 || value > 180))
            return errorResponse("Longitude must be between -180 and 180", 400)

          updateData[key] = value
        }
      }
    }

    if (Object.keys(updateData).length === 0)
      return errorResponse("No valid fields provided to update", 400)

    // Check if midpoint exists
    const existing = await prisma.routeMidPoint.findUnique({
      where: { id: midpointId },
    })
    if (!existing) return errorResponse("MidPoint not found", 404)

    const updated = await prisma.routeMidPoint.update({
      where: { id: midpointId },
      data: updateData,
    })

    return successResponse("MidPoint updated successfully", updated, 200)
  } catch (error) {
    console.error("Update MidPoint Error:", error)
    return errorResponse("Failed to update MidPoint", 500)
  }
}

export const deleteMidPointService = async (id) => {
  try {
    if (!id) return errorResponse("MidPoint ID is required", 400)

    const midpointId = parseInt(id)
    if (isNaN(midpointId)) return errorResponse("Invalid MidPoint ID", 400)

    // Check if midpoint exists
    const existing = await prisma.routeMidPoint.findUnique({
      where: { id: midpointId },
    })
    if (!existing) return errorResponse("MidPoint not found", 404)

    await prisma.routeMidPoint.delete({
      where: { id: midpointId },
    })

    return successResponse("MidPoint deleted successfully", null)
  } catch (error) {
    console.error("Delete MidPoint Error:", error)
    return errorResponse("Failed to delete MidPoint", 500)
  }
}

export const reorderMidPointsService = async (routeId, newOrder) => {
  try {
    if (!routeId) return errorResponse("Route ID is required", 400)
    const rId = parseInt(routeId)
    if (isNaN(rId)) return errorResponse("Invalid Route ID", 400)

    if (!Array.isArray(newOrder) || newOrder.length === 0)
      return errorResponse("newOrder must be a non-empty array", 400)

    // Convert IDs to numbers and validate
    const midpointIds = newOrder.map((id) => {
      const num = parseInt(id)
      if (isNaN(num)) throw new Error(`Invalid midpoint ID: ${id}`)
      return num
    })

    // Fetch all midpoints for the route to validate existence
    const midpoints = await prisma.routeMidPoint.findMany({
      where: { id: { in: midpointIds }, routeId: rId },
    })

    if (midpoints.length !== midpointIds.length)
      return errorResponse(
        "Some midpoints do not exist or do not belong to the route",
        400,
      )

    // Update order for each midpoint
    const updates = midpointIds.map((midpointId, index) =>
      prisma.routeMidPoint.update({
        where: { id: midpointId },
        data: { order: index },
      }),
    )

    await prisma.$transaction(updates)

    return successResponse("MidPoints reordered successfully")
  } catch (error) {
    console.error("Reorder MidPoints Error:", error)
    return errorResponse(error.message || "Failed to reorder midpoints", 500)
  }
}
