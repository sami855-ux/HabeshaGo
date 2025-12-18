import { z } from "zod";

export const createReservationSchema = z.object({
  userId: z.string(),
  minibusId: z.number().int(),
  seat: z.number().int().min(1),
  date: z.string().datetime(),
  payNow: z.boolean().optional(), // wallet payment
});

export const confirmPaymentSchema = z.object({
  reservationId: z.number().int(),
  paymentMethod: z.enum(["WALLET", "CHAPA", "TELEBIRR"]),
});
