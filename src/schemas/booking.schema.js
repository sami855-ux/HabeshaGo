import { z } from "zod";

export const createBookingSchema = z.object({
  userId: z.string(),
  busId: z.number(),

  // CHANGE HERE 👇
  seatNumbers: z.array(z.number().min(1)),

  payNow: z.boolean().optional(),
});
