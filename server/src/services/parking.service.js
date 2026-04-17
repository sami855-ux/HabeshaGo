import prisma from "../prisma/client.js";

// ===== LOT =====

export const createParkingLot = (data) => {
  return prisma.parkingLot.create({ data });
};

export const getAllParkingLots = () => {
  return prisma.parkingLot.findMany();
};

export const getNearbyLots = async (lat, lng, radius) => {
  const lots = await prisma.parkingLot.findMany();

  return lots.filter((lot) => {
    const distance =
      Math.sqrt(
        Math.pow(lat - lot.latitude, 2) + Math.pow(lng - lot.longitude, 2),
      ) * 111;

    return distance <= radius;
  });
};

export const getLotById = (id) =>
  prisma.parkingLot.findUnique({
    where: { id },
    include: { slots: true },
  });

export const updateLot = (id, data) =>
  prisma.parkingLot.update({ where: { id }, data });

export const deleteLot = (id) => prisma.parkingLot.delete({ where: { id } });

// ===== SLOT =====

export const createSlots = (lotId, slots) => {
  return prisma.parkingSlot.createMany({
    data: slots.map((s) => ({
      ...s,
      parkingLotId: lotId,
    })),
  });
};

export const getSlots = (lotId) =>
  prisma.parkingSlot.findMany({ where: { parkingLotId: lotId } });

export const getAvailableSlots = (lotId) =>
  prisma.parkingSlot.findMany({
    where: {
      parkingLotId: lotId,
      status: "AVAILABLE",
    },
  });

export const updateSlotStatus = (slotId, status) =>
  prisma.parkingSlot.update({
    where: { id: slotId },
    data: { status },
  });

export const deleteSlot = (slotId) =>
  prisma.parkingSlot.delete({ where: { id: slotId } });

// ===== RESERVATION =====

export const createReservation = (userId, data) => {
  return prisma.parkingReservation.create({
    data: {
      ...data,
      userId,
      status: "CONFIRMED",
    },
  });
};

export const getUserReservations = (userId) =>
  prisma.parkingReservation.findMany({ where: { userId } });

export const getReservation = (id) =>
  prisma.parkingReservation.findUnique({ where: { id } });

export const cancelReservation = (id) =>
  prisma.parkingReservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

export const markNoShow = (id) =>
  prisma.parkingReservation.update({
    where: { id },
    data: { status: "NO_SHOW" },
  });

// ===== CHECK-IN / OUT =====

export const checkIn = async (reservationId) => {
  const reservation = await prisma.parkingReservation.update({
    where: { id: reservationId },
    data: { checkInTime: new Date() },
  });

  return prisma.parkingSession.create({
    data: {
      slotId: reservation.slotId,
      parkingReservationId: reservationId,
    },
  });
};

export const checkOut = async (reservationId) => {
  const session = await prisma.parkingSession.findFirst({
    where: {
      parkingReservationId: reservationId,
      status: "ACTIVE",
    },
  });

  if (!session) throw new Error("No active session");

  const exitTime = new Date();
  const duration = (exitTime.getTime() - session.entryTime.getTime()) / 60000;

  await prisma.parkingSession.update({
    where: { id: session.id },
    data: {
      exitTime,
      duration,
      status: "COMPLETED",
    },
  });

  return { duration };
};

// ===== SESSION =====

export const createSession = (data) => prisma.parkingSession.create({ data });

export const getActiveSessions = () =>
  prisma.parkingSession.findMany({
    where: { status: "ACTIVE" },
  });

export const getUserSessions = () => prisma.parkingSession.findMany();

export const getSession = (id) =>
  prisma.parkingSession.findUnique({ where: { id } });

export const endSession = (id) =>
  prisma.parkingSession.update({
    where: { id },
    data: {
      exitTime: new Date(),
      status: "COMPLETED",
    },
  });

export const calculateCost = async (sessionId) => {
  const session = await prisma.parkingSession.findUnique({
    where: { id: sessionId },
    include: {
      slot: { include: { parkingLot: true } },
    },
  });

  if (!session) throw new Error("Session not found");

  const duration = (new Date().getTime() - session.entryTime.getTime()) / 60000;

  const cost = duration * session.slot.parkingLot.pricePerMinute;

  return { duration, cost };
};
export const getLotStats = async (lotId) => {
  const reservations = await prisma.parkingReservation.findMany({
    where: { parkingLotId: lotId },
  });

  const sessions = await prisma.parkingSession.findMany({
    where: {
      slot: {
        parkingLotId: lotId,
      },
    },
  });

  const totalReservations = reservations.length;
  const activeSessions = sessions.filter((s) => s.status === "ACTIVE").length;
  const completedSessions = sessions.filter(
    (s) => s.status === "COMPLETED",
  ).length;

  const revenue = sessions.reduce((sum, s) => {
    return sum + (s.totalCost || 0);
  }, 0);

  return {
    totalReservations,
    activeSessions,
    completedSessions,
    revenue,
  };
};
export const getDailyReport = async (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const reservations = await prisma.parkingReservation.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const sessions = await prisma.parkingSession.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const revenue = sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);

  return {
    date,
    totalReservations: reservations.length,
    totalSessions: sessions.length,
    revenue,
  };
};
export const getPeakHoursReport = async () => {
  const sessions = await prisma.parkingSession.findMany();

  const hourly = Array(24).fill(0);

  sessions.forEach((session) => {
    const hour = new Date(session.entryTime).getHours();
    hourly[hour]++;
  });

  const peakHour = hourly.indexOf(Math.max(...hourly));

  return {
    hourlyTraffic: hourly,
    peakHour,
  };
};