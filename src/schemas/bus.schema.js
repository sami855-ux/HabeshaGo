import { z } from "zod";
import { BusStatus } from "@prisma/client"; // optional: if you want type safety

// Create Bus
export const createBusSchema = z.object({
  busNumber: z.string(),
  capacity: z.number().int().min(1),
  routeId: z.number().int().optional(),
  driverId: z.number().int().nullable().optional(),
});

// Update Bus
export const updateBusSchema = createBusSchema.partial().extend({
  currentStop: z.string().optional(),
  nextDestination: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["ACTIVE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"]).optional(),
  driverId: z.number().nullable().optional(),
});

// Assign Driver
export const assignDriverSchema = z.object({
  driverId: z.number().nullable().optional(),
});

// Update Bus Status
export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"]),
});

// Record Bus Position
export const recordPositionSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string().optional(),
});
