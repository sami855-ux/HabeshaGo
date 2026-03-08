import { z } from "zod"

export const createRouteSchema = z.object({
  name: z.string(),
  origin: z.string(),
  destination: z.string(),
  distanceKm: z.number(),
  estimatedTimeMin: z.number(),
  midPoints: z.array(
    z.object({
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
  ),
  isActive: z.boolean(),
})

export const updateRouteSchema = createRouteSchema.partial()
