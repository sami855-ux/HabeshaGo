import { z } from "zod";

export const createBookingSchema = z.object({
  userId: z.string(),
  busId: z.number(),
  seatNumber: z.number().min(1),
  payNow: z.boolean().optional(),
});
