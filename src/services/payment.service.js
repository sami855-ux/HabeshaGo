import prisma from "../prisma/client.js";
import { walletService } from "./wallet.service.js";

export const paymentService = {
  async pay(dto) {
    if (dto.method === "WALLET") {
      const wallet = await walletService.getOrCreateWallet(dto.userId);
      return await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: dto.amount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: -dto.amount,
            type: "WITHDRAW",
            reference: dto.referenceId ?? null,
            meta: {},
          },
        });

        const payment = await tx.payment.create({
          data: {
            userId: dto.userId,
            walletId: wallet.id,
            bookingId: dto.bookingId ?? null,
            amount: dto.amount,
            method: "WALLET",
            status: "SUCCESS",
          },
        });

        if (dto.bookingId) {
          await tx.booking.update({
            where: { id: dto.bookingId },
            data: { paymentId: payment.id, status: "CONFIRMED" },
          });
        }

        return payment;
      });
    }

    // External payments: create PENDING
    const payment = await prisma.payment.create({
      data: {
        ...dto,
        status: "PENDING",
        gatewayRef: dto.referenceId ?? null,
      },
    });

    return {
      payment,
      gateway: { nextAction: "OPEN_GATEWAY", gatewayRef: payment.gatewayRef },
    };
  },

  async verifyExternalPayment(gatewayRef, payload) {
    const providerResult = {
      status: "success",
      amount: 100,
      userId: "someUserId",
    }; // placeholder
    if (providerResult.status !== "success") {
      const failed = await prisma.payment.updateMany({
        where: { gatewayRef },
        data: { status: "FAILED" },
      });
      return { status: "failed", updated: failed.count };
    }

    const payment = await prisma.payment.findFirst({ where: { gatewayRef } });
    if (!payment) throw new Error("Payment record not found");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", metadata: payload },
      });

      if (payment.walletId) {
        await tx.wallet.update({
          where: { id: payment.walletId },
          data: { balance: { increment: payment.amount } },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: payment.walletId,
            amount: payment.amount,
            type: "DEPOSIT",
            reference: gatewayRef,
            meta: payload,
          },
        });
      }

      if (payment.bookingId) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED", paymentId: payment.id },
        });
      }

      return updated;
    });
  },

  async refundPayment(paymentId, refundToWallet = true) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "SUCCESS")
      throw new Error("Only successful payments can be refunded");

    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "REFUNDED" },
      });

      if (refundToWallet && payment.walletId) {
        await tx.wallet.update({
          where: { id: payment.walletId },
          data: { balance: { increment: payment.amount } },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: payment.walletId,
            amount: payment.amount,
            type: "REFUND",
            reference: `refund-${paymentId}`,
            meta: {},
          },
        });
      }

      if (payment.bookingId) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
      }

      return { refunded: true };
    });
  },
};
