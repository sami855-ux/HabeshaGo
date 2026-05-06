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
