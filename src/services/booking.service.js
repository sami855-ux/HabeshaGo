import prisma from "../prisma/client.js"; // prisma client
import { walletService } from "./wallet.service.js"; // assume wallet service exists
import { paymentService } from "./payment.service.js";

export const bookingService = {
  async createBooking(dto) {
    const farePerSeat = 50; // you can replace with dynamic logic
    const total = farePerSeat * dto.seatNumber;

    if (dto.payNow) {
      return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: { ...dto, date: new Date(), status: "PENDING" },
        });

        const wallet = await walletService.getOrCreateWallet(dto.userId);

        if (wallet.balance < total)
          throw new Error("Insufficient wallet balance");

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: total } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: -total,
            type: "WITHDRAW",
            reference: `booking-${booking.id}`,
            meta: { bookingId: booking.id },
          },
        });

        const payment = await tx.payment.create({
          data: {
            userId: dto.userId,
            walletId: wallet.id,
            bookingId: booking.id,
            amount: total,
            method: "WALLET",
            status: "SUCCESS",
          },
        });

        const finalized = await tx.booking.update({
          where: { id: booking.id },
          data: { paymentId: payment.id, status: "CONFIRMED" },
        });

        return finalized;
      });
    } else {
      return prisma.booking.create({
        data: { ...dto, date: new Date(), status: "PENDING" },
      });
    }
  },

  async getUserBookings(userId) {
    return prisma.booking.findMany({
      where: { userId },
      include: { payment: true, bus: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
