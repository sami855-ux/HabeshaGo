import { successResponse, errorResponse } from "../utils/apiResponse.js"
import prisma from "../prisma/client.js"

export const createBusService = async (data) => {
  try {
    // Extract and validate form data
    const {
      busNumber, // String Required — must be unique (e.g., "BUS-101")
      capacity, // Int Required — number of seats
      routeId, // Int Optional at creation — but recommended to assign a route
      driverId, // String Optional — assign later or at creation if driver exists
      currentStop, // String Optional — where the bus is currently located
      nextDestination, // String Optional — next stop or final destination
      departureTime, // DateTime Optional — initial departure time
      estimatedArrival, // DateTime Optional — calculated from route
      delayMinutes = 0, // Int Optional — default 0
      availableSeats, // Int Optional — can default to capacity if not provided
      vehicleId, // Int Optional — if this bus is linked to a vehicle
      lastServiceDate, // DateTime Optional — for maintenance tracking
      nextServiceDate, // DateTime Optional — next maintenance date
      status = "ACTIVE", // BusStatus Optional — default ACTIVE
      isActive = true, // Boolean Optional — default true
    } = data

    // Validate required fields
    if (!busNumber || !capacity) {
      return errorResponse("Bus number and capacity are required", 400)
    }

    // Check if bus number already exists
    const existingBus = await prisma.bus.findUnique({
      where: { busNumber },
    })
    if (existingBus) {
      return errorResponse("Bus number already exists", 400)
    }

    // Validate relations if provided
    if (routeId) {
      const route = await prisma.route.findUnique({
        where: { id: parseInt(routeId) },
      })
      if (!route) {
        return errorResponse("Route not found", 404)
      }
    }

    if (driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      })
      if (!driver) {
        return errorResponse("Driver not found", 404)
      }

      // Check if driver is already assigned to another bus
      const assignedBus = await prisma.bus.findUnique({
        where: { driverId },
      })
      if (assignedBus) {
        return errorResponse("Driver is already assigned to another bus", 400)
      }
    }

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parseInt(vehicleId) },
      })
      if (!vehicle) {
        return errorResponse("Vehicle not found", 404)
      }

      // Check if vehicle is already assigned to another bus
      const assignedBus = await prisma.bus.findUnique({
        where: { vehicleId: parseInt(vehicleId) },
      })
      if (assignedBus) {
        return errorResponse("Vehicle is already assigned to another bus", 400)
      }
    }

    // Prepare bus data for creation
    const busData = {
      busNumber,
      capacity: parseInt(capacity),
      status,
      isActive,
      delayMinutes: parseInt(delayMinutes),
      reservedSeats: 0, // Default to 0 for new bus
      availableSeats: availableSeats
        ? parseInt(availableSeats)
        : parseInt(capacity),
    }

    // Add optional fields if provided
    if (routeId) busData.routeId = parseInt(routeId)
    if (driverId) busData.driverId = driverId
    if (currentStop) busData.currentStop = currentStop
    if (nextDestination) busData.nextDestination = nextDestination
    if (vehicleId) busData.vehicleId = parseInt(vehicleId)

    // Handle datetime fields
    if (departureTime) {
      busData.departureTime = new Date(departureTime)
    }
    if (estimatedArrival) {
      busData.estimatedArrival = new Date(estimatedArrival)
    }
    if (lastServiceDate) {
      busData.lastServiceDate = new Date(lastServiceDate)
    }
    if (nextServiceDate) {
      busData.nextServiceDate = new Date(nextServiceDate)
    }

    // Create the bus with relations
    const bus = await prisma.bus.create({
      data: busData,
      include: {
        route: true,
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        vehicle: true,
        schedules: true,
      },
    })

    return successResponse("Bus created successfully", bus, 201)
  } catch (error) {
    console.error("Create bus error:", error)

    // Handle Prisma specific errors
    if (error.code === "P2002") {
      return errorResponse("Bus number must be unique", 400)
    }
    if (error.code === "P2003") {
      return errorResponse("Invalid reference to related record", 400)
    }

    return errorResponse("Failed to create bus", 500)
  }
}

export const getAllBusesService = async () => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        schedules: true,
        route: true,
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    const formattedBuses = buses.map((bus) => ({
      ...bus,
      driverName: bus.driver?.user?.name ?? "Unassigned",
    }))

    return successResponse("Buses retrieved successfully", formattedBuses, 200)
  } catch (error) {
    console.error("Get all buses error:", error)
    return errorResponse("Failed to fetch buses", 500)
  }
}

export const getBusByIdService = async (busId) => {
  try {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        schedules: true,
        route: true,
        vehicle: true,
        driver: {
          include: {
            user: {
              select: {
                name: true, // just grab the name
              },
            },
          },
        },
      },
    })

    const formattedBus = {
      ...bus,
      driver: bus.driver
        ? {
            ...bus.driver,
            name: bus.driver.user?.name ?? "Unassigned", // add name directly on driver
          }
        : null,
    }

    if (!formattedBus) return errorResponse("Bus not found", 404)
    return successResponse("Bus retrieved successfully", formattedBus, 200)
  } catch (error) {
    console.error("Get bus by ID error:", error)
    return errorResponse("Failed to fetch bus", 500)
  }
}

export const updateBusService = async (busId, data) => {
  try {
    const bus = await prisma.bus.update({ where: { id: busId }, data })
    return successResponse("Bus updated successfully", bus, 200)
  } catch (error) {
    console.error("Update bus error:", error)
    return errorResponse("Failed to update bus", 500)
  }
}

export const deleteBusService = async (busId) => {
  try {
    await prisma.bus.delete({ where: { id: busId } })
    return successResponse("Bus deleted successfully", null, 200)
  } catch (error) {
    console.error("Delete bus error:", error)
    return errorResponse("Failed to delete bus", 500)
  }
}

export const toggleBusStatusService = async (busId, isActive) => {
  try {
    const bus = await prisma.bus.update({
      where: { id: busId },
      data: { isActive },
    })
    return successResponse("Bus status updated successfully", bus, 200)
  } catch (error) {
    console.error("Toggle bus status error:", error)
    return errorResponse("Failed to update bus status", 500)
  }
}

/* ------------------ BUS SCHEDULE ------------------ */

export const createBusScheduleService = async (busId, startTime) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: busId } })
    if (!bus || !bus.routeId)
      return errorResponse("Bus or route not found", 404)

    const overlap = await prisma.busSchedule.findFirst({
      where: { busId, startTime },
    })
    if (overlap) return errorResponse("Schedule already exists", 400)

    const schedule = await prisma.busSchedule.create({
      data: { busId, routeId: bus.routeId, startTime },
    })
    return successResponse("Bus schedule created successfully", schedule, 201)
  } catch (error) {
    console.error("Create bus schedule error:", error)
    return errorResponse("Failed to create schedule", 500)
  }
}

export const bulkCreateBusSchedulesService = async (busId, startTimes) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: busId } })
    if (!bus || !bus.routeId)
      return errorResponse("Bus or route not found", 404)

    const schedules = []
    for (const time of startTimes) {
      const overlap = await prisma.busSchedule.findFirst({
        where: { busId, startTime: time },
      })
      if (!overlap) {
        const schedule = await prisma.busSchedule.create({
          data: { busId, routeId: bus.routeId, startTime: time },
        })
        schedules.push(schedule)
      }
    }
    return successResponse("Bus schedules created successfully", schedules, 201)
  } catch (error) {
    console.error("Bulk create bus schedules error:", error)
    return errorResponse("Failed to create schedules", 500)
  }
}

export const getBusSchedulesService = async (busId) => {
  try {
    const schedules = await prisma.busSchedule.findMany({
      where: { busId },
      include: { route: true },
    })
    return successResponse(
      "Bus schedules retrieved successfully",
      schedules,
      200,
    )
  } catch (error) {
    console.error("Get bus schedules error:", error)
    return errorResponse("Failed to fetch schedules", 500)
  }
}

export const updateBusScheduleService = async (scheduleId, data) => {
  try {
    const schedule = await prisma.busSchedule.update({
      where: { id: scheduleId },
      data,
    })
    return successResponse("Bus schedule updated successfully", schedule, 200)
  } catch (error) {
    console.error("Update bus schedule error:", error)
    return errorResponse("Failed to update schedule", 500)
  }
}

export const deleteBusScheduleService = async (scheduleId) => {
  try {
    await prisma.busSchedule.delete({ where: { id: scheduleId } })
    return successResponse("Bus schedule deleted successfully", null, 200)
  } catch (error) {
    console.error("Delete bus schedule error:", error)
    return errorResponse("Failed to delete schedule", 500)
  }
}

/* ------------------ SEARCH BUS ------------------ */

export const searchBusesService = async (
  origin,
  destination,
  passengers,
  date,
  time,
) => {
  try {
    if (!origin || !destination || !date || !time || !passengers) {
      return errorResponse("Missing required search parameters", 400)
    }

    const routes = await prisma.route.findMany({
      where: { origin, destination },
    })
    if (routes.length === 0) return errorResponse("No routes found", 404)

    const routeIds = routes.map((r) => r.id)

    const schedules = await prisma.busSchedule.findMany({
      where: { routeId: { in: routeIds }, isActive: true },
      include: { bus: true, route: true },
    })

    // Filter by start time and available seats
    const result = schedules
      .filter(
        (s) =>
          s.startTime >= time &&
          s.bus.capacity - s.bus.reservedSeats >= passengers,
      )
      .map((s) => {
        const [h, m] = s.startTime.split(":").map(Number)
        const arrival = new Date(date)
        arrival.setHours(h, m + (s.route.estimatedTimeMin || 0))
        return {
          busId: s.busId,
          busNumber: s.bus.busNumber,
          startTime: s.startTime,
          arrivalTime: arrival.toTimeString().slice(0, 5),
          availableSeats: s.bus.capacity - s.bus.reservedSeats,
        }
      })

    return successResponse("Buses retrieved successfully", result, 200)
  } catch (error) {
    console.error("Search buses error:", error)
    return errorResponse("Failed to search buses", 500)
  }
}
