import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

export const createdRouteService = async (data) => {
  try {
    if (!data || typeof data !== "object") {
      return errorResponse("Invalid request body", 400)
    }

    const name = data.name?.trim()
    const origin = data.origin?.trim()
    const destination = data.destination?.trim()
    const midPoints = data.midPoints

    if (!name || !origin || !destination) {
      return errorResponse("Name, origin, and destination are required", 400)
    }

    if (origin === destination) {
      return errorResponse("Origin and destination cannot be the same", 400)
    }

    if (!Array.isArray(midPoints) || midPoints.length === 0) {
      return errorResponse("At least one midpoint is required", 400)
    }

    // Parse midpoints and assign ascending order automatically
    const parsedMidPoints = midPoints.map((point, index) => {
      const pointName = point?.name?.trim()
      const lat = Number(point?.lat)
      const lng = Number(point?.lng)

      if (!pointName || isNaN(lat) || isNaN(lng)) {
        throw new Error("Each midpoint must include valid name, lat and lng")
      }

      return {
        name: pointName,
        lat,
        lng,
        order: index, // ascending order
      }
    })

    const distanceKm =
      data.distanceKm !== undefined ? Number(data.distanceKm) : null

    const estimatedTimeMin =
      data.estimatedTimeMin !== undefined ? Number(data.estimatedTimeMin) : null

    const price = data.price !== undefined ? Number(data.price) : null

    if (
      (distanceKm !== null && isNaN(distanceKm)) ||
      (estimatedTimeMin !== null && isNaN(estimatedTimeMin)) ||
      (price !== null && isNaN(price))
    ) {
      return errorResponse("Numeric fields must contain valid numbers", 400)
    }

    const existingRoute = await prisma.route.findUnique({
      where: { name },
    })

    if (existingRoute) {
      return errorResponse("Route already exists", 409)
    }

    const route = await prisma.route.create({
      data: {
        name,
        origin,
        destination,
        distanceKm,
        estimatedTimeMin,
        price,
        currency: data.currency || "ETB",
        midPoints: {
          create: parsedMidPoints,
        },
      },
      include: {
        midPoints: true,
      },
    })

    return successResponse("Route created successfully", route, 201)
  } catch (error) {
    console.error("Create route unexpected error:", error)
    return errorResponse(
      error.message || "Internal server error while creating route",
      500,
    )
  }
}

export const fetchedRoutesService = async (query) => {
  try {
    const { search, isActive, isSuspended } = query

    const routes = await prisma.route.findMany({
      where: {
        name: search ? { contains: search, mode: "insensitive" } : undefined,
        isActive: isActive ? isActive === "true" : undefined,
        isSuspended: isSuspended ? isSuspended === "true" : undefined,
      },
      include: { midPoints: true },
      orderBy: { createdAt: "desc" },
    })

    return successResponse("Routes fetched successfully", routes, 200)
  } catch (error) {
    console.error("Fetch routes error:", error)
    return errorResponse("Failed to fetch routes", 500)
  }
}

export const fetchedRouteByIdService = async (id) => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
      include: {
        midPoints: true,
        buses: true,
        minibuses: true,
      },
    })

    if (!route) return errorResponse("Route not found", 404)

    return successResponse("Route fetched successfully", route, 200)
  } catch (error) {
    console.error("Fetch route error:", error)
    return errorResponse("Failed to fetch route", 500)
  }
}

export const updatedRouteService = async (id, data) => {
  try {
    const route = await prisma.route.update({
      where: { id: Number(id) },
      data,
    })

    return successResponse("Route updated successfully", route, 200)
  } catch (error) {
    console.error("Update route error:", error)
    return errorResponse("Failed to update route", 500)
  }
}

export const deletedRouteService = async (id) => {
  try {
    await prisma.route.delete({
      where: { id: Number(id) },
    })

    return successResponse("Route deleted successfully", null, 200)
  } catch (error) {
    console.error("Delete route error:", error)
    return errorResponse("Failed to delete route", 500)
  }
}

export const activatedRouteService = async (id) => {
  try {
    const route = await prisma.route.update({
      where: { id: Number(id) },
      data: { isActive: true, isSuspended: false },
    })

    return successResponse("Route activated", route, 200)
  } catch (error) {
    return errorResponse("Failed to activate route", 500)
  }
}

export const deactivatedRouteService = async (id) => {
  try {
    const route = await prisma.route.update({
      where: { id: Number(id) },
      data: { isActive: false },
    })

    return successResponse("Route deactivated", route, 200)
  } catch {
    return errorResponse("Failed to deactivate route", 500)
  }
}

export const suspendedRouteService = async (id) => {
  try {
    const route = await prisma.route.update({
      where: { id: Number(id) },
      data: { isSuspended: true },
    })

    return successResponse("Route suspended", route, 200)
  } catch {
    return errorResponse("Failed to suspend route", 500)
  }
}

export const resumedRouteService = async (id) => {
  try {
    const route = await prisma.route.update({
      where: { id: Number(id) },
      data: { isSuspended: false },
    })

    return successResponse("Route resumed", route, 200)
  } catch {
    return errorResponse("Failed to resume route", 500)
  }
}

export const searchedRoutesService = async (origin, destination) => {
  try {
    const routes = await prisma.route.findMany({
      where: {
        origin: { contains: origin, mode: "insensitive" },
        destination: { contains: destination, mode: "insensitive" },
        isActive: true,
        isSuspended: false,
      },
    })

    return successResponse("Routes found", routes, 200)
  } catch {
    return errorResponse("Failed to search routes", 500)
  }
}

export const fetchedRouteMapService = async (id) => {
  try {
    const points = await prisma.routeMidPoint.findMany({
      where: { routeId: Number(id) },
    })

    return successResponse("Route map fetched", points, 200)
  } catch {
    return errorResponse("Failed to fetch map", 500)
  }
}

export const estimatedRouteService = async (id) => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
    })

    if (!route) return errorResponse("Route not found", 404)

    return successResponse(
      "Route estimate calculated",
      {
        distanceKm: route.distanceKm,
        estimatedTimeMin: route.estimatedTimeMin,
        price: route.price,
        currency: route.currency,
      },
      200,
    )
  } catch {
    return errorResponse("Failed to estimate route", 500)
  }
}

export const getRouteStatsService = async () => {
  try {
    // total routes
    const totalRoutesPromise = prisma.route.count()

    // active routes (active AND not suspended)
    const activeRoutesPromise = prisma.route.count({
      where: {
        isActive: true,
        isSuspended: false,
      },
    })

    // sum distance
    const distancePromise = prisma.route.aggregate({
      _sum: {
        distanceKm: true,
      },
    })

    // total midpoints
    const midPointsPromise = prisma.routeMidPoint.count()

    const [totalRoutes, activeRoutes, distanceResult, totalMidPoints] =
      await Promise.all([
        totalRoutesPromise,
        activeRoutesPromise,
        distancePromise,
        midPointsPromise,
      ])

    return successResponse("Route statistics fetched successfully", {
      totalRoutes,
      activeRoutes,
      totalDistance: distanceResult._sum.distanceKm || 0,
      totalMidPoints,
    })
  } catch (error) {
    console.error("Route stats error:", error)
    return errorResponse("Failed to fetch route statistics", 500)
  }
}
