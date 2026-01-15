export const bookingService = {
  async createBooking(dto) {
    const farePerSeat = 50;
    const total = farePerSeat * dto.seatNumbers.length;

    return prisma.$transaction(async (tx) => {
      // 1️⃣ Create booking
      const booking = await tx.booking.create({
        data: {
          userId: dto.userId,
          busId: dto.busId,
          seatNumbers: dto.seatNumbers, // Prisma must support Json or Int[]
          date: new Date(),
          status: "PENDING",
        },
      });

      // 2️⃣ Pay now (wallet)
      if (dto.payNow) {
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

        return tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED",
            paymentId: payment.id,
          },
        });
      }

      return booking;
    });
  },
};
