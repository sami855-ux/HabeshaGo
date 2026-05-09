import prisma from "../prisma/client.js"
import {
  createBusService,
  getAllBusesService,
  getBusByIdService,
  updateBusService,
  deleteBusService,
  toggleBusStatusService,
  createBusScheduleService,
  bulkCreateBusSchedulesService,
  getBusSchedulesService,
  updateBusScheduleService,
  deleteBusScheduleService,
  searchBusesService,
  getRouteMidPointsService,
  getAllMidPointsService,
  createRatingService,
} from "../services/bus.service.js"
import { errorResponse, successResponse } from "../utils/apiResponse.js"

// Helper function to handle controller errors
const handleControllerError = (error, operation, res) => {
  console.error(`${operation} controller error:`, error)
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: `Internal server error while ${operation.toLowerCase()}`,
    data: null,
  })
}

// Helper function to wrap async controllers
const asyncHandler = (fn, operation) => async (req, res) => {
  try {
    const result = await fn(req, res)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    return handleControllerError(error, operation, res)
  }
}

export const createBus = asyncHandler(
  async (req) => await createBusService(req.body),
  "Create bus",
)

export const getAllBuses = asyncHandler(
  async () => await getAllBusesService(),
  "Get all buses",
)

export const getBusById = asyncHandler(
  async (req) => await getBusByIdService(parseInt(req.params.busId)),
  "Get bus",
)

export const updateBus = asyncHandler(
  async (req) => await updateBusService(parseInt(req.params.busId), req.body),
  "Update bus",
)

export const deleteBus = asyncHandler(
  async (req) => await deleteBusService(parseInt(req.params.busId)),
  "Delete bus",
)

export const toggleBusStatus = asyncHandler(
  async (req) =>
    await toggleBusStatusService(parseInt(req.params.busId), req.body.isActive),
  "Toggle bus status",
)
export const getRouteMidPointsController = async (req, res) => {
  const { routeId } = req.params

  const result = await getRouteMidPointsService(routeId)

  return res.status(result.statusCode).json(result)
}

export const getAllMidPointsController = async (req, res) => {
  const result = await getAllMidPointsService()

  return res.status(result.statusCode).json(result)
}

/* ---------------- BUS SCHEDULE ---------------- */

export const createBusSchedule = asyncHandler(
  async (req) =>
    await createBusScheduleService(
      parseInt(req.params.busId),
      req.body.startTime,
    ),
  "Create bus schedule",
)

export const bulkCreateBusSchedules = asyncHandler(
  async (req) =>
    await bulkCreateBusSchedulesService(
      parseInt(req.params.busId),
      req.body.startTimes,
    ),
  "Bulk create schedules",
)

export const getBusSchedules = asyncHandler(
  async (req) => await getBusSchedulesService(parseInt(req.params.busId)),
  "Get bus schedules",
)

export const updateBusSchedule = asyncHandler(
  async (req) =>
    await updateBusScheduleService(parseInt(req.params.scheduleId), req.body),
  "Update bus schedule",
)

export const deleteBusSchedule = asyncHandler(
  async (req) =>
    await deleteBusScheduleService(parseInt(req.params.scheduleId)),
  "Delete bus schedule",
)

export const searchBuses = asyncHandler(async (req) => {
  const { origin, destination, passengers, date, time } = req.query
  return await searchBusesService(
    origin,
    destination,
    parseInt(passengers),
    date,
    time,
  )
}, "Search buses")

export const createRating = async (req, res) => {
  try {
    const result = await createRatingService(req.body, req.user.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Create rating error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getBusesByVehicleIds = async (req, res) => {
  try {
    const { vehicleIds } = req.query

    if (!vehicleIds)
      return res
        .status(400)
        .json(errorResponse("vehicleIds query param is required", 400))

    // parse "1,2,3,4" → [1, 2, 3, 4]
    const ids = vehicleIds
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0)

    if (ids.length === 0)
      return res
        .status(400)
        .json(errorResponse("No valid vehicle IDs provided", 400))

    console.log("Fetching buses for vehicleIds:", ids)

    const buses = await prisma.bus.findMany({
      where: {
        vehicleId: { in: ids },
        status: "ACTIVE",
      },
      select: {
        id: true,
        busNumber: true,
        capacity: true,
        status: true,
        averageRating: true,
        totalRatings: true,
        currentStop: true,
        nextDestination: true,
        isActive: true,
        departureTime: true,
        estimatedArrival: true,
        delayMinutes: true,
        vehicleId: true,
        driver: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        route: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    console.log(`Found ${buses.length} buses for vehicleIds:`, ids)

    return res
      .status(200)
      .json(successResponse("Buses fetched successfully", buses, 200))
  } catch (error) {
    console.error("Failed to fetch buses by vehicle IDs", error)
    return res.status(500).json(errorResponse("Failed to fetch buses", 500))
  }
}
