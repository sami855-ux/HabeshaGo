import prisma from "../prisma/client.js";

export const walletService = {
  async getOrCreateWallet(userId) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: "ETB",
        },
      });
    }

    return wallet;
  },

  // ✅ MVP: Deposit immediately
  async depositViaExternal(userId, amount, reference) {
    if (!amount || amount <= 0) {
      throw new Error("Deposit amount must be greater than zero");
    }

    const wallet = await this.getOrCreateWallet(userId);

    return prisma.$transaction(async (tx) => {
      // 1️⃣ Create payment record (optional for MVP)
      await tx.payment.create({
        data: {
          userId,
          walletId: wallet.id,
          amount,
          method: "MANUAL",
          status: "SUCCESS",
          gatewayRef: reference,
        },
      });

      // 2️⃣ Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
        },
      });

      // 3️⃣ Log transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: "DEPOSIT",
          reference,
          meta: { source: "MANUAL_TOPUP" },
        },
      });

      return updatedWallet;
    });
  },

  async getTransactions(userId) {
    const wallet = await this.getOrCreateWallet(userId);

    return prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    });
  },
};
