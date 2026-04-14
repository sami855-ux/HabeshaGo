import { successResponse, errorResponse } from "../utils/apiResponse.js"
import prisma from "../prisma/client.js"

const MIN_INTERVAL = 35 // minutes

const formatTo12Hour = (date) => {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"

  hours = hours % 12
  hours = hours ? hours : 12

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`
}
// Format Date to Ethiopian time in "HH:MM AM/PM"
const formatToEthiopianTime = (utcDateString) => {
  const date = new Date(utcDateString)

  // Add 3 hours for Ethiopian Time
  date.setHours(date.getHours() + 3)

  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  hours = hours ? hours : 12 // convert 0 → 12

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`
}

export const createBusService = async (data) => {
  try {
    const {
      busNumber,
      capacity,
      routeId,
      driverId,
      currentStop,
      nextDestination,
      departureTime,
      estimatedArrival,
      delayMinutes = 0,
      vehicleId,
      lastServiceDate,
      nextServiceDate,
      status = "ACTIVE",
      isActive = true,
      schedules = [],
    } = data

    if (!busNumber || !capacity) {
      return errorResponse("Bus number and capacity are required", 400)
    }

    const result = await prisma.$transaction(async (tx) => {
      // ✅ Uniqueness
      const existingBus = await tx.bus.findUnique({ where: { busNumber } })
      if (existingBus) throw new Error("Bus number already exists")

      // ✅ Relations
      if (routeId) {
        const route = await tx.route.findUnique({
          where: { id: parseInt(routeId) },
        })
        if (!route) throw new Error("Route not found")
      }

      if (driverId) {
        const driver = await tx.driver.findUnique({ where: { id: driverId } })
        if (!driver) throw new Error("Driver not found")

        const assignedBus = await tx.bus.findUnique({ where: { driverId } })
        if (assignedBus)
          throw new Error("Driver is already assigned to another bus")
      }

      if (vehicleId) {
        const vehicle = await tx.vehicle.findUnique({
          where: { id: parseInt(vehicleId) },
        })
        if (!vehicle) throw new Error("Vehicle not found")

        const assignedBus = await tx.bus.findUnique({
          where: { vehicleId: parseInt(vehicleId) },
        })
        if (assignedBus)
          throw new Error("Vehicle is already assigned to another bus")
      }

      // Normalize to hour
      const toHourDate = (input) => {
        const d = new Date(input)
        d.setMinutes(0, 0, 0)
        return d
      }

      // Prepare bus data
      const busData = {
        busNumber,
        capacity: parseInt(capacity),
        status,
        isActive,
        delayMinutes: parseInt(delayMinutes),
      }

      if (routeId) busData.routeId = parseInt(routeId)
      if (driverId) busData.driverId = driverId
      if (currentStop) busData.currentStop = currentStop
      if (nextDestination) busData.nextDestination = nextDestination
      if (vehicleId) busData.vehicleId = parseInt(vehicleId)
      if (departureTime) busData.departureTime = toHourDate(departureTime)
      if (estimatedArrival) busData.estimatedArrival = estimatedArrival
      if (lastServiceDate) busData.lastServiceDate = new Date(lastServiceDate)
      if (nextServiceDate) busData.nextServiceDate = new Date(nextServiceDate)

      // ✅ Create bus
      const bus = await tx.bus.create({ data: busData })

      // ✅ Handle schedules
      if (schedules.length > 0) {
        if (!estimatedArrival) {
          throw new Error(
            "estimatedArrival is required when schedules are provided",
          )
        }

        // 🔥 Sort schedules first (VERY IMPORTANT)
        const normalizedTimes = schedules
          .map((s) => ({ ...s, start: toHourDate(s.startTime) }))
          .sort((a, b) => a.start.getTime() - b.start.getTime())

        const schedulesToCreate = []

        for (let i = 0; i < normalizedTimes.length; i++) {
          const s = normalizedTimes[i]
          const start = s.start
          const end = new Date(start.getTime() + estimatedArrival * 60000)

          // ✅ Validate optional endTime
          if (s.endTime) {
            const providedEnd = toHourDate(s.endTime)
            if (providedEnd.getTime() !== end.getTime()) {
              throw new Error(
                `Schedule ${i + 1}: endTime must equal startTime + estimatedArrival`,
              )
            }
          }

          // 🔥 Interval check (WORKS for before/after/middle)
          for (const existingSchedule of schedulesToCreate) {
            const sStart = new Date(existingSchedule.startTime).getTime()
            const sEnd = new Date(existingSchedule.endTime).getTime()

            const gapBefore = start.getTime() - sEnd
            const gapAfter = sStart - end.getTime()

            if (
              (gapBefore >= 0 && gapBefore < MIN_INTERVAL * 60000) ||
              (gapAfter >= 0 && gapAfter < MIN_INTERVAL * 60000)
            ) {
              throw new Error(
                `Schedule ${i + 1} (${formatTo12Hour(start)}) violates ${MIN_INTERVAL} minute interval rule`,
              )
            }
          }

          // ✅ Alternate direction
          let direction = "FORWARD"
          if (schedulesToCreate.length > 0) {
            const last =
              schedulesToCreate[schedulesToCreate.length - 1].direction
            direction = last === "FORWARD" ? "REVERSE" : "FORWARD"
          }

          schedulesToCreate.push({
            busId: bus.id,
            startTime: formatTo12Hour(start),
            endTime: formatTo12Hour(end),
            direction,
          })
        }

        await tx.busSchedule.createMany({ data: schedulesToCreate })
      }

      return bus
    })

    return successResponse("Bus created successfully", result, 201)
  } catch (error) {
    console.error("Create bus error:", error)

    if (error.code === "P2002")
      return errorResponse("Bus number must be unique", 400)

    if (error.code === "P2003")
      return errorResponse("Invalid reference to related record", 400)

    return errorResponse(error.message || "Failed to create bus", 500)
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
const toHourDate = (input) => {
  const d = new Date(input)
  d.setMinutes(0, 0, 0)
  return d
}

export const createBusScheduleService = async (busId, startTime) => {
  try {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      select: {
        id: true,
        estimatedArrival: true,
      },
    })

    if (!bus) return errorResponse("Bus not found", 404)

    if (!bus.estimatedArrival) {
      return errorResponse(
        "Bus must have estimatedArrival before adding schedules",
        400,
      )
    }

    const start = toHourDate(startTime)

    // Compute endTime exactly like original
    const end = new Date(start.getTime() + bus.estimatedArrival * 60000)

    // 🔹 Get existing schedules (ordered)
    const existing = await prisma.busSchedule.findMany({
      where: { busId },
      orderBy: { startTime: "asc" },
    })

    // Interval validation (MATCHES your original logic)
    if (existing.length > 0) {
      const last = existing[existing.length - 1]

      const lastEnd = new Date(last.endTime)
      const minStart = new Date(lastEnd.getTime() + MIN_INTERVAL * 60000)

      if (start.getTime() < minStart.getTime()) {
        return errorResponse(
          `Schedule must start at least ${MIN_INTERVAL} minutes after the previous one`,
          400,
        )
      }
    }

    //  Direction toggle (same as your logic)
    let direction = "FORWARD"

    if (existing.length > 0) {
      const last = existing[existing.length - 1]
      direction = last.direction === "FORWARD" ? "REVERSE" : "FORWARD"
    }

    //  Create schedule (formatted like original)
    const schedule = await prisma.busSchedule.create({
      data: {
        busId,
        startTime: formatTo12Hour(start),
        endTime: formatTo12Hour(end),
        direction,
      },
    })

    return successResponse("Bus schedule created successfully", schedule, 201)
  } catch (error) {
    console.error("Create bus schedule error:", error)
    return errorResponse(error.message || "Failed to create schedule", 500)
  }
}

export const bulkCreateBusSchedulesService = async (busId, startTimes) => {
  try {
    if (!Array.isArray(startTimes) || startTimes.length === 0)
      return errorResponse("startTimes must be a non-empty array", 400)

    const created = await prisma.$transaction(
      async (tx) => {
        // Step 1: Fetch bus
        const bus = await tx.bus.findUnique({
          where: { id: busId },
          select: { id: true, routeId: true },
        })
        if (!bus) throw new Error("Bus not found")

        // Step 2: Fetch route
        const route = await tx.route.findUnique({
          where: { id: bus.routeId },
          select: { estimatedTimeMin: true },
        })
        if (!route) throw new Error("Route not found")

        const duration = route.estimatedTimeMin || 0

        const normalizedTimes = startTimes.map((t) => new Date(t))

        // Step 3: Fetch existing schedules (only once)
        const existing = await tx.busSchedule.findMany({
          where: { busId },
          orderBy: { startTime: "asc" },
          select: {
            startTime: true,
            endTime: true,
            direction: true,
          },
        })

        const schedulesToCreate = []

        // Pre-sort existing once
        const allExistingSorted = [...existing].sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        )

        for (let i = 0; i < normalizedTimes.length; i++) {
          const start = normalizedTimes[i]
          const end = new Date(start.getTime() + duration * 60000)

          // Conflict check with existing schedules
          for (const s of allExistingSorted) {
            const existingStart = new Date(s.startTime)
            const existingEnd = new Date(s.endTime)

            const gapBefore = start.getTime() - existingEnd.getTime()
            const gapAfter = existingStart.getTime() - end.getTime()

            if (
              start.getTime() === existingStart.getTime() ||
              (gapBefore >= 0 && gapBefore < MIN_INTERVAL * 60000) ||
              (gapAfter >= 0 && gapAfter < MIN_INTERVAL * 60000)
            ) {
              throw new Error(
                `Schedule ${formatToEthiopianTime(start)} conflicts with existing schedule ${formatToEthiopianTime(existingStart)}`,
              )
            }
          }

          // Determine direction - Optimized
          let nextDirection = "FORWARD"

          if (allExistingSorted.length > 0 || schedulesToCreate.length > 0) {
            const allSchedulesSoFar = [
              ...allExistingSorted,
              ...schedulesToCreate,
            ]

            // Find the closest schedule
            let closest = allSchedulesSoFar[0]
            let minDiff = Math.abs(
              start.getTime() - new Date(closest.startTime).getTime(),
            )

            for (const s of allSchedulesSoFar) {
              const diff = Math.abs(
                start.getTime() - new Date(s.startTime).getTime(),
              )
              if (diff < minDiff) {
                minDiff = diff
                closest = s
              }
            }

            nextDirection =
              closest.direction === "FORWARD" ? "REVERSE" : "FORWARD"
          }

          schedulesToCreate.push({
            busId,
            startTime: formatToEthiopianTime(start),
            endTime: formatToEthiopianTime(end),
            direction: nextDirection,
          })
        }

        // Step 4: Create all schedules
        const createdSchedules = await Promise.all(
          schedulesToCreate.map((data) => tx.busSchedule.create({ data })),
        )

        return createdSchedules
      },
      {
        timeout: 10000, // Increased from default 5000ms to 10 seconds
        maxWait: 20000, // Maximum time to wait for a transaction slot
      },
    )

    return successResponse("Bus schedules created successfully", created, 201)
  } catch (error) {
    console.error("Bulk create bus schedules error:", error)

    if (error.code === "P2002") {
      return errorResponse(
        "Duplicate schedule detected (busId + startTime + direction must be unique)",
        400,
      )
    }

    return errorResponse(error.message || "Failed to create schedules", 500)
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

            const reservedSeats = await prisma.ticket.count({
              where: {
                booking: {
                  scheduleId: s.id,
                  date: {
                    gte: bookingDateStart,
                    lt: bookingDateEnd,
                  },
                },
                cancelledAt: null,
              },
            })

            const availableSeats = bus.capacity - reservedSeats

            console.log(availableSeats, reservedSeats)
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
