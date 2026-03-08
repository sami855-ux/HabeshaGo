import prisma from "../prisma/client.js";

const SEAT_PRICE = 50; // MVP fixed pricing

export const createReservation = async (dto) => {
  const date = new Date(dto.date);

  // Ensure minibus exists
  const minibus = await prisma.minibus.findUnique({
    where: { id: dto.minibusId },
  });
  if (!minibus) throw new Error("Minibus not found");

  // Seat availability enforced by unique constraint
  const reservation = await prisma.minibusReservation.create({
    data: {
      userId: dto.userId,
      minibusId: dto.minibusId,
      seat: dto.seat,
      date,
      status: dto.payNow ? "PENDING" : "CONFIRMED",
    },
  });

  // Wallet payment (optional)
  if (dto.payNow) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: dto.userId },
    });

    if (!wallet || wallet.balance < SEAT_PRICE) {
      throw new Error("Insufficient wallet balance");
    }

    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: SEAT_PRICE } },
      });

      const payment = await tx.payment.create({
        data: {
          userId: dto.userId,
          walletId: wallet.id,
          amount: SEAT_PRICE,
          method: "WALLET",
          status: "SUCCESS",
        },
      });

      const updated = await tx.minibusReservation.update({
        where: { id: reservation.id },
        data: {
          paymentId: payment.id,
          status: "CONFIRMED",
        },
      });

      return updated;
    });
  }

  return reservation;
};

export const confirmPayment = async ({ reservationId, paymentMethod }) => {
  const reservation = await prisma.minibusReservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) throw new Error("Reservation not found");

  const payment = await prisma.payment.create({
    data: {
      userId: reservation.userId,
      amount: SEAT_PRICE,
      method: paymentMethod,
      status: "PENDING",
      referenceId: `minibus-${reservationId}`,
    },
  });

  return {
    message: "Proceed to external payment",
    payment,
  };
};

export const getUserReservations = async (userId) => {
  return prisma.minibusReservation.findMany({
    where: { userId },
    include: {
      minibus: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const cancelReservation = async (id) => {
  return prisma.minibusReservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};
