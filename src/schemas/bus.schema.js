import { z } from "zod"

import { z } from "zod"

// Create Bus
export const createBusSchema = z.object({
  // Required fields
  busNumber: z.string().min(1, "Bus number is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  
  // Optional relations
  routeId: z.number().int().optional(),
  driverId: z.string().optional(),
  vehicleId: z.number().int().optional(),
  
  // Optional location and status
  currentStop: z.string().optional(),
  nextDestination: z.string().optional(),
  status: z.enum(["ACTIVE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"]).default("ACTIVE"),
  isActive: z.boolean().default(true),
  
  // Optional timing
  departureTime: z.string().datetime().optional(),
  estimatedArrival: z.string().datetime().optional(),
  delayMinutes: z.number().int().min(0).default(0),
  
  // Optional capacity management
  availableSeats: z.number().int().min(0).optional(),
  
  // Optional maintenance dates
  lastServiceDate: z.string().datetime().optional(),
  nextServiceDate: z.string().datetime().optional(),
})

// Update Bus
export const updateBusSchema = z.object({
  busNumber: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  routeId: z.number().int().optional(),
  driverId: z.string().optional(),
  vehicleId: z.number().int().optional(),
  currentStop: z.string().optional(),
  nextDestination: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["ACTIVE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"]).optional(),
  departureTime: z.string().datetime().optional(),
  estimatedArrival: z.string().datetime().optional(),
  delayMinutes: z.number().int().min(0).optional(),
  availableSeats: z.number().int().min(0).optional(),
  lastServiceDate: z.string().datetime().optional(),
  nextServiceDate: z.string().datetime().optional(),
})

// Assign Driver
export const assignDriverSchema = z.object({
  driverId: z.number().nullable().optional(),
})

// Update Bus Status
export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"]),
})

// Record Bus Position
export const recordPositionSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string().optional(),
})
