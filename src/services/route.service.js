import prisma from "../prisma/client.js"
import { NotFound } from "../utils/error.js"

export const createRouteService = async (data) => {
  try {
    // First, create the route
    const route = await prisma.route.create({
      data: {
        name: data.name,
        origin: data.origin,
        destination: data.destination,
        distanceKm: data.distanceKm,
        estimatedTimeMin: data.estimatedTimeMin,
        isActive: data.isActive ?? true,
        midPoints: {},
      },
    })

    // If midPoints are provided, create related RouteMidPoint records
    if (data.midPoints && data.midPoints.length > 0) {
      const midPointsData = data.midPoints.map((mp) => ({
        ...mp,
        routeId: route.id, // link to the newly created route
      }))

      await prisma.routeMidPoint.createMany({
        data: midPointsData,
      })
    }

    // Include the created midPoints in the returned route
    const createdRoute = await prisma.route.findUnique({
      where: { id: route.id },
      include: { midPoints: true },
    })

    return {
      success: true,
      statusCode: 201,
      message: "Route created successfully.",
      data: createdRoute,
    }
  } catch (error) {
    console.error("Error creating route:", error)
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create route.",
      data: null,
    }
  }
}

export const findAllRoutes = async (query) => {
  const page = query.page ? Number(query.page) : 1
  const limit = Math.min(query.limit ? Number(query.limit) : 20, 100)
  const skip = (page - 1) * limit

  const where = {}
  if (query.isActive !== undefined) where.isActive = query.isActive === "true"

  const [data, total] = await prisma.$transaction([
    prisma.route.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.route.count({ where }),
  ])

  return { data, meta: { page, limit, total } }
}

export const findRouteById = async (id) => {
  const route = await prisma.route.findUnique({ where: { id: Number(id) } })
  if (!route) throw new NotFound("Route not found")
  return route
}

export const updateRoute = async (id, data) => {
  await findRouteById(id) // ensure exists
  const updated = await prisma.route.update({
    where: { id: Number(id) },
    data,
  })
  return updated
}

export const removeRoute = async (id) => {
  await findRouteById(id)
  const deleted = await prisma.route.update({
    where: { id: Number(id) },
    data: { isActive: false },
  })
  return { message: "Route removed", route: deleted }
}
