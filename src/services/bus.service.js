import prisma from "../prisma/client.js";
import { NotFound, Conflict } from "../utils/error.js";
import { BusStatus, BookingStatus } from "@prisma/client";

// Create bus
export const createBusService = async (data) => {
  try {
    if (data.driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: data.driverId },
      });
      if (!driver)
        return {
          success: false,
          statusCode: 404,
          message: "Driver not found",
          data: null,
        };

      const assignedBus = await prisma.bus.findFirst({
        where: { driverId: data.driverId },
      });
      if (assignedBus)
        return {
          success: false,
          statusCode: 409,
          message: "Driver is already assigned to another bus",
          data: null,
        };
    }

    if (data.routeId) {
      const route = await prisma.route.findUnique({
        where: { id: Number(data.routeId) },
      });
      if (!route)
        return {
          success: false,
          statusCode: 404,
          message: "Route not found",
          data: null,
        };
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
    });

    return {
      success: true,
      statusCode: 201,
      message: "Bus created successfully",
      data: bus,
    };
  } catch (error) {
    console.error("Error creating bus:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create bus",
      data: null,
    };
  }
};

// ===================== FIXED SEARCH =====================
export const searchBusesService = async (start, end) => {
  try {
    // Build dynamic filters only if start or end exists
    const routeFilters = { AND: [] };

    if (start) {
      routeFilters.AND.push({
        OR: [
          { origin: { contains: start, mode: "insensitive" } },
          {
            midPoints: {
              some: { name: { contains: start, mode: "insensitive" } },
            },
          },
        ],
      });
    }

    if (end) {
      routeFilters.AND.push({
        OR: [
          { destination: { contains: end, mode: "insensitive" } },
          {
            midPoints: {
              some: { name: { contains: end, mode: "insensitive" } },
            },
          },
        ],
      });
    }

    const whereClause =
      routeFilters.AND.length > 0 ? { route: routeFilters } : {};

    const buses = await prisma.bus.findMany({
      where: whereClause,
      include: {
        route: { include: { midPoints: true } },
        driver: true,
      },
    });

    return {
      success: true,
      statusCode: 200,
      message: "Buses retrieved successfully",
      data: buses,
    };
  } catch (error) {
    console.error("Error searching buses:", error);
    return {
      success: true,
      statusCode: 200,
      message: "Buses retrieved successfully",
      data: [],
    };
  }
};

// ===================== OTHER SERVICES =====================
export const findAllBusesService = async (query) => {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where = {};
  if (query.routeId) where.routeId = query.routeId;
  if (query.status) where.status = query.status;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  const [data, total] = await prisma.$transaction([
    prisma.bus.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: { driver: true, route: true },
    }),
    prisma.bus.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

export const findBusService = async (id) => {
  const bus = await prisma.bus.findUnique({
    where: { id },
    include: { driver: true, route: true },
  });
  if (!bus) throw new NotFound("Bus not found");
  return bus;
};

export const updateBusService = async (id, data) => {
  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) throw new NotFound("Bus not found");

  if (data.driverId !== undefined && data.driverId !== null) {
    const driver = await prisma.driver.findUnique({
      where: { id: data.driverId },
    });
    if (!driver) throw new NotFound("Driver not found");

    const otherBus = await prisma.bus.findFirst({
      where: { driverId: data.driverId },
    });
    if (otherBus && otherBus.id !== id)
      throw new Conflict("Driver already assigned to another bus");
  }

  if (data.routeId !== undefined && data.routeId !== null) {
    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
    });
    if (!route) throw new NotFound("Route not found");
  }

  return prisma.bus.update({
    where: { id },
    data: {
      ...data,
      driverId: data.driverId ?? undefined,
      routeId: data.routeId ?? undefined,
    },
  });
};

export const assignDriverService = async (id, { driverId }) => {
  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) throw new NotFound("Bus not found");
  if (!driverId)
    return prisma.bus.update({ where: { id }, data: { driverId: null } });

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw new NotFound("Driver not found");

  const otherBus = await prisma.bus.findFirst({ where: { driverId } });
  if (otherBus && otherBus.id !== id)
    throw new Conflict("Driver already assigned to another bus");

  return prisma.bus.update({ where: { id }, data: { driverId } });
};

export const updateStatusService = async (id, { status }) => {
  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) throw new NotFound("Bus not found");
  return prisma.bus.update({ where: { id }, data: { status } });
};

export const removeBusService = async (id) => {
  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) throw new NotFound("Bus not found");
  return prisma.bus.update({ where: { id }, data: { isActive: false } });
};

export const getSeatAvailabilityService = async (busId, dateIso) => {
  const bus = await prisma.bus.findUnique({ where: { id: busId } });
  if (!bus) throw new NotFound("Bus not found");

  const date = new Date(dateIso);
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      busId,
      date: { gte: start, lt: end },
      status: { not: BookingStatus.CANCELLED },
    },
    select: { seatNumber: true },
  });

  const occupiedSeats = bookings.map((b) => b.seatNumber);
  const freeSeats = Array.from(
    { length: bus.capacity },
    (_, i) => i + 1
  ).filter((i) => !occupiedSeats.includes(i));

  return {
    busId,
    date: date.toISOString(),
    capacity: bus.capacity,
    occupiedSeats,
    freeSeats,
  };
};

export const recordPositionService = async (
  busId,
  { latitude, longitude, timestamp }
) => {
  const bus = await prisma.bus.findUnique({ where: { id: busId } });
  if (!bus) throw new NotFound("Bus not found");

  return prisma.busPosition.create({
    data: {
      busId,
      latitude,
      longitude,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    },
  });
};
