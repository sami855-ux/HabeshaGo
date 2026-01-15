import {
  createRouteService,
  findAllRoutes,
  findRouteById,
  updateRoute,
  removeRoute,
} from "../services/route.service.js"
import {
  createRouteSchema,
  updateRouteSchema,
} from "../schemas/route.schema.js"
// controllers/routeController.ts
import prisma from "../prisma/client.js" // adjust path to your prisma instance

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (err) {
    res.status(400).json({ error: err.errors })
  }
}

export const createRouteHandler = async (req, res) => {
  try {
    const result = await createRouteService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Unexpected error creating route:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while creating route.",
      data: null,
    })
  }
}

export const getRoutesHandler = async (req, res) => {
  const routes = await findAllRoutes(req.query)
  res.json(routes)
}

export const getRouteHandler = async (req, res) => {
  const route = await findRouteById(req.params.id)
  res.json(route)
}

export const updateRouteHandler = async (req, res) => {
  const route = await updateRoute(req.params.id, req.body)
  res.json(route)
}

export const deleteRouteHandler = async (req, res) => {
  const result = await removeRoute(req.params.id)
  res.json(result)
}

export const getRouteStats = async (req, res) => {
  try {
    // Get all routes
    const routes = await prisma.route.findMany({
      include: {
        midPoints: true, // include midpoints to calculate total
      },
    })

    const totalRoutes = routes.length
    const activeRoutes = routes.filter((r) => r.isActive)
    const inactiveRoutes = routes.filter((r) => !r.isActive)

    const totalDistance = routes.reduce(
      (acc, r) => acc + (r.distanceKm || 0),
      0
    )

    const averageDistance = totalRoutes > 0 ? totalDistance / totalRoutes : 0

    const totalMidPoints = routes.reduce(
      (acc, r) => acc + (r.midPoints?.length || 0),
      0
    )

    const averageMidPoints = totalRoutes > 0 ? totalMidPoints / totalRoutes : 0

    res.json({
      success: true,
      data: {
        totalRoutes,
        activeRoutes: activeRoutes.length,
        inactiveRoutes: inactiveRoutes.length,
        activePercent:
          totalRoutes > 0 ? (activeRoutes.length / totalRoutes) * 100 : 0,
        totalDistance,
        averageDistance,
        totalMidPoints,
        averageMidPoints,
      },
    })
  } catch (error) {
    console.error("Error fetching route stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch route stats",
      error: error.message,
    })
  }
}

export const getAllMidPointNamesService = async () => {
  try {
    const midPoints = await prisma.routeMidPoint.findMany({
      select: {
        id: true,
        name: true,
        routeId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      statusCode: 200,
      message: "Midpoints retrieved successfully",
      data: midPoints,
    };
  } catch (error) {
    console.error("Error fetching midpoints:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch midpoints",
      data: null,
    };
  }
};


export const routeValidators = {
  validate,
  createRouteSchema,
  updateRouteSchema,
}
