import { z } from "zod";

export const createPaymentSchema = z.object({
  userId: z.string(),
  bookingId: z.number().optional(),
  walletId: z.number().optional(),
  amount: z.number(),
  method: z.enum(["WALLET", "CHAPA", "TELEBIRR", "CARD", "CASH"]),
  referenceId: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  gatewayRef: z.string(),
});

export const refundPaymentSchema = z.object({
  paymentId: z.number(),
  refundToWallet: z.boolean().optional(),
});
