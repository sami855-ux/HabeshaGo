import { z } from "zod";

export const createMinibusSchema = z.object({
  plateNumber: z.string().min(1),
  capacity: z.number().int().min(1),
  driverId: z.number().optional(),
  routeId: z.number().optional(),
});

export const updateMinibusSchema = z.object({
  plateNumber: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  driverId: z.number().optional(),
  routeId: z.number().optional(),
});
