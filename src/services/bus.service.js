import prisma from "../prisma/client.js";
import { NotFound, Conflict } from "../utils/error.js"; // optional custom error utils
import { BusStatus, BookingStatus } from "@prisma/client";

export const createBusService = async (data) => {
  if (data.driverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: data.driverId },
    });
    if (!driver) throw new NotFound("Driver not found");

    const assignedBus = await prisma.bus.findFirst({
      where: { driverId: data.driverId },
    });
    if (assignedBus)
      throw new Conflict("Driver already assigned to another bus");
  }

  if (data.routeId) {
    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
    });
    if (!route) throw new NotFound("Route not found");
  }

  return prisma.bus.create({
    data: {
      busNumber: data.busNumber,
      capacity: data.capacity,
      status: BusStatus.ACTIVE,
      isActive: true,
      driverId: data.driverId ?? null,
      routeId: data.routeId ?? null,
    },
  });
};

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
