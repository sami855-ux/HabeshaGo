import prisma from "../prisma/client.js"
import { NotFound, Conflict } from "../utils/error.js"
import { BusStatus, BookingStatus } from "@prisma/client"

// Create bus
export const createBusService = async (data) => {
  try {
    if (data.driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: data.driverId },
      })
      if (!driver)
        return {
          success: false,
          statusCode: 404,
          message: "Driver not found",
          data: null,
        }

      const assignedBus = await prisma.bus.findFirst({
        where: { driverId: data.driverId },
      })
      if (assignedBus)
        return {
          success: false,
          statusCode: 409,
          message: "Driver is already assigned to another bus",
          data: null,
        }
    }

    if (data.routeId) {
      const route = await prisma.route.findUnique({
        where: { id: Number(data.routeId) },
      })
      if (!route)
        return {
          success: false,
          statusCode: 404,
          message: "Route not found",
          data: null,
        }
    }

    const bus = await prisma.bus.create({
      data: {
        busNumber: data.busNumber,
        capacity: Number(data.capacity),
        status: "ACTIVE",
        isActive: true,
        driverId: data.driverId ?? null,
        routeId: data.routeId ? Number(data.routeId) : null,
      },
    })

    return {
      success: true,
      statusCode: 201,
      message: "Bus created successfully",
      data: bus,
    }
  } catch (error) {
    console.error("Error creating bus:", error)
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create bus",
      data: null,
    }
  }
}

// ===================== FIXED SEARCH =====================
export const searchBusesService = async (start, end) => {
  if (!start || !end) {
    return {
      success: false,
      statusCode: 400,
      message: "Please provide both start and end points",
      data: null,
    }
  }

  try {
    // Fetch buses whose route contains BOTH start and end
    const buses = await prisma.bus.findMany({
      where: {
        isActive: true,
        route: {
          AND: [
            {
              OR: [
                { origin: { contains: start, mode: "insensitive" } },
                { destination: { contains: start, mode: "insensitive" } },
                {
                  midPoints: {
                    some: { name: { contains: start, mode: "insensitive" } },
                  },
                },
              ],
            },
            {
              OR: [
                { origin: { contains: end, mode: "insensitive" } },
                { destination: { contains: end, mode: "insensitive" } },
                {
                  midPoints: {
                    some: { name: { contains: end, mode: "insensitive" } },
                  },
                },
              ],
            },
          ],
        },
      },
      include: {
        route: { include: { midPoints: true } },
        route: { include: { midPoints: true } },
        driver: true,
        vehicle: true,
        bookings: true,
        positions: true,
      },
      orderBy: { id: "desc" },
    })

    // Transform data for frontend
    const data = buses.map((bus) => ({
      id: bus.id,
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      status: bus.status,
      driverId: bus.driverId || undefined,
      driverName: bus.driver?.name || undefined,
      routeId: bus.routeId || undefined,
      routeName: bus.route?.name || undefined,
      origin: bus.route?.origin,
      destination: bus.route?.destination,
      midPoints: bus.route?.midPoints?.map((mp) => ({
        id: mp.id,
        name: mp.name,
        lat: mp.lat,
        lng: mp.lng,
      })),
      vehicleId: bus.vehicleId || undefined,
      vehicleType: bus.vehicle?.type || undefined,
      vehicleModel: bus.vehicle?.model || undefined,
      bookings: bus.bookings?.map((b) => ({
        id: b.id,
        userId: b.userId,
        seatNumber: b.seatNumber,
        date: b.date.toISOString(),
        status: b.status,
        boardingStop: b.boardingStop,
        alightingStop: b.alightingStop,
        bookingCode: b.bookingCode,
        cancelledAt: b.cancelledAt?.toISOString() || null,
        payNow: b.payNow,
        paymentId: b.paymentId || null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
      positions: bus.positions?.map((p) => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        timestamp: p.timestamp.toISOString(),
      })),
      currentStop: bus.currentStop || null,
      nextDestination: bus.nextDestination || null,
      isActive: bus.isActive,
      createdAt: bus.createdAt.toISOString(),
      updatedAt: bus.updatedAt.toISOString(),
    }))

    return {
      success: true,
      statusCode: 200,
      message: "Buses retrieved successfully",
      data,
    }
  } catch (error) {
    console.error("Error searching buses:", error)
    return {
      success: true,
      statusCode: 200,
      message: "Buses retrieved successfully",
      data: [],
    }
  }
}

// ===================== OTHER SERVICES =====================
export const findAllBusesService = async (query) => {
  const where = {}
  if (query.routeId) where.routeId = query.routeId
  if (query.status) where.status = query.status
  if (query.isActive !== undefined) where.isActive = query.isActive

  const buses = await prisma.bus.findMany({
    where,
    orderBy: { id: "desc" },
    include: { driver: true, route: true },
  })

  // Transform to match the desired structure
  const data = buses.map((bus) => ({
    id: bus.id,
    busNumber: bus.busNumber,
    capacity: bus.capacity,
    status: bus.status,
    driverId: bus.driverId ?? undefined,
    driverName: bus.driver?.user ? bus.driver.user.name : "No Name",
    routeId: bus.routeId ?? undefined,
    routeName: bus.route?.name ?? undefined,
    currentStop: bus.currentStop ?? null,
    nextDestination: bus.nextDestination ?? null,
    isActive: bus.isActive,
    isDeleted: false, // assuming soft delete flag is false by default
    createdAt: bus.createdAt.toISOString(),
    updatedAt: bus.updatedAt.toISOString(),
  }))

  return { data }
}

export const findBusService = async (id) => {
  const bus = await prisma.bus.findUnique({
    where: { id },
    include: { driver: true, route: true },
  })
  if (!bus) throw new NotFound("Bus not found")
  return bus
}

export const updateBusService = async (id, data) => {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) throw new NotFound("Bus not found")

  if (data.driverId !== undefined && data.driverId !== null) {
    const driver = await prisma.driver.findUnique({
      where: { id: data.driverId },
    })
    if (!driver) throw new NotFound("Driver not found")

    const otherBus = await prisma.bus.findFirst({
      where: { driverId: data.driverId },
    })
    if (otherBus && otherBus.id !== id)
      throw new Conflict("Driver already assigned to another bus")
  }

  if (data.routeId !== undefined && data.routeId !== null) {
    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
    })
    if (!route) throw new NotFound("Route not found")
  }

  return prisma.bus.update({
    where: { id },
    data: {
      ...data,
      driverId: data.driverId ?? undefined,
      routeId: data.routeId ?? undefined,
    },
  })
}

export const assignDriverService = async (id, { driverId }) => {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) throw new NotFound("Bus not found")
  if (!driverId)
    return prisma.bus.update({ where: { id }, data: { driverId: null } })

  const driver = await prisma.driver.findUnique({ where: { id: driverId } })
  if (!driver) throw new NotFound("Driver not found")

  const otherBus = await prisma.bus.findFirst({ where: { driverId } })
  if (otherBus && otherBus.id !== id)
    throw new Conflict("Driver already assigned to another bus")

  return prisma.bus.update({ where: { id }, data: { driverId } })
}

export const updateStatusService = async (id, { status }) => {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) throw new NotFound("Bus not found")
  return prisma.bus.update({ where: { id }, data: { status } })
}

export const removeBusService = async (id) => {
  const bus = await prisma.bus.findUnique({ where: { id } })
  if (!bus) throw new NotFound("Bus not found")
  return prisma.bus.update({ where: { id }, data: { isActive: false } })
}

export const getSeatAvailabilityService = async (busId, dateIso) => {
  const bus = await prisma.bus.findUnique({ where: { id: busId } })
  if (!bus) throw new NotFound("Bus not found")

  const date = new Date(dateIso)
  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  const bookings = await prisma.booking.findMany({
    where: {
      busId,
      date: { gte: start, lt: end },
      status: { not: BookingStatus.CANCELLED },
    },
    select: { seatNumber: true },
  })

  const occupiedSeats = bookings.map((b) => b.seatNumber)
  const freeSeats = Array.from(
    { length: bus.capacity },
    (_, i) => i + 1
  ).filter((i) => !occupiedSeats.includes(i))

  return {
    busId,
    date: date.toISOString(),
    capacity: bus.capacity,
    occupiedSeats,
    freeSeats,
  }
}

export const recordPositionService = async (
  busId,
  { latitude, longitude, timestamp }
) => {
  const bus = await prisma.bus.findUnique({ where: { id: busId } })
  if (!bus) throw new NotFound("Bus not found")

  return prisma.busPosition.create({
    data: {
      busId,
      latitude,
      longitude,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    },
  })
}
