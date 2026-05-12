import prisma from "../prisma/client.js";
import {
  emitParkingSlotUpdate,
  emitParkingReservation,
  emitParkingSessionStart,
  emitParkingSessionEnd,
} from "../socket/index.js";

import { payParkingSessionFromWallet as walletPay } from "./wallet.service.js";

// ================= UTILS =================

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const dx = lat1 - lat2;
  const dy = lng1 - lng2;
  return Math.sqrt(dx * dx + dy * dy) * 111;
};

// ================= LOT =================

export const createParkingLot = (data) => {
  return prisma.parkingLot.create({ data });
};

export const getAllParkingLots = () => {
  return prisma.parkingLot.findMany();
};

export const getNearbyLots = async (lat, lng, radius = 5) => {
  const lots = await prisma.parkingLot.findMany();

  return lots.filter((lot) => {
    const distance = calculateDistanceKm(lat, lng, lot.latitude, lot.longitude);

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

// ================= SLOT =================

export const createSlots = async (lotId, slots) => {
  await prisma.parkingSlot.createMany({
    data: slots.map((s) => ({
      ...s,
      parkingLotId: lotId,
    })),
  });

  return prisma.parkingSlot.findMany({
    where: { parkingLotId: lotId },
  });
};

export const getAvailableSlots = (lotId) =>
  prisma.parkingSlot.findMany({
    where: {
      parkingLotId: lotId,
      status: "AVAILABLE",
    },
  });

export const getSlots = (lotId) =>
  prisma.parkingSlot.findMany({
    where: { parkingLotId: lotId },
  });

export const updateSlotStatus = async (slotId, status) => {
  const slot = await prisma.parkingSlot.update({
    where: { id: slotId },
    data: { status },
    include: { parkingLot: true },
  });

  emitParkingSlotUpdate(slot.parkingLotId, slot);

  return slot;
};

export const deleteSlot = async (slotId) => {
  const slot = await prisma.parkingSlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) throw new Error("Slot not found");

  return prisma.parkingSlot.delete({
    where: { id: slotId },
  });
};

// ================= RESERVATION =================

export const getAllReservations = () => {
  return prisma.parkingReservation.findMany({
    include: {
      parkingLot: true,
      slot: true,
      user: true,
    },
  });
};

export const createReservation = async (userId, data) => {
  const { lotId, slotId } = data;

  return await prisma.parkingReservation.create({
    data: {
      parkingLot: {
        connect: { id: lotId }, 
      },

      slot: {
        connect: { id: slotId }, 
      },

      user: {
        connect: { id: userId }, 
      },

      status: "CONFIRMED",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
};

export const getUserReservations = (userId) =>
  prisma.parkingReservation.findMany({
    where: { userId },
    include: { parkingLot: true, slot: true },
  });

export const getReservation = (id) =>
  prisma.parkingReservation.findUnique({
    where: { id },
    include: { parkingLot: true, slot: true },
  });

export const expireReservations = async () => {
  const now = new Date();

  return prisma.parkingReservation.updateMany({
    where: {
      status: "CONFIRMED",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
};

export const cancelReservation = (id) =>
  prisma.parkingReservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

export const markNoShow = (id) =>
  prisma.parkingReservation.update({
    where: { id },
    data: { status: "NO_SHOW", isNoShow: true },
  });

// ================= CHECK-IN =================

export const checkIn = async (reservationId) => {
  const reservation = await prisma.parkingReservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) throw new Error("Reservation not found");

  const session = await prisma.parkingSession.create({
    data: {
      userId: reservation.userId,
      slotId: reservation.slotId,
      parkingReservationId: reservationId,
      status: "ACTIVE",
      entryTime: new Date(),
    },
  });

  emitParkingSessionStart(session);

  return session;
};

// ================= CHECK-OUT =================

export const checkOut = async (reservationId) => {
  const session = await prisma.parkingSession.findFirst({
    where: {
      parkingReservationId: reservationId,
      status: "ACTIVE",
    },
    include: {
      slot: { include: { parkingLot: true } },
    },
  });

  if (!session) throw new Error("No active session");

  const exitTime = new Date();

  const durationMinutes =
    (exitTime.getTime() - session.entryTime.getTime()) / 60000;

  const updatedSession = await prisma.parkingSession.update({
    where: { id: session.id },
    data: {
      exitTime,
      durationMinutes: Math.max(1, Math.floor(durationMinutes)),
      status: "COMPLETED",
    },
  });

  emitParkingSessionEnd(updatedSession);

  return {
    session: updatedSession,
    duration: Math.floor(durationMinutes),
  };
};

// ================= SESSION =================

export const getUserSessions = (userId) =>
  prisma.parkingSession.findMany({
    where: { userId },
    include: {
      slot: { include: { parkingLot: true } },
      parkingReservation: true,
    },
    orderBy: { createdAt: "desc" },
  });

export const getAllSessions = () =>
  prisma.parkingSession.findMany({
    include: {
      slot: { include: { parkingLot: true } },
      parkingReservation: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

export const getActiveSessions = () =>
  prisma.parkingSession.findMany({
    where: { status: "ACTIVE" },
    include: {
      slot: { include: { parkingLot: true } },
      parkingReservation: true,
    },
  });

export const getSession = (id) =>
  prisma.parkingSession.findUnique({
    where: { id },
    include: {
      slot: { include: { parkingLot: true } },
      parkingReservation: true,
    },
  });

export const endSession = async (id) => {
  const session = await prisma.parkingSession.findUnique({
    where: { id },
  });

  if (!session) throw new Error("Session not found");

  const exitTime = new Date();

  const durationMinutes =
    (exitTime.getTime() - session.entryTime.getTime()) / 60000;

  return prisma.parkingSession.update({
    where: { id },
    data: {
      exitTime,
      durationMinutes,
      status: "COMPLETED",
    },
  });
};

// ================= BILLING =================

export const calculateCost = async (sessionId) => {
  const session = await prisma.parkingSession.findUnique({
    where: { id: sessionId },
    include: {
      slot: { include: { parkingLot: true } },
    },
  });

  if (!session) throw new Error("Session not found");

  const end = session.exitTime || new Date();

  const durationMinutes = (end.getTime() - session.entryTime.getTime()) / 60000;

  const cost = durationMinutes * session.slot.parkingLot.pricePerMinute;

  return {
    duration: Math.round(durationMinutes),
    cost: Number(cost.toFixed(2)),
  };
};

// ================= WALLET PAYMENT (NEW CORE INTEGRATION) =================

export const payParkingSessionFromWallet = async (userId, sessionId, auth) => {
  const { cost } = await calculateCost(sessionId);

  const { pin, biometricToken } = auth || {};

  return await walletPay(userId, sessionId, cost, {
    pin,
    biometricToken,
  });
};

// ================= ANALYTICS =================

export const getSessionStats = async () => {
  const total = await prisma.parkingSession.count();

  const active = await prisma.parkingSession.count({
    where: { status: "ACTIVE" },
  });

  const completed = await prisma.parkingSession.count({
    where: { status: "COMPLETED" },
  });

  return { total, active, completed };
};

// export const getLotStats = async (lotId) => {
//   const sessions = await prisma.parkingSession.findMany({
//     where: {
//       slot: {
//         parkingLotId: lotId,
//       },
//     },
//   });

//   return {
//     totalSessions: sessions.length,
//   };
// };

export const getDailyReport = async (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const sessions = await prisma.parkingSession.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      slot: { include: { parkingLot: true } },
      user: true,
    },
  });

  const totalSessions = sessions.length;

  const totalRevenue = sessions.reduce((sum, s) => {
    const cost =
      (s.durationMinutes || 0) * (s.slot?.parkingLot?.pricePerMinute || 0);
    return sum + cost;
  }, 0);

  const active = sessions.filter((s) => s.status === "ACTIVE").length;
  const completed = sessions.filter((s) => s.status === "COMPLETED").length;
  const paid = sessions.filter((s) => s.status === "PAID").length;

  return {
    date: start.toISOString().split("T")[0],
    totalSessions,
    active,
    completed,
    paid,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    sessions,
  };
};
export const getLotStats = async (lotId) => {
  const sessions = await prisma.parkingSession.findMany({
    where: {
      slot: {
        parkingLotId: lotId,
      },
    },
    include: {
      slot: {
        include: {
          parkingLot: true,
        },
      },
    },
  });

  const active = sessions.filter((s) => s.status === "ACTIVE").length;

  const completed = sessions.filter((s) => s.status === "COMPLETED").length;

  const revenue = sessions.reduce((sum, s) => {
    const cost =
      (s.durationMinutes || 0) * (s.slot?.parkingLot?.pricePerMinute || 0);

    return sum + cost;
  }, 0);

  /* ================= OCCUPANCY ================= */

  const hourlyTraffic = Array(24).fill(0);

  sessions.forEach((s) => {
    const hour = new Date(s.entryTime).getHours();

    hourlyTraffic[hour]++;
  });

  const occupancyData = hourlyTraffic.map((count, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    occupancy: count,
  }));

  /* ================= REVENUE ================= */

  const revenueData = Array(24)
    .fill(0)
    .map((_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      revenue: 0,
    }));

  sessions.forEach((s) => {
    const hour = new Date(s.entryTime).getHours();

    const cost =
      (s.durationMinutes || 0) * (s.slot?.parkingLot?.pricePerMinute || 0);

    revenueData[hour].revenue += cost;
  });

  return {
    totalSessions: sessions.length,
    activeSessions: active,
    completedSessions: completed,
    revenue: Number(revenue.toFixed(2)),

    occupancyData,
    revenueData,
  };
};
export const getPeakHoursReport = async () => {
  const sessions = await prisma.parkingSession.findMany();

  const hourlyTraffic = Array(24).fill(0);

  sessions.forEach((s) => {
    const hour = new Date(s.entryTime).getHours();
    hourlyTraffic[hour]++;
  });

  const peakHour = hourlyTraffic.indexOf(Math.max(...hourlyTraffic));

  return {
    hourlyTraffic,
    peakHour,
  };
};
