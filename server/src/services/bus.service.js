import { successResponse, errorResponse } from "../utils/apiResponse.js"
import prisma from "../prisma/client.js"

const MIN_INTERVAL = 45

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
        vehicle: {
          include: {
            locations: true,
          },
        },
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

/*---------- BUS SCHEDULE---------- */

const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

const minutesToTime = (mins) => {
  const normalized = ((mins % 1440) + 1440) % 1440
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

const isValidTime = (t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)

const addMinutesToTime = (timeStr, minutesToAdd) => {
  return minutesToTime(timeToMinutes(timeStr) + minutesToAdd)
}
export const createBusScheduleService = async (busId, startTime) => {
  try {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        route: {
          select: { estimatedTimeMin: true },
        },
      },
    })

    if (!bus || !bus.route) return errorResponse("Bus or route not found", 404)

    const duration = bus.route.estimatedTimeMin || 0
    const newStartMin = timeToMinutes(startTime)
    const newEndMin = newStartMin + duration

    // 🔹 Get existing schedules
    const existing = await prisma.busSchedule.findMany({
      where: { busId },
      orderBy: { startTime: "asc" },
    })

    // 🔹 Interval validation (your existing logic)
    for (const s of existing) {
      const sStart = timeToMinutes(s.startTime)
      const sEnd = timeToMinutes(s.endTime)

      const gapBefore = newStartMin - sEnd
      const gapAfter = sStart - newEndMin

      if (
        newStartMin === sStart ||
        (gapBefore >= 0 && gapBefore < MIN_INTERVAL) ||
        (gapAfter >= 0 && gapAfter < MIN_INTERVAL)
      ) {
        return errorResponse(
          `Minimum ${MIN_INTERVAL} minutes interval required between schedules`,
          400,
        )
      }
    }

    // 🔥 Direction Logic
    let direction = "FORWARD"

    if (existing.length > 0) {
      const lastSchedule = existing[existing.length - 1]

      direction = lastSchedule.direction === "FORWARD" ? "REVERSE" : "FORWARD"
    }

    const endTime = minutesToTime(newEndMin)

    const schedule = await prisma.busSchedule.create({
      data: {
        busId,
        startTime,
        endTime,
        direction,
      },
    })

    return successResponse("Bus schedule created successfully", schedule, 201)
  } catch (error) {
    console.error("Create bus schedule error:", error)
    return errorResponse("Failed to create schedule", 500)
  }
}

export const bulkCreateBusSchedulesService = async (busId, startTimes) => {
  try {
    if (!Array.isArray(startTimes) || !startTimes.length)
      return errorResponse("startTimes must be a non-empty array", 400)

    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        route: {
          select: { estimatedTimeMin: true },
        },
      },
    })

    if (!bus || !bus.route) return errorResponse("Bus or route not found", 404)

    const duration = bus.route.estimatedTimeMin || 0

    // Validate time format
    for (const t of startTimes) {
      if (!isValidTime(t))
        return errorResponse(`Invalid time format: ${t}`, 400)
    }

    // Remove duplicates + sort
    const uniqueTimes = [...new Set(startTimes)].sort(
      (a, b) => timeToMinutes(a) - timeToMinutes(b),
    )

    // Get existing schedules sorted by time
    const existing = await prisma.busSchedule.findMany({
      where: { busId },
      orderBy: { startTime: "asc" },
    })

    const existingRanges = existing.map((s) => ({
      start: timeToMinutes(s.startTime),
      end: timeToMinutes(s.endTime),
    }))

    const newSchedules = []

    for (const time of uniqueTimes) {
      const start = timeToMinutes(time)
      const end = start + duration

      const conflicts = [...existingRanges, ...newSchedules].some((s) => {
        const gapBefore = start - s.end
        const gapAfter = s.start - end

        return (
          start === s.start ||
          (gapBefore >= 0 && gapBefore < MIN_INTERVAL) ||
          (gapAfter >= 0 && gapAfter < MIN_INTERVAL)
        )
      })

      if (conflicts) {
        return errorResponse(
          `Schedule ${time} violates ${MIN_INTERVAL} minute interval rule`,
          400,
        )
      }

      newSchedules.push({ start, end })
    }

    // 🔥 Direction logic

    let nextDirection = "FORWARD"

    if (existing.length > 0) {
      const lastExisting = existing[existing.length - 1]

      nextDirection =
        lastExisting.direction === "FORWARD" ? "REVERSE" : "FORWARD"
    }

    const schedulesWithDirection = newSchedules.map((s) => {
      const schedule = {
        busId,
        startTime: minutesToTime(s.start),
        endTime: minutesToTime(s.end),
        direction: nextDirection,
      }

      // Alternate for next one
      nextDirection = nextDirection === "FORWARD" ? "REVERSE" : "FORWARD"

      return schedule
    })

    const created = await prisma.$transaction(
      schedulesWithDirection.map((data) => prisma.busSchedule.create({ data })),
    )

    return successResponse("Bus schedules created successfully", created, 201)
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

/*---------- SEARCH BUS---------- */
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
      where: {
        AND: [
          { midPoints: { some: { name: origin } } },
          { midPoints: { some: { name: destination } } },
        ],
      },
      include: { midPoints: true },
    })

    if (routes.length === 0) return errorResponse("No routes found", 404)

    const routeIds = routes.map((r) => r.id)

    const buses = await prisma.bus.findMany({
      where: {
        routeId: { in: routeIds },
        isActive: true,
        driver: {
          is: {
            idStatus: { not: "REJECTED" },
            licenseStatus: { not: "REJECTED" },
          },
        },
      },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        route: { include: { midPoints: true } },
        schedules: true,
      },
    })

    if (buses.length === 0)
      return errorResponse("No buses assigned to these routes", 404)

    const userSelectedDate = new Date(date)

    const bookingDateStart = new Date(
      Date.UTC(
        userSelectedDate.getUTCFullYear(),
        userSelectedDate.getUTCMonth(),
        userSelectedDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    )

    const bookingDateEnd = new Date(
      Date.UTC(
        userSelectedDate.getUTCFullYear(),
        userSelectedDate.getUTCMonth(),
        userSelectedDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    )

    const [reqH, reqM] = time.split(":").map(Number)
    const requestedTotalMinutes = reqH * 60 + reqM

    let oppositeDirectionFound = false

    const result = await Promise.all(
      buses.map(async (bus) => {
        const midPoints = bus.route.midPoints

        const originPoint = midPoints.find((mp) => mp.name === origin)
        const destinationPoint = midPoints.find((mp) => mp.name === destination)

        if (!originPoint || !destinationPoint) return null
        if (originPoint.order === destinationPoint.order) return null

        const requiredDirection =
          originPoint.order < destinationPoint.order ? "FORWARD" : "REVERSE"

        const directionSchedules = bus.schedules.filter(
          (s) => s.isActive && s.direction === requiredDirection,
        )

        if (directionSchedules.length === 0) {
          oppositeDirectionFound = true
          return null
        }

        const upcomingSchedules = await Promise.all(
          directionSchedules.map(async (s) => {
            const [h, m] = s.startTime.split(":").map(Number)
            const startTotalMin = h * 60 + m

            const timeDifference = startTotalMin - requestedTotalMinutes

            // Only future schedules within 2 hours
            if (timeDifference <= 0 || timeDifference > 120) return null

            const bookedSeatsAgg = await prisma.booking.aggregate({
              _sum: { seatsBooked: true },
              where: {
                scheduleId: s.id,
                date: {
                  gte: bookingDateStart,
                  lt: bookingDateEnd,
                },
              },
            })

            const bookings = await prisma.booking.findMany({
              where: {
                scheduleId: s.id,
                date: {
                  gte: bookingDateStart,
                  lt: bookingDateEnd,
                },
              },
            })

            const reservedSeats = bookedSeatsAgg._sum.seatsBooked || 0
            const availableSeats = bus.capacity - reservedSeats
            if (availableSeats < passengers) return null

            const startDate = new Date(bookingDateStart)
            startDate.setUTCHours(h, m, 0, 0)

            const arrivalDate = new Date(startDate)
            arrivalDate.setMinutes(
              arrivalDate.getMinutes() + (bus.route.estimatedTimeMin || 0),
            )

            return {
              schedule: s,
              availableSeats,
              estimatedArrival: arrivalDate,
              startDate,
            }
          }),
        )

        const filteredSchedules = upcomingSchedules.filter(Boolean)
        if (filteredSchedules.length === 0) return null

        const nearest = filteredSchedules.sort(
          (a, b) => a.startDate - b.startDate,
        )[0]

        return {
          bus: {
            id: bus.id,
            busNumber: bus.busNumber,
            capacity: bus.capacity,
            currentStop: bus.currentStop,
            nextDestination: bus.nextDestination,
            status: bus.status,
            departureTime: bus.departureTime,
            driver: bus.driver,
            driverName: bus.driver.user?.name || "",
            vehicle: bus.vehicle,
            route: {
              id: bus.route.id,
              name: bus.route.name,
              price: bus.route.price,
              currency: bus.route.currency,
              estimatedTimeMin: bus.route.estimatedTimeMin,
              midPoints: midPoints.map((mp) => mp.name),
              origin: bus.route.origin,
              destination: bus.route.destination,
              distanceKm: bus.route.distanceKm,
            },
            travelDirection: requiredDirection,
          },
          nearestSchedule: {
            scheduleId: nearest.schedule.id,
            startTime: nearest.schedule.startTime,
            endTime: nearest.schedule.endTime,
            direction: nearest.schedule.direction,
            availableSeats: nearest.availableSeats,
            estimatedArrival: nearest.estimatedArrival,
            direction: nearest.direction,
          },
        }
      }),
    )

    const filteredResult = result.filter(Boolean)

    if (filteredResult.length === 0) {
      return successResponse("No buses within 2 hours", [], 200)
    }

    return successResponse(
      "Buses with nearest upcoming schedule retrieved",
      filteredResult,
      200,
    )
  } catch (error) {
    console.error("Search buses error:", error)
    return errorResponse("Failed to search buses", 500)
  }
}

export const getRouteMidPointsService = async (routeId) => {
  try {
    const midPoints = await prisma.routeMidPoint.findMany({
      where: { routeId: parseInt(routeId) },
      orderBy: { order: "asc" },
    })

    return successResponse("Route midpoints fetched successfully", midPoints)
  } catch (error) {
    return errorResponse("Failed to fetch route midpoints", 500, error.message)
  }
}

export const getAllMidPointsService = async () => {
  try {
    const midPoints = await prisma.routeMidPoint.findMany({
      select: {
        name: true,
      },
      orderBy: [{ routeId: "asc" }, { order: "asc" }],
    })

    if (!midPoints?.length) {
      return successResponse("No midpoints found", [])
    }

    const uniqueNames = [
      ...new Map(
        midPoints
          .map((m) => m.name?.trim())
          .filter(Boolean) // remove null/empty
          .map((name) => [name.toLowerCase(), name]), // case-insensitive unique
      ).values(),
    ].sort((a, b) => a.localeCompare(b))

    return successResponse("Midpoint names fetched successfully", uniqueNames)
  } catch (error) {
    return errorResponse("Failed to fetch midpoints", 500, error.message)
  }
}
