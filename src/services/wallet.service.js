import prisma from "../prisma/client.js"; // your Prisma client

export const walletService = {
  async getOrCreateWallet(userId) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
    }
    return wallet;
  },

  async depositViaExternal(userId, amount, reference) {
    const wallet = await walletService.getOrCreateWallet(userId);
    const payment = await prisma.payment.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        method: "CHAPA",
        status: "PENDING",
        gatewayRef: reference,
      },
    });

    return { message: "External deposit initiated", paymentId: payment.id };
  },

  async deduct(userId, amount, reference, meta) {
    const wallet = await walletService.getOrCreateWallet(userId);
    if (wallet.balance < amount) throw new Error("Insufficient wallet balance");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -amount,
          type: "WITHDRAW",
          reference,
          meta,
        },
      });

      return updated;
    });
  },

  async depositInternal(walletId, amount, reference, meta) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: amount } },
      });

      await tx.walletTransaction.create({
        data: { walletId, amount, type: "DEPOSIT", reference, meta },
      });

      return updated;
    });
  },

  async getTransactions(userId) {
    const wallet = await walletService.getOrCreateWallet(userId);
    return prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    });
  },
};
