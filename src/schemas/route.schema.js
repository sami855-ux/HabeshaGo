import { z } from "zod";

export const createRouteSchema = z.object({
  name: z.string(),
  origin: z.string(),
  destination: z.string(),
  distanceKm: z.number().optional(),
  estimatedTimeMin: z.number().optional(),
  midPoints: z
    .array(
      z.object({
        name: z.string(),
        lat: z.number(),
        lng: z.number(),
      })
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateRouteSchema = createRouteSchema.partial();
